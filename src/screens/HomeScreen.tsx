import { useState } from 'react';
import { Flame, ChevronRight, Target, Sparkles } from 'lucide-react';
import type { Store } from '@/store';
import type { ScreenName, ExerciseTimerMode, ExerciseEntry } from '@/types';
import { RankBadge } from '@/components/RankBadge';
import { XPBar } from '@/components/XPBar';
import { QuestCard } from '@/components/QuestCard';
import { WaterTracker } from '@/components/WaterTracker';
import { FitnessMetrics } from '@/components/FitnessMetrics';
import { SleepTracker } from '@/components/SleepTracker';
import { WeightTracker } from '@/components/WeightTracker';
import { BMICalculator } from '@/components/BMICalculator';
import { HealthIssuesTracker } from '@/components/HealthIssuesTracker';
import { WorkoutSuggestions } from '@/components/WorkoutSuggestions';
import { RecentActivity } from '@/components/RecentActivity';
import { QuickActions } from '@/components/QuickActions';
import { ExerciseTimerModal } from '@/components/ExerciseTimerModal';
import { WorkoutLoggerModal } from '@/components/WorkoutLoggerModal';
import { WorkoutHistoryModal } from '@/components/WorkoutHistoryModal';
import { WaterReminderPopup, WaterReminderSettingsModal } from '@/components/WaterReminderModal';
import { AICoachCard } from '@/components/AICoachCard';
import { AICoachModal } from '@/components/AICoachModal';
import { CustomAlarmModal } from '@/components/CustomAlarmModal';
import { ShadowAuraAvatar } from '@/components/ShadowAuraAvatar';
import { SystemTypewriterBanner } from '@/components/SystemTypewriterBanner';
import { RankUpCinematicModal } from '@/components/RankUpCinematicModal';
import { rankConfig } from '@/data/initialData';

interface HomeScreenProps {
  store: Store;
  onNavigate: (screen: ScreenName) => void;
}

