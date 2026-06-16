# DeutschUp — Dual Task Progress Report
**Date:** 2026-06-16 | **Status:** In Progress

---

## TASK 1: AUTH-MIGRATION AUDIT
**Goal:** Migrate DeutschUp from Supabase Auth to full Clerk Auth
**Status:** ✅ AUDIT COMPLETE — No code changes (as requested)

### Affected Files

| # | File | Auth Usage | Risk |
|---|------|-----------|------|
| 1 | `src/stores/authStore.ts` | `supabase.auth.getSession()`, `onAuthStateChange`, `signInWithOAuth`, `signOut` | 🔴 HIGH — Central auth store, 12+ components depend on it |
| 2 | `src/lib/supabase.ts` | `createClient()` with auth config | 🔴 HIGH — Foundation of all Supabase calls |
| 3 | `src/lib/clerk/ClerkProvider.tsx` | `ClerkProvider` wrapper (POC, currently inactive) | 🟡 MEDIUM — Already exists, needs activation |
| 4 | `src/lib/clerk/canary-auth.ts` | `supabase.auth.signInWithOAuth`, `supabase.auth.signOut` | 🟡 MEDIUM — Canary test auth, dual-auth bridge |
| 5 | `src/lib/clerk/identity.ts` | `auth.uid()` fallback | 🟡 MEDIUM — Identity mapping layer |
| 6 | `src/lib/clerk/jwt.ts` | JWT utilities | 🟢 LOW — Utility layer |
| 7 | `src/App.tsx` | `useAuthStore` (AuthWrapper, Layout, LandingPage) | 🔴 HIGH — Routing + UI depends on auth state |
| 8 | `src/components/ChatWidget.tsx` | `supabase.auth.getSession()` for Bearer token | 🟡 MEDIUM — 1 API call site |
| 9 | `src/stores/aiSecretsStore.ts` | `supabase.auth.getSession()` via `authHeaders()` | 🟡 MEDIUM — Admin secrets store |
| 10 | `src/pages/AdminAI.tsx` | `session.access_token` (8 API calls) | 🟡 MEDIUM — Token-dependent |
| 11 | `src/pages/Admin.tsx` | `session.access_token` (5 API calls) | 🟡 MEDIUM — Token-dependent |
| 12 | `src/pages/Pricing.tsx` | `session.access_token` (payment API) | 🟡 MEDIUM — Token-dependent |
| 13 | `src/pages/ClerkTest.tsx` | `session?.access_token` (Clerk test page) | 🟢 LOW — Test page |
| 14 | `src/pages/CanaryDashboard.tsx` | References supabase.auth | 🟢 LOW — Canary test |
| 15 | `src/pages/DebugAuth.tsx` | Debug auth page | 🟢 LOW — Dev only |
| 16 | `src/components/DebugAuthOverlay.tsx` | `supabase.from('profiles')` direct query | 🟢 LOW — Admin only |
| 17 | `src/components/DebugOverlay.tsx` | `useAuthStore` for profile check | 🟢 LOW — Admin only |
| 18 | `lib/api-utils.ts` | `getSupabaseAdminClient().auth.getUser(token)` — server-side JWT verification | 🔴 CRITICAL — All API auth flows through this |
| 19 | `api/admin.ts` | `authMiddleware` (Supabase JWT) | 🟡 MEDIUM |
| 20 | `api/admin-ai.ts` | `authMiddleware` (Supabase JWT) | 🟡 MEDIUM |
| 21 | `api/payment.ts` | `authMiddleware` (Supabase JWT) | 🟡 MEDIUM |
| 22 | `api/ai.ts` | `authMiddleware` (Supabase JWT) | 🟡 MEDIUM |

### Dependency Graph

```
CURRENT:
Frontend (12 components)
  → authStore (Zustand)
    → supabase.auth (getSession, onAuthStateChange, signInWithOAuth, signOut)
      → Supabase Auth (JWT)
        → profiles table (auth.uid() for RLS)

  ChatWidget / AdminAI / Admin / Pricing / aiSecretsStore
    → supabase.auth.getSession() → session.access_token
      → Bearer token → API routes

API Routes (admin, admin-ai, ai, payment)
  → authMiddleware (lib/api-utils.ts)
    → getSupabaseAdminClient().auth.getUser(token)
      → Supabase JWT verification
        → req.user → handler

Database:
  → user_curriculum_progress: auth.uid() = user_id (RLS)
  → ai_usage_log: auth.uid() = user_id (RLS)
  → curriculum_admin_*: auth.uid() + profiles.role = 'admin' (RLS)
```

