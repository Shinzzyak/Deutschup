-- DeutschUp Database Setup Script
-- Target: Supabase (PostgreSQL)

-- 1. Profiles Table
-- Extends Supabase Auth users with tier data
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tier varchar(10) DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
    tierExpiry bigint,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2. Progress Table
-- Tracks XP, Streaks, and Vocabulary state
CREATE TABLE IF NOT EXISTS public.progress (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    xp integer DEFAULT 0,
    streak integer DEFAULT 0,
    lastPracticeDate date,
    currentLevel varchar(5) DEFAULT 'A1' CHECK (currentLevel IN ('A1', 'A2', 'B1', 'B2')),
    unlockedLessons jsonb DEFAULT '["a1-1"]'::jsonb,
    completedLessons jsonb DEFAULT '[]'::jsonb,
    vocab jsonb DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 3. Notes Table
-- User-created study notes
CREATE TABLE IF NOT EXISTS public.notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text text NOT NULL,
    tag varchar(20) CHECK (tag IN ('Grammar', 'Kosakata', 'Pengucapan', 'Umum')),
    createdAt bigint NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 4. Study Plans Table
-- Tasks and goals for studying
CREATE TABLE IF NOT EXISTS public.study_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tasks jsonb DEFAULT '[]'::jsonb,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 5. Quick Notes Table
-- A single scratchpad per user
CREATE TABLE IF NOT EXISTS public.quick_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text text,
    updatedAt bigint,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 6. Mock Tests Table
-- History of mock test attempts
CREATE TABLE IF NOT EXISTS public.mock_tests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    level varchar(10),
    score integer,
    total integer,
    createdAt bigint NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Row Level Security (RLS)
-- Note: In a real Supabase setup, you would enable RLS and create policies.
-- For this migration, we define the schema.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;

-- Simple User-Only Access Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own progress" ON public.progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notes" ON public.notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own study plans" ON public.study_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own quick notes" ON public.quick_notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own mock tests" ON public.mock_tests FOR ALL USING (auth.uid() = user_id);
