import { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Upload,
  Trash2,
  Check,
  RotateCcw,
  Sparkles,
  Mic,
  Music,
  Sun,
  Moon,
  Droplets,
  Scroll,
  Flame,
  Trophy,
  X,
  AlertCircle,
  FileAudio,
} from 'lucide-react';
import type {
  SoundEventType,
  SoundSystemSettings,
  EventSoundConfig,
  CustomAudioFile,
  SoundSourceType,
} from '@/types/soundSystem';
import {
  SOUND_EVENT_METAS,
  DEFAULT_SOUND_SETTINGS,
} from '@/types/soundSystem';
import {
  loadSoundSettings,
  saveSoundSettings,
  previewSound,
  stopAllPreviews,
  unlockMobileAudio,
} from '@/utils/customSoundSystem';
import {
  saveCustomAudioFile,
  listCustomAudioFiles,
  deleteCustomAudioFile,
} from '@/utils/audioStorage';
import { ALARM_SOUND_OPTIONS, playLevelUpChime } from '@/utils/audioEffects';
import type { BuiltInAlarmSound } from '@/types';

interface SoundsAndAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved?: (newSettings: SoundSystemSettings) => void;
}

const VOICE_PRESET_EXAMPLES = [
  'Hunter, wake up.',
  'Hydration required.',
  'Quest available.',
  'Recovery complete. Arise, Monarch.',
  'Dungeon alert detected.',
];

