import { useState, useCallback, useEffect, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import type {
  UserProfile,
  Quest,
  Note,
  WaterIntake,
  WaterReminderSettings,
  WorkoutAlarmSettings,
  ShadowAlarm,
  AlarmHistoryItem,
  DayOfWeek,
  HealthMetrics,
  Rank,
  WeightEntry,
  ExerciseEntry,
  ActivityItem,
  WorkoutSet,
  ExerciseCategory,
  RankHistoryEntry,
  SleepSession,
} from '@/types';
import { initialQuests, initialNotes, rankConfig } from '@/data/initialData';
import { supabase } from '@/lib/supabase';
import { playPhaseTransitionTone } from '@/utils/audioEffects';
import {
  generateInitialRankHistory,
  createRankUpHistoryEntry,
  RANK_TIMELINE_DEFINITIONS,
} from '@/data/rankTimelineData';
import {
  getRandomHunterVoiceMessage,
  type VoiceMessage,
} from '@/utils/voiceMotivation';
import {
  XP_REWARDS,
  calculateLevelFromTotalXP,
  calculateRankFromTotalXP,
  getLevelThreshold,
  type XPHistoryItem,
} from '@/utils/progression';
import type { XPToast } from '@/components/XPNotificationHUD';
import type { SoundSystemSettings, SoundEventType } from '@/types/soundSystem';
import { loadSoundSettings, saveSoundSettings, playSoundEvent } from '@/utils/customSoundSystem';

export interface RankUpCelebrationState {
  isOpen: boolean;
  oldRank: Rank;
  newRank: Rank;
  level: number;
  totalXp: number;
  unlockedTitle?: string;
}

export const REGISTRATION_KEY = 'shadowrise_hunter_registered';
const STORAGE_KEY = 'shadowrise_state_v2';
const ALARMS_STORAGE_KEY = 'shadowrise_alarms_v2';
const ALARM_HISTORY_STORAGE_KEY = 'shadowrise_alarm_history_v2';
export const SLEEP_START_KEY = 'shadowrise_sleep_start_time_v2';
export const SLEEP_HISTORY_KEY = 'shadowrise_sleep_history_v2';
export const XP_HISTORY_STORAGE_KEY = 'shadowrise_xp_history_v2';
export const WATER_GOAL_COMPLETED_KEY = 'shadowrise_water_goal_completed_date_v2';
export const WEEKLY_STREAK_KEY = 'shadowrise_last_weekly_streak_v2';
export const GOAL_WEIGHT_KEY = 'shadowrise_goal_weight_achieved_date_v2';
export const LAST_RESET_DATE_KEY = 'shadowrise_last_daily_reset_date_v2';

export function getLocalTodayDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface SleepCalculationResult {
  durationHours: number;
  durationMinutes: number;
  recoveryScore: number;
  energyStatus: string;
  energyStatusKey: 'peak' | 'optimal' | 'moderate' | 'low';
  sleepQualityLabel: string;
  xpEarned: number;
}

/**
 * Calculates dynamic sleep recovery score, energy appraisal, and XP rewards strictly
 * from real elapsed sleep duration.
 *
 * Rules:
 * - Waking up within a few minutes (< 15 mins):
 *   Recovery = 0%, XP = 0
 * - 0–3 hrs: very low recovery (5% - 25%), XP = 5
 * - 4–5 hrs (3.0h to < 5.5h): low recovery (30% - 55%), XP = 10
 * - 6–7 hrs (5.5h to < 7.0h): good recovery (60% - 84%), XP = 20
 * - 7–8 hrs (7.0h to <= 8.5h): excellent recovery (88% - 98%), XP = 35
 * - 8+ hrs (> 8.5h): maximum recovery (98% - 100%), XP = 35
 */
export function calculateSleepRecovery(durationMinutes: number): SleepCalculationResult {
  const safeMins = Math.max(0, Math.floor(durationMinutes));
  const durationHours = Math.round((safeMins / 60) * 10) / 10;

  // 1. If user wakes up within a few minutes (< 15 mins):
  // Recovery should remain near 0%, XP should be 0.
  if (safeMins < 15) {
    return {
      durationHours,
      durationMinutes: safeMins,
      recoveryScore: 0,
      energyStatus: 'Premature Awakening · Interrupted Protocol',
      energyStatusKey: 'low',
      sleepQualityLabel: 'Rest Interrupted (< 15m elapsed)',
      xpEarned: 0,
    };
  }

  // 2. 0–3 hrs (15 mins to < 3.0 hrs): very low recovery
  if (durationHours < 3.0) {
    const recoveryScore = Math.max(5, Math.min(25, Math.round(5 + (durationHours / 3.0) * 20)));
    return {
      durationHours,
      durationMinutes: safeMins,
      recoveryScore,
      energyStatus: 'Fatigued Vessel · Mana Depleted',
      energyStatusKey: 'low',
      sleepQualityLabel: 'Critical Rest Deficit',
      xpEarned: 5,
    };
  }

  // 3. 4–5 hrs (3.0 hrs to < 5.5 hrs): low recovery
  if (durationHours < 5.5) {
    const recoveryScore = Math.max(30, Math.min(55, Math.round(30 + ((durationHours - 3.0) / 2.5) * 25)));
    return {
      durationHours,
      durationMinutes: safeMins,
      recoveryScore,
      energyStatus: 'Moderate Vitality · Standard Mana Reserves',
      energyStatusKey: 'moderate',
      sleepQualityLabel: 'Partial Recovery',
      xpEarned: 10,
    };
  }

  // 4. 6–7 hrs (5.5 hrs to < 7.0 hrs): good recovery
  if (durationHours < 7.0) {
    const recoveryScore = Math.max(60, Math.min(84, Math.round(60 + ((durationHours - 5.5) / 1.5) * 24)));
    return {
      durationHours,
      durationMinutes: safeMins,
      recoveryScore,
      energyStatus: 'High Combat Readiness · Mana Stabilized',
      energyStatusKey: 'optimal',
      sleepQualityLabel: 'Good Restorative Sleep',
      xpEarned: 20,
    };
  }

  // 5. 7–8 hrs (7.0 hrs to <= 8.5 hrs): excellent recovery
  if (durationHours <= 8.5) {
    const recoveryScore = Math.max(88, Math.min(98, Math.round(88 + ((durationHours - 7.0) / 1.5) * 10)));
    return {
      durationHours,
      durationMinutes: safeMins,
      recoveryScore,
      energyStatus: 'Apex Sovereign Vitality · 100% Mana Restored',
      energyStatusKey: 'peak',
      sleepQualityLabel: 'Optimal Sovereign Rest',
      xpEarned: 35,
    };
  }

  // 6. 8+ hrs (> 8.5 hrs): maximum recovery
  const recoveryScore = Math.min(100, Math.round(98 + Math.min(2, (durationHours - 8.5) * 2)));
  return {
    durationHours,
    durationMinutes: safeMins,
    recoveryScore,
    energyStatus: 'Apex Sovereign Vitality · 100% Mana Restored',
    energyStatusKey: 'peak',
    sleepQualityLabel: 'Flawless Rejuvenation',
    xpEarned: 35,
  };
}

const defaultShadowAlarms: ShadowAlarm[] = [
  {
    id: 'alarm-default-1',
    title: 'Daily Quest: Physical Re-conditioning',
    time: '06:30',
    enabled: true,
    repeat: 'daily',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    soundType: 'builtin',
    builtinSound: 'monarch_arise',
    volume: 0.85,
    vibration: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'alarm-default-2',
    title: 'Shadow Monarch Recovery & Sleep',
    time: '21:30',
    enabled: true,
    repeat: 'daily',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    soundType: 'builtin',
    builtinSound: 'shadow_resonance',
    volume: 0.8,
    vibration: true,
    createdAt: new Date().toISOString(),
  },
];

interface PersistedState {
  profile: UserProfile | null;
  water: WaterIntake;
  waterReminder: WaterReminderSettings;
  workoutAlarm: WorkoutAlarmSettings;
  health: HealthMetrics;
  weight: WeightEntry;
  weightTrend: { current: number; previous: number };
  exercises: ExerciseEntry[];
  activities: ActivityItem[];
  quests: Quest[];
  notes: Note[];
  isRegistered?: boolean;
  rankHistory?: RankHistoryEntry[];
  sleepStartTime?: string | null;
  sleepHistory?: SleepSession[];
  xpHistory?: XPHistoryItem[];
  waterGoalCompletedDate?: string | null;
  lastWeeklyStreakRewardStreak?: number;
  goalWeightAchievedDate?: string | null;
  lastResetDate?: string | null;
}

function defaultProfile(name: string, email: string): UserProfile {
  const initialTotalXP = 0;
  const initialLevel = calculateLevelFromTotalXP(initialTotalXP);
  const initialRank = calculateRankFromTotalXP(initialTotalXP);
  const initialNext = getLevelThreshold(initialLevel);

  return {
    name: name || 'Shadow Hunter',
    email: email || 'hunter@shadowrise.local',
    photo: '',
    rank: initialRank,
    level: initialLevel,
    xp: initialTotalXP,
    totalXp: initialTotalXP,
    xpToNext: initialNext,
    streak: 1,
    totalQuestsCompleted: 0,
    heightCm: 178,
    weightKg: 72.5,
    age: 24,
    goalWeightKg: 75.0,
    gender: 'male',
    metrics: {
      exerciseProgress: 0,
      hydration: 0,
      sleepQuality: 0,
      recoveryScore: 0,
    },
  };
}

function loadInitialState(): PersistedState {
  const today = getLocalTodayDate();
  const defaults: PersistedState = {
    profile: defaultProfile('Shadow Hunter', 'hunter@shadowrise.local'),
    water: { amountMl: 0, goalMl: 3000 },
    waterReminder: {
      enabled: true,
      intervalMinutes: 60,
      soundEnabled: true,
      sound: 'crystal_droplets',
      lastReminderTime: null,
      nextReminderTime: Date.now() + 60 * 60 * 1000,
    },
    workoutAlarm: {
      enabled: false,
      time: '08:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      sound: 'system_bell',
      soundEnabled: true,
      lastTriggeredDate: null,
    },
    health: {
      sleepHours: 0,
      hydrationPercent: 0,
      recoveryScore: 0,
      heartRate: 68,
      steps: 0,
      sleepQuality: 0,
    },
    weight: { weightKg: 72.5, date: today },
    weightTrend: { current: 72.5, previous: 72.5 },
    exercises: [],
    activities: [],
    quests: initialQuests.map((q) => ({ ...q, completed: false, date: today })),
    notes: initialNotes,
    rankHistory: generateInitialRankHistory('E', 1, undefined, 0, 0),
    sleepStartTime: null,
    sleepHistory: [],
    lastResetDate: today,
  };

  try {
    const rawSleepStart = typeof window !== 'undefined' ? localStorage.getItem(SLEEP_START_KEY) : null;
    const rawSleepHist = typeof window !== 'undefined' ? localStorage.getItem(SLEEP_HISTORY_KEY) : null;
    let initialSleepHist: SleepSession[] = [];
    if (rawSleepHist) {
      try {
        const parsedHist = JSON.parse(rawSleepHist);
        if (Array.isArray(parsedHist)) initialSleepHist = parsedHist;
      } catch {
        // ignore
      }
    }
    defaults.sleepStartTime = rawSleepStart;
    defaults.sleepHistory = initialSleepHist;

    const storedResetDate = typeof window !== 'undefined'
      ? localStorage.getItem(LAST_RESET_DATE_KEY)
      : null;

    const rawV2 = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (parsed && typeof parsed === 'object') {
        const regFlag = typeof window !== 'undefined' && localStorage.getItem(REGISTRATION_KEY) === 'true';
        const isReg = regFlag || Boolean(parsed.isRegistered || parsed.profile?.isRegistered);

        const recordedResetDate = storedResetDate || parsed.lastResetDate || null;
        const isNewCalendarDay = !recordedResetDate || recordedResetDate !== today;

        if (isNewCalendarDay && typeof window !== 'undefined') {
          try {
            localStorage.setItem(LAST_RESET_DATE_KEY, today);
          } catch {
            // ignore
          }
        }

        const rawExercises = (!isReg)
          ? []
          : (Array.isArray(parsed.exercises) ? parsed.exercises : []);

        const loadedSleepHist: SleepSession[] = (!isReg)
          ? []
          : (initialSleepHist.length > 0
              ? initialSleepHist
              : Array.isArray(parsed.sleepHistory)
              ? parsed.sleepHistory
              : []);

        // Today's completed sleep session check: only valid if completed today
        const todaySleepSession = isNewCalendarDay || !isReg
          ? undefined
          : loadedSleepHist.find((s) => {
              if (!s) return false;
              if (s.date === today) return true;
              const endStr = s.endTime || s.createdAt || '';
              return endStr.startsWith(today);
            });

        // Today's exercises only
        const todayExercises = isNewCalendarDay || !isReg
          ? []
          : rawExercises.filter(
              (e) => e && (e.date === today || (e.createdAt && e.createdAt.startsWith(today)))
            );
        const todayExMinutes = todayExercises.reduce((sum, e) => sum + (Number(e.durationMin) || 0), 0);
        const exerciseProgress = (isNewCalendarDay || !isReg)
          ? 0
          : Math.min(Math.round((todayExMinutes / 60) * 100), 100);

        // Water: resets to 0% for new day or new user; otherwise recalculate from today's amount
        const currentWaterAmount = (isNewCalendarDay || !isReg)
          ? 0
          : Math.max(0, Number(parsed.water?.amountMl ?? 0));
        const waterGoal = Math.max(1000, Number(parsed.water?.goalMl ?? 3000));
        const hydration = (isNewCalendarDay || !isReg)
          ? 0
          : Math.min(Math.round((currentWaterAmount / waterGoal) * 100), 100);

        // Sleep & Recovery: 0% on day change or new user; otherwise from today's completed session
        const sleepHours = todaySleepSession ? (Number(todaySleepSession.durationHours) || 0) : 0;
        const sleepQuality = todaySleepSession ? Math.min(Math.round((sleepHours / 8) * 100), 100) : 0;
        const recoveryScore = todaySleepSession ? (Number(todaySleepSession.recoveryScore) || 0) : 0;

        const safeProfile = parsed.profile && typeof parsed.profile === 'object'
          ? {
              ...defaults.profile,
              ...parsed.profile,
              healthIssues: Array.isArray(parsed.profile.healthIssues)
                ? parsed.profile.healthIssues
                : defaults.profile.healthIssues,
            }
          : defaults.profile;

        const loadedRankHistory = Array.isArray(parsed.rankHistory) && parsed.rankHistory.length > 0
          ? parsed.rankHistory
          : generateInitialRankHistory(
              safeProfile?.rank || 'E',
              safeProfile?.level || 1,
              safeProfile?.registeredAt,
              safeProfile?.totalQuestsCompleted || 0,
              ((safeProfile?.level || 1) - 1) * 500 + (safeProfile?.xp || 0)
            );

        const totalXp = Math.max(0, Number(safeProfile?.totalXp ?? safeProfile?.xp ?? 0));
        const computedLevel = calculateLevelFromTotalXP(totalXp);
        const computedRank = calculateRankFromTotalXP(totalXp);
        const computedXpToNext = getLevelThreshold(computedLevel);

        const normalizedProfile: UserProfile = {
          ...safeProfile,
          totalXp,
          xp: totalXp,
          level: computedLevel,
          rank: computedRank,
          xpToNext: computedXpToNext,
          isRegistered: isReg,
          rankHistory: loadedRankHistory,
          metrics: {
            exerciseProgress,
            hydration,
            sleepQuality,
            recoveryScore,
          },
        };

        const questsToUse = (Array.isArray(parsed.quests) && parsed.quests.length > 0 ? parsed.quests : initialQuests)
          .map((q) => (isNewCalendarDay || !isReg ? { ...q, completed: false, date: today } : q));

        return {
          ...defaults,
          ...parsed,
          profile: normalizedProfile,
          rankHistory: loadedRankHistory,
          isRegistered: isReg,
          sleepStartTime: isReg ? (rawSleepStart ?? parsed.sleepStartTime ?? null) : null,
          sleepHistory: loadedSleepHist,
          lastResetDate: today,
          water: {
            amountMl: currentWaterAmount,
            goalMl: waterGoal,
          },
          waterReminder: parsed.waterReminder && typeof parsed.waterReminder === 'object'
            ? { ...defaults.waterReminder, ...parsed.waterReminder }
            : defaults.waterReminder,
          workoutAlarm: parsed.workoutAlarm && typeof parsed.workoutAlarm === 'object'
            ? { ...defaults.workoutAlarm, ...parsed.workoutAlarm }
            : defaults.workoutAlarm,
          health: {
            sleepHours,
            hydrationPercent: hydration,
            recoveryScore,
            heartRate: parsed.health?.heartRate || 68,
            steps: isNewCalendarDay || !isReg ? 0 : (parsed.health?.steps || 0),
            sleepQuality,
          },
          weight: parsed.weight && typeof parsed.weight === 'object'
            ? { ...defaults.weight, ...parsed.weight }
            : defaults.weight,
          weightTrend: parsed.weightTrend && typeof parsed.weightTrend === 'object'
            ? { ...defaults.weightTrend, ...parsed.weightTrend }
            : defaults.weightTrend,
          exercises: rawExercises,
          activities: isNewCalendarDay || !isReg ? [] : (Array.isArray(parsed.activities) ? parsed.activities : defaults.activities),
          quests: questsToUse,
          notes: Array.isArray(parsed.notes) && parsed.notes.length > 0 ? parsed.notes : initialNotes,
        };
      }
    }
    // Backward compatibility with v1
    const rawV1 = localStorage.getItem('shadowrise_state_v1');
    if (rawV1) {
      const parsedV1 = JSON.parse(rawV1);
      if (parsedV1 && typeof parsedV1 === 'object') {
        return {
          ...defaults,
          quests: Array.isArray(parsedV1.quests) && parsedV1.quests.length > 0 ? parsedV1.quests : initialQuests,
          notes: Array.isArray(parsedV1.notes) && parsedV1.notes.length > 0 ? parsedV1.notes : initialNotes,
        };
      }
    }
  } catch (err) {
    console.warn('[AI Studio] Storage load error:', err);
  }
  return defaults;
}

