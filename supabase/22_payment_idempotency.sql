-- 22_payment_idempotency.sql
-- Audit 2026-08-08 (brutal-schatt VULN-02): 5x concurrent payment create →
-- 5 distinct charges at the gateway (Rp245K exposure). Race was proven in
-- production: 5 users carried 2-5 duplicate pending orders (deduped by
-- UPDATE ... SET status='expired' in the remediation run).
--
-- Fix: DB-enforced uniqueness — at most ONE pending order per user.
-- Atomic (partial unique index), immune to TOCTOU between check and insert.
-- The app layer (api/payment.ts) now also: reuses an existing fresh pending
-- order, expires stale ones (>24h), and catches the duplicate-key race.

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_one_pending_per_user
  ON public.orders (user_id) WHERE status = 'pending';
