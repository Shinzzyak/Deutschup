-- 10_progress_migration.sql
-- Migrate existing user progress from JSONB blob to relational tables
-- Date: 2026-06-12
-- Run AFTER 08_curriculum_tables.sql + 09_curriculum_migration.sql
-- ============================================================
-- STRATEGY:
--   1. Read old progress table (JSONB blob)
--   2. Create user_curriculum_progress (current position)
--   3. Create user_lesson_progress (per-lesson completion)
--   4. Preserve XP, streak, vocab
-- ============================================================

-- 1. MIGRATE USER CURRICULUM PROGRESS (current position + stats)
INSERT INTO user_curriculum_progress (
  user_id,
  current_level_id,
  current_lesson_id,
  xp,
  streak,
  last_practice_date,
  unlocked_lessons
)
SELECT
  p.user_id,
  -- Map old currentLesson to level
  CASE
    WHEN p."currentLesson" LIKE 'a1%' THEN 'A1'
    WHEN p."currentLesson" LIKE 'a2%' THEN 'A2'
    WHEN p."currentLesson" LIKE 'b1%' THEN 'B1'
    WHEN p."currentLesson" LIKE 'b2%' THEN 'B2'
    ELSE 'A1'
  END AS current_level_id,
  p."currentLesson" AS current_lesson_id,
  COALESCE(p.xp, 0),
  COALESCE(p.streak, 0),
  p."lastActive"::date,
  -- No unlockedLessons column in old progress table
  -- Default to ["a1-1"] for all users (first lesson)
  '["a1-1"]'::jsonb AS unlocked_lessons
FROM progress p
ON CONFLICT (user_id) DO NOTHING;

-- 2. MIGRATE PER-LESSON PROGRESS (completedLessons → user_lesson_progress)
INSERT INTO user_lesson_progress (user_id, lesson_id, completed, completed_at)
SELECT
  p.user_id,
  jsonb_array_elements_text(p."completedLessons") AS lesson_id,
  true AS completed,
  p.updated_at AS completed_at
FROM progress p
WHERE p."completedLessons" IS NOT NULL
  AND jsonb_array_length(p."completedLessons") > 0
ON CONFLICT (user_id, lesson_id) DO NOTHING;

-- 3. MIGRATE VOCAB PROGRESS
-- vocabProgress is stored as JSONB: { "v-gen-1": { "status": "known", "nextReview": 1234567890 } }
-- We don't have a dedicated user_vocab_progress table in the current schema.
-- Vocab stays in user_curriculum_progress or we add it later.
-- For now, preserve it as-is in the old progress table.
-- When we build the VocabTrainer page upgrade, we'll extract it.

-- 4. VERIFICATION QUERIES
-- Run these after migration to confirm data integrity

-- 4a. Count users migrated
SELECT COUNT(DISTINCT user_id) AS users_migrated FROM user_curriculum_progress;

-- 4b. Count lessons completed per user (top 10)
SELECT
  ucp.user_id,
  ucp.xp,
  ucp.streak,
  (SELECT COUNT(*) FROM user_lesson_progress ulp WHERE ulp.user_id = ucp.user_id AND ulp.completed) AS lessons_completed,
  jsonb_array_length(ucp.unlocked_lessons) AS lessons_unlocked
FROM user_curriculum_progress ucp
ORDER BY ucp.xp DESC
LIMIT 10;

-- 4c. Spot check: any user with completed lessons not in curriculum_lessons
SELECT ulp.user_id, ulp.lesson_id
FROM user_lesson_progress ulp
LEFT JOIN curriculum_lessons cl ON cl.id = ulp.lesson_id
WHERE cl.id IS NULL AND ulp.completed = true;

-- 4d. Compare old vs new counts
SELECT
  (SELECT COUNT(*) FROM progress) AS old_progress_rows,
  (SELECT COUNT(*) FROM user_curriculum_progress) AS new_curriculum_rows,
  (SELECT COUNT(*) FROM user_lesson_progress WHERE completed = true) AS new_lesson_completions;
