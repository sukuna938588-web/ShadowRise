/*
# ShadowRise: Weight entries, exercise logs, and health metric updates

## Overview
Adds weight tracking, exercise logging, and expands health_metrics with sleep quality.
Removes the fantasy stat columns from user_profiles (strength, agility, etc.) and replaces
them with real fitness metric columns: exercise_progress, hydration, sleep_quality, recovery_score.

## New Tables

### weight_entries
- Tracks daily weight measurements in kg.
- One row per user per day (unique on user_id + date).
- user_id defaults to auth.uid().

### exercise_logs
- Logs individual exercise sessions: type, duration, calories, intensity.
- Multiple entries per day allowed.
- user_id defaults to auth.uid().

## Modified Tables

### health_metrics
- Added sleep_quality integer column (0-100 scale).
- Existing columns retained.

### user_profiles
- Removed: strength, agility, vitality, endurance, intelligence
- Added: exercise_progress (int, 0-100), hydration_score (int, 0-100), sleep_quality (int, 0-100), recovery_score (int, 0-100)
- These represent real fitness metrics instead of fantasy RPG stats.

## Security
- RLS enabled on all new tables.
- Owner-scoped CRUD policies on weight_entries and exercise_logs.
- All policies use auth.uid() = user_id.
*/

-- Add sleep_quality to health_metrics
ALTER TABLE health_metrics ADD COLUMN IF NOT EXISTS sleep_quality integer NOT NULL DEFAULT 0;

-- Replace fantasy stats with real fitness metrics on user_profiles
ALTER TABLE user_profiles DROP COLUMN IF EXISTS strength;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS agility;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS vitality;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS endurance;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS intelligence;

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS exercise_progress integer NOT NULL DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS hydration_score integer NOT NULL DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS sleep_quality integer NOT NULL DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS recovery_score integer NOT NULL DEFAULT 0;

-- Weight entries table
CREATE TABLE IF NOT EXISTS weight_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg numeric(5,1) NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_weight" ON weight_entries;
CREATE POLICY "select_own_weight" ON weight_entries FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_weight" ON weight_entries;
CREATE POLICY "insert_own_weight" ON weight_entries FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_weight" ON weight_entries;
CREATE POLICY "update_own_weight" ON weight_entries FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_weight" ON weight_entries;
CREATE POLICY "delete_own_weight" ON weight_entries FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Exercise logs table
CREATE TABLE IF NOT EXISTS exercise_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_type text NOT NULL DEFAULT 'cardio',
  duration_min integer NOT NULL DEFAULT 0,
  calories_burned integer NOT NULL DEFAULT 0,
  intensity text NOT NULL DEFAULT 'moderate',
  notes text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_exercise" ON exercise_logs;
CREATE POLICY "select_own_exercise" ON exercise_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_exercise" ON exercise_logs;
CREATE POLICY "insert_own_exercise" ON exercise_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_exercise" ON exercise_logs;
CREATE POLICY "delete_own_exercise" ON exercise_logs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
