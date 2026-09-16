export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export type QuestType = 'workout' | 'nutrition' | 'mindfulness' | 'challenge';
export type Difficulty = 'easy' | 'normal' | 'hard' | 'extreme';
export type Mood = 'great' | 'good' | 'neutral' | 'tired' | 'bad';

export interface FitnessMetrics {
  exerciseProgress: number;
  hydration: number;
  sleepQuality: number;
  recoveryScore: number;
}

export interface UserProfile {
  name: string;
  email: string;
  photo: string;
  rank: Rank;
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  totalQuestsCompleted: number;
  metrics: FitnessMetrics;
  heightCm?: number;
  weightKg?: number;
  age?: number;
  goalWeightKg?: number;
  gender?: 'male' | 'female' | 'other';
  healthIssues?: HealthIssueKey[];
  healthIssueDetails?: Partial<Record<HealthIssueKey, { severity: HealthSeverity; notes?: string }>>;
}

export type HealthIssueKey =
  | 'back_pain'
  | 'neck_pain'
  | 'knee_pain'
  | 'shoulder_pain'
  | 'poor_posture';

export type HealthSeverity = 'mild' | 'moderate' | 'severe';

export interface HealthIssueConfig {
  key: HealthIssueKey;
  label: string;
  bodyPart: string;
  description: string;
  iconName: string;
  reliefTip: string;
  exercisesToAvoid: string[];
  exercisesToPrioritize: string[];
}

export interface WorkoutExercise {
  name: string;
  sets?: number;
  reps?: string;
  durationMin?: number;
  notes?: string;
}

export interface WorkoutSuggestion {
  id: string;
  title: string;
  subtitle: string;
  category: 'rehab' | 'mobility' | 'strength' | 'cardio' | 'fat_loss' | 'core';
  targetFocus: string;
  durationMin: number;
  estimatedCalories: number;
  xpReward: number;
  difficulty: Difficulty;
  targetedIssues: HealthIssueKey[];
  avoidIfIssues: HealthIssueKey[];
  exercises: WorkoutExercise[];
  whyRecommended: string;
  hunterRankBadge?: Rank;
}

export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export interface BMIAnalysis {
  bmi: number;
  category: BMICategory;
  categoryLabel: string;
  categoryColor: string;
  idealWeightMinKg: number;
  idealWeightMaxKg: number;
  deltaToGoalKg: number | null;
  bmrCalories: number;
  tdeeCalories: number;
  recommendedWaterMl: number;
  hunterStatusTitle: string;
  hunterStatusDescription: string;
}

export interface WaterIntake {
  amountMl: number;
  goalMl: number;
}

export type AlarmSoundId =
  | 'shadow_resonance'
  | 'system_bell'
  | 'level_up'
  | 'dungeon_horn'
  | 'crystal_droplets';

export interface WaterReminderSettings {
  enabled: boolean;
  intervalMinutes: number; // 30, 45, 60, 90, 120
  soundEnabled: boolean;
  sound?: AlarmSoundId;
  lastReminderTime: number | null;
  nextReminderTime: number | null;
}

export interface WorkoutAlarmSettings {
  enabled: boolean;
  time: string; // e.g. "07:30"
  days: string[]; // e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  sound: AlarmSoundId;
  soundEnabled: boolean;
  lastTriggeredDate: string | null;
}

export interface VoiceMotivationSettings {
  enabled: boolean;
  volume?: number;
  rate?: number;
}

export type HunterGoal = 'strength' | 'hypertrophy' | 'fat_loss' | 'endurance' | 'rehab';

export interface AICoachExercise {
  name: string;
  sets: number;
  reps: string;
  weightKg?: number;
  notes: string;
  category?: ExerciseCategory;
}

