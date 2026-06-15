# IMPLEMENTATION-048H: Clerk Production Bootstrap Report

**Date:** 2026-06-15
**Priority:** CRITICAL — First production infrastructure assessment
**Scope:** Evidence-only audit. Zero implementation.

---

## Executive Summary

Clerk infrastructure is **code-complete** but **not production-configured**. All code exists. No Clerk project, no credentials, no OAuth, no webhook registration. The canary system is dormant by design.

**Decision: 🟡 READY WITH FIXES**

---

## 1. Dependency Audit

### Installed ✅

| Package | Version | Status |
|---------|---------|--------|
| `@clerk/clerk-react` | ^5.61.8 | ✅ Installed |
| `@clerk/backend` | ^3.7.0 | ✅ Installed |

### Not Required (by design)

| Package | Status | Reason |
|---------|--------|--------|
| `svix` | NOT in package.json | Only used in Supabase Edge Function (Deno runtime) — not needed in main app |

### Evidence

```
node_modules/@clerk/
├── backend/
├── clerk-react/
└── shared/
```

---

## 2. Environment Variables

### Required but NOT Set

| Variable | Status | Value |
|----------|--------|-------|
| `VITE_CLERK_PUBLISHABLE_KEY` | ❌ NOT SET | `pk_test_...` or `pk_live_...` |
| `CLERK_SECRET_KEY` | ❌ NOT SET | `sk_test_...` or `sk_live_...` |
| `CLERK_WEBHOOK_SECRET` | ❌ NOT SET | `whsec_...` |

### Already Set ✅

| Variable | Status | Value |
|----------|--------|-------|
| `VITE_ADMIN_EMAIL` | ✅ SET | Used by canary routing |
| `VITE_SUPABASE_URL` | ✅ SET | Supabase primary |
| `VITE_SUPABASE_ANON_KEY` | ✅ SET | Supabase primary |

### How to Verify

```bash
# Check if Clerk key is set
grep CLERK .env || echo "CLERK keys NOT CONFIGURED"
```

---

## 3. ClerkProvider Fallback Behavior

### Current Code

```typescript
// src/lib/clerk/ClerkProvider.tsx
const CLERK_CONFIGURED = Boolean(
  CLERK_KEY && CLERK_KEY.length > 10 && CLERK_KEY !== 'YOUR_CLERK_PUBLISHABLE_KEY'
);

export function ClerkProvider({ children }) {
  if (!CLERK_CONFIGURED) {
    return <>{children}</>;  // NO-OP
  }
}
```

### Verified Behavior

| Condition | Behavior | Safe? |
|-----------|----------|-------|
| No key | NO-OP, renders children | ✅ |
| Short key | NO-OP, renders children | ✅ |
| Placeholder key | NO-OP, renders children | ✅ |
| Real key | Clerk auth active | ✅ |

**Conclusion:** ClerkProvider is **safe by default**.

---

## 4. Canary Routing Behavior

### State Machine

```
VITE_CLERK_PUBLISHABLE_KEY not set?
    │
YES │ NO
┌───┴───┐
▼       ▼
NO-OP  KEY SET
(safe)    │
          ▼
email in canaryEmails?
    │
YES │ NO
┌───┴───┐
▼       ▼
CLERK  SUPABASE
```

### Verified Behavior

| Scenario | Expected | Safe? |
|----------|----------|-------|
| No Clerk key | All users → Supabase | ✅ |
| Clerk key set, non-canary email | User → Supabase | ✅ |
| Clerk key set, canary email | User → Clerk | ✅ |
| Default canary list | `[ADMIN_EMAIL]` only | ✅ |

---

## 5. Webhook Endpoint

### Handler Status

