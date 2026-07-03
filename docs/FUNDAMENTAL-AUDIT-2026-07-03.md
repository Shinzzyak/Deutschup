# DeutschUp Fundamental Audit — 2026-07-03

Scope: product, UX, frontend architecture, auth, backend APIs, Supabase/RLS, payments, AI routing, deploy/ops, testing.

Context: audit performed after security fixes, Bayar.gg webhook verification, study tracking, and liquid-glass rollout commits through `bc61085`.

## Executive Summary

DeutschUp is now a serious, coherent learning product: Vite/React frontend, Clerk-facing auth, Supabase data layer, Vercel serverless APIs, Bayar.gg payment integration, and DB-driven AI provider routing. The latest liquid-glass pass improved visual polish without adding runtime dependencies.

The strongest parts are:

- Clear learning feature set: curriculum, lessons, vocabulary, verbs, correction, notes, simulation, Goethe exam, chat tutor.
- Good regression-test culture: many regression tests for previous bugs and RLS anti-patterns.
- Payment webhook correctness now follows Bayar.gg official server-side verification pattern.
- RLS public leakage issues were recently fixed and live no-auth tests passed.
- Design direction is more premium after CSS-only liquid glass.

The weakest parts are still architectural seams:

1. Auth model is mixed: Clerk, Supabase auth, `user_identities`, legacy `x-user-email`, and token decoding coexist.
2. Some client code still sends legacy `x-user-email` without Bearer token while newer backend logic requires verified JWT.
3. AI endpoint still supports anonymous requests and trusts `req.body.userTier`.
4. `custom-provider.ts` has a weak admin check pattern: Bearer presence is treated as enough.
5. Debug/canary routes and heavy console logs remain present in production route tree.
6. Local build/lint is avoided due VPS RAM, so Vercel deploy verifies builds; acceptable operationally, but less tight than CI gating.

## Overall Grade

- Product concept: A-
- UX/UI direction: B+ after glass rollout, A- potential with click-level polish
- Frontend architecture: B
- Backend API correctness: B-
- Security posture after recent fixes: B, with a few high-priority remaining issues
- Payments: B+
- AI routing: B conceptually, C+ enforcement
- Data/RLS: B+
- Testing discipline: B+
- Ops/deployment: B

## Critical / High Findings

### F1 — AI endpoint allows anonymous use and trusts `userTier` from request body

Evidence:

- `api/ai.ts` defaults `uid = 'anonymous'` when no valid Bearer token exists.
- It then executes handlers for valid actions.
- It sets `const userTier = (req.body?.userTier as 'free' | 'pro') || 'free';`.

Risk:

- Anyone can call AI actions within IP rate limit without auth.
- Client can set `userTier: 'pro'`, potentially bypassing tier routing/quota behavior if `executeWithRouting` treats pro differently.
- Cost exposure and feature-gating bypass.

Recommendation:

- Require verified user ID for all cost-bearing AI actions.
- Keep only explicitly safe actions public, if any. `list-models` should probably be admin-only or sanitized.
- Derive tier from `profiles.subscription/pro_expires_at`, never from body.
- Add live regression: AI without auth should return 401 for all cost actions.

Priority: P0/P1 depending current public usage intent.

### F2 — `custom-provider.ts` admin guard is weak

Evidence:

- `requireAdmin(req)` only checks Authorization header exists and starts with Bearer.
- Comment says: `We trust the token since it's validated by the client`.
- The API uses service role client and can list/create/update/delete custom providers/models/keys.

Risk:

- If write/list actions call `requireAdmin` inconsistently or only rely on Bearer presence, a non-admin token could manage AI provider config and keys.
- Server must never trust client-side validation for admin operations.

Recommendation:

- Replace local `requireAdmin` with centralized `adminMiddleware` or a shared `requireVerifiedAdmin(req)` helper.
- All list/write/key actions should require server-verified admin role/email.
- Add tests for non-admin Bearer token rejection.

Priority: P0 if endpoint is active in production.

