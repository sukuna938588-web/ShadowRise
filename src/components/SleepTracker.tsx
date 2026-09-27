import { useState } from 'react';
import { Moon, Sun, Plus, Star, History } from 'lucide-react';
import type { HealthMetrics, SleepSession } from '@/types';

interface SleepTrackerProps {
  health: HealthMetrics;
  onLogSleep: (hours: number) => void;
  sleepStartTime?: string | null;
  latestSession?: SleepSession | null;
  onOpenHistory?: () => void;
  onStartSleep?: () => void;
  onWakeUp?: () => void;
}

export function SleepTracker({
  health,
  onLogSleep,
  sleepStartTime,
  latestSession,
  onOpenHistory,
  onStartSleep,
  onWakeUp,
}: SleepTrackerProps) {
  const [showInput, setShowInput] = useState(false);
  const safeSleepHours = typeof health?.sleepHours === 'number' && !Number.isNaN(health.sleepHours)
    ? Math.max(0, health.sleepHours)
    : 0;
  const [hours, setHours] = useState(safeSleepHours || 7.5);

  const quality = typeof health?.sleepQuality === 'number' && !Number.isNaN(health.sleepQuality)
    ? Math.max(0, health.sleepQuality)
    : 0;
  const qualityLabel = quality >= 80 ? 'Excellent' : quality >= 60 ? 'Good' : quality >= 40 ? 'Fair' : 'Poor';
  const sleepProgress = Math.min((safeSleepHours / 8) * 100, 100);

  const handleSubmit = () => {
    onLogSleep(hours);
    setShowInput(false);
  };

  const isSleeping = Boolean(sleepStartTime);

  return (
    <div className="glass-strong rounded-2xl p-5 space-y-4 animate-slide-up stagger-2 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center">
            <Moon className="w-4 h-4 text-primary-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-200">Sleep Tracker</h3>
              {isSleeping && (
                <span className="text-[9px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-primary-500/20 border border-primary-400/50 text-primary-300 font-bold animate-pulse">
                  Sleeping
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-slate-500">
              {latestSession
                ? `Last: ${latestSession.recoveryScore}% Recovery (${latestSession.durationHours}h)`
                : 'No sleep recorded today'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Sleep / Wake Up toggle button */}
          {!isSleeping ? (
            onStartSleep && (
              <button
                type="button"
                onClick={onStartSleep}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 border border-primary-500/40 text-primary-200 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_10px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95"
                title="Initiate Sleep Protocol"
                aria-label="Initiate Sleep Protocol"
              >
                <Moon className="w-3.5 h-3.5 text-primary-300" />
                <span>Sleep</span>
              </button>
            )
          ) : (
            onWakeUp && (
              <button
                type="button"
                onClick={onWakeUp}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/25 hover:bg-amber-500/35 border border-amber-400/60 text-amber-200 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.4)] animate-pulse hover:scale-105 active:scale-95"
                title="Wake Up & Calculate Recovery"
                aria-label="Wake Up & Calculate Recovery"
              >
                <Sun className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
                <span>Wake Up</span>
              </button>
            )
          )}

          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="p-1.5 glass rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Sleep History Archive"
              aria-label="Sleep History Archive"
            >
              <History className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowInput((v) => !v)}
            className="w-8 h-8 rounded-lg gradient-mixed flex items-center justify-center glow-primary hover:scale-110 transition-transform"
            title="Manual Sleep Adjust"
            aria-label="Manual Sleep Adjust"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>
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
            <span className="text-lg font-display font-bold text-primary-200">{safeSleepHours.toFixed(1)}</span>
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
            <span className="text-[10px] font-mono text-slate-500">HR: {health?.heartRate ?? 68} bpm</span>
          </div>
        </div>
      </div>
    </div>
  );
}
