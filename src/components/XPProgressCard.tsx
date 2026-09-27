import { useState, useEffect } from 'react';
import { Sparkles, History, Zap, ArrowUpRight } from 'lucide-react';
import { rankConfig } from '@/data/initialData';
import { getProgressionDetails } from '@/utils/progression';

interface XPProgressCardProps {
  totalXP: number;
  onOpenHistory?: () => void;
  onOpenRankCinematic?: () => void;
}

export function XPProgressCard({
  totalXP,
  onOpenHistory,
  onOpenRankCinematic,
}: XPProgressCardProps) {
  const details = getProgressionDetails(totalXP);
  const {
    level,
    rank,
    nextLevelThreshold,
    remainingXPNeeded,
    levelProgressPercent,
    nextRank,
    xpNeededForNextRank,
  } = details;

  const rankInfo = rankConfig[rank] ?? rankConfig.E;
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercent(levelProgressPercent);
    }, 150);
    return () => clearTimeout(timer);
  }, [levelProgressPercent]);

  return (
    <div className="relative rounded-3xl p-5 bg-[#0a0718]/90 backdrop-blur-2xl border border-primary-500/40 shadow-[0_0_40px_rgba(147,51,234,0.25),0_15px_35px_rgba(0,0,0,0.8)] overflow-hidden animate-slide-up group">
      {/* Ambient Radial Background Glow */}
      <div
        className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-700 group-hover:opacity-45"
        style={{ background: rankInfo.glow }}
      />
      <div
        className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: 'rgba(168, 85, 247, 0.4)' }}
      />

      {/* Top Header Row */}
      <div className="relative flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary-950/80 border border-primary-500/40 flex items-center justify-center text-warning-400 shadow-inner">
            <Sparkles className="w-4 h-4 animate-spin-slow drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          </div>
          <div>
            <h3 className="font-display font-black text-sm uppercase tracking-widest text-slate-100 flex items-center gap-1.5">
              <span>Hunter Progress</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Shadow Authority System
            </span>
          </div>
        </div>

        {/* Right Action Icons: History & Cinematic */}
        <div className="flex items-center gap-1.5">
          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#140e2b]/90 hover:bg-primary-900/50 border border-primary-500/30 hover:border-primary-400/60 text-slate-300 hover:text-white transition-all text-[10px] font-mono font-bold tracking-wider cursor-pointer shadow-sm active:scale-95"
              title="Open XP History Archive"
              aria-label="Open XP History"
            >
              <History className="w-3 h-3 text-primary-400" />
              <span>History</span>
            </button>
          )}

          {onOpenRankCinematic && (
            <button
              type="button"
              onClick={onOpenRankCinematic}
              className="p-1 rounded-xl bg-[#140e2b]/90 hover:bg-primary-900/50 border border-primary-500/30 hover:border-primary-400/60 text-warning-400 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Rank Awakening Cinematic"
              aria-label="Rank Awakening Cinematic"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Stats Line: Level & Rank */}
      <div className="relative flex items-baseline justify-between mb-3 pt-1">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
            Rank & Level
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl sm:text-3xl font-display font-black text-slate-100 tracking-tight">
              Level {level}
            </span>
            <span
              className="px-2 py-0.5 rounded-full font-mono text-[10px] sm:text-xs font-black uppercase tracking-widest border shadow-sm"
              style={{
                backgroundColor: `${rankInfo.color}15`,
                color: rankInfo.color,
                borderColor: `${rankInfo.color}40`,
                boxShadow: `0 0 10px ${rankInfo.glow}`,
              }}
            >
              {rank} Rank
            </span>
          </div>
        </div>

        {/* Current XP / XP Required For Next Level */}
        <div className="text-right">
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
            Total XP Progress
          </span>
          <div className="text-sm sm:text-base font-mono font-bold text-slate-100 mt-0.5">
            <span className="text-amber-300 font-black">{totalXP.toLocaleString()}</span>
            <span className="text-slate-400 mx-1">/</span>
            <span className="text-slate-300">{nextLevelThreshold.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      {/* Premium Progress Bar */}
      <div className="relative mb-2.5">
        <div className="relative h-3.5 sm:h-4 rounded-full overflow-hidden bg-[#140e2b]/90 border border-white/10 shadow-inner">
          {/* Track Shimmer */}
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(168, 85, 247, 0.4) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s linear infinite',
            }}
          />

          {/* Animated Fill Bar */}
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${animatedPercent}%`,
              background: 'linear-gradient(90deg, #6d28d9 0%, #9333ea 50%, #c084fc 100%)',
              boxShadow: '0 0 18px rgba(168, 85, 247, 0.75), 0 0 35px rgba(147, 51, 234, 0.4)',
            }}
          >
            {/* Gloss Highlight */}
            <div
              className="absolute inset-0 rounded-full opacity-60"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 60%)',
              }}
            />
          </div>

          {/* Milestone markers */}
          {[25, 50, 75].map((pos) => (
            <div
              key={pos}
              className="absolute top-0 bottom-0 w-px bg-white/20 pointer-events-none"
              style={{ left: `${pos}%` }}
            />
          ))}
        </div>
      </div>

      {/* Footer Line: Remaining XP Needed */}
      <div className="relative flex items-center justify-between text-[11px] sm:text-xs font-mono text-slate-300 pt-0.5">
        <div className="flex items-center gap-1 text-primary-300 font-bold">
          <Zap className="w-3.5 h-3.5 text-warning-400 shrink-0" />
          <span>
            {remainingXPNeeded.toLocaleString()} XP Needed For Next Level
          </span>
        </div>

        <div className="text-[10px] text-slate-400 hidden sm:block">
          {nextRank && (
            <span>
              Next: <strong style={{ color: rankConfig[nextRank]?.color }}>{nextRank} Rank</strong> ({xpNeededForNextRank.toLocaleString()} XP)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
