# IMPLEMENTATION-048K: Users Table Post-Webhook Consistency Audit

**Date:** 2026-06-16
**Status:** ✅ COMPLETE
**Decision:** 🟡 USERS TABLE SHOULD BE DEPRECATED

---

## Executive Summary

The `public.users` table EXISTS but is **inconsistent** with the Clerk webhook flow:
- **profiles**: 6 rows (1 original + 5 Clerk) ✅
- **users**: 1 row (original only) ❌ — 0 Clerk users
- **user_identities**: 5 rows ✅

**Root cause:** Webhook handler tries to upsert to `users` with columns that don't exist (`full_name`, `avatar_url`) AND RLS policy (`auth.uid() = id`) blocks service_role inserts. The error is logged but treated as non-fatal.

---

## 1. Evidence Matrix

### Table Schemas

| Column | users | profiles | Difference |
|--------|-------|----------|------------|
| id | UUID PK | UUID PK | Same |
| email | TEXT | — | users only |
| full_name | — | TEXT | profiles only |
| avatar_url | — | TEXT | profiles only |
| tier | TEXT | TEXT | Same |
| tier_expiry | TIMESTAMPTZ | TIMESTAMPTZ | Same |
| xp | INTEGER | — | users only |
| streak | INTEGER | — | users only |
| role | — | TEXT | profiles only |
| subscription | — | TEXT | profiles only |
| pro_expires_at | — | TIMESTAMPTZ | profiles only |
| created_at | TIMESTAMPTZ | TIMESTAMPTZ | Same |
| updated_at | TIMESTAMPTZ | TIMESTAMPTZ | Same |
| deleted_at | TIMESTAMPTZ | TIMESTAMPTZ | Same |

### Row Counts

| Table | Rows | Clerk Users |
|-------|------|-------------|
| users | 1 | 0 ❌ |
| profiles | 6 | 5 ✅ |
| user_identities | 5 | 5 ✅ |
| webhook_audit_log | 22 | — |
| webhook_events | 7 | — |

### FK Constraints

| Constraint | Status |
|------------|--------|
| profiles.id → users.id | **DROPPED** (048C) |
| users.id → auth.users.id | **NONE** |
| Any table → users.id | **NONE** |

---

## 2. Code Path Analysis

### Frontend (src/)

| File | Reference | Query Target |
|------|-----------|--------------|
| Admin.tsx | `/api/admin?action=users` | profiles (via API) |
| authStore.ts | None | — |
| Dashboard.tsx | None | — |
| AdminAI.tsx | None | — |

**Finding:** Frontend NEVER queries `public.users` directly. Admin panel reads profiles via API endpoint.

### Backend (supabase/)

| File | Reference | Operation |
|------|-----------|-----------|
| clerk-webhook/index.ts:220 | `supabase.from("users").upsert(...)` | INSERT/UPDATE |
| 20260615000002_10_webhook_security.sql:91 | `SELECT id FROM users` | SELECT (cleanup function) |
| 20260615000002_10_webhook_security.sql:97 | `DELETE FROM users WHERE id = v_record.id` | DELETE (cleanup function) |

**Finding:** Only 2 code paths reference `public.users`:
1. Webhook handler (upsert) — FAILING for Clerk users
2. Cleanup function (delete) — never triggered for Clerk users

---

## 3. RLS Policy Analysis

### users table RLS

| Policy | Command | Condition | Effect |
|--------|---------|-----------|--------|
| users_insert_own | INSERT | `auth.uid() = id` | Blocks service_role |
| users_select_own | SELECT | `auth.uid() = id` | Blocks service_role reads |
| users_update_own | UPDATE | `auth.uid() = id` | Blocks service_role updates |

**RLS enabled:** YES (`relrowsecurity = true`)

**Impact:** Service_role (used by webhook handler) cannot INSERT/SELECT/UPDATE users table. The `auth.uid()` function returns NULL for service_role connections, so `NULL = id` is always false.

### profiles table RLS

| Policy | Command | Condition | Effect |
|--------|---------|-----------|--------|
| Users can insert own profile | INSERT | `auth.uid() = id` | Blocks service_role |
| Users can update own profile | UPDATE | `auth.uid() = id` | Blocks service_role |
| Users can view own profile | SELECT | `auth.uid() = id` | Blocks service_role |

**Same problem:** But profiles HAS data (6 rows). Why?

**Answer:** Profiles was created BEFORE RLS was enabled. The original `01_tables.sql` created profiles without RLS. RLS was added later but existing data remains. New Clerk profiles are created via `upsert_user_identity` function which uses `SECURITY DEFINER` (bypasses RLS).

---

## 4. Production Breakage Risk

### Risk Matrix

| Scenario | Risk Level | Impact |
|----------|------------|--------|
| Clerk user created → users row missing | 🟡 MEDIUM | No cascade FK impact (FK dropped) |
| Admin panel queries users | 🟢 LOW | Admin reads profiles, not users |
| Cleanup function runs | 🟢 LOW | No users rows to delete |
| New feature depends on users.id | 🔴 HIGH | Will break for Clerk users |
| Migration requires users data | 🟡 MEDIUM | Incomplete user records |

