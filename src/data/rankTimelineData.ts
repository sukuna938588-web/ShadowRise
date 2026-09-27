import type { Rank, RankHistoryEntry } from '@/types';

export interface RankMilestoneDef {
  rank: Rank;
  minLevel: number;
  title: string;
  codename: string;
  epithet: string;
  color: string;
  glow: string;
  bgGlow: string;
  quote: string;
  statBonus: string;
  perks: string[];
  description: string;
}

export const RANK_TIMELINE_DEFINITIONS: Record<Rank, RankMilestoneDef> = {
  E: {
    rank: 'E',
    minLevel: 1,
    title: 'E-Rank Awakened Hunter',
    codename: 'Awakened Novice',
    epithet: 'The Inception · Survival Directive',
    color: '#94a3b8',
    glow: 'rgba(148, 163, 184, 0.6)',
    bgGlow: 'rgba(148, 163, 184, 0.12)',
    quote: '"[SYSTEM MESSAGE: You have qualified as a Player. Welcome to ShadowRise.]"',
    statBonus: '+0% Baseline Combat Power',
    perks: [
      'Access to Daily Quest Log & Physical Conditioning',
      'Basic Hydration & Vitality Tracking Protocol',
      'ShadowRise Awakening Dossier Registration',
    ],
    description: 'Initial biological awakening into the System. Every legendary Monarch once began at this threshold.',
  },
  D: {
    rank: 'D',
    minLevel: 10,
    title: 'D-Rank Iron Raider',
    codename: 'Iron Vanguard',
    epithet: 'Dungeon Scavenger · Physical Adaptation',
    color: '#34d399',
    glow: 'rgba(52, 211, 153, 0.6)',
    bgGlow: 'rgba(52, 211, 153, 0.12)',
    quote: '"Your muscles knit stronger after every trial. The mana flows naturally through your veins."',
    statBonus: '+15% Stamina & Recovery Threshold',
    perks: [
      'Intermediate Quest Clearances Unlocked',
      'Health Biometrics & Injury Strain Prevention Guards',
      'Access to Dungeon Gate Workout Directives',
    ],
    description: 'Surpassed the fragility of ordinary mortals. Your endurance and recovery are now superhuman.',
  },
  C: {
    rank: 'C',
    minLevel: 20,
    title: 'C-Rank Shadow Vanguard',
    codename: 'Mana Vanguard',
    epithet: 'Strike Team Specialist · Mana Condensation',
    color: '#60a5fa',
    glow: 'rgba(96, 165, 250, 0.6)',
    bgGlow: 'rgba(96, 165, 250, 0.12)',
    quote: '"Mana perception sharpens. Red dungeon gates no longer instill paralyzing terror."',
    statBonus: '+30% Training Intensity & Aerobic Capacity',
    perks: [
      'Voice Motivation Directive Access',
      'Advanced HIIT & Strength Combat Protocols',
      'Red Gate Resilience & Deep Sleep Optimization',
    ],
    description: 'Seasoned combatant trusted in hazardous dungeon incursions and strike operations.',
  },
  B: {
    rank: 'B',
    minLevel: 30,
    title: 'B-Rank Phantom Slayer',
    codename: 'Phantom Slayer',
    epithet: 'Raid Commander · Ruler’s Touch',
    color: '#a78bfa',
    glow: 'rgba(167, 139, 250, 0.6)',
    bgGlow: 'rgba(167, 139, 250, 0.12)',
    quote: '"Gravity bends around your shadow. You move with silent, lethal precision."',
    statBonus: '+50% Physical Output & Sovereign Focus',
    perks: [
      'High-Tier Boss Raid Simulation Access',
      'Ruler’s Authority Reflex Boosters',
      'Autonomous Water & Rest Habituation Sync',
    ],
    description: 'An elite force capable of leading multi-guild raids and conquering high-tier dungeon gates.',
  },
  A: {
    rank: 'A',
    minLevel: 40,
    title: 'A-Rank Sovereign Knight',
    codename: 'Sovereign Knight',
    epithet: 'Apex Hunter · Domain Manifestation',
    color: '#f87171',
    glow: 'rgba(248, 113, 113, 0.6)',
    bgGlow: 'rgba(248, 113, 113, 0.12)',
    quote: '"Your presence alone chills the dungeon air. Monsters recoil before your blade."',
    statBonus: '+80% Total Conditioning & Caloric Burn Surge',
    perks: [
      'Monarch’s Aura Domain Multiplier',
      'Extreme Difficulty Quest Clear Authority',
      'Unlimited ShadowRise Alarm & Routine Overrides',
    ],
    description: 'One of the top echelon hunters in the world. Capable of standing against dungeon breaks solo.',
  },
  S: {
    rank: 'S',
    minLevel: 50,
    title: 'S-Rank Shadow Monarch',
    codename: 'Shadow Monarch',
    epithet: 'National-Level Sovereign · Absolute Ascendant',
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.7)',
    bgGlow: 'rgba(251, 191, 36, 0.15)',
    quote: '"[ARISE] The shadows answer to you alone. You are death, power, and eternity."',
    statBonus: '+120% Absolute Power & Infinite Will',
    perks: [
      'Shadow Extraction Authority ("ARISE")',
      'Limitless Potential Protocol & Apex Hunter Status',
      'Permanent National Sovereign Designation',
    ],
    description: 'The pinnacle of existence. A living calamity and sovereign commander of the Shadow Army.',
  },
};

