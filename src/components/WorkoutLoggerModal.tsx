import { useState, useMemo } from 'react';
import {
  X,
  Dumbbell,
  Plus,
  Trash2,
  Check,
  Flame,
  Clock,
  Sparkles,
  Layers,
  Search,
} from 'lucide-react';
import type { WorkoutSet, ExerciseCategory, CustomExerciseDefinition } from '@/types';
import {
  EXERCISE_CATEGORIES,
  getAllAvailableExercises,
  saveCustomExercise,
} from '@/data/exerciseCatalog';
import { playTimerCompletionSound } from '@/utils/audioEffects';

interface WorkoutLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogWorkout: (
    exerciseType: string,
    durationMin: number,
    caloriesBurned: number,
    intensity: string,
    xpReward?: number,
    extra?: {
      customName?: string;
      category?: ExerciseCategory;
      targetMuscle?: string;
      sets?: WorkoutSet[];
      totalSets?: number;
      totalReps?: number;
      totalVolumeKg?: number;
      notes?: string;
    }
  ) => void;
  initialExerciseName?: string;
  initialCategory?: ExerciseCategory;
  initialSets?: WorkoutSet[];
}

export function WorkoutLoggerModal({
  isOpen,
  onClose,
  onLogWorkout,
  initialExerciseName,
  initialCategory,
  initialSets,
}: WorkoutLoggerModalProps) {
  const [exercisesList, setExercisesList] = useState<CustomExerciseDefinition[]>(() =>
    getAllAvailableExercises()
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<CustomExerciseDefinition | null>(() => {
    const list = getAllAvailableExercises();
    if (initialExerciseName) {
      const match = list.find(
        (e) => e.name.toLowerCase() === initialExerciseName.toLowerCase()
      );
      if (match) return match;
      return {
        id: 'initial-custom',
        name: initialExerciseName,
        category: initialCategory || 'strength',
        defaultReps: 10,
        defaultWeightKg: 20,
      };
    }
    return list[0] ?? null;
  });

  // Custom exercise creation form state
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customNameInput, setCustomNameInput] = useState('');
  const [customCategoryInput, setCustomCategoryInput] = useState<ExerciseCategory>('strength');
  const [customMuscleInput, setCustomMuscleInput] = useState('');

  // Workout parameters
  const [durationMin, setDurationMin] = useState<number>(30);
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high' | 'hunter'>('moderate');
  const [notes, setNotes] = useState('');

  // Sets state
  const [sets, setSets] = useState<WorkoutSet[]>(() => {
    if (initialSets && initialSets.length > 0) return initialSets;
    return [
      { id: 'set-1', setNumber: 1, reps: 10, weightKg: 20, completed: true },
      { id: 'set-2', setNumber: 2, reps: 10, weightKg: 20, completed: true },
      { id: 'set-3', setNumber: 3, reps: 10, weightKg: 20, completed: true },
    ];
  });

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    return exercisesList.filter((ex) => {
      const matchesCategory =
        selectedCategory === 'all' || ex.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ex.targetMuscle && ex.targetMuscle.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [exercisesList, selectedCategory, searchQuery]);

  // Derived metrics
  const completedSets = sets.filter((s) => s.completed);
  const totalReps = completedSets.reduce((sum, s) => sum + (s.reps || 0), 0);
  const totalVolumeKg = completedSets.reduce(
    (sum, s) => sum + (s.reps || 0) * (s.weightKg || 0),
    0
  );

  const estimatedCalories = useMemo(() => {
    let rate = 6.5; // cal / min base
    if (intensity === 'low') rate = 4.5;
    if (intensity === 'moderate') rate = 7.5;
    if (intensity === 'high') rate = 10.5;
    if (intensity === 'hunter') rate = 14.0;

    const baseCal = Math.round(durationMin * rate);
    const volumeBonus = Math.round(totalVolumeKg * 0.04);
    return baseCal + volumeBonus;
  }, [durationMin, intensity, totalVolumeKg]);

  const earnedXP = useMemo(() => {
    const timeXP = Math.round(durationMin * 3.5);
    const setXP = completedSets.length * 8;
    const intensityBonus =
      intensity === 'hunter' ? 30 : intensity === 'high' ? 20 : intensity === 'moderate' ? 10 : 0;
    return Math.max(25, timeXP + setXP + intensityBonus);
  }, [durationMin, completedSets.length, intensity]);

  if (!isOpen) return null;

  const handleAddSet = () => {
    const lastSet = sets[sets.length - 1];
    const newSetNumber = sets.length + 1;
    const newSet: WorkoutSet = {
      id: `set-${Date.now()}-${newSetNumber}`,
      setNumber: newSetNumber,
      reps: lastSet ? lastSet.reps : selectedExercise?.defaultReps || 10,
      weightKg: lastSet ? lastSet.weightKg : selectedExercise?.defaultWeightKg || 0,
      completed: true,
    };
    setSets([...sets, newSet]);
  };

  const handleUpdateSet = (id: string, updates: Partial<WorkoutSet>) => {
    setSets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleRemoveSet = (id: string) => {
    if (sets.length <= 1) return;
    const filtered = sets.filter((s) => s.id !== id);
    // re-index
    const reindexed = filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
    setSets(reindexed);
  };

  const handleSelectExercise = (ex: CustomExerciseDefinition) => {
    setSelectedExercise(ex);
    // populate default sets if changing exercise
    setSets([
      { id: `set-1`, setNumber: 1, reps: ex.defaultReps || 10, weightKg: ex.defaultWeightKg || 0, completed: true },
      { id: `set-2`, setNumber: 2, reps: ex.defaultReps || 10, weightKg: ex.defaultWeightKg || 0, completed: true },
      { id: `set-3`, setNumber: 3, reps: ex.defaultReps || 10, weightKg: ex.defaultWeightKg || 0, completed: true },
    ]);
  };

  const handleSaveCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNameInput.trim()) return;

    const saved = saveCustomExercise({
      name: customNameInput.trim(),
      category: customCategoryInput,
      targetMuscle: customMuscleInput.trim() || 'Custom Group',
      defaultReps: 10,
      defaultWeightKg: 0,
    });

    const updated = getAllAvailableExercises();
    setExercisesList(updated);
    setSelectedExercise(saved);
    setSets([
      { id: 'set-1', setNumber: 1, reps: 10, weightKg: 0, completed: true },
      { id: 'set-2', setNumber: 2, reps: 10, weightKg: 0, completed: true },
      { id: 'set-3', setNumber: 3, reps: 10, weightKg: 0, completed: true },
    ]);
    setIsCreatingCustom(false);
    setCustomNameInput('');
    setCustomMuscleInput('');
  };

  const handleSaveWorkout = () => {
    const exerciseName = selectedExercise?.name || 'Custom Training';
    const category = selectedExercise?.category || 'custom';
    const targetMuscle = selectedExercise?.targetMuscle;

    onLogWorkout(
      exerciseName,
      durationMin,
      estimatedCalories,
      intensity,
      earnedXP,
      {
        customName: exerciseName,
        category,
        targetMuscle,
        sets,
        totalSets: sets.length,
        totalReps,
        totalVolumeKg,
        notes: notes.trim() || undefined,
      }
    );

    playTimerCompletionSound();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg max-h-[92dvh] sm:max-h-[88vh] flex flex-col glass-strong rounded-t-3xl sm:rounded-3xl border border-primary-500/30 overflow-hidden shadow-2xl bg-base-900/95">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-base-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-mixed flex items-center justify-center glow-primary">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-slate-100">
                Combat Workout Logger
              </h2>
              <p className="text-[11px] font-mono text-primary-300">
                Sets · Reps · Load · XP Protocol
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95"
            aria-label="Close workout logger"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-5 no-scrollbar">
          {/* Exercise Selector Box */}
          <div className="glass rounded-2xl p-4 space-y-3 border border-white/8">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-primary-400" />
                Exercise Discipline
              </label>

              <button
                type="button"
                onClick={() => setIsCreatingCustom(!isCreatingCustom)}
                className="text-xs font-mono text-primary-300 hover:text-primary-200 flex items-center gap-1 px-2 py-1 rounded-lg glass border border-primary-500/20 active:scale-95 transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>{isCreatingCustom ? 'Cancel Custom' : 'Add Custom Exercise'}</span>
              </button>
            </div>

            {/* Custom Exercise Creator Sub-panel */}
            {isCreatingCustom ? (
              <form onSubmit={handleSaveCustomExercise} className="glass-strong rounded-xl p-3.5 space-y-3 border border-primary-500/40 animate-scale-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary-300">Create Custom Hunter Exercise</span>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Exercise Name *</label>
                  <input
                    type="text"
                    value={customNameInput}
                    onChange={(e) => setCustomNameInput(e.target.value)}
                    placeholder="e.g. One-Arm Pushup, Heavy Bag Striking..."
                    maxLength={50}
                    className="w-full glass rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 border border-white/10 focus:border-primary-400 mt-1"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Category</label>
                    <select
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value as ExerciseCategory)}
                      className="w-full glass rounded-xl px-2.5 py-2 text-xs text-slate-200 border border-white/10 mt-1 bg-base-900"
                    >
                      {EXERCISE_CATEGORIES.map((cat) => (
                        <option key={cat.category} value={cat.category}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Target Muscle</label>
                    <input
                      type="text"
                      value={customMuscleInput}
                      onChange={(e) => setCustomMuscleInput(e.target.value)}
                      placeholder="e.g. Chest, Quads"
                      maxLength={30}
                      className="w-full glass rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 border border-white/10 focus:border-primary-400 mt-1"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!customNameInput.trim()}
                  className="w-full py-2.5 rounded-xl gradient-mixed text-white font-mono text-xs uppercase tracking-wider font-semibold glow-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save & Select Exercise
                </button>
              </form>
            ) : (
              <>
                {/* Search & Category filter */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search exercises (e.g. Squat, Push-up, Bench)..."
                      className="w-full glass rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 border border-white/8 focus:border-primary-400/50"
                    />
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('all')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider shrink-0 transition-all ${
                        selectedCategory === 'all'
                          ? 'bg-primary-500 text-white font-bold'
                          : 'glass text-slate-400 hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    {EXERCISE_CATEGORIES.map((cat) => (
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
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Selected Exercise Pill */}
                  {selectedExercise && (
                    <div className="glass-strong rounded-xl p-3 flex items-center justify-between border border-primary-500/30 bg-primary-950/20">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white">{selectedExercise.name}</p>
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-primary-500/20 text-primary-300 border border-primary-500/30">
                            {selectedExercise.category}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-400">
                          {selectedExercise.targetMuscle || 'General Muscle Group'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Exercises quick grid (filtered) */}
                  <div className="max-h-32 overflow-y-auto no-scrollbar grid grid-cols-2 gap-1.5 pt-1">
                    {filteredExercises.map((ex) => {
                      const isSelected = selectedExercise?.id === ex.id;
                      return (
                        <button
                          key={ex.id}
                          type="button"
                          onClick={() => handleSelectExercise(ex)}
                          className={`text-left p-2 rounded-xl text-xs transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'glass-strong border border-primary-400/60 bg-primary-500/15 text-primary-200'
                              : 'glass border border-white/5 text-slate-300 hover:border-white/15'
                          }`}
                        >
                          <span className="font-medium truncate">{ex.name}</span>
                          <span className="text-[9px] font-mono text-slate-500 truncate">{ex.targetMuscle}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sets & Reps Table */}
          <div className="glass rounded-2xl p-4 space-y-3 border border-white/8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-3.5 h-3.5 text-warning-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300">
                  Sets & Repetitions
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {completedSets.length} / {sets.length} sets completed
              </span>
            </div>

            {/* Sets Header */}
            <div className="grid grid-cols-12 gap-1 px-2 text-[10px] font-mono uppercase tracking-wider text-slate-500">
              <span className="col-span-2 text-center">Set</span>
              <span className="col-span-4 text-center">Reps</span>
              <span className="col-span-4 text-center">Weight (kg)</span>
              <span className="col-span-2 text-center">Done</span>
            </div>

            {/* Set Rows */}
            <div className="space-y-2">
              {sets.map((set) => (
                <div
                  key={set.id}
                  className={`grid grid-cols-12 gap-1.5 items-center p-2 rounded-xl transition-all ${
                    set.completed ? 'glass-strong border border-white/10' : 'glass opacity-60'
                  }`}
                >
                  {/* Set Number */}
                  <div className="col-span-2 flex items-center justify-center">
                    <span className="w-6 h-6 rounded-lg bg-base-800 border border-white/10 text-xs font-mono font-bold text-slate-300 flex items-center justify-center">
                      {set.setNumber}
                    </span>
                  </div>

                  {/* Reps Input */}
                  <div className="col-span-4 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleUpdateSet(set.id, { reps: Math.max(1, set.reps - 1) })}
                      className="w-7 h-7 rounded-lg glass text-slate-400 hover:text-white flex items-center justify-center text-xs active:scale-95"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={set.reps}
                      onChange={(e) => handleUpdateSet(set.id, { reps: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-full text-center bg-base-950/60 border border-white/10 rounded-lg py-1 text-xs font-mono font-bold text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateSet(set.id, { reps: set.reps + 1 })}
                      className="w-7 h-7 rounded-lg glass text-slate-400 hover:text-white flex items-center justify-center text-xs active:scale-95"
                    >
                      +
                    </button>
                  </div>

                  {/* Weight Input */}
                  <div className="col-span-4 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleUpdateSet(set.id, { weightKg: Math.max(0, (set.weightKg || 0) - 2.5) })}
                      className="w-7 h-7 rounded-lg glass text-slate-400 hover:text-white flex items-center justify-center text-xs active:scale-95"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={999}
                      step={0.5}
                      value={set.weightKg ?? 0}
                      onChange={(e) => handleUpdateSet(set.id, { weightKg: Math.max(0, parseFloat(e.target.value) || 0) })}
                      className="w-full text-center bg-base-950/60 border border-white/10 rounded-lg py-1 text-xs font-mono font-bold text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateSet(set.id, { weightKg: (set.weightKg || 0) + 2.5 })}
                      className="w-7 h-7 rounded-lg glass text-slate-400 hover:text-white flex items-center justify-center text-xs active:scale-95"
                    >
                      +
                    </button>
                  </div>

                  {/* Completed Checkbox & Delete */}
                  <div className="col-span-2 flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleUpdateSet(set.id, { completed: !set.completed })}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        set.completed
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                          : 'glass text-slate-600 hover:text-slate-400'
                      }`}
                      aria-label="Toggle set completion"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    {sets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSet(set.id)}
                        className="w-6 h-6 rounded-lg text-slate-600 hover:text-error-400 flex items-center justify-center transition-colors"
                        title="Remove set"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Set Button */}
            <button
              type="button"
              onClick={handleAddSet}
              className="w-full py-2.5 rounded-xl glass border border-dashed border-white/15 text-slate-300 hover:text-primary-300 hover:border-primary-400/40 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
            >
              <Plus className="w-3.5 h-3.5 text-primary-400" />
              <span>Add Set {sets.length + 1}</span>
            </button>
          </div>

          {/* Duration & Intensity Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Duration */}
            <div className="glass rounded-2xl p-3.5 space-y-2 border border-white/8">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-accent-400" />
                  Duration
                </label>
                <span className="text-xs font-mono font-bold text-slate-200">{durationMin} min</span>
              </div>
              <input
                type="range"
                min={5}
                max={120}
                step={5}
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="w-full accent-primary-500 h-1.5 bg-base-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>15m</span>
                <span>30m</span>
                <span>45m</span>
                <span>60m</span>
                <span>90m+</span>
              </div>
            </div>

            {/* Intensity */}
            <div className="glass rounded-2xl p-3.5 space-y-2 border border-white/8">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-error-400" />
                Intensity
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(['low', 'moderate', 'high', 'hunter'] as const).map((lvl) => {
                  const isActive = intensity === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setIntensity(lvl)}
                      className={`py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider capitalize transition-all ${
                        isActive
                          ? lvl === 'hunter'
                            ? 'gradient-primary text-white font-bold glow-primary'
                            : 'bg-primary-500/30 border border-primary-500/60 text-primary-200 font-bold'
                          : 'glass text-slate-400 hover:text-white'
                      }`}
                    >
                      {lvl === 'hunter' ? 'S-Rank' : lvl}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Notes Input */}
          <div className="glass rounded-2xl p-3.5 space-y-1.5 border border-white/8">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
              Hunter Session Log / Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Set a new PR on 3rd set. Clean form, good tempo..."
              maxLength={180}
              rows={2}
              className="w-full glass-strong rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 border border-white/8 focus:border-primary-400/50 resize-none"
            />
          </div>

          {/* Live Summary Stats Banner */}
          <div className="glass-strong rounded-2xl p-3.5 border border-primary-500/30 bg-gradient-to-r from-primary-950/40 via-base-900 to-base-900">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">Sets</span>
                <p className="text-sm font-display font-bold text-slate-100">{completedSets.length}</p>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">Reps</span>
                <p className="text-sm font-display font-bold text-slate-100">{totalReps}</p>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">Volume</span>
                <p className="text-sm font-display font-bold text-slate-100">
                  {totalVolumeKg > 0 ? `${totalVolumeKg}kg` : 'BW'}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">XP / Cal</span>
                <p className="text-sm font-display font-bold text-primary-300">
                  +{earnedXP} <span className="text-xs text-slate-400">/ {estimatedCalories}c</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-base-900/90 shrink-0 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl glass font-mono text-xs uppercase tracking-wider text-slate-400 hover:text-white transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveWorkout}
            className="flex-[2] py-3.5 rounded-2xl gradient-mixed font-display font-bold text-sm uppercase tracking-wider text-white glow-primary hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-warning-300" />
            <span>Complete & Log (+{earnedXP} XP)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
