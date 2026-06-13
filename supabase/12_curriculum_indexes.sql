-- 12_curriculum_indexes.sql
-- Performance indexes for curriculum tables
-- Date: 2026-06-12
-- Run AFTER 08_curriculum_tables.sql
-- ============================================================

-- Curriculum structure
CREATE INDEX IF NOT EXISTS idx_cl_level ON curriculum_lessons(level_id);
CREATE INDEX IF NOT EXISTS idx_cl_kapitel ON curriculum_lessons(kapitel_id);
CREATE INDEX IF NOT EXISTS idx_cl_sort ON curriculum_lessons(level_id, kapitel_id, sort_order);

-- Vocabulary
CREATE INDEX IF NOT EXISTS idx_cv_lesson ON curriculum_vocabulary(lesson_id);
CREATE INDEX IF NOT EXISTS idx_cv_level ON curriculum_vocabulary(level_id);
CREATE INDEX IF NOT EXISTS idx_cv_word ON curriculum_vocabulary(word);

-- Exercises
CREATE INDEX IF NOT EXISTS idx_ce_lesson ON curriculum_exercises(lesson_id);
CREATE INDEX IF NOT EXISTS idx_ce_type ON curriculum_exercises(lesson_id, exercise_type);

-- Checkpoints
CREATE INDEX IF NOT EXISTS idx_ccp_level ON curriculum_checkpoints(level_id);
CREATE INDEX IF NOT EXISTS idx_ccp_sort ON curriculum_checkpoints(level_id, sort_order);

-- Checkpoint questions
CREATE INDEX IF NOT EXISTS idx_ccpq_checkpoint ON curriculum_checkpoint_questions(checkpoint_id);

-- User progress (high-traffic query patterns)
CREATE INDEX IF NOT EXISTS idx_ulp_user ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_ulp_lesson ON user_lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_ulp_completed ON user_lesson_progress(user_id, completed);

CREATE INDEX IF NOT EXISTS idx_ucp_user ON user_checkpoint_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_ucp_checkpoint ON user_checkpoint_progress(checkpoint_id);
CREATE INDEX IF NOT EXISTS idx_ucp_passed ON user_checkpoint_progress(user_id, passed);

CREATE INDEX IF NOT EXISTS idx_ucurp_level ON user_curriculum_progress(current_level_id);
CREATE INDEX IF NOT EXISTS idx_ucurp_streak ON user_curriculum_progress(streak DESC);
CREATE INDEX IF NOT EXISTS idx_ucurp_xp ON user_curriculum_progress(xp DESC);

-- JSONB index for unlocked_lessons containment queries
CREATE INDEX IF NOT EXISTS idx_ucurp_unlocked ON user_curriculum_progress USING gin (unlocked_lessons);
