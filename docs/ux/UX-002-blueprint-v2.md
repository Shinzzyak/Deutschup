# UX-002: Curriculum-First Architecture — Final Blueprint v2

**Status:** APPROVED  
**Date:** 2026-06-11  
**Author:** Exilio 🧠  
**Focus:** Lesson-first progression, mobile learning sessions, 5–15 minute sessions

---

## Executive Summary

Academic structure replaced with **Lesson-First Model**. Kapitel contains Lessons, Lessons contain Learn → Practice → Complete flow. Dashboard optimized for immediate action. Mobile sessions designed for 5–15 minute learning.

---

## A. Lesson-First Model

### Current (Academic)

```
Kapitel
├── Einführung
├── Wortschatz
├── Grammatik
├── Hören
├── Lesen
├── Schreiben
├── Sprechen
├── Training
└── Test
```

**Problem:** Too many layers, feels like textbook.

### Proposed (Lesson-First)

```
Kapitel
├── Lesson 1
├── Lesson 2
├── Lesson 3
├── Lesson 4
├── Kapitel Training
└── Kapitel Test

Lesson
├── 📖 Learn (content)
├── 💪 Practice (exercises)
└── ✅ Complete (mark done)
```

**Wortschatz, Grammatik, Hören, etc. become lesson CONTENT, not navigation.**

### Lesson Structure

```
Lesson: "Artikel: Der, Die, Das"
├── 📖 Learn
│   ├── Read explanation (2 min)
│   ├── Listen to pronunciation (1 min)
│   └── See examples (1 min)
├── 💪 Practice
│   ├── Fill-in-the-blank (2 min)
│   ├── Multiple choice (2 min)
│   └── Matching exercise (2 min)
└── ✅ Complete
    ├── Score check
    ├── XP awarded
    └── Next lesson prompt
```

**Total:** 10–12 minutes per lesson

---

## B. Dashboard Priority Review

### Current Hierarchy

| Section | Allocation | Issue |
|---------|------------|-------|
| Stats (Streak/XP) | 30% | Too prominent |
| Sidebar | 30% | Too many options |
| Main content | 40% | Unclear priority |

### Proposed Hierarchy

| Section | Allocation | Purpose |
|---------|------------|---------|
| **Continue Learning** | 60% | Primary action |
| **Today's Task** | 20% | Daily goal |
| **Progress** | 15% | Motivation |
| **Everything Else** | 5% | Supporting tools |

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│  Willkommen zurück! 🔥 Streak: 12 hari                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📍 LANJUTKAN BELAJAR (60%)                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │  A1 → Kapitel 3 → Lesson 2                      │   │
│  │  "Artikel: Der, Die, Das"                       │   │
│  │                                                 │   │
│  │  [Lanjutkan Belajar →]                           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  🎯 TUGAS HARI INI (20%)                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ✅ Selesaikan Lesson 3                          │   │
│  │  ○  Latihan Vocab (10 menit)                     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  📊 PROGRESS (15%)                                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │  A1: ████░░░░░░ 45% (Kapitel 3/7)               │   │
│  │  XP: 1,850  |  Level: 3                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  🛠️ ALAT (5%)                                          │
│  [Vocab] [Verbs] [Catatan]                             │
│                                                         │
│  [🏠] [📚] [✍️] [🤖] [👤]                            │
└─────────────────────────────────────────────────────────┘
```

### Allocation Justification

| Section | % | Why |
|---------|---|-----|
| Continue Learning | 60% | Primary action, reduce decision paralysis |
| Today's Task | 20% | Daily motivation, clear goal |
| Progress | 15% | Motivation without distraction |
| Everything Else | 5% | Supporting, not competing |

---

## C. Simulasi Repositioning

### Current State

```
Kapitel Completion
    ↓
Simulasi Menu (standalone)
    ↓
Simulasi (separate feature)
```

**Problem:** Disconnected from curriculum flow.

### Proposed State

```
Kapitel Completion
    ↓
Kapitel Test (mandatory)
    ↓
