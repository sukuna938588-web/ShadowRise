import type { CustomAudioFile } from '@/types/soundSystem';

const DB_NAME = 'shadowrise_audio_db_v1';
const STORE_BLOBS = 'audio_blobs';
const STORE_META = 'audio_meta';
const LOCAL_STORAGE_AUDIO_META_KEY = 'shadowrise_custom_audio_meta_list_v1';
const LOCAL_STORAGE_FALLBACK_AUDIO_KEY_PREFIX = 'shadowrise_audio_fallback_';

// In-memory cache for Object URLs to ensure zero-latency playback
const objectUrlCache = new Map<string, string>();

/**
 * Initializes and opens the IndexedDB instance with upgrade handling.
 */
function openAudioDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not available in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_BLOBS)) {
        db.createObjectStore(STORE_BLOBS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open audio database'));
    };
  });
}

/**
 * Saves a custom audio file (MP3, WAV, M4A) permanently to IndexedDB
 * with a fallback to localStorage if IndexedDB is inaccessible.
 */
export async function saveCustomAudioFile(
  file: File | Blob,
  metadata: {
    name: string;
    category?: 'sound' | 'voice';
    voiceLabel?: string;
  }
): Promise<CustomAudioFile> {
  const id = `audio_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const mimeType = file.type || 'audio/mpeg';

  const audioMeta: CustomAudioFile = {
    id,
    name: metadata.name.trim() || 'Custom Audio',
    size: file.size,
    type: mimeType,
    uploadedAt: new Date().toISOString(),
    category: metadata.category || 'sound',
    voiceLabel: metadata.voiceLabel,
  };

  try {
    const db = await openAudioDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_BLOBS, STORE_META], 'readwrite');
      const blobStore = tx.objectStore(STORE_BLOBS);
      const metaStore = tx.objectStore(STORE_META);

      blobStore.put({ id, blob: file });
      metaStore.put(audioMeta);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (idbErr) {
    console.warn('[ShadowRise Audio] IndexedDB failed, using localStorage fallback:', idbErr);
    // LocalStorage fallback (only for files < 1.5MB to prevent quota exhaustion)
    if (file.size <= 1.5 * 1024 * 1024) {
      const base64Data = await blobToBase64(file);
      try {
        localStorage.setItem(`${LOCAL_STORAGE_FALLBACK_AUDIO_KEY_PREFIX}${id}`, base64Data);
      } catch (lsErr) {
        console.warn('[ShadowRise Audio] LocalStorage quota exceeded:', lsErr);
      }
    }
  }

  // Also sync metadata list to localStorage for quick synchronous queries
  syncMetaToLocalStorage(audioMeta);

  // Pre-cache object URL if file is a Blob
  const objectUrl = URL.createObjectURL(file);
  objectUrlCache.set(id, objectUrl);

  return audioMeta;
}

/**
 * Retrieves the playable Audio URL for a stored custom audio file.
 * Returns null if not found or corrupted.
 */
export async function getCustomAudioPlayableUrl(id: string): Promise<string | null> {
  // Check memory cache first
  if (objectUrlCache.has(id)) {
    return objectUrlCache.get(id)!;
  }

  try {
    const db = await openAudioDatabase();
    const blobRecord = await new Promise<{ id: string; blob: Blob } | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_BLOBS, 'readonly');
      const store = tx.objectStore(STORE_BLOBS);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (blobRecord?.blob) {
      const url = URL.createObjectURL(blobRecord.blob);
      objectUrlCache.set(id, url);
      return url;
    }
  } catch (err) {
    console.warn(`[ShadowRise Audio] Error reading from IndexedDB for ${id}:`, err);
  }

  // Check localStorage fallback
  try {
    const fallbackBase64 = localStorage.getItem(`${LOCAL_STORAGE_FALLBACK_AUDIO_KEY_PREFIX}${id}`);
    if (fallbackBase64) {
      return fallbackBase64;
    }
  } catch {
    // Ignore
  }

  return null;
}

/**
 * Retrieves all stored custom audio files (metadata only).
 */
export async function listCustomAudioFiles(): Promise<CustomAudioFile[]> {
  try {
    const db = await openAudioDatabase();
    const records = await new Promise<CustomAudioFile[]>((resolve, reject) => {
      const tx = db.transaction(STORE_META, 'readonly');
      const store = tx.objectStore(STORE_META);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });

    if (records && records.length > 0) {
      return records;
    }
  } catch (err) {
    console.warn('[ShadowRise Audio] Error listing IndexedDB audio:', err);
  }

  // Fallback to localStorage meta list
  return getLocalStorageMetaList();
}

/**
 * Deletes a stored custom audio file by ID.
 */
export async function deleteCustomAudioFile(id: string): Promise<boolean> {
  // Revoke cached URL if present
  if (objectUrlCache.has(id)) {
    try {
      URL.revokeObjectURL(objectUrlCache.get(id)!);
    } catch {
      // Ignore
    }
    objectUrlCache.delete(id);
  }

  let deleted = false;

  try {
    const db = await openAudioDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_BLOBS, STORE_META], 'readwrite');
      tx.objectStore(STORE_BLOBS).delete(id);
      tx.objectStore(STORE_META).delete(id);
      tx.oncomplete = () => {
        deleted = true;
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[ShadowRise Audio] Error deleting from IndexedDB:', err);
  }

  try {
    localStorage.removeItem(`${LOCAL_STORAGE_FALLBACK_AUDIO_KEY_PREFIX}${id}`);
    const metaList = getLocalStorageMetaList().filter((item) => item.id !== id);
    localStorage.setItem(LOCAL_STORAGE_AUDIO_META_KEY, JSON.stringify(metaList));
    deleted = true;
  } catch {
    // Ignore
  }

  return deleted;
}

// Helpers
function getLocalStorageMetaList(): CustomAudioFile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_AUDIO_META_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore
  }
  return [];
}

function syncMetaToLocalStorage(meta: CustomAudioFile) {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalStorageMetaList();
    const filtered = current.filter((m) => m.id !== meta.id);
    filtered.unshift(meta);
    localStorage.setItem(LOCAL_STORAGE_AUDIO_META_KEY, JSON.stringify(filtered));
  } catch {
    // Ignore
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
