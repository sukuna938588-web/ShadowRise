// Voice Motivation System (Solo Leveling & Hunter Inspired)
import { playWorkoutCompleteFanfare } from './audioEffects';

export interface VoiceMessage {
  id: string;
  title: string;
  speaker: string;
  role: 'system' | 'monarch' | 'ai_coach';
  text: string;
  rankRequirement?: string;
}

export const HUNTER_VOICE_MESSAGES: VoiceMessage[] = [
  {
    id: 'arise_limits',
    title: 'Surpass Your Limits',
    speaker: 'The System',
    role: 'system',
    text: 'Arise, Hunter! You have pushed past your physical limits today. The System registers your exponential growth.',
  },
  {
    id: 'dungeon_clearance',
    title: 'Dungeon Cleared',
    speaker: 'The System',
    role: 'system',
    text: 'System Notification: Training dungeon clearance authenticated. Your physical endurance and mana reserves have ascended to a higher tier.',
  },
  {
    id: 'monarch_discipline',
    title: 'Monarch’s Command',
    speaker: 'Shadow Monarch',
    role: 'monarch',
    text: 'A true Monarch never halts before the objective is conquered. Outstanding discipline, Hunter. Your shadow army honors your strength.',
  },
  {
    id: 'stat_advancement',
    title: 'Stat Surge Registered',
    speaker: 'The System',
    role: 'system',
    text: 'Stat advancement credited. Strength, agility, and vitality have surged. Stand proud, you are leveling up.',
  },
  {
    id: 'national_threshold',
    title: 'National Level Threshold',
    speaker: 'AI Hunter Coach',
    role: 'ai_coach',
    text: 'The threshold has been breached. Your sweat today forms the armor of tomorrow’s National Level Hunter.',
  },
  {
    id: 'shadow_legion',
    title: 'Iron Will of the Monarch',
    speaker: 'Shadow Monarch',
    role: 'monarch',
    text: 'Pain is temporary, but the throne is eternal. Rest and recover, for tomorrow’s gate awaits your command.',
  },
];

export function getRandomHunterVoiceMessage(): VoiceMessage {
  const index = Math.floor(Math.random() * HUNTER_VOICE_MESSAGES.length);
  return HUNTER_VOICE_MESSAGES[index] || HUNTER_VOICE_MESSAGES[0];
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function stopSpeaking(): void {
  if (isSpeechSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore speech cancellation errors
    }
  }
}

export function speakHunterMotivation(
  message: VoiceMessage,
  options?: {
    volume?: number;
    rate?: number;
    playFanfareFirst?: boolean;
    onEnd?: () => void;
    onError?: () => void;
  }
): void {
  const { volume = 1, rate = 0.95, playFanfareFirst = true, onEnd, onError } = options || {};

  if (playFanfareFirst) {
    try {
      playWorkoutCompleteFanfare();
    } catch {
      // Ignore sound effect errors
    }
  }

  if (!isSpeechSupported()) {
    onEnd?.();
    return;
  }

  try {
    window.speechSynthesis.cancel();

    // Small delay to allow completion fanfare to ring before speaking
    const speechDelay = playFanfareFirst ? 350 : 50;

    setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(message.text);
        utterance.volume = Math.max(0, Math.min(1, volume));
        utterance.rate = Math.max(0.7, Math.min(1.2, rate)); // deliberate, authoritative hunter cadence
        utterance.pitch = message.role === 'monarch' ? 0.85 : 1.0; // deeper pitch for Monarch

        const voices = window.speechSynthesis.getVoices();
        // Look for deep, clear English voice
        const preferredVoice =
          voices.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.includes('Male') ||
                v.name.includes('Natural') ||
                v.name.includes('David') ||
                v.name.includes('George') ||
                v.name.includes('Daniel') ||
                v.name.includes('Google UK English Male'))
          ) ||
          voices.find((v) => v.lang.startsWith('en')) ||
          voices[0];

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onend = () => {
          onEnd?.();
        };

        utterance.onerror = () => {
          onError?.();
        };

        window.speechSynthesis.speak(utterance);
      } catch {
        onError?.();
      }
    }, speechDelay);
  } catch {
    onError?.();
  }
}
