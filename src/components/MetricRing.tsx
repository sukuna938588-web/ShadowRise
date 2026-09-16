import { useEffect, useState } from 'react';

interface MetricRingProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  max?: number;
  size?: number;
  color: string;
  glow: string;
  unit?: string;
  delay?: number;
}

export function MetricRing({
  icon,
  label,
  value,
  max = 100,
  size = 80,
  color,
  glow,
  unit = '%',
  delay = 0,
}: MetricRingProps) {
  const [progress, setProgress] = useState(0);
  const percentage = Math.min((value / max) * 100, 100);
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setProgress(percentage), 100 + delay);
    return () => clearTimeout(timer);
  }, [percentage, delay]);

  return (
    <div className="flex flex-col items-center gap-2 animate-slide-up" style={{ animationDelay: `${delay}ms`, opacity: 0 }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 1.2s ease-out',
              filter: `drop-shadow(0 0 4px ${glow})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {icon}
          <span className="text-sm font-mono font-bold mt-0.5" style={{ color }}>
            {value}{unit}
          </span>
        </div>
      </div>
      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{label}</span>
    </div>
  );
}
