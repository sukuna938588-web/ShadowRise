import { useEffect, useState } from 'react';
import { Moon, Sun, Sparkles } from 'lucide-react';

interface SleepFloatingButtonProps {
  sleepStartTime: string | null;
  onStartSleep: () => void;
  onWakeUp: () => void;
}

export function SleepFloatingButton({
  sleepStartTime,
  onStartSleep,
  onWakeUp,
}: SleepFloatingButtonProps) {
  const isSleeping = Boolean(sleepStartTime);
  const [elapsedText, setElapsedText] = useState('');

  // Live timer showing elapsed sleep duration if currently sleeping
  useEffect(() => {
    if (!sleepStartTime) {
      setElapsedText('');
      return;
    }

    const updateElapsed = () => {
      try {
        const start = new Date(sleepStartTime).getTime();
        const now = Date.now();
        const diffMs = Math.max(0, now - start);
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) {
          setElapsedText(`${hours}h ${minutes}m`);
        } else {
          setElapsedText(`${minutes}m`);
        }
      } catch {
        setElapsedText('');
      }
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 30000);
    return () => clearInterval(interval);
  }, [sleepStartTime]);

  return (
    <aside
      aria-label="Hunter Sleep Protocol"
      className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-40 select-none pointer-events-auto"
    >
      {/* Only show ONE button at a time: Sleep OR Wake Up */}
      {!isSleeping ? (
        /* Compact Floating Sleep Button (Before sleep starts) */
        <button
          type="button"
          onClick={onStartSleep}
          className="group relative flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-base-950/95 via-purple-950/95 to-base-950/95 border border-primary-500/60 hover:border-primary-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.5),0_0_35px_rgba(147,51,234,0.25),0_4px_16px_rgba(0,0,0,0.6)] hover:shadow-[0_0_28px_rgba(168,85,247,0.7),0_0_45px_rgba(147,51,234,0.4)] active:scale-95 transition-all duration-300 backdrop-blur-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 cursor-pointer"
          title="Initiate Sleep Protocol"
          aria-label="Sleep - Initiate Hunter Sleep Protocol"
        >
          {/* Ambient Purple Glow Aura */}
          <div
            className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600/30 via-primary-500/40 to-purple-600/30 blur-md animate-pulse pointer-events-none"
            aria-hidden="true"
          />

          {/* Pulsing Purple Status Beacon */}
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-400 shadow-[0_0_6px_#c084fc]" />
          </span>

          {/* Moon Icon */}
          <Moon className="w-4 h-4 text-primary-300 fill-primary-400/20 group-hover:scale-110 group-hover:-rotate-12 transition-transform drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] shrink-0" />

          {/* Action Label */}
          <span className="font-display font-bold text-xs uppercase tracking-wider text-white drop-shadow">
            Sleep
          </span>
        </button>
      ) : (
        /* Compact Floating Wake Up Button (After sleep starts) */
        <button
          type="button"
          onClick={onWakeUp}
          className="group relative flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-amber-950/95 via-purple-950/95 to-amber-950/95 border border-amber-400/80 hover:border-amber-300 text-amber-100 shadow-[0_0_22px_rgba(217,119,6,0.5),0_0_30px_rgba(168,85,247,0.4),0_4px_16px_rgba(0,0,0,0.6)] hover:shadow-[0_0_32px_rgba(217,119,6,0.7),0_0_42px_rgba(168,85,247,0.6)] active:scale-95 transition-all duration-300 backdrop-blur-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
          title="End Sleep & Generate Recovery Report"
          aria-label="Wake Up - End Sleep and Generate Recovery Report"
        >
          {/* Ambient Awakening Purple & Gold Glow Aura */}
          <div
            className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500/35 via-purple-600/40 to-amber-500/35 blur-md animate-pulse pointer-events-none"
            aria-hidden="true"
          />

          {/* Sun Icon */}
          <Sun className="w-4 h-4 text-amber-300 animate-spin-slow drop-shadow-[0_0_8px_rgba(245,158,11,0.9)] shrink-0" />

          {/* Action Label */}
          <span className="font-display font-bold text-xs uppercase tracking-wider text-amber-100 drop-shadow">
            Wake Up
          </span>

          {/* Live Elapsed Time or Awakening Tag */}
          {elapsedText ? (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-500/25 text-amber-200 border border-amber-400/40 tracking-wider shrink-0">
              {elapsedText}
            </span>
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
          )}
        </button>
      )}
    </aside>
  );
}
