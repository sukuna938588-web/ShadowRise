import { rankConfig } from '@/data/initialData';
import type { Rank } from '@/types';

interface RankBadgeProps {
  rank: Rank;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  onClick?: () => void;
}

const sizeClasses = {
  sm: 'w-12 h-12 text-lg',
  md: 'w-16 h-16 text-2xl',
  lg: 'w-24 h-24 text-4xl',
  xl: 'w-32 h-32 text-6xl',
};

const ringSizes = {
  sm: { outer: 'w-20 h-20', mid: 'w-16 h-16', inner: 'w-14 h-14' },
  md: { outer: 'w-24 h-24', mid: 'w-20 h-20', inner: 'w-18 h-18' },
  lg: { outer: 'w-36 h-36', mid: 'w-30 h-30', inner: 'w-26 h-26' },
  xl: { outer: 'w-48 h-48', mid: 'w-40 h-40', inner: 'w-36 h-36' },
};

export function RankBadge({ rank, size = 'lg', animated = true, onClick }: RankBadgeProps) {
  const config = rankConfig[rank] ?? rankConfig.E;
  const rings = ringSizes[size];

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center select-none ${
        onClick ? 'cursor-pointer group active:scale-95 transition-transform' : ''
      }`}
      style={{ width: 'fit-content' }}
    >
      {/* Outer Rotating Runic Gate Ring */}
      <div
        className={`absolute ${rings.outer} rounded-full pointer-events-none ${
          animated ? 'animate-spin-slow' : ''
        }`}
        style={{
          border: `1.5px dashed ${config.color}35`,
          boxShadow: `0 0 25px ${config.glow}20`,
        }}
      >
        {/* 4 Cardinal runic notch nodes */}
        <div
          className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
          style={{ background: config.color, boxShadow: `0 0 8px ${config.glow}` }}
        />
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
          style={{ background: config.color, boxShadow: `0 0 8px ${config.glow}` }}
        />
        <div
          className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{ background: config.color, boxShadow: `0 0 8px ${config.glow}` }}
        />
        <div
          className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{ background: config.color, boxShadow: `0 0 8px ${config.glow}` }}
        />
      </div>

      {/* Middle Counter-Rotating Astral Orbit Ring with Satellite Nodes */}
      <div
        className={`absolute ${rings.mid} rounded-full pointer-events-none ${
          animated ? 'animate-spin-reverse' : ''
        }`}
        style={{
          border: `1px solid ${config.color}45`,
          boxShadow: `inset 0 0 15px ${config.glow}15`,
        }}
      >
        {/* Orbiting Satellite 1 */}
        <div
          className="absolute top-1 right-2 w-2.5 h-2.5 rounded-full"
          style={{
            background: config.color,
            boxShadow: `0 0 10px ${config.glow}, 0 0 18px ${config.color}`,
          }}
        />
        {/* Orbiting Satellite 2 */}
        <div
          className="absolute bottom-1 left-2 w-2 h-2 rounded-full"
          style={{
            background: '#ffffff',
            boxShadow: `0 0 8px ${config.glow}`,
          }}
        />
      </div>

      {/* Inner Segmented Runes Arc Ring */}
      <div
        className={`absolute ${rings.inner} rounded-full pointer-events-none ${
          animated ? 'animate-spin-runic' : ''
        }`}
        style={{
          border: `1px dotted ${config.color}50`,
        }}
      />

      {/* Volumetric Radial Glow Backdrop */}
      <div
        className={`absolute ${sizeClasses[size]} rounded-full pointer-events-none ${
          animated ? 'animate-glow-pulse' : ''
        }`}
        style={{
          background: `radial-gradient(circle, ${config.glow} 0%, transparent 70%)`,
          transform: 'scale(1.4)',
        }}
      />

      {/* Core Rank Badge with Faceted Border and Shimmer */}
      <div
        className={`relative ${
          sizeClasses[size]
        } rounded-3xl flex items-center justify-center font-display font-black tracking-wider transition-all duration-300 ${
          animated ? 'animate-badge-glow' : ''
        }`}
        style={{
          background: `linear-gradient(145deg, ${config.color}25 0%, rgba(10, 10, 20, 0.85) 60%, ${config.color}15 100%)`,
          border: `2px solid ${config.color}80`,
          color: config.color,
          textShadow: `0 0 20px ${config.glow}, 0 0 40px ${config.glow}, 0 0 60px ${config.color}`,
          boxShadow: `0 0 35px ${config.glow}40, inset 0 0 20px ${config.glow}25`,
        }}
      >
        {/* Glass specular top highlight */}
        <div className="absolute inset-x-2 top-1 h-[30%] rounded-t-2xl bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

        <span className="relative z-10">{rank}</span>

        {/* Small rank label subscript on xl */}
        {size === 'xl' && (
          <span
            className="absolute bottom-2 text-[10px] font-mono tracking-[0.25em] uppercase font-bold opacity-80"
            style={{ color: config.color }}
          >
            CLASS
          </span>
        )}
      </div>
    </div>
  );
}
