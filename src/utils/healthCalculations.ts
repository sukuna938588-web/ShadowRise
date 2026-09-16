import type { BMIAnalysis, BMICategory } from '@/types';

export function calculateBMIAnalysis(
  heightCm?: number,
  weightKg?: number,
  age?: number,
  goalWeightKg?: number,
  gender?: 'male' | 'female' | 'other',
): BMIAnalysis | null {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
    return null;
  }

  const heightM = heightCm / 100;
  const bmiRaw = weightKg / (heightM * heightM);
  const bmi = Math.round(bmiRaw * 10) / 10;

  let category: BMICategory = 'normal';
  let categoryLabel = 'Optimal Hunter';
  let categoryColor = '#34d399';
  let hunterStatusTitle = 'Apex Combat Condition';
  let hunterStatusDescription =
    'Your body mass is in optimal physical equilibrium. High combat mobility, optimal recovery, and balanced stamina.';

  if (bmi < 18.5) {
    category = 'underweight';
    categoryLabel = 'Underweight';
    categoryColor = '#60a5fa';
    hunterStatusTitle = 'Agility Scout Frame';
    hunterStatusDescription =
      'Body mass is below baseline. Prioritize nutrient-dense fuel and progressive resistance to forge muscle defense.';
  } else if (bmi >= 25 && bmi < 30) {
    category = 'overweight';
    categoryLabel = 'Overweight';
    categoryColor = '#fbbf24';
    hunterStatusTitle = 'Heavy Armor Build';
    hunterStatusDescription =
      'High mass density detected. Cardio conditioning and slight caloric moderation will maximize agility and joint health.';
  } else if (bmi >= 30) {
    category = 'obese';
    categoryLabel = 'System Overload';
    categoryColor = '#f87171';
    hunterStatusTitle = 'Vital Strain Warning';
    hunterStatusDescription =
      'Elevated body mass creates joint and cardiovascular load. Low-impact endurance training and steady nutrition control recommended.';
  }

  const idealWeightMinKg = Math.round(18.5 * heightM * heightM * 10) / 10;
  const idealWeightMaxKg = Math.round(24.9 * heightM * heightM * 10) / 10;

  const deltaToGoalKg =
    typeof goalWeightKg === 'number' && goalWeightKg > 0
      ? Math.round((weightKg - goalWeightKg) * 10) / 10
      : null;

  // BMR calculation using Mifflin-St Jeor
  const userAge = age && age > 0 ? age : 25;
  let bmrBase = 10 * weightKg + 6.25 * heightCm - 5 * userAge;
  if (gender === 'male') {
    bmrBase += 5;
  } else if (gender === 'female') {
    bmrBase -= 161;
  } else {
    bmrBase -= 78;
  }
  const bmrCalories = Math.max(1000, Math.round(bmrBase));
  const tdeeCalories = Math.round(bmrCalories * 1.4); // Moderate hunter activity

  // Daily water target: ~35ml per kg of bodyweight, rounded to nearest 100ml
  const recommendedWaterMl = Math.max(2000, Math.round((weightKg * 35) / 100) * 100);

  return {
    bmi,
    category,
    categoryLabel,
    categoryColor,
    idealWeightMinKg,
    idealWeightMaxKg,
    deltaToGoalKg,
    bmrCalories,
    tdeeCalories,
    recommendedWaterMl,
    hunterStatusTitle,
    hunterStatusDescription,
  };
}
