# Deutschup Learnings

## 2026-06-26 — Testing Pipeline (Phase 1-7)
- **Outcome:** ✅ SUCCESS — 227 tests, 51 E2E, all passing
- **What worked:**
  - Vitest setup: zero config, fast (~45s for 184 unit tests)
  - Regression tests as documentation of known bugs (REG-005 to REG-015)
  - E2E cleanup: 48 ad-hoc specs → 6 structured suites
  - Shared auth helper (`tests/helpers/auth.ts`) — loginAs(), skipOnboarding()
  - Security header tests catch config drift
- **What failed:**
  - `apply_patch` tool format error — use `write` tool instead for new files
  - Password `AyamAyam` rejected by Clerk (HaveIBeenPwned)
  - E2E tests without login helper → all auth-dependent tests skipped
  - `localStorage` `Object.keys()` not reliable in jsdom — use manual invalidation
- **Next time:**
  - Setup test credentials FIRST before writing auth-dependent tests
  - Use `write` instead of `apply_patch` for new files
  - Break large test runs into batches on 2GB VPS

## 2026-06-26 — Vercel Edge Cache
- **Outcome:** ⚠️ ONGOING — stale chunks served even after READY+PROMOTED
- **What worked:**
  - CLI deploy (`vercel --prod`) forces fresh build
  - TypeScript fix (`model_id` in ModelConfig) resolved build errors
- **What failed:**
  - Vercel CDN cache not invalidated by git-triggered deploys
  - `out/` directory only had `api/` lambdas, no static files
  - `index.html` ETag unchanged across deploys
- **Next time:**
  - Check `out/` contents via Vercel API files endpoint
  - Force CLI deploy for cache invalidation
  - Verify chunk hashes in production vs local build

## 2026-06-26 — E2E Test Patterns
- **Pattern:** Clerk login flow requires `waitForTimeout` — Clerk loads async
- **Pattern:** Onboarding skip needed for returning users — check `Selamat Datang`
- **Pattern:** SPA routes always return 200 (server rewrite) — test client-side routing
- **Pattern:** Use `page.on('response')` for network monitoring (404s, size, redirects)
- **Pattern:** Security tests use `request` fixture (no browser needed) — faster

## 2026-06-27 — Landing Page "Deutsche Präzision"
- **Outcome:** ✅ SUCCESS — User: "Anjayyy bagus bet cok"
- **What worked:**
  - Editorial Brutalist direction (serif headlines, sharp edges, flat surfaces)
  - DM Serif Display font for editorial feel
  - Black/cream/amber/red palette (NOT purple/blue gradients)
  - Asymmetric 12-col grid (NOT centered symmetric)
  - Grid texture background (NOT glass/blur)
  - German flag as vertical stripe (NOT horizontal bar)
  - `rounded-none` everywhere (NOT rounded-3xl)
  - Numbered feature list (NOT bento grid)
- **What failed (before):**
  - Glassmorphism + purple gradients = "AI slop"
  - Floating glass cards with ambient glow = generic
  - Sparkles badge + gradient text = overused AI pattern
- **Key insight:** "AI slop" = generic modern patterns. "Editorial" = intentional typography, sharp edges, flat surfaces. Difference is INTENTIONALITY.
