-- 21_restore_profiles_insert_policy.sql
-- Audit 2026-08-08 (brutal-schatt): profiles TANPA INSERT policy sejak migrasi 19
-- menghapusnya → user baru (Clerk maupun Supabase) tak bisa membuat profile row
-- → onboarding/upsert-profile gagal (prod bug, bukan hanya security).
--
-- Restore INSERT dengan WITH CHECK ketat:
--  * auth.uid() = id           → user hanya bisa insert row miliknya
--  * role/subscription/tier    → WAJIB nilai default (tidak bisa self-promote)
--  * pro_expires_at / tier_expiry → NULL (tidak bisa set expiry sendiri)

CREATE POLICY "Users can insert own profile (locked)" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = id
    AND role = 'user'
    AND subscription = 'free'
    AND tier = 'free'
    AND pro_expires_at IS NULL
    AND tier_expiry IS NULL
  );
