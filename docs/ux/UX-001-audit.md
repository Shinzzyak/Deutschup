# UX-001: Deutschup Information Architecture Audit

**Status:** FINAL  
**Date:** 2026-06-11  
**Author:** Exilio 🧠  
**Focus:** Navigation, Information Architecture, Mobile-First

---

## Executive Summary

Deutschup has 9 features but unclear navigation structure. Users must understand product structure before using features effectively. This audit maps all flows, identifies friction points, and proposes mobile-first navigation redesign.

**Key Findings:**
- 10 pages, 11 components, 9 routes
- Mobile navigation: horizontal scroll (broken)
- No onboarding or feature discovery
- Redundant pricing entry points
- Admin visible to all users

---

## A. Current Navigation Tree

```
Deutschup (App)
├── Public Routes (Unauthenticated)
│   ├── / (Landing Page)
│   └── /pricing (Pricing)
│
└── Private Routes (Authenticated)
    ├── / (Dashboard)
    │   └── DashboardWithPaymentRefresh
    ├── /lesson/:id (LessonView)
    ├── /vocab (VocabTrainer)
    ├── /verbs (VerbTrainer)
    ├── /koreksi (Koreksi)
    ├── /catatan (Catatan)
    ├── /simulasi (Simulasi)
    ├── /pricing (Pricing)
    └── /admin (Admin)
```

### Navigation Structure (Current)

| Level 1 | Level 2 | Level 3 |
|---------|---------|---------|
| Sidebar | Dashboard | Lesson List |
| | | Progress Stats |
| | | Quick Actions |
| | Vocabulary | Word List |
| | | Practice Mode |
| | Verbs | Conjugation Table |
| | | Practice Mode |
| | AI Tools | Koreksi |
| | | Chat Widget |
| | Notes | Note List |
| | | Note Editor |
| | Exam | Simulasi |
| | Pricing | Plan Selection |
| | Admin | User Management |
| | | AI Config |
| | | System Health |

---

## B. Proposed Navigation Tree (Mobile-First)

### Navigation Levels

```
Level 1: Bottom Tab Bar (Mobile) / Sidebar (Desktop)
Level 2: Section Header
Level 3: Content Area
```

### Mobile Bottom Tab Bar

```
[🏠 Home] [📚 Learn] [✍️ Practice] [🤖 AI] [👤 Profile]
```

### Desktop Sidebar

```
┌─────────────────────────────────┐
│  DeutschUp Logo                 │
├─────────────────────────────────┤
│  📊 Dashboard                   │
├─────────────────────────────────┤
│  📚 LEARNING                    │
│  ├── Kurikulum                  │
│  ├── Vocab Trainer              │
│  └── Verb Trainer               │
├─────────────────────────────────┤
│  🤖 AI TOOLS                    │
│  ├── Koreksi Pintar             │
│  └── Catatan Belajar            │
├─────────────────────────────────┤
│  📝 PRACTICE                    │
│  └── Simulasi Ujian             │
├─────────────────────────────────┤
│  ⚙️ ACCOUNT                     │
│  ├── Pricing                    │
│  └── Admin Panel (if admin)     │
├─────────────────────────────────┤
│  [Streak] [XP]                  │
│  [Avatar] [Logout]              │
└─────────────────────────────────┘
```

---

## C. Feature Flow Analysis

### 1. Dashboard Flow

| Aspect | Current | Issue |
|--------|---------|-------|
| User Goal | See progress, continue learning | Too many options, unclear priority |
| Entry Point | Login → / | Only entry point |
| Exit Point | Any navigation link | No clear "next action" |
| Navigation Dependencies | None | — |
| Dead Ends | None | — |
| Redundant Navigation | Pricing link in sidebar | Also available in public routes |
| Cognitive Load | Medium | 6+ items in sidebar |
| Mobile Usability | ⚠️ Horizontal scroll | Icons overflow |
| Desktop Usability | ✅ Functional | Clear sidebar |