### F3 — Client DB proxy still contains legacy `x-user-email` flow

Evidence:

- `src/lib/supabase.ts` `dbProxy()` sends `x-user-email` and does not include Authorization Bearer token.
- Backend `api/db-proxy.ts` now requires verified Bearer token via `getVerifiedUserId(req)`.
- `authMiddleware` in `lib/api-utils.ts` still allows Clerk flow without token, but `db-proxy.ts` bypasses that middleware and requires token itself.

Risk:

- Authenticated profile/orders/profile update can fail after hardening because client does not pass token.
- Profile cache may hide this temporarily for existing users, creating delayed bugs.

Recommendation:

- Refactor `dbProxy()` to obtain Clerk token via `window.Clerk.session.getToken()` or a React-side token provider, then send `Authorization: Bearer <token>`.
- Remove `x-user-email` from DB proxy request headers.
- Add authenticated browser/E2E test for profile load, profile update, billing history.

Priority: P1 functional correctness.

### F4 — Central `authMiddleware` is permissive by design

Evidence:

- Missing Bearer token: logs `No Bearer token — Clerk user flow` and `next()`.
- Any token starting `eyJ` or length > 100: logs Clerk token detected and `next()` without server verification.
- Supabase failure also `next()`.

Risk:

- Any endpoint that uses only `authMiddleware` and then trusts `req.user` or body/header can be insecure or crash.
- This caused `/api/admin-stats` no-auth 500, fixed in `bc61085`.

Recommendation:

- Split middleware clearly:
  - `optionalAuthMiddleware`
  - `requireSupabaseUser`
  - `requireVerifiedIdentity`
  - `requireAdmin`
- No cost-bearing or admin endpoint should use permissive middleware alone.
- Add lint/test grep rule: endpoints using `authMiddleware` must additionally call verified identity/admin helper before protected work.

Priority: P1.

## Medium Findings

### M1 — Debug/canary routes are mounted in production route tree

Evidence:

- `App.tsx` includes `/clerk-test`, `/debug-auth`, `/admin/canary` lazy routes.
- There are multiple app-start and route console logs.

Risk:

- Not necessarily data-leaking after previous REG-007 fixes, but unnecessary production surface.
- Debug routes can confuse users, search indexing, and attackers.

Recommendation:

- Gate debug/canary routes behind server/DB admin check or remove from production route tree.
- Keep debug tools available only via admin-only page.

Priority: P2.

### M2 — Excess production logging

Evidence:

- `App.tsx`, `main.tsx`, auth/progress/payment/API files log many details.
- Payment create logs raw provider response first 3000 chars and request payload.

Risk:

- Noise in production logs.
- Possible leakage of user email/payment metadata or provider response details.

Recommendation:

- Add `logger.ts` with levels and production redaction.
- Keep full error logs server-side for debugging, but redact emails/tokens/payment payload details.
- Client console logs should be dev/debug only.

Priority: P2.

### M3 — In-memory rate limits are fragile on serverless

Evidence:

- `api/ai.ts` and `api/payment.ts` use module-level `Map` rate limit.

Risk:

- Serverless cold starts/multiple instances reset counters.
- Better than nothing but not reliable for abuse/cost control.

Recommendation:

- Move rate limits to Supabase table/RPC, Upstash Redis, or Vercel KV.
- Rate-limit by verified user ID + IP + action.

Priority: P2, higher if public traffic increases.

### M4 — AI prompt injection / content boundary is basic

Evidence:

- User content interpolated into prompts directly.
- German tutoring domain is low-risk, but arbitrary text goes to providers.

Risk:

- Model behavior can drift, JSON parsing can fail, or malicious prompt can request non-educational output.

Recommendation:

- Add action-specific length limits.
- Add structured system prompts with strict domain constraints.
- Add output repair/fallback for JSON actions.
- Log provider failures with full error server-side, friendly response client-side.

Priority: P2.

### M5 — Package name still generic

Evidence: `package.json` has `"name": "react-example"`.

