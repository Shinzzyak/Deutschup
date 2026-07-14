-- 20260714160000_lock_identity_rpc_and_config.sql
-- Fix: Revoke PUBLIC EXECUTE from all SECURITY DEFINER functions
-- that accept user_id from client. Force through verified server API only.
--
-- Live audit (Cael1107/deutschup-audit inspector) found 11 SECURITY DEFINER
-- functions with PUBLIC EXECUTE — anon + authenticated can call them with
-- arbitrary user_id, bypassing RLS.

-- ============================================================
-- IDENTITY FUNCTIONS (read/write identity mapping)
-- ============================================================
REVOKE ALL ON FUNCTION public.resolve_user_id(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.resolve_clerk_id(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.upsert_user_identity(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_user_id(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.resolve_clerk_id(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.upsert_user_identity(text, text) TO service_role;

-- ============================================================
-- CURRICULUM FUNCTIONS (accept p_user_id from client)
-- ============================================================
REVOKE ALL ON FUNCTION public.can_access_lesson(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_lesson(uuid, text, decimal, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_checkpoint(uuid, text, decimal, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_streak(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_study_time(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_exercise_count(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_lesson(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_lesson(uuid, text, decimal, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.submit_checkpoint(uuid, text, decimal, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_streak(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_study_time(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_exercise_count(text) TO service_role;

-- ============================================================
-- MAINTENANCE FUNCTIONS (cleanup / admin only)
-- ============================================================
REVOKE ALL ON FUNCTION public.cleanup_old_webhook_events() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cleanup_soft_deleted_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_old_webhook_events() TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_soft_deleted_users() TO service_role;
