# IMPLEMENTATION-048D.1: Webhook Delete Lifecycle Audit

**Date:** 2026-06-15
**Scope:** Audit + Design only. No implementation. No schema changes.
**Context:** 048D identified HIGH-risk finding — webhook delete lifecycle incomplete.

---

## 1. Current Delete Chain Trace

### Runtime Flow (Clerk User Deletion)

```
Clerk Dashboard / API
  │
  ├─ 1. Clerk deletes user from auth.users
  │
  ├─ 2. Clerk fires webhook: user.deleted
  │     └─ Payload: { id: "clerk_xxx", ... }
  │
  ├─ 3. Edge Function: clerk-webhook/index.ts
  │     ├─ resolve_user_id(p_clerk_id: "clerk_xxx")
  │     │   └─ Returns: internal_id (UUID)
  │     │
  │     ├─ profiles.delete().eq("id", internal_id)  ← ⚠️ NO FK CASCADE
  │     │   └─ Profiles row deleted
  │     │
  │     └─ user_identities.delete().eq("internal_id", internal_id)
  │         └─ Identity mapping deleted
  │
  └─ 4. Done. Return 200.
```

### Step-by-Step Analysis

| Step | Action | Method | Cascade? | Status |
|------|--------|--------|----------|--------|
| 1 | Clerk deletes user | External | N/A | ✅ Automatic |
| 2 | Webhook fires | External | N/A | ✅ Automatic |
| 3a | Resolve internal UUID | DB RPC | N/A | ✅ Automatic |
| 3b | Delete profile | DB DELETE | ❌ No FK from profiles | ⚠️ MANUAL |
| 3c | Delete identity | DB DELETE | N/A | ✅ Automatic |
| 4 | Delete users row | **NOT DONE** | ❌ Missing | 🔴 **MISSING** |
| 5 | Delete notes | **NOT DONE** | CASCADE via users.id | 🔴 **MISSING** |
| 6 | Delete progress | **NOT DONE** | CASCADE via users.id | 🔴 **MISSING** |
| 7 | Delete orders | **NOT DONE** | CASCADE via users.id | 🔴 **MISSING** |
| 8 | Delete mock_tests | **NOT DONE** | CASCADE via users.id | 🔴 **MISSING** |
| 9 | Delete quick_notes | **NOT DONE** | CASCADE via users.id | 🔴 **MISSING** |
| 10 | Delete study_plans | **NOT DONE** | CASCADE via users.id | 🔴 **MISSING** |
| 11 | Delete user_checkpoint_progress | **NOT DONE** | CASCADE via users.id | 🔴 **MISSING** |
| 12 | Delete user_curriculum_progress | **NOT DONE** | CASCADE via users.id | 🔴 **MISSING** |
| 13 | Delete user_daily_usage | **NOT DONE** | CASCADE via users.id | 🔴 **MISSING** |
| 14 | Delete user_lesson_progress | **NOT DONE** | CASCADE via users.id | 🔴 **MISSING** |
| 15 | SET NULL ai_requests.user_id | **NOT DONE** | SET NULL via users.id | 🔴 **MISSING** |

### Critical Gap

**Current webhook deletes `profiles` and `user_identities` but NOT `users` row.**

Since all dependent tables (notes, progress, orders, etc.) have FK → `users.id` with CASCADE, deleting `users` row would cascade to all dependents automatically.

**Without deleting `users`, ALL dependent data becomes orphaned.**

---

## 2. Dependency Graph

### profiles.id References

| Table | Column | FK Target | Cascade |
|-------|--------|-----------|---------|
| (none) | — | — | — |

**profiles is a LEAF node — no tables reference it.**

### users.id References

| Table | Column | FK Target | Cascade |
|-------|--------|-----------|---------|
| `users` | `id` | `users.id` | CASCADE (self) |
| `notes` | `user_id` | `users.id` | CASCADE |
| `progress` | `user_id` | `users.id` | CASCADE |
| `orders` | `user_id` | `users.id` | CASCADE |
| `mock_tests` | `user_id` | `users.id` | CASCADE |
| `quick_notes` | `user_id` | `users.id` | CASCADE |
| `study_plans` | `user_id` | `users.id` | CASCADE |
| `user_checkpoint_progress` | `user_id` | `users.id` | CASCADE |
| `user_curriculum_progress` | `user_id` | `users.id` | CASCADE |
| `user_daily_usage` | `user_id` | `users.id` | CASCADE |
| `user_lesson_progress` | `user_id` | `users.id` | CASCADE |
| `ai_requests` | `user_id` | `users.id` | SET NULL |
| `provider_secrets` | `created_by` | `users.id` | NO ACTION |
| `provider_secrets` | `updated_by` | `users.id` | NO ACTION |