Risk: low, but signals unfinished product metadata.

Recommendation: rename to `deutschup`.

Priority: P3.

## Product / UX Assessment

Strengths:

- Product covers a complete beginner/intermediate learning loop: lessons, vocab, verbs, AI correction, notes, simulation, Goethe exam, pricing/subscription.
- Liquid-glass system makes the app feel more premium while preserving editorial identity.
- Mobile navigation + desktop sidebar are clear.
- Onboarding exists.

Risks / improvements:

- Need authenticated click-level QA for main flows, not only route-load checks.
- Need measure whether liquid glass hurts readability on cheap Android/mobile browsers.
- Need consistent route naming: code has `/goethe`, recent tests used `/exam`; SPA fallback returns 200 for unknown routes, so route load tests alone can miss wrong route names.
- Need route-specific DOM smoke tests, not just HTTP 200 HTML.

Recommended UX QA checklist:

1. Sign up / sign in / logout.
2. Dashboard loads profile, streak, XP, study time.
3. Start lesson, complete exercise, XP/streak update.
4. Lesson timer writes study session.
5. Vocab trainer save state.
6. Verb trainer interactions.
7. Koreksi AI call.
8. Catatan create/delete/toggle.
9. Simulasi generate/check.
10. Pricing create payment with auth.
11. Billing history loads paid orders.
12. Admin page visible only to admin.
13. Mobile bottom nav no overlap.
14. Desktop sidebar collapse.
15. Search overlay navigation.

## Frontend Architecture

Strengths:

- Lazy-loaded route pages.
- Zustand stores isolate auth/progress/learning state.
- Shared UI primitives now allow broad styling changes safely.
- Good accessibility foundations in `index.css`.

Weak seams:

- Auth/session token acquisition is not centralized enough.
- `dbProxy()` is a plain utility outside React; hard to access Clerk token cleanly.
- Several debug routes/logs remain production-mounted.
- `App.tsx` imports `useEffect` twice (`useEffect`, `useEffect as useEffect2`), with unused alias likely.

Recommendations:

- Create `src/lib/api-client.ts` with `getAuthHeaders()` that supports Clerk token and Supabase session if needed.
- Replace direct fetch header construction across stores/pages.
- Normalize route names and add route constants.
- Gate debug route registration.

## Backend / API Architecture

Strengths:

- Vercel API functions are simple and deploy-friendly.
- DB proxy allowlist reduces arbitrary table exposure.
- Recent hardening stopped trusting body user IDs for payments/db-proxy.
- Payment webhook now verifies status server-side.

Weak seams:

- Auth helpers are duplicated across endpoints.
- Some endpoints use permissive auth middleware; some manually decode JWT.
- `custom-provider.ts` local admin check is unsafe by design.
- Some endpoints reveal different error shapes and debug metadata.

Recommendations:

- Centralize into `lib/auth.ts`:
  - `getVerifiedIdentity(req): { internalId, email, provider } | null`
  - `requireIdentity(req, res)`
  - `requireAdmin(req, res)`
  - `getUserTier(internalId)`
- Ban direct JWT decoding in endpoint files except central helper.
- Ban direct `req.body.userId`, `req.body.email`, `x-user-email` for authorization.

## Supabase / Data / RLS

Strengths:

- Recent live anon checks passed for sensitive tables: `api_keys`, `user_identities`, `study_sessions`.
- C3 `study_sessions.user_id` UUID CHECK constraint is good lightweight hardening.
- Many regression tests exist for RLS anti-patterns.

Risks:

- SQL migration files include old permissive policies, while live DB has been patched. This creates drift: fresh migration replay could reintroduce insecure policies if not consolidated.
- There are many migration files and standalone SQL files; source-of-truth is fragmented.

Recommendations:

- Create a canonical `supabase/migrations/current_hardening.sql` or patch migrations so fresh DB setup includes the fixed policies.
- Add a script/test that queries live `pg_policies` and fails if sensitive tables have `qual = true` or self-referencing policies.
- Document all live hotfix SQLs in migration files, not only memory/docs.