export function SoundsAndAlertsModal({
  isOpen,
  onClose,
  onSettingsSaved,
}: SoundsAndAlertsModalProps) {
  const [settings, setSettings] = useState<SoundSystemSettings>(loadSoundSettings);
  const [activeTab, setActiveTab] = useState<'events' | 'voices'>('events');
  const [activeEventTab, setActiveEventTab] = useState<SoundEventType>('sleepReminder');

  // Previewing state: key of event currently playing
  const [currentlyPlayingEvent, setCurrentlyPlayingEvent] = useState<string | null>(null);
  const previewControllerRef = useRef<{ stop: () => void } | null>(null);

  // Custom audio & voice files list
  const [customAudioList, setCustomAudioList] = useState<CustomAudioFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New voice clip form state
  const [newVoiceLabel, setNewVoiceLabel] = useState('Hunter, wake up.');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const eventUploadInputRef = useRef<HTMLInputElement>(null);
  const targetUploadEventRef = useRef<SoundEventType | null>(null);

  // Load custom audio files list from IndexedDB / Storage
  const refreshAudioList = async () => {
    try {
      const files = await listCustomAudioFiles();
      setCustomAudioList(files);
    } catch (err) {
      console.warn('Failed to load custom audio files:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSettings(loadSoundSettings());
      refreshAudioList();
      unlockMobileAudio();
      setSaveSuccess(false);
      setUploadError(null);
    } else {
      stopCurrentPreview();
    }
    return () => {
      stopCurrentPreview();
    };
  }, [isOpen]);

  const stopCurrentPreview = () => {
    if (previewControllerRef.current) {
      previewControllerRef.current.stop();
      previewControllerRef.current = null;
    }
    stopAllPreviews();
    setCurrentlyPlayingEvent(null);
  };

  const handlePlayPreview = (eventType: SoundEventType, config: EventSoundConfig) => {
    unlockMobileAudio();

    if (currentlyPlayingEvent === eventType) {
      stopCurrentPreview();
      return;
    }

    stopCurrentPreview();
    setCurrentlyPlayingEvent(eventType);

    const controller = previewSound(config, eventType, settings, () => {
      setCurrentlyPlayingEvent(null);
      previewControllerRef.current = null;
    });

    previewControllerRef.current = controller;
  };

  const handleUpdateVolume = (key: 'masterVolume' | 'alarmVolume' | 'reminderVolume', value: number) => {
    setSettings((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.min(100, value)),
    }));
  };

  const handleUpdateEventConfig = (
    eventType: SoundEventType,
    updates: Partial<EventSoundConfig>
  ) => {
    setSettings((prev) => {
      const current = prev.events[eventType] || DEFAULT_SOUND_SETTINGS.events[eventType];
      return {
        ...prev,
        events: {
          ...prev.events,
          [eventType]: {
            ...current,
            ...updates,
          },
        },
      };
    });
  };

  // Upload handler for a specific event
  const triggerEventAudioUpload = (eventType: SoundEventType) => {
    targetUploadEventRef.current = eventType;
    if (eventUploadInputRef.current) {
      eventUploadInputRef.current.value = '';
      eventUploadInputRef.current.click();
    }
  };

  const handleEventAudioFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetEvent = targetUploadEventRef.current;
    if (!file || !targetEvent) return;

    // Check size limit: max 12MB
    if (file.size > 12 * 1024 * 1024) {
      setUploadError('Audio file is too large (maximum 12MB allowed).');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const saved = await saveCustomAudioFile(file, {
        name: file.name,
        category: 'sound',
      });
      await refreshAudioList();

      handleUpdateEventConfig(targetEvent, {
        sourceType: 'custom',
        customAudioId: saved.id,
        customAudioName: saved.name,
      });

      // Quick preview of the newly uploaded sound
      handlePlayPreview(targetEvent, {
        sourceType: 'custom',
        builtinSound: settings.events[targetEvent].builtinSound,
        customAudioId: saved.id,
        customAudioName: saved.name,
        volumeMultiplier: 100,
      });
    } catch (err) {
      console.warn('Upload failed:', err);
      setUploadError('Failed to process custom audio file. Please try an MP3 or WAV.');
    } finally {
      setIsUploading(false);
    }
  };

  // Upload handler for Voice Clips Library
  const handleVoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      setUploadError('Voice file too large (maximum 12MB allowed).');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      await saveCustomAudioFile(file, {
        name: file.name,
        category: 'voice',
        voiceLabel: newVoiceLabel.trim() || 'Custom Voice Clip',
      });
      await refreshAudioList();
    } catch (err) {
      console.warn('Voice upload failed:', err);
      setUploadError('Failed to save voice clip.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAudioFile = async (id: string) => {
    await deleteCustomAudioFile(id);
    await refreshAudioList();

    // If any event was using this audio, reset it to default
    setSettings((prev) => {
      const updatedEvents = { ...prev.events };
      for (const [key, config] of Object.entries(updatedEvents)) {
        if (config.customAudioId === id || config.voiceClipId === id) {
          updatedEvents[key as SoundEventType] = {
            ...config,
            sourceType: 'default',
            customAudioId: undefined,
            customAudioName: undefined,
            voiceClipId: undefined,
          };
        }
      }
      return { ...prev, events: updatedEvents };
    });
  };

  const handleSaveAll = () => {
    stopCurrentPreview();
    saveSoundSettings(settings);
    onSettingsSaved?.(settings);
    setSaveSuccess(true);
    playLevelUpChime(0.15);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  const handleResetToDefaults = () => {
    stopCurrentPreview();
    setSettings(DEFAULT_SOUND_SETTINGS);
    saveSoundSettings(DEFAULT_SOUND_SETTINGS);
    onSettingsSaved?.(DEFAULT_SOUND_SETTINGS);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  if (!isOpen) return null;

  const currentMeta = SOUND_EVENT_METAS[activeEventTab];
  const currentConfig = settings.events[activeEventTab] || DEFAULT_SOUND_SETTINGS.events[activeEventTab];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopCurrentPreview();
          onClose();
        }
      }}
    >
      <div className="glass-strong rounded-3xl p-4 sm:p-6 max-w-lg w-full max-h-[92vh] flex flex-col border border-primary-500/40 shadow-[0_0_35px_rgba(168,85,247,0.25)] animate-scale-in relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-10 bg-primary-500/20 blur-2xl pointer-events-none" />

        {/* Hidden inputs for audio upload */}
        <input
          type="file"
          ref={eventUploadInputRef}
          onChange={handleEventAudioFileSelected}
          accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/x-m4a,audio/aac,audio/*"
          className="hidden"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleVoiceUpload}
          accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/x-m4a,audio/aac,audio/*"
          className="hidden"
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-primary-500/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 border border-primary-500/40 flex items-center justify-center text-primary-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <Volume2 className="w-5 h-5 text-primary-300" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <span>Sounds & Alerts</span>
                <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-primary-500/20 text-primary-300 border border-primary-500/30">
                  Custom Audio
                </span>
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Configure alerts, uploaded audio & custom hunter voice clips
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCurrentPreview();
              onClose();
            }}
            className="p-2 rounded-xl glass text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1 scrollbar-thin">
          {/* Section 1: Master & Category Volume Sliders */}
          <div className="glass rounded-2xl p-4 space-y-3.5 border border-primary-500/25">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-primary-300" />
                <span className="font-display text-xs uppercase tracking-wider font-semibold text-slate-200">
                  Volume Master Controls
                </span>
              </div>
              <span className="text-[11px] font-mono text-primary-300 font-bold">
                Master: {settings.masterVolume}%
              </span>
            </div>

            {/* Master Volume */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Master Output</span>
                <span>{settings.masterVolume}%</span>
              </div>
              <div className="flex items-center gap-2.5">
                <VolumeX className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.masterVolume}
                  onChange={(e) => handleUpdateVolume('masterVolume', Number(e.target.value))}
                  className="w-full accent-primary-500 cursor-pointer h-1.5 rounded-lg bg-base-800"
                />
                <Volume2 className="w-3.5 h-3.5 text-primary-400 shrink-0" />
              </div>
            </div>

            {/* Split Sliders: Alarms & Reminders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-white/5">
              {/* Alarm Volume */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Alarm Alerts</span>
                  <span className="text-amber-400">{settings.alarmVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.alarmVolume}
                  onChange={(e) => handleUpdateVolume('alarmVolume', Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 rounded-lg bg-base-800"
                />
              </div>

              {/* Reminder Volume */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Reminders & Chimes</span>
                  <span className="text-blue-400">{settings.reminderVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.reminderVolume}
                  onChange={(e) => handleUpdateVolume('reminderVolume', Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-1.5 rounded-lg bg-base-800"
                />
              </div>
            </div>
          </div>

          {/* Section 2: View Switcher (Event Customization vs Custom Voice Library) */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-base-900/60 border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('events')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'events'
                  ? 'bg-primary-500/25 border border-primary-500/50 text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Event Sounds (7)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('voices')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'voices'
                  ? 'bg-primary-500/25 border border-primary-500/50 text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice Clips Library</span>
            </button>
          </div>

          {/* Error / Upload Status banner */}
          {uploadError && (
            <div className="p-2.5 rounded-xl bg-error-500/20 border border-error-500/40 text-error-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* TAB 1: Event Sounds Configuration */}
          {activeTab === 'events' && (
            <div className="space-y-3">
              {/* Event Tabs Horizontal Carousel */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {(Object.keys(SOUND_EVENT_METAS) as SoundEventType[]).map((evtKey) => {
                  const meta = SOUND_EVENT_METAS[evtKey];
                  const isSelected = activeEventTab === evtKey;
                  const isPlayingThis = currentlyPlayingEvent === evtKey;

                  return (
                    <button
                      key={evtKey}
                      type="button"
                      onClick={() => {
                        stopCurrentPreview();
                        setActiveEventTab(evtKey);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer ${
                        isSelected
                          ? 'bg-primary-500/30 border-primary-400 text-white font-bold shadow-[0_0_12px_rgba(168,85,247,0.35)] scale-[1.02]'
                          : 'glass border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/20'
                      }`}
                    >
                      {isPlayingThis ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary-400 animate-ping" />
                      ) : (
                        renderEventIcon(meta.iconName)
                      )}
                      <span>{meta.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Event Configuration Card */}
              <div className="glass rounded-2xl p-4 space-y-4 border border-primary-500/30 relative">
                {/* Event Title, Badge & Preview Button */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-sm text-slate-100 uppercase tracking-wide">
                        {currentMeta.title}
                      </h3>
                      <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                        currentMeta.category === 'alarm'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : currentMeta.category === 'celebration'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      }`}>
                        {currentMeta.category}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {currentMeta.description}
                    </p>
                  </div>

                  {/* Play / Stop Preview Button */}
                  <button
                    type="button"
                    onClick={() => handlePlayPreview(activeEventTab, currentConfig)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                      currentlyPlayingEvent === activeEventTab
                        ? 'bg-amber-500/30 border border-amber-400 text-amber-200 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                        : 'gradient-mixed text-white border border-primary-400/40 hover:scale-105 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                    }`}
                  >
                    {currentlyPlayingEvent === activeEventTab ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Preview</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Sound Source Selectors (Default / Built-in / Custom Audio / Voice) */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                    Sound Source Mode:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {(['default', 'builtin', 'custom', 'voice'] as SoundSourceType[]).map((src) => {
                      const isSelected = currentConfig.sourceType === src;
                      const label =
                        src === 'default'
                          ? 'Default'
                          : src === 'builtin'
                          ? 'Built-In'
                          : src === 'custom'
                          ? 'Custom Upload'
                          : 'Voice Clip';

                      return (
                        <button
                          key={src}
                          type="button"
                          onClick={() => {
                            stopCurrentPreview();
                            handleUpdateEventConfig(activeEventTab, { sourceType: src });
                          }}
                          className={`py-2 px-2 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all text-center border cursor-pointer ${
                            isSelected
                              ? 'bg-primary-500/25 border-primary-400 text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                              : 'bg-base-900/60 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/20'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-Panel: Depending on Selected Source */}
                {currentConfig.sourceType === 'default' && (
                  <div className="p-3 rounded-xl bg-base-900/60 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Assigned Default:</span>
                      <span className="text-primary-300 font-bold uppercase">
                        {currentMeta.defaultBuiltin.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-500">
                      Standard ShadowRise procedural Web Audio tone (always available with 0 network latency).
                    </p>
                  </div>
                )}

                {currentConfig.sourceType === 'builtin' && (
                  <div className="p-3 rounded-xl bg-base-900/60 border border-white/5 space-y-2">
                    <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                      Select Built-in Shadow Sound:
                    </label>
                    <select
                      value={currentConfig.builtinSound || currentMeta.defaultBuiltin}
                      onChange={(e) => {
                        const val = e.target.value as BuiltInAlarmSound;
                        handleUpdateEventConfig(activeEventTab, { builtinSound: val });
                        handlePlayPreview(activeEventTab, { ...currentConfig, builtinSound: val });
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-base-800 border border-primary-500/30 text-white font-mono text-xs focus:outline-none focus:border-primary-400"
                    >
                      {ALARM_SOUND_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name} · {opt.badge}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {currentConfig.sourceType === 'custom' && (
                  <div className="p-3 rounded-xl bg-base-900/60 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                        Custom Audio File (MP3, WAV, M4A)
                      </span>
                      <button
                        type="button"
                        onClick={() => triggerEventAudioUpload(activeEventTab)}
                        disabled={isUploading}
                        className="px-2.5 py-1 rounded-lg bg-primary-500/20 border border-primary-400/40 hover:bg-primary-500/30 text-primary-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploading ? 'Uploading...' : 'Upload Audio'}</span>
                      </button>
                    </div>

                    {currentConfig.customAudioId ? (
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-primary-950/40 border border-primary-500/30">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileAudio className="w-4 h-4 text-primary-400 shrink-0" />
                          <span className="text-xs font-mono text-slate-200 truncate">
                            {currentConfig.customAudioName || 'Custom Audio File'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateEventConfig(activeEventTab, {
                              sourceType: 'default',
                              customAudioId: undefined,
                              customAudioName: undefined,
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-error-400 transition-colors"
                          title="Remove Custom Audio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl border border-dashed border-white/10 text-center space-y-1.5">
                        <p className="text-[11px] font-mono text-slate-400">
                          No custom sound assigned yet.
                        </p>
                        <button
                          type="button"
                          onClick={() => triggerEventAudioUpload(activeEventTab)}
                          className="px-3 py-1 rounded-lg bg-primary-500/20 text-primary-300 font-mono text-xs border border-primary-500/30 hover:bg-primary-500/30"
                        >
                          Select MP3 / WAV / M4A
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {currentConfig.sourceType === 'voice' && (
                  <div className="p-3 rounded-xl bg-base-900/60 border border-white/5 space-y-3">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                      Custom Voice Clip Assignment:
                    </span>

                    {/* Choose from uploaded voice clips if available */}
                    {customAudioList.filter((f) => f.category === 'voice').length > 0 ? (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400">
                          Select from Voice Clips Library:
                        </label>
                        <select
                          value={currentConfig.voiceClipId || ''}
                          onChange={(e) => {
                            const chosenId = e.target.value;
                            const found = customAudioList.find((f) => f.id === chosenId);
                            handleUpdateEventConfig(activeEventTab, {
                              voiceClipId: chosenId,
                              customAudioName: found?.name,
                            });
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-base-800 border border-primary-500/30 text-white font-mono text-xs"
                        >
                          <option value="">Default Voice Directive (System Synthesized)</option>
                          {customAudioList
                            .filter((f) => f.category === 'voice')
                            .map((vc) => (
                              <option key={vc.id} value={vc.id}>
                                {vc.voiceLabel ? `"${vc.voiceLabel}" · ` : ''}{vc.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    ) : null}

                    {/* Voice prompt phrase preview */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                        <span>System Voice Directive Phrase:</span>
                      </label>
                      <input
                        type="text"
                        value={currentConfig.voicePromptText ?? currentMeta.defaultVoiceText}
                        onChange={(e) => {
                          handleUpdateEventConfig(activeEventTab, {
                            voicePromptText: e.target.value,
                          });
                        }}
                        placeholder={currentMeta.defaultVoiceText}
                        className="w-full py-2 px-3 rounded-xl bg-base-800 border border-primary-500/30 text-white font-mono text-xs focus:outline-none focus:border-primary-400"
                      />
                      <p className="text-[9px] font-mono text-slate-500">
                        Plays Solo Leveling Monarchy voice alert or custom clip when alert fires.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Voice Clips Library */}
          {activeTab === 'voices' && (
            <div className="space-y-3.5">
              {/* Upload Voice Clip Card */}
              <div className="glass rounded-2xl p-4 space-y-3 border border-primary-500/25">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-primary-300" />
                  <h3 className="font-display font-bold text-xs uppercase tracking-wide text-slate-200">
                    Upload Custom Voice Clip
                  </h3>
                </div>
                <p className="text-[11px] font-mono text-slate-400">
                  Upload custom vocal phrases (e.g. &ldquo;Hunter, wake up.&rdquo;, &ldquo;Hydration required.&rdquo;) in MP3, WAV, or M4A format.
                </p>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-400">Voice Phrase Label:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newVoiceLabel}
                      onChange={(e) => setNewVoiceLabel(e.target.value)}
                      placeholder='e.g. "Hunter, wake up."'
                      className="flex-1 py-1.5 px-3 rounded-xl bg-base-800 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-primary-400"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-3 py-1.5 rounded-xl gradient-mixed text-white font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Uploading...' : 'Choose Audio'}</span>
                    </button>
                  </div>
                </div>

                {/* Preset quick labels */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[9px] font-mono text-slate-500">Quick suggestions:</span>
                  {VOICE_PRESET_EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setNewVoiceLabel(ex)}
                      className="text-[9px] font-mono px-2 py-0.5 rounded bg-primary-500/15 border border-primary-500/30 text-primary-300 hover:bg-primary-500/30 transition-colors"
                    >
                      &ldquo;{ex}&rdquo;
                    </button>
                  ))}
                </div>
              </div>

              {/* Uploaded Files Inventory */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Saved Custom Audio Files ({customAudioList.length})
                </span>

                {customAudioList.length === 0 ? (
                  <div className="p-4 rounded-2xl glass border border-white/5 text-center text-xs font-mono text-slate-500">
                    No custom audio uploaded yet. Use the upload button above to add custom MP3, WAV, or M4A clips.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {customAudioList.map((audio) => (
                      <div
                        key={audio.id}
                        className="glass rounded-xl p-3 flex items-center justify-between border border-white/5 hover:border-primary-500/30 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center shrink-0 text-primary-300">
                            {audio.category === 'voice' ? (
                              <Mic className="w-4 h-4" />
                            ) : (
                              <FileAudio className="w-4 h-4" />
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-mono text-slate-200 font-semibold truncate">
                              {audio.voiceLabel ? `"${audio.voiceLabel}"` : audio.name}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400 truncate">
                              {audio.name} · {(audio.size / 1024).toFixed(0)} KB
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Preview stored clip */}
                          <button
                            type="button"
                            onClick={() =>
                              handlePlayPreview('questReminder', {
                                sourceType: 'custom',
                                builtinSound: 'system_bell',
                                customAudioId: audio.id,
                                volumeMultiplier: 100,
                              })
                            }
                            className="p-1.5 glass rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
                            title="Preview Audio"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>

                          {/* Delete stored clip */}
                          <button
                            type="button"
                            onClick={() => handleDeleteAudioFile(audio.id)}
                            className="p-1.5 glass rounded-lg text-slate-400 hover:text-error-400 hover:bg-error-500/10"
                            title="Delete Clip"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer: Action Buttons */}
        <div className="pt-3 border-t border-primary-500/20 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                stopCurrentPreview();
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl glass text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-mixed text-white font-mono text-xs uppercase tracking-wider font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-success-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-primary-200" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderEventIcon(iconName: string) {
  switch (iconName) {
    case 'Moon':
      return <Moon className="w-3.5 h-3.5 text-primary-300" />;
    case 'Sun':
      return <Sun className="w-3.5 h-3.5 text-amber-300" />;
    case 'Droplets':
      return <Droplets className="w-3.5 h-3.5 text-blue-300" />;
    case 'Scroll':
      return <Scroll className="w-3.5 h-3.5 text-amber-200" />;
    case 'Flame':
      return <Flame className="w-3.5 h-3.5 text-purple-300" />;
    case 'Trophy':
      return <Trophy className="w-3.5 h-3.5 text-yellow-300" />;
    case 'Sparkles':
    default:
      return <Sparkles className="w-3.5 h-3.5 text-emerald-300" />;
  }
}