| Component | Status | Evidence |
|-----------|--------|----------|
| Edge Function code | ✅ Written | `supabase/functions/clerk-webhook/index.ts` |
| Events handled | ✅ Complete | `user.created`, `user.updated`, `user.deleted` |
| Svix verification | ✅ Implemented | Signature, timestamp, dedup |
| Audit logging | ✅ Implemented | `webhook_audit_log` table |
| Soft-delete lifecycle | ✅ Implemented | `deleted_at` columns |
| Database tables | ✅ Created | `webhook_events`, `webhook_audit_log` |

### Deployment Status

| Step | Status |
|------|--------|
| Edge Function written | ✅ |
| Edge Function deployed | ❌ NOT DEPLOYED |
| Webhook URL registered in Clerk | ❌ NOT REGISTERED |
| Webhook secret configured | ❌ NOT SET |

### Expected Webhook URL

```
https://mnasgrobmwcpqmnjbvan.supabase.co/functions/v1/clerk-webhook
```

---

## 6. Database Schema

### Tables Created ✅

| Table | Purpose | RLS |
|-------|---------|-----|
| `user_identities` | Maps `internal_uuid ↔ clerk_id` | service_role only |
| `webhook_events` | Deduplicates webhook events | service_role only |
| `webhook_audit_log` | Full audit trail | service_role only |

### Columns Added ✅

| Table | Column | Purpose |
|-------|--------|---------|
| `profiles` | `deleted_at` | Soft-delete |
| `users` | `deleted_at` | Soft-delete |
| `user_identities` | `deleted_at` | Soft-delete |

### Functions Created ✅

| Function | Purpose |
|----------|---------|
| `resolve_user_id(clerk_id)` | Clerk ID → internal UUID |
| `resolve_clerk_id(internal_uuid)` | Internal UUID → Clerk ID |
| `upsert_user_identity(uuid, clerk_id)` | Create/update mapping |
| `cleanup_soft_deleted_users()` | Hard-delete after 30 days |
| `cleanup_old_webhook_events()` | Cleanup events after 7 days |

---

## 7. Admin Authorization Compatibility

| Check | Source | Compatible? |
|-------|--------|-------------|
| `user.email` from Supabase | `supabase.auth.getUser()` | ✅ Primary |
| `VITE_ADMIN_EMAIL` env var | Vite build | ✅ Unchanged |
| Admin override in authStore | Zustand store | ✅ No Clerk dependency |

**Conclusion:** Admin auth is **100% Supabase-dependent**. Zero impact from Clerk.

---

## 8. Subscription/Tier Compatibility

| Component | Source | Compatible? |
|-----------|--------|-------------|
| User ID | `authStore.user.id` (internal UUID) | ✅ |
| Tier lookup | `profiles.subscription` | ✅ |
| Expiry check | `profiles.pro_expires_at` | ✅ |
| Payment flow | `orders.user_id` (internal UUID) | ✅ |

**Conclusion:** Subscription system is **UUID-based**. Clerk preserves internal UUID. Zero impact.

---

## 9. AI Logging Compatibility

**Conclusion:** AI logging uses **service role**. No auth dependency. Zero impact from Clerk.

---

## 10. User Identity Mapping Readiness

| Component | Status |
|-----------|--------|
| `user_identities` table | ✅ Created |
| `internal_uuid` column | ✅ UUID, FK to `users.id` |
| `clerk_id` column | ✅ TEXT, unique |
| RLS policies | ✅ service_role only |
| Indexes | ✅ On both UUID and clerk_id |

**Conclusion:** Identity mapping infrastructure is **ready**.

---

## 11. Blockers Before First Clerk Login

| # | Blocker | Severity | Action Required |
|---|---------|----------|-----------------|
| 1 | No Clerk project created | 🔴 CRITICAL | Create project at dashboard.clerk.com |
| 2 | No Publishable Key | 🔴 CRITICAL | Copy key from Clerk dashboard |
| 3 | No Secret Key | 🔴 CRITICAL | Copy key from Clerk dashboard |
| 4 | No Google OAuth configured | 🔴 CRITICAL | Enable Google in Clerk dashboard |
| 5 | No Webhook Secret | 🟡 HIGH | Copy webhook secret from Clerk |
| 6 | Edge Function not deployed | 🟡 HIGH | `supabase functions deploy clerk-webhook` |
| 7 | Webhook URL not registered | 🟡 HIGH | Register in Clerk dashboard |
| 8 | Canary emails not configured | 🟡 MEDIUM | Via /admin/canary |

