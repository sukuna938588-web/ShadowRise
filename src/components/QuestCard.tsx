import { Dumbbell, Apple, Brain, Flame, Check, ChevronRight, Trash2 } from 'lucide-react';
import type { Quest } from '@/types';
import { getDifficultyConfig, getQuestTypeConfig } from '@/data/initialData';

const iconMap: Record<string, typeof Dumbbell> = {
  Dumbbell,
  Apple,
  Brain,
  Flame,
};

interface QuestCardProps {
  quest: Quest;
  onComplete: (id: string) => void;
  onUncomplete: (id: string) => void;
  onDelete?: (id: string) => void;
  index?: number;
}

export function QuestCard({ quest, onComplete, onUncomplete, onDelete, index = 0 }: QuestCardProps) {
  const typeConfig = getQuestTypeConfig(quest?.type);
  const diffConfig = getDifficultyConfig(quest?.difficulty);
  const Icon = (typeConfig?.icon && iconMap[typeConfig.icon]) ? iconMap[typeConfig.icon] : Dumbbell;
  const typeColor = typeConfig?.color || '#f87171';
  const diffColor = diffConfig?.color || '#60a5fa';
  const diffBg = diffConfig?.bg || 'rgba(96, 165, 250, 0.12)';

  return (
    <div
      className={`glass rounded-2xl p-4 transition-all duration-300 animate-slide-up ${
        quest.completed ? 'opacity-50' : 'hover:border-white/15'
      }`}
      style={{ animationDelay: `${index * 60}ms`, opacity: 0 }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-110"
          style={{
            background: `${typeColor}15`,
            border: `1px solid ${typeColor}30`,
          }}
        >
          <Icon className="w-5 h-5" style={{ color: typeColor }} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm mb-1 ${quest.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
            {quest.title}
          </h3>
          <p className={`text-xs mb-2 ${quest.completed ? 'text-slate-600' : 'text-slate-400'}`}>
            {quest.description}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ background: diffBg, color: diffColor }}
            >
              {diffConfig?.label || quest?.difficulty || 'Normal'}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-300">
              +{quest.xpReward} XP
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={() => quest.completed ? onUncomplete(quest.id) : onComplete(quest.id)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
              quest.completed
                ? 'bg-success-500/20 border border-success-500/40 hover:bg-success-500/30'
                : 'glass-strong hover:scale-110 hover:border-primary-400/40'
            }`}
            aria-label={quest.completed ? 'Mark incomplete' : 'Complete quest'}
          >
            <Check
              className={`w-4 h-4 transition-all duration-300 ${
                quest.completed ? 'text-success-400' : 'text-slate-500'
              }`}
              strokeWidth={2.5}
            />
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(quest.id)}
              className="w-9 h-9 rounded-xl flex items-center justify-center glass hover:border-error-500/40 hover:bg-error-500/10 transition-all duration-300"
              aria-label="Delete quest"
            >
              <Trash2 className="w-4 h-4 text-slate-500 hover:text-error-400" />
            </button>
          )}
        </div>
      </div>

      {quest.completed && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
          <Check className="w-3 h-3 text-success-400" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-success-400">Completed</span>
          <ChevronRight className="w-3 h-3 text-success-400 ml-auto" />
        </div>
      )}
    </div>
  );
}
