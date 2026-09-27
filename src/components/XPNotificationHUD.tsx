import { useEffect, useState } from 'react';
import { Sparkles, Zap, X } from 'lucide-react';

export interface XPToast {
  id: string;
  amount: number;
  activity: string;
}

interface XPNotificationHUDProps {
  notifications: XPToast[];
  onDismiss: (id: string) => void;
}

export function XPNotificationHUD({ notifications, onDismiss }: XPNotificationHUDProps) {
  if (notifications.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 left-0 right-0 z-[70] flex flex-col items-center pointer-events-none px-4 space-y-2 select-none"
    >
      {notifications.map((toast) => (
        <SingleXPNotification key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

function SingleXPNotification({
  toast,
  onDismiss,
}: {
  toast: XPToast;
  onDismiss: () => void;
}) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      const dismissTimer = setTimeout(onDismiss, 350);
      return () => clearTimeout(dismissTimer);
    }, 3200);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`pointer-events-auto relative w-full max-w-[320px] rounded-2xl bg-[#0b0718]/95 backdrop-blur-2xl border border-primary-500/60 p-3 shadow-[0_0_30px_rgba(168,85,247,0.5),0_10px_25px_rgba(0,0,0,0.9)] flex items-center justify-between gap-3 transition-all duration-300 ${
        exiting ? 'opacity-0 -translate-y-3 scale-95' : 'animate-scale-in opacity-100 translate-y-0'
      }`}
    >
      {/* Ambient Purple Glow */}
      <div
        className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600/30 via-primary-500/40 to-purple-600/30 blur-md pointer-events-none"
        aria-hidden="true"
      />

      {/* Left Icon with radiant pulse */}
      <div className="relative w-10 h-10 rounded-xl bg-primary-950/90 border border-primary-500/50 flex items-center justify-center shrink-0 shadow-inner">
        <Sparkles className="w-5 h-5 text-warning-300 animate-spin-slow drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-400" />
        </span>
      </div>

      {/* Center Details */}
      <div className="relative min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-display font-black text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-purple-200 to-primary-300 drop-shadow-[0_2px_8px_rgba(168,85,247,0.6)]">
            +{toast.amount} XP
          </span>
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary-500/20 border border-primary-400/40 text-[9px] font-mono font-bold text-primary-300 uppercase tracking-wider">
            <Zap className="w-2.5 h-2.5 text-warning-400" />
            DIRECTIVE
          </span>
        </div>
        <p className="text-xs font-mono font-semibold text-slate-200 truncate">
          {toast.activity}
        </p>
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={() => {
          setExiting(true);
          setTimeout(onDismiss, 200);
        }}
        className="relative w-6 h-6 rounded-lg bg-base-900/80 hover:bg-base-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-white/10"
        title="Dismiss"
        aria-label="Dismiss XP notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