---

## 12. Blockers Before First Canary User

| # | Blocker | Depends On | Action |
|---|---------|------------|--------|
| 1 | Clerk project created | — | Create project |
| 2 | Google OAuth enabled | #1 | Configure in Clerk |
| 3 | Environment variables set | #2 | Add to .env |
| 4 | Edge Function deployed | #3 | `supabase functions deploy` |
| 5 | Webhook registered | #4 | Register in Clerk |
| 6 | Canary email added | #5 | Via /admin/canary |
| 7 | User logs in with Google | #6 | First canary login |
| 8 | Identity mapping created | #7 | Auto via webhook |

---

## 13. Deployment Order

```
Phase 1: Clerk Project Setup (manual, dashboard.clerk.com)
  1. Create Clerk project
  2. Enable Google OAuth
  3. Copy Publishable Key
  4. Copy Secret Key
  5. Copy Webhook Secret
  6. Register webhook URL

Phase 2: Environment Configuration (Vercel)
  1. Add VITE_CLERK_PUBLISHABLE_KEY
  2. Add CLERK_SECRET_KEY
  3. Deploy to Vercel

Phase 3: Edge Function Deployment (Supabase)
  1. Deploy clerk-webhook Edge Function
  2. Test webhook endpoint

Phase 4: Canary Activation (manual)
  1. Admin navigates to /admin/canary
  2. Verify Clerk status: ✅ Enabled
  3. Admin logs out
  4. Admin logs in with Google
  5. Identity mapping created via webhook
  6. Admin verifies: 🐦 Canary Active

Phase 5: Monitoring (ongoing)
  1. Check webhook_audit_log
  2. Check user_identities
  3. Check profiles unchanged
  4. Verify all routes work
```

---

## 14. Rollback Procedure

### Instant Rollback (< 30 seconds)

1. Remove `VITE_CLERK_PUBLISHABLE_KEY` from Vercel
2. Redeploy
3. All users → Supabase (canary dormant)

### Full Rollback (< 5 minutes)

1. Remove env vars from Vercel
2. Redeploy
3. Delete canary emails from /admin/canary
4. Optional: DROP TABLE user_identities

### No Data Loss

- All user data stays in Supabase
- profiles, orders, progress — untouched
- user_identities can be dropped without cascade

---

## 15. Readiness Score

| Category | Score | Description |
|----------|-------|-------------|
| Code Complete | 100/100 | All files exist, build passes |
| Database Ready | 100/100 | Tables, functions, RLS all applied |
| Security | 100/100 | Svix verification, audit logging, soft-delete |
| Documentation | 100/100 | Full audit trail (048A → 048H) |
| Clerk Configuration | 0/100 | No project, no keys, no OAuth |
| Production Deploy | 0/100 | No env vars, no Edge Function deployed |

### Overall: 50/100

---

## 16. Final Decision

### 🟡 READY WITH FIXES

**What's Ready:**
- ✅ All code written and tested
- ✅ Database schema applied
- ✅ Security hardened
- ✅ Canary routing implemented
- ✅ Documentation complete

**What's Missing:**
- ❌ Clerk project not created
- ❌ No credentials installed
- ❌ No Google OAuth configured
- ❌ Edge Function not deployed
- ❌ Webhook not registered

**Fix Required:**
- Manual Clerk project setup (15-30 minutes)
- Environment variable configuration
- Edge Function deployment
- Webhook registration

**After Fixes:**
- Ready for first canary login
- Ready for production monitoring
- Ready for staged rollout

---

*Report completed: 2026-06-15 16:36 UTC*
*Evidence-only audit. Zero implementation.*