**Recommendation:** Simplify to 3 key actions:
1. Continue Lesson (most recent)
2. Daily Practice (vocab/verbs)
3. AI Tools (if Pro)

---

### 2. Lesson Flow

| Aspect | Current | Issue |
|--------|---------|-------|
| User Goal | Complete a lesson | Clear but no guidance |
| Entry Point | Dashboard → Click lesson | Direct |
| Exit Point | Back button or sidebar | No completion trigger |
| Navigation Dependencies | Dashboard → Lesson | Linear |
| Dead Ends | After lesson completion | No "next lesson" prompt |
| Redundant Navigation | None | — |
| Cognitive Load | Low | Single focus |
| Mobile Usability | ✅ Good | Content-focused |
| Desktop Usability | ✅ Good | Wide content area |

**Recommendation:** Add "Next Lesson" button after completion.

---

### 3. Vocabulary Flow

| Aspect | Current | Issue |
|--------|---------|-------|
| User Goal | Practice vocabulary | Clear |
| Entry Point | Sidebar → Vocab Trainer | Direct |
| Exit Point | Back to dashboard | No clear exit |
| Navigation Dependencies | None | — |
| Dead Ends | After practice session | No summary |
| Redundant Navigation | None | — |
| Cognitive Load | Medium | Multiple practice modes |
| Mobile Usability | ⚠️ Touch targets | May be small |
| Desktop Usability | ✅ Good | Clear layout |

**Recommendation:** Add session summary after practice.

---

### 4. Verb Trainer Flow

| Aspect | Current | Issue |
|--------|---------|-------|
| User Goal | Practice verb conjugation | Clear |
| Entry Point | Sidebar → Verb Trainer | Direct |
| Exit Point | Back to dashboard | No clear exit |
| Navigation Dependencies | None | — |
| Dead Ends | After practice session | No summary |
| Redundant Navigation | None | — |
| Cognitive Load | Medium | Conjugation tables complex |
| Mobile Usability | ⚠️ Tables may overflow | Horizontal scroll |
| Desktop Usability | ✅ Good | Wide tables fit |

**Recommendation:** Simplify table display on mobile.

---

### 5. Koreksi Flow

| Aspect | Current | Issue |
|--------|---------|-------|
| User Goal | Get writing corrected | Clear |
| Entry Point | Sidebar → Koreksi Pintar | Pro only |
| Exit Point | Back to dashboard | No clear exit |
| Navigation Dependencies | None | — |
| Dead Ends | After correction | No save/export |
| Redundant Navigation | None | — |
| Cognitive Load | Low | Single action |
| Mobile Usability | ✅ Good | Text input focused |
| Desktop Usability | ✅ Good | Wide text area |

**Recommendation:** Add save/export for corrections.

---

### 6. Simulasi Flow

| Aspect | Current | Issue |
|--------|---------|-------|
| User Goal | Take practice exam | Clear |
| Entry Point | Sidebar → Simulasi Ujian | Direct |
| Exit Point | Back to dashboard | No clear exit |
| Navigation Dependencies | None | — |
| Dead Ends | After exam | No results summary |
| Redundant Navigation | None | — |
| Cognitive Load | High | Exam format complex |
| Mobile Usability | ⚠️ Exam may be long | Scrolling |
| Desktop Usability | ✅ Good | Full exam view |

**Recommendation:** Add progress indicator during exam.

---

### 7. Pricing Flow

| Aspect | Current | Issue |
|--------|---------|-------|
| User Goal | Subscribe to Pro | Clear |
| Entry Point | Sidebar → Pricing (2 places) | Redundant |
| Exit Point | Payment redirect | External |
| Navigation Dependencies | None | — |
| Dead Ends | After payment | Unclear success state |
| Redundant Navigation | ⚠️ Sidebar + Public routes | Two entry points |
| Cognitive Load | Low | Single choice |
| Mobile Usability | ✅ Good | Card layout |
| Desktop Usability | ✅ Good | Wide cards |

