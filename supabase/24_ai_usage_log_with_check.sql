-- 24_ai_usage_log_with_check.sql
-- Audit 2026-08-08 run 2 (subagent task-0): quota free-tier bypass MASIH WORK.
-- Root cause (baru ketahuan): policy ai_usage_log "Service role manage ai_usage_log"
-- punya USING (auth.role()='service_role') tapi WITH CHECK KOSONG → INSERT oleh
-- service_role DITOLAK diam-diam (fire-and-forget .catch() di logUsage menelan
-- error) → ai_usage_log 0 rows → checkQuota count selalu 0 → quota fail-open
-- → free user unlimited AI chat.
--
-- Fix: tambah WITH CHECK yang sama dengan USING.

DROP POLICY IF EXISTS "Service role manage ai_usage_log" ON public.ai_usage_log;
CREATE POLICY "Service role manage ai_usage_log" ON public.ai_usage_log
  FOR ALL TO public
  USING (auth.role() = 'service_role'::text)
  WITH CHECK (auth.role() = 'service_role'::text);
