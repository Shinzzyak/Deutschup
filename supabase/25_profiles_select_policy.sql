-- 25_profiles_select_policy.sql
-- Audit run-2 N9 (INFO): profiles punya policy INSERT + UPDATE tapi TIDAK ADA
-- policy SELECT — user tidak bisa baca/update profile sendiri via REST
-- (GET /rest/v1/profiles → 200 [], PATCH → 204 0 baris). Prod bug onboarding.
--
-- Tambah SELECT own-profile. Juga perbaiki UPDATE policy: WITH CHECK subquery
-- `role=(SELECT role FROM profiles WHERE id=auth.uid())` gagal karena subquery
-- butuh SELECT policy (sebelumnya tidak ada) → semua UPDATE = 0 baris.

CREATE POLICY "Users select own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);
