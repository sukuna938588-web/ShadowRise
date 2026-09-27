import type { Rank } from '@/types';

/**
 * ShadowRise Progression Engine
 *
 * Real XP-based level and rank progression rules:
 *
 * LEVEL SYSTEM:
 * - Level 1 -> 100 XP
 * - Level 2 -> 250 XP (+150)
 * - Level 3 -> 450 XP (+200)
 * - Level 4 -> 700 XP (+250)
 * - Level 5 -> 1000 XP (+300)
 * Progressive formula: threshold(level) = 25 * level * (level + 3)
 *
 * RANK SYSTEM (based on total XP):
 * - E Rank: 0 - 1000 XP
 * - D Rank: 1001 - 3000 XP
 * - C Rank: 3001 - 7000 XP
 * - B Rank: 7001 - 15000 XP
 * - A Rank: 15001 - 30000 XP
 * - S Rank: 30001+ XP
 *
 * XP REWARDS:
 * - Workout Completed: +50 XP
 * - Daily Quest Completed: +100 XP
 * - Water Goal Completed: +20 XP
 * - Sleep Tracking Completed: +25 XP
 * - Weekly Streak Completed: +200 XP
 * - Goal Weight Achievement: +500 XP
 */

export const XP_REWARDS = {
  WORKOUT_COMPLETED: 50,
  DAILY_QUEST_COMPLETED: 100,
  WATER_GOAL_COMPLETED: 20,
  SLEEP_TRACKING_COMPLETED: 25,
  WEEKLY_STREAK_COMPLETED: 200,
  GOAL_WEIGHT_ACHIEVED: 500,
} as const;

export type XPActivityType =
  | 'Workout Completed'
  | 'Daily Quest Completed'
  | 'Water Goal Completed'
  | 'Sleep Tracking Completed'
  | 'Weekly Streak Completed'
  | 'Goal Weight Achievement';

export interface XPHistoryItem {
  id: string;
  date: string; // YYYY-MM-DD
  activity: string; // Activity name
  xpEarned: number;
  timestamp: string; // ISO string
}

export interface ProgressionDetails {
  totalXP: number;
  level: number;
  rank: Rank;
  prevLevelThreshold: number;
  nextLevelThreshold: number;
  remainingXPNeeded: number;
  levelProgressPercent: number;
  nextRank: Rank | null;
  xpNeededForNextRank: number;
}

/**
 * Calculates cumulative total XP required to reach the next level.
 * Level 1 -> 100
 * Level 2 -> 250
 * Level 3 -> 450
 * Level 4 -> 700
 * Level 5 -> 1000
 */
export function getLevelThreshold(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level || 1));
  return 25 * safeLevel * (safeLevel + 3);
}

/**
 * Calculates Hunter Level from Total XP.
 */
export function calculateLevelFromTotalXP(totalXP: number): number {
  const safeXP = Math.max(0, Math.floor(Number(totalXP) || 0));
  let level = 1;
  while (safeXP >= getLevelThreshold(level)) {
    level++;
    // Safety guard against infinite loops
    if (level > 200) break;
  }
  return level;
}

/**
 * Calculates Hunter Rank from Total XP.
 * E: 0 - 1000 XP
 * D: 1001 - 3000 XP
 * C: 3001 - 7000 XP
 * B: 7001 - 15000 XP
 * A: 15001 - 30000 XP
 * S: 30001+ XP
 */
export function calculateRankFromTotalXP(totalXP: number): Rank {
  const safeXP = Math.max(0, Math.floor(Number(totalXP) || 0));
  if (safeXP >= 30001) return 'S';
  if (safeXP >= 15001) return 'A';
  if (safeXP >= 7001) return 'B';
  if (safeXP >= 3001) return 'C';
  if (safeXP >= 1001) return 'D';
  return 'E';
}

export const RANK_THRESHOLDS: Record<Rank, { min: number; max: number; next: Rank | null }> = {
  E: { min: 0, max: 1000, next: 'D' },
  D: { min: 1001, max: 3000, next: 'C' },
  C: { min: 3001, max: 7000, next: 'B' },
  B: { min: 7001, max: 15000, next: 'A' },
  A: { min: 15001, max: 30000, next: 'S' },
  S: { min: 30001, max: Infinity, next: null },
};

/**
 * Generates complete progression breakdown for UI components.
 */
export function getProgressionDetails(totalXP: number): ProgressionDetails {
  const safeXP = Math.max(0, Math.floor(Number(totalXP) || 0));
  const level = calculateLevelFromTotalXP(safeXP);
  const rank = calculateRankFromTotalXP(safeXP);

  const prevLevelThreshold = level === 1 ? 0 : getLevelThreshold(level - 1);
  const nextLevelThreshold = getLevelThreshold(level);

  const remainingXPNeeded = Math.max(0, nextLevelThreshold - safeXP);
  const xpInCurrentBracket = safeXP - prevLevelThreshold;
  const bracketTotal = nextLevelThreshold - prevLevelThreshold;

  const levelProgressPercent = bracketTotal > 0
    ? Math.min(100, Math.max(0, Math.round((xpInCurrentBracket / bracketTotal) * 100)))
    : 100;

  const rankInfo = RANK_THRESHOLDS[rank];
  const nextRank = rankInfo.next;
  const xpNeededForNextRank = nextRank
    ? Math.max(0, RANK_THRESHOLDS[nextRank].min - safeXP)
    : 0;

  return {
    totalXP: safeXP,
    level,
    rank,
    prevLevelThreshold,
    nextLevelThreshold,
    remainingXPNeeded,
    levelProgressPercent,
    nextRank,
    xpNeededForNextRank,
  };
}
