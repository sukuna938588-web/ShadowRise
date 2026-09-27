import type {
  SoundEventType,
  SoundSystemSettings,
  EventSoundConfig,
} from '@/types/soundSystem';
import {
  DEFAULT_SOUND_SETTINGS,
  SOUND_EVENT_METAS,
} from '@/types/soundSystem';
import { playAlarmSound } from '@/utils/audioEffects';
import { getCustomAudioPlayableUrl } from '@/utils/audioStorage';

export const SOUND_SETTINGS_STORAGE_KEY = 'shadowrise_sound_settings_v1';

// Global reference to active preview Audio element so it can be stopped
let activePreviewAudio: HTMLAudioElement | null = null;

/**
 * Loads sound system settings from localStorage with full null/type safety and defaults.
 */
export function loadSoundSettings(): SoundSystemSettings {
  if (typeof window === 'undefined') return DEFAULT_SOUND_SETTINGS;

  try {
    const raw = localStorage.getItem(SOUND_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SOUND_SETTINGS;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return DEFAULT_SOUND_SETTINGS;

    const masterVolume = typeof parsed.masterVolume === 'number'
      ? Math.max(0, Math.min(100, parsed.masterVolume))
      : DEFAULT_SOUND_SETTINGS.masterVolume;

    const alarmVolume = typeof parsed.alarmVolume === 'number'
      ? Math.max(0, Math.min(100, parsed.alarmVolume))
      : DEFAULT_SOUND_SETTINGS.alarmVolume;

    const reminderVolume = typeof parsed.reminderVolume === 'number'
      ? Math.max(0, Math.min(100, parsed.reminderVolume))
      : DEFAULT_SOUND_SETTINGS.reminderVolume;

    const events: SoundSystemSettings['events'] = { ...DEFAULT_SOUND_SETTINGS.events };

    if (parsed.events && typeof parsed.events === 'object') {
      const keys = Object.keys(SOUND_EVENT_METAS) as SoundEventType[];
      for (const key of keys) {
        if (parsed.events[key] && typeof parsed.events[key] === 'object') {
          const ev = parsed.events[key];
          events[key] = {
            sourceType: ev.sourceType || 'default',
            builtinSound: ev.builtinSound || SOUND_EVENT_METAS[key].defaultBuiltin,
            customAudioId: ev.customAudioId,
            customAudioName: ev.customAudioName,
            voiceClipId: ev.voiceClipId,
            voicePromptText: ev.voicePromptText,
            volumeMultiplier: typeof ev.volumeMultiplier === 'number'
              ? Math.max(0, Math.min(100, ev.volumeMultiplier))
              : 100,
          };
        }
      }
    }

    return {
      masterVolume,
      alarmVolume,
      reminderVolume,
      events,
    };
  } catch (err) {
    console.warn('[ShadowRise Audio] Failed to load sound settings, using defaults:', err);
    return DEFAULT_SOUND_SETTINGS;
  }
}

/**
 * Persists sound system settings to localStorage.
 */
export function saveSoundSettings(settings: SoundSystemSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SOUND_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('[ShadowRise Audio] Failed to save sound settings:', err);
  }
}

/**
 * Computes effective volume in range 0.0 - 1.0 based on Master Volume, Event Category Volume, and multiplier.
 */
export function calculateEffectiveVolume(
  settings: SoundSystemSettings,
  eventType: SoundEventType,
  volumeMultiplier = 100
): number {
  const master = Math.max(0, Math.min(100, settings.masterVolume)) / 100;
  const meta = SOUND_EVENT_METAS[eventType];
  const categoryVol = (meta.category === 'alarm' ? settings.alarmVolume : settings.reminderVolume) / 100;
  const multiplier = Math.max(0, Math.min(100, volumeMultiplier)) / 100;

  // Final volume clamped between 0 and 1
  return Math.max(0, Math.min(1, master * categoryVol * multiplier));
}

