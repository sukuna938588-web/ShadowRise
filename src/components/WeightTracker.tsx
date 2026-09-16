import { useState } from 'react';
import { Scale, Plus, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import type { WeightEntry } from '@/types';

interface WeightTrackerProps {
  weight: WeightEntry;
  trend: { current: number; previous: number };
  onLogWeight: (weightKg: number) => void;
}

export function WeightTracker({ weight, trend, onLogWeight }: WeightTrackerProps) {
  const [showInput, setShowInput] = useState(false);
  const [weightInput, setWeightInput] = useState(weight.weightKg);

  const diff = trend.current - trend.previous;
  const isLoss = diff < 0;
  const isGain = diff > 0;
  const absDiff = Math.abs(diff);

  const handleSubmit = () => {
    onLogWeight(weightInput);
    setShowInput(false);
  };

  return (
    <div className="glass-strong rounded-2xl p-5 space-y-4 animate-slide-up stagger-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-warning-500/15 border border-warning-500/30 flex items-center justify-center">
            <Scale className="w-4 h-4 text-warning-400" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-200">Weight & Health</h3>
            <p className="text-[10px] font-mono text-slate-500">Track your progress</p>
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
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Weight (kg)</span>
            <span className="text-lg font-display font-bold text-warning-400">{weightInput.toFixed(1)} kg</span>
          </div>
          <input
            type="range"
            min={30}
            max={150}
            step={0.1}
            value={weightInput}
            onChange={(e) => setWeightInput(Number(e.target.value))}
            className="w-full accent-warning-500"
          />
          <button
            onClick={handleSubmit}
            className="w-full py-2.5 rounded-xl gradient-mixed text-white text-xs font-mono uppercase tracking-wider glow-primary hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Log Weight
          </button>
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Current weight */}
        <div className="flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-display font-bold text-slate-100">{weight.weightKg.toFixed(1)}</span>
            <span className="text-sm font-mono text-slate-500">kg</span>
          </div>
          <p className="text-[10px] font-mono text-slate-500 mt-0.5">Current weight</p>
        </div>

        {/* Trend indicator */}
        <div className="flex flex-col items-end gap-1">
          {isLoss && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-success-500/15 border border-success-500/30">
              <TrendingDown className="w-3.5 h-3.5 text-success-400" />
              <span className="text-xs font-mono font-bold text-success-400">{absDiff.toFixed(1)} kg</span>
            </div>
          )}
          {isGain && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-500/15 border border-error-500/30">
              <TrendingUp className="w-3.5 h-3.5 text-error-400" />
              <span className="text-xs font-mono font-bold text-error-400">+{absDiff.toFixed(1)} kg</span>
            </div>
          )}
          {!isLoss && !isGain && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-500/15 border border-slate-500/30">
              <Minus className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-mono font-bold text-slate-400">No change</span>
            </div>
          )}
          <p className="text-[10px] font-mono text-slate-500">vs last entry</p>
        </div>
      </div>

      {/* Mini progress bar showing relative to a 80kg reference */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">BMI Range</span>
          <span className="text-[10px] font-mono text-slate-500">
            {weight.weightKg < 60 ? 'Underweight' : weight.weightKg < 80 ? 'Normal' : weight.weightKg < 100 ? 'Overweight' : 'Obese'}
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-base-700/80 relative">
          <div
            className="absolute top-0 bottom-0 w-1 rounded-full bg-warning-400 glow-primary"
            style={{
              left: `${Math.min(((weight.weightKg - 30) / 120) * 100, 100)}%`,
              boxShadow: '0 0 8px rgba(251,191,36,0.6)',
            }}
          />
          <div className="absolute inset-0 flex">
            <div className="flex-1 border-r border-base-900/30" style={{ background: 'rgba(96,165,250,0.08)' }} />
            <div className="flex-1 border-r border-base-900/30" style={{ background: 'rgba(52,211,153,0.08)' }} />
            <div className="flex-1 border-r border-base-900/30" style={{ background: 'rgba(251,191,36,0.08)' }} />
            <div className="flex-1" style={{ background: 'rgba(248,113,113,0.08)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
