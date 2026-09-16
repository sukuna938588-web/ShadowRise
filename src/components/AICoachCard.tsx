import { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Dumbbell,
  Target,
  Flame,
  Clock,
  Volume2,
} from 'lucide-react';
import type { UserProfile, HunterGoal, QuestType, Difficulty } from '@/types';
import {
  generateAICoachRecommendation,
  HUNTER_GOAL_CONFIG,
} from '@/utils/aiCoachEngine';
import { speakHunterMotivation } from '@/utils/voiceMotivation';

interface AICoachCardProps {
  profile: UserProfile | null;
  onOpenFullModal: (goal?: HunterGoal) => void;
  onAddQuest?: (quest: {
    title: string;
    description: string;
    type: QuestType;
    difficulty: Difficulty;
    xpReward: number;
  }) => void;
  onStartWorkout?: (workoutName: string, exercises: { name: string; sets: number; reps: string }[]) => void;
}

export function AICoachCard({
  profile,
  onOpenFullModal,
  onAddQuest,
  onStartWorkout,
}: AICoachCardProps) {
  const [selectedGoal, setSelectedGoal] = useState<HunterGoal>(
    profile?.workoutGoal || 'strength'
  );
  const [isAccepted, setIsAccepted] = useState(false);

  const recommendation = generateAICoachRecommendation(profile, selectedGoal);
  const { biometrics, injurySafetyGuards, trainingDirective } = recommendation;

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

  const handleVoiceBriefing = () => {
    speakHunterMotivation({
      id: 'ai_coach_briefing',
      title: 'AI Coach Briefing',
      speaker: 'System AI Coach',
      role: 'ai_coach',
      text: `Hunter ${profile?.name || 'Athlete'}. The System evaluated your body mass index of ${biometrics.bmi} and ${injurySafetyGuards.length} physical constraints. Today's objective is ${trainingDirective.title}. ${trainingDirective.aiRationale}`,
    });
  };

  const goalsList: HunterGoal[] = ['strength', 'hypertrophy', 'fat_loss', 'endurance', 'rehab'];

  return (
    <div className="glass-strong glass-card-floating glass-sheen rounded-3xl p-5 relative overflow-hidden border border-primary-500/30 shadow-[0_0_30px_rgba(139,92,246,0.15)] animate-slide-up">
      {/* Background ambient lighting */}
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-primary-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500/20 via-indigo-500/20 to-purple-600/30 border border-primary-400/40 flex items-center justify-center text-primary-300 shadow-sm">
            <BrainCircuit className="w-5 h-5 text-primary-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                <span>System AI Coach</span>
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-primary-500/25 to-indigo-500/25 border border-primary-400/40 text-[9px] font-mono text-primary-200">
                  Biometric Engine
                </span>
              </h3>
              <Sparkles className="w-3.5 h-3.5 text-secondary-400 animate-pulse" />
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Analyzes BMI ({biometrics.bmi}), health constraints & goals
            </p>
          </div>
        </div>

        {/* Voice Briefing Button */}
        <button
          type="button"
          onClick={handleVoiceBriefing}
          className="px-2.5 py-1.5 rounded-xl glass border border-primary-500/30 text-primary-300 hover:text-white hover:bg-primary-500/20 font-mono text-[11px] flex items-center gap-1 transition-all"
          title="Listen to AI voice briefing"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Voice Brief</span>
        </button>
      </div>

      {/* Goal Selector Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
        {goalsList.map((g) => {
          const isSelected = selectedGoal === g;
          return (
            <button
              key={g}
              type="button"
              onClick={() => {
                setSelectedGoal(g);
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

      {/* Biometric Appraisal Badge Row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="glass rounded-xl p-2 text-center border border-white/5">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">BMI Appraisal</span>
          <span className="text-xs font-mono font-bold text-primary-300">
            {biometrics.bmi} · {biometrics.categoryLabel}
          </span>
        </div>
        <div className="glass rounded-xl p-2 text-center border border-white/5">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">TDEE Output</span>
          <span className="text-xs font-mono font-bold text-warning-400">
            {biometrics.tdeeCalories} kcal
          </span>
        </div>
        <div className="glass rounded-xl p-2 text-center border border-white/5">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Hydration Need</span>
          <span className="text-xs font-mono font-bold text-blue-400">
            {biometrics.dailyWaterMl} ml
          </span>
        </div>
      </div>

      {/* Active Injury Guards Banner if any */}
      {injurySafetyGuards.length > 0 && (
        <div className="mb-3.5 p-2.5 rounded-2xl glass border border-amber-500/30 flex items-center gap-2 text-xs">
          <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="text-[11px] font-mono text-amber-200/90 leading-tight">
            AI Injury Filter: {injurySafetyGuards.length} condition{injurySafetyGuards.length > 1 ? 's' : ''} guarded. Harmful joint & spinal loads automatically replaced.
          </span>
        </div>
      )}

      {/* Today's Recommended Routine Card */}
      <div className="glass rounded-2xl p-4 border border-white/10 space-y-2.5">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-mono text-primary-300 uppercase tracking-wider block">
              Today's Prescribed Routine
            </span>
            <h4 className="font-display font-bold text-base text-slate-100">
              {trainingDirective.title}
            </h4>
            <p className="text-xs font-mono text-slate-400">
              {trainingDirective.subtitle}
            </p>
          </div>
          <span className="px-2 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
            +{trainingDirective.xpReward} XP
          </span>
        </div>

        {/* Metrics Row */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-300 pt-1 border-t border-white/5">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-primary-400" />
            <span>{trainingDirective.estimatedMinutes} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-warning-400" />
            <span>{trainingDirective.estimatedCalories} kcal</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-blue-400" />
            <span>{trainingDirective.exercises.length} Exercises</span>
          </div>
        </div>

        {/* AI Rationale Snippet */}
        <p className="text-[11px] font-mono text-slate-300/80 bg-base-950/60 p-2.5 rounded-xl border border-white/5 leading-relaxed">
          <span className="text-primary-300 font-bold">AI Rationale: </span>
          {trainingDirective.aiRationale}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-3.5">
        <button
          type="button"
          onClick={handleAcceptQuest}
          disabled={isAccepted}
          className={`py-2.5 px-3 rounded-xl font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border ${
            isAccepted
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
              : 'gradient-mixed text-white shadow-sm hover:opacity-95'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>{isAccepted ? 'Quest Accepted ✓' : 'Accept as Quest'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (onStartWorkout) {
              onStartWorkout(
                trainingDirective.title,
                trainingDirective.exercises.map((e) => ({
                  name: e.name,
                  sets: e.sets,
                  reps: e.reps,
                }))
              );
            } else {
              onOpenFullModal(selectedGoal);
            }
          }}
          className="py-2.5 px-3 rounded-xl glass border border-primary-500/30 text-primary-300 hover:text-white hover:bg-primary-500/20 font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>Start Workout</span>
        </button>
      </div>

      {/* Full Appraisal Link */}
      <div className="mt-3 pt-2 text-center border-t border-white/5">
        <button
          type="button"
          onClick={() => onOpenFullModal(selectedGoal)}
          className="text-xs font-mono text-slate-400 hover:text-primary-300 inline-flex items-center gap-1 transition-colors"
        >
          <span>View Full Biometrics & Exercise Breakdown</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
