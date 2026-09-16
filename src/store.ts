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
} from '@/types';
import { initialQuests, initialNotes } from '@/data/initialData';
import { supabase } from '@/lib/supabase';
import { playAlarmSound } from '@/utils/audioEffects';
import {
  getRandomHunterVoiceMessage,
  type VoiceMessage,
} from '@/utils/voiceMotivation';

const STORAGE_KEY = 'shadowrise_state_v2';
const ALARMS_STORAGE_KEY = 'shadowrise_alarms_v2';
const ALARM_HISTORY_STORAGE_KEY = 'shadowrise_alarm_history_v2';

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
}

function rankFromLevel(level: number): Rank {
  const rankOrder: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S'];
  const rankIndex = Math.min(Math.floor(level / 10), rankOrder.length - 1);
  return rankOrder[rankIndex];
}

function defaultProfile(name: string, email: string): UserProfile {
  return {
    name: name || 'Shadow Hunter',
    email: email || 'hunter@shadowrise.local',
    photo: '',
    rank: 'E',
    level: 1,
    xp: 0,
    xpToNext: 500,
    streak: 1,
    totalQuestsCompleted: 0,
    heightCm: 178,
    weightKg: 72.5,
    age: 24,
    goalWeightKg: 75.0,
    gender: 'male',
    metrics: {
      exerciseProgress: 35,
      hydration: 58,
      sleepQuality: 80,
      recoveryScore: 82,
    },
  };
}

