-- 24_vocab_rls_tighten.sql (2026-08-28)
-- QA finding (agent1): curriculum_vocabulary readable by anon (unauthenticated).
-- Context: vocab is FREE material (not Pro-gated — B2 lessons are the Pro gate via
-- can_access_lesson). But letting anon scrape the whole 2.472-row DB unauthenticated
-- is unnecessary exposure. Tighten: anon = no read, authenticated = read.
-- Frontend reads vocab only on authed pages (VocabTrainer/LevelView/Dashboard/Studio),
-- so authenticated-only keeps all real features working while killing free scraping.

DROP POLICY IF EXISTS "Public can read vocabulary" ON curriculum_vocabulary;

CREATE POLICY "Authenticated can read vocabulary"
  ON curriculum_vocabulary
  FOR SELECT
  TO authenticated
  USING (true);

-- service_role keeps full manage (already exists, untouched):
--   "Service role manages vocabulary" FOR ALL TO public USING (auth.role() = 'service_role')
