import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface DbUserProfile {
  id: string;
  user_id: string;
  rank: string;
  level: number;
  xp: number;
  xp_to_next: number;
  streak: number;
  total_quests_completed: number;
  exercise_progress: number;
  hydration_score: number;
  sleep_quality: number;
  recovery_score: number;
}

export interface DbWaterIntake {
  id: string;
  user_id: string;
  amount_ml: number;
  goal_ml: number;
  date: string;
}

export interface DbHealthMetrics {
  id: string;
  user_id: string;
  sleep_hours: number;
  hydration_percent: number;
  recovery_score: number;
  heart_rate: number;
  steps: number;
  sleep_quality: number;
  date: string;
}