### Dependency Tree

```
users.id (ROOT)
├─ notes.user_id (CASCADE)
├─ progress.user_id (CASCADE)
├─ orders.user_id (CASCADE)
├─ mock_tests.user_id (CASCADE)
├─ quick_notes.user_id (CASCADE)
├─ study_plans.user_id (CASCADE)
├─ user_checkpoint_progress.user_id (CASCADE)
├─ user_curriculum_progress.user_id (CASCADE)
├─ user_daily_usage.user_id (CASCADE)
├─ user_lesson_progress.user_id (CASCADE)
├─ ai_requests.user_id (SET NULL)
├─ provider_secrets.created_by (NO ACTION)
├─ provider_secrets.updated_by (NO ACTION)
└─ users.id (CASCADE — self)

profiles.id (LEAF — no dependents)
user_identities.internal_id (LEAF — no dependents)
```

---

## 3. Orphan Analysis

### Scenario A: Clerk User Deleted (Happy Path)

| Row | Action | Result |
|-----|--------|--------|
| user_identities | Deleted by webhook | ✅ Clean |
| profiles | Deleted by webhook | ✅ Clean |
| users | **NOT deleted** | 🔴 **ORPHANED** |
| notes | **NOT deleted** | 🔴 **ORPHANED** |
| progress | **NOT deleted** | 🔴 **ORPHANED** |
| orders | **NOT deleted** | 🔴 **ORPHANED** |
| All other user tables | **NOT deleted** | 🔴 **ORPHANED** |

**Orphan Count:** 12+ tables with orphaned data

### Scenario B: Webhook Replay (Duplicate Event)

| Action | Result |
|--------|--------|
| Duplicate user.deleted webhook | ⚠️ Idempotent (resolve returns null) |
| profiles already deleted | ✅ No error (delete non-existent = OK) |
| user_identities already deleted | ✅ No error |
| users still exists | ⚠️ Still orphaned |

**Risk:** LOW — replay is safe, but doesn't fix orphan issue.

### Scenario C: Partial Webhook Failure

| Failure Point | State | Orphan Risk |
|---------------|-------|-------------|
| resolve_user_id fails | profiles + users exist | ⚠️ MEDIUM |
| profiles.delete fails | user_identities deleted, profiles exists | ⚠️ MEDIUM |
| user_identities.delete fails | profiles deleted, identity exists | ⚠️ LOW |
| Network timeout | Unknown state | ⚠️ HIGH |

**Risk:** HIGH — no retry mechanism, partial state possible.

### Scenario D: Deleted Mapping, Retained Profile

| Action | Result |
|--------|--------|
| Manual: user_identities DELETE | Mapping lost |
| profiles still exists | ⚠️ Orphaned (no Clerk reference) |
| users still exists | ⚠️ Orphaned (no Clerk reference) |
| All dependents still exist | ⚠️ Orphaned |

**Risk:** HIGH — manual deletion breaks referential integrity.

---

## 4. Safe Delete Design

### Option A: Hard Delete (Recommended)

```
Clerk user.deleted webhook
  │
  ├─ 1. Resolve internal UUID
  │     └─ resolve_user_id(p_clerk_id)
  │
  ├─ 2. Delete users row FIRST (triggers CASCADE)
  │     └─ users.delete().eq("id", internal_id)
  │         ├─ notes CASCADE ✅
  │         ├─ progress CASCADE ✅
  │         ├─ orders CASCADE ✅
  │         ├─ mock_tests CASCADE ✅
  │         ├─ quick_notes CASCADE ✅
  │         ├─ study_plans CASCADE ✅
  │         ├─ user_checkpoint_progress CASCADE ✅
  │         ├─ user_curriculum_progress CASCADE ✅
  │         ├─ user_daily_usage CASCADE ✅
  │         ├─ user_lesson_progress CASCADE ✅
  │         └─ ai_requests SET NULL ✅
  │
  ├─ 3. Delete profiles (no FK — manual)
  │     └─ profiles.delete().eq("id", internal_id)
  │
  ├─ 4. Delete identity mapping
  │     └─ user_identities.delete().eq("internal_id", internal_id)
  │
  └─ 5. Return 200
```

**Advantages:**
- Clean deletion — no orphans
- CASCADE handles most cleanup
- Simple implementation

**Disadvantages:**
- Data permanently lost
- No audit trail
- Cannot undo

### Option B: Soft Delete