## Payments

Strengths:

- Correct Bayar.gg webhook model now implemented: callback body is not trusted; server calls `check-payment.php` with API key.
- Fake paid callback returns 202, good.
- Create action derives user ID/email from verified token, not body.

Risks:

- `planType` from body controls order plan/subscription. If future premium tiers differ, validate against allowlist and price table server-side.
- Payment logs are verbose.
- Rate limit is memory-only.

Recommendations:

- Server-side plan catalog: `{ pro_monthly: 49000 }`, not arbitrary `planType || 'pro'`.
- Add idempotency: if callback for already paid order arrives, return success without duplicate side effects.
- Redact logs.

## AI System

Strengths:

- DB-driven provider/model routing is flexible.
- Fallback routing exists.
- JSON schemas used for structured features.

Risks:

- Anonymous use and body-supplied tier are the top AI concerns.
- Provider key/admin custom-provider endpoint needs admin hardening.
- JSON parse failures can produce generic errors.

Recommendations:

- Require identity for cost-bearing actions.
- Load tier from DB.
- Add per-action quotas in DB.
- Protect all model/provider/key management endpoints with verified admin helper.

## Testing / QA

Existing positives:

- 24 test files under `src/**/__tests__`.
- Regression tests cover many historical bugs: RLS recursion, API contract drift, debug visibility, migration verification, error handling, PG identifiers, auth race, cache invalidation, deploy cache, imports.

Gaps:

- No recent authenticated browser E2E result in this audit.
- HTTP 200 route checks are insufficient for SPA because unknown client routes return index HTML.
- Local `tsc`/build avoided due RAM, relying on Vercel deploy status.

Recommendations:

- Add Playwright authenticated smoke using saved test account or Clerk test token.
- Assert actual DOM landmarks/text per route.
- CI should run `npm run test` and build on GitHub Actions/Vercel, not VPS.

## Deployment / Ops

Strengths:

- Vercel deploy status and live endpoint checks are used consistently.
- Known Vercel token and project setup documented.
- Avoiding local build on 2GB VPS is wise.

Risks:

- Secret and environment management is split across Vercel/Supabase/local docs.
- Live DB hotfixes can drift from migration source.

Recommendations:

- Add `docs/ops/DEPLOYMENT-RUNBOOK.md`.
- Add `docs/ops/SECURITY-CHECKLIST.md`.
- Add a single regression script under `scripts/regression-live.sh`.

## Recommended Next Patch Plan

### Phase 1 — Auth/API hardening (highest value)

1. Create shared auth helper that verifies Clerk/Supabase token and resolves internal UUID.
2. Update frontend API client to always send Bearer token.
3. Update `dbProxy()` callers to use new auth client.
4. Require verified identity for `/api/ai` cost-bearing actions.
5. Derive tier from DB profile, not body.
6. Replace `custom-provider.ts` `requireAdmin()` with verified admin helper.
7. Add tests for no-auth/non-admin rejection.

### Phase 2 — Production hygiene

1. Gate/remove debug routes in production.
2. Reduce client console logs.
3. Redact payment/API logs.
4. Rename package metadata.

### Phase 3 — Database source-of-truth cleanup

1. Convert live SQL hotfixes into canonical migrations.
2. Add policy audit script/test.
3. Document current policies and expected anon behavior.

### Phase 4 — Product QA / UX polish

1. Authenticated Playwright smoke suite.
2. DOM checks for each route.
3. Mobile visual checks after liquid glass.
4. Review route naming (`/goethe` vs `/exam`) and nav links.

## Final Verdict

DeutschUp is fundamentally viable and has improved a lot: security posture, payments, tracking, and UI polish are all trending up. The next major risk is not design; it is auth consistency. The app should now converge on one server-verified identity path and remove legacy trust paths. Once auth/API hardening is cleaned up, the product foundation becomes much stronger and safer to scale.
