import type {
  UserProfile,
  HunterGoal,
  AICoachRecommendation,
  AICoachExercise,
  HealthIssueKey,
} from '@/types';
import { calculateBMIAnalysis } from './healthCalculations';

export const HUNTER_GOAL_CONFIG: Record<
  HunterGoal,
  { label: string; description: string; badge: string }
> = {
  strength: {
    label: 'Strength Armor',
    description: 'Maximal force production, tendon density & high neural recruitment',
    badge: 'Iron Vanguard',
  },
  hypertrophy: {
    label: 'Muscular Ascendance',
    description: 'Targeted muscle fiber volume, mechanical tension & metabolic stress',
    badge: 'Berserker',
  },
  fat_loss: {
    label: 'Caloric Shred & Agility',
    description: 'High metabolic expenditure, joint-safe conditioning & fat oxidation',
    badge: 'Shadow Assassin',
  },
  endurance: {
    label: 'Mana & Stamina Reserve',
    description: 'Cardiovascular output, VO2 capacity & sustained work capacity',
    badge: 'National Runner',
  },
  rehab: {
    label: 'Injury Shield & Recovery',
    description: 'Biomechanical alignment, postural stabilization & joint restoration',
    badge: 'Monarch Aegis',
  },
};

export function generateAICoachRecommendation(
  profile: UserProfile | null,
  overrideGoal?: HunterGoal
): AICoachRecommendation {
  const today = new Date().toISOString().split('T')[0];
  const heightCm = profile?.heightCm || 178;
  const weightKg = profile?.weightKg || 72.5;
  const goalWeightKg = profile?.goalWeightKg || 75.0;
  const age = profile?.age || 24;
  const gender = profile?.gender || 'male';
  const activeIssues: HealthIssueKey[] = Array.isArray(profile?.healthIssues)
    ? profile.healthIssues
    : [];

  const bmiData = calculateBMIAnalysis(heightCm, weightKg, age, goalWeightKg, gender) || {
    bmi: 22.9,
    category: 'normal' as const,
    categoryLabel: 'Optimal Hunter',
    categoryColor: '#34d399',
    idealWeightMinKg: 62.0,
    idealWeightMaxKg: 78.0,
    deltaToGoalKg: -2.5,
    bmrCalories: 1720,
    tdeeCalories: 2400,
    recommendedWaterMl: 3000,
    hunterStatusTitle: 'Apex Combat Condition',
    hunterStatusDescription: 'Body mass is in optimal physical equilibrium.',
  };

  // Determine goal: either override, or from profile, or intelligent deduction based on BMI
  let goal: HunterGoal = overrideGoal || profile?.workoutGoal || 'strength';
  if (!overrideGoal && !profile?.workoutGoal) {
    if (activeIssues.length >= 2) {
      goal = 'rehab';
    } else if (bmiData.category === 'overweight' || bmiData.category === 'obese') {
      goal = 'fat_loss';
    } else if (bmiData.category === 'underweight') {
      goal = 'hypertrophy';
    } else {
      goal = 'strength';
    }
  }

  // Map active injury guards
  const injuryGuards = activeIssues.map((issue) => {
    switch (issue) {
      case 'back_pain':
        return {
          issueKey: issue,
          label: 'Lumbar Spine Shield',
          rule: 'Strictly eliminated heavy spinal axial compression. Deadlifts & barbell back squats swapped for neutral-spine & chest-supported movements.',
        };
      case 'knee_pain':
        return {
          issueKey: issue,
          label: 'Patellar Joint Aegis',
          rule: 'Eliminated plyometrics and deep knee shear. Prioritizing terminal extensions, glute bridges, and isometric holds.',
        };
      case 'neck_pain':
        return {
          issueKey: issue,
          label: 'Cervical Decompression',
          rule: 'Omitted overhead pressing behind the neck. Incorporated thoracic wall angels and chin retraction drills.',
        };
      case 'shoulder_pain':
        return {
          issueKey: issue,
          label: 'Rotator Cuff Safeguard',
          rule: 'Barbell flat bench replaced by neutral-grip dumbbells and external rotator cuff activations.',
        };
      case 'poor_posture':
        return {
          issueKey: issue,
          label: 'Kyphosis Correction Protocol',
          rule: 'Emphasized scapular retraction (face-pulls, doorway chest openers) to counteract anterior pelvic/thoracic tilt.',
        };
      default:
        return {
          issueKey: issue,
          label: 'General Biomechanical Guard',
          rule: 'Controlled eccentric tempo with zero ballistic impact.',
        };
    }
  });

  const hasBackPain = activeIssues.includes('back_pain');
  const hasKneePain = activeIssues.includes('knee_pain');
  const hasShoulderPain = activeIssues.includes('shoulder_pain');
  const hasNeckPain = activeIssues.includes('neck_pain');
  const hasPostureIssue = activeIssues.includes('poor_posture');

  // Daily protein target (~2.0g per kg for strength/hypertrophy, ~1.8g for general)
  const proteinTargetGrams = Math.round(weightKg * 2.0);

  // Generate exercises tailored to goal AND injury constraints
  const exercises: AICoachExercise[] = [];
  let warmup = '';
  let cooldown = '';
  let title = '';
  let subtitle = '';
  let focus = '';
  let aiRationale = '';
  let estimatedMinutes = 35;
  let estimatedCalories = 280;
  let xpReward = 220;

  if (goal === 'rehab' || activeIssues.length >= 3) {
    title = 'System Protocol: Biomechanical Restoration';
    subtitle = 'Corrective Spinal & Joint Reconditioning';
    focus = 'Postural Alignment, Core Anti-Rotation & Joint Integrity';
    estimatedMinutes = 30;
    estimatedCalories = 180;
    xpReward = 200;
    warmup = '3 min Cat-Cow spinal breathing + 2 min doorway chest stretch';
    cooldown = '5 min child pose & diaphragmatic breathing';
    aiRationale = `With ${activeIssues.length} active physical strain flags detected, heavy axial loading would risk dungeon performance penalties. The AI Coach prescribes low-shear corrective movements to realign joint centration and eliminate pain triggers.`;

    exercises.push(
      {
        name: hasBackPain ? 'Bird-Dog Stability Holds' : 'Dead Bug Anti-Extension',
        sets: 3,
        reps: '10 reps / side (3s hold)',
        notes: 'Brace abdominal wall; avoid lumbar hyperextension.',
        category: 'flexibility',
      },
      {
        name: hasPostureIssue || hasNeckPain ? 'Prone Cobra Scapular Retractions' : 'Glute Bridge Holds',
        sets: 3,
        reps: '12 reps',
        notes: 'Squeeze shoulder blades down and back.',
        category: 'bodyweight',
      },
      {
        name: hasKneePain ? 'Straight-Leg Isometric Quad Raises' : 'Goblet Box Squat (Knee Safe)',
        sets: 3,
        reps: '12 reps',
        weightKg: hasKneePain ? 0 : 12,
        notes: hasKneePain ? 'Keep knee locked, hold for 2s at top.' : 'Slow descent onto box, zero knee shear.',
        category: 'strength',
      },
      {
        name: hasShoulderPain ? 'Cable / Band Face-Pulls' : 'Incline Neutral-Grip Dumbbell Press',
        sets: 3,
        reps: '15 reps',
        weightKg: hasShoulderPain ? 10 : 16,
        notes: 'Focus on external shoulder rotation and mind-muscle squeeze.',
        category: 'strength',
      }
    );
  } else if (goal === 'fat_loss') {
    title = 'Shadow Shred: Caloric Deficit Conditioning';
    subtitle = 'High Metabolic Flow with Joint Protection';
    focus = 'Full-Body Glycogen Depletion & Cardiovascular Stamina';
    estimatedMinutes = 38;
    estimatedCalories = 360;
    xpReward = 250;
    warmup = '4 min arm swings, hip openers & light shadow boxing';
    cooldown = '4 min hamstring stretches and deep lung decompression';
    aiRationale = `Calculated BMI of ${bmiData.bmi} (${bmiData.categoryLabel}) indicates high efficiency gains from caloric burn. Cardio intervals and compound volume are structured to preserve lean muscle while keeping impact low on sensitive joints.`;

    exercises.push(
      {
        name: hasKneePain ? 'Incline Treadmill / Rower Pace' : 'Dumbbell Thrusters (Moderate Weight)',
        sets: 4,
        reps: hasKneePain ? '8 min continuous' : '12 reps',
        weightKg: hasKneePain ? 0 : 12,
        notes: 'Maintain steady elevated heart rate.',
        category: 'cardio',
      },
      {
        name: hasBackPain ? 'Chest-Supported Dumbbell Rows' : 'Dumbbell Romanian Deadlift (Controlled)',
        sets: 4,
        reps: '12 reps',
        weightKg: 16,
        notes: 'Neutral spine, deep lats contraction.',
        category: 'strength',
      },
      {
        name: hasShoulderPain ? 'Incline Push-Ups / Floor Press' : 'Dumbbell Overhead Push Press',
        sets: 3,
        reps: '12 reps',
        weightKg: hasShoulderPain ? 0 : 14,
        notes: 'Explosive ascent, 2s controlled lowering.',
        category: 'strength',
      },
      {
        name: 'Plank Knee-to-Elbow Anti-Rotational',
        sets: 3,
        reps: '45 sec hold',
        notes: 'Keep glutes locked, drive navel inward.',
        category: 'bodyweight',
      }
    );
  } else if (goal === 'hypertrophy') {
    title = 'Monarch Ascendance: Hypertrophic Overload';
    subtitle = 'Targeted Mechanical Tension & Density';
    focus = 'Upper & Lower Kinetic Chain Hypertrophy';
    estimatedMinutes = 42;
    estimatedCalories = 310;
    xpReward = 260;
    warmup = '5 min band pull-aparts, hip airplanes & light rotator warmups';
    cooldown = '4 min full-body static stretches';
    aiRationale = `Targeting muscle density with a baseline bodyweight of ${weightKg}kg and goal of ${goalWeightKg}kg. High-yield sets with 8-12 rep brackets maximize myofibrillar expansion while strict form shields flagged joint zones.`;

    exercises.push(
      {
        name: hasShoulderPain ? 'Neutral-Grip Dumbbell Bench Press' : 'Barbell / Incline Dumbbell Bench Press',
        sets: 4,
        reps: '10 reps',
        weightKg: 20,
        notes: '3-second negative, explosive press to apex.',
        category: 'strength',
      },
      {
        name: hasBackPain ? 'Chest-Supported T-Bar Row' : 'Pendlay Row / Barbell Bent Row',
        sets: 4,
        reps: '10 reps',
        weightKg: 24,
        notes: 'Pin shoulder blades at peak contraction.',
        category: 'strength',
      },
      {
        name: hasKneePain ? 'Bulgarian Split Squat (Assisted)' : 'Leg Press / Barbell Front Squat',
        sets: 3,
        reps: '10 reps / leg',
        weightKg: 18,
        notes: 'Vertical shin angle to minimize patellar friction.',
        category: 'strength',
      },
      {
        name: 'Dumbbell Lateral Raises + Hammer Curls Superset',
        sets: 3,
        reps: '12 reps',
        weightKg: 10,
        notes: 'Strict form, zero torso momentum.',
        category: 'strength',
      }
    );
  } else if (goal === 'endurance') {
    title = 'Endurance Vanguard: Mana Reservoir Conditioning';
    subtitle = 'Aerobic Capacity & Lactate Threshold Expansion';
    focus = 'Sustained Output, Diaphragmatic Control & Work Capacity';
    estimatedMinutes = 45;
    estimatedCalories = 390;
    xpReward = 270;
    warmup = '5 min dynamic joint circles & dynamic leg swings';
    cooldown = '5 min foam roll / calves & quads stretch';
    aiRationale = `Designed to elevate cardiovascular stamina and recoverability between intense dungeon skirmishes. Modulated heart-rate zones boost mitochondrial density without over-taxing neural energy.`;

    exercises.push(
      {
        name: hasKneePain ? 'Stationary Bike HIIT Intervals' : 'Shadow HIIT Sprint Intervals',
        sets: 5,
        reps: '45s work / 45s rest',
        notes: 'Reach 80-85% max heart rate during work burst.',
        category: 'hiit',
      },
      {
        name: hasBackPain ? 'Supported Kettlebell Farmer Walk' : 'Dual Dumbbell Heavy Carry',
        sets: 4,
        reps: '60 sec carry',
        weightKg: 20,
        notes: 'Upright chest, tight core, steady breathing.',
        category: 'strength',
      },
      {
        name: 'Bodyweight Push-Up to Mountain Climber Flow',
        sets: 3,
        reps: '15 reps',
        notes: 'Fluid rhythm, keep hips level.',
        category: 'combat',
      },
      {
        name: 'Hanging Knee Raises / Hollow Body Rock',
        sets: 3,
        reps: '15 reps',
        notes: 'Exhale fully at top of abdominal contraction.',
        category: 'bodyweight',
      }
    );
  } else {
    // Default: 'strength'
    title = 'Iron Sovereign: Maximal Force Protocol';
    subtitle = 'Heavy Neural Drive & Structural Density';
    focus = 'Compound Kinetic Chains & Central Nervous Recruitment';
    estimatedMinutes = 40;
    estimatedCalories = 320;
    xpReward = 280;
    warmup = '5 min world’s greatest stretch, glute bridges & band dislocates';
    cooldown = '4 min passive spinal hang & quad release';
    aiRationale = `Calculated BMI of ${bmiData.bmi} and Hunter Rank ${profile?.rank || 'E'} support a progressive overload regimen. Primary compound patterns are selected with joint-friendly grips to maximize pure mechanical recruitment without wear and tear.`;

    exercises.push(
      {
        name: hasBackPain ? 'Heavy Trap-Bar Deadlift (High Handles)' : 'Conventional Deadlift / Rack Pull',
        sets: 4,
        reps: '6 reps',
        weightKg: 50,
        notes: 'Brace abdominal wall; drive floor away through heels.',
        category: 'strength',
      },
      {
        name: hasShoulderPain ? 'Neutral-Grip Dumbbell Floor Press' : 'Overhead Barbell Strict Press',
        sets: 4,
        reps: '6 reps',
        weightKg: 22,
        notes: 'Lock out fully with glutes squeezed tight.',
        category: 'strength',
      },
      {
        name: hasKneePain ? 'Heavy Goblet Box Squats' : 'Barbell Back Squat to Parallel',
        sets: 3,
        reps: '8 reps',
        weightKg: 35,
        notes: hasKneePain ? 'Sit softly onto box, pause 1s before driving up.' : 'Knees tracking over toes, tight upper back.',
        category: 'strength',
      },
      {
        name: 'Strict Weighted Pull-Ups / Inverted Bodyweight Rows',
        sets: 3,
        reps: '8 reps',
        notes: 'Depress scapula first, touch upper chest to bar.',
        category: 'bodyweight',
      }
    );
  }

  return {
    id: `ai-coach-${today}-${goal}`,
    date: today,
    coachTitle: 'Shadow Monarch AI System Coach',
    statusBadge: bmiData.hunterStatusTitle,
    overallScore: 92,
    goal,
    goalLabel: HUNTER_GOAL_CONFIG[goal].label,
    summaryQuote: `“The System has evaluated your ${bmiData.bmi} BMI and ${activeIssues.length} active physical constraints. Execute today’s directives with unflinching discipline.”`,
    biometrics: {
      bmi: bmiData.bmi,
      category: bmiData.category,
      categoryLabel: bmiData.categoryLabel,
      weightKg,
      goalWeightKg,
      weightDeltaKg: bmiData.deltaToGoalKg,
      tdeeCalories: bmiData.tdeeCalories,
      dailyWaterMl: bmiData.recommendedWaterMl,
      proteinTargetGrams,
    },
    injurySafetyGuards: injuryGuards,
    trainingDirective: {
      title,
      subtitle,
      focus,
      difficulty: 'normal',
      estimatedMinutes,
      estimatedCalories,
      xpReward,
      warmup,
      exercises,
      cooldown,
      aiRationale,
    },
    recoveryDirective: `Consume ${bmiData.recommendedWaterMl}ml water, hit ${proteinTargetGrams}g protein, and maintain 7.5+ hours of sleep to ensure total recovery before tomorrow's dungeon.`,
  };
}