export const RANK_ORDER: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S'];

/**
 * Builds an authentic rank history for a hunter based on their registration date and current level.
 */
export function generateInitialRankHistory(
  currentRank: Rank,
  currentLevel: number,
  registeredAt?: string,
  totalQuestsCompleted = 0,
  totalXp = 0
): RankHistoryEntry[] {
  const currentRankIdx = RANK_ORDER.indexOf(currentRank);
  const now = new Date();
  const regDate = registeredAt ? new Date(registeredAt) : new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // If date was invalid, fall back to now
  const validRegDate = isNaN(regDate.getTime()) ? new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) : regDate;

  const entries: RankHistoryEntry[] = [];

  for (let i = 0; i <= currentRankIdx; i++) {
    const r = RANK_ORDER[i];
    const def = RANK_TIMELINE_DEFINITIONS[r];

    // Compute synthetic or actual unlock date
    let unlockDate: Date;
    if (i === 0) {
      unlockDate = validRegDate;
    } else if (i === currentRankIdx) {
      // Current rank unlocked recently or today
      unlockDate = now;
    } else {
      // Interpolate between registration date and now
      const progressFraction = i / Math.max(1, currentRankIdx);
      const spanMs = now.getTime() - validRegDate.getTime();
      unlockDate = new Date(validRegDate.getTime() + spanMs * progressFraction);
    }

    const questsAtRank = Math.max(0, Math.round((totalQuestsCompleted * (i + 1)) / (currentRankIdx + 1)));
    const xpAtRank = Math.max(0, Math.round((totalXp * (i + 1)) / (currentRankIdx + 1)));

    entries.push({
      id: `rank-hist-${r.toLowerCase()}-${unlockDate.getTime()}`,
      rank: r,
      level: i === currentRankIdx ? currentLevel : def.minLevel,
      title: def.title,
      unlockedAt: unlockDate.toISOString(),
      questsClearedAtUnlock: questsAtRank,
      totalXpAtUnlock: xpAtRank,
      perksUnlocked: def.perks,
      systemDirective: def.quote,
      isInitialAwakening: i === 0,
    });
  }

  return entries;
}

export function createRankUpHistoryEntry(
  newRank: Rank,
  level: number,
  questsCompleted = 0,
  totalXp = 0
): RankHistoryEntry {
  const def = RANK_TIMELINE_DEFINITIONS[newRank];
  return {
    id: `rank-hist-${newRank.toLowerCase()}-${Date.now()}`,
    rank: newRank,
    level,
    title: def.title,
    unlockedAt: new Date().toISOString(),
    questsClearedAtUnlock: questsCompleted,
    totalXpAtUnlock: totalXp,
    perksUnlocked: def.perks,
    systemDirective: def.quote,
    isInitialAwakening: newRank === 'E',
  };
}