```
Clerk user.deleted webhook
  │
  ├─ 1. Resolve internal UUID
  │
  ├─ 2. Mark profiles as soft-deleted
  │     └─ profiles.update({ deleted_at: new Date() }).eq("id", internal_id)
  │
  ├─ 3. Mark users as soft-deleted
  │     └─ users.update({ deleted_at: new Date() }).eq("id", internal_id)
  │
  ├─ 4. Mark identity as soft-deleted
  │     └─ user_identities.update({ deleted_at: new Date() }).eq("internal_id", internal_id)
  │
  └─ 5. Return 200
```

**Advantages:**
- Data preserved for audit
- Can restore user
- No orphan risk (data still consistent)

**Disadvantages:**
- Requires schema changes (add `deleted_at` columns)
- Requires query filtering (WHERE deleted_at IS NULL)
- More complex implementation
- Storage cost

### Option C: Hybrid (Recommended)

```
Clerk user.deleted webhook
  │
  ├─ 1. Resolve internal UUID
  │
  ├─ 2. Soft-delete profiles + users
  │     └─ profiles.update({ deleted_at: new Date() }).eq("id", internal_id)
  │     └─ users.update({ deleted_at: new Date() }).eq("id", internal_id)
  │
  ├─ 3. Mark identity as deleted
  │     └─ user_identities.update({ deleted_at: new Date() }).eq("internal_id", internal_id)
  │
  ├─ 4. Schedule hard delete (30 days)
  │     └─ Cron job: DELETE FROM users WHERE deleted_at < NOW() - INTERVAL '30 days'
  │
  └─ 5. Return 200
```

**Advantages:**
- Audit trail preserved
- Can restore within 30 days
- Automatic cleanup
- No orphan risk

**Disadvantages:**
- Requires schema changes
- Requires cron job
- More complex

### Comparison

| Criteria | Hard Delete | Soft Delete | Hybrid |
|----------|-------------|-------------|--------|
| Orphan Risk | ✅ None | ✅ None | ✅ None |
| Audit Trail | ❌ None | ✅ Full | ✅ Full |
| Restore Ability | ❌ No | ✅ Yes | ✅ Yes (30d) |
| Schema Change | ✅ None | ⚠️ Required | ⚠️ Required |
| Complexity | ✅ Low | ⚠️ Medium | ⚠️ Medium |
| Storage Cost | ✅ None | ⚠️ High | ⚠️ Medium |
| Production Ready | ✅ Yes | ✅ Yes | ✅ Yes |

---

## 5. Rollback Compatibility

### Current Rollback Plan (048D)

```
Disable Clerk → Remove ClerkProvider → Re-enable Supabase Auth
```

### Impact of Delete Lifecycle on Rollback

| Delete Strategy | Rollback Impact |
|-----------------|-----------------|
| Hard Delete | ✅ No impact — Supabase Auth data untouched |
| Soft Delete | ✅ No impact — soft-deleted rows irrelevant |
| Hybrid | ✅ No impact — scheduled cleanup irrelevant |

### Rollback Steps (Unchanged)

1. Remove ClerkProvider from App.tsx
2. Uninstall Clerk packages
3. Remove Clerk files
4. Verify Supabase Auth login
5. Verify RLS policies

**Verdict:** ✅ **Delete lifecycle does not break rollback.**

---

## 6. Security Review

### Webhook Signature Validation

**Current State:**
```typescript
// For POC: verify via svix headers
const svixId = headers["svix-id"];
const svixTimestamp = headers["svix-timestamp"];
const svixSignature = headers["svix-signature"];

// In production, use @clerk/backend verifyWebhook
// For POC, we trust the payload structure
const event = JSON.parse(payload);
```

**Issue:** POC does NOT verify signature — trusts payload structure.

**Risk:** HIGH — attacker can forge webhook to delete arbitrary profiles.

### Attack Vectors

| Vector | Risk | Mitigation |
|--------|------|------------|
| Forged webhook | 🔴 HIGH | Verify svix signature |
| Replay attack | ⚠️ MEDIUM | Check svix-timestamp freshness |
| Partial payload | ⚠️ LOW | Validate required fields |
| Network interception | ⚠️ LOW | HTTPS only (Edge Function) |

### Required Security Measures

1. **Verify svix signature** — Use `@clerk/backend` `verifyWebhook()` in production
2. **Check timestamp freshness** — Reject webhooks older than 5 minutes
3. **Validate payload structure** — Ensure `event.data.id` exists
4. **Log all delete attempts** — Audit trail for security

### Authorization Check

