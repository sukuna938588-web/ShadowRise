import type { AlarmSoundId, BuiltInAlarmSound, ShadowAlarm } from '@/types';

// Audio utility for timer transitions, countdown warnings, and water alerts using Web Audio API
export function playTone(
  frequency = 440,
  duration = 0.15,
  type: OscillatorType = 'sine',
  volume = 0.15
): void {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio contexts might be constrained by browser security until user interaction
  }
}

export function playWaterChime(): void {
  try {
    playTone(587.33, 0.15, 'sine', 0.12); // D5
    setTimeout(() => playTone(880, 0.25, 'triangle', 0.1), 100); // A5
  } catch {
    // Ignore audio failures
  }
}

export function playCountdownTick(): void {
  playTone(880, 0.08, 'sine', 0.1);
}

export function playPhaseTransitionTone(isWorkPhase: boolean): void {
  if (isWorkPhase) {
    // High energy ascending tone for combat / work
    playTone(523.25, 0.1, 'square', 0.08); // C5
    setTimeout(() => playTone(659.25, 0.12, 'square', 0.08), 80); // E5
    setTimeout(() => playTone(783.99, 0.25, 'triangle', 0.12), 160); // G5
  } else {
    // Calming descending tone for recovery / rest
    playTone(659.25, 0.12, 'sine', 0.08); // E5
    setTimeout(() => playTone(523.25, 0.2, 'sine', 0.08), 120); // C5
  }
}

export function playWorkoutCompleteFanfare(): void {
  playTone(523.25, 0.12, 'triangle', 0.12); // C5
  setTimeout(() => playTone(659.25, 0.12, 'triangle', 0.12), 100); // E5
  setTimeout(() => playTone(783.99, 0.15, 'triangle', 0.15), 200); // G5
  setTimeout(() => playTone(1046.5, 0.35, 'triangle', 0.2), 320); // C6
}

export const playTimerCompletionSound = playWorkoutCompleteFanfare;

/* =========================================================================
   CUSTOM ALARM SOUND SYSTEM (Solo Leveling & Hunter Inspired)
   ========================================================================= */

// 1. System Bell: Pure, resonant Quest / System bell triad
export function playSystemBell(volume = 0.2): void {
  try {
    playTone(1046.5, 0.3, 'sine', volume); // C6
    setTimeout(() => playTone(1318.51, 0.35, 'sine', volume), 110); // E6
    setTimeout(() => playTone(1567.98, 0.55, 'triangle', volume * 1.2), 220); // G6
    setTimeout(() => playTone(2093.0, 0.7, 'sine', volume * 0.9), 350); // C7
  } catch {
    // Ignore audio issues
  }
}

// 2. Shadow Resonance: Deep mystical harmonic chord with sub-bass
export function playShadowResonance(volume = 0.2): void {
  try {
    playTone(146.83, 0.6, 'sine', volume * 1.2); // D3 sub-bass
    playTone(220.0, 0.65, 'triangle', volume); // A3
    setTimeout(() => playTone(349.23, 0.5, 'sine', volume * 0.9), 120); // F4
    setTimeout(() => playTone(587.33, 0.7, 'sine', volume * 0.8), 240); // D5
  } catch {
    // Ignore audio issues
  }
}

// 3. Level Up Chime: Triumphant fast arpeggio
export function playLevelUpChime(volume = 0.2): void {
  try {
    playTone(523.25, 0.1, 'triangle', volume * 0.8); // C5
    setTimeout(() => playTone(659.25, 0.1, 'triangle', volume * 0.8), 70); // E5
    setTimeout(() => playTone(783.99, 0.1, 'triangle', volume), 140); // G5
    setTimeout(() => playTone(987.77, 0.12, 'triangle', volume), 210); // B5
    setTimeout(() => playTone(1046.5, 0.45, 'triangle', volume * 1.3), 280); // C6
  } catch {
    // Ignore audio issues
  }
}

// 4. Dungeon Warning Horn: Low brassy pulsed alert
export function playDungeonHorn(volume = 0.2): void {
  try {
    playTone(220, 0.22, 'sawtooth', volume * 0.8); // A3
    playTone(164.81, 0.22, 'sawtooth', volume * 0.8); // E3
    setTimeout(() => {
      playTone(220, 0.35, 'sawtooth', volume);
      playTone(164.81, 0.35, 'sawtooth', volume);
    }, 240);
  } catch {
    // Ignore audio issues
  }
}

