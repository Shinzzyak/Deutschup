# Deutschup Testing Roadmap

## Current State (2026-06-26)

| Layer | Status | Coverage |
|-------|--------|----------|
| Unit Tests | ✅ Done | 42 tests, 7 files |
| Integration Tests | ✅ Done | 67 tests, 6 files |
| Regression Tests | ✅ Done | 75 tests, 11 files |
| E2E Tests | ✅ Done | 43 tests, 9 suites |
| UAT | ✅ Done | 10 smoke tests |
| Performance Tests | ✅ Done | 7 load/resource tests |
| Penetration Tests | ✅ Done | 19 security tests |

**Existing infra:** Playwright configured (`playwright.config.ts`), targeting production URL.
**Problem:** 48 test files are mostly debug/diagnostic scripts, not structured test suites.

---

## Phase 1: Unit Tests (Week 1-2)

**Tool:** Vitest (fast, Vite-native, zero config)

**What to test:**

### Stores (Business Logic)
- `authStore.ts` — auth state, session handling, login/logout
- `progressStore.ts` — lesson progress tracking, localStorage sync
- `learningStore.ts` — learning data persistence
- `aiSecretsStore.ts` — secret management
- `debugStore.ts` — debug state

### Lib (Utilities)
- `lib/subscription.ts` — isUserPro(), expiry checks
- `lib/supabase.ts` — client initialization, query helpers
- `lib/utils.ts` — formatting, validation
- `lib/clerk/identity.ts` — resolveInternalId(), Clerk→Supabase mapping

### Components (Isolated)
- Button, Card, Input — render + click handlers
- ErrorBoundary — catches errors, shows fallback
- SkeletonPatterns — loading states

### Data
- `data/lessonIndex.ts` — lesson structure integrity
- `data/vocabulary.ts` — vocab data completeness
- `data/verbs.ts` — verb conjugation data

**Target:** 80%+ coverage on stores + lib

---

## Phase 2: Integration Tests (Week 2-3)

**Tool:** Vitest + MSW (Mock Service Worker) for API mocking

**What to test:**

### API Endpoints
- `api/ai.ts` — AI chat routing, provider fallback
- `api/payment.ts` — payment creation, webhook handling
- `api/admin.ts` — admin actions, auth guards
- `api/ping.ts` — health check

### Store + Supabase Integration
- Auth flow: signUp → profile creation → session
- Progress: save → load → sync across devices
- Payment: create order → webhook → subscription update

### Component + Store Integration
- Dashboard: loads progress, displays stats
- Pricing: shows plans, handles subscription
- Simulasi: loads questions, submits answers

**Target:** All API endpoints covered, critical flows tested

---

## Phase 3: Regression Tests (Week 3-4)

**Tool:** Vitest (snapshot + assertion-based)

**What to test:**

### Known Bug Patterns (from MEMORY.md)
- REG-005: RLS recursive policy — verify no self-referencing policies
- REG-006: API contract mismatch — verify frontend/backend action alignment
- REG-007: Debug visibility — verify debug components hidden in production
- REG-008: Migration verification — verify all tables exist after migration
- REG-009: Error handling — verify full error logging
- REG-010: Case-sensitive identifiers — verify double-quote usage

### Auth Edge Cases
- Clerk → Supabase UUID mapping
- Session expiry handling
- Password reset flow
- Onboarding completion

### Payment Edge Cases
- Expired subscription detection
- Webhook idempotency
- QRIS payment timeout

**Target:** All known regressions have automated checks

---

## Phase 4: E2E Tests (Week 4-5)

**Tool:** Playwright (already configured)

**Cleanup:** Consolidate 48 ad-hoc specs → structured suites

### Critical User Journeys
1. **Landing → SignUp → Onboarding → Dashboard**
2. **Dashboard → Level → Lesson → Complete**
3. **Dashboard → Simulasi → Submit → Results**
4. **Dashboard → Vocab → Practice → Save Progress**
5. **Profile → Upgrade → Payment → Pro Active**
6. **Admin → Users → AI Config → Secrets**

### Cross-Platform
- Mobile viewport (375x666)
- Desktop viewport (1280x720)
- Touch interactions

### Error Scenarios
- Network offline → graceful degradation
- Invalid auth → redirect to login
- API timeout → retry mechanism

**Target:** 6 critical journeys automated, run on every deploy

