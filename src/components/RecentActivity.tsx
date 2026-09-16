import { Dumbbell, Droplets, Check, Scale, Moon, Clock, ChevronRight } from 'lucide-react';
import type { ActivityItem } from '@/types';

interface RecentActivityProps {
  activities: ActivityItem[];
  onOpenWorkoutHistory?: () => void;
}

const iconMap: Record<string, typeof Dumbbell> = {
  Dumbbell,
  Droplets,
  Check,
  Scale,
  Moon,
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function RecentActivity({ activities, onOpenWorkoutHistory }: RecentActivityProps) {
  return (
    <div className="space-y-3 animate-slide-up stagger-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-300">
          Recent Activity
        </h2>
        {onOpenWorkoutHistory && (
          <button
            type="button"
            onClick={onOpenWorkoutHistory}
            className="text-[10px] font-mono uppercase tracking-wider text-primary-300 hover:text-primary-200 flex items-center gap-1 active:scale-95 transition-all"
          >
            <span>Workout Archives</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
      {activities.length === 0 ? (
        <div className="glass rounded-2xl p-6 text-center">
          <Clock className="w-6 h-6 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No activity yet today.</p>
          <p className="text-xs text-slate-500 mt-1">Log exercises, water, or sleep to see updates here.</p>
        </div>
      ) : (
        <div className="glass-strong rounded-2xl p-2 space-y-1">
          {activities.slice(0, 6).map((activity, i) => {
            const Icon = iconMap[activity.icon] ?? Dumbbell;
            return (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors animate-slide-up"
                style={{ animationDelay: `${i * 40}ms`, opacity: 0 }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${activity.color}15`, border: `1px solid ${activity.color}30` }}
                >
                  <Icon className="w-4 h-4" style={{ color: activity.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{activity.title}</p>
                  <p className="text-xs text-slate-500 truncate">{activity.subtitle}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">{formatTime(activity.timestamp)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
