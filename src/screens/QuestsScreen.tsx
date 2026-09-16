import { useState, useMemo } from 'react';
import { ScrollText, Filter, CheckCircle2, Circle, Timer } from 'lucide-react';
import type { Store } from '@/store';
import type { QuestType, ExerciseTimerMode } from '@/types';
import { QuestCard } from '@/components/QuestCard';
import { WorkoutSuggestions } from '@/components/WorkoutSuggestions';
import { ExerciseTimerModal } from '@/components/ExerciseTimerModal';

interface QuestsScreenProps {
  store: Store;
}

type FilterTab = 'all' | 'active' | 'completed' | QuestType;

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Done' },
  { key: 'workout', label: 'Workout' },
  { key: 'nutrition', label: 'Nutrition' },
  { key: 'mindfulness', label: 'Mind' },
  { key: 'challenge', label: 'Challenge' },
];

export function QuestsScreen({ store }: QuestsScreenProps) {
  const [filter, setFilter] = useState<FilterTab>('all');
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [timerMode, setTimerMode] = useState<ExerciseTimerMode>('stopwatch');
  const [timerMinutes, setTimerMinutes] = useState(15);
  const [timerTitle, setTimerTitle] = useState('Shadow Quest Training');

  const handleOpenTimer = (
    mode: ExerciseTimerMode = 'stopwatch',
    minutes = 15,
    title = 'Shadow Quest Training'
  ) => {
    setTimerMode(mode);
    setTimerMinutes(minutes);
    setTimerTitle(title);
    setIsTimerOpen(true);
  };

  const filteredQuests = useMemo(() => {
    return store.quests.filter((q) => {
      if (filter === 'all') return true;
      if (filter === 'active') return !q.completed;
      if (filter === 'completed') return q.completed;
      return q.type === filter;
    });
  }, [store.quests, filter]);

  const activeCount = store.quests.filter((q) => !q.completed).length;
  const completedCount = store.quests.filter((q) => q.completed).length;

  return (
    <div className="px-4 pt-[env(safe-area-inset-top)] pb-28 space-y-5">
      {/* Header */}
      <div className="pt-4 flex items-center justify-between animate-fade-in">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ScrollText className="w-5 h-5 text-primary-400" />
            <h1 className="font-display font-bold text-2xl gradient-text">Quest Log</h1>
          </div>
          <p className="text-sm text-slate-400">Track your daily missions and challenges.</p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenTimer('stopwatch')}
          className="glass border border-primary-500/30 px-3 py-2 rounded-2xl flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-primary-300 hover:text-white hover:bg-primary-500/20 transition-all active:scale-95"
        >
          <Timer className="w-4 h-4 text-primary-400" />
          <span>Timer</span>
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 animate-slide-up">
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center">
            <Circle className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-slate-100">{activeCount}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Active</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success-500/15 border border-success-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-success-400" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-slate-100">{completedCount}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Completed</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar animate-slide-up stagger-1">
        <Filter className="w-4 h-4 text-slate-500 shrink-0" />
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
              filter === tab.key
                ? 'gradient-mixed text-white glow-primary'
                : 'glass text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quest list */}
      <div className="space-y-3">
        {filteredQuests.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center animate-fade-in">
            <ScrollText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No quests in this category.</p>
          </div>
        ) : (
          filteredQuests.map((quest, i) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              index={i}
              onComplete={store.completeQuest}
              onUncomplete={store.uncompleteQuest}
              onDelete={store.deleteQuest}
            />
          ))
        )}
      </div>

      {/* Personalized Training Directives */}
      {store.profile && (
        <div className="pt-2">
          <WorkoutSuggestions
            profile={store.profile}
            onAddQuest={store.addQuest}
            onLogExercise={store.logExercise}
            onOpenTimer={handleOpenTimer}
          />
        </div>
      )}

      {/* Exercise Timer Modal */}
      <ExerciseTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        initialMode={timerMode}
        initialMinutes={timerMinutes}
        initialWorkoutTitle={timerTitle}
        onLogWorkout={store.logExercise}
      />
    </div>
  );
}
