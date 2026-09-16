import { Dumbbell, Droplets, Moon, HeartPulse } from 'lucide-react';
import type { FitnessMetrics } from '@/types';
import { MetricRing } from '@/components/MetricRing';

interface FitnessMetricsProps {
  metrics: FitnessMetrics;
}

export function FitnessMetrics({ metrics }: FitnessMetricsProps) {
  return (
    <div className="glass-strong rounded-2xl p-5 animate-slide-up stagger-1">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-200">Today's Metrics</h3>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <MetricRing
          icon={<Dumbbell className="w-4 h-4 text-primary-400" />}
          label="Exercise"
          value={metrics.exerciseProgress}
          color="#a78bfa"
          glow="rgba(167,139,250,0.5)"
          delay={0}
        />
        <MetricRing
          icon={<Droplets className="w-4 h-4 text-secondary-400" />}
          label="Hydration"
          value={metrics.hydration}
          color="#60a5fa"
          glow="rgba(96,165,250,0.5)"
          delay={80}
        />
        <MetricRing
          icon={<Moon className="w-4 h-4 text-primary-300" />}
          label="Sleep"
          value={metrics.sleepQuality}
          color="#c4b5fd"
          glow="rgba(196,181,253,0.5)"
          delay={160}
        />
        <MetricRing
          icon={<HeartPulse className="w-4 h-4 text-success-400" />}
          label="Recovery"
          value={metrics.recoveryScore}
          color="#34d399"
          glow="rgba(52,211,153,0.5)"
          delay={240}
        />
      </div>
    </div>
  );
}
