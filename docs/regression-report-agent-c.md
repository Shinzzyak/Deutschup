# Regression Investigation Report — Agent C
**Date:** 2026-06-10 16:08 UTC  
**Scope:** All commits after PAY-001 (29d0cbd) and REG-001 (bcf9780)  
**Targets:** ADMIN-001, REG-004 (payment history), REG-005 (pro badge)

---

## Commit Timeline (Post PAY-001: 29d0cbd)

| # | Hash | Message | Files Changed | Regression Risk |
|---|------|---------|---------------|-----------------|
| 1 | `afe8bb8` | fix: add payment_url to test endpoint | `api/payment-test.ts` | ⚪ None |
| 2 | `981f8fe` | docs: PAY-001 incident documentation | `docs/debugging-playbook.md`, `docs/lessons-learned.md` | ⚪ None |
| 3 | `b61ae87` | debug: add comprehensive webhook debug logging | `api/webhook-debug.ts` | ⚪ None |
| 4 | `3f42169` | fix: add payment success cache invalidation | `src/App.tsx`, `src/pages/DashboardWithPaymentRefresh.tsx` | 🟡 Low |
| 5 | `bcf9780` | fix: add missing import for DashboardWithPaymentRefresh | `src/App.tsx` | ⚪ None (fix for #4) |
| 6 | `8e13da9` | debug: add runtime identity and payment history logging | `src/App.tsx`, `src/components/DebugAuthOverlay.tsx`, `src/pages/Pricing.tsx` | ⚪ None |
| 7 | `fce75b5` | docs: add KNOWN_BUGS.md | `docs/KNOWN_BUGS.md`, `docs/lessons-learned.md` | ⚪ None |
| 8 | `defbdec` | Revert docs commit | `docs/KNOWN_BUGS.md`, `docs/lessons-learned.md` | ⚪ None |
| 9 | `d79c7a0` | docs: add KNOWN_BUGS.md (re-add) | `docs/KNOWN_BUGS.md`, `docs/lessons-learned.md` | ⚪ None |
| 10 | `3ad147b` | debug: add server-side user diagnostic endpoint | `api/debug-user.ts` | ⚪ None |
| 11 | `30d266d` | docs: add incident documentation | `docs/incidents/*.md` | ⚪ None |

---

## Pre-existing Regression (Critical Context)

### ADMIN-001: Admin Panel Broken — Introduced by `cd6592a` (Pre-PAY-001)

**Commit:** `cd6592a` — "feat: add admin env-check and system-health endpoints for payment debugging"  
**Status:** ⛔ ACTIVE — Not fixed by any post-29d0cbd commit

**Evidence:**
- **Before** `cd6592a`: `api/admin.ts` used if/else routing with actions: `debug`, `users`, `config`, `check`
- **After** `cd6592a`: `api/admin.ts` uses switch statement with cases: `env-check`, `system-health`, `stats`, `update-role`, `toggle-pro`
- **Removed actions:** `users`, `config`, `check` — all removed from backend
- **Frontend `Admin.tsx`** still calls:
  - `fetch('/api/admin?action=users', ...)` (lines 25, 75, 84)
  - `fetch('/api/admin?action=config', ...)` (lines 29, 55)
- **Result:** Backend returns `{ error: 'Invalid admin action' }` for both calls
- **Admin panel completely non-functional** — no user list, no config access

**Confidence:** 100% — Direct code evidence confirms frontend-backend contract violation.

---

## Per-Commit Regression Analysis

### Commit #4: `3f42169` — DashboardWithPaymentRefresh

**What it did:** Created `DashboardWithPaymentRefresh` component that intercepts `?payment=success`, clears localStorage profile cache, then redirects to `/dashboard`.

**Potential issues:**
1. **Infinite redirect loop (mitigated):** Clears cache then does `window.location.href = '/dashboard'`. Since it checks `paymentSuccess && user` and redirects, the second load won't have `?payment=success` in URL, so loop doesn't occur.
2. **Cache invalidation is partial:** Only clears `localStorage.removeItem('deutschup_profile_${user.id}')`. The `authStore.ts` still has in-memory `tierData` state. After redirect, `authStore` rehydrates from Supabase, but the 24-hour cache TTL check means stale data could persist if the redirect fails.
3. **Redirect target:** Redirects to `/dashboard` which renders `Dashboard.tsx` (not `DashboardWithPaymentRefresh`), so no double-processing.

**Impact on targets:**
- ADMIN-001: ❌ No impact (different component)
- REG-004 (payment history): ❌ No impact (Pricing.tsx not involved)
- REG-005 (pro badge): 🟡 **Possible contributing factor** — Cache invalidation logic is correct but relies on successful redirect. If redirect fails (e.g., network issue), stale profile cache persists, causing pro badge not to show.

**Confidence:** 70% — The cache invalidation mechanism is sound, but incomplete (in-memory state not cleared).

---

### Commit #6: `8e13da9` — Debug Logging in Pricing.tsx

**What it did:** Added `console.log("[PAYMENT-HISTORY] ...")` debug logging to Pricing.tsx payment history fetch. Added `DebugAuthOverlay` component to App.tsx.

**Potential issues:** None. Console.log statements don't affect functionality. DebugAuthOverlay is conditionally rendered based on URL params.

**Impact on targets:**
- ADMIN-001: ❌ No impact
- REG-004 (payment history): ❌ No functional change — only added logging
- REG-005 (pro badge): ❌ No impact

**Confidence:** 100% — Pure debugging additions.

---

## Cross-Reference with Open Incidents

### ADMIN-001 (Admin Panel Broken)
- **Root cause:** `cd6592a` (pre-PAY-001) rewrote `api/admin.ts` removing `users`/`config` actions
- **Post-29d0cbd commits:** None fix this. No commit restores the removed actions or updates Admin.tsx frontend.
- **Status:** ⛔ UNRESOLVED — Requires either restoring backend actions or updating frontend to use new actions (`stats`, `update-role`, `toggle-pro`)

### REG-004 (Payment History Not Showing)
- **Root cause:** Likely NOT a regression from post-29d0cbd commits. `Pricing.tsx` payment history fetch logic unchanged except for debug logging in `8e13da9`.
- **Actual cause:** The `console.log` added in `8e13da9` shows the query is `orders` table filtered by `user_id` and `status='paid'`. If orders aren't showing, the issue is likely:
  1. Orders not being created in Supabase (PAY-001 webhook issue)
  2. Orders created with wrong `user_id` or `status` field
- **Status:** 🟡 NEEDS INVESTIGATION — Check Supabase `orders` table directly

### REG-005 (Pro Badge Not Showing)
- **Root cause:** Post-29d0cbd commits did NOT modify `Dashboard.tsx` pro badge logic, `authStore.ts` tier fetching, or `subscription.ts` helper functions.
- **Actual cause:** REG-005 is almost certainly caused by REG-003 (stale profile cache). After payment success:
  1. Webhook updates `profiles.subscription = 'pro'` in Supabase
  2. Frontend has stale `localStorage` cache with `subscription = 'free'`
  3. `DashboardWithPaymentRefresh` (commit #4) attempts to fix this but:
     - Only clears localStorage, not in-memory state
     - Relies on successful redirect
  4. If cache not cleared, `isUserPro(tierData)` returns false → no pro badge
- **Confidence:** 85% — Stale cache is the most likely cause. The cache invalidation in `3f42169` should fix it for NEW payment completions, but existing cached profiles persist for up to 24 hours.
- **Status:** 🟡 PARTIALLY ADDRESSED — Commit `3f42169` adds cache clearing for new payments, but doesn't fix existing stale caches

---

## Summary of Findings

| Incident | Introduced By | Post-29d0cbd Fix? | Current Status |
|----------|--------------|-------------------|----------------|
| ADMIN-001 | `cd6592a` (pre-PAY-001) | ❌ No | ⛔ Broken — backend actions removed, frontend unchanged |
| REG-004 | Not a post-29d0cbd regression | N/A | 🟡 Likely data issue (orders table) |
| REG-005 | REG-003 (stale cache) | 🟡 Partial (`3f42169`) | 🟡 Fixed for new payments, stale caches persist |

---

## Recommendations

1. **ADMIN-001 (CRITICAL):** Restore `users` and `config` action handlers in `api/admin.ts`, or update `Admin.tsx` to use the new switch-based actions (`stats` for user list, `env-check` for config).

2. **REG-005:** After deploying `3f42169`, affected users need to either:
   - Complete a new payment flow (triggers cache clear)
   - Manually clear browser localStorage
   - Wait 24 hours for cache expiry

3. **REG-004:** Query Supabase `orders` table directly to verify orders exist with correct `user_id` and `status='paid'`. Check webhook logs for successful order creation.
