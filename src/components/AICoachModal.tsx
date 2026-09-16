import { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  X,
  Target,
  Dumbbell,
  ShieldCheck,
  Clock,
  Droplets,
  Heart,
  Volume2,
  Activity,
} from 'lucide-react';
import type {
  UserProfile,
  HunterGoal,
  QuestType,
  Difficulty,
  ExerciseTimerMode,
} from '@/types';
import {
  generateAICoachRecommendation,
  HUNTER_GOAL_CONFIG,
} from '@/utils/aiCoachEngine';
import { speakHunterMotivation, stopSpeaking } from '@/utils/voiceMotivation';

interface AICoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  initialGoal?: HunterGoal;
  onAddQuest?: (quest: {
    title: string;
    description: string;
    type: QuestType;
    difficulty: Difficulty;
    xpReward: number;
  }) => void;
  onStartWorkout?: (
    workoutName: string,
    exercises: { name: string; sets: number; reps: string }[]
  ) => void;
  onOpenTimer?: (mode?: ExerciseTimerMode, minutes?: number, title?: string) => void;
}

export function AICoachModal({
  isOpen,
  onClose,
  profile,
  initialGoal = 'strength',
  onAddQuest,
  onStartWorkout,
  onOpenTimer,
}: AICoachModalProps) {
  const [goal, setGoal] = useState<HunterGoal>(initialGoal);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isOpen) return null;

  const recommendation = generateAICoachRecommendation(profile, goal);
  const { biometrics, injurySafetyGuards, trainingDirective, recoveryDirective } =
    recommendation;

  const handleVoiceBriefing = () => {
    stopSpeaking();
    setIsSpeaking(true);
    speakHunterMotivation(
      {
        id: 'ai_coach_detailed_briefing',
        title: 'Full AI Coach Briefing',
        speaker: 'System AI Coach',
        role: 'ai_coach',
        text: `Attention Hunter ${profile?.name || 'Athlete'}. The System evaluated your biometrics: weight of ${biometrics.weightKg} kilograms, body mass index of ${biometrics.bmi}, and ${injurySafetyGuards.length} physical health constraints. Today's optimal directive is ${trainingDirective.title}. ${trainingDirective.aiRationale}. Execute the exercises with strict form and maintain ${biometrics.dailyWaterMl} milliliters of hydration.`,
      },
      {
        playFanfareFirst: true,
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      }
    );
  };

  const handleAcceptQuest = () => {
    if (!onAddQuest) return;
    const exerciseNames = trainingDirective.exercises.map((e) => e.name).join(', ');
    onAddQuest({
      title: trainingDirective.title,
      description: `${trainingDirective.subtitle} · Focus: ${trainingDirective.focus}. Exercises: ${exerciseNames}`,
      type: 'workout',
      difficulty: trainingDirective.difficulty,
      xpReward: trainingDirective.xpReward,
    });
    setIsAccepted(true);
  };

  const handleLaunchLogger = () => {
    if (onStartWorkout) {
      onStartWorkout(
        trainingDirective.title,
        trainingDirective.exercises.map((e) => ({
          name: e.name,
          sets: e.sets,
          reps: e.reps,
        }))
      );
      stopSpeaking();
      onClose();
    }
  };

  const handleLaunchTimer = () => {
    if (onOpenTimer) {
      onOpenTimer('stopwatch', trainingDirective.estimatedMinutes, trainingDirective.title);
      stopSpeaking();
      onClose();
    }
  };

  const goalsList: HunterGoal[] = ['strength', 'hypertrophy', 'fat_loss', 'endurance', 'rehab'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="glass-strong border border-primary-500/40 rounded-3xl w-full max-w-xl p-6 relative overflow-hidden shadow-2xl animate-scale-in max-h-[92vh] overflow-y-auto">
        {/* Glow ambient background */}
        <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full bg-primary-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-52 h-52 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500/20 via-indigo-500/20 to-purple-600/30 border border-primary-400/40 flex items-center justify-center text-primary-300 shadow-sm">
              <BrainCircuit className="w-6 h-6 text-primary-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base tracking-wider uppercase text-slate-100">
                  AI Hunter Coach Appraisal
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-primary-500/20 border border-primary-400/30 text-[9px] font-mono text-primary-300 uppercase">
                  Solo Leveling AI
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Personalized training based on height, weight, BMI, goals & injuries
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hunter Goal Focus Tabs */}
        <div className="mb-4">
          <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">
            Primary Training Focus
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {goalsList.map((g) => {
              const isSelected = goal === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setGoal(g);
                    setIsAccepted(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white border-primary-400/50 shadow-sm font-bold'
                      : 'glass border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {HUNTER_GOAL_CONFIG[g].label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 1: Biometrics & Metabolic Appraisal */}
        <div className="glass rounded-2xl p-4 border border-white/10 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-primary-400" />
              <span>Biometric & Metabolic Diagnostic</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              Status: {recommendation.statusBadge}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="glass-strong rounded-xl p-2.5 text-center border border-white/5">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Height & Weight</span>
              <span className="text-xs font-mono font-bold text-slate-200">
                {profile?.heightCm || 178}cm · {biometrics.weightKg}kg
              </span>
            </div>
            <div className="glass-strong rounded-xl p-2.5 text-center border border-white/5">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">BMI Category</span>
              <span className="text-xs font-mono font-bold text-primary-300">
                {biometrics.bmi} ({biometrics.categoryLabel})
              </span>
            </div>
            <div className="glass-strong rounded-xl p-2.5 text-center border border-white/5">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Daily TDEE</span>
              <span className="text-xs font-mono font-bold text-warning-400">
                {biometrics.tdeeCalories} kcal
              </span>
            </div>
            <div className="glass-strong rounded-xl p-2.5 text-center border border-white/5">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Hydration Target</span>
              <span className="text-xs font-mono font-bold text-blue-400">
                {biometrics.dailyWaterMl} ml/day
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-base-950/60 p-2.5 rounded-xl border border-white/5">
            <div className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Target Daily Protein: <strong className="text-slate-200">{biometrics.proteinTargetGrams}g</strong></span>
            </div>
            {biometrics.weightDeltaKg !== null && (
              <span>
                Goal Delta: <strong className={biometrics.weightDeltaKg > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                  {biometrics.weightDeltaKg > 0 ? `-${biometrics.weightDeltaKg}kg` : `+${Math.abs(biometrics.weightDeltaKg)}kg`}
                </strong>
              </span>
            )}
          </div>
        </div>

        {/* Section 2: Active Health Issue Guards */}
        {injurySafetyGuards.length > 0 && (
          <div className="glass rounded-2xl p-4 border border-amber-500/30 mb-4 space-y-2.5">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-200">
                Active Injury Safeguards ({injurySafetyGuards.length})
              </h3>
            </div>
            <div className="space-y-2">
              {injurySafetyGuards.map((guard) => (
                <div
                  key={guard.issueKey}
                  className="bg-base-950/70 p-2.5 rounded-xl border border-amber-500/20 text-xs font-mono"
                >
                  <div className="text-amber-300 font-bold mb-0.5">{guard.label}</div>
                  <div className="text-slate-300 text-[11px] leading-relaxed">{guard.rule}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Today's Full Prescribed Workout Protocol */}
        <div className="glass rounded-2xl p-4 border border-white/10 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-primary-300 uppercase tracking-wider block">
                Prescribed Combat Directive
              </span>
              <h3 className="font-display font-bold text-base text-slate-100">
                {trainingDirective.title}
              </h3>
              <p className="text-xs font-mono text-slate-400">{trainingDirective.subtitle}</p>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
              +{trainingDirective.xpReward} XP
            </span>
          </div>

          {/* Warmup */}
          <div className="bg-base-950/60 p-2.5 rounded-xl border border-white/5 text-xs font-mono">
            <span className="text-primary-300 font-bold block mb-0.5">Warmup & Activation Protocol:</span>
            <span className="text-slate-300">{trainingDirective.warmup}</span>
          </div>

          {/* Exercise List */}
          <div className="space-y-2">
            {trainingDirective.exercises.map((ex, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl glass border border-white/5 flex items-start justify-between"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-primary-500/20 text-primary-300 text-[10px] font-mono font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-200">{ex.name}</span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 pl-7">{ex.notes}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-primary-300">
                    {ex.sets} sets × {ex.reps}
                  </span>
                  {ex.weightKg !== undefined && ex.weightKg > 0 && (
                    <span className="text-[10px] font-mono text-slate-400 block">
                      @{ex.weightKg}kg load
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Cooldown */}
          <div className="bg-base-950/60 p-2.5 rounded-xl border border-white/5 text-xs font-mono">
            <span className="text-indigo-300 font-bold block mb-0.5">Cooldown & Recovery Protocol:</span>
            <span className="text-slate-300">{trainingDirective.cooldown}</span>
          </div>
        </div>

        {/* Section 4: AI Rationale & System Verdict */}
        <div className="glass rounded-2xl p-4 border border-white/10 mb-5 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-secondary-400" />
              <span>AI Biomechanical Rationale</span>
            </h3>
            <button
              type="button"
              onClick={handleVoiceBriefing}
              className="px-2.5 py-1 rounded-lg bg-primary-500/20 border border-primary-500/30 text-primary-200 font-mono text-[11px] flex items-center gap-1 hover:bg-primary-500/30 transition-all"
            >
              <Volume2 className="w-3 h-3" />
              <span>{isSpeaking ? 'Speaking...' : 'Listen Briefing'}</span>
            </button>
          </div>
          <p className="text-xs font-mono text-slate-300/90 leading-relaxed bg-base-950/70 p-3 rounded-xl border border-white/5">
            {trainingDirective.aiRationale}
          </p>
          <div className="text-[11px] font-mono text-slate-400 pt-1 flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
            <span>{recoveryDirective}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={handleAcceptQuest}
            disabled={isAccepted}
            className={`py-3 px-3 rounded-xl font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border ${
              isAccepted
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'gradient-mixed text-white shadow-sm hover:opacity-95'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>{isAccepted ? 'Quest Logged ✓' : 'Accept Quest'}</span>
          </button>

          <button
            type="button"
            onClick={handleLaunchLogger}
            className="py-3 px-3 rounded-xl glass border border-primary-500/30 text-primary-300 hover:text-white hover:bg-primary-500/20 font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Launch Logger</span>
          </button>

          <button
            type="button"
            onClick={handleLaunchTimer}
            className="py-3 px-3 rounded-xl glass border border-indigo-500/30 text-indigo-300 hover:text-white hover:bg-indigo-500/20 font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Start Timer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