```
TARGET:
Frontend (12 components)
  → authStore (Zustand, Clerk-backed)
    → Clerk (useAuth, useUser, getToken)
      → Clerk JWT
        → user_identities table (clerk_id → user_id)
          → profiles table

  ChatWidget / AdminAI / Admin / Pricing / aiSecretsStore
    → Clerk.getToken() → Clerk JWT
      → Bearer token → API routes

API Routes (admin, admin-ai, ai, payment)
  → authMiddleware (lib/api-utils.ts)
    → Clerk jwt.verify(token)
      → Clerk JWT verification
        → req.user → handler

Database:
  → user_curriculum_progress: user_id from JWT claims (RLS)
  → ai_usage_log: user_id from JWT claims (RLS)
  → curriculum_admin_*: user_id + profiles.role = 'admin' (RLS)
```

### Blockers

| Blocker | Severity | Description |
|---------|----------|-------------|
| `authStore` is central hub | 🔴 HIGH | 12+ components import `useAuthStore`. Changing user type cascades everywhere |
| `auth.uid()` in RLS policies | 🔴 HIGH | 10+ RLS policies use `auth.uid()`. Must change to JWT claim or helper function |
| `authMiddleware` server-side | 🔴 HIGH | `getSupabaseAdminClient().auth.getUser(token)` validates Supabase JWT. Must swap to Clerk JWT verification |
| `session.access_token` pattern | 🟡 MEDIUM | 15+ API call sites use `session.access_token`. Must change to `Clerk.getToken()` |
| `signInWithOAuth({ provider: 'google' })` | 🟡 MEDIUM | Supabase OAuth flow. Clerk has different API (`signInWithOAuth()` via Clerk) |
| `onAuthStateChange` listener | 🟡 MEDIUM | Zustand store depends on this for session recovery. Clerk uses `useAuth()` hook instead |
| localStorage profile cache | 🟡 MEDIUM | `get().profileData` cached in Zustand + localStorage. Clerk has different session persistence |
| profiles.id = auth.users UUID | 🟡 MEDIUM | Profile PK is Supabase auth UUID. Need mapping strategy (user_identities table) |
| Canary auth dual-path | 🟢 LOW | `canary-auth.ts` already bridges Supabase↔Clerk. Can be extended |
| Dev-only debug overlays | 🟢 LOW | Already admin-gated + localhost-gated. Minimal impact |

### Effort Estimation

| Phase | Scope | Effort | Risk |
|-------|-------|--------|------|
| Phase 1: Debug Overlay | Admin-only Clerk validation UI | 🟢 LOW (2-3 days) | Minimal — isolated, no user impact |
| Phase 2: Dual Auth | Both Supabase + Clerk work simultaneously | 🟡 MEDIUM (1-2 weeks) | Medium — must not break existing auth |
| Phase 3: Clerk Primary | Frontend switches to Clerk as source of truth | 🔴 HIGH (2-3 weeks) | High — all token flows change, RLS policies update |
| Phase 4: Remove Supabase Auth | Clean up all Supabase auth code | 🟡 MEDIUM (3-5 days) | Medium — verify nothing breaks |
| **TOTAL** | | **4-6 weeks** | |

### Migration Risk Summary

| Risk | Impact | Mitigation |
|------|--------|------------|
| RLS policy breakage | 🔴 Users can't read/write data | Phase 3: test all RLS with Clerk JWT before switching |
| Auth state flash | 🟡 Users see login screen briefly | Phase 2: keep Supabase auth as fallback during transition |
| Token expiry mismatch | 🟡 API calls fail silently | Phase 3: test token refresh flow end-to-end |
| Profile mapping missing | 🟡 New Clerk users can't get profile | Phase 2: auto-create user_identities row on first Clerk login |
| OAuth redirect breakage | 🟡 Google login fails | Phase 2: test OAuth redirect URLs with Clerk |

### Implementation Sequence

1. **Phase 1** (Week 1): `DebugAuth` page + Clerk provider activation
2. **Phase 2** (Week 2-3): `canary-auth.ts` dual-path + `authStore` adapter layer
3. **Phase 3** (Week 4-5): `authStore` Clerk rewrite + RLS policy updates + API middleware swap
4. **Phase 4** (Week 6): Remove `supabase.auth.*` calls, clean up dead code

---

## TASK 2: UI-POLISH SPRINT
**Goal:** Raise perceived quality from MVP to production-ready
**Status:** 🔄 ASSESSMENT COMPLETE — Implementation pending

### Current State Assessment

#### TASK A — Landing Page (`src/App.tsx`, 345 lines)

| Issue | Current State | Priority |
|-------|--------------|----------|
| Hero terlalu kosong | Text-heavy, no visual elements, plain white bg | 🔴 HIGH |
| CTA kurang premium | Single "Daftar Sekarang" button, no gradient/animation | 🔴 HIGH |
| Trust signal minim | No social proof, no testimonials, no stats | 🔴 HIGH |
| Visual hierarchy lemah | All sections same weight, no visual flow | 🟡 MEDIUM |

