import { useEffect, useState } from 'react';

interface XPBarProps {
  current: number;
  max: number;
  level: number;
}

export function XPBar({ current, max, level }: XPBarProps) {
  const [width, setWidth] = useState(0);
  const percentage = Math.min((current / max) * 100, 100);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Level</span>
          <span className="text-lg font-display font-bold gradient-text">{level}</span>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {current} / {max} XP
        </span>
      </div>
      <div className="relative h-3 rounded-full overflow-hidden bg-base-700/80 border border-white/5">
        {/* Track shimmer */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.1) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s linear infinite',
          }}
        />
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${width}%`,
            background: 'linear-gradient(90deg, #7c3aed 0%, #8b5cf6 50%, #3b82f6 100%)',
            boxShadow: '0 0 15px rgba(139, 92, 246, 0.6), 0 0 30px rgba(139, 92, 246, 0.3)',
          }}
        >
          {/* Shine effect */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s linear infinite',
            }}
          />
        </div>
        {/* Segment markers */}
        {[25, 50, 75].map((pos) => (
          <div
            key={pos}
            className="absolute top-0 bottom-0 w-px bg-base-900/50"
            style={{ left: `${pos}%` }}
          />
        ))}
      </div>
    </div>
  );
}
