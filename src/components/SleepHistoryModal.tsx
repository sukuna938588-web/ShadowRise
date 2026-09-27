import { useState, useMemo } from 'react';
import {
  Moon,
  X,
  Clock,
  Trash2,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { SleepSession } from '@/types';

interface SleepHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sleepHistory: SleepSession[];
  onClearHistory?: () => void;
  onSelectSession?: (session: SleepSession) => void;
}

export function SleepHistoryModal({
  isOpen,
  onClose,
  sleepHistory,
  onClearHistory,
  onSelectSession,
}: SleepHistoryModalProps) {
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Compute summary metrics
  const metrics = useMemo(() => {
    if (!sleepHistory || sleepHistory.length === 0) {
      return { totalSessions: 0, avgRecovery: 0, avgDurText: '0h 0m' };
    }
    const totalSessions = sleepHistory.length;
    const avgRecovery = Math.round(
      sleepHistory.reduce((acc, s) => acc + (s.recoveryScore || 0), 0) / totalSessions
    );
    const totalMinutes = sleepHistory.reduce(
      (acc, s) => acc + (s.durationMinutes || Math.round((s.durationHours || 0) * 60)),
      0
    );
    const avgMins = Math.round(totalMinutes / totalSessions);
    const hrs = Math.floor(avgMins / 60);
    const mins = avgMins % 60;
    const avgDurText = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

    return { totalSessions, avgRecovery, avgDurText };
  }, [sleepHistory]);

  if (!isOpen) return null;

  const formatClock = (isoString?: string) => {
    if (!isoString) return '--:--';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '--:--';
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none animate-fade-in overflow-y-auto">
      {/* Abyssal Backdrop Overlay with Strong Blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#030308]/90 backdrop-blur-xl transition-opacity cursor-pointer"
        aria-label="Close sleep history overlay"
      />

      {/* Main Modal Card */}
      <div className="relative z-10 w-full max-w-[95vw] sm:max-w-lg my-auto max-h-[90vh] sm:max-h-[85vh] bg-[#0c091f]/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-primary-500/35 shadow-[0_0_50px_rgba(139,92,246,0.25),0_20px_50px_rgba(0,0,0,0.95)] flex flex-col space-y-3.5 sm:space-y-4 overflow-hidden animate-scale-in">
        {/* Subtle Ambient Top Glow */}
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-25 bg-primary-600"
          aria-hidden="true"
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10 relative">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-950/90 border border-primary-500/40 flex items-center justify-center text-primary-300 shadow-[0_0_12px_rgba(139,92,246,0.3)]">
              <Moon className="w-4 h-4 text-primary-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-base sm:text-lg uppercase tracking-wider text-slate-50">
                  Sleep History Archive
                </h3>
                {sleepHistory.length > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300 border border-primary-400/30 font-semibold">
                    {sleepHistory.length} Logs
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-slate-300">
                Permanent chronological record of hunter sleep sessions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-base-900/90 hover:bg-base-800 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer shadow-sm"
            title="Close Archive"
            aria-label="Close Sleep History Archive"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hunter Sleep Stats Snapshot Banner */}
        {sleepHistory.length > 0 && (
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#0f0f1c]/95 border border-primary-500/25 text-center shadow-md">
            <div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Total Logs</div>
              <div className="text-base font-display font-black text-slate-100 mt-0.5">
                {metrics.totalSessions}
              </div>
            </div>
            <div className="border-x border-white/10">
              <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Avg Recovery</div>
              <div className="text-base font-display font-black text-emerald-400 mt-0.5">
                {metrics.avgRecovery}%
              </div>
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Avg Rest</div>
              <div className="text-base font-display font-black text-primary-300 mt-0.5">
                {metrics.avgDurText}
              </div>
            </div>
          </div>
        )}

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[50vh] sm:max-h-[52vh] overscroll-contain">
          {sleepHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-300 font-mono text-xs space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-primary-950/60 border border-primary-500/20 flex items-center justify-center mx-auto text-primary-400 shadow-inner">
                <Moon className="w-6 h-6" />
              </div>
              <p className="text-sm font-display font-bold text-slate-200">No recorded sleep sessions yet</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Press <span className="text-primary-300 font-bold">[ Sleep ]</span> before resting to begin tracking your vital regeneration.
              </p>
            </div>
          ) : (
            sleepHistory.map((s) => {
              const totalMins = s.durationMinutes || Math.round(s.durationHours * 60);
              const hrs = Math.floor(totalMins / 60);
              const mins = totalMins % 60;
              const durText = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

              const isApex = s.recoveryScore >= 90;
              const isHigh = s.recoveryScore >= 75 && !isApex;
              const isModerate = s.recoveryScore >= 50 && !isHigh && !isApex;

              // High-contrast color tuning
              const scoreColor = isApex
                ? '#fbbf24' // gold
                : isHigh
                ? '#34d399' // emerald
                : isModerate
                ? '#60a5fa' // sky
                : '#f87171'; // rose

              const scoreLabel = isApex
                ? 'Apex'
                : isHigh
                ? 'High'
                : isModerate
                ? 'Fair'
                : 'Low';

              const cleanStatus = s.energyStatus?.split('·')[0]?.trim() || s.sleepQualityLabel || 'Recovery';

              return (
                <div
                  key={s.id}
                  onClick={() => onSelectSession?.(s)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectSession?.(s);
                    }
                  }}
                  className="glass-dark-card p-3 sm:p-3.5 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 group active:scale-[0.99]"
                  style={{
                    background: 'rgba(15, 15, 25, 0.85)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(139, 92, 246, 0.25)',
                    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.6), 0 0 12px rgba(139, 92, 246, 0.14)',
                  }}
                  title="Click to view detailed Hunter Recovery Report"
                >
                  {/* Left Column: Recovery Score Badge + Session Timestamps */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* High-Contrast Recovery Score Emblem */}
                    <div
                      className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform"
                      style={{
                        background: `${scoreColor}22`,
                        border: `1.5px solid ${scoreColor}66`,
                        color: scoreColor,
                        boxShadow: `0 0 12px ${scoreColor}25`,
                      }}
                    >
                      <span className="font-display font-black text-sm sm:text-base leading-none">
                        {s.recoveryScore}%
                      </span>
                      <span className="text-[8px] font-mono font-bold tracking-widest uppercase mt-0.5 opacity-90">
                        {scoreLabel}
                      </span>
                    </div>

                    {/* Middle Info: Sleep Duration, Date & Clock Interval */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-extrabold text-sm sm:text-base text-white tracking-wide">
                          {durText}
                        </span>
                        <span className="text-xs font-mono text-slate-300 font-medium">
                          · {formatDate(s.endTime)}
                        </span>
                      </div>

                      {/* Clock Range */}
                      <div className="text-xs font-mono text-slate-300 flex items-center gap-1.5 mt-1">
                        <Clock className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                        <span className="tracking-tight">
                          {formatClock(s.startTime)} → {formatClock(s.endTime)}
                        </span>
                      </div>

                      {/* Status Descriptor */}
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] font-mono text-primary-300 font-medium">
                        <Sparkles className="w-3 h-3 text-primary-400 shrink-0" />
                        <span className="truncate max-w-[130px] sm:max-w-[170px]">{cleanStatus}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: XP Reward Badge & View Details Indicator */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right flex flex-col items-end gap-1">
                      {/* High-Contrast XP Pill */}
                      <span className="text-xs font-mono font-bold text-amber-300 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/40 shadow-[0_0_8px_rgba(251,191,36,0.25)] flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>+{s.xpEarned} XP</span>
                      </span>

                      <span className="text-[10px] font-mono text-slate-400 group-hover:text-primary-300 transition-colors">
                        View Report
                      </span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-purple-400/50 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Clear Option */}
        {sleepHistory.length > 0 && onClearHistory && (
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400 relative">
            <span className="text-[11px] text-slate-400">
              {sleepHistory.length} {sleepHistory.length === 1 ? 'Session' : 'Sessions'} Logged
            </span>

            {!showConfirmClear ? (
              <button
                type="button"
                onClick={() => setShowConfirmClear(true)}
                className="text-slate-400 hover:text-red-400 flex items-center gap-1.5 transition-colors text-xs font-medium cursor-pointer py-1 px-2 rounded-lg hover:bg-red-500/10"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-400" />
                <span>Clear Archive</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-red-950/50 border border-red-500/40 px-2.5 py-1 rounded-xl">
                <span className="text-red-300 text-[11px] font-semibold">Delete all?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClearHistory();
                    setShowConfirmClear(false);
                  }}
                  className="text-red-400 hover:text-red-300 font-bold text-xs underline cursor-pointer"
                >
                  Yes, Clear
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmClear(false)}
                  className="text-slate-300 hover:text-white text-xs cursor-pointer ml-1"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
