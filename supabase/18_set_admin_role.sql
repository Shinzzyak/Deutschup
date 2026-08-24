-- Migration: 18_set_admin_role.sql
-- Grant admin to the repo owner via profiles.role = 'admin'.
--
-- WHY THIS EXISTS
--   lib/api-utils.ts -> isVerifiedAdmin() resolves the Clerk `sub` claim to an
--   internal id (user_identities.clerk_id -> internal_id) and then checks
--   profiles.role = 'admin'. That path needs no email claim on the session
--   token and no ADMIN_EMAIL env var, so it is the reliable way to make the
--   owner's Google account an admin.
--
-- WHEN TO RUN
--   AFTER the owner's FIRST Google (Clerk) sign-in. Before that first sign-in
--   there is nothing to update: the user_identities row (and the profiles row)
--   are only created when the Clerk webhook fires or when the first verified
--   Clerk JWT hits the API (auto-provision in getVerifiedIdentity).
--   Re-running this script later is harmless — it is idempotent.
--
-- SAFETY
--   The lookup uses user_identities.email, which is written from Clerk
--   (webhook: user.email_addresses[0]; API auto-provision: verified claim only).
--   If more than one identity carries that email the script REFUSES to act and
--   asks for a manual decision, so a stale/duplicate row can never silently
--   hand out admin.

BEGIN;

DO $$
DECLARE
  -- Owner account. Change this if the owning email ever changes.
  v_owner_email  TEXT := 'abdullahalmughiroh@gmail.com';
  v_match_count  INT;
  v_internal_id  UUID;
  v_rows         INT;
BEGIN
  SELECT count(*) INTO v_match_count
  FROM public.user_identities
  WHERE lower(email) = lower(v_owner_email);

  IF v_match_count = 0 THEN
    RAISE NOTICE 'No user_identities row for %. Sign in with Google once, then re-run this script.', v_owner_email;
    RAISE NOTICE 'If the row exists but email is NULL (session token had no email claim), use the by-clerk-id block at the bottom of this file.';
    RETURN;
  END IF;

  IF v_match_count > 1 THEN
    RAISE NOTICE 'Found % identities with email % — refusing to grant admin automatically.', v_match_count, v_owner_email;
    RAISE NOTICE 'Inspect them with the verification query below and promote the correct internal_id by hand.';
    RETURN;
  END IF;

  SELECT internal_id INTO v_internal_id
  FROM public.user_identities
  WHERE lower(email) = lower(v_owner_email);

  -- 1. Promote the existing profile row (normal case).
  UPDATE public.profiles
     SET role = 'admin',
         updated_at = NOW()
   WHERE id = v_internal_id
     AND role IS DISTINCT FROM 'admin';
  GET DIAGNOSTICS v_rows = ROW_COUNT;

  IF v_rows > 0 THEN
    RAISE NOTICE 'profiles.role set to admin for internal_id % (%).', v_internal_id, v_owner_email;
    RETURN;
  END IF;

  -- 2. Row already admin -> nothing to do (idempotent re-run).
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_internal_id AND role = 'admin') THEN
    RAISE NOTICE 'internal_id % is already admin — no change.', v_internal_id;
    RETURN;
  END IF;

  -- 3. No profile row yet (identity created by the API before any profile write).
  --    Try to create it; profiles.id may still carry the legacy FK to
  --    auth.users(id), which a Clerk-only internal_id cannot satisfy.
  BEGIN
    INSERT INTO public.profiles (id, role)
    VALUES (v_internal_id, 'admin');
    RAISE NOTICE 'Created profiles row with role=admin for internal_id %.', v_internal_id;
  EXCEPTION
    WHEN foreign_key_violation THEN
      RAISE NOTICE 'Cannot insert profiles row for %: profiles.id still references auth.users.', v_internal_id;
      RAISE NOTICE 'Open the app once while signed in (that writes the profile via /api/db-proxy upsert-profile), then re-run this script.';
  END;
END $$;

COMMIT;

-- ============================================================
-- VERIFICATION
-- ============================================================

-- 1. Identity + profile for the owner. Expect exactly one row, role = 'admin'.
SELECT ui.internal_id,
       ui.clerk_id,
       ui.email,
       p.role,
       p.full_name,
       p.updated_at
  FROM public.user_identities ui
  LEFT JOIN public.profiles p ON p.id = ui.internal_id
 WHERE lower(ui.email) = lower('abdullahalmughiroh@gmail.com');

-- 2. Every admin in the system. Should list only accounts you recognise.
SELECT p.id, p.role, ui.clerk_id, ui.email
  FROM public.profiles p
  LEFT JOIN public.user_identities ui ON ui.internal_id = p.id
 WHERE p.role = 'admin';

-- 3. Troubleshooting: recent identities, for when user_identities.email is NULL
--    (session token carried no email claim, so nothing was stored).
--    Match your account by clerk_id — it is visible in the Clerk dashboard
--    (Users -> the user -> "User ID", format user_xxx).
SELECT internal_id, clerk_id, email, created_at
  FROM public.user_identities
 ORDER BY created_at DESC
 LIMIT 20;

-- ============================================================
-- FALLBACK: promote by Clerk user id
-- Uncomment, replace user_REPLACE_ME with the id from query 3, and run.
-- ============================================================
-- UPDATE public.profiles
--    SET role = 'admin', updated_at = NOW()
--  WHERE id = (SELECT internal_id FROM public.user_identities WHERE clerk_id = 'user_REPLACE_ME');