Score ≥ 70%? → Next Kapitel
Score < 70% → Review + Retry
```

### Simulasi Integration

| Current | Proposed | Reason |
|---------|----------|--------|
| Standalone feature | After Kapitel Test | Curriculum alignment |
| Optional | Mandatory checkpoint | Ensures mastery |
| Separate menu | Part of kapitel flow | Reduces navigation |

### Motivation Psychology

| Element | Effect |
|---------|--------|
| Mandatory test | Ensures completion |
| Score requirement | Mastery-based progression |
| Immediate feedback | Learning reinforcement |
| Next kapitel unlock | Reward for completion |

---

## D. Mobile Session Design

### 5-Minute Session

```
Activity: Quick Vocab Review
├── Review 10 words (3 min)
├── Quick quiz (2 min)
└── Done!
```

**Use Case:** Waiting in line, quick break

### 10-Minute Session

```
Activity: Complete One Lesson
├── Learn content (4 min)
├── Practice exercises (4 min)
└── Mark complete (2 min)
```

**Use Case:** Commute, lunch break

### 15-Minute Session

```
Activity: Lesson + Vocab Practice
├── Complete lesson (10 min)
├── Vocab trainer (5 min)
└── Done!
```

**Use Case:** Evening study session

### Optimal Lesson Length

| Metric | Value | Reason |
|--------|-------|--------|
| Learn phase | 4 min | Attention span |
| Practice phase | 4 min | Active learning |
| Complete phase | 2 min | Wrap-up |
| **Total** | **10 min** | Fits 15-min session with buffer |

### Activity Count Per Session

| Session Length | Activities | Completion |
|----------------|------------|------------|
| 5 min | 1 (vocab review) | 100% |
| 10 min | 1 (lesson) | 100% |
| 15 min | 2 (lesson + practice) | 100% |

**Rule:** Users can finish meaningful progress in every session.

---

## E. Implementation Order Review

### Current Roadmap

| Phase | Tasks | Effort |
|-------|-------|--------|
| Phase 1 | Kapitel grouping, Dashboard, Progress | 22h |
| Phase 2 | Vocab/Verb integration, Simulasi | 16h |
| Phase 3 | Mobile nav, Disclosure | 12h |

### Revised Roadmap (Dependency-Ordered)

#### Phase 1: Foundation (Week 1)

| Task | Effort | Dependency | Value |
|------|--------|------------|-------|
| Lesson data structure | 4h | None | HIGH |
| Kapitel grouping | 4h | Lesson structure | HIGH |
| Progress store update | 4h | None | HIGH |
| Dashboard "Continue Learning" | 4h | Progress store | HIGH |
| Dashboard "Today's Task" | 3h | Progress store | MEDIUM |

**Total:** 19 hours

#### Phase 2: Learning Flow (Week 2)

| Task | Effort | Dependency | Value |
|------|--------|------------|-------|
| Lesson Learn → Practice → Complete flow | 6h | Lesson structure | HIGH |
| Vocab integration in lessons | 4h | Lesson structure | HIGH |
| Verb integration in lessons | 4h | Lesson structure | HIGH |
| Kapitel Test (mandatory) | 4h | Kapitel grouping | HIGH |
| Score + unlock logic | 3h | Progress store | HIGH |

**Total:** 21 hours

#### Phase 3: Mobile + Polish (Week 3)

| Task | Effort | Dependency | Value |
|------|--------|------------|-------|
| Mobile bottom nav | 4h | None | HIGH |
| Fix mobile scroll | 2h | None | HIGH |
| Onboarding tutorial | 4h | Lesson structure | MEDIUM |
| Dashboard progress % | 3h | Progress store | MEDIUM |
| Supporting tools section | 2h | None | LOW |

**Total:** 15 hours

**Grand Total:** 55 hours

### Dependency Chain

```
Lesson Structure (4h)
    ↓
Kapitel Grouping (4h) + Vocab/Verb Integration (8h)
    ↓
Kapitel Test (4h) + Score Logic (3h)
    ↓
Dashboard Updates (7h)
    ↓