**Recommendation:** Remove sidebar pricing link for logged-in users.

---

### 8. Admin Flow

| Aspect | Current | Issue |
|--------|---------|-------|
| User Goal | Manage users, config | Clear |
| Entry Point | Sidebar → Admin Panel | Visible to all |
| Exit Point | Back to dashboard | No clear exit |
| Navigation Dependencies | None | — |
| Dead Ends | None | — |
| Redundant Navigation | None | — |
| Cognitive Load | High | Multiple tabs |
| Mobile Usability | ⚠️ Tables may overflow | Horizontal scroll |
| Desktop Usability | ✅ Good | Wide tables |

**Recommendation:** Hide Admin link for non-admin users.

---

## D. User Journey Mapping

### Guest User (First Session)

```
1. Visit homepage
2. View landing page (unclear value prop)
3. Click "Masuk" (Login)
4. Google OAuth redirect
5. Dashboard loads (no onboarding)
6. Confused about features
7. May leave immediately
```

**Friction Points:**
- No clear value proposition before login
- No onboarding after first login
- Too many features, no guidance

---

### Free User (Returning Session)

```
1. Login
2. Dashboard loads
3. See progress (streak, XP)
4. Click lesson
5. Complete lesson
6. Return to dashboard
7. Repeat
```

**Friction Points:**
- No feature discovery
- Pro features not highlighted
- No learning path guidance

---

### Pro User (Daily Session)

```
1. Login
2. Dashboard loads
3. Check streak/XP
4. Continue lesson OR
5. Use AI tools (Koreksi, Chat)
6. Practice vocab/verbs
7. Take exam simulation
8. Return to dashboard
```

**Friction Points:**
- Pro features mixed with free
- No Pro-specific dashboard
- AI tools not prominently placed

---

### Admin User (Management Session)

```
1. Login
2. Click Admin Panel
3. View dashboard
4. Manage users
5. Update config
6. Check system health
7. Return to dashboard
```

**Friction Points:**
- Admin link visible to all users
- No admin-specific quick actions
- No audit trail

---

## E. Dashboard Redesign Proposal

### Content Hierarchy (Current → Proposed)

**Current:**
1. Streak/XP Stats
2. Sidebar Navigation
3. Main Content Area

**Proposed:**
1. Welcome Back + Streak
2. Continue Learning (Most Recent)
3. Daily Practice (Quick Actions)
4. Pro Features (If Pro)
5. Progress Overview

### Section Ordering

| Order | Section | Priority |
|-------|---------|----------|
| 1 | Welcome + Streak | High |
| 2 | Continue Lesson | High |
| 3 | Quick Practice | High |
| 4 | AI Tools (Pro) | Medium |
| 5 | Progress Stats | Low |

### Navigation Simplification

**Remove:**
- Pricing link from sidebar (for logged-in users)
- Duplicate Dashboard components

**Add:**
- "Next Lesson" recommendation
- "Daily Goal" progress
- Quick practice buttons

---

## F. Design System Foundation

### Typography Scale

| Level | Size | Weight | Use Case |
|-------|------|--------|----------|
| H1 | 30px | Bold | Page titles |
| H2 | 24px | Semibold | Section headers |
| H3 | 20px | Medium | Subsection headers |
| Body | 16px | Regular | Main content |
| Small | 14px | Regular | Secondary text |
| Caption | 12px | Regular | Labels, timestamps |

### Spacing Scale

| Token | Value | Use Case |
|-------|-------|----------|
| xs | 4px | Tight spacing |
| sm | 8px | Small gaps |
| md | 16px | Standard gaps |
| lg | 24px | Section spacing |
| xl | 32px | Large sections |
| 2xl | 48px | Page margins |

### Card System

| Type | Use Case | Structure |
|------|----------|-----------|
| Dashboard Card | Stats, progress | Header + Body + Footer |
| Lesson Card | Course items | Title + Progress + Action |
| Feature Card | AI tools, practice | Icon + Title + Description |
| Pricing Card | Subscription plans | Price + Features + CTA |

