-- Migration 27 (2026-08-31): exercise answer payloads for new exercise types
-- Additive only: existing rows keep correct_answer (option index) semantics;
-- `answer` stays jsonb 'null' for multiple_choice.
-- Payload contract (see src/lib/exercise-grading.ts):
--   multiple_choice: 'null' (uses correct_answer index)
--   true_false:      boolean string ('true'/'false' jsonb)
--   short_answer | fill_blank: array of acceptable strings
--   matching:        array of [left, right] pairs
--   essay:           null (AI-graded via check-answer)

ALTER TABLE curriculum_exercises ADD COLUMN IF NOT EXISTS answer jsonb NOT NULL DEFAULT 'null'::jsonb;
COMMENT ON COLUMN curriculum_exercises.answer IS 'Type-specific answer payload: null=option index (correct_answer), array of strings=short_answer/fill_blank accepted answers, bool=true_false, array of [left,right]=matching pairs, null=essay (AI graded)';