function saveState(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('[AI Studio] Storage save error:', err);
  }
}

export function useStore(session?: Session | null) {
  const [initial] = useState<PersistedState>(loadInitialState);
  const [profile, setProfile] = useState<UserProfile | null>(initial.profile);
  const [isRegistered, setIsRegistered] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return false;
      if (localStorage.getItem(REGISTRATION_KEY) === 'true') return true;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.isRegistered || parsed?.profile?.isRegistered) return true;
      }
    } catch {
      // ignore
    }
    return false;
  });
  const [water, setWater] = useState<WaterIntake>(initial.water);
  const [waterReminder, setWaterReminder] = useState<WaterReminderSettings>(
    initial.waterReminder || {
      enabled: true,
      intervalMinutes: 60,
      soundEnabled: true,
      sound: 'crystal_droplets',
      lastReminderTime: null,
      nextReminderTime: Date.now() + 60 * 60 * 1000,
    }
  );
  const [isWaterPopupOpen, setIsWaterPopupOpen] = useState(false);
  const [workoutAlarm, setWorkoutAlarm] = useState<WorkoutAlarmSettings>(
    initial.workoutAlarm || {
      enabled: false,
      time: '08:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      sound: 'system_bell',
      soundEnabled: true,
      lastTriggeredDate: null,
    }
  );
  const [isWorkoutAlarmPopupOpen, setIsWorkoutAlarmPopupOpen] = useState(false);

  // Voice motivation state
  const [isVoiceMotivationOpen, setIsVoiceMotivationOpen] = useState(false);
  const [voiceMotivationData, setVoiceMotivationData] = useState<{
    message: VoiceMessage;
    workoutTitle: string;
    xpEarned: number;
  }>({
    message: getRandomHunterVoiceMessage(),
    workoutTitle: 'Combat Training',
    xpEarned: 150,
  });
  const [health, setHealth] = useState<HealthMetrics>(initial.health);
  const [weight, setWeight] = useState<WeightEntry>(initial.weight);
  const [weightTrend, setWeightTrend] = useState<{ current: number; previous: number }>(initial.weightTrend);
  const [exercises, setExercises] = useState<ExerciseEntry[]>(initial.exercises);
  const [activities, setActivities] = useState<ActivityItem[]>(initial.activities);
  const [quests, setQuests] = useState<Quest[]>(initial.quests);
  const [notes, setNotes] = useState<Note[]>(initial.notes);
  const [loading, setLoading] = useState(false);
  const [rankHistory, setRankHistory] = useState<RankHistoryEntry[]>(() => {
    if (Array.isArray(initial.rankHistory) && initial.rankHistory.length > 0) {
      return initial.rankHistory;
    }
    return generateInitialRankHistory(
      initial.profile?.rank || 'E',
      initial.profile?.level || 1,
      initial.profile?.registeredAt,
      initial.profile?.totalQuestsCompleted || 0,
      ((initial.profile?.level || 1) - 1) * 500 + (initial.profile?.xp || 0)
    );
  });

  // Unlimited ShadowRise Alarms State
  const [alarms, setAlarms] = useState<ShadowAlarm[]>(() => {
    try {
      const raw = localStorage.getItem(ALARMS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.warn('Error loading alarms from localStorage', err);
    }
    return defaultShadowAlarms;
  });

  const [alarmHistory, setAlarmHistory] = useState<AlarmHistoryItem[]>(() => {
    try {
      const raw = localStorage.getItem(ALARM_HISTORY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.warn('Error loading alarm history from localStorage', err);
    }
    return [];
  });

  const [activeRingingAlarm, setActiveRingingAlarm] = useState<ShadowAlarm | null>(null);

  // Custom Sound & Alert System State
  const [soundSettings, setSoundSettings] = useState<SoundSystemSettings>(loadSoundSettings);
  const soundSettingsRef = useRef(soundSettings);
  soundSettingsRef.current = soundSettings;

  const updateSoundSettings = useCallback((updates: Partial<SoundSystemSettings>) => {
    setSoundSettings((prev) => {
      const next: SoundSystemSettings = {
        ...prev,
        ...updates,
        events: updates.events ? { ...prev.events, ...updates.events } : prev.events,
      };
      saveSoundSettings(next);
      return next;
    });
  }, []);

  const triggerSoundEvent = useCallback((eventType: SoundEventType) => {
    playSoundEvent(eventType, soundSettingsRef.current);
  }, []);

  // Sleep Tracking System State
  const [sleepStartTime, setSleepStartTime] = useState<string | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(SLEEP_START_KEY);
        if (stored) return stored;
      }
    } catch {
      // ignore
    }
    return initial.sleepStartTime ?? null;
  });

  const [sleepHistory, setSleepHistory] = useState<SleepSession[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(SLEEP_HISTORY_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch {
      // ignore
    }
    return Array.isArray(initial.sleepHistory) ? initial.sleepHistory : [];
  });

  const [activeRecoveryReport, setActiveRecoveryReport] = useState<SleepSession | null>(null);

  // Daily Reset Tracking State
  const [lastResetDate, setLastResetDate] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LAST_RESET_DATE_KEY);
      if (stored) return stored;
    }
    return initial.lastResetDate || getLocalTodayDate();
  });
  const lastResetDateRef = useRef(lastResetDate);

  // Sync sleep history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SLEEP_HISTORY_KEY, JSON.stringify(sleepHistory));
    } catch (err) {
      console.warn('Error saving sleep history', err);
    }
  }, [sleepHistory]);

  // Real XP History & Notifications State
  const [xpHistory, setXpHistory] = useState<XPHistoryItem[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(XP_HISTORY_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch (err) {
      console.warn('Error loading XP history from localStorage', err);
    }
    return [];
  });

  const [xpToasts, setXpToasts] = useState<XPToast[]>([]);

  const dismissXpToast = useCallback((id: string) => {
    setXpToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Full-Screen High-Impact Celebration Animation State on Rank Crossing
  const [rankUpCelebration, setRankUpCelebration] = useState<RankUpCelebrationState | null>(null);

  const dismissRankUpCelebration = useCallback(() => {
    setRankUpCelebration(null);
  }, []);

  const triggerRankUpCelebration = useCallback((targetRank?: Rank, fromRank?: Rank) => {
    if (!profile) return;
    const nRank = targetRank || profile.rank;
    const oRank = fromRank || (nRank === 'S' ? 'A' : nRank === 'A' ? 'B' : nRank === 'B' ? 'C' : nRank === 'C' ? 'D' : 'E');
    const title = RANK_TIMELINE_DEFINITIONS[nRank]?.title || `${nRank} Rank Shadow Sovereign`;
    setRankUpCelebration({
      isOpen: true,
      oldRank: oRank,
      newRank: nRank,
      level: profile.level,
      totalXp: profile.totalXp ?? profile.xp ?? 1000,
      unlockedTitle: title,
    });
  }, [profile]);

  // Sync XP history to localStorage permanently
  useEffect(() => {
    try {
      localStorage.setItem(XP_HISTORY_STORAGE_KEY, JSON.stringify(xpHistory));
    } catch (err) {
      console.warn('Error saving XP history', err);
    }
  }, [xpHistory]);

  // Sync sleep start time to localStorage
  useEffect(() => {
    try {
      if (sleepStartTime) {
        localStorage.setItem(SLEEP_START_KEY, sleepStartTime);
      } else {
        localStorage.removeItem(SLEEP_START_KEY);
      }
    } catch (err) {
      console.warn('Error saving sleep start time', err);
    }
  }, [sleepStartTime]);

  // Sync alarms to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms));
    } catch (err) {
      console.warn('Error saving alarms to localStorage', err);
    }
  }, [alarms]);

  // Sync alarm history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ALARM_HISTORY_STORAGE_KEY, JSON.stringify(alarmHistory));
    } catch (err) {
      console.warn('Error saving alarm history to localStorage', err);
    }
  }, [alarmHistory]);

  const questsRef = useRef<Quest[]>(initial.quests);
  useEffect(() => {
    questsRef.current = quests;
  }, [quests]);

  // Sync complete application state to localStorage permanently
  useEffect(() => {
    saveState({
      profile,
      water,
      waterReminder,
      workoutAlarm,
      health,
      weight,
      weightTrend,
      exercises,
      activities,
      quests,
      notes,
      isRegistered,
      rankHistory,
      sleepStartTime,
      sleepHistory,
      xpHistory,
      lastResetDate,
    });
  }, [profile, water, waterReminder, workoutAlarm, health, weight, weightTrend, exercises, activities, quests, notes, isRegistered, rankHistory, sleepStartTime, sleepHistory, xpHistory, lastResetDate]);

  // Load cloud data only if an explicit user session exists
  useEffect(() => {
    if (!session?.user) {
      // Local storage / offline mode: preserve local profile
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const user = session.user;
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Athlete';
        const email = user.email || '';
        const photo = user.user_metadata?.avatar_url || '';
        const today = getLocalTodayDate();

      // Load or create user profile
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (cancelled) return;

      if (existingProfile) {
        setProfile((prev) => ({
          ...(prev || defaultProfile(name, email)),
          name: prev?.name || name,
          email: prev?.email || email,
          photo: prev?.photo || photo,
          rank: (existingProfile.rank as Rank) || prev?.rank || 'E',
          level: existingProfile.level ?? prev?.level ?? 1,
          xp: existingProfile.xp ?? prev?.xp ?? 0,
          xpToNext: existingProfile.xp_to_next ?? prev?.xpToNext ?? 500,
          streak: existingProfile.streak ?? prev?.streak ?? 1,
          totalQuestsCompleted: existingProfile.total_quests_completed ?? prev?.totalQuestsCompleted ?? 0,
          metrics: {
            exerciseProgress: 0,
            hydration: 0,
            sleepQuality: 0,
            recoveryScore: 0,
          },
        }));
      } else {
        await supabase.from('user_profiles').insert({ user_id: user.id });
        setProfile((prev) => prev || defaultProfile(name, email));
      }

      // Load today's water intake
      const { data: waterData } = await supabase
        .from('water_intake')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (cancelled) return;

      if (waterData) {
        setWater({ amountMl: waterData.amount_ml, goalMl: waterData.goal_ml });
      } else {
        setWater({ amountMl: 0, goalMl: 3000 });
      }

      // Load today's health metrics
      const { data: healthData } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (cancelled) return;

      if (healthData) {
        setHealth({
          sleepHours: Number(healthData.sleep_hours),
          hydrationPercent: healthData.hydration_percent,
          recoveryScore: healthData.recovery_score,
          heartRate: healthData.heart_rate,
          steps: healthData.steps,
          sleepQuality: healthData.sleep_quality ?? 0,
        });
      } else {
        const defaults = {
          sleep_hours: 0,
          hydration_percent: 0,
          recovery_score: 0,
          heart_rate: 68,
          steps: 0,
          sleep_quality: 0,
        };
        await supabase.from('health_metrics').insert({ user_id: user.id, ...defaults });
        setHealth({
          sleepHours: 0,
          hydrationPercent: 0,
          recoveryScore: 0,
          heartRate: 68,
          steps: 0,
          sleepQuality: 0,
        });
      }

      // Load weight entries
      const { data: weightData } = await supabase
        .from('weight_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(10);

      if (cancelled) return;

      if (weightData && weightData.length > 0) {
        const latest = weightData[0];
        const prev = weightData[1];
        setWeight({ weightKg: Number(latest.weight_kg), date: latest.date });
        setWeightTrend({
          current: Number(latest.weight_kg),
          previous: prev ? Number(prev.weight_kg) : Number(latest.weight_kg),
        });
      } else {
        const defaultWeight = 75.0;
        await supabase.from('weight_entries').insert({
          user_id: user.id,
          weight_kg: defaultWeight,
          date: today,
        });
        setWeight({ weightKg: defaultWeight, date: today });
        setWeightTrend({ current: defaultWeight, previous: defaultWeight });
      }

      // Load today's exercise logs
      const { data: exerciseData } = await supabase
        .from('exercise_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: false });

      if (cancelled) return;

      if (exerciseData) {
        setExercises((prevLocal) => {
          const localMap = new Map(prevLocal.map((item) => [item.id, item]));
          return exerciseData.map((e) => {
            const local = localMap.get(e.id);
            return {
              id: e.id,
              exerciseType: e.exercise_type,
              customName: local?.customName,
              category: local?.category,
              targetMuscle: local?.targetMuscle,
              durationMin: e.duration_min,
              caloriesBurned: e.calories_burned,
              intensity: e.intensity,
              date: e.date,
              sets: local?.sets,
              totalSets: local?.totalSets,
              totalReps: local?.totalReps,
              totalVolumeKg: local?.totalVolumeKg,
              notes: local?.notes,
              createdAt: local?.createdAt,
            };
          });
        });
      }

      // Build activity feed
      const activityItems: ActivityItem[] = [];
      if (exerciseData && exerciseData.length > 0) {
        for (const e of exerciseData.slice(0, 3)) {
          activityItems.push({
            id: e.id,
            type: 'exercise',
            title: `${e.exercise_type} session`,
            subtitle: `${e.duration_min} min · ${e.calories_burned} cal`,
            timestamp: e.created_at,
            icon: 'Dumbbell',
            color: '#f87171',
          });
        }
      }
      if (waterData && waterData.amount_ml > 0) {
        activityItems.push({
          id: 'water-activity',
          type: 'water',
          title: 'Water logged',
          subtitle: `${(waterData.amount_ml / 1000).toFixed(2)}L consumed`,
          timestamp: waterData.updated_at ?? today,
          icon: 'Droplets',
          color: '#60a5fa',
        });
      }
      const currentQuests = questsRef.current || [];
      const completedQuests = Array.isArray(currentQuests)
        ? currentQuests.filter((q) => q && q.completed)
        : [];
      for (const q of completedQuests.slice(0, 2)) {
        if (!q) continue;
        activityItems.push({
          id: `quest-${q.id}`,
          type: 'quest',
          title: q.title || 'Completed Directive',
          subtitle: `+${q.xpReward || 0} XP earned`,
          timestamp: q.date || today,
          icon: 'Check',
          color: '#34d399',
        });
      }
      setActivities(activityItems);

      // Update profile metrics from today's data
      const exerciseProgress = exerciseData
        ? Math.min(exerciseData.reduce((sum, e) => sum + e.duration_min, 0) / 60 * 100, 100)
        : 0;
      const hydrationPct = waterData
        ? Math.min(Math.round((waterData.amount_ml / (waterData?.goal_ml || 3000)) * 100), 100)
        : 0;
      const sleepQ = healthData?.sleep_quality ?? 0;
      const recovery = healthData?.recovery_score ?? 0;

      if (existingProfile) {
        const metricsUpdate = {
          exercise_progress: Math.round(exerciseProgress),
          hydration_score: hydrationPct,
          sleep_quality: sleepQ,
          recovery_score: recovery,
          updated_at: new Date().toISOString(),
        };
        await supabase.from('user_profiles').update(metricsUpdate).eq('user_id', user.id);
      }

      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          metrics: {
            exerciseProgress: Math.round(exerciseProgress),
            hydration: hydrationPct,
            sleepQuality: sleepQ,
            recoveryScore: recovery,
          },
        };
      });
    } catch (err) {
      console.warn('[AI Studio] Supabase load error:', err);
      const user = session.user;
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Athlete';
      const email = user.email || '';
      setProfile((prev) => prev || defaultProfile(name, email));
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
    })();

    return () => { cancelled = true; };
  }, [session]);

  const syncProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!session?.user) return;
    const dbUpdates: Record<string, unknown> = {};
    if (updates.rank !== undefined) dbUpdates.rank = updates.rank;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.xp !== undefined) dbUpdates.xp = updates.xp;
    if (updates.xpToNext !== undefined) dbUpdates.xp_to_next = updates.xpToNext;
    if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
    if (updates.totalQuestsCompleted !== undefined) dbUpdates.total_quests_completed = updates.totalQuestsCompleted;
    if (updates.metrics) {
      dbUpdates.exercise_progress = updates.metrics.exerciseProgress;
      dbUpdates.hydration_score = updates.metrics.hydration;
      dbUpdates.sleep_quality = updates.metrics.sleepQuality;
      dbUpdates.recovery_score = updates.metrics.recoveryScore;
    }
    dbUpdates.updated_at = new Date().toISOString();
    await supabase.from('user_profiles').update(dbUpdates).eq('user_id', session.user.id);
  }, [session]);

  // Daily Reset System: runs on calendar date change, recalculating metrics strictly from today's data
  const checkAndApplyDailyReset = useCallback(() => {
    const today = getLocalTodayDate();
    const storedLastReset = typeof window !== 'undefined'
      ? localStorage.getItem(LAST_RESET_DATE_KEY)
      : null;

    const currentRecorded = lastResetDateRef.current || storedLastReset;

    if (currentRecorded === today) {
      return false;
    }

    console.info(`[ShadowRise] Daily metrics reset: ${currentRecorded} -> ${today}`);
    lastResetDateRef.current = today;
    setLastResetDate(today);

    try {
      localStorage.setItem(LAST_RESET_DATE_KEY, today);
    } catch (err) {
      console.warn('Error saving lastResetDate', err);
    }

    // When calendar date changes:
    // 1. Reset water (Hydration = 0%)
    setWater((prev) => ({ ...prev, amountMl: 0 }));

    // 2. Health state reset: Exercise = 0%, Hydration = 0%, Sleep = 0%, Recovery = 0%
    setHealth((prev) => ({
      ...prev,
      sleepHours: 0,
      sleepQuality: 0,
      hydrationPercent: 0,
      recoveryScore: 0,
      steps: 0,
    }));

    // 3. User profile metrics reset: Exercise = 0%, Hydration = 0%, Sleep = 0%, Recovery = 0%
    setProfile((prev) => {
      if (!prev) return prev;
      const updatedProfile: UserProfile = {
        ...prev,
        metrics: {
          exerciseProgress: 0,
          hydration: 0,
          sleepQuality: 0,
          recoveryScore: 0,
        },
      };
      syncProfile(updatedProfile);
      return updatedProfile;
    });

    // 4. Reset daily quests for the new day
    setQuests((prevQuests) =>
      prevQuests.map((q) => ({
        ...q,
        completed: false,
        date: today,
      }))
    );

    return true;
  }, [syncProfile]);

  // Listener to trigger checkAndApplyDailyReset on visibility change, focus, and interval
  useEffect(() => {
    checkAndApplyDailyReset();

    const handleVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        checkAndApplyDailyReset();
      }
    };

    const handleFocus = () => {
      checkAndApplyDailyReset();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleVisibility);
    }

    const interval = setInterval(checkAndApplyDailyReset, 30000);

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', handleVisibility);
      }
      clearInterval(interval);
    };
  }, [checkAndApplyDailyReset]);

  const handleRankPromotionCheck = useCallback(
    (
      oldRank: Rank,
      newRank: Rank,
      newLevel: number,
      totalQuests: number,
      totalXp: number
    ) => {
      if (newRank !== oldRank) {
        const entry = createRankUpHistoryEntry(newRank, newLevel, totalQuests, totalXp);
        setRankHistory((prev) => {
          if (prev.some((e) => e.rank === newRank)) return prev;
          return [...prev, entry];
        });

        const rankTitle = RANK_TIMELINE_DEFINITIONS[newRank]?.title || `${newRank} Rank Shadow Sovereign`;

        // Automatically trigger full-screen celebration animation on rank threshold crossing
        setRankUpCelebration({
          isOpen: true,
          oldRank,
          newRank,
          level: newLevel,
          totalXp,
          unlockedTitle: rankTitle,
        });

        try {
          playSoundEvent('rankUp', soundSettingsRef.current);
        } catch {
          // audio safeguard
        }

        setActivities((prev) => [
          {
            id: `rank-advance-${Date.now()}`,
            type: 'quest',
            title: `[RANK PROMOTION] Awakened to ${newRank}-Rank!`,
            subtitle: `Reached Level ${newLevel} · Authority Expanded`,
            timestamp: new Date().toISOString(),
            icon: 'Award',
            color: rankConfig[newRank]?.color || '#fbbf24',
          },
          ...prev,
        ]);
      }
    },
    []
  );

  const grantXP = useCallback((amount: number, activity: string) => {
    if (amount <= 0) return;

    const today = new Date().toISOString().split('T')[0];
    const historyItem: XPHistoryItem = {
      id: `xp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      date: today,
      activity,
      xpEarned: amount,
      timestamp: new Date().toISOString(),
    };

    setXpHistory((prev) => [historyItem, ...prev]);

    // Show animated toast HUD
    setXpToasts((prev) => [
      {
        id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        amount,
        activity,
      },
      ...prev,
    ].slice(0, 4));

    setProfile((prevProfile) => {
      if (!prevProfile) return prevProfile;
      const currentTotal = Math.max(0, Number(prevProfile.totalXp ?? prevProfile.xp ?? 0));
      const newTotal = currentTotal + amount;
      const newLevel = calculateLevelFromTotalXP(newTotal);
      const newRank = calculateRankFromTotalXP(newTotal);
      const newXpToNext = getLevelThreshold(newLevel);
      const oldRank = prevProfile.rank;

      const newProfile: UserProfile = {
        ...prevProfile,
        xp: newTotal,
        totalXp: newTotal,
        level: newLevel,
        rank: newRank,
        xpToNext: newXpToNext,
      };

      if (newRank !== oldRank) {
        handleRankPromotionCheck(
          oldRank,
          newRank,
          newLevel,
          newProfile.totalQuestsCompleted,
          newTotal
        );
      }

      syncProfile(newProfile);
      return newProfile;
    });
  }, [handleRankPromotionCheck, syncProfile]);

  const completeQuest = useCallback((questId: string) => {
    setQuests((prevQuests) => {
      const quest = prevQuests.find((q) => q.id === questId);
      if (!quest || quest.completed) return prevQuests;

      const updated = prevQuests.map((q) =>
        q.id === questId ? { ...q, completed: true } : q,
      );

      // Increment total quests count
      setProfile((prev) => prev ? { ...prev, totalQuestsCompleted: prev.totalQuestsCompleted + 1 } : prev);

      // Award +100 XP as specified for Daily Quest Completed
      grantXP(XP_REWARDS.DAILY_QUEST_COMPLETED, 'Daily Quest Completed');

      // Check if weekly streak milestone achieved (e.g. 7, 14, 21 days)
      let isWeeklyStreak = false;
      if (profile && profile.streak > 0 && profile.streak % 7 === 0) {
        const lastRewarded = typeof window !== 'undefined' ? localStorage.getItem(WEEKLY_STREAK_KEY) : null;
        if (lastRewarded !== String(profile.streak)) {
          if (typeof window !== 'undefined') localStorage.setItem(WEEKLY_STREAK_KEY, String(profile.streak));
          grantXP(XP_REWARDS.WEEKLY_STREAK_COMPLETED, 'Weekly Streak Completed');
          isWeeklyStreak = true;
        }
      }

      try {
        if (isWeeklyStreak) {
          playSoundEvent('weeklyGoalComplete', soundSettingsRef.current);
        } else {
          playSoundEvent('questReminder', soundSettingsRef.current);
        }
      } catch {
        // audio safety
      }

      // Add to activities
      setActivities((prevActs) => [
        {
          id: `quest-${quest.id}-${Date.now()}`,
          type: 'quest' as const,
          title: quest.title,
          subtitle: `+${XP_REWARDS.DAILY_QUEST_COMPLETED} XP earned`,
          timestamp: new Date().toISOString(),
          icon: 'Check',
          color: '#34d399',
        },
        ...prevActs,
      ]);

      return updated;
    });
  }, [grantXP, profile]);

  const uncompleteQuest = useCallback((questId: string) => {
    setQuests((prevQuests) => {
      const quest = prevQuests.find((q) => q.id === questId);
      if (!quest || !quest.completed) return prevQuests;

      const updated = prevQuests.map((q) =>
        q.id === questId ? { ...q, completed: false } : q,
      );

      setProfile((prevProfile) => {
        if (!prevProfile) return prevProfile;
        const currentTotal = Math.max(0, Number(prevProfile.totalXp ?? prevProfile.xp ?? 0));
        const newTotal = Math.max(0, currentTotal - XP_REWARDS.DAILY_QUEST_COMPLETED);
        const newLevel = calculateLevelFromTotalXP(newTotal);
        const newRank = calculateRankFromTotalXP(newTotal);
        const newProfile: UserProfile = {
          ...prevProfile,
          totalXp: newTotal,
          xp: newTotal,
          level: newLevel,
          rank: newRank,
          xpToNext: getLevelThreshold(newLevel),
          totalQuestsCompleted: Math.max(0, prevProfile.totalQuestsCompleted - 1),
        };
        syncProfile(newProfile);
        return newProfile;
      });

      return updated;
    });
  }, [syncProfile]);

  const addQuest = useCallback((quest: Omit<Quest, 'id' | 'completed' | 'date'>) => {
    const newQuest: Quest = {
      ...quest,
      id: `q${Date.now()}`,
      completed: false,
      date: new Date().toISOString().split('T')[0],
    };
    setQuests((prev) => [newQuest, ...prev]);
  }, []);

  const deleteQuest = useCallback((questId: string) => {
    setQuests((prev) => prev.filter((q) => q.id !== questId));
  }, []);

  const addNote = useCallback((note: Omit<Note, 'id' | 'date'>) => {
    const newNote: Note = {
      ...note,
      id: `n${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setNotes((prev) => [newNote, ...prev]);
  }, []);

  const deleteNote = useCallback((noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };

      if (updates.weightKg !== undefined && updates.weightKg > 0) {
        setWeight((prevWeight) => {
          setWeightTrend({ current: updates.weightKg!, previous: prevWeight.weightKg || updates.weightKg! });
          return { weightKg: updates.weightKg!, date: new Date().toISOString().split('T')[0] };
        });
      }

      syncProfile(next);
      return next;
    });
  }, [syncProfile]);

  const addWater = useCallback(async (amountMl: number) => {
    const newAmount = Math.max(0, Math.min(water.amountMl + amountMl, water.goalMl * 2));
    setWater((prev) => ({ ...prev, amountMl: newAmount }));

    const hydrationPercent = Math.min(Math.round((newAmount / water.goalMl) * 100), 100);
    setHealth((prev) => ({ ...prev, hydrationPercent }));

    if (amountMl > 0) {
      // Advance next reminder so user isn't immediately prompted
      setWaterReminder((prev) => ({
        ...prev,
        lastReminderTime: Date.now(),
        nextReminderTime: prev.enabled ? Date.now() + prev.intervalMinutes * 60 * 1000 : null,
      }));

      // Check if water goal completed (+20 XP, once per day)
      const today = getLocalTodayDate();
      const lastAwarded = typeof window !== 'undefined' ? localStorage.getItem(WATER_GOAL_COMPLETED_KEY) : null;
      if (newAmount >= water.goalMl && lastAwarded !== today) {
        if (typeof window !== 'undefined') localStorage.setItem(WATER_GOAL_COMPLETED_KEY, today);
        grantXP(XP_REWARDS.WATER_GOAL_COMPLETED, 'Water Goal Completed');
        try {
          playSoundEvent('achievementUnlock', soundSettingsRef.current);
        } catch {
          // audio safety
        }
      }

      setProfile((prevProfile) => {
        if (!prevProfile) return prevProfile;
        const newProfile = { ...prevProfile };
        newProfile.metrics = { ...newProfile.metrics, hydration: hydrationPercent };
        syncProfile(newProfile);
        return newProfile;
      });

      setActivities((prev) => [
        {
          id: `water-${Date.now()}`,
          type: 'water',
          title: 'Hydration logged',
          subtitle: `+${amountMl}ml logged`,
          timestamp: new Date().toISOString(),
          icon: 'Droplets',
          color: '#60a5fa',
        },
        ...prev,
      ]);
    } else {
      setProfile((prev) => prev ? { ...prev, metrics: { ...prev.metrics, hydration: hydrationPercent } } : prev);
    }

    if (!session?.user) return;

    try {
      const today = getLocalTodayDate();
      const { data: existing } = await supabase
        .from('water_intake')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('water_intake')
          .update({ amount_ml: newAmount, updated_at: new Date().toISOString() })
          .eq('user_id', session.user.id)
          .eq('date', today);
      } else {
        await supabase.from('water_intake').insert({
          user_id: session.user.id,
          amount_ml: newAmount,
          goal_ml: water.goalMl,
          date: today,
        });
      }

      await supabase.from('user_profiles')
        .update({ hydration_score: hydrationPercent, updated_at: new Date().toISOString() })
        .eq('user_id', session.user.id);
    } catch (err) {
      console.warn('[AI Studio] Supabase water sync warning:', err);
    }
  }, [session, water, syncProfile, grantXP]);

  const logExercise = useCallback(async (
    exerciseType: string,
    durationMin: number,
    caloriesBurned: number,
    intensity: string,
    _xpReward?: number,
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
  ) => {
    const today = getLocalTodayDate();

    const totalRepsCalculated = extra?.totalReps ?? (extra?.sets ? extra.sets.reduce((sum, s) => sum + (s.completed ? s.reps : 0), 0) : undefined);
    const totalVolumeCalculated = extra?.totalVolumeKg ?? (extra?.sets ? extra.sets.reduce((sum, s) => sum + (s.completed ? (s.reps * (s.weightKg || 0)) : 0), 0) : undefined);
    const totalSetsCalculated = extra?.totalSets ?? (extra?.sets ? extra.sets.length : undefined);

    const newEntry: ExerciseEntry = {
      id: `ex-${Date.now()}`,
      exerciseType,
      customName: extra?.customName,
      category: extra?.category,
      targetMuscle: extra?.targetMuscle,
      durationMin,
      caloriesBurned,
      intensity,
      date: today,
      sets: extra?.sets,
      totalSets: totalSetsCalculated,
      totalReps: totalRepsCalculated,
      totalVolumeKg: totalVolumeCalculated,
      notes: extra?.notes,
      createdAt: new Date().toISOString(),
    };
    setExercises((prev) => [newEntry, ...prev]);

    // Update exercise progress metric strictly from today's logged exercises
    const todayExercises = exercises.filter(
      (e) => e && (e.date === today || (e.createdAt && e.createdAt.startsWith(today)))
    );
    const totalMin = todayExercises.reduce((sum, e) => sum + (Number(e.durationMin) || 0), 0) + durationMin;
    const exerciseProgress = Math.min(Math.round((totalMin / 60) * 100), 100);

    setProfile((prevProfile) => {
      if (!prevProfile) return prevProfile;
      const newProfile = { ...prevProfile };
      newProfile.metrics = { ...newProfile.metrics, exerciseProgress };
      syncProfile(newProfile);
      return newProfile;
    });

    // Award +50 XP for Workout Completed
    grantXP(XP_REWARDS.WORKOUT_COMPLETED, 'Workout Completed');

    const setsSummary = extra?.sets && extra.sets.length > 0
      ? ` · ${extra.sets.length} sets`
      : '';

    // Add activity
    setActivities((prev) => [
      {
        id: `exercise-${Date.now()}`,
        type: 'exercise',
        title: `${extra?.customName || exerciseType} session`,
        subtitle: `${durationMin} min · ${caloriesBurned} cal${setsSummary} · +${XP_REWARDS.WORKOUT_COMPLETED} XP`,
        timestamp: new Date().toISOString(),
        icon: 'Dumbbell',
        color: '#f87171',
      },
      ...prev,
    ]);

    // Automatically trigger Solo Leveling Voice Motivation celebration
    const randomHunterVoice = getRandomHunterVoiceMessage();
    setVoiceMotivationData({
      message: randomHunterVoice,
      workoutTitle: extra?.customName || exerciseType,
      xpEarned: XP_REWARDS.WORKOUT_COMPLETED,
    });
    setIsVoiceMotivationOpen(true);

    if (!session?.user) return;

    try {
      const { data } = await supabase.from('exercise_logs').insert({
        user_id: session.user.id,
        exercise_type: extra?.customName || exerciseType,
        duration_min: durationMin,
        calories_burned: caloriesBurned,
        intensity,
        date: today,
      }).select('*').maybeSingle();

      if (data?.id) {
        newEntry.id = data.id;
      }

      await supabase.from('user_profiles')
        .update({ exercise_progress: exerciseProgress, updated_at: new Date().toISOString() })
        .eq('user_id', session.user.id);
    } catch (err) {
      console.warn('[AI Studio] Supabase exercise sync warning:', err);
    }
  }, [session, exercises, syncProfile, grantXP]);

  const deleteExercise = useCallback(async (exerciseId: string) => {
    setExercises((prev) => {
      const updated = prev.filter((e) => e.id !== exerciseId);
      const today = getLocalTodayDate();
      const todayRemaining = updated.filter(
        (e) => e && (e.date === today || (e.createdAt && e.createdAt.startsWith(today)))
      );
      const remainingMin = todayRemaining.reduce((sum, e) => sum + (Number(e.durationMin) || 0), 0);
      const exerciseProgress = Math.min(Math.round((remainingMin / 60) * 100), 100);

      setProfile((prevProfile) => {
        if (!prevProfile) return prevProfile;
        const newProfile = { ...prevProfile };
        newProfile.metrics = { ...newProfile.metrics, exerciseProgress };
        syncProfile(newProfile);
        return newProfile;
      });

      return updated;
    });
    setActivities((prev) => prev.filter((a) => a.id !== exerciseId && a.id !== `exercise-${exerciseId}`));

    if (!session?.user) return;

    try {
      await supabase
        .from('exercise_logs')
        .delete()
        .eq('id', exerciseId)
        .eq('user_id', session.user.id);
    } catch (err) {
      console.warn('[AI Studio] Supabase delete exercise error:', err);
    }
  }, [session, syncProfile]);

  const logWeight = useCallback(async (weightKg: number) => {
    const today = new Date().toISOString().split('T')[0];
    const prevWeight = weight.weightKg;

    setWeight({ weightKg, date: today });
    setWeightTrend({ current: weightKg, previous: prevWeight || weightKg });
    setProfile((prev) => prev ? { ...prev, weightKg } : prev);

    // Check if goal weight achieved (+500 XP once per achievement)
    if (profile?.goalWeightKg && Math.abs(weightKg - profile.goalWeightKg) <= 0.2) {
      const lastAwarded = typeof window !== 'undefined' ? localStorage.getItem(GOAL_WEIGHT_KEY) : null;
      if (lastAwarded !== today) {
        if (typeof window !== 'undefined') localStorage.setItem(GOAL_WEIGHT_KEY, today);
        grantXP(XP_REWARDS.GOAL_WEIGHT_ACHIEVED, 'Goal Weight Achievement');
        try {
          playSoundEvent('achievementUnlock', soundSettingsRef.current);
        } catch {
          // audio safety
        }
      }
    }

    setActivities((prev) => [
      {
        id: `weight-${Date.now()}`,
        type: 'weight',
        title: 'Weight logged',
        subtitle: `${weightKg.toFixed(1)} kg`,
        timestamp: new Date().toISOString(),
        icon: 'Scale',
        color: '#fbbf24',
      },
      ...prev,
    ]);

    if (!session?.user) return;

    try {
      const { data: existing } = await supabase
        .from('weight_entries')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('weight_entries')
          .update({ weight_kg: weightKg })
          .eq('user_id', session.user.id)
          .eq('date', today);
      } else {
        await supabase.from('weight_entries').insert({
          user_id: session.user.id,
          weight_kg: weightKg,
          date: today,
        });
      }
    } catch (err) {
      console.warn('[AI Studio] Supabase weight sync warning:', err);
    }
  }, [session, weight, profile, grantXP]);

  const logSleep = useCallback(async (sleepHours: number, customRecovery?: number) => {
    const safeHours = typeof sleepHours === 'number' && !isNaN(sleepHours) ? Math.max(0, sleepHours) : 0;
    const safeMinutes = Math.round(safeHours * 60);
    const calc = calculateSleepRecovery(safeMinutes);

    const sleepQuality = Math.min(Math.round((safeHours / 8) * 100), 100);
    const recoveryScore = customRecovery !== undefined ? customRecovery : calc.recoveryScore;

    // If manual sleep adjustment (no custom recovery passed from wakeUp), create a completed session
    if (customRecovery === undefined) {
      const today = getLocalTodayDate();
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - Math.round(safeHours * 60 * 60 * 1000));
      const manualSession: SleepSession = {
        id: `sleep-session-${Date.now()}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        durationHours: safeHours,
        durationMinutes: safeMinutes,
        recoveryScore,
        energyStatus: calc.energyStatus,
        energyStatusKey: calc.energyStatusKey,
        sleepQualityLabel: calc.sleepQualityLabel,
        xpEarned: calc.xpEarned,
        createdAt: endTime.toISOString(),
        date: today,
      };
      setSleepHistory((prev) => [manualSession, ...prev]);
      if (calc.xpEarned > 0) {
        grantXP(calc.xpEarned, `Sleep Logged (${safeHours.toFixed(1)}h)`);
      }
    }

    setHealth((prev) => ({ ...prev, sleepHours: safeHours, sleepQuality, recoveryScore }));
    setProfile((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        metrics: {
          ...prev.metrics,
          sleepQuality,
          recoveryScore,
        },
      };
      syncProfile(updated);
      return updated;
    });

    setActivities((prev) => [
      {
        id: `sleep-${Date.now()}`,
        type: 'sleep',
        title: safeMinutes < 15 ? 'Sleep Interrupted' : 'Sleep logged',
        subtitle: `${safeHours.toFixed(1)} hours · ${recoveryScore}% Recovery`,
        timestamp: new Date().toISOString(),
        icon: 'Moon',
        color: recoveryScore >= 60 ? '#a78bfa' : '#f87171',
      },
      ...prev,
    ]);

    if (!session?.user) return;

    try {
      const today = getLocalTodayDate();
      const { data: existing } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('health_metrics')
          .update({
            sleep_hours: safeHours,
            sleep_quality: sleepQuality,
            recovery_score: recoveryScore,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', session.user.id)
          .eq('date', today);
      } else {
        await supabase.from('health_metrics').insert({
          user_id: session.user.id,
          sleep_hours: safeHours,
          sleep_quality: sleepQuality,
          recovery_score: recoveryScore,
        });
      }

      await supabase.from('user_profiles')
        .update({
          sleep_quality: sleepQuality,
          recovery_score: recoveryScore,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', session.user.id);
    } catch (err) {
      console.warn('[AI Studio] Supabase sleep sync warning:', err);
    }
  }, [session, syncProfile, grantXP]);

  const addXP = useCallback((xpAmount: number, reason = 'Training XP') => {
    grantXP(xpAmount, reason);
  }, [grantXP]);

  const startSleep = useCallback(() => {
    const nowIso = new Date().toISOString();
    setSleepStartTime(nowIso);
    try {
      localStorage.setItem(SLEEP_START_KEY, nowIso);
      playSoundEvent('sleepReminder', soundSettingsRef.current);
    } catch (err) {
      console.warn('Error starting sleep', err);
    }

    setActivities((prev) => [
      {
        id: `sleep-start-${Date.now()}`,
        type: 'sleep',
        title: 'Hunter Sleep Protocol Initiated',
        subtitle: 'Vitality restoration chamber active · Rest well, Sovereign',
        timestamp: nowIso,
        icon: 'Moon',
        color: '#a78bfa',
      },
      ...prev,
    ]);
  }, []);

  const wakeUp = useCallback(() => {
    const endTime = new Date();
    const sleepEndTime = endTime.toISOString();

    // 1. Calculate actual elapsed time with null safety
    let start: Date;
    if (sleepStartTime && typeof sleepStartTime === 'string') {
      const parsedStart = new Date(sleepStartTime);
      start = isNaN(parsedStart.getTime()) ? endTime : parsedStart;
    } else {
      start = endTime;
    }

    const diffMs = Math.max(0, endTime.getTime() - start.getTime());
    const durationMinutes = Math.floor(diffMs / (1000 * 60));

    // 2. Compute dynamic recovery, energy status, and XP strictly from real elapsed time
    const calc = calculateSleepRecovery(durationMinutes);
    const {
      durationHours,
      recoveryScore,
      energyStatus,
      energyStatusKey,
      sleepQualityLabel,
      xpEarned,
    } = calc;

    const session: SleepSession = {
      id: `sleep-session-${Date.now()}`,
      startTime: start.toISOString(),
      endTime: sleepEndTime,
      durationHours,
      durationMinutes,
      recoveryScore,
      energyStatus,
      energyStatusKey,
      sleepQualityLabel,
      xpEarned,
      createdAt: sleepEndTime,
      date: getLocalTodayDate(),
    };

    // Clear active sleep start
    setSleepStartTime(null);
    try {
      localStorage.removeItem(SLEEP_START_KEY);
    } catch (err) {
      console.warn('Error clearing sleep start key', err);
    }

    // Save session to history with actual duration
    setSleepHistory((prev) => [session, ...prev]);

    // Update health and profile metrics directly from the completed sleep session
    logSleep(durationHours, recoveryScore);

    // Only award Hunter XP if duration was sufficient (0 XP if woke up within a few minutes)
    if (xpEarned > 0) {
      grantXP(xpEarned, `Sleep Tracking Completed (${durationHours.toFixed(1)}h)`);
    }

    // Set active recovery report modal
    setActiveRecoveryReport(session);

    try {
      playSoundEvent('wakeUpAlarm', soundSettingsRef.current);
    } catch {
      // audio safety
    }
  }, [sleepStartTime, logSleep, grantXP]);

  const closeRecoveryReport = useCallback(() => {
    setActiveRecoveryReport(null);
  }, []);

  const clearSleepHistory = useCallback(() => {
    setSleepHistory([]);
    try {
      localStorage.removeItem(SLEEP_HISTORY_KEY);
    } catch (err) {
      console.warn('Error clearing sleep history', err);
    }
  }, []);

  const updateWaterReminder = useCallback((updates: Partial<WaterReminderSettings>) => {
    setWaterReminder((prev) => {
      const nextInterval = updates.intervalMinutes ?? prev.intervalMinutes;
      const nextEnabled = updates.enabled ?? prev.enabled;
      return {
        ...prev,
        ...updates,
        nextReminderTime: nextEnabled ? Date.now() + nextInterval * 60 * 1000 : null,
      };
    });
  }, []);

  const snoozeWaterReminder = useCallback((minutes = 15) => {
    setIsWaterPopupOpen(false);
    setWaterReminder((prev) => ({
      ...prev,
      nextReminderTime: Date.now() + minutes * 60 * 1000,
    }));
  }, []);

  const dismissWaterReminder = useCallback(() => {
    setIsWaterPopupOpen(false);
    setWaterReminder((prev) => ({
      ...prev,
      lastReminderTime: Date.now(),
      nextReminderTime: prev.enabled ? Date.now() + prev.intervalMinutes * 60 * 1000 : null,
    }));
  }, []);

  const triggerWaterReminder = useCallback(() => {
    setIsWaterPopupOpen(true);
    if (waterReminder.soundEnabled) {
      playSoundEvent('waterReminder', soundSettingsRef.current);
    }
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('ShadowRise · Hydration Directive', {
          body: 'Vitality dropping! Drink +250ml water now to maintain your hunter combat status.',
          icon: '/favicon.ico',
        });
      } catch {
        // Fallback for notification rejection
      }
    }
  }, [waterReminder.soundEnabled]);

  useEffect(() => {
    if (!waterReminder.enabled || !waterReminder.nextReminderTime) return;

    const interval = setInterval(() => {
      if (Date.now() >= (waterReminder.nextReminderTime ?? 0)) {
        triggerWaterReminder();
        setWaterReminder((prev) => ({
          ...prev,
          lastReminderTime: Date.now(),
          nextReminderTime: Date.now() + prev.intervalMinutes * 60 * 1000,
        }));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [waterReminder.enabled, waterReminder.nextReminderTime, triggerWaterReminder]);

  const updateWorkoutAlarm = useCallback((updates: Partial<WorkoutAlarmSettings>) => {
    setWorkoutAlarm((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const triggerWorkoutAlarm = useCallback(() => {
    setIsWorkoutAlarmPopupOpen(true);
    if (workoutAlarm.soundEnabled) {
      playSoundEvent('wakeUpAlarm', soundSettingsRef.current);
    }
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('ShadowRise · Dungeon Gate Open', {
          body: `Hunter Training Directive: Your scheduled workout time (${workoutAlarm.time}) has arrived! Enter the training zone now.`,
          icon: '/favicon.ico',
        });
      } catch {
        // Fallback for notification rejection
      }
    }
  }, [workoutAlarm.soundEnabled, workoutAlarm.time]);

  const snoozeWorkoutAlarm = useCallback(() => {
    setIsWorkoutAlarmPopupOpen(false);
  }, []);

  const dismissWorkoutAlarm = useCallback(() => {
    setIsWorkoutAlarmPopupOpen(false);
  }, []);

  // Workout alarm schedule watcher
  useEffect(() => {
    if (!workoutAlarm.enabled) return;

    const checkWorkoutAlarm = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const currentDay = dayNames[now.getDay()];
      const todayStr = now.toISOString().split('T')[0];

      if (
        currentTimeStr === workoutAlarm.time &&
        (workoutAlarm.days || []).includes(currentDay) &&
        workoutAlarm.lastTriggeredDate !== todayStr
      ) {
        triggerWorkoutAlarm();
        setWorkoutAlarm((prev) => ({
          ...prev,
          lastTriggeredDate: todayStr,
        }));
      }
    };

    const interval = setInterval(checkWorkoutAlarm, 10000);
    return () => clearInterval(interval);
  }, [workoutAlarm, triggerWorkoutAlarm]);

  const triggerVoiceMotivation = useCallback((workoutTitle = 'Combat Training', xpEarned = 150) => {
    const msg = getRandomHunterVoiceMessage();
    setVoiceMotivationData({
      message: msg,
      workoutTitle,
      xpEarned,
    });
    setIsVoiceMotivationOpen(true);
  }, []);

  // Unlimited ShadowRise Alarms Methods
  const addAlarm = useCallback((alarmData: Omit<ShadowAlarm, 'id' | 'createdAt'>) => {
    const newAlarm: ShadowAlarm = {
      ...alarmData,
      id: `alarm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setAlarms((prev) => [newAlarm, ...prev]);
  }, []);

  const updateAlarm = useCallback((id: string, updates: Partial<ShadowAlarm>) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  }, []);

  const deleteAlarm = useCallback((id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const toggleAlarm = useCallback((id: string, enabled: boolean) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled } : a))
    );
  }, []);

  const triggerAlarm = useCallback((alarm: ShadowAlarm) => {
    setActiveRingingAlarm(alarm);
  }, []);

  const dismissAlarm = useCallback((alarm: ShadowAlarm) => {
    setActiveRingingAlarm(null);

    // Record in history
    const historyItem: AlarmHistoryItem = {
      id: `hist-${Date.now()}`,
      alarmId: alarm.id,
      title: alarm.title,
      time: alarm.time,
      triggeredAt: new Date().toISOString(),
      action: 'dismissed',
    };
    setAlarmHistory((prev) => [historyItem, ...prev.slice(0, 99)]);

    // Award +25 Hunter Discipline XP
    addXP(25, 'Hunter Awakening On Time');

    // Add activity log
    setActivities((prev) => [
      {
        id: `act-alarm-${Date.now()}`,
        type: 'exercise',
        title: `Hunter Arise: ${alarm.title}`,
        subtitle: `Discipline directive answered on time · +25 XP`,
        timestamp: new Date().toISOString(),
        icon: 'Bell',
        color: '#a855f7',
      },
      ...prev,
    ]);
  }, [addXP]);

  const snoozeAlarm = useCallback((alarm: ShadowAlarm, minutes = 10) => {
    setActiveRingingAlarm(null);

    // Record in history
    const historyItem: AlarmHistoryItem = {
      id: `hist-${Date.now()}`,
      alarmId: alarm.id,
      title: alarm.title,
      time: alarm.time,
      triggeredAt: new Date().toISOString(),
      action: 'snoozed',
      snoozeMinutes: minutes,
    };
    setAlarmHistory((prev) => [historyItem, ...prev.slice(0, 99)]);

    // Set snooze timeout to re-trigger
    setTimeout(() => {
      setActiveRingingAlarm({
        ...alarm,
        title: `[SNOOZED] ${alarm.title}`,
      });
    }, minutes * 60 * 1000);
  }, []);

  const clearAlarmHistory = useCallback(() => {
    setAlarmHistory([]);
  }, []);

  const registerHunter = useCallback((data: {
    name: string;
    age: number;
    heightCm: number;
    weightKg: number;
    goalWeightKg: number;
    gender?: 'male' | 'female' | 'other';
    photo?: string;
  }) => {
    const today = getLocalTodayDate();
    const registeredProfile: UserProfile = {
      name: data.name.trim() || 'Shadow Hunter',
      email: 'hunter@shadowrise.local',
      photo: data.photo || '',
      rank: 'E',
      level: 1,
      xp: 0,
      xpToNext: 500,
      streak: 1,
      totalQuestsCompleted: 0,
      heightCm: Number(data.heightCm) || 175,
      weightKg: Number(data.weightKg) || 70,
      age: Number(data.age) || 24,
      goalWeightKg: Number(data.goalWeightKg) || 70,
      gender: data.gender || 'male',
      isRegistered: true,
      registeredAt: new Date().toISOString(),
      metrics: {
        exerciseProgress: 0,
        hydration: 0,
        sleepQuality: 0,
        recoveryScore: 0,
      },
    };

    const initialHistory = generateInitialRankHistory('E', 1, new Date().toISOString(), 0, 0);
    setProfile({ ...registeredProfile, rankHistory: initialHistory });
    setRankHistory(initialHistory);
    setWeight({ weightKg: Number(data.weightKg) || 70, date: today });
    setWeightTrend({ current: Number(data.weightKg) || 70, previous: Number(data.weightKg) || 70 });
    setWater({ amountMl: 0, goalMl: 3000 });
    setHealth({
      sleepHours: 0,
      hydrationPercent: 0,
      recoveryScore: 0,
      heartRate: 68,
      steps: 0,
      sleepQuality: 0,
    });
    setExercises([]);
    setActivities([]);
    setSleepStartTime(null);
    setSleepHistory([]);
    setIsRegistered(true);
    setLastResetDate(today);
    lastResetDateRef.current = today;

    try {
      localStorage.setItem(REGISTRATION_KEY, 'true');
      localStorage.setItem(LAST_RESET_DATE_KEY, today);
      localStorage.removeItem(SLEEP_START_KEY);
      localStorage.removeItem(SLEEP_HISTORY_KEY);
    } catch (err) {
      console.warn('Error saving registration flag', err);
    }

    try {
      playPhaseTransitionTone(true);
    } catch {
      // audio safety
    }

    setActivities((prev) => [
      {
        id: `reg-${Date.now()}`,
        type: 'quest',
        title: 'Hunter Awakening Initialized',
        subtitle: `Assigned Rank: E-Rank · Welcome Hunter ${data.name.trim()}`,
        timestamp: new Date().toISOString(),
        icon: 'Flame',
        color: '#a855f7',
      },
      ...prev,
    ]);
  }, []);

  const resetRegistration = useCallback(() => {
    const today = getLocalTodayDate();
    try {
      localStorage.removeItem(REGISTRATION_KEY);
      localStorage.removeItem(SLEEP_START_KEY);
      localStorage.removeItem(SLEEP_HISTORY_KEY);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(LAST_RESET_DATE_KEY, today);
    } catch (err) {
      console.warn('Error clearing registration keys', err);
    }
    const freshProfile = defaultProfile('Shadow Hunter', 'hunter@shadowrise.local');
    freshProfile.isRegistered = false;
    const resetHistory = generateInitialRankHistory('E', 1, new Date().toISOString(), 0, 0);
    setProfile(freshProfile);
    setRankHistory(resetHistory);
    setWater({ amountMl: 0, goalMl: 3000 });
    setHealth({
      sleepHours: 0,
      hydrationPercent: 0,
      recoveryScore: 0,
      heartRate: 68,
      steps: 0,
      sleepQuality: 0,
    });
    setExercises([]);
    setActivities([]);
    setSleepStartTime(null);
    setSleepHistory([]);
    setLastResetDate(today);
    lastResetDateRef.current = today;
    setIsRegistered(false);
  }, []);

  const promoteHunter = useCallback((targetRank: Rank) => {
    const minLevels: Record<Rank, number> = { E: 1, D: 10, C: 20, B: 30, A: 40, S: 50 };
    const targetLevel = minLevels[targetRank] || 1;

    setProfile((prev) => {
      if (!prev) return prev;
      const nextProfile: UserProfile = {
        ...prev,
        rank: targetRank,
        level: Math.max(prev.level, targetLevel),
      };
      syncProfile(nextProfile);
      return nextProfile;
    });

    const entry = createRankUpHistoryEntry(
      targetRank,
      targetLevel,
      profile?.totalQuestsCompleted || 0,
      (targetLevel - 1) * 500
    );

    setRankHistory((prev) => {
      const filtered = prev.filter((e) => e.rank !== targetRank);
      return [...filtered, entry];
    });

    try {
      playRankUpFanfare();
    } catch {
      // safe
    }
  }, [profile, syncProfile]);

  const recalibrateRankHistory = useCallback(() => {
    if (!profile) return;
    const history = generateInitialRankHistory(
      profile.rank,
      profile.level,
      profile.registeredAt,
      profile.totalQuestsCompleted,
      (profile.level - 1) * 500 + profile.xp
    );
    setRankHistory(history);
  }, [profile]);

  // Multi-Alarm Background Checker
  useEffect(() => {
    const checkAllAlarms = () => {
      // If an alarm is already ringing in full-screen, do not interrupt
      if (activeRingingAlarm) return;

      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const currentDay = dayNames[now.getDay()];
      const todayDateStr = now.toISOString().split('T')[0];
      const triggerStamp = `${todayDateStr}_${currentTimeStr}`;

      for (const alarm of alarms) {
        if (!alarm.enabled) continue;
        if (alarm.time !== currentTimeStr) continue;
        if (alarm.lastTriggeredDate === triggerStamp) continue;

        const matchesDay = alarm.days.includes(currentDay);
        if (!matchesDay) continue;

        // Found alarm to trigger
        triggerAlarm(alarm);

        // Update stamp to prevent repeating within the same minute
        setAlarms((prev) =>
          prev.map((a) => {
            if (a.id === alarm.id) {
              return {
                ...a,
                lastTriggeredDate: triggerStamp,
                enabled: a.repeat === 'once' ? false : a.enabled,
              };
            }
            return a;
          })
        );
        break;
      }
    };

    const intervalId = setInterval(checkAllAlarms, 1000);
    return () => clearInterval(intervalId);
  }, [alarms, activeRingingAlarm, triggerAlarm]);

  return {
    profile,
    water,
    waterReminder,
    isWaterPopupOpen,
    setIsWaterPopupOpen,
    workoutAlarm,
    isWorkoutAlarmPopupOpen,
    setIsWorkoutAlarmPopupOpen,
    updateWorkoutAlarm,
    triggerWorkoutAlarm,
    snoozeWorkoutAlarm,
    dismissWorkoutAlarm,
    // ShadowRise Alarm System
    alarms,
    alarmHistory,
    activeRingingAlarm,
    addAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    triggerAlarm,
    dismissAlarm,
    snoozeAlarm,
    clearAlarmHistory,
    isVoiceMotivationOpen,
    setIsVoiceMotivationOpen,
    voiceMotivationData,
    triggerVoiceMotivation,
    health,
    weight,
    weightTrend,
    exercises,
    activities,
    loading,
    quests,
    notes,
    completeQuest,
    uncompleteQuest,
    addQuest,
    deleteQuest,
    addNote,
    deleteNote,
    updateProfile,
    isRegistered,
    registerHunter,
    resetRegistration,
    addWater,
    addXP,
    updateWaterReminder,
    snoozeWaterReminder,
    dismissWaterReminder,
    triggerWaterReminder,
    logExercise,
    deleteExercise,
    logWeight,
    logSleep,
    rankHistory,
    promoteHunter,
    recalibrateRankHistory,
    // Sleep Tracking System
    sleepStartTime,
    sleepHistory,
    activeRecoveryReport,
    startSleep,
    wakeUp,
    closeRecoveryReport,
    clearSleepHistory,
    // Real XP Progression System
    xpHistory,
    xpToasts,
    dismissXpToast,
    grantXP,
    // Full-Screen Rank-Up Celebration Animation
    rankUpCelebration,
    dismissRankUpCelebration,
    triggerRankUpCelebration,
    // Custom Sound & Alert System
    soundSettings,
    updateSoundSettings,
    triggerSoundEvent,
  };
}

export type Store = ReturnType<typeof useStore>;
