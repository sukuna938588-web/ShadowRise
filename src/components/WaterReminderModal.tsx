import { useState, useEffect } from 'react';
import {
  Droplets,
  Bell,
  Volume2,
  VolumeX,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Play,
} from 'lucide-react';
import type { WaterReminderSettings } from '@/types';
import { ALARM_SOUND_OPTIONS, playAlarmSound } from '@/utils/audioEffects';

interface WaterReminderPopupProps {
  isOpen: boolean;
  currentWaterMl: number;
  goalWaterMl: number;
  onDrink250ml: () => void;
  onSnooze: (minutes?: number) => void;
  onDismiss: () => void;
}

export function WaterReminderPopup({
  isOpen,
  currentWaterMl,
  goalWaterMl,
  onDrink250ml,
  onSnooze,
  onDismiss,
}: WaterReminderPopupProps) {
  if (!isOpen) return null;

  const currentPercent = Math.min(100, Math.round((currentWaterMl / goalWaterMl) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="glass-strong border border-blue-500/30 rounded-3xl w-full max-w-sm p-6 relative overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.3)] animate-scale-in flex flex-col items-center text-center">
        {/* Ambient Water Glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-primary-500/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          aria-label="Dismiss water reminder"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Animated Chalice / Droplet Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/30 via-primary-500/20 to-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shadow-lg shadow-blue-500/20 mb-4 animate-bounce">
          <Droplets className="w-8 h-8 text-blue-300 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
        </div>

        {/* Badge & Title */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono uppercase tracking-widest text-blue-300 mb-2">
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span>Vitality Directive</span>
        </div>

        <h3 className="font-display font-bold text-xl uppercase tracking-wider text-slate-100 mb-1">
          Hydration Alert
        </h3>

        <p className="text-xs text-slate-300 font-mono mb-4 max-w-xs">
          Your mana reserves and cellular recovery require hydration. Consume water now to sustain
          peak combat status!
        </p>

        {/* Current Hydration Status Bar */}
        <div className="w-full glass rounded-2xl p-3 mb-5 border border-white/5">
          <div className="flex justify-between text-xs font-mono mb-1.5">
            <span className="text-slate-400">Daily Reservoir</span>
            <span className="text-blue-300 font-bold">
              {currentWaterMl} / {goalWaterMl} ml ({currentPercent}%)
            </span>
          </div>
          <div className="w-full h-2 bg-base-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${currentPercent}%` }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="w-full space-y-2">
          {/* Quick +250ml Drink */}
          <button
            type="button"
            onClick={onDrink250ml}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-primary-600 to-blue-500 text-white font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all"
          >
            <Droplets className="w-4 h-4 text-blue-200" />
            <span>Drink +250ml (+10 XP)</span>
          </button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onSnooze(15)}
              className="py-2.5 rounded-xl glass font-mono text-xs text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Snooze 15m</span>
            </button>

            <button
              type="button"
              onClick={onDismiss}
              className="py-2.5 rounded-xl glass font-mono text-xs text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <span>Dismiss</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface WaterReminderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: WaterReminderSettings;
  onUpdateSettings: (updates: Partial<WaterReminderSettings>) => void;
  onTriggerTestReminder: () => void;
}

export function WaterReminderSettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onTriggerTestReminder,
}: WaterReminderSettingsModalProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="glass-strong border border-white/10 rounded-3xl w-full max-w-md p-6 relative overflow-hidden shadow-2xl animate-scale-in">
        {/* Glow ambient */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm tracking-wider uppercase text-slate-100">
                Hydration Protocols
              </h2>
              <p className="text-[10px] font-mono text-slate-400">Automated Vitality Alarms</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Form */}
        <div className="space-y-4">
          {/* Main Toggle */}
          <div className="glass rounded-2xl p-4 flex items-center justify-between border border-white/5">
            <div className="space-y-0.5">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider block">
                Enable Water Reminders
              </span>
              <span className="text-[11px] text-slate-400 font-mono block">
                Receive scheduled chimes & directives
              </span>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ enabled: !settings.enabled })}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                settings.enabled ? 'bg-blue-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Interval Frequency */}
          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">
              Reminder Interval
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[30, 45, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => onUpdateSettings({ intervalMinutes: mins })}
                  className={`py-2 rounded-xl text-xs font-mono transition-all border ${
                    settings.intervalMinutes === mins
                      ? 'bg-blue-500/25 border-blue-400 text-blue-200 font-bold shadow-sm'
                      : 'glass border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Audio Chime Toggle & Sound Selector */}
          <div className="glass rounded-2xl p-4 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider block">
                  Water Chime Audio
                </span>
                <span className="text-[11px] text-slate-400 font-mono block">
                  Play harmonic alarm on hydration alert
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => playAlarmSound(settings.sound || 'crystal_droplets')}
                  className="px-2.5 py-1 rounded-lg glass text-[10px] font-mono text-blue-300 hover:text-blue-100 flex items-center gap-1 border border-blue-500/20"
                  title="Test audio chime"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Test</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                  className={`w-8 h-8 rounded-lg glass flex items-center justify-center transition-colors ${
                    settings.soundEnabled ? 'text-blue-300' : 'text-slate-500'
                  }`}
                >
                  {settings.soundEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Sound Selector */}
            {settings.soundEnabled && (
              <div className="pt-2 border-t border-white/5">
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">
                  Alarm Sound Tone
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {ALARM_SOUND_OPTIONS.map((snd) => {
                    const isSelected = (settings.sound || 'crystal_droplets') === snd.id;
                    return (
                      <div
                        key={snd.id}
                        onClick={() => {
                          onUpdateSettings({ sound: snd.id });
                          playAlarmSound(snd.id);
                        }}
                        className={`p-2 rounded-xl glass border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-blue-400/60 bg-blue-500/15'
                            : 'border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playAlarmSound(snd.id);
                            }}
                            className="w-6 h-6 rounded-md bg-base-950 border border-white/10 flex items-center justify-center text-blue-300 hover:text-white"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                          </button>
                          <span className="text-xs font-mono text-slate-200">{snd.name}</span>
                          <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-white/5 text-slate-400">
                            {snd.badge}
                          </span>
                        </div>
                        <div
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-blue-400 bg-blue-500' : 'border-slate-600'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Browser System Notifications */}
          <div className="glass rounded-2xl p-4 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider block">
                  Desktop Notifications
                </span>
                <span className="text-[11px] text-slate-400 font-mono block">
                  Alerts even when tab is backgrounded
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                  browserPermission === 'granted'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : browserPermission === 'denied'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {browserPermission}
              </span>
            </div>

            {browserPermission !== 'granted' && (
              <button
                type="button"
                onClick={requestBrowserPermission}
                className="w-full py-2 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-200 font-mono text-xs uppercase tracking-wider hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Enable Browser Alerts</span>
              </button>
            )}
          </div>

          {/* Test Trigger */}
          <button
            type="button"
            onClick={() => {
              onTriggerTestReminder();
              onClose();
            }}
            className="w-full py-3 rounded-xl glass border border-blue-500/30 text-blue-300 hover:text-white hover:bg-blue-500/15 font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>Test Water Reminder Now</span>
          </button>
        </div>

        {/* Done Button */}
        <div className="pt-5 mt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl gradient-mixed font-display font-bold text-xs uppercase tracking-wider text-white shadow-lg shadow-primary-500/20 hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Save Directives</span>
          </button>
        </div>
      </div>
    </div>
  );
}
