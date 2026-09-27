import { useState } from 'react';
import {
  X,
  History,
  Sparkles,
  Flame,
  Dumbbell,
  CheckCircle2,
  Droplets,
  Moon,
  Scale,
  Zap,
} from 'lucide-react';
import type { XPHistoryItem } from '@/types';
import type { Rank } from '@/types';
import { rankConfig } from '@/data/initialData';

interface XPHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: XPHistoryItem[];
  totalXP: number;
  level: number;
  rank: Rank;
}

export function XPHistoryModal({
  isOpen,
  onClose,
  history,
  totalXP,
  level,
  rank,
}: XPHistoryModalProps) {
  const [filter, setFilter] = useState<'all' | 'workout' | 'quest' | 'vitality'>('all');

  if (!isOpen) return null;

  const rankInfo = rankConfig[rank] ?? rankConfig.E;

  const getActivityIcon = (activity: string) => {
    const act = activity.toLowerCase();
    if (act.includes('workout') || act.includes('exercise')) {
      return <Dumbbell className="w-3.5 h-3.5 text-rose-400" />;
    }
    if (act.includes('quest')) {
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    }
    if (act.includes('water') || act.includes('hydration')) {
      return <Droplets className="w-3.5 h-3.5 text-sky-400" />;
    }
    if (act.includes('sleep') || act.includes('recovery')) {
      return <Moon className="w-3.5 h-3.5 text-purple-400" />;
    }
    if (act.includes('weight')) {
      return <Scale className="w-3.5 h-3.5 text-amber-400" />;
    }
    if (act.includes('streak')) {
      return <Flame className="w-3.5 h-3.5 text-orange-400" />;
    }
    return <Sparkles className="w-3.5 h-3.5 text-warning-400" />;
  };

  const filteredHistory = history.filter((item) => {
    if (filter === 'all') return true;
    const act = item.activity.toLowerCase();
    if (filter === 'workout') return act.includes('workout') || act.includes('exercise');
    if (filter === 'quest') return act.includes('quest');
    if (filter === 'vitality') return act.includes('water') || act.includes('sleep') || act.includes('weight') || act.includes('streak');
    return true;
  });

  const formatDate = (isoOrDateStr: string) => {
    if (!isoOrDateStr) return '';
    try {
      const d = new Date(isoOrDateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoOrDateStr;
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-3 sm:p-4 select-none animate-fade-in overflow-y-auto">
      {/* Abyssal Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 sm:bg-[#030308]/92 backdrop-blur-2xl transition-opacity cursor-pointer"
        aria-label="Close modal overlay"
      />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-[360px] sm:max-w-md my-auto max-h-[calc(100dvh-2rem)] bg-[#0a0718]/95 sm:bg-[#080515]/96 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-primary-500/40 shadow-[0_0_50px_rgba(147,51,234,0.3),0_20px_50px_rgba(0,0,0,0.95)] animate-scale-in flex flex-col space-y-3 sm:space-y-4 overflow-hidden">
        {/* Subtle Ambient Purple Glow */}
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-25"
          style={{ background: rankInfo.glow }}
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-white/10 relative">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-950/80 border border-primary-500/40 flex items-center justify-center text-primary-300 shadow-inner">
              <History className="w-4 h-4 text-primary-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-black text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
                <span>XP Archive</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300 border border-primary-400/30">
                  {history.length} Logs
                </span>
              </h2>
              <p className="text-[10px] font-mono text-slate-400">
                Permanent Hunter Activity Record
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-base-900/90 hover:bg-base-800 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer shadow-sm"
            title="Close XP History"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Hunter Progression Snapshot Banner */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#120c24]/90 border border-purple-500/20 text-center shadow-md">
          <div>
            <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Total XP</div>
            <div className="text-base font-display font-black text-amber-300 mt-0.5">
              {totalXP.toLocaleString()}
            </div>
          </div>
          <div className="border-x border-white/10">
            <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Level</div>
            <div className="text-base font-display font-black text-primary-300 mt-0.5">
              Lvl {level}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Rank</div>
            <div
              className="text-base font-display font-black mt-0.5"
              style={{ color: rankInfo.color }}
            >
              {rank} Rank
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {(['all', 'workout', 'quest', 'vitality'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                filter === tab
                  ? 'bg-primary-500/30 text-primary-200 border border-primary-400/50 shadow-sm'
                  : 'bg-base-900/60 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {tab === 'vitality' ? 'Water/Sleep/Streak' : tab}
            </button>
          ))}
        </div>

        {/* Scrollable History List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[320px] overscroll-contain">
          {filteredHistory.length === 0 ? (
            <div className="py-8 text-center text-slate-400 space-y-1">
              <History className="w-8 h-8 mx-auto text-slate-600 mb-1" />
              <p className="text-xs font-mono">No XP records found in this category.</p>
              <p className="text-[10px] font-mono text-slate-500">
                Complete workouts, daily quests, and sleep tracking to earn XP!
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#120c24]/90 hover:bg-[#181130] border border-white/5 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-base-900/90 border border-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                    {getActivityIcon(item.activity)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-display font-bold text-slate-100 truncate">
                      {item.activity}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400">
                      {formatDate(item.timestamp || item.date)}
                      {item.timestamp ? ` · ${formatTime(item.timestamp)}` : ''}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  <span className="font-display font-black text-xs sm:text-sm text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]">
                    +{item.xpEarned} XP
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info directive */}
        <div className="pt-1 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-warning-400" />
            <span>Real XP-based progression</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-primary-300 hover:text-primary-100 uppercase tracking-wider font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
