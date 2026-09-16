import { useState, useMemo } from 'react';
import {
  X,
  Dumbbell,
  Calendar,
  Clock,
  Flame,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Trash2,
  TrendingUp,
  Award,
  Filter,
} from 'lucide-react';
import type { ExerciseEntry } from '@/types';
import { EXERCISE_CATEGORIES } from '@/data/exerciseCatalog';

interface WorkoutHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: ExerciseEntry[];
  onDeleteExercise: (id: string) => void;
  onRepeatWorkout?: (entry: ExerciseEntry) => void;
  onOpenLogger?: () => void;
}

export function WorkoutHistoryModal({
  isOpen,
  onClose,
  exercises,
  onDeleteExercise,
  onRepeatWorkout,
  onOpenLogger,
}: WorkoutHistoryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      if (selectedCategory === 'all') return true;
      return ex.category === selectedCategory;
    });
  }, [exercises, selectedCategory]);

  // Overall statistics
  const stats = useMemo(() => {
    const totalSessions = exercises.length;
    const totalMinutes = exercises.reduce((sum, e) => sum + (e.durationMin || 0), 0);
    const totalCalories = exercises.reduce((sum, e) => sum + (e.caloriesBurned || 0), 0);
    const totalSets = exercises.reduce(
      (sum, e) => sum + (e.totalSets || (e.sets ? e.sets.length : 0)),
      0
    );
    const totalVolumeKg = exercises.reduce(
      (sum, e) => sum + (e.totalVolumeKg || 0),
      0
    );

    return {
      totalSessions,
      totalHours: (totalMinutes / 60).toFixed(1),
      totalCalories,
      totalSets,
      totalVolumeKg,
    };
  }, [exercises]);

  if (!isOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const handleDelete = (id: string) => {
    onDeleteExercise(id);
    setDeletingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg max-h-[92dvh] sm:max-h-[88vh] flex flex-col glass-strong rounded-t-3xl sm:rounded-3xl border border-primary-500/30 overflow-hidden shadow-2xl bg-base-900/95">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-base-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-mixed flex items-center justify-center glow-primary">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-slate-100">
                Hunter Workout Log
              </h2>
              <p className="text-[11px] font-mono text-primary-300">
                Combat Archives & Sets History
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95"
            aria-label="Close workout history"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4 no-scrollbar">
          {/* Summary Dashboard Banner */}
          <div className="glass-strong rounded-2xl p-4 border border-primary-500/30 bg-gradient-to-br from-primary-950/40 via-base-900 to-base-900 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-warning-400" />
                Training Summary
              </span>
              <span className="text-[10px] font-mono text-primary-300 px-2 py-0.5 rounded-full bg-primary-500/20 border border-primary-500/30">
                {stats.totalSessions} Sessions Recorded
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="glass rounded-xl p-2.5">
                <span className="text-[9px] font-mono uppercase text-slate-400 block">Total Time</span>
                <p className="text-sm font-display font-bold text-slate-100 mt-0.5">{stats.totalHours}h</p>
              </div>
              <div className="glass rounded-xl p-2.5">
                <span className="text-[9px] font-mono uppercase text-slate-400 block">Calories</span>
                <p className="text-sm font-display font-bold text-slate-100 mt-0.5">{stats.totalCalories}c</p>
              </div>
              <div className="glass rounded-xl p-2.5">
                <span className="text-[9px] font-mono uppercase text-slate-400 block">Total Sets</span>
                <p className="text-sm font-display font-bold text-slate-100 mt-0.5">{stats.totalSets}</p>
              </div>
              <div className="glass rounded-xl p-2.5">
                <span className="text-[9px] font-mono uppercase text-slate-400 block">Volume</span>
                <p className="text-sm font-display font-bold text-primary-300 mt-0.5">
                  {stats.totalVolumeKg > 0 ? `${stats.totalVolumeKg}kg` : '0kg'}
                </p>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider shrink-0 transition-all ${
                selectedCategory === 'all'
                  ? 'bg-primary-500 text-white font-bold'
                  : 'glass text-slate-400 hover:text-white'
              }`}
            >
              All ({exercises.length})
            </button>
            {EXERCISE_CATEGORIES.map((cat) => {
              const count = exercises.filter((e) => e.category === cat.category).length;
              if (count === 0 && selectedCategory !== cat.category) return null;
              return (
                <button
                  key={cat.category}
                  type="button"
                  onClick={() => setSelectedCategory(cat.category)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider shrink-0 transition-all ${
                    selectedCategory === cat.category
                      ? 'bg-primary-500 text-white font-bold'
                      : 'glass text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Exercise History List */}
          {filteredExercises.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center space-y-3 border border-white/8">
              <div className="w-12 h-12 rounded-2xl glass mx-auto flex items-center justify-center text-slate-500">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">No workout records found</p>
                <p className="text-xs font-mono text-slate-500 mt-1">
                  Complete and log a training session to archive your hunter progression.
                </p>
              </div>
              {onOpenLogger && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLogger();
                  }}
                  className="px-4 py-2.5 rounded-xl gradient-mixed text-white font-mono text-xs uppercase tracking-wider font-semibold glow-primary inline-flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Log Combat Workout</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExercises.map((entry) => {
                const isExpanded = expandedCardId === entry.id;
                const hasSets = entry.sets && entry.sets.length > 0;
                const title = entry.customName || entry.exerciseType;

                return (
                  <div
                    key={entry.id}
                    className="glass-strong rounded-2xl p-3.5 sm:p-4 border border-white/8 hover:border-primary-500/30 transition-all duration-300 space-y-3"
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center shrink-0 mt-0.5">
                          <Dumbbell className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-slate-100">{title}</h4>
                            {entry.category && (
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-primary-500/20 text-primary-300 border border-primary-500/30">
                                {entry.category}
                              </span>
                            )}
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/5 text-slate-400 capitalize">
                              {entry.intensity}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              {entry.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {entry.durationMin}m
                            </span>
                            <span className="flex items-center gap-1 text-primary-300">
                              <Flame className="w-3 h-3 text-error-400" />
                              {entry.caloriesBurned} cal
                            </span>
                            {entry.totalVolumeKg !== undefined && entry.totalVolumeKg > 0 && (
                              <span className="text-amber-400 font-bold">
                                {entry.totalVolumeKg}kg vol
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expand / Collapse Button */}
                      {hasSets && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(entry.id)}
                          className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-white shrink-0 active:scale-95"
                          aria-label="Toggle sets view"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Sets Preview Chips */}
                    {hasSets && !isExpanded && (
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
                        <span className="px-2 py-0.5 rounded-lg bg-base-800 border border-white/10">
                          {entry.sets!.length} Sets
                        </span>
                        {entry.totalReps !== undefined && (
                          <span className="px-2 py-0.5 rounded-lg bg-base-800 border border-white/10">
                            {entry.totalReps} Total Reps
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleExpand(entry.id)}
                          className="text-primary-300 hover:underline ml-auto flex items-center gap-1"
                        >
                          View Breakdown
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Detailed Sets Breakdown Accordion */}
                    {hasSets && isExpanded && (
                      <div className="glass rounded-xl p-3 space-y-2 border border-white/10 bg-base-950/60 animate-scale-in">
                        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 pb-1 border-b border-white/10">
                          <span>Set Breakdown</span>
                          <span>
                            {entry.sets!.filter((s) => s.completed).length} /{' '}
                            {entry.sets!.length} Completed
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {entry.sets!.map((set) => (
                            <div
                              key={set.id || `set-${set.setNumber}`}
                              className="flex items-center justify-between text-xs font-mono py-1 px-2 rounded-lg glass"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-base-800 text-[10px] flex items-center justify-center text-slate-300">
                                  #{set.setNumber}
                                </span>
                                <span className="text-slate-200">
                                  {set.reps} reps {set.weightKg ? `@ ${set.weightKg} kg` : '(BW)'}
                                </span>
                              </div>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                                  set.completed
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-slate-800 text-slate-500'
                                }`}
                              >
                                {set.completed ? 'Completed' : 'Skipped'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes if present */}
                    {entry.notes && (
                      <p className="text-xs text-slate-300 italic glass rounded-xl p-2.5 border border-white/5">
                        "{entry.notes}"
                      </p>
                    )}

                    {/* Action buttons (Repeat & Delete) */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      {onRepeatWorkout && (
                        <button
                          type="button"
                          onClick={() => {
                            onRepeatWorkout(entry);
                            onClose();
                          }}
                          className="text-xs font-mono text-primary-300 hover:text-primary-200 flex items-center gap-1.5 py-1 px-2.5 rounded-lg glass hover:border-primary-500/30 transition-all active:scale-95"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Repeat Workout</span>
                        </button>
                      )}

                      <div className="ml-auto">
                        {deletingId === entry.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-error-400">Delete?</span>
                            <button
                              type="button"
                              onClick={() => handleDelete(entry.id)}
                              className="px-2 py-1 rounded bg-error-500/20 border border-error-500/40 text-error-400 text-xs font-mono active:scale-95"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingId(null)}
                              className="px-2 py-1 rounded glass text-slate-400 text-xs font-mono active:scale-95"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeletingId(entry.id)}
                            className="text-slate-500 hover:text-error-400 p-1.5 rounded-lg transition-colors active:scale-95"
                            title="Delete log"
                            aria-label="Delete workout entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-base-900/90 shrink-0 flex items-center gap-3">
          {onOpenLogger && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLogger();
              }}
              className="w-full py-3 rounded-2xl gradient-mixed font-display font-bold text-xs sm:text-sm uppercase tracking-wider text-white glow-primary active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Dumbbell className="w-4 h-4" />
              <span>Log New Combat Workout</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
