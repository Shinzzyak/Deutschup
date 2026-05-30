# Plan: Migration to Supabase & Security Hardening

**Goal:** Migrate the entire authentication and database layer from Firebase to Supabase and fix critical security vulnerabilities.

## 🎯 Objectives
1. Replace all Firebase dependencies with Supabase.
2. Implement a robust, backend-verified Admin system.
3. Hardened API endpoints with mandatory Auth/Admin middleware.
4. Ensure zero "infinite loading" on login redirect.

## 🛠️ Technical Specs
- **Auth:** `firebase/auth` $\rightarrow$ `@supabase/supabase-js`
- **Database:** `firebase/firestore` $\rightarrow$ Supabase (PostgreSQL)
- **Admin Check:** Hardcoded email $\rightarrow$ Database Role/Metadata check.
- **Middleware:** Implement JWT verification on all `/api/*` routes.

## 📋 Task Breakdown

### Phase 1: Foundation & Auth Migration
- [ ] **Task 1.1: Infrastructure Setup**
    - Install `@supabase/supabase-js`.
    - Create `src/lib/supabase.ts` for the Supabase client.
    - Update `.env.example` with `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
- [ ] **Task 1.2: `authStore.ts` Rewrite**
    - Replace `onAuthStateChanged` with `supabase.auth.onAuthStateChange`.
    - Replace `signInWithPopup` with `supabase.auth.signInWithOAuth`.
    - Migrate tier data fetching from Firestore $\rightarrow$ Supabase `profiles` table.
- [ ] **Task 1.3: Frontend Auth Integration**
    - Update any remaining Firebase Auth calls in components.

### Phase 2: Database Migration (Firestore $\rightarrow$ Postgres)
- [ ] **Task 2.1: Schema Mapping**
    - Map Firestore collections (`users`, `config/global`, etc.) to Postgres tables.
- [ ] **Task 2.2: Data Access Layer Rewrite**
    - Replace all `getDoc`, `setDoc`, `collection` calls with Supabase `.from().select().insert()`.

### Phase 3: Security Hardening (The Shield)
- [ ] **Task 3.1: Backend Auth Middleware**
    - Implement a robust JWT validator in `api/` using Supabase's admin client.
    - Ensure every sensitive endpoint checks for a valid session.
- [ ] **Task 3.2: Admin Role Governance**
    - Implement a `checkAdmin` middleware.
    - Remove hardcoded `VITE_ADMIN_EMAIL` checks in favor of database-backed roles.
- [ ] **Task 3.3: AI Endpoint Guarding**
    - Implement rate-limiting and payload validation for Gemini API calls.

### Phase 4: Final Verification & Cleanup
- [ ] **Task 4.1: End-to-End Login Test**
    - Verify "Select Account" $\rightarrow$ Redirect $\rightarrow$ Dashboard flow (No infinite loading).
- [ ] **Task 4.2: Security Audit**
    - Attempt to access admin endpoints without a token.
- [ ] **Task 4.3: Dead Code Removal**
    - Uninstall `firebase` and `firebase-admin` packages.
    - Remove all leftover Firebase imports.

---
**Review Process:**
Every task must be: `Implemented` $\rightarrow$ `Spec Reviewed` $\rightarrow$ `Quality Approved`.
