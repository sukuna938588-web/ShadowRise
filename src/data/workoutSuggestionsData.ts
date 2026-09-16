import type { WorkoutSuggestion, UserProfile } from '@/types';
import { calculateBMIAnalysis } from '@/utils/healthCalculations';

export const WORKOUT_SUGGESTIONS_CATALOG: WorkoutSuggestion[] = [
  // 1. Posture & Kyphosis Correction
  {
    id: 'sugg-posture-realign',
    title: 'Shadow Posture Realignment',
    subtitle: 'Thoracic Mobility & Kyphosis Armor',
    category: 'rehab',
    targetFocus: 'Spine, Scapulae & Upper Trapezius',
    durationMin: 15,
    estimatedCalories: 90,
    xpReward: 160,
    difficulty: 'easy',
    targetedIssues: ['poor_posture', 'neck_pain'],
    avoidIfIssues: [],
    whyRecommended: 'Targeted corrective mobility protocol designed to retract forward shoulders and decompress cervical vertebrae.',
    hunterRankBadge: 'E',
    exercises: [
      { name: 'Doorway Chest Opener', sets: 3, reps: '30s hold', notes: 'Keep core tight, open anterior chest' },
      { name: 'Prone Cobra Scapular Hold', sets: 3, reps: '12 reps', notes: 'Squeeze shoulder blades firmly' },
      { name: 'Wall Angels', sets: 3, reps: '10 reps', notes: 'Keep elbows and wrists flat against the wall' },
      { name: 'Chin Tucks against Resistance', sets: 3, reps: '15 reps', notes: 'Retract head back without tilting chin up' },
    ],
  },

  // 2. Spine Decompression & Lumbar Shield
  {
    id: 'sugg-lumbar-shield',
    title: 'Spinal Decompression & Lumbar Shield',
    subtitle: 'Zero-Axial Core Reinforcement',
    category: 'core',
    targetFocus: 'Lower Back, Transverse Abdominis & Glutes',
    durationMin: 18,
    estimatedCalories: 110,
    xpReward: 180,
    difficulty: 'easy',
    targetedIssues: ['back_pain', 'poor_posture'],
    avoidIfIssues: [],
    whyRecommended: 'Stabilizes the pelvis and lumbar spine without placing heavy axial pressure on spinal discs.',
    hunterRankBadge: 'D',
    exercises: [
      { name: 'Cat-Cow Spinal Articulation', sets: 3, reps: '10 cycles', notes: 'Slow and controlled breathing' },
      { name: 'Bird-Dog Stability Hold', sets: 3, reps: '8 reps per side (3s hold)', notes: 'Neutral spine, prevent hip sway' },
      { name: 'Glute Bridge with Abduction', sets: 3, reps: '15 reps', notes: 'Drive through heels, squeeze glutes at apex' },
      { name: 'Dead Bug Anti-Extension', sets: 3, reps: '10 per side', notes: 'Press lower back into the floor constantly' },
    ],
  },

  // 3. Knee-Preserving Low-Impact Cardio & Quadricep Restoration
  {
    id: 'sugg-joint-preservation',
    title: 'Joint Aegis: Low-Impact Stamina',
    subtitle: 'Zero-Impact Knee & Patella Defense',
    category: 'cardio',
    targetFocus: 'Joint Mobility, Quads, Hamstrings & Calves',
    durationMin: 22,
    estimatedCalories: 160,
    xpReward: 200,
    difficulty: 'normal',
    targetedIssues: ['knee_pain'],
    avoidIfIssues: [],
    whyRecommended: 'Burns calories and reinforces lower limb tendons without ground-reaction shock or deep knee shearing forces.',
    hunterRankBadge: 'D',
    exercises: [
      { name: 'Straight-Leg Isometric Raises', sets: 3, reps: '12 reps per leg', notes: 'Keep knee locked, activate VMO' },
      { name: 'Glute Medius Clamshells', sets: 3, reps: '15 reps per side', notes: 'Strengthen hip stabilizers to protect knees' },
      { name: 'Wall Sit at 45-Degree Angle', sets: 3, reps: '30s hold', notes: 'Shallow angle to minimize patella pressure' },
      { name: 'Low-Impact Brisk Incline Walk or Spin', sets: 1, durationMin: 12, notes: 'Smooth pedal cadence, no jarring impact' },
    ],
  },

  // 4. Rotator Cuff Armor & Shoulder Restoration
  {
    id: 'sugg-shoulder-armor',
    title: 'Titan Scapular & Cuff Shield',
    subtitle: 'Subacromial Impingement Recovery',
    category: 'rehab',
    targetFocus: 'Rotator Cuff, Rear Delts & Rhomboids',
    durationMin: 16,
    estimatedCalories: 95,
    xpReward: 170,
    difficulty: 'easy',
    targetedIssues: ['shoulder_pain', 'poor_posture'],
    avoidIfIssues: [],
    whyRecommended: 'Re-centers humeral heads within glenoid sockets and relieves anterior pinching.',
    hunterRankBadge: 'C',
    exercises: [
      { name: 'Band / Towel Pull-Aparts', sets: 3, reps: '15 reps', notes: 'Pinch scapulae, keep arms straight' },
      { name: 'External Rotation at 90°', sets: 3, reps: '12 reps per arm', notes: 'Light resistance, controlled eccentric' },
      { name: 'Prone Y-T-W Raises', sets: 3, reps: '8 reps each angle', notes: 'Hold for 1s at top, target lower traps' },
      { name: 'Scapular Wall Push-ups', sets: 3, reps: '12 reps', notes: 'Isolate scapular protraction/retraction' },
    ],
  },

  // 5. Shadow Agility Fat-Burn & Caloric Shred (Cardio & Fat Loss)
  {
    id: 'sugg-shadow-shred',
    title: 'Monarch Caloric Furnace',
    subtitle: 'High-Density Fat Incineration Protocol',
    category: 'fat_loss',
    targetFocus: 'Full Body Cardiovascular Conditioning',
    durationMin: 25,
    estimatedCalories: 280,
    xpReward: 250,
    difficulty: 'hard',
    targetedIssues: [],
    avoidIfIssues: ['knee_pain', 'back_pain'],
    whyRecommended: 'Maximum metabolic output to accelerate fat loss toward your target weight goals.',
    hunterRankBadge: 'B',
    exercises: [
      { name: 'Shadow Boxer Jabs & Hooks', sets: 4, reps: '45s work / 15s rest', notes: 'Explosive rotational strikes' },
      { name: 'High-Knee March & Drive', sets: 4, reps: '45s work / 15s rest', notes: 'Keep chest upright, engage core' },
      { name: 'Mountain Climbers', sets: 3, reps: '30s rapid drive', notes: 'Neutral spine, tight abdominal brace' },
      { name: 'Bodyweight Speed Squats', sets: 3, reps: '20 rapid reps', notes: 'Drive through heels, explosive hip extension' },
    ],
  },

  // 6. Dungeon Hunter Hypertrophy & Power (Strength)
  {
    id: 'sugg-hunter-hypertrophy',
    title: 'Dungeon Raider Strength Forging',
    subtitle: 'Muscle Hypertrophy & Density Protocol',
    category: 'strength',
    targetFocus: 'Chest, Back, Delts & Quads',
    durationMin: 30,
    estimatedCalories: 240,
    xpReward: 300,
    difficulty: 'hard',
    targetedIssues: [],
    avoidIfIssues: ['shoulder_pain', 'back_pain'],
    whyRecommended: 'Progressive bodyweight overload to forge dense muscle armor and increase basal metabolic strength.',
    hunterRankBadge: 'A',
    exercises: [
      { name: 'Tempo Push-ups (3s down)', sets: 4, reps: '12-15 reps', notes: 'Full depth, elbows tucked 45°' },
      { name: 'Inverted Table Rows / Pull-ups', sets: 4, reps: '8-10 reps', notes: 'Drive elbows back, squeeze lats' },
      { name: 'Bulgarian Split Squats', sets: 3, reps: '10 per leg', notes: 'Deep focus on glute & quad activation' },
      { name: 'Hollow Body Hold', sets: 3, reps: '40s hold', notes: 'Total abdominal compression' },
    ],
  },

  // 7. Full Body Hunter Restoration & Mobility
  {
    id: 'sugg-vital-recovery',
    title: 'Mana Spring: Total Body Recovery',
    subtitle: 'Active Tissue Recovery & Flexibility',
    category: 'mobility',
    targetFocus: 'Hips, Hamstrings, Thoracic Spine & Ankles',
    durationMin: 20,
    estimatedCalories: 85,
    xpReward: 150,
    difficulty: 'easy',
    targetedIssues: ['poor_posture', 'back_pain', 'knee_pain', 'neck_pain', 'shoulder_pain'],
    avoidIfIssues: [],
    whyRecommended: 'Restores joint range of motion, stimulates lymphatic drainage, and lowers central nervous system stress.',
    hunterRankBadge: 'E',
    exercises: [
      { name: 'World Greatest Stretch (Lunge with Thoracic Twist)', sets: 3, reps: '5 per side', notes: 'Breathe deeply into rotation' },
      { name: 'Pigeon Hip Capsule Stretch', sets: 2, reps: '45s per side', notes: 'Relieves sciatic pressure and deep piriformis' },
      { name: 'Downward Dog to Cobra Flow', sets: 3, reps: '8 fluid flows', notes: 'Articulate each spinal segment' },
      { name: 'Child Pose with Lat Reach', sets: 2, reps: '60s hold', notes: 'Full lumbar and lat decompression' },
    ],
  },
];

