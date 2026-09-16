import { useState } from 'react';
import { Moon, Plus, Star } from 'lucide-react';
import type { HealthMetrics } from '@/types';

interface SleepTrackerProps {
  health: HealthMetrics;
  onLogSleep: (hours: number) => void;
}

export function SleepTracker({ health, onLogSleep }: SleepTrackerProps) {
  const [showInput, setShowInput] = useState(false);
  const [hours, setHours] = useState(health.sleepHours);

  const quality = health.sleepQuality;
  const qualityLabel = quality >= 80 ? 'Excellent' : quality >= 60 ? 'Good' : quality >= 40 ? 'Fair' : 'Poor';
  const sleepProgress = Math.min((health.sleepHours / 8) * 100, 100);

  const handleSubmit = () => {
    onLogSleep(hours);
    setShowInput(false);
  };

  return (
    <div className="glass-strong rounded-2xl p-5 space-y-4 animate-slide-up stagger-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center">
            <Moon className="w-4 h-4 text-primary-300" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-200">Sleep Tracker</h3>
            <p className="text-[10px] font-mono text-slate-500">Last night's rest & quality</p>
          </div>
        </div>
        <button
          onClick={() => setShowInput((v) => !v)}
          className="w-8 h-8 rounded-lg gradient-mixed flex items-center justify-center glow-primary hover:scale-110 transition-transform"
        >
          <Plus className="w-4 h-4 text-white" />
        </button>
      </div>

      {showInput && (
        <div className="glass rounded-xl p-4 space-y-3 animate-scale-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Hours slept</span>
            <span className="text-lg font-display font-bold text-primary-300">{hours.toFixed(1)}h</span>
          </div>
          <input
            type="range"
            min={0}
            max={12}
            step={0.5}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full accent-primary-500"
          />
          <button
            onClick={handleSubmit}
            className="w-full py-2.5 rounded-xl gradient-mixed text-white text-xs font-mono uppercase tracking-wider glow-primary hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Log Sleep
          </button>
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Sleep hours circular */}
        <div className="relative w-20 h-20 shrink-0">
          <svg className="absolute inset-0 -rotate-90" width={80} height={80}>
            <circle cx={40} cy={40} r={34} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
            <circle
              cx={40}
              cy={40}
              r={34}
              fill="none"
              stroke="#c4b5fd"
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 34}
              strokeDashoffset={2 * Math.PI * 34 - (sleepProgress / 100) * 2 * Math.PI * 34}
              style={{
                transition: 'stroke-dashoffset 1.2s ease-out',
                filter: 'drop-shadow(0 0 4px rgba(196,181,253,0.5))',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-display font-bold text-primary-200">{health.sleepHours.toFixed(1)}</span>
            <span className="text-[9px] font-mono text-slate-500">hours</span>
          </div>
        </div>

        {/* Quality + details */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Star className="w-3 h-3 text-primary-300" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Quality</span>
            </div>
            <span className="text-sm font-mono font-bold" style={{ color: quality >= 80 ? '#34d399' : quality >= 60 ? '#60a5fa' : quality >= 40 ? '#fbbf24' : '#f87171' }}>
              {qualityLabel} · {quality}%
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-base-700/80">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${quality}%`,
                background: quality >= 80
                  ? 'linear-gradient(90deg, #059669 0%, #34d399 100%)'
                  : quality >= 60
                    ? 'linear-gradient(90deg, #7c3aed 0%, #c4b5fd 100%)'
                    : 'linear-gradient(90deg, #d97706 0%, #fbbf24 100%)',
                boxShadow: `0 0 8px ${quality >= 80 ? 'rgba(52,211,153,0.4)' : 'rgba(196,181,253,0.4)'}`,
              }}
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-slate-500">Goal: 8.0h</span>
            <span className="text-[10px] font-mono text-slate-500">HR: {health.heartRate} bpm</span>
          </div>
        </div>
      </div>
    </div>
  );
}