// 5. Crystal Droplets: Gentle, soothing hydration droplet chime
export function playCrystalDroplets(volume = 0.2): void {
  try {
    playTone(659.25, 0.12, 'sine', volume * 0.9); // E5
    setTimeout(() => playTone(987.77, 0.15, 'sine', volume * 0.9), 90); // B5
    setTimeout(() => playTone(1318.51, 0.3, 'triangle', volume * 1.1), 180); // E6
  } catch {
    // Ignore audio issues
  }
}

// 6. Monarch Arise: Celestial awakening chord with surging resonance
export function playMonarchArise(volume = 0.2): void {
  try {
    // Sub-bass root
    playTone(110, 0.7, 'sine', volume * 1.3); // A2
    playTone(164.81, 0.7, 'triangle', volume); // E3
    setTimeout(() => {
      playTone(220, 0.5, 'sine', volume); // A3
      playTone(277.18, 0.5, 'triangle', volume); // C#4
    }, 120);
    setTimeout(() => {
      playTone(329.63, 0.6, 'sine', volume * 1.1); // E4
      playTone(440, 0.65, 'sine', volume * 1.2); // A4
      playTone(554.37, 0.8, 'triangle', volume * 0.9); // C#5
    }, 260);
  } catch {
    // Ignore audio issues
  }
}

// 7. Red Gate Alert: High-urgency danger pulses
export function playRedGateAlert(volume = 0.2): void {
  try {
    playTone(440, 0.12, 'sawtooth', volume * 0.9);
    playTone(587.33, 0.12, 'square', volume * 0.7);
    setTimeout(() => {
      playTone(440, 0.12, 'sawtooth', volume * 0.9);
      playTone(587.33, 0.12, 'square', volume * 0.7);
    }, 150);
    setTimeout(() => {
      playTone(659.25, 0.25, 'sawtooth', volume * 1.1);
    }, 300);
  } catch {
    // Ignore audio issues
  }
}

// 8. Dungeon Break: Emergency war horn & surging klaxon
export function playDungeonBreak(volume = 0.2): void {
  try {
    playTone(130.81, 0.4, 'sawtooth', volume * 1.1); // C3
    playTone(196.0, 0.4, 'sawtooth', volume); // G3
    setTimeout(() => {
      playTone(146.83, 0.5, 'sawtooth', volume * 1.2); // D3
      playTone(220.0, 0.5, 'sawtooth', volume * 1.1); // A3
    }, 280);
    setTimeout(() => {
      playTone(261.63, 0.6, 'sawtooth', volume * 1.3); // C4
    }, 550);
  } catch {
    // Ignore audio issues
  }
}

export function playAlarmSound(soundId: BuiltInAlarmSound | AlarmSoundId, volume = 0.2): void {
  switch (soundId) {
    case 'system_bell':
      playSystemBell(volume);
      break;
    case 'shadow_resonance':
      playShadowResonance(volume);
      break;
    case 'monarch_arise':
      playMonarchArise(volume);
      break;
    case 'red_gate_alert':
      playRedGateAlert(volume);
      break;
    case 'dungeon_break':
      playDungeonBreak(volume);
      break;
    case 'level_up':
      playLevelUpChime(volume);
      break;
    case 'dungeon_horn':
      playDungeonHorn(volume);
      break;
    case 'crystal_droplets':
    default:
      playCrystalDroplets(volume);
      break;
  }
}

export interface AlarmSoundOption {
  id: BuiltInAlarmSound;
  name: string;
  description: string;
  category: 'system' | 'shadow' | 'triumph' | 'warning' | 'vitality';
  badge: string;
}

export const ALARM_SOUND_OPTIONS: AlarmSoundOption[] = [
  {
    id: 'system_bell',
    name: 'System Bell',
    description: 'Crisp Solo Leveling quest completion chime',
    category: 'system',
    badge: 'Official Directive',
  },
  {
    id: 'shadow_resonance',
    name: 'Shadow Resonance',
    description: 'Deep mystical harmonic sub-bass chord',
    category: 'shadow',
    badge: 'Monarch Aura',
  },
  {
    id: 'monarch_arise',
    name: 'Monarch Arise',
    description: 'Ethereal celestial awakening chord for the true sovereign',
    category: 'shadow',
    badge: 'Awakening',
  },
  {
    id: 'red_gate_alert',
    name: 'Red Gate Alert',
    description: 'High-urgency danger pulses to wake instantly',
    category: 'warning',
    badge: 'S-Rank Gate',
  },
  {
    id: 'dungeon_break',
    name: 'Dungeon Break Klaxon',
    description: 'Emergency war horn for immediate physical awakening',
    category: 'warning',
    badge: 'Emergency',
  },
  {
    id: 'level_up',
    name: 'Level Up Fanfare',
    description: 'Triumphant ascending arpeggio for victory',
    category: 'triumph',
    badge: 'Rank Up',
  },
  {
    id: 'dungeon_horn',
    name: 'Dungeon Warning Horn',
    description: 'Pulsed combat alarm for training urgency',
    category: 'warning',
    badge: 'Red Gate',
  },
  {
    id: 'crystal_droplets',
    name: 'Crystal Droplets',
    description: 'Delicate water drops for calming hydration',
    category: 'vitality',
    badge: 'Mana Restorer',
  },
];

