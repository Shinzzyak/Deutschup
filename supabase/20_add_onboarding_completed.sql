-- 20_add_onboarding_completed.sql
-- ============================================================================
-- Kolom onboarding_completed di public.profiles TIDAK PERNAH ada, padahal
-- dipakai oleh client (OnboardingFlow.finish(), App.tsx) dan server
-- (api/db-proxy.ts upsert-profile). Akibatnya: upsert-profile 500
-- (undefined column 42703), flag tidak pernah tersimpan, dan OnboardingFlow
-- muncul setiap login untuk user baru.
--
-- Sudah dijalankan manual di produksi 2026-08-08 (ALTER + backfill 6 user
-- dengan orders). File ini untuk repo/lingkungan lain. Idempoten.
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- Backfill: user yang pernah punya order dianggap sudah melewati onboarding.
UPDATE public.profiles p
SET onboarding_completed = true
WHERE p.onboarding_completed = false
  AND EXISTS (SELECT 1 FROM public.orders o WHERE o.user_id = p.id);