| Check | Current | Required |
|-------|---------|----------|
| Webhook signature | ❌ Not verified | ✅ Must verify |
| User exists | ✅ Checked | ✅ OK |
| Rate limiting | ❌ None | ⚠️ Consider |
| Idempotency | ✅ Handled | ✅ OK |

---

## 7. Final Recommendation

### Decision: HYBRID

**Justification:**

1. **Audit trail required** — Production app needs to track deletions
2. **Restore ability** — Users may accidentally delete accounts
3. **Automatic cleanup** — 30-day retention balances safety and storage
4. **No orphan risk** — Soft delete maintains referential integrity
5. **Rollback safe** — Does not affect Supabase Auth rollback

### Recommended Implementation

#### Phase 1: Schema Changes (Migration)

```sql
-- Add soft-delete columns
ALTER TABLE profiles ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE user_identities ADD COLUMN deleted_at TIMESTAMPTZ;

-- Add index for cleanup queries
CREATE INDEX idx_profiles_deleted_at ON profiles(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;
```

#### Phase 2: Webhook Enhancement

```typescript
case "user.deleted": {
  const user: ClerkUser = event.data;

  // 1. Verify svix signature (PRODUCTION)
  // const verified = await verifyWebhook(payload, headers, CLERK_WEBHOOK_SECRET);
  // if (!verified) return new Response("Invalid signature", { status: 401 });

  // 2. Resolve internal UUID
  const { data: internalId, error: resolveError } = await supabase
    .rpc("resolve_user_id", { p_clerk_id: user.id });

  if (resolveError || !internalId) {
    console.log(`User not found for deletion: ${user.id}`);
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  // 3. Soft-delete all three tables
  const now = new Date().toISOString();

  await supabase.from("profiles").update({ deleted_at: now }).eq("id", internalId);
  await supabase.from("users").update({ deleted_at: now }).eq("id", internalId);
  await supabase.from("user_identities").update({ deleted_at: now }).eq("internal_id", internalId);

  // 4. Log deletion
  console.log(`User soft-deleted: ${user.id} → ${internalId}`);

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
```

#### Phase 3: Cleanup Cron

```sql
-- Scheduled via pg_cron or Supabase Edge Function
DELETE FROM users WHERE deleted_at < NOW() - INTERVAL '30 days';

-- This cascades to all dependent tables via FK
```

#### Phase 4: Query Filtering

Add `WHERE deleted_at IS NULL` to all user queries:

```typescript
// Example: Get user profile
from('profiles').select('*').eq('id', userId).is('deleted_at', null)

// Example: Get user orders
from('orders').select('*').eq('user_id', userId)
```

### Implementation Effort

| Phase | Effort | Priority |
|-------|--------|----------|
| Schema changes | 1 hour | HIGH |
| Webhook enhancement | 2 hours | HIGH |
| Cleanup cron | 1 hour | MEDIUM |
| Query filtering | 4 hours | MEDIUM |
| Testing | 2 hours | HIGH |
| **Total** | **10 hours** | — |

### Risk Matrix

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Orphaned data | HIGH | HIGH (current) | Hybrid delete |
| Forged webhook | HIGH | MEDIUM | Verify svix signature |
| Partial failure | MEDIUM | LOW | Retry mechanism |
| Restore abuse | LOW | LOW | Rate limiting |

---

## Final Scores

| Score | Rating | Description |
|-------|--------|-------------|
| **Orphan Risk** | 🔴 HIGH (current) → 🟢 LOW (after fix) | Current webhook leaves 12+ tables orphaned |
| **Security Risk** | 🔴 HIGH (current) → 🟢 LOW (after fix) | POC does not verify webhook signature |
| **Rollback Safety** | 🟢 SAFE | Delete lifecycle does not affect rollback |
| **Implementation Effort** | 🟡 MEDIUM | 10 hours across 4 phases |

---

## Final Decision

# 🟡 READY WITH FIXES

**Rationale:**
- Core architecture is sound
- Delete lifecycle gap is fixable with hybrid approach
- Security gap (webhook signature) is fixable
- Rollback remains safe

**Required before production:**
1. Implement hybrid delete (soft-delete + 30-day cleanup)
2. Verify svix signature in production
3. Add query filtering for soft-deleted users
4. Test full delete lifecycle

**Can proceed with:**
- IMPLEMENTATION-048E: Clerk JWT ↔ Supabase RLS bridging
- IMPLEMENTATION-048F: Webhook hardening + hybrid delete

---

*Audit completed: 2026-06-15 11:50 UTC*
*Next: IMPLEMENTATION-048E or 048F — when Avres confirms*
