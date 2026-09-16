import { Dumbbell, Clock, X, Sparkles, Flame, ShieldAlert } from 'lucide-react';

interface WorkoutAlarmPopupProps {
  isOpen: boolean;
  alarmTime: string;
  onStartWorkout: () => void;
  onSnooze: (minutes?: number) => void;
  onDismiss: () => void;
}

export function WorkoutAlarmPopup({
  isOpen,
  alarmTime,
  onStartWorkout,
  onSnooze,
  onDismiss,
}: WorkoutAlarmPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="glass-strong border border-primary-500/40 rounded-3xl w-full max-w-sm p-6 relative overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.4)] animate-scale-in flex flex-col items-center text-center">
        {/* Ambient Red/Violet Gate Glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-primary-500/25 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          aria-label="Dismiss workout alarm"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Animated Dumbbell / Gate Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 via-primary-600 to-indigo-700 border-2 border-primary-400/50 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 mb-4 animate-bounce">
          <Flame className="w-8 h-8 text-rose-200 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
        </div>

        {/* Badge & Title */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/15 border border-primary-500/30 text-[10px] font-mono uppercase tracking-widest text-primary-300 mb-2">
          <Sparkles className="w-3 h-3 text-primary-400" />
          <span>Combat Training Directive</span>
        </div>

        <h3 className="font-display font-bold text-xl uppercase tracking-wider text-slate-100 mb-1">
          Dungeon Gate Open
        </h3>

        <p className="text-xs text-slate-300 font-mono mb-4 max-w-xs">
          Your scheduled daily training time (<span className="text-primary-300 font-bold">{alarmTime}</span>) has arrived! Enter the training zone now to surge your hunter level.
        </p>

        {/* Urgent Warning Ribbon */}
        <div className="w-full glass rounded-2xl p-3 mb-5 border border-rose-500/30 flex items-center gap-2 text-left">
          <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <p className="text-[11px] font-mono text-rose-200/90 leading-tight">
            Penalty zone averted upon training initiation. Log your sets and reps to claim your Hunter XP!
          </p>
        </div>

        {/* Actions */}
        <div className="w-full space-y-2">
          <button
            type="button"
            onClick={onStartWorkout}
            className="w-full py-3.5 rounded-2xl gradient-mixed font-display font-bold text-xs uppercase tracking-wider text-white shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all"
          >
            <Dumbbell className="w-4 h-4 text-primary-200" />
            <span>Enter Workout Logger (+XP)</span>
          </button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onSnooze(10)}
              className="py-2.5 rounded-xl glass font-mono text-xs text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Snooze 10m</span>
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
