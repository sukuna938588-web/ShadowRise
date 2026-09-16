import { useState, useMemo } from 'react';
import {
  Plus,
  Dumbbell,
  Apple,
  Brain,
  Flame,
  X,
  Layers,
  Clock,
  Sparkles,
  Check,
  Trash2,
  Search,
  History,
  Scroll,
} from 'lucide-react';
import type { Store } from '@/store';
import type { QuestType, Difficulty, WorkoutSet, ExerciseCategory, CustomExerciseDefinition, ExerciseEntry } from '@/types';
import { difficultyConfig, questTypeConfig } from '@/data/initialData';
import {
  EXERCISE_CATEGORIES,
  getAllAvailableExercises,
  saveCustomExercise,
} from '@/data/exerciseCatalog';
import { WorkoutHistoryModal } from '@/components/WorkoutHistoryModal';
import { playTimerCompletionSound } from '@/utils/audioEffects';

interface AddScreenProps {
  store: Store;
  onDone: () => void;
}

const iconMap: Record<string, typeof Dumbbell> = {
  Dumbbell,
  Apple,
  Brain,
  Flame,
};

export function AddScreen({ store, onDone }: AddScreenProps) {
  // Navigation mode: 'workout' or 'quest'
  const [activeTab, setActiveTab] = useState<'workout' | 'quest'>('workout');

  // History modal state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // ---------- Quest Creator State ----------
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<QuestType>('workout');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [xpReward, setXpReward] = useState(50);

  const handleQuestSubmit = () => {
    if (!title.trim()) return;
    store.addQuest({
      title: title.trim(),
      description: description.trim() || 'A new quest awaits.',
      type,
      difficulty,
      xpReward,
    });
    onDone();
  };

  // ---------- Workout Logger State ----------
  const [exercisesList, setExercisesList] = useState<CustomExerciseDefinition[]>(() =>
    getAllAvailableExercises()
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<CustomExerciseDefinition | null>(() => {
    const list = getAllAvailableExercises();
    return list[0] ?? null;
  });

  // Custom exercise inline creation
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customNameInput, setCustomNameInput] = useState('');
  const [customCategoryInput, setCustomCategoryInput] = useState<ExerciseCategory>('strength');
  const [customMuscleInput, setCustomMuscleInput] = useState('');

  // Workout parameters
  const [durationMin, setDurationMin] = useState<number>(30);
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high' | 'hunter'>('moderate');
  const [workoutNotes, setWorkoutNotes] = useState('');

  // Sets
  const [sets, setSets] = useState<WorkoutSet[]>([
    { id: 'set-1', setNumber: 1, reps: 10, weightKg: 20, completed: true },
    { id: 'set-2', setNumber: 2, reps: 10, weightKg: 20, completed: true },
    { id: 'set-3', setNumber: 3, reps: 10, weightKg: 20, completed: true },
  ]);

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

  const completedSets = sets.filter((s) => s.completed);
  const totalReps = completedSets.reduce((sum, s) => sum + (s.reps || 0), 0);
  const totalVolumeKg = completedSets.reduce(
    (sum, s) => sum + (s.reps || 0) * (s.weightKg || 0),
    0
  );

  const estimatedCalories = useMemo(() => {
    let rate = 6.5;
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
    const reindexed = filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
    setSets(reindexed);
  };

  const handleSelectExercise = (ex: CustomExerciseDefinition) => {
    setSelectedExercise(ex);
    setSets([
      { id: 'set-1', setNumber: 1, reps: ex.defaultReps || 10, weightKg: ex.defaultWeightKg || 0, completed: true },
      { id: 'set-2', setNumber: 2, reps: ex.defaultReps || 10, weightKg: ex.defaultWeightKg || 0, completed: true },
      { id: 'set-3', setNumber: 3, reps: ex.defaultReps || 10, weightKg: ex.defaultWeightKg || 0, completed: true },
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

  const handleWorkoutSubmit = () => {
    const exerciseName = selectedExercise?.name || 'Custom Training';
    const category = selectedExercise?.category || 'custom';
    const targetMuscle = selectedExercise?.targetMuscle;

    store.logExercise(
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
        notes: workoutNotes.trim() || undefined,
      }
    );

    playTimerCompletionSound();
    onDone();
  };

  const handleRepeatFromHistory = (entry: ExerciseEntry) => {
    if (entry.customName || entry.exerciseType) {
      const all = getAllAvailableExercises();
      const match = all.find(
        (e) =>
          e.name.toLowerCase() ===
          (entry.customName || entry.exerciseType).toLowerCase()
      );
      if (match) {
        setSelectedExercise(match);
      } else {
        setSelectedExercise({
          id: 'custom-repeat',
          name: entry.customName || entry.exerciseType,
          category: entry.category || 'strength',
          defaultReps: 10,
          defaultWeightKg: 20,
        });
      }
    }
    if (entry.sets && entry.sets.length > 0) {
      setSets(entry.sets);
    }
    if (entry.durationMin) setDurationMin(entry.durationMin);
    if (
      entry.intensity === 'low' ||
      entry.intensity === 'moderate' ||
      entry.intensity === 'high' ||
      entry.intensity === 'hunter'
    ) {
      setIntensity(entry.intensity);
    }
    setIsHistoryOpen(false);
  };

  return (
    <div className="px-4 pt-[env(safe-area-inset-top)] pb-32 space-y-5">
      {/* Top bar */}
      <div className="pt-4 flex items-center justify-between animate-fade-in">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Plus className="w-5 h-5 text-primary-400" />
            <h1 className="font-display font-bold text-2xl gradient-text">Command Protocol</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Log tactical combat training or assign new hunter quests.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsHistoryOpen(true)}
          className="glass rounded-xl px-3 py-2 flex items-center gap-1.5 text-primary-300 hover:text-primary-200 border border-primary-500/30 text-xs font-mono active:scale-95 transition-all"
        >
          <History className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Workout</span> Archives
        </button>
      </div>

      {/* Segmented Mode Toggle */}
      <div className="glass-strong rounded-2xl p-1.5 flex gap-1.5 border border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab('workout')}
          className={`flex-1 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'workout'
              ? 'gradient-mixed text-white glow-primary shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>Log Workout (Sets & Reps)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('quest')}
          className={`flex-1 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'quest'
              ? 'gradient-mixed text-white glow-primary shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Scroll className="w-4 h-4" />
          <span>New Quest</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* MODE 1: ENHANCED WORKOUT LOGGER (Sets, Reps, Custom Ex) */}
      {/* ======================================================== */}
      {activeTab === 'workout' && (
        <div className="space-y-4 animate-fade-in">
          {/* Exercise Selection Box */}
          <div className="glass-strong rounded-2xl p-4 space-y-3 border border-primary-500/20">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-primary-400" />
                Exercise Discipline
              </label>

              <button
                type="button"
                onClick={() => setIsCreatingCustom(!isCreatingCustom)}
                className="text-xs font-mono text-primary-300 hover:text-primary-200 flex items-center gap-1 px-2.5 py-1 rounded-lg glass border border-primary-500/20 active:scale-95 transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>{isCreatingCustom ? 'Cancel Custom' : 'Create Custom'}</span>
              </button>
            </div>

            {/* Custom Exercise Creator Sub-panel */}
            {isCreatingCustom ? (
              <form onSubmit={handleSaveCustomExercise} className="glass rounded-xl p-3.5 space-y-3 border border-primary-500/40 animate-scale-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary-300">New Custom Hunter Exercise</span>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Exercise Name *</label>
                  <input
                    type="text"
                    value={customNameInput}
                    onChange={(e) => setCustomNameInput(e.target.value)}
                    placeholder="e.g. Weighted Pull-up, Sandbag Clean..."
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
                      placeholder="e.g. Back, Core, Legs"
                      maxLength={30}
                      className="w-full glass rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 border border-white/10 focus:border-primary-400 mt-1"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!customNameInput.trim()}
                  className="w-full py-2.5 rounded-xl gradient-mixed text-white font-mono text-xs uppercase tracking-wider font-semibold glow-primary disabled:opacity-40"
                >
                  Save & Select Exercise
                </button>
              </form>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search exercise library..."
                    className="w-full glass rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 border border-white/8 focus:border-primary-400/50"
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

                {/* Selected Exercise Badge */}
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
                        {selectedExercise.targetMuscle || 'General Conditioning'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Quick Selection Grid */}
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
            )}
          </div>

          {/* Sets, Reps & Weights Table */}
          <div className="glass-strong rounded-2xl p-4 space-y-3 border border-primary-500/20">
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

            {/* Column Headers */}
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
                  <div className="col-span-2 flex items-center justify-center">
                    <span className="w-6 h-6 rounded-lg bg-base-800 border border-white/10 text-xs font-mono font-bold text-slate-300 flex items-center justify-center">
                      {set.setNumber}
                    </span>
                  </div>

                  {/* Reps */}
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

                  {/* Weight */}
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

                  {/* Checkbox & Delete */}
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

          {/* Duration & Intensity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            </div>

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

          {/* Notes */}
          <div className="glass rounded-2xl p-3.5 space-y-1.5 border border-white/8">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
              Session Combat Notes (Optional)
            </label>
            <textarea
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              placeholder="e.g. Great shoulder pump, felt strong on last set..."
              maxLength={180}
              rows={2}
              className="w-full glass-strong rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 border border-white/8 focus:border-primary-400/50 resize-none"
            />
          </div>

          {/* Metrics summary banner */}
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
                <span className="text-[10px] font-mono uppercase text-slate-400">Reward</span>
                <p className="text-sm font-display font-bold text-primary-300">
                  +{earnedXP} XP
                </p>
              </div>
            </div>
          </div>

          {/* Submit Workout Button */}
          <button
            type="button"
            onClick={handleWorkoutSubmit}
            className="w-full py-4 rounded-2xl gradient-mixed font-display font-bold text-sm uppercase tracking-wider text-white glow-primary hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl"
          >
            <Sparkles className="w-4 h-4 text-warning-300" />
            <span>Complete & Log Workout (+{earnedXP} XP)</span>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: QUEST CREATOR (Original Quests Creation Flow)    */}
      {/* ======================================================== */}
      {activeTab === 'quest' && (
        <div className="space-y-5 animate-fade-in">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Quest Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quest name..."
              maxLength={50}
              className="w-full glass-strong rounded-2xl px-4 py-3.5 text-slate-100 placeholder:text-slate-600 border border-white/8 focus:border-primary-400/50 transition-all duration-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the quest objective..."
              maxLength={200}
              rows={3}
              className="w-full glass-strong rounded-2xl px-4 py-3.5 text-slate-100 placeholder:text-slate-600 border border-white/8 focus:border-primary-400/50 transition-all duration-300 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Quest Type</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(questTypeConfig) as QuestType[]).map((qt) => {
                const config = questTypeConfig[qt];
                const Icon = iconMap[config.icon] ?? Dumbbell;
                const isActive = type === qt;
                return (
                  <button
                    key={qt}
                    type="button"
                    onClick={() => setType(qt)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all duration-300 ${
                      isActive ? 'glass-strong' : 'glass'
                    }`}
                    style={isActive ? { borderColor: config.color + '60', boxShadow: `0 0 15px ${config.color}30` } : {}}
                  >
                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                    <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: isActive ? config.color : '#94a3b8' }}>
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Difficulty</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(difficultyConfig) as Difficulty[]).map((diff) => {
                const config = difficultyConfig[diff];
                const isActive = difficulty === diff;
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all duration-300 ${
                      isActive ? 'glass-strong' : 'glass'
                    }`}
                    style={isActive ? { borderColor: config.color + '60', color: config.color, boxShadow: `0 0 15px ${config.color}30` } : { color: '#94a3b8' }}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400">XP Reward</label>
              <span className="text-lg font-display font-bold gradient-text">{xpReward} XP</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setXpReward((v) => Math.max(10, v - 10))}
                className="w-10 h-10 rounded-xl glass-strong flex items-center justify-center text-slate-300 hover:text-primary-300 transition-all active:scale-95"
              >
                <X className="w-4 h-4 rotate-45" />
              </button>
              <input
                type="range"
                min={10}
                max={300}
                step={10}
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
                className="flex-1 accent-primary-500"
              />
              <button
                type="button"
                onClick={() => setXpReward((v) => Math.min(300, v + 10))}
                className="w-10 h-10 rounded-xl glass-strong flex items-center justify-center text-slate-300 hover:text-primary-300 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleQuestSubmit}
            disabled={!title.trim()}
            className={`w-full py-4 rounded-2xl font-display font-bold text-base uppercase tracking-wider transition-all duration-300 ${
              title.trim()
                ? 'gradient-mixed text-white glow-primary hover:scale-[1.02] active:scale-[0.98]'
                : 'glass text-slate-600 cursor-not-allowed'
            }`}
          >
            Create Quest
          </button>
        </div>
      )}

      {/* Workout Archives Modal */}
      <WorkoutHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        exercises={store.exercises}
        onDeleteExercise={store.deleteExercise}
        onRepeatWorkout={handleRepeatFromHistory}
      />
    </div>
  );
}