**What exists:**
- Hero with title + subtitle + CTA
- Features section (3 cards: Tutor AI, Koreksi Pintar, Simulasi Ujian)
- Pricing section (Free + Pro)
- CTA section at bottom

**What's missing:**
- Social proof (active learners, lessons completed, AI simulations)
- Gradient/animated hero background
- Secondary CTA
- Better visual hierarchy between sections
- Mobile-first spacing pass

#### TASK B — Dashboard (`src/pages/Dashboard.tsx`, 562 lines)

| Issue | Current State | Priority |
|-------|--------------|----------|
| Spacing tidak konsisten | Mixed px-4/py-6/py-8, no standard system | 🔴 HIGH |
| Cards terlalu mepet | No consistent gap between sections | 🔴 HIGH |
| Visual rhythm kurang | Sections blend together, no clear separation | 🟡 MEDIUM |
| Statistics cards | Using Progress component, but heights vary | 🟡 MEDIUM |
| Bottom navigation | Uses Lucide icons, active state is color-only | 🟡 MEDIUM |

**What exists:**
- Hero card (current lesson + progress)
- Statistics cards (vocab, exercises, study hours, avg score)
- Achievements section
- Level progression
- PDF export button
- Loading states

**What's missing:**
- Standard spacing system (8/12/16/24/32)
- Equal-height stat cards
- Clearer active state on bottom nav
- Floating action overlap prevention
- Safe-area mobile respect

#### TASK C — Debug Overlay (`src/components/DebugOverlay.tsx`, 154 lines)

| Issue | Current State | Priority |
|-------|--------------|----------|
| Admin-only | ✅ `profileData?.role !== 'admin'` check exists | ✅ DONE |
| Hidden for normal users | ✅ Returns null for non-admin | ✅ DONE |
| Never render for non-admin | ✅ Early return before render | ✅ DONE |
| Hostname guard | ⚠️ DebugAuthOverlay has localhost check, DebugOverlay doesn't | 🟡 MEDIUM |

**Current state:**
- `DebugOverlay.tsx`: 154 lines, admin-only via `profileData?.role !== 'admin'`
- `DebugAuthOverlay.tsx`: 67 lines, admin-only + localhost-only
- Both render in fixed position, bottom-right
- DebugOverlay has tabs (All/Errors/Auth), log entries, clear button
- DebugAuthOverlay shows raw profile data

**What's already done:**
- ✅ Admin-only rendering
- ✅ Hidden for normal users
- ✅ Never renders for non-admin accounts

**What could improve:**
- Add hostname guard to DebugOverlay (like DebugAuthOverlay has)
- Better visual separation between the two overlays
- Keyboard shortcut toggle (e.g., Ctrl+Shift+D)

### UI Consistency Report

| Aspect | Current State | Target |
|--------|--------------|--------|
| Spacing system | No standard (mixed 4/6/8/12/16) | 8/12/16/24/32 grid |
| Typography | Tailwind defaults, no scale | Consistent heading/body/caption scale |
| Button styles | Multiple variants (ghost, outline, default) | Unified primary/secondary/ghost |
| Card styles | `rounded-2xl` and `rounded-3xl` mixed | Consistent `rounded-2xl` |
| Colors | Tailwind palette, no design tokens | Consider design tokens for consistency |
| Mobile | Basic responsive, no safe-area | Test 360/390/412px, add safe-area |

### Implementation Priority

| Task | Effort | Impact | Sequence |
|------|--------|--------|----------|
| TASK A: Landing Page Refresh | 🟡 MEDIUM (2-3 days) | 🔴 HIGH (first impression) | 1st |
| TASK B: Dashboard Polish | 🟡 MEDIUM (2-3 days) | 🟡 MEDIUM (daily use) | 2nd |
| TASK C: Debug Overlay | 🟢 LOW (1 day) | 🟢 LOW (admin only) | 3rd |

---

## SUMMARY

| Task | Status | Progress | Next Step |
|------|--------|----------|-----------|
| AUTH-MIGRATION AUDIT | ✅ COMPLETE | 100% | Awaiting user approval to proceed with Phase 1 |
| UI-POLISH SPRINT | 🔄 ASSESSED | 20% (assessment done) | Awaiting user approval to start TASK A |

### Combined Timeline

| Week | AUTH-MIGRATION | UI-POLISH |
|------|---------------|-----------|
| Week 1 | Phase 1: Debug overlay | TASK A: Landing page |
| Week 2-3 | Phase 2: Dual auth | TASK B: Dashboard |
| Week 4-5 | Phase 3: Clerk primary | TASK C: Debug overlay |
| Week 6 | Phase 4: Cleanup | Final polish |

**Recommendation:** Start UI-POLISH TASK A (Landing Page) immediately — it's the first impression and doesn't depend on auth migration. AUTH-MIGRATION can run in parallel starting Week 1.