function loadInitialState(): PersistedState {
  const today = new Date().toISOString().split('T')[0];
  const defaults: PersistedState = {
    profile: defaultProfile('Shadow Hunter', 'hunter@shadowrise.local'),
    water: { amountMl: 1750, goalMl: 3000 },
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
      sleepHours: 7.5,
      hydrationPercent: 58,
      recoveryScore: 82,
      heartRate: 64,
      steps: 8420,
      sleepQuality: 80,
    },
    weight: { weightKg: 72.5, date: today },
    weightTrend: { current: 72.5, previous: 73.0 },
    exercises: [
      {
        id: 'init-ex-1',
        exerciseType: 'Dungeon Run',
        durationMin: 30,
        caloriesBurned: 260,
        intensity: 'moderate',
        date: today,
      },
    ],
    activities: [
      {
        id: 'act-init-1',
        type: 'exercise',
        title: 'Dungeon Run session',
        subtitle: '30 min · 260 cal',
        timestamp: new Date().toISOString(),
        icon: 'Dumbbell',
        color: '#f87171',
      },
      {
        id: 'act-init-2',
        type: 'water',
        title: 'Hydration logged',
        subtitle: '+500ml',
        timestamp: new Date().toISOString(),
        icon: 'Droplets',
        color: '#60a5fa',
      },
    ],
    quests: initialQuests,
    notes: initialNotes,
  };

  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (parsed && typeof parsed === 'object') {
        const safeProfile = parsed.profile && typeof parsed.profile === 'object'
          ? {
              ...defaults.profile,
              ...parsed.profile,
              healthIssues: Array.isArray(parsed.profile.healthIssues)
                ? parsed.profile.healthIssues
                : defaults.profile.healthIssues,
              metrics: parsed.profile.metrics
                ? { ...defaults.profile.metrics, ...parsed.profile.metrics }
                : defaults.profile.metrics,
            }
          : defaults.profile;

        return {
          ...defaults,
          ...parsed,
          profile: safeProfile,
          water: parsed.water && typeof parsed.water === 'object' ? { ...defaults.water, ...parsed.water } : defaults.water,
          waterReminder: parsed.waterReminder && typeof parsed.waterReminder === 'object' ? { ...defaults.waterReminder, ...parsed.waterReminder } : defaults.waterReminder,
          workoutAlarm: parsed.workoutAlarm && typeof parsed.workoutAlarm === 'object' ? { ...defaults.workoutAlarm, ...parsed.workoutAlarm } : defaults.workoutAlarm,
          health: parsed.health && typeof parsed.health === 'object' ? { ...defaults.health, ...parsed.health } : defaults.health,
          weight: parsed.weight && typeof parsed.weight === 'object' ? { ...defaults.weight, ...parsed.weight } : defaults.weight,
          weightTrend: parsed.weightTrend && typeof parsed.weightTrend === 'object' ? { ...defaults.weightTrend, ...parsed.weightTrend } : defaults.weightTrend,
          exercises: Array.isArray(parsed.exercises) ? parsed.exercises : defaults.exercises,
          activities: Array.isArray(parsed.activities) ? parsed.activities : defaults.activities,
          quests: Array.isArray(parsed.quests) && parsed.quests.length > 0 ? parsed.quests : initialQuests,
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

export function useStore(session: Session | null) {
  const [initial] = useState<PersistedState>(loadInitialState);
  const [profile, setProfile] = useState<UserProfile | null>(initial.profile);
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
    });
  }, [profile, water, waterReminder, workoutAlarm, health, weight, weightTrend, exercises, activities, quests, notes]);

  // Load all data when session changes
  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
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
        const today = new Date().toISOString().split('T')[0];

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
            exerciseProgress: existingProfile.exercise_progress ?? prev?.metrics.exerciseProgress ?? 0,
            hydration: existingProfile.hydration_score ?? prev?.metrics.hydration ?? 0,
            sleepQuality: existingProfile.sleep_quality ?? prev?.metrics.sleepQuality ?? 0,
            recoveryScore: existingProfile.recovery_score ?? prev?.metrics.recoveryScore ?? 0,
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
          sleep_hours: 7.2,
          hydration_percent: 45,
          recovery_score: 72,
          heart_rate: 68,
          steps: 4250,
          sleep_quality: 80,
        };
        await supabase.from('health_metrics').insert({ user_id: user.id, ...defaults });
        setHealth({
          sleepHours: 7.2,
          hydrationPercent: 45,
          recoveryScore: 72,
          heartRate: 68,
          steps: 4250,
          sleepQuality: 80,
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
      const sleepQ = healthData?.sleep_quality ?? 80;
      const recovery = healthData?.recovery_score ?? 72;

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

  const completeQuest = useCallback((questId: string) => {
    setQuests((prevQuests) => {
      const quest = prevQuests.find((q) => q.id === questId);
      if (!quest || quest.completed) return prevQuests;

      const updated = prevQuests.map((q) =>
        q.id === questId ? { ...q, completed: true } : q,
      );

      setProfile((prevProfile) => {
        if (!prevProfile) return prevProfile;
        const newProfile = { ...prevProfile };
        newProfile.xp += quest.xpReward;
        newProfile.totalQuestsCompleted += 1;

        while (newProfile.xp >= newProfile.xpToNext) {
          newProfile.xp -= newProfile.xpToNext;
          newProfile.level += 1;
          newProfile.xpToNext = Math.round(newProfile.xpToNext * 1.3);
        }
        newProfile.rank = rankFromLevel(newProfile.level);

        syncProfile(newProfile);
        return newProfile;
      });

      // Add to activities
      setActivities((prevActs) => [
        {
          id: `quest-${quest.id}-${Date.now()}`,
          type: 'quest' as const,
          title: quest.title,
          subtitle: `+${quest.xpReward} XP earned`,
          timestamp: new Date().toISOString(),
          icon: 'Check',
          color: '#34d399',
        },
        ...prevActs,
      ]);

      return updated;
    });
  }, [syncProfile]);

  const uncompleteQuest = useCallback((questId: string) => {
    setQuests((prevQuests) => {
      const quest = prevQuests.find((q) => q.id === questId);
      if (!quest || !quest.completed) return prevQuests;

      const updated = prevQuests.map((q) =>
        q.id === questId ? { ...q, completed: false } : q,
      );

      setProfile((prevProfile) => {
        if (!prevProfile) return prevProfile;
        const newProfile = { ...prevProfile };
        newProfile.xp = Math.max(0, newProfile.xp - quest.xpReward);
        newProfile.totalQuestsCompleted = Math.max(0, newProfile.totalQuestsCompleted - 1);
        newProfile.rank = rankFromLevel(newProfile.level);
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

  const addWater = useCallback(async (amountMl: number, xpBonus = 0) => {
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

      const earnedXP = xpBonus > 0 ? xpBonus : (amountMl >= 250 ? 10 : 0);

      setProfile((prevProfile) => {
        if (!prevProfile) return prevProfile;
        const newProfile = { ...prevProfile };
        newProfile.metrics = { ...newProfile.metrics, hydration: hydrationPercent };
        if (earnedXP > 0) {
          newProfile.xp += earnedXP;
          while (newProfile.xp >= newProfile.xpToNext) {
            newProfile.xp -= newProfile.xpToNext;
            newProfile.level += 1;
            newProfile.xpToNext = Math.round(newProfile.xpToNext * 1.3);
          }
          newProfile.rank = rankFromLevel(newProfile.level);
        }
        syncProfile(newProfile);
        return newProfile;
      });

      setActivities((prev) => [
        {
          id: `water-${Date.now()}`,
          type: 'water',
          title: 'Hydration logged',
          subtitle: `+${amountMl}ml${earnedXP > 0 ? ` · +${earnedXP} XP` : ''}`,
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
      const today = new Date().toISOString().split('T')[0];
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
  }, [session, water, syncProfile]);

  const logExercise = useCallback(async (
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
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const earnedXP = xpReward !== undefined ? xpReward : Math.max(15, Math.round(durationMin * 4));

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

    // Update exercise progress metric
    const totalMin = exercises.reduce((sum, e) => sum + e.durationMin, 0) + durationMin;
    const exerciseProgress = Math.min(Math.round((totalMin / 60) * 100), 100);

    setProfile((prevProfile) => {
      if (!prevProfile) return prevProfile;
      const newProfile = { ...prevProfile };
      newProfile.metrics = { ...newProfile.metrics, exerciseProgress };
      if (earnedXP > 0) {
        newProfile.xp += earnedXP;
        while (newProfile.xp >= newProfile.xpToNext) {
          newProfile.xp -= newProfile.xpToNext;
          newProfile.level += 1;
          newProfile.xpToNext = Math.round(newProfile.xpToNext * 1.3);
        }
        newProfile.rank = rankFromLevel(newProfile.level);
      }
      syncProfile(newProfile);
      return newProfile;
    });

    const setsSummary = extra?.sets && extra.sets.length > 0
      ? ` · ${extra.sets.length} sets`
      : '';

    // Add activity
    setActivities((prev) => [
      {
        id: `exercise-${Date.now()}`,
        type: 'exercise',
        title: `${extra?.customName || exerciseType} session`,
        subtitle: `${durationMin} min · ${caloriesBurned} cal${setsSummary} · +${earnedXP} XP`,
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
      xpEarned,
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
  }, [session, exercises, syncProfile]);

  const deleteExercise = useCallback(async (exerciseId: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== exerciseId));
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
  }, [session]);

  const logWeight = useCallback(async (weightKg: number) => {
    const today = new Date().toISOString().split('T')[0];
    const prevWeight = weight.weightKg;

    setWeight({ weightKg, date: today });
    setWeightTrend({ current: weightKg, previous: prevWeight || weightKg });
    setProfile((prev) => prev ? { ...prev, weightKg } : prev);

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
  }, [session, weight]);

  const logSleep = useCallback(async (sleepHours: number) => {
    const sleepQuality = Math.min(Math.round((sleepHours / 8) * 100), 100);
    setHealth((prev) => ({ ...prev, sleepHours, sleepQuality }));
    setProfile((prev) => prev ? { ...prev, metrics: { ...prev.metrics, sleepQuality } } : prev);

    setActivities((prev) => [
      {
        id: `sleep-${Date.now()}`,
        type: 'sleep',
        title: 'Sleep logged',
        subtitle: `${sleepHours.toFixed(1)} hours`,
        timestamp: new Date().toISOString(),
        icon: 'Moon',
        color: '#a78bfa',
      },
      ...prev,
    ]);

    if (!session?.user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('health_metrics')
          .update({ sleep_hours: sleepHours, sleep_quality: sleepQuality, updated_at: new Date().toISOString() })
          .eq('user_id', session.user.id)
          .eq('date', today);
      } else {
        await supabase.from('health_metrics').insert({
          user_id: session.user.id,
          sleep_hours: sleepHours,
          sleep_quality: sleepQuality,
        });
      }

      await supabase.from('user_profiles')
        .update({ sleep_quality: sleepQuality, updated_at: new Date().toISOString() })
        .eq('user_id', session.user.id);
    } catch (err) {
      console.warn('[AI Studio] Supabase sleep sync warning:', err);
    }
  }, [session]);

  const addXP = useCallback((xpAmount: number, reason = 'Training XP') => {
    if (xpAmount <= 0) return;
    setProfile((prevProfile) => {
      if (!prevProfile) return prevProfile;
      const newProfile = { ...prevProfile };
      newProfile.xp += xpAmount;

      while (newProfile.xp >= newProfile.xpToNext) {
        newProfile.xp -= newProfile.xpToNext;
        newProfile.level += 1;
        newProfile.xpToNext = Math.round(newProfile.xpToNext * 1.3);
      }
      newProfile.rank = rankFromLevel(newProfile.level);

      syncProfile(newProfile);
      return newProfile;
    });

    setActivities((prevActs) => [
      {
        id: `xp-${Date.now()}`,
        type: 'quest' as const,
        title: reason,
        subtitle: `+${xpAmount} XP earned`,
        timestamp: new Date().toISOString(),
        icon: 'Award',
        color: '#fbbf24',
      },
      ...prevActs,
    ]);
  }, [syncProfile]);

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
      playAlarmSound(waterReminder.sound || 'crystal_droplets');
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
  }, [waterReminder.sound, waterReminder.soundEnabled]);

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
      playAlarmSound(workoutAlarm.sound || 'system_bell');
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
  }, [workoutAlarm.sound, workoutAlarm.soundEnabled, workoutAlarm.time]);

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
  };
}

export type Store = ReturnType<typeof useStore>;