/**
 * Stops any actively playing preview audio or speech.
 */
export function stopAllPreviews(): void {
  if (activePreviewAudio) {
    try {
      activePreviewAudio.pause();
      activePreviewAudio.currentTime = 0;
      activePreviewAudio.src = '';
    } catch {
      // Ignore
    }
    activePreviewAudio = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
}

/**
 * Plays a custom or built-in voice prompt via Web Speech Synthesis.
 */
function speakVoicePrompt(text: string, volume: number): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = Math.max(0, Math.min(1, volume));
      utterance.pitch = 0.85; // Deep Monarch authority tone
      utterance.rate = 0.95; // Deliberate military command pace

      // Try selecting a resonant English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => (v.name.includes('Male') || v.name.includes('Natural') || v.name.includes('Daniel') || v.name.includes('Google UK English Male')) && v.lang.startsWith('en')
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        resolve();
      };
      utterance.onerror = () => {
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      resolve();
    }
  });
}

/**
 * Core event playback engine.
 * Plays the sound configured for the given event type.
 * Automatically falls back to the default ShadowRise sound if custom audio fails or is missing.
 */
export async function playSoundEvent(
  eventType: SoundEventType,
  customSettings?: SoundSystemSettings
): Promise<void> {
  const settings = customSettings || loadSoundSettings();
  const config = settings.events[eventType] || DEFAULT_SOUND_SETTINGS.events[eventType];
  const meta = SOUND_EVENT_METAS[eventType];
  const effectiveVolume = calculateEffectiveVolume(settings, eventType, config.volumeMultiplier);

  // If master or category volume is zero, don't play
  if (effectiveVolume <= 0.001) return;

  // 1. Built-in or Default Source
  if (config.sourceType === 'default' || config.sourceType === 'builtin') {
    const soundToPlay = config.sourceType === 'default'
      ? meta.defaultBuiltin
      : (config.builtinSound || meta.defaultBuiltin);
    playAlarmSound(soundToPlay, effectiveVolume * 0.3);
    return;
  }

  // 2. Custom Audio Source
  if (config.sourceType === 'custom' && config.customAudioId) {
    try {
      const audioUrl = await getCustomAudioPlayableUrl(config.customAudioId);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.volume = effectiveVolume;
        await audio.play();
        return;
      }
    } catch (err) {
      console.warn(`[ShadowRise Audio] Custom audio playback failed for ${eventType}, executing fallback:`, err);
    }

    // FALLBACK SYSTEM: Seamlessly play default sound if custom fails
    playAlarmSound(meta.defaultBuiltin, effectiveVolume * 0.3);
    return;
  }

  // 3. Custom Voice Source
  if (config.sourceType === 'voice') {
    // If assigned to a custom voice audio file
    const voiceAudioId = config.voiceClipId || config.customAudioId;
    if (voiceAudioId) {
      try {
        const voiceUrl = await getCustomAudioPlayableUrl(voiceAudioId);
        if (voiceUrl) {
          const audio = new Audio(voiceUrl);
          audio.volume = effectiveVolume;
          await audio.play();
          return;
        }
      } catch (err) {
        console.warn('[ShadowRise Audio] Voice clip failed, falling back to speech synthesis:', err);
      }
    }

    // Voice text prompt speech synthesis fallback
    const voiceText = config.voicePromptText || meta.defaultVoiceText;
    try {
      // Play a quick chime prelude followed by voice directive
      playAlarmSound(meta.defaultBuiltin, effectiveVolume * 0.15);
      setTimeout(() => {
        speakVoicePrompt(voiceText, effectiveVolume);
      }, 300);
      return;
    } catch {
      playAlarmSound(meta.defaultBuiltin, effectiveVolume * 0.3);
      return;
    }
  }

  // General safety fallback
  playAlarmSound(meta.defaultBuiltin, effectiveVolume * 0.3);
}

/**
 * Previews any audio configuration in the UI.
 * Returns a controller with a `stop()` function and playback promise.
 */
