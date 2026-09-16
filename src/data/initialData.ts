import type { Quest, Note } from '@/types';

export const initialQuests: Quest[] = [
  {
    id: 'q1',
    title: 'Morning Run',
    description: 'Run 3km to start the day with energy.',
    type: 'workout',
    difficulty: 'normal',
    xpReward: 80,
    completed: false,
    date: '2026-09-13',
  },
  {
    id: 'q2',
    title: 'Strength Training',
    description: 'Complete 4 sets of squats and deadlifts.',
    type: 'workout',
    difficulty: 'hard',
    xpReward: 120,
    completed: false,
    date: '2026-09-13',
  },
  {
    id: 'q3',
    title: 'Clean Meals',
    description: 'Eat 3 high-protein meals with no processed sugar.',
    type: 'nutrition',
    difficulty: 'normal',
    xpReward: 60,
    completed: false,
    date: '2026-09-13',
  },
  {
    id: 'q4',
    title: 'Meditation',
    description: 'Meditate for 15 minutes in complete silence.',
    type: 'mindfulness',
    difficulty: 'easy',
    xpReward: 40,
    completed: true,
    date: '2026-09-13',
  },
  {
    id: 'q5',
    title: 'Full Body Challenge',
    description: '100 push-ups, 100 sit-ups, 100 squats — no rest.',
    type: 'challenge',
    difficulty: 'extreme',
    xpReward: 200,
    completed: false,
    date: '2026-09-13',
  },
  {
    id: 'q6',
    title: 'Drink Water',
    description: 'Drink 3 liters of water throughout the day.',
    type: 'nutrition',
    difficulty: 'easy',
    xpReward: 30,
    completed: true,
    date: '2026-09-13',
  },
  {
    id: 'q7',
    title: 'Sleep Recovery',
    description: 'Sleep before 11 PM for full recovery cycle.',
    type: 'mindfulness',
    difficulty: 'easy',
    xpReward: 35,
    completed: false,
    date: '2026-09-13',
  },
];

export const initialNotes: Note[] = [
  {
    id: 'n1',
    title: 'Great session',
    content: 'Today I felt the shift. The morning run was tough but my body is adapting. Every step forward is progress.',
    date: '2026-09-12',
    mood: 'great',
  },
  {
    id: 'n2',
    title: 'Tough workout',
    content: 'Strength training nearly broke me today. My legs are trembling but I know this is what it takes.',
    date: '2026-09-11',
    mood: 'tired',
  },
  {
    id: 'n3',
    title: 'Mental clarity',
    content: 'Meditation is becoming easier. Fifteen minutes of silence felt like seconds. My mind is sharpening.',
    date: '2026-09-10',
    mood: 'good',
  },
];

export const rankConfig: Record<string, { color: string; glow: string; label: string }> = {
  E: { color: '#94a3b8', glow: 'rgba(148, 163, 184, 0.5)', label: 'E Rank' },
  D: { color: '#34d399', glow: 'rgba(52, 211, 153, 0.5)', label: 'D Rank' },
  C: { color: '#60a5fa', glow: 'rgba(96, 165, 250, 0.5)', label: 'C Rank' },
  B: { color: '#a78bfa', glow: 'rgba(167, 139, 250, 0.5)', label: 'B Rank' },
  A: { color: '#f87171', glow: 'rgba(248, 113, 113, 0.5)', label: 'A Rank' },
  S: { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.5)', label: 'S Rank' },
};

export const difficultyConfig: Record<string, { color: string; bg: string; label: string }> = {
  easy: { color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)', label: 'Easy' },
  normal: { color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.12)', label: 'Normal' },
  medium: { color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.12)', label: 'Normal' },
  hard: { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)', label: 'Hard' },
  extreme: { color: '#f87171', bg: 'rgba(248, 113, 113, 0.12)', label: 'Extreme' },
  // Uppercase aliases for robust compatibility
  EASY: { color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)', label: 'Easy' },
  NORMAL: { color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.12)', label: 'Normal' },
  MEDIUM: { color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.12)', label: 'Normal' },
  HARD: { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)', label: 'Hard' },
  EXTREME: { color: '#f87171', bg: 'rgba(248, 113, 113, 0.12)', label: 'Extreme' },
};

export function getDifficultyConfig(diff?: string | null): { color: string; bg: string; label: string } {
  if (!diff) return difficultyConfig.easy;
  const key = String(diff).toLowerCase();
  return difficultyConfig[key] ?? difficultyConfig[diff] ?? difficultyConfig.easy;
}

export const questTypeConfig: Record<string, { icon: string; color: string; label: string }> = {
  workout: { icon: 'Dumbbell', color: '#f87171', label: 'Workout' },
  exercise: { icon: 'Dumbbell', color: '#f87171', label: 'Workout' },
  nutrition: { icon: 'Apple', color: '#34d399', label: 'Nutrition' },
  mindfulness: { icon: 'Brain', color: '#a78bfa', label: 'Mindfulness' },
  challenge: { icon: 'Flame', color: '#fbbf24', label: 'Challenge' },
};

export function getQuestTypeConfig(type?: string | null): { icon: string; color: string; label: string } {
  if (!type) return questTypeConfig.workout;
  const key = String(type).toLowerCase();
  return questTypeConfig[key] ?? questTypeConfig[type] ?? questTypeConfig.workout;
}

export const moodConfig: Record<string, { icon: string; color: string; label: string }> = {
  great: { icon: 'Smile', color: '#34d399', label: 'Great' },
  good: { icon: 'Meh', color: '#60a5fa', label: 'Good' },
  neutral: { icon: 'Minus', color: '#94a3b8', label: 'Neutral' },
  tired: { icon: 'BatteryLow', color: '#fbbf24', label: 'Tired' },
  bad: { icon: 'Frown', color: '#f87171', label: 'Bad' },
};

export const exerciseTypeConfig: Record<string, { icon: string; color: string; label: string }> = {
  cardio: { icon: 'Footprints', color: '#f87171', label: 'Cardio' },
  strength: { icon: 'Dumbbell', color: '#fbbf24', label: 'Strength' },
  yoga: { icon: 'Brain', color: '#a78bfa', label: 'Yoga' },
  hiit: { icon: 'Flame', color: '#34d399', label: 'HIIT' },
  cycling: { icon: 'Bike', color: '#60a5fa', label: 'Cycling' },
  swimming: { icon: 'Waves', color: '#22d3ee', label: 'Swimming' },
};
