import { useState, useRef, useEffect } from 'react';
import {
  X,
  Clock,
  Bell,
  Volume2,
  Play,
  Square,
  Upload,
  Vibrate,
  Calendar,
  Check,
  Trash2,
  Sparkles,
  Music,
  FileAudio,
} from 'lucide-react';
import type {
  ShadowAlarm,
  AlarmRepeatType,
  DayOfWeek,
  BuiltInAlarmSound,
} from '@/types';
import {
  ALARM_SOUND_OPTIONS,
  playAlarmSound,
  startAlarmVibration,
  stopAlarmVibration,
} from '@/utils/audioEffects';

interface AlarmEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (alarm: Omit<ShadowAlarm, 'id' | 'createdAt'>, existingId?: string) => void;
  onDelete?: (alarmId: string) => void;
  initialAlarm?: ShadowAlarm | null;
}

const PRESET_TITLES = [
  'Daily Quest: Physical Re-conditioning',
  'Morning 100 Pushups & 10km Run',
  'Shadow Gate Incursion Workout',
  'Hydration Mana Protocol',
  'Shadow Monarch Sleep & Recovery',
  'Mobility & Core Conditioning',
];

const ALL_DAYS: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export function AlarmEditModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialAlarm,
}: AlarmEditModalProps) {
  const isEditing = Boolean(initialAlarm);

  const [time, setTime] = useState(initialAlarm?.time || '07:00');
  const [title, setTitle] = useState(initialAlarm?.title || 'Daily Quest Training');
  const [repeat, setRepeat] = useState<AlarmRepeatType>(initialAlarm?.repeat || 'daily');
  const [days, setDays] = useState<DayOfWeek[]>(initialAlarm?.days || ALL_DAYS);
  const [soundType, setSoundType] = useState<'builtin' | 'custom'>(
    initialAlarm?.soundType || 'builtin'
  );
  const [builtinSound, setBuiltinSound] = useState<BuiltInAlarmSound>(
    initialAlarm?.builtinSound || 'system_bell'
  );
  const [customSoundData, setCustomSoundData] = useState<string | undefined>(
    initialAlarm?.customSoundData
  );
  const [customSoundName, setCustomSoundName] = useState<string | undefined>(
    initialAlarm?.customSoundName
  );
  const [volume, setVolume] = useState<number>(initialAlarm?.volume ?? 0.8);
  const [vibration, setVibration] = useState<boolean>(initialAlarm?.vibration ?? true);

  // Audio preview state
  const [previewingSound, setPreviewingSound] = useState<string | null>(null);
  const customAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync initial alarm changes
  useEffect(() => {
    if (initialAlarm) {
      setTime(initialAlarm.time);
      setTitle(initialAlarm.title);
      setRepeat(initialAlarm.repeat);
      setDays(initialAlarm.days);
      setSoundType(initialAlarm.soundType);
      setBuiltinSound(initialAlarm.builtinSound);
      setCustomSoundData(initialAlarm.customSoundData);
      setCustomSoundName(initialAlarm.customSoundName);
      setVolume(initialAlarm.volume ?? 0.8);
      setVibration(initialAlarm.vibration ?? true);
    } else {
      setTime('07:00');
      setTitle('Daily Quest Training');
      setRepeat('daily');
      setDays(ALL_DAYS);
      setSoundType('builtin');
      setBuiltinSound('system_bell');
      setCustomSoundData(undefined);
      setCustomSoundName(undefined);
      setVolume(0.8);
      setVibration(true);
    }
  }, [initialAlarm, isOpen]);

  // Clean up any playing preview on modal close
  useEffect(() => {
    return () => {
      if (customAudioRef.current) {
        customAudioRef.current.pause();
        customAudioRef.current = null;
      }
      stopAlarmVibration();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRepeatChange = (mode: AlarmRepeatType) => {
    setRepeat(mode);
    if (mode === 'daily') {
      setDays(ALL_DAYS);
    } else if (mode === 'weekdays') {
      setDays(WEEKDAYS);
    } else if (mode === 'once') {
      const todayDay = ALL_DAYS[new Date().getDay()];
      setDays([todayDay]);
    }
  };

  const handleToggleDay = (day: DayOfWeek) => {
    let nextDays: DayOfWeek[];
    if (days.includes(day)) {
      if (days.length === 1) return; // Keep at least one day
      nextDays = days.filter((d) => d !== day);
    } else {
      nextDays = [...days, day];
    }
    setDays(nextDays);
    setRepeat('custom');
  };

  const handlePreviewBuiltinSound = (soundId: BuiltInAlarmSound) => {
    if (previewingSound === soundId) {
      setPreviewingSound(null);
      return;
    }
    if (customAudioRef.current) {
      customAudioRef.current.pause();
      customAudioRef.current = null;
    }
    setPreviewingSound(soundId);
    playAlarmSound(soundId, volume * 0.25);
    setTimeout(() => {
      setPreviewingSound((prev) => (prev === soundId ? null : prev));
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3')) {
      alert('Please upload a valid audio file (e.g. MP3, WAV, OGG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCustomSoundData(result);
      setCustomSoundName(file.name);
      setSoundType('custom');
    };
    reader.readAsDataURL(file);
  };

  const handleTogglePreviewCustomSound = () => {
    if (!customSoundData) return;

    if (previewingSound === 'custom') {
      if (customAudioRef.current) {
        customAudioRef.current.pause();
        customAudioRef.current = null;
      }
      setPreviewingSound(null);
      return;
    }

    if (customAudioRef.current) {
      customAudioRef.current.pause();
    }

    const audio = new Audio(customSoundData);
    audio.volume = volume;
    audio.onended = () => setPreviewingSound(null);
    audio.play().catch((err) => {
      console.warn('Audio preview blocked', err);
      setPreviewingSound(null);
    });

    customAudioRef.current = audio;
    setPreviewingSound('custom');
  };

  const handleTestVibration = () => {
    startAlarmVibration();
    setTimeout(stopAlarmVibration, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!time) return;

    onSave(
      {
        title: title.trim() || 'Hunter Alarm',
        time,
        enabled: initialAlarm ? initialAlarm.enabled : true,
        repeat,
        days: days.length > 0 ? days : ALL_DAYS,
        soundType,
        builtinSound,
        customSoundData,
        customSoundName,
        volume,
        vibration,
      },
      initialAlarm?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="glass-strong border border-primary-500/30 rounded-3xl w-full max-w-lg p-6 relative overflow-hidden shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Glow ambient background */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-300">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-100 flex items-center gap-2">
                <span>{isEditing ? 'Edit Hunter Alarm' : 'Create Hunter Alarm'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-primary-500/20 text-primary-300 border border-primary-500/30 uppercase">
                  System #ALARM
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Configure your combat awakening time and directive sound
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Time Picker */}
          <div className="glass rounded-2xl p-4 border border-white/10 flex flex-col items-center">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary-400" />
              <span>Alarm Time (24h)</span>
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="bg-base-900/80 border border-primary-500/40 rounded-2xl px-6 py-3 text-4xl font-display font-bold text-center text-white focus:outline-none focus:border-primary-400 shadow-[0_0_20px_rgba(139,92,246,0.3)] tracking-wider"
            />
            {/* Quick Time Presets */}
            <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
              {['05:30', '06:00', '06:30', '07:00', '08:00', '21:00'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTime(preset)}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                    time === preset
                      ? 'bg-primary-500/30 border-primary-400 text-white font-bold'
                      : 'glass border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Alarm Title & Presets */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 block">
              Directive / Alarm Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Daily Quest: Physical Re-conditioning"
              maxLength={60}
              className="w-full bg-base-900/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-primary-400 font-sans"
            />
            {/* Presets Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PRESET_TITLES.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTitle(preset)}
                  className="text-[10px] font-mono px-2 py-1 rounded-md glass border border-white/5 text-slate-400 hover:text-primary-300 hover:border-primary-500/30 transition-all text-left"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Repeat Mode */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary-400" />
              <span>Repeat Schedule</span>
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {(['daily', 'weekdays', 'custom', 'once'] as AlarmRepeatType[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleRepeatChange(mode)}
                  className={`py-2 px-2 rounded-xl text-xs font-mono capitalize text-center border transition-all ${
                    repeat === mode
                      ? 'bg-primary-500/25 border-primary-400 text-primary-200 font-bold shadow-sm shadow-primary-500/20'
                      : 'glass border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode === 'weekdays' ? 'Mon-Fri' : mode}
                </button>
              ))}
            </div>

            {/* Custom Day Toggle Chips */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {ALL_DAYS.map((day) => {
                const isSelected = days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    className={`flex-1 py-2 rounded-xl text-[11px] font-mono font-bold border transition-all ${
                      isSelected
                        ? 'bg-gradient-to-b from-primary-500/30 to-indigo-600/30 border-primary-400 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                        : 'glass border-white/10 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sound Configuration */}
          <div className="glass rounded-2xl p-4 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-primary-400" />
                <span>Alarm Sound</span>
              </label>

              {/* Sound Mode Tabs */}
              <div className="flex rounded-lg glass p-0.5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setSoundType('builtin')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase transition-all ${
                    soundType === 'builtin'
                      ? 'bg-primary-500 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Built-In ({ALARM_SOUND_OPTIONS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSoundType('custom')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase transition-all ${
                    soundType === 'custom'
                      ? 'bg-primary-500 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Custom MP3
                </button>
              </div>
            </div>

            {/* Built-in sounds selector */}
            {soundType === 'builtin' && (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {ALARM_SOUND_OPTIONS.map((snd) => {
                  const isSelected = builtinSound === snd.id;
                  const isPlaying = previewingSound === snd.id;
                  return (
                    <div
                      key={snd.id}
                      onClick={() => setBuiltinSound(snd.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary-500/20 border-primary-400 text-white shadow-sm'
                          : 'glass border-white/5 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-primary-400 bg-primary-500'
                              : 'border-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                            <span>{snd.name}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-primary-300 border border-white/10">
                              {snd.badge}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono truncate">
                            {snd.description}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewBuiltinSound(snd.id);
                        }}
                        className={`p-2 rounded-lg border transition-all shrink-0 ${
                          isPlaying
                            ? 'bg-primary-500 border-primary-400 text-white animate-pulse'
                            : 'glass border-white/10 text-slate-400 hover:text-white'
                        }`}
                        title="Preview sound"
                      >
                        {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Custom MP3 Upload */}
            {soundType === 'custom' && (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="audio/*,.mp3,.wav,.ogg,.m4a"
                  className="hidden"
                />

                {customSoundData ? (
                  <div className="p-3.5 rounded-2xl glass border border-primary-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-300 shrink-0">
                        <FileAudio className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-200 truncate">
                          {customSoundName || 'Custom Audio Track'}
                        </div>
                        <div className="text-[10px] font-mono text-emerald-400">
                          Active Custom MP3 Ringtone
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleTogglePreviewCustomSound}
                        className={`p-2 rounded-lg border transition-all ${
                          previewingSound === 'custom'
                            ? 'bg-primary-500 border-primary-400 text-white'
                            : 'glass border-white/10 text-slate-300 hover:text-white'
                        }`}
                        title={previewingSound === 'custom' ? 'Stop' : 'Play'}
                      >
                        {previewingSound === 'custom' ? (
                          <Square className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-lg glass border border-white/10 text-slate-400 hover:text-white"
                        title="Upload different sound"
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCustomSoundData(undefined);
                          setCustomSoundName(undefined);
                          setSoundType('builtin');
                        }}
                        className="p-2 rounded-lg glass border border-white/10 text-rose-400 hover:text-rose-300"
                        title="Remove custom sound"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 rounded-2xl border-2 border-dashed border-primary-500/30 hover:border-primary-500/60 glass text-center cursor-pointer transition-all group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-300 mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-slate-200">
                      Upload Custom Alarm Track (MP3)
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 mt-1">
                      Supports MP3, WAV, OGG audio files. Stored permanently on device.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Volume & Vibration Row */}
            <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-4 items-center">
              {/* Volume Slider */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-primary-400" /> Volume
                  </span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full accent-primary-500 cursor-pointer"
                />
              </div>

              {/* Vibration Toggle */}
              <div className="flex items-center justify-between pl-2 border-l border-white/10">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300">
                  <Vibrate className="w-3.5 h-3.5 text-primary-400" />
                  <span>Vibration</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestVibration}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded glass border border-white/10 text-slate-400 hover:text-white"
                    title="Test vibration pulse"
                  >
                    Test
                  </button>

                  <button
                    type="button"
                    onClick={() => setVibration(!vibration)}
                    className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                      vibration ? 'bg-primary-600' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        vibration ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            {isEditing && onDelete && initialAlarm && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this Hunter Alarm?')) {
                    onDelete(initialAlarm.id);
                    onClose();
                  }
                }}
                className="p-3 rounded-2xl glass border border-rose-500/30 text-rose-400 hover:text-rose-200 transition-colors"
                title="Delete alarm"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl glass font-mono text-xs text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 py-3.5 rounded-2xl gradient-mixed font-display font-bold text-xs uppercase tracking-wider text-white shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-4 h-4 text-warning-300" />
              <span>{isEditing ? 'Update Alarm' : 'Set Hunter Alarm'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
