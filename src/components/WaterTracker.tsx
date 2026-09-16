import { Droplets, Plus, Minus, Bell, BellOff } from 'lucide-react';
import type { WaterIntake, WaterReminderSettings } from '@/types';

interface WaterTrackerProps {
  water: WaterIntake;
  onAdd: (amountMl: number) => void;
  reminderSettings?: WaterReminderSettings;
  onOpenReminderSettings?: () => void;
}

const quickAddAmounts = [250, 500];

export function WaterTracker({
  water,
  onAdd,
  reminderSettings,
  onOpenReminderSettings,
}: WaterTrackerProps) {
  const percentage = Math.min(Math.round((water.amountMl / water.goalMl) * 100), 100);
  const liters = (water.amountMl / 1000).toFixed(2);
  const goalLiters = (water.goalMl / 1000).toFixed(1);

  return (
    <div className="glass-strong rounded-2xl p-5 space-y-4 animate-slide-up stagger-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-secondary-500/15 border border-secondary-500/30 flex items-center justify-center">
            <Droplets className="w-4 h-4 text-secondary-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-200">
                Water Tracker
              </h3>
              {onOpenReminderSettings && (
                <button
                  type="button"
                  onClick={onOpenReminderSettings}
                  className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono flex items-center gap-1 border transition-colors ${
                    reminderSettings?.enabled
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200'
                  }`}
                  title="Configure Water Reminders"
                >
                  {reminderSettings?.enabled ? (
                    <>
                      <Bell className="w-2.5 h-2.5 text-blue-400" />
                      <span>{reminderSettings.intervalMinutes}m</span>
                    </>
                  ) : (
                    <>
                      <BellOff className="w-2.5 h-2.5" />
                      <span>Off</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <p className="text-[10px] font-mono text-slate-500">Daily hydration goal</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-display font-bold text-secondary-300">{percentage}%</p>
          <p className="text-[10px] font-mono text-slate-500">{liters}L / {goalLiters}L</p>
        </div>
      </div>

      {/* Circular progress + bar */}
      <div className="flex items-center gap-4">
        {/* Circular percentage */}
        <div className="relative w-16 h-16 shrink-0">
          <svg className="absolute inset-0 -rotate-90" width={64} height={64}>
            <circle cx={32} cy={32} r={26} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
            <circle
              cx={32}
              cy={32}
              r={26}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 26}
              strokeDashoffset={2 * Math.PI * 26 - (percentage / 100) * 2 * Math.PI * 26}
              style={{
                transition: 'stroke-dashoffset 1.2s ease-out',
                filter: 'drop-shadow(0 0 4px rgba(59,130,246,0.5))',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Droplets className="w-5 h-5 text-secondary-400" />
          </div>
        </div>

        {/* Linear bar */}
        <div className="flex-1">
          <div className="relative h-6 rounded-full overflow-hidden bg-base-700/80 border border-white/5">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${percentage}%`,
                background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)',
                boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)',
              }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s linear infinite',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick add buttons */}
      <div className="flex items-center gap-2">
        {quickAddAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => onAdd(amount)}
            className="flex-1 glass rounded-xl py-2.5 flex items-center justify-center gap-1.5 text-xs font-mono uppercase tracking-wider text-secondary-300 hover:border-secondary-400/40 hover:bg-secondary-500/10 transition-all duration-300 active:scale-95"
          >
            <Plus className="w-3 h-3" />
            {amount}ml
          </button>
        ))}
        <button
          onClick={() => onAdd(-250)}
          className="glass rounded-xl px-3 py-2.5 flex items-center justify-center text-slate-400 hover:border-error-500/30 hover:text-error-400 transition-all duration-300 active:scale-95"
        >
          <Minus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
