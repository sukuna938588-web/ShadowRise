import { User as UserIcon } from 'lucide-react';

interface ShadowAuraAvatarProps {
  photo?: string;
  name: string;
  level: number;
  glowColor?: string;
  className?: string;
  onClick?: () => void;
}

export function ShadowAuraAvatar({
  photo,
  name,
  level,
  glowColor = '#8b5cf6',
  className = '',
  onClick,
}: ShadowAuraAvatarProps) {
  return (
    <div
      onClick={onClick}
      className={`relative shrink-0 flex items-center justify-center select-none ${className} ${
        onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''
      }`}
    >
      {/* Layer 1: Outermost Abyssal Shadow Monarch Aura */}
      <div
        className="absolute -inset-4 rounded-3xl opacity-75 blur-xl pointer-events-none animate-shadow-flame"
        style={{
          background: `radial-gradient(ellipse at center, ${glowColor}90 0%, #1e1035 45%, transparent 75%)`,
        }}
      />

      {/* Layer 2: Secondary Ethereal Tendril Mist */}
      <div
        className="absolute -inset-2 rounded-2xl opacity-80 blur-md pointer-events-none animate-pulse"
        style={{
          background: `radial-gradient(circle, ${glowColor}60 20%, #090314 60%, transparent 85%)`,
        }}
      />

      {/* Layer 3: Rotating Purple Mana Orbit Rings behind Avatar */}
      <div
        className="absolute -inset-3 rounded-2xl border border-primary-500/40 pointer-events-none animate-spin-slow"
        style={{
          boxShadow: `0 0 15px ${glowColor}40`,
        }}
      >
        <div
          className="absolute -top-1 right-2 w-2 h-2 rounded-full"
          style={{ background: '#c084fc', boxShadow: '0 0 6px #c084fc' }}
        />
        <div
          className="absolute -bottom-1 left-2 w-1.5 h-1.5 rounded-full"
          style={{ background: '#60a5fa', boxShadow: '0 0 6px #60a5fa' }}
        />
      </div>

      {/* Core Avatar Container */}
      <div className="relative z-10 w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary-400/60 shadow-lg shadow-primary-950/80 bg-base-900 group">
        {photo ? (
          <img
            src={photo}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full gradient-mixed flex items-center justify-center">
            <UserIcon className="w-7 h-7 text-white" />
          </div>
        )}

        {/* Specular glass reflection on avatar */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
      </div>

      {/* Level Badge */}
      <div className="absolute -bottom-1 -right-1 z-20 w-7 h-7 rounded-lg gradient-mixed flex items-center justify-center glow-primary border-2 border-base-900 shadow-md">
        <span className="text-xs font-display font-bold text-white tracking-tighter">
          {level}
        </span>
      </div>
    </div>
  );
}
