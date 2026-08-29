-- 32_exercises_rls_tighten.sql (2026-08-29)
-- F-1 (QA authed 2026-08-29): curriculum_exercises carries correct_answer —
-- was anon-readable via REST. curriculum_checkpoints carries full answer keys
-- for checkpoint questions. Both are consumed ONLY inside the authed shell now
-- that lessons-db.ts routes through the Clerk-JWT-protected /api/curriculum
-- (commit aae5ef9). Revoke public read. Lessons/vocab stay public-read (not
-- sensitive; vocab also powers no-auth surfaces).

-- idempotent: drop then recreate nothing for anon
DROP POLICY IF EXISTS "Public can read exercises" ON curriculum_exercises;
DROP POLICY IF EXISTS "Public can read checkpoints" ON curriculum_checkpoints;

-- cleanup: vocabulary had BOTH a public and an authenticated SELECT policy
-- (the 24_vocab_rls_tighten intent was lost during the 08-24 public cutover).
DROP POLICY IF EXISTS "Public can read vocabulary" ON curriculum_vocabulary;

-- service_role policies untouched (manage paths unaffected).
