import {
  Moon,
  Sun,
  Zap,
  Sparkles,
  CheckCircle2,
  Clock,
  HeartPulse,
  Flame,
  X,
} from 'lucide-react';
import type { SleepSession } from '@/types';

interface HunterRecoveryReportModalProps {
  report: SleepSession | null;
  onClose: () => void;
}

export function HunterRecoveryReportModal({
  report,
  onClose,
}: HunterRecoveryReportModalProps) {
  if (!report) return null;

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

  // Humanize duration hours & minutes
  const totalMins = report.durationMinutes || Math.round(report.durationHours * 60);
  const displayHours = Math.floor(totalMins / 60);
  const displayMins = totalMins % 60;
  const durationText = displayHours > 0 ? `${displayHours}h ${displayMins}m` : `${displayMins}m`;

  // Dynamic theme colors based on recovery grade
  const isApex = report.recoveryScore >= 90;
  const isHigh = report.recoveryScore >= 75 && !isApex;
  const isModerate = report.recoveryScore >= 60 && !isHigh && !isApex;

  const themeColor = isApex ? '#fbbf24' : isHigh ? '#34d399' : isModerate ? '#60a5fa' : '#f87171';
  const themeGlow = isApex
    ? 'rgba(251, 191, 36, 0.5)'
    : isHigh
    ? 'rgba(52, 211, 153, 0.5)'
    : isModerate
    ? 'rgba(96, 165, 250, 0.5)'
    : 'rgba(248, 113, 113, 0.5)';

  const ringProgress = Math.min(100, Math.max(0, report.recoveryScore));
  const strokeDashoffset = 2 * Math.PI * 34 - (ringProgress / 100) * 2 * Math.PI * 34;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 select-none animate-fade-in overflow-y-auto">
      {/* Abyssal Backdrop with High Opacity & 2xl Blur to eliminate background distractions */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 sm:bg-[#030308]/92 backdrop-blur-2xl transition-opacity cursor-pointer"
        aria-label="Close modal overlay"
      />

      {/* Main Report Card - Compact size reduced by 15-20%, Dark Glass with 2xl Blur & Subtle Purple Glow */}
      <div className="relative z-10 w-full max-w-[325px] sm:max-w-[340px] my-auto max-h-[calc(100dvh-1.5rem)] bg-[#0a0718]/95 sm:bg-[#080515]/96 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-3.5 sm:p-4.5 border border-primary-500/40 shadow-[0_0_40px_rgba(147,51,234,0.3),0_20px_50px_rgba(0,0,0,0.95)] animate-scale-in text-center space-y-2.5 sm:space-y-3 overflow-y-auto overscroll-contain">
        {/* Subtle Ambient Purple Glow Aura */}
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-25"
          style={{ background: themeGlow }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-base-900/90 hover:bg-base-800 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer shadow-sm z-20"
          title="Close Report"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* System Header Directive */}
        <div className="space-y-0.5 pt-0.5">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-primary-500/50 bg-primary-950/80 shadow-md">
            <Zap className="w-3 h-3 text-warning-400 animate-pulse" />
            <span className="text-[9px] font-mono tracking-[0.18em] uppercase font-bold text-primary-300">
              SYSTEM DIRECTIVE · RECOVERY
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-display font-black text-slate-100 uppercase tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Hunter Recovery Report
          </h2>
          <p className="text-[10px] font-mono text-slate-300">
            {formatDate(report.endTime)} · Vitality Restoration Completed
          </p>
        </div>

        {/* Circular Recovery Gauge - Reduced size */}
        <div className="relative w-20 h-20 sm:w-22 sm:h-22 mx-auto flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="5"
            />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke={themeColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 34}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 1.4s ease-out',
                filter: `drop-shadow(0 0 6px ${themeGlow})`,
              }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-2xl font-display font-black tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              style={{ color: themeColor }}
            >
              {report.recoveryScore}%
            </span>
            <span className="text-[8px] font-mono uppercase tracking-wider text-slate-300 font-semibold">
              Recovery
            </span>
          </div>
        </div>

        {/* Energy Status Appraisal Badge with dark glass background */}
        <div
          className="p-2 sm:p-2.5 rounded-xl bg-[#120c24]/90 backdrop-blur-md border flex items-center gap-2.5 text-left shadow-md"
          style={{ borderColor: `${themeColor}50` }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/10"
            style={{ background: `${themeColor}25`, color: themeColor }}
          >
            <HeartPulse className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[9px] font-mono uppercase tracking-wider text-slate-300 font-bold">
              Energy Status
            </div>
            <div className="text-xs sm:text-sm font-display font-bold text-white truncate drop-shadow-sm">
              {report.energyStatus}
            </div>
            <div className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span className="truncate">{report.sleepQualityLabel}</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid: Duration, Bedtime & Wake Time */}
        <div className="grid grid-cols-2 gap-2 text-left">
          <div className="bg-[#120c24]/90 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-purple-500/20 shadow-sm">
            <div className="flex items-center gap-1 text-[9px] font-mono text-slate-300 uppercase font-bold">
              <Clock className="w-3 h-3 text-primary-400 shrink-0" />
              <span className="truncate">Sleep Duration</span>
            </div>
            <div className="text-sm sm:text-base font-display font-bold text-white mt-0.5">
              {durationText}
            </div>
            <div className="text-[9px] font-mono text-slate-400 font-medium">
              {report.durationHours.toFixed(1)} decimal hrs
            </div>
          </div>

          <div className="bg-[#120c24]/90 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-purple-500/20 shadow-sm">
            <div className="flex items-center gap-1 text-[9px] font-mono text-slate-300 uppercase font-bold">
              <Sparkles className="w-3 h-3 text-warning-400 shrink-0" />
              <span className="truncate">XP Reward</span>
            </div>
            <div className="text-sm sm:text-base font-display font-bold text-warning-300 mt-0.5 flex items-center gap-1">
              <span>{report.xpEarned > 0 ? `+${report.xpEarned} XP` : '0 XP'}</span>
            </div>
            <div className="text-[9px] font-mono text-slate-400 font-medium">
              {report.xpEarned > 0 ? 'Discipline Directive' : 'Insufficient Rest'}
            </div>
          </div>
        </div>

        {/* Sleep Timeline Details */}
        <div className="bg-[#120c24]/90 backdrop-blur-md rounded-xl p-2 border border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-200 shadow-sm">
          <div className="flex items-center gap-1.5">
            <Moon className="w-3 h-3 text-primary-400" />
            <span>Slept: <strong className="text-white">{formatClock(report.startTime)}</strong></span>
          </div>
          <span className="text-purple-400 font-bold">→</span>
          <div className="flex items-center gap-1.5">
            <Sun className="w-3 h-3 text-amber-400" />
            <span>Woke: <strong className="text-white">{formatClock(report.endTime)}</strong></span>
          </div>
        </div>

        {/* Solo Leveling Monarch Quote */}
        <div className="p-2 rounded-lg bg-purple-950/40 border border-primary-500/30 text-[10px] font-mono text-primary-200 font-medium italic leading-snug">
          {report.recoveryScore > 0
            ? '"[SYSTEM: Biological and shadow mana structures have stabilized. Enter the arena at peak combat capacity.]"'
            : '"[SYSTEM: Sleep protocol terminated prematurely. Insufficient elapsed rest time — 0 XP awarded.]"'}
        </div>

        {/* Action Button: Acknowledge & Arise - Always accessible */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-[11px] sm:text-xs uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(168,85,247,0.45)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[42px] sm:min-h-[44px]"
        >
          <Flame className="w-3.5 h-3.5 text-warning-300" />
          <span>Acknowledge & Arise</span>
        </button>
      </div>
    </div>
  );
}