export function getPersonalizedWorkouts(profile?: UserProfile | null): WorkoutSuggestion[] {
  if (!profile) {
    return [...WORKOUT_SUGGESTIONS_CATALOG];
  }

  const activeIssues = Array.isArray(profile.healthIssues) ? profile.healthIssues : [];
  const bmiAnalysis = calculateBMIAnalysis(
    profile.heightCm,
    profile.weightKg,
    profile.age,
    profile.goalWeightKg,
    profile.gender,
  );

  return WORKOUT_SUGGESTIONS_CATALOG.filter((workout) => {
    if (!workout) return false;
    const avoidIfIssues = Array.isArray(workout.avoidIfIssues) ? workout.avoidIfIssues : [];
    // Filter out workouts that are contraindicated by the hunter's active health issues
    const hasConflict = avoidIfIssues.some((issue) => activeIssues.includes(issue));
    if (hasConflict) return false;
    return true;
  }).sort((a, b) => {
    // Priority score calculation:
    // 1. Matches active health issues directly (+50 per match)
    // 2. Matches BMI / weight goal direction
    let scoreA = 0;
    let scoreB = 0;

    const targetedA = Array.isArray(a?.targetedIssues) ? a.targetedIssues : [];
    const targetedB = Array.isArray(b?.targetedIssues) ? b.targetedIssues : [];

    activeIssues.forEach((issue) => {
      if (targetedA.includes(issue)) scoreA += 50;
      if (targetedB.includes(issue)) scoreB += 50;
    });

    if (bmiAnalysis) {
      if (bmiAnalysis.category === 'overweight' || bmiAnalysis.category === 'obese') {
        if (a.category === 'fat_loss' || a.category === 'cardio') scoreA += 25;
        if (b.category === 'fat_loss' || b.category === 'cardio') scoreB += 25;
      } else if (bmiAnalysis.category === 'underweight') {
        if (a.category === 'strength') scoreA += 25;
        if (b.category === 'strength') scoreB += 25;
      }
    }

    // Secondary sort: XP reward
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    return (b?.xpReward || 0) - (a?.xpReward || 0);
  });
}
