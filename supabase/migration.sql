-- DeutschUp Database Migration
-- Date: 2026-06-05
-- Purpose: Create missing tables for all features

-- 1. PROFILES (authStore - user profile data)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  tier TEXT DEFAULT 'free',
  tier_expiry TIMESTAMPTZ,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROGRESS (progressStore - XP, streak, lessons, vocab)
CREATE TABLE IF NOT EXISTS progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  completedLessons JSONB DEFAULT '[]',
  currentLesson TEXT,
  vocabProgress JSONB DEFAULT '{}',
  pronunciationScore INTEGER DEFAULT 0,
  lastActive TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. NOTES (learningStore - study notes)
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT,
  title TEXT,
  content TEXT,
  category TEXT DEFAULT 'personal',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STUDY PLANS (learningStore - AI-generated study plans)
CREATE TABLE IF NOT EXISTS study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  duration_days INTEGER DEFAULT 7,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. QUICK NOTES (learningStore - quick note widget)
CREATE TABLE IF NOT EXISTS quick_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 6. MOCK TESTS (learningStore - mock test results)
CREATE TABLE IF NOT EXISTS mock_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level TEXT,
  score INTEGER,
  total_questions INTEGER,
  answers JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_lesson_id ON notes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_notes_user_id ON quick_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_tests_user_id ON mock_tests(user_id);

-- RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_tests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Progress policies
CREATE POLICY "Users can view own progress" ON progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notes policies
CREATE POLICY "Users can view own notes" ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON notes FOR DELETE USING (auth.uid() = user_id);

-- Study plans policies
CREATE POLICY "Users can view own study_plans" ON study_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own study_plans" ON study_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own study_plans" ON study_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own study_plans" ON study_plans FOR DELETE USING (auth.uid() = user_id);

-- Quick notes policies
CREATE POLICY "Users can view own quick_notes" ON quick_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own quick_notes" ON quick_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quick_notes" ON quick_notes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mock tests policies
CREATE POLICY "Users can view own mock_tests" ON mock_tests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mock_tests" ON mock_tests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies (full access for admin role)
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_plans_updated_at BEFORE UPDATE ON study_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quick_notes_updated_at BEFORE UPDATE ON quick_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
