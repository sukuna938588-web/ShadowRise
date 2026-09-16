import {
  Vibrate,
  Trash2,
  Edit2,
  Sparkles,
  Play,
  Square,
} from 'lucide-react';
import type { ShadowAlarm, DayOfWeek } from '@/types';
import { playAlarmSound } from '@/utils/audioEffects';
import { useState } from 'react';

interface AlarmCardProps {
  alarm: ShadowAlarm;
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (alarm: ShadowAlarm) => void;
  onDelete: (id: string) => void;
  onTestTrigger: (alarm: ShadowAlarm) => void;
}

const DAYS_SHORT: { key: DayOfWeek; label: string }[] = [
  { key: 'Mon', label: 'M' },
  { key: 'Tue', label: 'T' },
  { key: 'Wed', label: 'W' },
  { key: 'Thu', label: 'T' },
  { key: 'Fri', label: 'F' },
  { key: 'Sat', label: 'S' },
  { key: 'Sun', label: 'S' },
];

export function AlarmCard({
  alarm,
  onToggle,
  onEdit,
  onDelete,
  onTestTrigger,
}: AlarmCardProps) {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingPreview) {
      setIsPlayingPreview(false);
      return;
    }

    if (alarm.soundType === 'custom' && alarm.customSoundData) {
      const audio = new Audio(alarm.customSoundData);
      audio.volume = alarm.volume ?? 0.8;
      audio.onended = () => setIsPlayingPreview(false);
      audio.play().catch(() => setIsPlayingPreview(false));
      setIsPlayingPreview(true);
      setTimeout(() => {
        audio.pause();
        setIsPlayingPreview(false);
      }, 3000);
    } else {
      setIsPlayingPreview(true);
      playAlarmSound(alarm.builtinSound || 'system_bell', (alarm.volume ?? 0.8) * 0.25);
      setTimeout(() => setIsPlayingPreview(false), 2000);
    }
  };

  return (
    <div
      onClick={() => onEdit(alarm)}
      className={`glass-strong rounded-3xl p-4 sm:p-5 relative overflow-hidden border transition-all cursor-pointer group ${
        alarm.enabled
          ? 'border-primary-500/40 shadow-[0_0_25px_rgba(139,92,246,0.18)] hover:border-primary-400'
          : 'border-white/5 opacity-65 hover:opacity-90'
      }`}
    >
      {/* Background ambient lighting when active */}
      {alarm.enabled && (
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-primary-500/10 blur-2xl pointer-events-none" />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Time & AM/PM */}
          <div className="flex items-baseline gap-2 mb-1">
            <span
              className={`font-display font-black text-3xl sm:text-4xl tracking-tight transition-colors ${
                alarm.enabled
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-primary-200'
                  : 'text-slate-400'
              }`}
            >
              {alarm.time}
            </span>

            <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary-400">
              {alarm.repeat === 'daily'
                ? 'Daily'
                : alarm.repeat === 'weekdays'
                ? 'Weekdays'
                : alarm.repeat === 'once'
                ? 'Once'
                : 'Custom'}
            </span>
          </div>

          {/* Alarm Title */}
          <h3
            className={`font-display font-bold text-sm sm:text-base truncate mb-3 ${
              alarm.enabled ? 'text-slate-100' : 'text-slate-400'
            }`}
          >
            {alarm.title}
          </h3>

          {/* Day Indicators */}
          <div className="flex items-center gap-1 mb-3">
            {DAYS_SHORT.map((d) => {
              const isActive = alarm.days.includes(d.key);
              return (
                <span
                  key={d.key}
                  className={`w-6 h-6 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center border transition-all ${
                    isActive && alarm.enabled
                      ? 'bg-primary-500/30 border-primary-400 text-white shadow-sm'
                      : isActive
                      ? 'bg-white/5 border-white/10 text-slate-300'
                      : 'border-transparent text-slate-600'
                  }`}
                >
                  {d.label}
                </span>
              );
            })}
          </div>

          {/* Sound & Vibration Meta Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePreview}
              className="px-2.5 py-1 rounded-lg glass border border-white/10 text-[10px] font-mono text-primary-300 flex items-center gap-1.5 hover:border-primary-400 transition-colors"
              title="Preview alarm sound"
            >
              {isPlayingPreview ? (
                <Square className="w-2.5 h-2.5 fill-current text-warning-400" />
              ) : (
                <Play className="w-2.5 h-2.5 fill-current" />
              )}
              <span className="truncate max-w-[120px]">
                {alarm.soundType === 'custom'
                  ? alarm.customSoundName || 'Custom MP3'
                  : alarm.builtinSound.replace(/_/g, ' ')}
              </span>
            </button>

            {alarm.vibration && (
              <span className="px-2 py-1 rounded-lg glass border border-white/10 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Vibrate className="w-3 h-3 text-primary-400" />
                <span>Vibrate</span>
              </span>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTestTrigger(alarm);
              }}
              className="px-2 py-1 rounded-lg glass border border-primary-500/20 text-[10px] font-mono text-warning-300 hover:text-warning-200 flex items-center gap-1 transition-colors"
              title="Test this alarm right now"
            >
              <Sparkles className="w-3 h-3 text-warning-400" />
              <span>Test Ring</span>
            </button>
          </div>
        </div>

        {/* Right Column: Toggle Switch & Actions */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          {/* Main Enable/Disable Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(alarm.id, !alarm.enabled);
            }}
            className={`w-12 h-7 rounded-full p-1 transition-all duration-300 relative flex items-center ${
              alarm.enabled
                ? 'bg-gradient-to-r from-primary-600 to-indigo-600 shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                : 'bg-slate-800'
            }`}
            aria-label={alarm.enabled ? 'Disable alarm' : 'Enable alarm'}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                alarm.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>

          {/* Edit & Delete Buttons */}
          <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(alarm);
              }}
              className="p-1.5 rounded-lg glass border border-white/10 text-slate-400 hover:text-white transition-colors"
              title="Edit alarm"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete alarm "${alarm.title}"?`)) {
                  onDelete(alarm.id);
                }
              }}
              className="p-1.5 rounded-lg glass border border-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
              title="Delete alarm"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