---

## Phase 5: UAT (Week 5-6)

**Process:** Manual + Automated checklist

### UAT Checklist Template
```markdown
## Feature: [Name]
- [ ] Happy path works
- [ ] Error states handled
- [ ] Mobile responsive
- [ ] Accessible (keyboard, screen reader)
- [ ] Performance acceptable (<3s load)
- [ ] Data persists correctly
- [ ] Auth boundaries respected
```

### Features for UAT
- [ ] Auth (sign up, sign in, sign out, password reset)
- [ ] Onboarding (new user flow)
- [ ] Lessons (browsing, viewing, completing)
- [ ] Simulasi (starting, answering, submitting)
- [ ] Vocab (listing, practicing, progress)
- [ ] AI Chat (sending, receiving, error handling)
- [ ] Payment (upgrade, checkout, confirmation)
- [ ] Admin (user management, AI config)
- [ ] Profile (settings, subscription, export)

---

## Phase 6: Performance Tests (Week 6-7)

**Tool:** Lighthouse CI + custom scripts

### Metrics
- **LCP** (Largest Contentful Paint) < 2.5s
- **FID** (First Input Delay) < 100ms
- **CLS** (Cumulative Layout Shift) < 0.1
- **TTFB** (Time to First Byte) < 800ms
- **Bundle size** < 500KB gzipped

### Load Testing
- 100 concurrent users on `/simulasi`
- API endpoint throughput (req/s)
- Supabase query latency under load

### Resource Monitoring
- VPS memory usage (2GB constraint)
- Lambda cold start times
- Database connection pooling

---

## Phase 7: Penetration Tests (Week 7-8)

**Tool:** OWASP ZAP + manual checklist

### Security Checklist
- [ ] **Auth:** Clerk token validation, session hijacking
- [ ] **RLS:** No data leakage between users
- [ ] **API:** Rate limiting, input validation, SQL injection
- [ ] **XSS:** DOM sanitization, CSP headers
- [ ] **CSRF:** Token validation on state-changing requests
- [ ] **Secrets:** No exposed keys in client bundle
- [ ] **HTTPS:** All endpoints, HSTS enabled
- [ ] **Headers:** X-Frame-Options, X-Content-Type-Options, CSP

### Specific Concerns
- Service key exposed in frontend (known issue)
- Clerk ↔ Supabase auth boundary
- Payment webhook signature verification
- Admin endpoint access control

---

## Implementation Order

```
Phase 1 (Unit) ──→ Phase 2 (Integration) ──→ Phase 3 (Regression)
                                                      │
Phase 7 (PenTest) ←── Phase 6 (Perf) ←── Phase 5 (UAT) ←── Phase 4 (E2E)
```

**Parallel track:** Phases 1-3 can run alongside active development.
**Gate:** Phase 4-7 are release gates — must pass before production deploy.

---

## Tooling Setup

### Phase 1-3: Vitest
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### Phase 4: Playwright (already installed)
```bash
npx playwright install chromium
```

### Phase 6: Lighthouse CI
```bash
npm install -D @lhci/cli
```

### Phase 7: OWASP ZAP
```bash
docker run -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t https://deutschup.sintec.my.id
```

---

## CI/CD Integration

### GitHub Actions (recommended)
```yaml
name: Test Pipeline
on: [push, pull_request]
jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:unit
  integration:
    runs-on: ubuntu-latest
    needs: unit
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:integration
  e2e:
    runs-on: ubuntu-latest
    needs: integration
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install chromium
      - run: npm run test:e2e
```

### Vercel Integration
- Run unit + integration on every push
- Run E2E on production deploy
- Block promotion if tests fail

---

## Success Criteria

| Phase | Pass Criteria |
|-------|--------------|
| Unit | 80%+ coverage on stores/lib, all pass |
| Integration | All API endpoints covered, critical flows pass |
| Regression | All known bugs have automated checks |
| E2E | 6 critical journeys pass on mobile + desktop |
| UAT | All features checklist complete |
| Performance | Core Web Vitals green, <3s load |
| PenTest | No critical/high vulnerabilities |

---

*Created: 2026-06-26*
*Updated: 2026-06-26*
*Status: **ALL PHASES COMPLETE** ✅*
*Total: 227 tests (184 unit/integration/regression + 43 E2E)*
