import type { BuiltInAlarmSound } from '@/types';

export type SoundEventType =
  | 'sleepReminder'
  | 'wakeUpAlarm'
  | 'waterReminder'
  | 'questReminder'
  | 'rankUp'
  | 'achievementUnlock'
  | 'weeklyGoalComplete';

export type SoundCategoryType = 'alarm' | 'reminder' | 'celebration';

export type SoundSourceType = 'default' | 'builtin' | 'custom' | 'voice';

export interface SoundEventMeta {
  type: SoundEventType;
  title: string;
  description: string;
  category: SoundCategoryType;
  defaultBuiltin: BuiltInAlarmSound;
  defaultVoiceText: string;
  iconName: 'Moon' | 'Sun' | 'Droplets' | 'Scroll' | 'Flame' | 'Trophy' | 'Sparkles';
}

export interface CustomAudioFile {
  id: string;
  name: string;
  size: number;
  type: string; // e.g. 'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a'
  uploadedAt: string;
  category: 'sound' | 'voice';
  voiceLabel?: string;
  dataUrl?: string; // fallback or memory cached
}

export interface EventSoundConfig {
  sourceType: SoundSourceType;
  builtinSound: BuiltInAlarmSound;
  customAudioId?: string;
  customAudioName?: string;
  voiceClipId?: string;
  voicePromptText?: string;
  volumeMultiplier: number; // 0 - 100 (defaults to 100)
}

export interface SoundSystemSettings {
  masterVolume: number; // 0 - 100 (default: 80)
  alarmVolume: number; // 0 - 100 (default: 90)
  reminderVolume: number; // 0 - 100 (default: 75)
  events: Record<SoundEventType, EventSoundConfig>;
}

export const SOUND_EVENT_METAS: Record<SoundEventType, SoundEventMeta> = {
  sleepReminder: {
    type: 'sleepReminder',
    title: 'Sleep Reminder',
    description: 'Alerts when it is time to enter the recovery chamber',
    category: 'reminder',
    defaultBuiltin: 'monarch_arise',
    defaultVoiceText: 'Hunter, enter the recovery chamber. Vitality replenishment required.',
    iconName: 'Moon',
  },
  wakeUpAlarm: {
    type: 'wakeUpAlarm',
    title: 'Wake Up Alarm',
    description: 'Morning sovereign awakening and combat readiness call',
    category: 'alarm',
    defaultBuiltin: 'red_gate_alert',
    defaultVoiceText: 'Hunter, wake up. The Monarch calls you to arise.',
    iconName: 'Sun',
  },
  waterReminder: {
    type: 'waterReminder',
    title: 'Water Reminder',
    description: 'Periodic hydration directive to replenish vital fluids',
    category: 'reminder',
    defaultBuiltin: 'crystal_droplets',
    defaultVoiceText: 'Hydration required. Restore your biological mana.',
    iconName: 'Droplets',
  },
  questReminder: {
    type: 'questReminder',
    title: 'Quest Reminder',
    description: 'Daily dungeon quest notification and training directives',
    category: 'reminder',
    defaultBuiltin: 'system_bell',
    defaultVoiceText: 'Quest available. Daily directives await your command.',
    iconName: 'Scroll',
  },
  rankUp: {
    type: 'rankUp',
    title: 'Rank Up',
    description: 'Triumphant fanfare when ascending Hunter ranks',
    category: 'celebration',
    defaultBuiltin: 'level_up',
    defaultVoiceText: 'Rank ascension confirmed. Monarch aura expanding.',
    iconName: 'Flame',
  },
  achievementUnlock: {
    type: 'achievementUnlock',
    title: 'Achievement Unlock',
    description: 'Alert when hitting milestone targets and special achievements',
    category: 'celebration',
    defaultBuiltin: 'system_bell',
    defaultVoiceText: 'Achievement unlocked. Sovereign potential increased.',
    iconName: 'Trophy',
  },
  weeklyGoalComplete: {
    type: 'weeklyGoalComplete',
    title: 'Weekly Goal Complete',
    description: 'Weekly workout streak and quest mastery celebration',
    category: 'celebration',
    defaultBuiltin: 'shadow_resonance',
    defaultVoiceText: 'Weekly objective conquered. Impeccable hunter discipline.',
    iconName: 'Sparkles',
  },
};

export const DEFAULT_SOUND_SETTINGS: SoundSystemSettings = {
  masterVolume: 80,
  alarmVolume: 90,
  reminderVolume: 75,
  events: {
    sleepReminder: {
      sourceType: 'default',
      builtinSound: 'monarch_arise',
      volumeMultiplier: 100,
    },
    wakeUpAlarm: {
      sourceType: 'default',
      builtinSound: 'red_gate_alert',
      volumeMultiplier: 100,
    },
    waterReminder: {
      sourceType: 'default',
      builtinSound: 'crystal_droplets',
      volumeMultiplier: 100,
    },
    questReminder: {
      sourceType: 'default',
      builtinSound: 'system_bell',
      volumeMultiplier: 100,
    },
    rankUp: {
      sourceType: 'default',
      builtinSound: 'level_up',
      volumeMultiplier: 100,
    },
    achievementUnlock: {
      sourceType: 'default',
      builtinSound: 'system_bell',
      volumeMultiplier: 100,
    },
    weeklyGoalComplete: {
      sourceType: 'default',
      builtinSound: 'shadow_resonance',
      volumeMultiplier: 100,
    },
  },
};