export function previewSound(
  config: EventSoundConfig,
  eventType: SoundEventType,
  settings: SoundSystemSettings,
  onFinish?: () => void
): { stop: () => void } {
  stopAllPreviews();

  let isStopped = false;
  const meta = SOUND_EVENT_METAS[eventType];
  const effectiveVolume = calculateEffectiveVolume(settings, eventType, config.volumeMultiplier);

  const stop = () => {
    isStopped = true;
    stopAllPreviews();
    onFinish?.();
  };

  (async () => {
    // 1. Built-in or Default
    if (config.sourceType === 'default' || config.sourceType === 'builtin') {
      const soundId = config.sourceType === 'default'
        ? meta.defaultBuiltin
        : (config.builtinSound || meta.defaultBuiltin);

      playAlarmSound(soundId, Math.max(0.05, effectiveVolume * 0.35));
      setTimeout(() => {
        if (!isStopped) onFinish?.();
      }, 1800);
      return;
    }

    // 2. Custom Audio
    if (config.sourceType === 'custom' && config.customAudioId) {
      try {
        const url = await getCustomAudioPlayableUrl(config.customAudioId);
        if (url && !isStopped) {
          const audio = new Audio(url);
          audio.volume = Math.max(0.05, effectiveVolume);
          activePreviewAudio = audio;

          audio.onended = () => {
            activePreviewAudio = null;
            if (!isStopped) onFinish?.();
          };

          audio.onerror = () => {
            console.warn('[ShadowRise Audio] Preview failed, using fallback sound');
            playAlarmSound(meta.defaultBuiltin, effectiveVolume * 0.35);
            if (!isStopped) onFinish?.();
          };

          await audio.play();
          return;
        }
      } catch (err) {
        console.warn('[ShadowRise Audio] Preview error:', err);
      }

      // Fallback
      if (!isStopped) {
        playAlarmSound(meta.defaultBuiltin, effectiveVolume * 0.35);
        onFinish?.();
      }
      return;
    }

    // 3. Voice Clip
    if (config.sourceType === 'voice') {
      const voiceId = config.voiceClipId || config.customAudioId;
      if (voiceId) {
        try {
          const url = await getCustomAudioPlayableUrl(voiceId);
          if (url && !isStopped) {
            const audio = new Audio(url);
            audio.volume = Math.max(0.05, effectiveVolume);
            activePreviewAudio = audio;
            audio.onended = () => {
              activePreviewAudio = null;
              if (!isStopped) onFinish?.();
            };
            audio.onerror = () => {
              const text = config.voicePromptText || meta.defaultVoiceText;
              speakVoicePrompt(text, effectiveVolume).then(() => {
                if (!isStopped) onFinish?.();
              });
            };
            await audio.play();
            return;
          }
        } catch {
          // Continue to speech fallback
        }
      }

      // Speech synthesis preview
      if (!isStopped) {
        const text = config.voicePromptText || meta.defaultVoiceText;
        playAlarmSound(meta.defaultBuiltin, effectiveVolume * 0.15);
        setTimeout(async () => {
          if (!isStopped) {
            await speakVoicePrompt(text, effectiveVolume);
            if (!isStopped) onFinish?.();
          }
        }, 200);
      }
      return;
    }

    // Fallback default
    if (!isStopped) {
      playAlarmSound(meta.defaultBuiltin, effectiveVolume * 0.35);
      setTimeout(() => {
        if (!isStopped) onFinish?.();
      }, 1500);
    }
  })();

  return { stop };
}

/**
 * Mobile-friendly Audio Context and HTML5 Audio pre-warming.
 * Call this on any user touch/tap to unlock audio on iOS Safari and mobile Chrome.
 */
export function unlockMobileAudio(): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (AudioCtx) {
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      // Create and immediately discard silent buffer
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    }
  } catch {
    // Ignore unlock issues
  }
}
