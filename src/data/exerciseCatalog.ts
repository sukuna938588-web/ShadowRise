import type { CustomExerciseDefinition, ExerciseCategory } from '@/types';

export interface ExerciseCategoryInfo {
  category: ExerciseCategory;
  label: string;
  color: string;
  description: string;
}

export const EXERCISE_CATEGORIES: ExerciseCategoryInfo[] = [
  { category: 'strength', label: 'Strength', color: '#fbbf24', description: 'Resistance & iron training' },
  { category: 'bodyweight', label: 'Bodyweight', color: '#34d399', description: 'Calisthenics & mastery' },
  { category: 'cardio', label: 'Cardio', color: '#60a5fa', description: 'Endurance & stamina' },
  { category: 'hiit', label: 'HIIT', color: '#f87171', description: 'High intensity protocol' },
  { category: 'combat', label: 'Combat', color: '#a78bfa', description: 'Martial arts & strikes' },
  { category: 'flexibility', label: 'Mobility', color: '#22d3ee', description: 'Recovery & agility' },
  { category: 'custom', label: 'Custom', color: '#c084fc', description: 'Hunter-crafted maneuvers' },
];

export const PRESET_EXERCISES: CustomExerciseDefinition[] = [
  // Strength
  { id: 'bench-press', name: 'Barbell Bench Press', category: 'strength', targetMuscle: 'Chest & Triceps', defaultReps: 10, defaultWeightKg: 60 },
  { id: 'squat', name: 'Barbell Back Squats', category: 'strength', targetMuscle: 'Quads & Glutes', defaultReps: 8, defaultWeightKg: 80 },
  { id: 'deadlift', name: 'Deadlift', category: 'strength', targetMuscle: 'Posterior Chain & Back', defaultReps: 5, defaultWeightKg: 100 },
  { id: 'overhead-press', name: 'Overhead Barbell Press', category: 'strength', targetMuscle: 'Shoulders & Triceps', defaultReps: 8, defaultWeightKg: 40 },
  { id: 'barbell-row', name: 'Bent-Over Barbell Row', category: 'strength', targetMuscle: 'Upper Back & Lats', defaultReps: 10, defaultWeightKg: 50 },
  { id: 'dumbbell-curl', name: 'Dumbbell Bicep Curls', category: 'strength', targetMuscle: 'Biceps', defaultReps: 12, defaultWeightKg: 14 },
  { id: 'tricep-extension', name: 'Skull Crushers / Tricep Ext', category: 'strength', targetMuscle: 'Triceps', defaultReps: 12, defaultWeightKg: 20 },
  { id: 'romanian-deadlift', name: 'Romanian Deadlifts (RDL)', category: 'strength', targetMuscle: 'Hamstrings & Glutes', defaultReps: 10, defaultWeightKg: 70 },
  { id: 'incline-db-press', name: 'Incline Dumbbell Press', category: 'strength', targetMuscle: 'Upper Chest', defaultReps: 10, defaultWeightKg: 24 },
  { id: 'lat-pulldown', name: 'Cable Lat Pulldown', category: 'strength', targetMuscle: 'Lats & Back', defaultReps: 12, defaultWeightKg: 55 },

  // Bodyweight
  { id: 'pushups', name: 'Shadow Push-Ups', category: 'bodyweight', targetMuscle: 'Chest & Core', defaultReps: 20, defaultWeightKg: 0 },
  { id: 'pullups', name: 'Pull-Ups / Chin-Ups', category: 'bodyweight', targetMuscle: 'Back & Biceps', defaultReps: 8, defaultWeightKg: 0 },
  { id: 'dips', name: 'Parallel Bar Dips', category: 'bodyweight', targetMuscle: 'Chest & Triceps', defaultReps: 12, defaultWeightKg: 0 },
  { id: 'plank', name: 'Hunter Plank Hold', category: 'bodyweight', targetMuscle: 'Core & Stabilizers', defaultReps: 1, defaultWeightKg: 0 },
  { id: 'air-squats', name: 'Prisoner Air Squats', category: 'bodyweight', targetMuscle: 'Quads & Glutes', defaultReps: 25, defaultWeightKg: 0 },
  { id: 'lunges', name: 'Walking Lunges', category: 'bodyweight', targetMuscle: 'Quads & Hamstrings', defaultReps: 20, defaultWeightKg: 0 },
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raises', category: 'bodyweight', targetMuscle: 'Lower Abs', defaultReps: 12, defaultWeightKg: 0 },

  // Combat / Martial Arts
  { id: 'shadow-boxing', name: 'Shadow Boxing Drills', category: 'combat', targetMuscle: 'Cardio & Shoulders', defaultReps: 15, defaultWeightKg: 0 },
  { id: 'heavy-bag', name: 'Heavy Bag Striking', category: 'combat', targetMuscle: 'Full Body Power', defaultReps: 20, defaultWeightKg: 0 },
  { id: 'speed-bag', name: 'Speed Bag Precision', category: 'combat', targetMuscle: 'Shoulders & Reflexes', defaultReps: 10, defaultWeightKg: 0 },

  // HIIT & Conditioning
  { id: 'burpees', name: 'Burpee Sprints', category: 'hiit', targetMuscle: 'Full Body Conditioning', defaultReps: 15, defaultWeightKg: 0 },
  { id: 'mountain-climbers', name: 'Mountain Climbers', category: 'hiit', targetMuscle: 'Core & Cardio', defaultReps: 30, defaultWeightKg: 0 },
  { id: 'kettlebell-swings', name: 'Kettlebell Swings', category: 'hiit', targetMuscle: 'Posterior Chain', defaultReps: 20, defaultWeightKg: 16 },
  { id: 'jump-rope', name: 'Speed Jump Rope', category: 'hiit', targetMuscle: 'Calves & Endurance', defaultReps: 100, defaultWeightKg: 0 },

  // Cardio
  { id: 'outdoor-run', name: 'Dungeon Outdoor Run', category: 'cardio', targetMuscle: 'Cardiovascular Stamina', defaultReps: 1, defaultWeightKg: 0 },
  { id: 'treadmill-interval', name: 'Treadmill Incline Run', category: 'cardio', targetMuscle: 'Lower Body & Stamina', defaultReps: 1, defaultWeightKg: 0 },
  { id: 'cycling-indoor', name: 'Stationary Cycling', category: 'cardio', targetMuscle: 'Leg Endurance', defaultReps: 1, defaultWeightKg: 0 },
  { id: 'rowing', name: 'Ergometer Rowing Machine', category: 'cardio', targetMuscle: 'Full Body Endurance', defaultReps: 1, defaultWeightKg: 0 },

  // Mobility
  { id: 'yoga-flow', name: 'Monarch Recovery Flow', category: 'flexibility', targetMuscle: 'Spine & Hips', defaultReps: 1, defaultWeightKg: 0 },
  { id: 'foam-rolling', name: 'Myofascial Foam Rolling', category: 'flexibility', targetMuscle: 'Muscle Fascia', defaultReps: 1, defaultWeightKg: 0 },
];

const CUSTOM_EXERCISES_STORAGE_KEY = 'shadowrise_custom_exercises_v1';

export function getCustomExercises(): CustomExerciseDefinition[] {
  try {
    const raw = localStorage.getItem(CUSTOM_EXERCISES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load custom exercises from localStorage', err);
  }
  return [];
}

export function saveCustomExercise(exercise: Omit<CustomExerciseDefinition, 'id' | 'isCustom'>): CustomExerciseDefinition {
  const customList = getCustomExercises();
  const newExercise: CustomExerciseDefinition = {
    id: `custom-ex-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    ...exercise,
    isCustom: true,
  };

  const updated = [newExercise, ...customList];
  try {
    localStorage.setItem(CUSTOM_EXERCISES_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save custom exercise', err);
  }
  return newExercise;
}

export function deleteCustomExercise(id: string): void {
  const customList = getCustomExercises();
  const updated = customList.filter((e) => e.id !== id);
  try {
    localStorage.setItem(CUSTOM_EXERCISES_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to delete custom exercise', err);
  }
}

export function getAllAvailableExercises(): CustomExerciseDefinition[] {
  const custom = getCustomExercises();
  return [...custom, ...PRESET_EXERCISES];
}