export interface AICoachRecommendation {
  id: string;
  date: string;
  coachTitle: string;
  statusBadge: string;
  overallScore: number;
  goal: HunterGoal;
  goalLabel: string;
  summaryQuote: string;
  biometrics: {
    bmi: number;
    category: BMICategory;
    categoryLabel: string;
    weightKg: number;
    goalWeightKg?: number;
    weightDeltaKg: number | null;
    tdeeCalories: number;
    dailyWaterMl: number;
    proteinTargetGrams: number;
  };
  injurySafetyGuards: {
    issueKey: HealthIssueKey;
    label: string;
    rule: string;
  }[];
  trainingDirective: {
    title: string;
    subtitle: string;
    focus: string;
    difficulty: Difficulty;
    estimatedMinutes: number;
    estimatedCalories: number;
    xpReward: number;
    warmup: string;
    exercises: AICoachExercise[];
    cooldown: string;
    aiRationale: string;
  };
  recoveryDirective: string;
}


export type ExerciseTimerMode = 'stopwatch' | 'countdown' | 'interval';

export interface IntervalConfig {
  workSeconds: number;
  restSeconds: number;
  totalSets: number;
  prepSeconds: number;
}

export interface HealthMetrics {
  sleepHours: number;
  hydrationPercent: number;
  recoveryScore: number;
  heartRate: number;
  steps: number;
  sleepQuality: number;
}

export interface WeightEntry {
  weightKg: number;
  date: string;
}

export type ExerciseCategory =
  | 'strength'
  | 'bodyweight'
  | 'cardio'
  | 'hiit'
  | 'flexibility'
  | 'combat'
  | 'custom';

export interface WorkoutSet {
  id: string;
  setNumber: number;
  reps: number;
  weightKg?: number;
  durationSec?: number;
  completed: boolean;
}

export interface CustomExerciseDefinition {
  id: string;
  name: string;
  category: ExerciseCategory;
  targetMuscle?: string;
  defaultReps?: number;
  defaultWeightKg?: number;
  isCustom?: boolean;
}

export interface ExerciseEntry {
  id: string;
  exerciseType: string;
  customName?: string;
  category?: ExerciseCategory;
  targetMuscle?: string;
  durationMin: number;
  caloriesBurned: number;
  intensity: string;
  date: string;
  sets?: WorkoutSet[];
  totalSets?: number;
  totalReps?: number;
  totalVolumeKg?: number;
  notes?: string;
  createdAt?: string;
}

export interface ActivityItem {
  id: string;
  type: 'exercise' | 'water' | 'quest' | 'weight' | 'sleep';
  title: string;
  subtitle: string;
  timestamp: string;
  icon: string;
  color: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  difficulty: Difficulty;
  xpReward: number;
  completed: boolean;
  date: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  mood: Mood;
}

export type ScreenName = 'home' | 'quests' | 'alarms' | 'add' | 'notes' | 'profile';

export type AlarmRepeatType = 'once' | 'daily' | 'weekdays' | 'custom';
export type DayOfWeek = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export type BuiltInAlarmSound =
  | 'system_bell'
  | 'shadow_resonance'
  | 'monarch_arise'
  | 'red_gate_alert'
  | 'dungeon_break'
  | 'level_up'
  | 'dungeon_horn'
  | 'crystal_droplets';

export interface ShadowAlarm {
  id: string;
  title: string;
  time: string; // "HH:MM" 24-hr format (e.g. "07:30")
  enabled: boolean;
  repeat: AlarmRepeatType;
  days: DayOfWeek[];
  soundType: 'builtin' | 'custom';
  builtinSound: BuiltInAlarmSound;
  customSoundData?: string; // Base64 audio data URL (e.g. "data:audio/mp3;base64,...")
  customSoundName?: string; // Name of uploaded file (e.g. "my_theme.mp3")
  volume: number; // 0 to 1
  vibration: boolean;
  snoozeCount?: number;
  lastTriggeredDate?: string;
  createdAt: string;
}

export interface AlarmHistoryItem {
  id: string;
  alarmId: string;
  title: string;
  time: string;
  triggeredAt: string; // ISO string
  action: 'dismissed' | 'snoozed' | 'missed';
  snoozeMinutes?: number;
}