/* =========================================================================
   LOOPING AUDIO CONTROLLER & VIBRATION FOR RINGING ALARMS
   ========================================================================= */

export function startAlarmAudioLoop(alarm: ShadowAlarm): () => void {
  const vol = Math.max(0, Math.min(1, alarm.volume ?? 0.8));

  if (alarm.soundType === 'custom' && alarm.customSoundData) {
    try {
      const audio = new Audio(alarm.customSoundData);
      audio.loop = true;
      audio.volume = vol;
      audio.play().catch((err) => {
        console.warn('[AI Studio] Custom alarm audio play blocked by browser policy:', err);
      });

      return () => {
        try {
          audio.pause();
          audio.currentTime = 0;
          audio.src = '';
        } catch {
          // Ignore
        }
      };
    } catch (err) {
      console.warn('[AI Studio] Error creating Audio element for custom alarm:', err);
    }
  }

  // Built-in sound looping via interval
  playAlarmSound(alarm.builtinSound || 'system_bell', vol * 0.25);
  const intervalId = setInterval(() => {
    playAlarmSound(alarm.builtinSound || 'system_bell', vol * 0.25);
  }, 2400);

  return () => {
    clearInterval(intervalId);
  };
}

let vibrationIntervalId: ReturnType<typeof setInterval> | null = null;

export function startAlarmVibration(): void {
  if (typeof window === 'undefined' || !('navigator' in window) || !('vibrate' in navigator)) {
    return;
  }
  try {
    // Pulse pattern: 500ms on, 250ms off, 500ms on, 250ms off, 800ms on
    const pattern = [500, 250, 500, 250, 800];
    navigator.vibrate(pattern);

    if (vibrationIntervalId) clearInterval(vibrationIntervalId);
    vibrationIntervalId = setInterval(() => {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore
      }
    }, 2500);
  } catch {
    // Ignore unsupported vibration
  }
}

export function stopAlarmVibration(): void {
  if (vibrationIntervalId) {
    clearInterval(vibrationIntervalId);
    vibrationIntervalId = null;
  }
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(0);
    } catch {
      // Ignore
    }
  }
}

export function showAlarmBrowserNotification(title: string, body: string): Notification | null {
  if (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission === 'granted'
  ) {
    try {
      return new Notification(`[SYSTEM ALERT] ${title}`, {
        body,
        icon: '/favicon.ico',
        tag: 'shadowrise-alarm',
        requireInteraction: true,
      });
    } catch (err) {
      console.warn('[AI Studio] Browser notification error:', err);
    }
  }
  return null;
}

// Solo Leveling Cinematic Rank-up Fanfare with sub-bass resonance and ascending triumph
export function playRankUpFanfare(): void {
  try {
    // 1. Deep impact sub-bass
    playTone(55, 0.8, 'sawtooth', 0.25); // A1
    playTone(110, 0.6, 'sine', 0.2); // A2

    // 2. Chime sequence
    setTimeout(() => playTone(220, 0.3, 'triangle', 0.15), 150); // A3
    setTimeout(() => playTone(277.18, 0.3, 'triangle', 0.15), 300); // C#4
    setTimeout(() => playTone(329.63, 0.35, 'triangle', 0.18), 450); // E4
    setTimeout(() => playTone(440, 0.4, 'sine', 0.2), 600); // A4
    setTimeout(() => playTone(554.37, 0.45, 'triangle', 0.2), 750); // C#5
    setTimeout(() => {
      // Grand apex chord
      playTone(659.25, 0.9, 'triangle', 0.22); // E5
      playTone(880, 0.9, 'sine', 0.25); // A5
      playTone(1108.73, 1.1, 'sine', 0.18); // C#6
    }, 900);
  } catch {
    // Silently continue if audio context is unavailable
  }
}

// Purple lightning crackle sound
export function playLightningCrackSound(): void {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const bufferSize = ctx.sampleRate * 0.18;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Modulated noise burst
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.04));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime);
    filter.Q.setValueAtTime(3, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  } catch {
    // Ignore audio error
  }
}


