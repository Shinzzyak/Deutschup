-- 08_curriculum_tables.sql
-- DeutschUp Curriculum Data Model
-- Date: 2026-06-12
-- Purpose: Create relational curriculum structure (levels → kapitel → lessons → checkpoints)
-- ============================================================

-- ============================================================
-- LEVELS (A1, A2, B1, B2)
-- ============================================================
CREATE TABLE IF NOT EXISTS curriculum_levels (
  id TEXT PRIMARY KEY,               -- 'A1', 'A2', 'B1', 'B2'
  title TEXT NOT NULL,               -- 'A1 - Pemula', 'A2 - Dasar', etc.
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- KAPITEL (Chapters within a level)
-- e.g., A1 has Kapitel 1 (Lessons 1-3), Kapitel 2 (Lessons 4-6), etc.
-- ============================================================
CREATE TABLE IF NOT EXISTS kapitel (
  id TEXT PRIMARY KEY,               -- 'a1-k1', 'a1-k2', 'b1-k1', etc.
  level_id TEXT NOT NULL REFERENCES curriculum_levels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kapitel_level ON kapitel(level_id);

-- ============================================================
-- LESSONS (individual learning units)
-- ============================================================
CREATE TABLE IF NOT EXISTS curriculum_lessons (
  id TEXT PRIMARY KEY,               -- 'a1-1', 'a1-2', 'a2-1', etc.
  level_id TEXT NOT NULL REFERENCES curriculum_levels(id) ON DELETE CASCADE,
  kapitel_id TEXT REFERENCES kapitel(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,

  -- Content fields (JSONB for complex nested data)
  grammar_description TEXT,
  sentence_breakdowns JSONB DEFAULT '[]',    -- string[]
  pronunciation_tips JSONB DEFAULT '[]',     -- string[]
  cultural_notes TEXT,
  register_notes TEXT,
  indonesian_mistakes TEXT,
  can_do_goals JSONB DEFAULT '[]',           -- string[]

  -- Listening simulation (embedded, not separate table — query pattern is always by lesson)
  listening_simulation JSONB,                -- { transcript: [...], questions: [...] }

  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_level ON curriculum_lessons(level_id);
CREATE INDEX IF NOT EXISTS idx_lessons_kapitel ON curriculum_lessons(kapitel_id);

-- ============================================================
-- VOCABULARY (words attached to lessons)
-- ============================================================
CREATE TABLE IF NOT EXISTS curriculum_vocabulary (
  id TEXT PRIMARY KEY,               -- 'v-gen-1' (same as current IDs)
  lesson_id TEXT NOT NULL REFERENCES curriculum_lessons(id) ON DELETE CASCADE,
  level_id TEXT NOT NULL REFERENCES curriculum_levels(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  article TEXT,                       -- 'der', 'die', 'das', etc.
  translation TEXT NOT NULL,
  example_sentence TEXT,
  phonetic TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vocab_lesson ON curriculum_vocabulary(lesson_id);
CREATE INDEX IF NOT EXISTS idx_vocab_level ON curriculum_vocabulary(level_id);

-- ============================================================
-- EXERCISES / QUIZ QUESTIONS (attached to lessons)
-- ============================================================
CREATE TABLE IF NOT EXISTS curriculum_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT NOT NULL REFERENCES curriculum_lessons(id) ON DELETE CASCADE,
  exercise_type TEXT NOT NULL DEFAULT 'quiz', -- 'quiz', 'mini_quiz', 'listening'
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',       -- string[]
  correct_answer INTEGER NOT NULL,           -- index into options
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercises_lesson ON curriculum_exercises(lesson_id);

-- ============================================================
-- CHECKPOINTS (assessment/review points)
-- ============================================================
CREATE TABLE IF NOT EXISTS curriculum_checkpoints (
  id TEXT PRIMARY KEY,               -- 'a1-checkpoint-1', 'b1-checkpoint-2'
  level_id TEXT NOT NULL REFERENCES curriculum_levels(id) ON DELETE CASCADE,
  kapitel_id TEXT REFERENCES kapitel(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  required_score DECIMAL(3,2) DEFAULT 0.70, -- 0.00 - 1.00
  review_lessons JSONB DEFAULT '[]',         -- lesson ids to review
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checkpoints_level ON curriculum_checkpoints(level_id);

-- ============================================================
-- CHECKPOINT QUESTIONS (quiz questions for checkpoints)
-- ============================================================
CREATE TABLE IF NOT EXISTS curriculum_checkpoint_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkpoint_id TEXT NOT NULL REFERENCES curriculum_checkpoints(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer INTEGER NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cp_questions_checkpoint ON curriculum_checkpoint_questions(checkpoint_id);

-- ============================================================
-- USER PROGRESS (new relational model, replaces JSONB blob)
-- ============================================================

-- Per-lesson progress (did user complete this lesson?)
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES curriculum_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  score DECIMAL(5,2),                 -- quiz score if applicable
  xp_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, lesson_id)
);

-- Per-checkpoint progress
CREATE TABLE IF NOT EXISTS user_checkpoint_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkpoint_id TEXT NOT NULL REFERENCES curriculum_checkpoints(id) ON DELETE CASCADE,
  passed BOOLEAN DEFAULT false,
  score DECIMAL(5,2),
  attempts INTEGER DEFAULT 0,
  best_score DECIMAL(5,2),
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, checkpoint_id)
);

-- User-level progress (current position in curriculum)
CREATE TABLE IF NOT EXISTS user_curriculum_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_level_id TEXT REFERENCES curriculum_levels(id),
  current_lesson_id TEXT REFERENCES curriculum_lessons(id),
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_practice_date DATE,
  unlocked_lessons JSONB DEFAULT '["a1-1"]',  -- array of lesson IDs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ENABLE RLS
-- ============================================================
ALTER TABLE curriculum_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE kapitel ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_checkpoint_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_checkpoint_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_curriculum_progress ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Curriculum tables: public read, service_role write
CREATE POLICY "Public can read curriculum levels" ON curriculum_levels
  FOR SELECT USING (is_published = true);
CREATE POLICY "Service role manages curriculum levels" ON curriculum_levels
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can read kapitel" ON kapitel
  FOR SELECT USING (is_published = true);
CREATE POLICY "Service role manages kapitel" ON kapitel
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can read lessons" ON curriculum_lessons
  FOR SELECT USING (is_published = true);
CREATE POLICY "Service role manages lessons" ON curriculum_lessons
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can read vocabulary" ON curriculum_vocabulary
  FOR SELECT USING (true);
CREATE POLICY "Service role manages vocabulary" ON curriculum_vocabulary
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can read exercises" ON curriculum_exercises
  FOR SELECT USING (true);
CREATE POLICY "Service role manages exercises" ON curriculum_exercises
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can read checkpoints" ON curriculum_checkpoints
  FOR SELECT USING (is_published = true);
CREATE POLICY "Service role manages checkpoints" ON curriculum_checkpoints
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can read checkpoint questions" ON curriculum_checkpoint_questions
  FOR SELECT USING (true);
CREATE POLICY "Service role manages checkpoint questions" ON curriculum_checkpoint_questions
  FOR ALL USING (auth.role() = 'service_role');

-- User progress: own data only
CREATE POLICY "Users can read own lesson progress" ON user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lesson progress" ON user_lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lesson progress" ON user_lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role manages lesson progress" ON user_lesson_progress
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can read own checkpoint progress" ON user_checkpoint_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checkpoint progress" ON user_checkpoint_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checkpoint progress" ON user_checkpoint_progress
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role manages checkpoint progress" ON user_checkpoint_progress
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can read own curriculum progress" ON user_curriculum_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own curriculum progress" ON user_curriculum_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own curriculum progress" ON user_curriculum_progress
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role manages curriculum progress" ON user_curriculum_progress
  FOR ALL USING (auth.role() = 'service_role');

-- Admin override
CREATE POLICY "Admins can read all user progress" ON user_lesson_progress
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can read all checkpoint progress" ON user_checkpoint_progress
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can read all curriculum progress" ON user_curriculum_progress
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
