# IMPLEMENTATION-048A: Clerk Migration Architecture Plan

**Status:** Discovery & Planning Only — No Code Changes
**Date:** 2026-06-15
**Author:** Exilio 🧠

---

## Table of Contents

1. [Authentication Architecture Assessment](#1-authentication-architecture-assessment)
2. [RLS Compatibility Audit](#2-rls-compatibility-audit)
3. [Clerk JWT Strategy](#3-clerk-jwt-strategy)
4. [User Identity Mapping](#4-user-identity-mapping)
5. [Admin Authorization Strategy](#5-admin-authorization-strategy)
6. [Profile Synchronization Strategy](#6-profile-synchronization-strategy)
7. [Route Protection Strategy](#7-route-protection-strategy)
8. [Payment & Subscription Impact](#8-payment--subscription-impact)
9. [AI Logging Impact](#9-ai-logging-impact)
10. [Rollback Strategy](#10-rollback-strategy)
11. [Migration Phases](#11-migration-phases)
12. [Final Recommendation](#12-final-recommendation)

---

## 1. Authentication Architecture Assessment

### Current State: Supabase Auth

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐     ┌────────────┐
│  Google OAuth │────▶│  Supabase Auth   │────▶│  auth.uid() │────▶│  RLS + DB  │
│  (Provider)  │     │  (Hosted)        │     │  (JWT Claim)│     │            │
└─────────────┘     └──────────────────┘     └─────────────┘     └────────────┘
```

**Components:**
- **Provider:** Google OAuth via Supabase Auth
- **Session:** Supabase `session.access_token` (JWT)
- **Identity:** `auth.uid()` in RLS policies, `user.id` in frontend
- **Profile:** `profiles` table (id = auth.users UUID)
- **Admin:** `ADMIN_EMAIL` env + `profiles.role` fallback
- **Frontend:** `useAuthStore` (Zustand) wraps `supabase.auth.onAuthStateChange`

**Auth Flow:**
1. `supabase.auth.signInWithOAuth({ provider: 'google' })`
2. Callback → `onAuthStateChange` fires
3. `updateAuthState(session)` → fetches `profiles` row
4. Admin override: `user.email === VITE_ADMIN_EMAIL`
5. Session cached in `localStorage` (`deutschup_session`)
6. Profile cached in `localStorage` (`deutschup_profile_{userId}`)

### Candidate State: Clerk Auth + Supabase Database

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────┐     ┌────────────┐
│  Google OAuth │────▶│  Clerk        │────▶│ JWT Template │────▶│  auth.uid() │────▶│  RLS + DB  │
│  (Provider)  │     │  (Hosted)     │     │  (Supabase) │     │  (JWT Claim)│     │            │
└─────────────┘     └──────────────┘     └─────────────┘     └─────────────┘     └────────────┘
```

**Key Change:** Clerk becomes the auth provider; Supabase becomes database-only.

### Feasibility Assessment

| Factor | Rating | Notes |
|--------|--------|-------|
| Technical feasibility | ✅ HIGH | Clerk → Supabase JWT template is documented pattern |
| Migration complexity | ⚠️ MEDIUM | 16 tables with `auth.uid()` references need remapping |
| Risk level | ⚠️ MEDIUM | User identity remapping is the critical path |
| Downtime risk | ✅ LOW | Phased approach allows parallel running |
| Rollback difficulty | ✅ LOW | Can revert by disabling Clerk, re-enabling Supabase Auth |

---

## 2. RLS Compatibility Audit

### Policy Inventory

| Table | Policy Name | Operation | Dependency | Migration Impact |
|-------|-------------|-----------|------------|-----------------|
| **profiles** | Users can view own profile | SELECT | `auth.uid() = id` | 🔴 CRITICAL — PK references auth.users UUID |
| **profiles** | Users can update own profile | UPDATE | `auth.uid() = id` | 🔴 CRITICAL — PK references auth.users UUID |
| **profiles** | Users can insert own profile | INSERT | `auth.uid() = id` | 🔴 CRITICAL — PK references auth.users UUID |
| **profiles** | Admins can view all profiles | SELECT | `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')` | 🔴 CRITICAL — self-referencing + auth.uid() |
| **profiles** | Admins can update all profiles | UPDATE | `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')` | 🔴 CRITICAL — self-referencing + auth.uid() |
| **progress** | Users can view own progress | SELECT | `auth.uid() = user_id` | 🟡 MEDIUM — FK to auth.users |
| **progress** | Users can update own progress | UPDATE | `auth.uid() = user_id` | 🟡 MEDIUM |
| **progress** | Users can insert own progress | INSERT | `auth.uid() = user_id` | 🟡 MEDIUM |
| **notes** | Users can view own notes | SELECT | `auth.uid() = user_id` | 🟡 MEDIUM |
| **notes** | Users can update own notes | UPDATE | `auth.uid() = user_id` | 🟡 MEDIUM |
| **notes** | Users can insert own notes | INSERT | `auth.uid() = user_id` | 🟡 MEDIUM |
| **notes** | Users can delete own notes | DELETE | `auth.uid() = user_id` | 🟡 MEDIUM |
| **study_plans** | Users can view/update/insert/delete | ALL | `auth.uid() = user_id` | 🟡 MEDIUM |
| **quick_notes** | Users can view/update/insert | ALL | `auth.uid() = user_id` | 🟡 MEDIUM |
| **mock_tests** | Users can view/insert | ALL | `auth.uid() = user_id` | 🟡 MEDIUM |
| **user_lesson_progress** | Users can read/insert/update | ALL | `auth.uid() = user_id` | 🟡 MEDIUM |
| **user_checkpoint_progress** | Users can read/insert/update | ALL | `auth.uid() = user_id` | 🟡 MEDIUM |
| **user_curriculum_progress** | Users can read/insert/update | ALL | `auth.uid() = user_id` | 🟡 MEDIUM |
| **curriculum_* (7 tables)** | Public read, service_role write | SELECT/ALL | `auth.role() = 'service_role'` | 🟢 LOW — no auth.uid() dependency |
| **ai_* (3 tables)** | Service role manage | ALL | `auth.role() = 'service_role'` | 🟢 LOW — no auth.uid() dependency |
| **Admin progress policies** | Admins can read all | SELECT | `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')` | 🔴 CRITICAL — self-referencing |

### FK Dependencies on auth.users

```sql
-- These columns have FOREIGN KEY REFERENCES auth.users(id) ON DELETE CASCADE:
profiles.id              → auth.users(id)
progress.user_id         → auth.users(id)
notes.user_id            → auth.users(id)
study_plans.user_id      → auth.users(id)
quick_notes.user_id      → auth.users(id)
mock_tests.user_id       → auth.users(id)
orders.user_id           → auth.users(id)
user_lesson_progress.user_id        → auth.users(id)
user_checkpoint_progress.user_id    → auth.users(id)
user_curriculum_progress.user_id    → auth.users(id)
```

**Total: 10 FK constraints referencing `auth.users(id)`**

### Impact Summary

- **CRITICAL (5):** profiles (PK + admin policies), admin progress policies
- **MEDIUM (9):** All user data tables with `auth.uid()` in RLS
- **LOW (10):** Curriculum/read-only tables, AI tables (service_role only)

---

## 3. Clerk JWT Strategy

### JWT Claims Structure

```json
{
  "iss": "https://clerk.your-domain.com",
  "sub": "user_xxxxxxxxxxxxxxxx",
  "aud": "authenticated",
  "exp": 1234567890,
  "iat": 1234567890,
  "azp": "supabase-project-ref",
  "role": "authenticated",
  "email": "user@example.com",
  "user_metadata": {
    "role": "user"
  },
  "app_metadata": {
    "role": "admin"
  }
}
```

### JWT Template for Supabase

```json
{
  "role": "authenticated",
  "email": "{{user.primary_email_address}}",
  "user_metadata": {
    "role": "{{user.public_metadata.role || 'user'}}"
  },
  "app_metadata": {
    "role": "{{user.public_metadata.role || 'user'}}"
  }
}
```

### Claim Mapping

| Clerk Concept | JWT Claim | Supabase Usage | RLS Access |
|---------------|-----------|----------------|------------|
| User ID | `sub` | `auth.uid()` | ✅ Direct mapping |
| Email | `email` | `auth.email()` | ✅ Available |
| Role | `user_metadata.role` | Custom claim extraction | ⚠️ Requires helper |
| Admin | `app_metadata.role = 'admin'` | Custom claim extraction | ⚠️ Requires helper |

### Critical: auth.uid() Compatibility

**Clerk's `sub` claim must map to `auth.uid()`.**

Supabase Auth recognizes Clerk JWTs IF:
1. JWT is signed with correct signing key
2. JWT contains `sub` claim
3. Clerk project is linked to Supabase project

**Alternative:** Use Clerk's Supabase integration:
- Clerk provides native Supabase JWT template
- `sub` claim = Clerk user ID
- RLS policies work unchanged IF `profiles.id` = Clerk user ID

---

## 4. User Identity Mapping

### Option A: profiles.id = Clerk User ID

```
Current:  profiles.id = supabase_auth_user.id (UUID)
Target:   profiles.id = clerk_user.id (string like "user_xxx")
```

**Implementation:**
- All FK references change from UUID to TEXT
- RLS policies: `auth.uid() = user_id` → works if Clerk `sub` = `auth.uid()`
- All `user_id` columns must be TEXT or accommodate Clerk IDs

**Pros:**
- Simplest — no mapping table
- RLS policies unchanged (if Clerk sub = auth.uid)
- FK constraints update straightforward

**Cons:**
- Schema migration required (UUID → TEXT on 10 columns)
- Data migration: all existing user data must be re-keyed
- If Clerk ID format changes, everything breaks
- Tight coupling to Clerk identity format

### Option B: Internal UUID Mapping Table

```
Current:  profiles.id = supabase_auth_user.id (UUID)
Target:   profiles.id = internal_uuid
          user_identities table maps: internal_uuid ↔ clerk_user_id
```

**Implementation:**
```sql
CREATE TABLE user_identities (
  internal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  supabase_id UUID UNIQUE, -- legacy, nullable after migration
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- profiles.id = internal_id (unchanged UUID)
-- All FK references stay UUID
-- RLS: auth.uid() needs helper to resolve internal_id
```

**Pros:**
- No schema changes to existing tables
- Clean rollback: just disable Clerk, re-enable Supabase Auth
- Provider-agnostic: could switch to any auth provider later
- Data migration: only user_identities table needed

**Cons:**
- Extra join required for every RLS check
- More complex RLS policies (subquery to user_identities)
- Performance overhead on every query
- More code to maintain

### Comparison Matrix

| Factor | Option A (Clerk ID as PK) | Option B (Mapping Table) |
|--------|--------------------------|--------------------------|
| Schema changes | 🔴 HIGH — 10 columns UUID→TEXT | 🟢 NONE — new table only |
| Data migration | 🔴 HIGH — all rows re-keyed | 🟢 LOW — only identity rows |
| RLS complexity | 🟢 LOW — policies unchanged | 🔴 HIGH — subquery needed |
| Performance | 🟢 NONE — direct comparison | 🟡 MEDIUM — extra join |
| Rollback difficulty | 🔴 HIGH — reverse schema + data | 🟢 LOW — drop mapping table |
| Security | 🟢 GOOD — direct FK | 🟡 GOOD — mapping table is source of truth |
| Provider lock-in | 🔴 HIGH — Clerk ID format baked in | 🟢 LOW — internal UUID is stable |

### Recommendation: **Option B (Internal UUID Mapping)**

**Rationale:**
1. Zero schema changes to 10 existing tables
2. Rollback is trivial (drop mapping table, re-enable Supabase Auth)
3. Provider-agnostic — not locked to Clerk's ID format
4. Data migration is minimal (only mapping table)
5. Performance cost is negligible at DeutschUp's scale ( <1000 users)

---

## 5. Admin Authorization Strategy

### Current State

```
Two-layer admin check:
1. Frontend: user.email === VITE_ADMIN_EMAIL → role='admin' override
2. Backend: adminMiddleware checks ADMIN_EMAIL env + profiles.role='admin'
3. RLS: EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
```

**Problems:**
- Email-based admin override is fragile (email changes break admin access)
- Dual source of truth (env + DB)
- RLS admin policies are self-referencing (REG-005 risk)

### Target State: Clerk-Managed Admin

```
Source of Truth: Clerk public_metadata.role = 'admin'
Propagation:     Clerk JWT → user_metadata.role → app_metadata.role
Admin Checks:    JWT claim extraction (no DB query)
RLS Policies:    Custom function: is_admin() extracts from JWT
```

**JWT Template:**
```json
{
  "role": "authenticated",
  "email": "{{user.primary_email_address}}",
  "is_admin": "{{user.public_metadata.role === 'admin'}}"
}
```

**RLS Helper Function:**
```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'is_admin',
    'false'
  )::boolean;
$$ LANGUAGE sql STABLE;
```

**Updated Policies:**
```sql
-- Before (self-referencing):
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- After (JWT-based, no self-reference):
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  is_admin()
);
```

### Admin Role Propagation

| Layer | Source | Method |
|-------|--------|--------|
| Clerk Dashboard | Public metadata | Manual set via Clerk UI |
| JWT | `is_admin` claim | Auto-populated from public metadata |
| Frontend | `profileData.role` | Extracted from JWT on login |
| Backend | `req.user.is_admin` | Extracted from JWT in authMiddleware |
| RLS | `is_admin()` | Custom SQL function reads JWT |

---

## 6. Profile Synchronization Strategy

### Current Flow

```
Google OAuth → Supabase Auth → onAuthStateChange → fetch profiles row → cache
```

### Target Flow: Clerk Webhooks

```
Google OAuth → Clerk → Webhook → Supabase Edge Function → upsert profiles
```

### Webhook Events

| Clerk Event | Action | Supabase Operation |
|-------------|--------|-------------------|
| `user.created` | Create profile | INSERT INTO profiles (id, full_name, avatar_url) |
| `user.updated` | Update profile | UPDATE profiles SET full_name, avatar_url WHERE id = clerk_id |
| `user.deleted` | Delete profile | DELETE FROM profiles WHERE id = clerk_id (cascades) |
| `session.created` | No-op | — |
| `session.ended` | No-op | — |

### Webhook Payload Structure

```json
{
  "type": "user.created",
  "data": {
    "id": "user_xxxxxxxxxxxxxxxx",
    "email_addresses": [{"email_address": "user@example.com"}],
    "first_name": "John",
    "last_name": "Doe",
    "image_url": "https://...",
    "public_metadata": {"role": "user"},
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

### Edge Function: clerk-webhook

```typescript
// Supabase Edge Function: clerk-webhook
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CLERK_WEBHOOK_SECRET = Deno.env.get("CLERK_WEBHOOK_SECRET")!;

serve(async (req) => {
  // Verify webhook signature
  const signature = req.headers.get("svix-signature");
  // ... signature verification ...

  const event = await req.json();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  switch (event.type) {
    case "user.created":
      await supabase.from("profiles").upsert({
        id: event.data.id,
        full_name: `${event.data.first_name || ""} ${event.data.last_name || ""}`.trim(),
        avatar_url: event.data.image_url,
        role: event.data.public_metadata?.role || "user",
      });
      break;

    case "user.updated":
      await supabase.from("profiles").update({
        full_name: `${event.data.first_name || ""} ${event.data.last_name || ""}`.trim(),
        avatar_url: event.data.image_url,
        role: event.data.public_metadata?.role || "user",
      }).eq("id", event.data.id);
      break;

    case "user.deleted":
      // CASCADE will handle related data
      await supabase.from("profiles").delete().eq("id", event.data.id);
      break;
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
```

---

## 7. Route Protection Strategy

### Current State

```
AuthWrapper (src/App.tsx):
  - Checks useAuthStore().user
  - If loading → spinner
  - If no user → still renders children (background profile refresh)
  - Admin check: profileData.role !== 'admin' → redirect to /
```

### Target State: Clerk Middleware

```
Clerk Middleware:
  - Protected routes: /dashboard, /level/*, /lesson/*, /admin/*
  - Public routes: /, /pricing, /api/*
  - Admin routes: /admin, /admin/ai
  - Auth routes: /sign-in, /sign-up
```

### Route Matrix

| Route | Access | Protection | Current | Clerk Target |
|-------|--------|------------|---------|--------------|
| `/` | Public | None | ✅ Public | ✅ Public |
| `/pricing` | Public | None | ✅ Public | ✅ Public |
| `/dashboard` | Authenticated | AuthWrapper | ✅ Auth required | ✅ `authMiddleware` |
| `/level/:id` | Authenticated | AuthWrapper | ✅ Auth required | ✅ `authMiddleware` |
| `/lesson/:id` | Authenticated | AuthWrapper | ✅ Auth required | ✅ `authMiddleware` |
| `/vocab-trainer` | Authenticated | AuthWrapper | ✅ Auth required | ✅ `authMiddleware` |
| `/checkpoint/:id` | Authenticated | AuthWrapper | ✅ Auth required | ✅ `authMiddleware` |
| `/simulasi` | Authenticated | AuthWrapper | ✅ Auth required | ✅ `authMiddleware` |
| `/catatan` | Authenticated | AuthWrapper | ✅ Auth required | ✅ `authMiddleware` |
| `/admin` | Admin | profileData.role check | ✅ Admin only | ✅ `adminMiddleware` |
| `/admin/ai` | Admin | profileData.role check | ✅ Admin only | ✅ `adminMiddleware` |
| `/api/*` | Varies | API middleware | ✅ Existing | ✅ Existing |
| `/sign-in` | Public | None | N/A (new) | ✅ Clerk sign-in |
| `/sign-up` | Public | None | N/A (new) | ✅ Clerk sign-up |

### Frontend Protection

```typescript
// Option 1: Clerk <SignedIn> / <SignedOut> wrappers
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";

function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </>
  );
}

// Option 2: useAuth() hook (matches current pattern)
import { useAuth } from "@clerk/clerk-react";

function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <Loader />;
  if (!isSignedIn) return <Navigate to="/sign-in" />;
  return children;
}
```

---

## 8. Payment & Subscription Impact

### Current Schema

```sql
orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT DEFAULT 'pro',
  status TEXT DEFAULT 'pending',
  amount INTEGER,
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  ...
)

profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription TEXT DEFAULT 'free',
  pro_expires_at TIMESTAMPTZ,
  tier TEXT DEFAULT 'free',
  tier_expiry TIMESTAMPTZ,
  ...
)
```

### Migration Impact

| Component | Impact | Notes |
|-----------|--------|-------|
| `orders.user_id` | 🔴 HIGH | FK references auth.users — must update to mapping table |
| `profiles.subscription` | 🟢 LOW | No auth dependency — data-only |
| `profiles.pro_expires_at` | 🟢 LOW | No auth dependency — data-only |
| Webhook (Bayar.gg) | 🟡 MEDIUM | Uses `user_id` from JWT — must map to internal UUID |
| Payment creation | 🟡 MEDIUM | Frontend sends `userId` — must send internal UUID |

### Webhook Flow Change

```
Current:
  Bayar.gg webhook → /api/payment?action=callback → profiles WHERE user_id = clerk_id

Target:
  Bayar.gg webhook → /api/payment?action=callback → profiles WHERE user_id = internal_uuid
                                                     (resolve via user_identities table)
```

**No fundamental change** — webhook still updates profiles/orders. Only the `user_id` value source changes.

---

## 9. AI Logging Impact

### Current Schema

```sql
ai_usage_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,  -- nullable, no FK constraint
  provider_id TEXT,
  model_id TEXT,
  ...
)

ai_requests (
  -- existing table, similar structure
)
```

### Migration Impact

| Component | Impact | Notes |
|-----------|--------|-------|
| `ai_usage_log.user_id` | 🟢 LOW | No FK constraint — UUID or TEXT both work |
| Analytics continuity | 🟢 LOW | user_id is data, not structural |
| Dashboard queries | 🟢 LOW | Aggregate by provider/model, not user |

**No schema changes needed** — `ai_usage_log.user_id` has no FK constraint. User identity is stored as data, not structural dependency.

---

## 10. Rollback Strategy

### Rollback Scenario

```
Clerk Migration Fails → Disable Clerk → Restore Supabase Auth
```

### Rollback Steps

| Step | Action | Time | Risk |
|------|--------|------|------|
| 1 | Disable Clerk webhook | 1 min | 🟢 NONE |
| 2 | Restore Supabase Auth env vars | 2 min | 🟢 NONE |
| 3 | Deploy previous frontend version | 3 min | 🟢 LOW |
| 4 | Verify Supabase Auth works | 2 min | 🟢 LOW |
| 5 | (Optional) Delete user_identities rows | 5 min | 🟢 NONE |

**Total rollback time: ~13 minutes**

### Rollback Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Data loss | 🟢 NONE | User data unchanged (profiles, orders, progress) |
| Auth failure | 🟡 LOW | Temporary — Supabase Auth is still configured |
| Payment disruption | 🟡 LOW | Bayar.gg webhook still works (user_id unchanged) |
| User lockout | 🟢 NONE | Supabase Auth still active during transition |

### Rollback Prerequisites

- Keep Supabase Auth configuration until Phase 4 validation complete
- Keep `deutschup_session` localStorage format compatible
- Keep profiles table structure unchanged
- Keep all RLS policies functional with both auth providers

---

## 11. Migration Phases

### Phase 1: Coexistence (Week 1-2)

**Goal:** Set up Clerk alongside Supabase Auth without affecting users.

| Task | Duration | Risk |
|------|----------|------|
| Create Clerk project | 1 day | 🟢 NONE |
| Configure Google OAuth in Clerk | 0.5 day | 🟢 NONE |
| Create JWT template for Supabase | 1 day | 🟢 LOW |
| Set up Clerk webhook → Edge Function | 2 days | 🟡 MEDIUM |
| Create `user_identities` table | 0.5 day | 🟢 NONE |
| Deploy Edge Function | 1 day | 🟡 MEDIUM |
| Test webhook locally | 1 day | 🟢 LOW |

**Exit Criteria:**
- Clerk project live
- Webhook creates/updates profiles on Clerk events
- Both auth providers can coexist

### Phase 2: JWT Integration (Week 3-4)

**Goal:** Clerk JWTs work with Supabase RLS.

| Task | Duration | Risk |
|------|----------|------|
| Configure Clerk JWT template | 1 day | 🟢 LOW |
| Create `is_admin()` SQL function | 0.5 day | 🟢 NONE |
| Update admin RLS policies (remove self-reference) | 1 day | 🟡 MEDIUM |
| Test RLS with Clerk JWT | 2 days | 🟡 MEDIUM |
| Update `authMiddleware` to extract Clerk claims | 1 day | 🟡 MEDIUM |

**Exit Criteria:**
- Clerk JWTs pass RLS checks
- `auth.uid()` returns Clerk user ID
- Admin policies work with `is_admin()` function

### Phase 3: Frontend Migration (Week 5-6)

**Goal:** Frontend uses Clerk for auth UI, Supabase for data.

| Task | Duration | Risk |
|------|----------|------|
| Install `@clerk/clerk-react` | 0.5 day | 🟢 NONE |
| Wrap app in `<ClerkProvider>` | 0.5 day | 🟢 NONE |
| Replace Google OAuth with Clerk `<SignIn>` | 1 day | 🟡 MEDIUM |
| Update `useAuthStore` to use Clerk `useAuth()` | 2 days | 🔴 HIGH |
| Update `AuthWrapper` to use Clerk | 1 day | 🟡 MEDIUM |
| Update API calls to use Clerk session token | 2 days | 🔴 HIGH |
| Test all flows end-to-end | 2 days | 🟡 MEDIUM |

**Exit Criteria:**
- Login/logout works via Clerk
- All protected routes work
- Admin panel works
- Payment flow works
- No Supabase Auth references remain in frontend

### Phase 4: Validation (Week 7)

**Goal:** Full validation before removing Supabase Auth.

| Task | Duration | Risk |
|------|----------|------|
| Load testing with Clerk auth | 1 day | 🟢 LOW |
| Security audit of JWT flow | 1 day | 🟡 MEDIUM |
| Verify all RLS policies work | 1 day | 🟡 MEDIUM |
| Verify webhook sync is reliable | 1 day | 🟢 LOW |
| Verify payment flow end-to-end | 1 day | 🟡 MEDIUM |
| Verify admin flow end-to-end | 1 day | 🟢 LOW |

**Exit Criteria:**
- All tests pass
- No auth-related errors in logs
- User data integrity confirmed
- Payment flow verified

### Phase 5: Supabase Auth Removal (Week 8)

**Goal:** Remove Supabase Auth dependency.

| Task | Duration | Risk |
|------|----------|------|
| Remove Supabase Auth env vars | 0.5 day | 🟢 NONE |
| Remove `supabase.auth.*` calls from frontend | 1 day | 🟡 MEDIUM |
| Remove Supabase Auth from `authStore` | 1 day | 🟡 MEDIUM |
| Remove `deutschup_session` localStorage | 0.5 day | 🟢 NONE |
| Final deployment | 0.5 day | 🟡 MEDIUM |
| Monitor for 48 hours | 2 days | 🟢 LOW |

**Exit Criteria:**
- No Supabase Auth code remains
- All auth via Clerk
- No user-reported issues for 48 hours

---

## 12. Final Recommendation

### Option Analysis

| Option | Security | Complexity | Maintenance | Scalability | Total |
|--------|----------|------------|-------------|-------------|-------|
| A. Full Clerk migration | 9/10 | 6/10 | 7/10 | 9/10 | **31/40** |
| B. Hybrid Clerk + Supabase | 8/10 | 7/10 | 6/10 | 7/10 | **28/40** |
| C. Stay on Supabase Auth | 7/10 | 9/10 | 8/10 | 6/10 | **30/40** |

### Recommendation: **A. Full Clerk Migration**

**Rationale:**

1. **Security (9/10):** Clerk provides managed auth infrastructure, MFA, bot detection, session management. Supabase Auth is basic by comparison.

2. **Complexity (6/10):** Migration is complex but well-defined. The `user_identities` mapping table approach minimizes schema changes. 8-week timeline is realistic.

3. **Maintenance (7/10):** Clerk handles auth edge cases (token refresh, session management, OAuth provider updates). Reduces long-term maintenance burden.

4. **Scalability (9/10):** Clerk scales to millions of users. Supabase Auth is adequate but not optimized for auth-heavy workloads.

### Migration Budget

| Phase | Duration | Effort |
|-------|----------|--------|
| Phase 1: Coexistence | 2 weeks | Low |
| Phase 2: JWT Integration | 2 weeks | Medium |
| Phase 3: Frontend Migration | 2 weeks | High |
| Phase 4: Validation | 1 week | Medium |
| Phase 5: Removal | 1 week | Low |

**Total: 8 weeks**

### Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Clerk JWT incompatibility with Supabase RLS | LOW | HIGH | Test Phase 2 before proceeding |
| User data loss during migration | LOW | CRITICAL | `user_identities` mapping preserves all data |
| Payment flow disruption | MEDIUM | HIGH | Keep user_id format; map in webhook |
| Admin access loss | LOW | HIGH | Dual admin check (env + JWT) during transition |
| Rollback needed | MEDIUM | LOW | `user_identities` table enables clean rollback |
| User lockout | LOW | HIGH | Supabase Auth kept as fallback until Phase 5 |

### Critical Path

```
Phase 1 (Webhook) → Phase 2 (JWT) → Phase 3 (Frontend) → Phase 4 (Validation) → Phase 5 (Removal)
     ↓                    ↓                    ↓                    ↓                    ↓
  Clerk project      RLS policies         useAuthStore        End-to-end          No auth
  + webhook          + is_admin()         + API calls          testing             references
```

### Dependencies

- **Clerk project:** Must be created before any work begins
- **Supabase Edge Function:** Must be deployed for webhook
- **JWT template:** Must match Supabase RLS expectations
- **Clerk React SDK:** Must be installed for frontend migration

### Success Criteria

- [ ] All users can login via Clerk
- [ ] All RLS policies work with Clerk JWTs
- [ ] Admin panel accessible only via Clerk admin role
- [ ] Payment flow works end-to-end
- [ ] AI logging continues with correct user identity
- [ ] No data loss during migration
- [ ] Rollback tested and verified
- [ ] 48-hour monitoring period passes

---

## Appendix A: File Impact Summary

| File | Changes Required | Priority |
|------|-----------------|----------|
| `src/stores/authStore.ts` | Replace Supabase Auth with Clerk `useAuth()` | 🔴 CRITICAL |
| `src/App.tsx` | Wrap in `<ClerkProvider>`, update `AuthWrapper` | 🔴 CRITICAL |
| `src/lib/api-utils.ts` | Update `authMiddleware` to extract Clerk claims | 🔴 CRITICAL |
| `src/pages/AdminAI.tsx` | Update auth check to use Clerk JWT | 🟡 MEDIUM |
| `src/pages/Admin.tsx` | Update auth check to use Clerk JWT | 🟡 MEDIUM |
| `src/components/ChatWidget.tsx` | Update session token source | 🟡 MEDIUM |
| `src/components/DebugAuthOverlay.tsx` | Update to use Clerk auth state | 🟢 LOW |
| `api/payment.ts` | Update user_id resolution | 🟡 MEDIUM |
| `api/admin.ts` | Update adminMiddleware | 🟡 MEDIUM |
| `api/admin-ai.ts` | Update authMiddleware | 🟡 MEDIUM |
| `supabase/03_rls.sql` | Add `is_admin()` function, update admin policies | 🔴 CRITICAL |
| `supabase/01_tables.sql` | No changes (profiles.id stays UUID) | 🟢 NONE |

## Appendix B: Environment Variables

### Add

```
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
CLERK_JWT_TEMPLATE_ID=supabase_jwt
```

### Keep (unchanged)

```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_EMAIL=...
VITE_ADMIN_EMAIL=...
BAYAR_GG_API_KEY=...
```

### Remove (Phase 5)

```
SUPABASE_AUTH_ENABLED=true  # no longer needed
```

---

**Document complete. Ready for IMPLEMENTATION-048B.**
