-- 23_rate_limit_toctou.sql
-- Audit 2026-08-08 run 2 (subagent): rate limiter error-report kalah TOCTOU —
-- 70 request paralel → 70×200 (semua lolos check-then-act). Pola sama dengan
-- VULN-02 orders yang di-fix dengan unique index (index predicate ga bisa
-- karena now() non-immutable → pakai trigger atomic sebagai gantinya).
--
-- Trigger menaikkan 23505 (duplicate_key) saat cap 60/60s tercapai pada
-- insert concurrent — handler (api/error-report.ts) mengonversinya ke 429.
-- Sekaligus revoke grant anon/authenticated penuh (defense-in-depth).

CREATE OR REPLACE FUNCTION public.rl_check_before_insert()
RETURNS trigger AS $$
DECLARE
  recent_count int;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.rate_limit_log
  WHERE identifier = NEW.identifier
    AND endpoint = NEW.endpoint
    AND created_at > (now() - interval '60 seconds');
  IF recent_count >= 60 THEN
    RAISE EXCEPTION 'rate limit exceeded for %/%', NEW.identifier, NEW.endpoint
      USING ERRCODE = '23505';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_rl_check_before_insert ON public.rate_limit_log;
CREATE TRIGGER trg_rl_check_before_insert
  BEFORE INSERT ON public.rate_limit_log
  FOR EACH ROW EXECUTE FUNCTION public.rl_check_before_insert();

REVOKE ALL ON public.rate_limit_log FROM anon;
REVOKE ALL ON public.rate_limit_log FROM authenticated;