export function HomeScreen({ store, onNavigate }: HomeScreenProps) {
  const { profile, quests, water, health, weight, weightTrend, activities, exercises } = store;

  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [timerMode, setTimerMode] = useState<ExerciseTimerMode>('stopwatch');
  const [timerMinutes, setTimerMinutes] = useState(15);
  const [timerTitle, setTimerTitle] = useState('Shadow Training');
  const [isWaterSettingsOpen, setIsWaterSettingsOpen] = useState(false);
  const [isCustomAlarmOpen, setIsCustomAlarmOpen] = useState(false);
  const [isAICoachOpen, setIsAICoachOpen] = useState(false);
  const [isRankUpCinematicOpen, setIsRankUpCinematicOpen] = useState(false);

  // Workout Logger & History Modals
  const [isWorkoutLoggerOpen, setIsWorkoutLoggerOpen] = useState(false);
  const [isWorkoutHistoryOpen, setIsWorkoutHistoryOpen] = useState(false);
  const [repeatWorkoutData, setRepeatWorkoutData] = useState<ExerciseEntry | null>(null);

  const handleOpenTimer = (
    mode: ExerciseTimerMode = 'stopwatch',
    minutes = 15,
    title = 'Shadow Training'
  ) => {
    setTimerMode(mode);
    setTimerMinutes(minutes);
    setTimerTitle(title);
    setIsTimerOpen(true);
  };

  const handleRepeatWorkout = (entry: ExerciseEntry) => {
    setRepeatWorkoutData(entry);
    setIsWorkoutLoggerOpen(true);
  };

  if (!profile) return null;

  const rankInfo = rankConfig[profile.rank] ?? rankConfig.E;
  const today = new Date().toISOString().split('T')[0];
  const todayQuests = quests.filter((q) => q.date === today);
  const activeQuests = todayQuests.filter((q) => !q.completed).slice(0, 3);
  const completedCount = todayQuests.filter((q) => q.completed).length;

  return (
    <div className="px-4 pt-[env(safe-area-inset-top)] pb-28 space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between pt-4 animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-mixed flex items-center justify-center glow-primary">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg tracking-wider gradient-text">SHADOWRISE</span>
        </div>
        <button
          onClick={() => onNavigate('profile')}
          className="glass rounded-full px-3 py-1.5 flex items-center gap-1.5 hover:border-primary-400/30 transition-all"
        >
          <Flame className="w-4 h-4 text-warning-400" />
          <span className="text-sm font-mono font-bold text-warning-400">{profile.streak}</span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">day streak</span>
        </button>
      </div>

      {/* Solo Leveling Typewriter System Notification HUD Banner */}
      <SystemTypewriterBanner />

      {/* Rank centerpiece with rotating runic rings */}
      <div className="flex flex-col items-center pt-2 pb-2 animate-scale-in">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="h-px w-12"
            style={{ background: `linear-gradient(90deg, transparent, ${rankInfo.color}60)` }}
          />
          <span
            className="text-xs font-mono uppercase tracking-[0.3em]"
            style={{ color: rankInfo.color }}
          >
            Current Rank
          </span>
          <div
            className="h-px w-12"
            style={{ background: `linear-gradient(90deg, ${rankInfo.color}60, transparent)` }}
          />
        </div>

        <div className="relative">
          <div
            className="absolute inset-0 rounded-full blur-3xl opacity-40 animate-glow-pulse"
            style={{ background: `radial-gradient(circle, ${rankInfo.glow} 0%, transparent 70%)`, width: '200px', height: '200px', left: '-50px', top: '-50px' }}
          />
          <RankBadge
            rank={profile.rank}
            size="xl"
            onClick={() => setIsRankUpCinematicOpen(true)}
          />
        </div>

        <h1
          className="font-display font-bold text-5xl mt-3"
          style={{
            color: rankInfo.color,
            textShadow: `0 0 30px ${rankInfo.glow}, 0 0 60px ${rankInfo.glow}`,
          }}
        >
          {profile.rank} RANK
        </h1>

        {/* Cinematic Awakening trigger hint */}
        <button
          type="button"
          onClick={() => setIsRankUpCinematicOpen(true)}
          className="mt-2 text-[10px] font-mono tracking-widest uppercase text-primary-300 hover:text-primary-100 flex items-center gap-1.5 glass px-3 py-1 rounded-full border border-primary-500/20 active:scale-95 transition-all shadow-sm group"
        >
          <Sparkles className="w-2.5 h-2.5 text-warning-400 group-hover:rotate-12 transition-transform" />
          <span>Cinematic Rank Awakening</span>
        </button>
      </div>

      {/* Profile photo + name + level + XP with Shadow Aura */}
      <div className="glass-strong glass-card-floating glass-sheen rounded-3xl p-5 relative overflow-hidden animate-slide-up">
        <div
          className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-20"
          style={{ background: `radial-gradient(circle, ${rankInfo.glow} 0%, transparent 70%)` }}
        />

        <div className="relative flex items-center gap-4">
          <ShadowAuraAvatar
            photo={profile.photo}
            name={profile.name}
            level={profile.level}
            glowColor={rankInfo.glow}
            onClick={() => onNavigate('profile')}
          />

          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-xl text-slate-100 truncate">{profile.name}</h2>
            <p className="text-xs font-mono text-slate-500 truncate mb-2">{profile.email}</p>
            <XPBar current={profile.xp} max={profile.xpToNext} level={profile.level} />
          </div>
        </div>

        {/* Quick stats row */}
        <div className="relative grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-3 h-3 text-primary-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Quests</span>
            </div>
            <p className="text-base font-display font-bold text-slate-100">{profile.totalQuestsCompleted}</p>
          </div>
          <div className="text-center border-x border-white/5">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-3 h-3 text-warning-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Today</span>
            </div>
            <p className="text-base font-display font-bold text-slate-100">
              {completedCount}<span className="text-xs text-slate-500">/{todayQuests.length}</span>
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-3 h-3 text-warning-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Streak</span>
            </div>
            <p className="text-base font-display font-bold text-slate-100">{profile.streak} days</p>
          </div>
        </div>
      </div>

      {/* Fitness metrics rings */}
      <FitnessMetrics metrics={profile.metrics} />

      {/* Quick actions */}
      <QuickActions
        onAddWater={store.addWater}
        onLogExercise={store.logExercise}
        onOpenTimer={handleOpenTimer}
        onOpenWaterReminder={() => setIsWaterSettingsOpen(true)}
        onOpenCustomAlarms={() => onNavigate('alarms')}
        onOpenWorkoutLogger={() => {
          setRepeatWorkoutData(null);
          setIsWorkoutLoggerOpen(true);
        }}
        onOpenWorkoutHistory={() => setIsWorkoutHistoryOpen(true)}
      />

      {/* Hunter AI Coach Directives & Biometrics Appraisal */}
      <AICoachCard
        profile={profile}
        onOpenModal={() => setIsAICoachOpen(true)}
        onStartExercise={(workout) => {
          handleOpenTimer('stopwatch', workout.durationMin, workout.title);
        }}
      />

      {/* Water tracker */}
      <WaterTracker
        water={water}
        onAdd={store.addWater}
        reminderSettings={store.waterReminder}
        onOpenReminderSettings={() => setIsWaterSettingsOpen(true)}
      />

      {/* Sleep tracker */}
      <SleepTracker health={health} onLogSleep={store.logSleep} />

      {/* Weight & health tracker */}
      <WeightTracker weight={weight} trend={weightTrend} onLogWeight={store.logWeight} />

      {/* Hunter Vitality & BMI Appraisal */}
      <BMICalculator profile={profile} onUpdateBiometrics={store.updateProfile} compact />

      {/* Health Issues & Injury Guard */}
      <HealthIssuesTracker profile={profile} onUpdateProfile={store.updateProfile} compact />

      {/* Personalized Training Directives */}
      <WorkoutSuggestions
        profile={profile}
        onAddQuest={store.addQuest}
        onLogExercise={store.logExercise}
        onOpenTimer={handleOpenTimer}
      />

      {/* Today's quests */}
      <div className="space-y-3 animate-slide-up stagger-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-300">Today's Quests</h2>
          <button
            onClick={() => onNavigate('quests')}
            className="text-[10px] font-mono uppercase tracking-wider text-primary-300 hover:text-primary-200 flex items-center gap-1"
          >
            View All <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {activeQuests.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <Target className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">All quests completed today.</p>
            <p className="text-xs text-slate-500 mt-1">Rest and recover. Tomorrow brings new challenges.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeQuests.map((quest, i) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                index={i}
                onComplete={store.completeQuest}
                onUncomplete={store.uncompleteQuest}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent activity */}
      <RecentActivity
        activities={activities}
        onOpenWorkoutHistory={() => setIsWorkoutHistoryOpen(true)}
      />

      {/* Exercise Timer Modal */}
      <ExerciseTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        initialMode={timerMode}
        initialMinutes={timerMinutes}
        initialWorkoutTitle={timerTitle}
        onLogWorkout={store.logExercise}
      />

      {/* In-App Water Reminder Popup */}
      <WaterReminderPopup
        isOpen={store.isWaterPopupOpen}
        currentWaterMl={water.amountMl}
        goalWaterMl={water.goalMl}
        onDrink250ml={() => {
          store.addWater(250, 10);
          store.dismissWaterReminder();
        }}
        onSnooze={store.snoozeWaterReminder}
        onDismiss={store.dismissWaterReminder}
      />

      {/* Water Reminder Settings Modal */}
      <WaterReminderSettingsModal
        isOpen={isWaterSettingsOpen}
        onClose={() => setIsWaterSettingsOpen(false)}
        settings={store.waterReminder}
        onUpdateSettings={store.updateWaterReminder}
        onTriggerTestReminder={store.triggerWaterReminder}
      />

      {/* Enhanced Combat Workout Logger Modal */}
      <WorkoutLoggerModal
        isOpen={isWorkoutLoggerOpen}
        onClose={() => {
          setIsWorkoutLoggerOpen(false);
          setRepeatWorkoutData(null);
        }}
        initialExerciseName={repeatWorkoutData?.customName || repeatWorkoutData?.exerciseType}
        initialCategory={repeatWorkoutData?.category}
        initialSets={repeatWorkoutData?.sets}
        onLogWorkout={store.logExercise}
      />

      {/* Hunter Workout History Modal */}
      <WorkoutHistoryModal
        isOpen={isWorkoutHistoryOpen}
        onClose={() => setIsWorkoutHistoryOpen(false)}
        exercises={exercises}
        onDeleteExercise={store.deleteExercise}
        onRepeatWorkout={handleRepeatWorkout}
        onOpenLogger={() => {
          setIsWorkoutHistoryOpen(false);
          setRepeatWorkoutData(null);
          setIsWorkoutLoggerOpen(true);
        }}
      />

      {/* Hunter AI Coach Biometric Directives Modal */}
      <AICoachModal
        isOpen={isAICoachOpen}
        onClose={() => setIsAICoachOpen(false)}
        profile={profile}
        onStartWorkout={(workout) => {
          setIsAICoachOpen(false);
          handleOpenTimer('stopwatch', workout.durationMin, workout.title);
        }}
        onUpdateProfile={store.updateProfile}
      />

      {/* Custom Hunter Alarms & Water Reminders Modal */}
      <CustomAlarmModal
        isOpen={isCustomAlarmOpen}
        onClose={() => setIsCustomAlarmOpen(false)}
        workoutAlarm={store.workoutAlarm}
        onUpdateWorkoutAlarm={store.updateWorkoutAlarm}
        onTestWorkoutAlarm={store.triggerWorkoutAlarm}
        waterReminder={store.waterReminder}
        onUpdateWaterReminder={store.updateWaterReminder}
        onTestWaterReminder={store.triggerWaterReminder}
      />

      {/* Solo Leveling Rank-Up Cinematic Animation Modal */}
      <RankUpCinematicModal
        isOpen={isRankUpCinematicOpen}
        onClose={() => setIsRankUpCinematicOpen(false)}
        rank={profile.rank}
        level={profile.level}
        unlockedTitle={`${profile.rank} Rank Shadow Sovereign`}
      />
    </div>
  );
}