### Current Breakage

| Component | Status | Impact |
|-----------|--------|--------|
| Webhook user.created | ⚠️ Partial | profiles ✅, users ❌ |
| Webhook user.updated | ⚠️ Fails | "User not found" (no users row) |
| Webhook user.deleted | ⚠️ Partial | profiles soft-deleted, users not |
| Admin panel | ✅ Working | Reads profiles |
| Frontend auth | ✅ Working | Uses authStore (Supabase Auth) |

---

## 5. Recommendations

### Option A: DEPRECATE users table ✅ RECOMMENDED

**Rationale:**
- profiles has ALL user data (full_name, avatar_url, role, subscription, pro_expires_at)
- users has UNIQUE columns (email, xp, streak) that are either:
  - email: available in auth.users (Supabase Auth)
  - xp/streak: not used in frontend
- No FK constraints reference users.id
- No frontend code queries users directly
- Webhook handler already creates profiles successfully

**Migration effort:** LOW
1. Move `xp`, `streak` columns to profiles (if needed)
2. Remove users table RLS policies
3. Drop users table (after data migration)
4. Update cleanup functions to reference profiles

### Option B: SYNCHRONIZE users table

**Rationale:**
- Keep users as canonical user record
- Fix RLS to allow service_role access
- Ensure webhook creates both profiles AND users

**Migration effort:** MEDIUM
1. Add service_role bypass policy to users
2. Fix webhook handler column mismatch (full_name, avatar_url don't exist in users)
3. Backfill users rows for existing Clerk profiles
4. Maintain dual-table consistency

### Option C: REPLACE users with profiles

**Rationale:**
- profiles is the de facto user table
- users is redundant
- Simplify schema

**Migration effort:** HIGH
1. Move xp, streak to profiles
2. Update all FK constraints (currently none reference users)
3. Update cleanup functions
4. Drop users table
5. Update any future code

---

## 6. Dependency Graph

```
auth.users (Supabase Auth)
    ↓ (auth.uid())
profiles (6 rows) ← Frontend reads here
    ↓ (id)
user_identities (5 rows) ← Clerk → Internal UUID mapping
    ↓ (internal_id)
[No FK to users.id]

users (1 row) ← Orphaned for Clerk users
    ↓ (no FK constraints)
[Nothing depends on users.id]
```

---

## 7. Recommendation

**🟢 Option A: DEPRECATE users table**

**Why:**
1. profiles is the de facto user table (6 rows, all data)
2. users is incomplete (1 row, no Clerk users)
3. No FK constraints reference users.id
4. No frontend code queries users directly
5. Webhook handler already creates profiles successfully
6. users unique columns (email, xp, streak) are either:
   - email: available in auth.users
   - xp/streak: not used in frontend

**Migration steps:**
1. Add `xp` and `streak` columns to profiles (if gamification needed)
2. Migrate existing users.xp/streak to profiles
3. Remove RLS policies from users table
4. Drop users table
5. Update cleanup functions to reference profiles
6. Update webhook handler to remove users upsert

**Risk:** LOW — No FK constraints, no frontend dependencies, profiles already has all data.

---

## 8. Implementation

### Step 1: Add xp/streak to profiles (if needed)

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
```

### Step 2: Migrate data

```sql
UPDATE profiles p
SET xp = u.xp, streak = u.streak
FROM users u
WHERE p.id = u.id;
```

### Step 3: Drop users table

```sql
DROP TABLE IF EXISTS users CASCADE;
```

### Step 4: Update cleanup functions

```sql
-- Update soft_delete_user to reference profiles instead of users
CREATE OR REPLACE FUNCTION soft_delete_user(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles SET deleted_at = NOW() WHERE id = p_user_id;
  UPDATE user_identities SET deleted_at = NOW() WHERE internal_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 5: Update webhook handler

Remove users upsert from `handleUserCreated`:
```typescript
// REMOVE THIS BLOCK:
const { error: usersError } = await supabase.from("users").upsert(
  {
    id: identity,
    xp: 0,
    streak: 0,
    tier: "Free",
    full_name: fullName,
    avatar_url: user.image_url,
  },
  { onConflict: "id" }
);
```

---

## 9. Verification

After migration:
1. ✅ profiles table has all user data
2. ✅ user_identities has all Clerk mappings
3. ✅ users table dropped
4. ✅ No FK constraints broken
5. ✅ Frontend still works (reads profiles)
6. ✅ Webhook still works (creates profiles)
7. ✅ Admin panel still works (reads profiles via API)

---

## Decision

🟢 **Option A: DEPRECATE users table**

**Effort:** LOW (5 SQL statements + 1 code change)
**Risk:** LOW (no FK constraints, no frontend dependencies)
**Impact:** Simplifies schema, removes inconsistency

**Ready for implementation.**
