import { useState } from 'react';
import {
  Compass,
  Flame,
  Clock,
  Award,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Plus,
  ShieldCheck,
  Timer,
} from 'lucide-react';
import type { UserProfile, WorkoutSuggestion, QuestType, Difficulty, ExerciseTimerMode } from '@/types';
import { getPersonalizedWorkouts } from '@/data/workoutSuggestionsData';
import { getDifficultyConfig } from '@/data/initialData';

interface WorkoutSuggestionsProps {
  profile?: UserProfile | null;
  onAddQuest?: (quest: {
    title: string;
    description: string;
    type: QuestType;
    difficulty: Difficulty;
    xpReward: number;
  }) => void;
  onLogExercise?: (
    exerciseType: string,
    durationMin: number,
    caloriesBurned: number,
    intensity: string,
  ) => void;
  onOpenTimer?: (mode?: ExerciseTimerMode, minutes?: number, title?: string) => void;
}

export function WorkoutSuggestions({ profile, onAddQuest, onOpenTimer }: WorkoutSuggestionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const [acceptedWorkouts, setAcceptedWorkouts] = useState<Record<string, boolean>>({});

  const workouts = getPersonalizedWorkouts(profile);
  const safeWorkouts = Array.isArray(workouts) ? workouts : [];

  const categories = [
    { id: 'all', label: 'All Directives' },
    { id: 'rehab', label: 'Corrective & Rehab' },
    { id: 'core', label: 'Core & Lumbar' },
    { id: 'cardio', label: 'Joint-Safe Cardio' },
    { id: 'fat_loss', label: 'Caloric Shred' },
    { id: 'strength', label: 'Strength Armor' },
    { id: 'mobility', label: 'Mobility Recovery' },
  ];

  const filteredWorkouts = safeWorkouts.filter((w) => {
    if (!w) return false;
    if (selectedCategory === 'all') return true;
    return w.category === selectedCategory;
  });

  const handleAcceptAsQuest = (workout: WorkoutSuggestion) => {
    if (!onAddQuest || !workout) return;

    const exerciseNames = (workout.exercises || [])
      .map((e) => e?.name)
      .filter(Boolean)
      .join(', ');

    const safeDiff = (typeof workout.difficulty === 'string'
      ? workout.difficulty.toLowerCase()
      : 'easy') as Difficulty;

    onAddQuest({
      title: workout.title || 'Training Directive',
      description: `${workout.subtitle || ''}${exerciseNames ? ` · ${exerciseNames}` : ''}`,
      type: 'workout',
      difficulty: safeDiff,
      xpReward: workout.xpReward || 100,
    });

    setAcceptedWorkouts((prev) => ({ ...prev, [workout.id]: true }));
  };

  const activeIssues = Array.isArray(profile?.healthIssues) ? profile.healthIssues : [];

  return (
    <div className="glass-strong rounded-3xl p-5 relative overflow-hidden border border-white/10 animate-slide-up">
      {/* Ambient background glow */}
      <div className="absolute -top-14 -left-14 w-36 h-36 rounded-full bg-primary-500/10 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center">
            <Compass className="w-4 h-4 text-primary-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-200">
                Personalized Training Directives
              </h3>
              <Sparkles className="w-3.5 h-3.5 text-secondary-400 animate-pulse" />
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Generated from biometrics, BMI, and physical injury filters
            </p>
          </div>
        </div>
      </div>

      {/* Active Health Guard Notice */}
      {activeIssues.length > 0 && (
        <div className="mb-3.5 p-2.5 rounded-2xl glass border border-amber-500/30 flex items-center gap-2 text-xs">
          <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="text-[11px] font-mono text-amber-200/90">
            Injury protection enabled for {activeIssues.length} condition{activeIssues.length > 1 ? 's' : ''}. High-risk impact exercises have been filtered out.
          </span>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                isSelected
                  ? 'gradient-mixed text-white glow-primary border border-primary-400/40 shadow-sm'
                  : 'glass text-slate-400 hover:text-slate-200 border-white/5'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Workout Directives List */}
      <div className="mt-3 space-y-3">
        {filteredWorkouts.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center text-slate-400 text-xs font-mono">
            {safeWorkouts.length === 0
              ? 'No active training directives available at this time.'
              : 'No routines in this category match your injury protection filters.'}
          </div>
        ) : (
          filteredWorkouts.map((workout) => {
            if (!workout?.id) return null;
            const isExpanded = expandedWorkoutId === workout.id;
            const isAccepted = Boolean(acceptedWorkouts[workout.id]);
            const diff = getDifficultyConfig(workout.difficulty);
            const diffColor = diff?.color || '#34d399';
            const targetedIssues = Array.isArray(workout.targetedIssues) ? workout.targetedIssues : [];
            const exercises = Array.isArray(workout.exercises) ? workout.exercises : [];

            return (
              <div
                key={workout.id}
                className="glass rounded-2xl border border-white/8 overflow-hidden hover:border-primary-500/30 transition-all shadow-md"
              >
                {/* Header Card */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold"
                          style={{
                            background: `${diffColor}20`,
                            color: diffColor,
                            border: `1px solid ${diffColor}40`,
                          }}
                        >
                          {diff?.label || workout.difficulty || 'Easy'}
                        </span>

                        {workout.targetFocus && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider text-slate-400 glass border-white/5">
                            {workout.targetFocus}
                          </span>
                        )}

                        {targetedIssues.some((issue) => activeIssues.includes(issue)) && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> High Match
                          </span>
                        )}
                      </div>

                      <h4 className="font-display font-bold text-sm text-slate-100">{workout.title}</h4>
                      {workout.subtitle && <p className="text-xs font-mono text-slate-400 mt-0.5">{workout.subtitle}</p>}
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedWorkoutId(isExpanded ? null : workout.id)}
                      className="w-7 h-7 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Why recommended insight */}
                  {workout.whyRecommended && (
                    <p className="text-[11px] text-slate-300 font-sans mt-2.5 leading-relaxed bg-white/5 p-2 rounded-xl border border-white/5">
                      {workout.whyRecommended}
                    </p>
                  )}

                  {/* Metrics & Actions Bar */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-primary-400" />
                        <span>{workout.durationMin || 0}m</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Flame className="w-3.5 h-3.5 text-warning-400" />
                        <span>{workout.estimatedCalories || 0} cal</span>
                      </span>
                      <span className="flex items-center gap-1 text-secondary-400 font-bold">
                        <Award className="w-3.5 h-3.5" />
                        <span>+{workout.xpReward || 0} XP</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onOpenTimer && (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenTimer(
                              workout.category === 'hiit' ? 'interval' : 'countdown',
                              workout.durationMin || 15,
                              workout.title
                            )
                          }
                          className="px-2.5 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-1 glass border border-primary-500/30 text-primary-300 hover:text-white hover:bg-primary-500/20 transition-all active:scale-95"
                          title="Start timer for this directive"
                        >
                          <Timer className="w-3 h-3 text-primary-400" />
                          <span>Timer</span>
                        </button>
                      )}

                      {onAddQuest && (
                        <button
                          type="button"
                          onClick={() => handleAcceptAsQuest(workout)}
                          disabled={isAccepted}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                            isAccepted
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                              : 'gradient-mixed text-white glow-primary hover:scale-105'
                          }`}
                        >
                          {isAccepted ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Quest Active</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>Take Quest</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Exercise Steps */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 bg-base-950/60 border-t border-white/5 space-y-2 animate-scale-in">
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      Directive Movement Breakdown
                    </p>
                    <div className="space-y-1.5">
                      {exercises.map((ex, idx) => (
                        <div
                          key={idx}
                          className="glass rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-primary-500/20 text-primary-300 font-mono text-[10px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-semibold text-slate-200">{ex.name}</p>
                              {ex.notes && <p className="text-[10px] text-slate-400 font-mono">{ex.notes}</p>}
                            </div>
                          </div>
                          <div className="text-right font-mono text-[11px] text-primary-300 whitespace-nowrap">
                            {ex.sets && <span>{ex.sets} sets × </span>}
                            {ex.reps && <span>{ex.reps}</span>}
                            {ex.durationMin && <span>{ex.durationMin} min</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