### Button System

| Type | Use Case | Structure |
|------|----------|-----------|
| Primary | Main actions | Label + Icon (optional) |
| Secondary | Supporting actions | Label |
| Ghost | Tertiary actions | Label |
| Icon | Compact actions | Icon only |
| FAB | Mobile primary | Icon (floating) |

### Badge System

| Type | Use Case | Structure |
|------|----------|-----------|
| Status | Online/offline | Dot + Label |
| Count | Notifications | Number |
| Label | Pro/Free | Text |
| Progress | Completion % | Bar + Number |

### Alert System

| Type | Use Case | Structure |
|------|----------|-----------|
| Info | General info | Icon + Message |
| Success | Completion | Icon + Message |
| Warning | Caution | Icon + Message |
| Error | Failure | Icon + Message |

### Table System

| Type | Use Case | Structure |
|------|----------|-----------|
| Data Table | Admin users | Headers + Rows + Pagination |
| List Table | Notes, lessons | Rows + Actions |
| Compact Table | Stats | Headers + Values |

---

## G. UX Backlog

### UX-P0 (Critical)

| Item | Impact | Complexity | Notes |
|------|--------|------------|-------|
| Fix mobile horizontal scroll | High | Low | Sidebar overflow |
| Add bottom navigation bar | High | Medium | Mobile primary nav |
| Increase touch targets (48px) | High | Low | Accessibility |
| Hide Admin link for non-admin | Medium | Low | Security |

### UX-P1 (Important)

| Item | Impact | Complexity | Notes |
|------|--------|------------|-------|
| Add breadcrumbs | Medium | Low | Location awareness |
| Add onboarding tutorial | High | High | First-time users |
| Simplify mobile menu | Medium | Medium | Reduce cognitive load |
| Add "Next Lesson" prompt | Medium | Low | Learning flow |
| Add session summary | Medium | Low | Practice completion |

### UX-P2 (Nice to Have)

| Item | Impact | Complexity | Notes |
|------|--------|------------|-------|
| Remove duplicate Dashboard | Low | Low | Code cleanup |
| Add back button | Medium | Low | Navigation |
| Improve payment success flow | Medium | Medium | Conversion |
| Add Pro-specific dashboard | Medium | High | Pro retention |
| Add admin audit trail | Low | High | Compliance |

---

## H. Navigation Lessons Learned

### Patterns to Keep

| Pattern | Why |
|---------|-----|
| Sidebar navigation (desktop) | Clear, always visible |
| Lazy loading pages | Performance |
| Animated route transitions | Smooth UX |

### Patterns to Fix

| Pattern | Why | Fix |
|---------|-----|-----|
| Horizontal scroll on mobile | Broken UX | Bottom tab bar |
| No onboarding | High churn | Add tutorial |
| Redundant pricing entry | Confusion | Single entry point |
| Admin visible to all | Security/confusion | Role-based visibility |

### Anti-Patterns to Avoid

| Anti-Pattern | Risk |
|--------------|------|
| Too many navigation options | Cognitive overload |
| No clear "next action" | User confusion |
| External payment redirects | Conversion loss |
| No feature discovery | Underutilization |

---

## I. Implementation Roadmap

### Phase 1: Navigation Fix (Week 1)

- [ ] Add bottom navigation bar (mobile)
- [ ] Fix horizontal scroll
- [ ] Increase touch targets
- [ ] Hide Admin for non-admin

### Phase 2: Onboarding (Week 2)

- [ ] Add first-time tutorial
- [ ] Add feature tooltips
- [ ] Add "Continue Learning" prompt

### Phase 3: Dashboard Simplification (Week 3)

- [ ] Remove duplicate components
- [ ] Add content hierarchy
- [ ] Add quick actions

### Phase 4: Design System (Week 4)

- [ ] Document typography scale
- [ ] Document spacing scale
- [ ] Document component patterns

---

*Document generated by Exilio 🧠 — 2026-06-11*
