/*
# ShadowRise: User profiles, water intake, and health metrics

## Overview
Creates the core tables for ShadowRise's health and fitness tracking features.
All tables are owner-scoped to the authenticated user via RLS.

## New Tables

### user_profiles
- Stores the user's RPG-style fitness profile: rank, level, XP, streak, stats.
- One row per user (linked to auth.users).
- `user_id` defaults to auth.uid() so inserts succeed even when the client omits it.

### water_intake
- Tracks daily water consumption in milliliters.
- One row per user per day (unique constraint on user_id + date).
- `user_id` defaults to auth.uid().

### health_metrics
- Stores daily health metrics: sleep hours, hydration level, recovery score.
- One row per user per day (unique constraint on user_id + date).
- `user_id` defaults to auth.uid().

## Security
- RLS enabled on all tables.
- Owner-scoped CRUD policies (auth.uid() = user_id) for all four verbs on each table.
- Only authenticated users can access their own data.
*/

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  rank text NOT NULL DEFAULT 'E',
  level integer NOT NULL DEFAULT 1,
  xp integer NOT NULL DEFAULT 0,
  xp_to_next integer NOT NULL DEFAULT 500,
  streak integer NOT NULL DEFAULT 0,
  total_quests_completed integer NOT NULL DEFAULT 0,
  strength integer NOT NULL DEFAULT 10,
  agility integer NOT NULL DEFAULT 10,
  vitality integer NOT NULL DEFAULT 10,
  endurance integer NOT NULL DEFAULT 10,
  intelligence integer NOT NULL DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON user_profiles;
CREATE POLICY "select_own_profile" ON user_profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_profile" ON user_profiles;
CREATE POLICY "insert_own_profile" ON user_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_profile" ON user_profiles;
CREATE POLICY "update_own_profile" ON user_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_profile" ON user_profiles;
CREATE POLICY "delete_own_profile" ON user_profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Water intake table
CREATE TABLE IF NOT EXISTS water_intake (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml integer NOT NULL DEFAULT 0,
  goal_ml integer NOT NULL DEFAULT 3000,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_water" ON water_intake;
CREATE POLICY "select_own_water" ON water_intake FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_water" ON water_intake;
CREATE POLICY "insert_own_water" ON water_intake FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_water" ON water_intake;
CREATE POLICY "update_own_water" ON water_intake FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_water" ON water_intake;
CREATE POLICY "delete_own_water" ON water_intake FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Health metrics table
CREATE TABLE IF NOT EXISTS health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  sleep_hours numeric(4,1) NOT NULL DEFAULT 0,
  hydration_percent integer NOT NULL DEFAULT 0,
  recovery_score integer NOT NULL DEFAULT 0,
  heart_rate integer NOT NULL DEFAULT 0,
  steps integer NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_health" ON health_metrics;
CREATE POLICY "select_own_health" ON health_metrics FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_health" ON health_metrics;
CREATE POLICY "insert_own_health" ON health_metrics FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_health" ON health_metrics;
CREATE POLICY "update_own_health" ON health_metrics FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_health" ON health_metrics;
CREATE POLICY "delete_own_health" ON health_metrics FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
