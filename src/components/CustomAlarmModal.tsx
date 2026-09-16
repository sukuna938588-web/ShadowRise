import { useState, useEffect } from 'react';
import {
  Bell,
  Volume2,
  Play,
  X,
  CheckCircle2,
  Clock,
  Droplets,
  Dumbbell,
  Sparkles,
  Zap,
  Radio,
  Mic,
} from 'lucide-react';
import type {
  WorkoutAlarmSettings,
  WaterReminderSettings,
} from '@/types';
import {
  ALARM_SOUND_OPTIONS,
  playAlarmSound,
} from '@/utils/audioEffects';
import {
  HUNTER_VOICE_MESSAGES,
  speakHunterMotivation,
  stopSpeaking,
} from '@/utils/voiceMotivation';

interface CustomAlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutAlarm: WorkoutAlarmSettings;
  waterReminder: WaterReminderSettings;
  onUpdateWorkoutAlarm: (updates: Partial<WorkoutAlarmSettings>) => void;
  onUpdateWaterReminder: (updates: Partial<WaterReminderSettings>) => void;
  onTriggerTestWorkoutAlarm: () => void;
  onTriggerTestWaterReminder: () => void;
}

export function CustomAlarmModal({
  isOpen,
  onClose,
  workoutAlarm,
  waterReminder,
  onUpdateWorkoutAlarm,
  onUpdateWaterReminder,
  onTriggerTestWorkoutAlarm,
  onTriggerTestWaterReminder,
}: CustomAlarmModalProps) {
  const [activeTab, setActiveTab] = useState<'workout' | 'water' | 'soundboard'>('workout');
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, [isOpen]);

  const requestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        setBrowserPermission(result);
      } catch (err) {
        console.warn('Notification permission error', err);
      }
    }
  };

  if (!isOpen) return null;

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    const currentDays = workoutAlarm.days || daysOfWeek;
    let nextDays: string[];
    if (currentDays.includes(day)) {
      if (currentDays.length === 1) return; // Keep at least one day
      nextDays = currentDays.filter((d) => d !== day);
    } else {
      nextDays = [...currentDays, day];
    }
    onUpdateWorkoutAlarm({ days: nextDays });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="glass-strong border border-white/10 rounded-3xl w-full max-w-lg p-6 relative overflow-hidden shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Glow ambient */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-primary-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-300">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm tracking-wider uppercase text-slate-100 flex items-center gap-2">
                <span>Hunter Alarm Protocols</span>
                <span className="px-2 py-0.5 rounded-full bg-primary-500/20 border border-primary-400/30 text-[9px] font-mono text-primary-300 uppercase">
                  Custom Audio
                </span>
              </h2>
              <p className="text-[10px] font-mono text-slate-400">
                Scheduled workout gates, hydration chimes & audio soundboard
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Control Tabs */}
        <div className="flex rounded-2xl glass p-1 mb-5 border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('workout')}
            className={`flex-1 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'workout'
                ? 'gradient-mixed text-white glow-primary shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Workout Alarm</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('water')}
            className={`flex-1 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'water'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Water Alarms</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('soundboard')}
            className={`flex-1 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'soundboard'
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Soundboard</span>
          </button>
        </div>

        {/* Tab 1: Workout Alarms */}
        {activeTab === 'workout' && (
          <div className="space-y-4 animate-fade-in">
            {/* Enable toggle */}
            <div className="glass rounded-2xl p-4 flex items-center justify-between border border-white/5">
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider block">
                  Daily Workout Alarm
                </span>
                <span className="text-[11px] text-slate-400 font-mono block">
                  Triggers daily combat directive alarm at specified time
                </span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateWorkoutAlarm({ enabled: !workoutAlarm.enabled })}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  workoutAlarm.enabled ? 'bg-primary-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    workoutAlarm.enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Time Picker */}
            <div className="glass rounded-2xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary-400" />
                  <span>Alarm Time</span>
                </label>
                <span className="text-xs font-mono text-primary-300 font-bold">
                  {workoutAlarm.time}
                </span>
              </div>
              <input
                type="time"
                value={workoutAlarm.time}
                onChange={(e) => onUpdateWorkoutAlarm({ time: e.target.value })}
                className="w-full bg-base-950 border border-white/10 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:border-primary-400 focus:outline-none"
              />
            </div>

            {/* Days of Week */}
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">
                Active Days
              </label>
              <div className="grid grid-cols-7 gap-1">
                {daysOfWeek.map((day) => {
                  const isSelected = (workoutAlarm.days || daysOfWeek).includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`py-2 rounded-xl text-[11px] font-mono font-bold transition-all border ${
                        isSelected
                          ? 'bg-primary-500/25 border-primary-400 text-primary-200'
                          : 'glass border-white/5 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sound Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-400">
                  Alarm Sound Profile
                </label>
                <span className="text-[10px] font-mono text-primary-300">
                  Tap sound to preview
                </span>
              </div>
              <div className="space-y-1.5">
                {ALARM_SOUND_OPTIONS.map((snd) => {
                  const isSelected = (workoutAlarm.sound || 'system_bell') === snd.id;
                  return (
                    <div
                      key={snd.id}
                      onClick={() => {
                        onUpdateWorkoutAlarm({ sound: snd.id });
                        playAlarmSound(snd.id);
                      }}
                      className={`p-3 rounded-2xl glass border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-primary-400/60 bg-primary-500/15 shadow-sm'
                          : 'border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            playAlarmSound(snd.id);
                          }}
                          className="w-8 h-8 rounded-lg bg-base-950 border border-white/10 flex items-center justify-center text-primary-300 hover:text-white"
                          title="Preview sound"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-200">
                              {snd.name}
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                              {snd.badge}
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-400">
                            {snd.description}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-primary-400 bg-primary-500'
                            : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Test Trigger Button */}
            <button
              type="button"
              onClick={() => {
                playAlarmSound(workoutAlarm.sound || 'system_bell');
                onTriggerTestWorkoutAlarm();
                onClose();
              }}
              className="w-full py-3 rounded-xl glass border border-primary-500/30 text-primary-300 hover:text-white hover:bg-primary-500/15 font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-primary-400" />
              <span>Test Workout Alarm Popup Now</span>
            </button>
          </div>
        )}

        {/* Tab 2: Water Alarms */}
        {activeTab === 'water' && (
          <div className="space-y-4 animate-fade-in">
            {/* Enable toggle */}
            <div className="glass rounded-2xl p-4 flex items-center justify-between border border-white/5">
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider block">
                  Enable Water Reminders
                </span>
                <span className="text-[11px] text-slate-400 font-mono block">
                  Periodic hydration chimes and vital reserve directives
                </span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateWaterReminder({ enabled: !waterReminder.enabled })}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  waterReminder.enabled ? 'bg-blue-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    waterReminder.enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Interval Frequency */}
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">
                Reminder Interval Frequency
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[30, 45, 60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => onUpdateWaterReminder({ intervalMinutes: mins })}
                    className={`py-2 rounded-xl text-xs font-mono transition-all border ${
                      waterReminder.intervalMinutes === mins
                        ? 'bg-blue-500/25 border-blue-400 text-blue-200 font-bold shadow-sm'
                        : 'glass border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Sound Selector for Water */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-400">
                  Hydration Chime Sound
                </label>
                <span className="text-[10px] font-mono text-blue-300">
                  Tap sound to preview
                </span>
              </div>
              <div className="space-y-1.5">
                {ALARM_SOUND_OPTIONS.map((snd) => {
                  const isSelected = (waterReminder.sound || 'crystal_droplets') === snd.id;
                  return (
                    <div
                      key={snd.id}
                      onClick={() => {
                        onUpdateWaterReminder({ sound: snd.id });
                        playAlarmSound(snd.id);
                      }}
                      className={`p-3 rounded-2xl glass border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-400/60 bg-blue-500/15 shadow-sm'
                          : 'border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            playAlarmSound(snd.id);
                          }}
                          className="w-8 h-8 rounded-lg bg-base-950 border border-white/10 flex items-center justify-center text-blue-300 hover:text-white"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-200">
                              {snd.name}
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                              {snd.badge}
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-400">
                            {snd.description}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-blue-400 bg-blue-500'
                            : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Test Trigger Button */}
            <button
              type="button"
              onClick={() => {
                playAlarmSound(waterReminder.sound || 'crystal_droplets');
                onTriggerTestWaterReminder();
                onClose();
              }}
              className="w-full py-3 rounded-xl glass border border-blue-500/30 text-blue-300 hover:text-white hover:bg-blue-500/15 font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>Test Water Reminder Now</span>
            </button>
          </div>
        )}

        {/* Tab 3: Soundboard & Voice Motivation Audition */}
        {activeTab === 'soundboard' && (
          <div className="space-y-4 animate-fade-in">
            {/* Custom Sounds Grid */}
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-indigo-400" />
                <span>Web Audio Soundboard</span>
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {ALARM_SOUND_OPTIONS.map((snd) => (
                  <div
                    key={snd.id}
                    className="p-3 rounded-2xl glass border border-white/5 flex items-center justify-between hover:border-white/15 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono font-bold text-slate-200">
                          {snd.name}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {snd.badge}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-400">
                        {snd.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => playAlarmSound(snd.id)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 font-mono text-xs hover:bg-indigo-600/50 flex items-center gap-1.5 transition-all"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Play</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Voice Motivation Quotes Preview */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-primary-400" />
                  <span>Voice Motivation Broadcasts</span>
                </h3>
                <span className="text-[10px] font-mono text-primary-300">
                  Solo Leveling Quotes
                </span>
              </div>
              <div className="space-y-2">
                {HUNTER_VOICE_MESSAGES.slice(0, 3).map((vm) => (
                  <div
                    key={vm.id}
                    className="p-3 rounded-2xl glass border border-white/5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-primary-400" />
                        <span className="text-xs font-mono font-bold text-primary-300">
                          {vm.speaker} · {vm.title}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          speakHunterMotivation(vm, {
                            playFanfareFirst: true,
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-primary-500/20 border border-primary-500/30 text-primary-200 font-mono text-[11px] hover:bg-primary-500/30 flex items-center gap-1"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Speak</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 font-display italic">
                      "{vm.text}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Browser Permission Prompt */}
            <div className="glass rounded-2xl p-4 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider block">
                    Background Alarms (Desktop)
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono block">
                    Permission: {browserPermission}
                  </span>
                </div>
                {browserPermission !== 'granted' && (
                  <button
                    type="button"
                    onClick={requestBrowserPermission}
                    className="px-3 py-1.5 rounded-xl bg-primary-500/20 border border-primary-500/40 text-primary-200 font-mono text-xs hover:bg-primary-500/30 transition-colors flex items-center gap-1"
                  >
                    <Bell className="w-3 h-3" />
                    <span>Authorize</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Done / Save Button */}
        <div className="pt-5 mt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="w-full py-3 rounded-2xl gradient-mixed font-display font-bold text-xs uppercase tracking-wider text-white shadow-lg shadow-primary-500/20 hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Save Alarm Protocols</span>
          </button>
        </div>
      </div>
    </div>
  );
}
