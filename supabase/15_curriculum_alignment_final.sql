-- 15_curriculum_alignment_final.sql
-- Corrective migration: Add missing lessons + checkpoints to match CURRICULUM-002
-- Date: 2026-06-12
-- Run AFTER 00_backup through 12_curriculum_indexes
-- IDEMPOTENT: All INSERTs use ON CONFLICT DO NOTHING

-- 1. ADD MISSING LESSONS (4 total)

INSERT INTO curriculum_lessons (
  id, kapitel_id, level_id, title, sort_order, grammar_description,
  sentence_breakdowns, pronunciation_tips, cultural_notes, register_notes,
  indonesian_mistakes, can_do_goals, listening_simulation, is_published
)
VALUES (
  'a1-14', 'a1-k4', 'A1',
  'Hotel & Unterkunft', 14,
  'Modalverben (intro): können, müssen, wollen, sollen',
  '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, '[]'::jsonb, NULL, true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO curriculum_lessons (
  id, kapitel_id, level_id, title, sort_order, grammar_description,
  sentence_breakdowns, pronunciation_tips, cultural_notes, register_notes,
  indonesian_mistakes, can_do_goals, listening_simulation, is_published
)
VALUES (
  'a2-14', 'a2-k4', 'A2',
  'Deutsche Kultur', 14,
  'Präteritum (extended): regular and irregular past tense',
  '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, '[]'::jsonb, NULL, true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO curriculum_lessons (
  id, kapitel_id, level_id, title, sort_order, grammar_description,
  sentence_breakdowns, pronunciation_tips, cultural_notes, register_notes,
  indonesian_mistakes, can_do_goals, listening_simulation, is_published
)
VALUES (
  'b2-13', 'b2-k4', 'B2',
  'Umwelt & Gesellschaft', 13,
  'Environmental and social vocabulary, argumentation',
  '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, '[]'::jsonb, NULL, true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO curriculum_lessons (
  id, kapitel_id, level_id, title, sort_order, grammar_description,
  sentence_breakdowns, pronunciation_tips, cultural_notes, register_notes,
  indonesian_mistakes, can_do_goals, listening_simulation, is_published
)
VALUES (
  'b2-14', 'b2-k4', 'B2',
  'Technik & Wissenschaft', 14,
  'Technical and scientific vocabulary, academic discourse',
  '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, '[]'::jsonb, NULL, true
) ON CONFLICT (id) DO NOTHING;

-- 2. ADD MISSING CHECKPOINTS (4 total)

INSERT INTO curriculum_checkpoints (
  id, level_id, kapitel_id, title, required_score, review_lessons,
  sort_order, is_published
)
VALUES (
  'a1-checkpoint-4', 'A1', NULL,
  'Review: A1 Gesamt', 0.7,
  '["a1-1","a1-2","a1-3","a1-4","a1-5","a1-6","a1-7","a1-8","a1-9","a1-10","a1-11","a1-12","a1-13","a1-14"]'::jsonb,
  4, true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO curriculum_checkpoints (
  id, level_id, kapitel_id, title, required_score, review_lessons,
  sort_order, is_published
)
VALUES (
  'a2-checkpoint-3', 'A2', NULL,
  'Review: Gesundheit & Arbeit', 0.7,
  '["a2-9","a2-10","a2-11","a2-12"]'::jsonb,
  3, true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO curriculum_checkpoints (
  id, level_id, kapitel_id, title, required_score, review_lessons,
  sort_order, is_published
)
VALUES (
  'a2-checkpoint-4', 'A2', NULL,
  'Review: A2 Gesamt', 0.7,
  '["a2-1","a2-2","a2-3","a2-4","a2-5","a2-6","a2-7","a2-8","a2-9","a2-10","a2-11","a2-12","a2-13","a2-14"]'::jsonb,
  4, true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO curriculum_checkpoints (
  id, level_id, kapitel_id, title, required_score, review_lessons,
  sort_order, is_published
)
VALUES (
  'b2-checkpoint-4', 'B2', NULL,
  'Review: B2 Gesamt', 0.75,
  '["b2-1","b2-2","b2-3","b2-4","b2-5","b2-6","b2-7","b2-8","b2-9","b2-10","b2-11","b2-12","b2-13","b2-14"]'::jsonb,
  4, true
) ON CONFLICT (id) DO NOTHING;

-- 3. VERIFICATION QUERIES

SELECT level_id, COUNT(*) AS lesson_count FROM curriculum_lessons GROUP BY level_id ORDER BY level_id;
SELECT COUNT(*) AS total_lessons FROM curriculum_lessons;
SELECT level_id, COUNT(*) AS cp_count FROM curriculum_checkpoints GROUP BY level_id ORDER BY level_id;
SELECT COUNT(*) AS total_checkpoints FROM curriculum_checkpoints;
SELECT COUNT(*) AS total_kapitel FROM kapitel;
SELECT COUNT(*) AS total_levels FROM curriculum_levels;
SELECT id, title, level_id, kapitel_id FROM curriculum_lessons WHERE id IN ('a1-14','a2-14','b2-13','b2-14') ORDER BY id;
SELECT id, title, level_id FROM curriculum_checkpoints WHERE id IN ('a1-checkpoint-4','a2-checkpoint-3','a2-checkpoint-4','b2-checkpoint-4') ORDER BY id;

-- END OF MIGRATION