Mobile Navigation (6h)
```

### Fastest Path to User Value

1. **Lesson structure** (4h) — Core of learning
2. **Kapitel grouping** (4h) — Curriculum organization
3. **Dashboard guidance** (7h) — Immediate user value
4. **Mobile nav** (6h) — Mobile users served

**MVP:** Phases 1+2 = 40 hours = Working curriculum-first app

---

## F. UX-002 Final Blueprint v2

### Architecture

```
DeutschUp (Curriculum-First)
├── 🏠 Dashboard (Learning Hub)
│   ├── Continue Learning (60%)
│   ├── Today's Task (20%)
│   ├── Progress (15%)
│   └── Tools (5%)
│
├── 📚 KURIKULUM (Primary)
│   ├── A1
│   │   ├── Kapitel 1
│   │   │   ├── Lesson 1 → Learn → Practice → Complete
│   │   │   ├── Lesson 2 → Learn → Practice → Complete
│   │   │   ├── Lesson 3 → Learn → Practice → Complete
│   │   │   ├── Kapitel Training
│   │   │   └── Kapitel Test (mandatory)
│   │   ├── Kapitel 2
│   │   └── ...
│   ├── A2
│   ├── B1
│   └── B2
│
├── 🛠️ TOOLS (Supporting)
│   ├── Vocab Trainer
│   ├── Verb Trainer
│   ├── Catatan
│   └── Koreksi (Pro)
│
└── ⚙️ ACCOUNT
    ├── Pricing
    └── Admin (if admin)
```

### Learning Flow

```
User Login
    ↓
Dashboard: "Continue Learning"
    ↓
Lesson: Learn (4 min) → Practice (4 min) → Complete (2 min)
    ↓
Score Check
    ↓
≥ 70%? → Next Lesson
< 70% → Review + Retry
    ↓
Kapitel Complete? → Kapitel Test
    ↓
Test Passed? → Next Kapitel
```

### Mobile Navigation

```
[🏠 Home] [📚 Belajar] [✍️ Latihan] [🤖 AI] [👤 Akun]
```

### Dashboard Hierarchy

| Priority | Section | Allocation |
|----------|---------|------------|
| 1 | Continue Learning | 60% |
| 2 | Today's Task | 20% |
| 3 | Progress | 15% |
| 4 | Tools | 5% |

### Feature Placement

| Feature | Location | Integration |
|---------|----------|-------------|
| Vocab Trainer | In-lesson + standalone | After word learning |
| Verb Trainer | In-lesson + standalone | After grammar |
| Koreksi | In-lesson (Schreiben) | Writing exercises |
| Catatan | In-lesson + standalone | Contextual |
| Simulasi | After Kapitel Test | Kapitel assessment |

### Session Design

| Session | Duration | Activities |
|---------|----------|------------|
| Quick | 5 min | Vocab review |
| Standard | 10 min | One lesson |
| Extended | 15 min | Lesson + practice |

---

## G. New Patterns

### Lesson-First Pattern

**Problem:** Academic structure = textbook feel.

**Solution:** Lesson contains Learn → Practice → Complete.

**Rule:** Content types (vocab, grammar, listening) are lesson content, not navigation.

### Dashboard 60/20/15/5 Pattern

**Problem:** Dashboard gives space to secondary info.

**Solution:** 60% Continue Learning, 20% Today's Task, 15% Progress, 5% Tools.

**Rule:** Primary action must dominate dashboard.

### Mandatory Checkpoint Pattern

**Problem:** Simulasi optional = users skip assessment.

**Solution:** Kapitel Test mandatory after completion.

**Rule:** Mastery-based progression, not completion-based.

### Mobile Session Pattern

**Problem:** Long sessions = abandonment.

**Solution:** 5/10/15 minute session design.

**Rule:** Users can finish meaningful progress in every session.

### 10-Minute Lesson Pattern

**Problem:** Lessons too long = attention loss.

**Solution:** Learn (4 min) + Practice (4 min) + Complete (2 min) = 10 min.

**Rule:** Optimal lesson length = 10 minutes.

---

## H. Implementation Summary

### Phase 1: Foundation (Week 1) — 19h

- Lesson data structure
- Kapitel grouping
- Progress store update
- Dashboard guidance

### Phase 2: Learning Flow (Week 2) — 21h

- Learn → Practice → Complete flow
- Vocab/Verb integration
- Kapitel Test
- Score + unlock logic

### Phase 3: Mobile + Polish (Week 3) — 15h

- Mobile navigation
- Onboarding
- Dashboard polish

**Total:** 55 hours

---

## I. Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Time to first lesson | Unknown | < 30 seconds |
| Daily active users | Unknown | +20% |
| Lesson completion rate | Unknown | > 80% |
| Kapitel completion rate | Unknown | > 60% |
| Mobile session length | Unknown | 10–15 min |

---

*Document generated by Exilio 🧠 — 2026-06-11*
