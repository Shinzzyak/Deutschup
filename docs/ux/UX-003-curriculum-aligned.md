# UX-003: Curriculum-Aligned Blueprint

**Status:** COMPLETE  
**Date:** 2026-06-12  
**Author:** Exilio 🧠  
**Based on:** CURRICULUM-002 (source of truth)

---

## Executive Summary

UX-002 assumptions conflict with CURRICULUM-002. Key conflicts: lesson duration (10→12–20 min), lesson count (50→54), checkpoints (12→15). UX-003 resolves all conflicts.

---

## A. UX-002 Assumptions (Based on CURRICULUM-001)

| Assumption | UX-002 Value | CURRICULUM-002 Value | Conflict |
|------------|--------------|----------------------|----------|
| Lesson duration | 10 min | 10–20 min | **YES** |
| Lessons per Kapitel | 4 | 3–4 | **YES** |
| Total lessons | 50 | 54 | **YES** |
| Total checkpoints | 12 | 15 | **YES** |
| Mobile session | 5–15 min | 5–20 min | **YES** |
| Daily task count | 2–3 | 1–2 | **YES** |

---

## B. Conflicts Identified

### 1. Lesson Duration Changes

| Level | UX-002 | CURRICULUM-002 | Impact |
|-------|--------|----------------|--------|
| A1 | 10 min | 10 min | ✅ No conflict |
| A2 | 10 min | 12 min | ⚠️ Session design off |
| B1 | 10 min | 15 min | ⚠️ Session design off |
| B2 | 10 min | 15–20 min | ❌ Major session redesign |

### 2. Additional Lessons (+4)

| Impact Area | Change Required |
|-------------|-----------------|
| Dashboard progress | Update completion calculation |
| Daily tasks | Reduce task count (longer lessons) |
| Mobile sessions | Redesign for 15–20 min |
| Onboarding | Update lesson count display |

### 3. Additional Checkpoints (+3)

| Impact Area | Change Required |
|-------------|-----------------|
| Checkpoint flow | Add Kapitel checkpoint UX |
| Progress display | Show checkpoint status |
| Unlock logic | Update checkpoint requirements |

### 4. B2 Complexity Increase

| Impact Area | Change Required |
|-------------|-----------------|
| Lesson UI | Support 15–20 min lessons |
| Exercise count | More exercises per lesson |
| Content density | Handle academic content |
| Mobile reading | Longer text support |

---

## C. Updated Dashboard Architecture

### Dashboard Hierarchy (Revised)

| Priority | Section | Allocation | Change |
|----------|---------|------------|--------|
| 1 | Continue Learning | 55% | ↓5% |
| 2 | Today's Task | 20% | No change |
| 3 | Progress | 15% | No change |
| 4 | Checkpoint Status | 5% | **NEW** |
| 5 | Tools | 5% | No change |

### Dashboard Layout (Revised)

```
┌─────────────────────────────────────────────────────────┐
│  Willkommen zurück! 🔥 Streak: 12 hari                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📍 LANJUTKAN BELAJAR (55%)                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │  A1 → Kapitel 3 → Lesson 2                      │   │
│  │  "Artikel: Der, Die, Das" (10 min)              │   │
│  │                                                 │   │
│  │  [Lanjutkan Belajar →]                           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  🎯 TUGAS HARI INI (20%)                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ✅ Selesaikan Lesson 3 (10 min)                 │   │
│  │  ○  Latihan Vocab (5 min)                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  📊 PROGRESS (15%)                                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │  A1: ████░░░░░░ 45% (Kapitel 3/4)               │   │
│  │  XP: 1,850  |  Level: 3                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  📋 CHECKPOINT (5%)                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Next: Kapitel 3 Checkpoint (15 min)            │   │
│  │  [Persiapan →]                                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  🛠️ ALAT (5%)                                          │
│  [Vocab] [Verbs] [Catatan]                             │
│                                                         │
│  [🏠] [📚] [✍️] [🤖] [👤]                            │
└─────────────────────────────────────────────────────────┘
```

---

## D. Updated Navigation Architecture

### Mobile Bottom Nav (No Change)

```
[🏠 Home] [📚 Belajar] [✍️ Latihan] [🤖 AI] [👤 Akun]
```

### Desktop Sidebar (Revised)

```
📊 Dashboard
─────────────
📚 KURIKULUM
  ├── A1
  │   ├── Kapitel 1 (4 lessons)
  │   ├── Kapitel 2 (4 lessons)
  │   ├── Kapitel 3 (4 lessons)
  │   └── Kapitel 4 (2 lessons)
  ├── A2 (4 Kapitel)
  ├── B1 (3 Kapitel)
  └── B2 (4 Kapitel)
─────────────
✍️ LATIHAN
  ├── Vocab Trainer
  ├── Verb Trainer
  └── Simulasi
─────────────
🤖 AI (Pro)
  ├── Koreksi Pintar
  └── Catatan
─────────────
⚙️ AKUN
  ├── Pricing
  └── Admin (jika admin)
```

---

## E. Updated Progressive Disclosure Rules

### Feature Visibility (Revised)

| Feature | First Login | First Week | Active | Advanced |
|---------|-------------|------------|--------|----------|
| Dashboard | ✅ Simplified | ✅ Full | ✅ Full | ✅ Full |
| Kurikulum | ✅ Lesson 1 only | ✅ Current Kapitel | ✅ All levels | ✅ All levels |
| Vocab Trainer | ⚠️ In-lesson only | ✅ Standalone | ✅ Standalone | ✅ Standalone |
| Verb Trainer | ❌ Locked | ⚠️ In-lesson only | ✅ Standalone | ✅ Standalone |
| Koreksi | ❌ Locked | ❌ Locked | ⚠️ In-lesson only | ✅ Pro |
| Catatan | ❌ Locked | ⚠️ In-lesson only | ✅ Standalone | ✅ Standalone |
| Simulasi | ❌ Locked | ❌ Locked | ⚠️ After Kapitel | ✅ Standalone |
| **Checkpoint** | ❌ Locked | ❌ Locked | ⚠️ After Kapitel | ✅ Standalone |

### Unlock Conditions (Revised)

| Feature | Unlock Condition | Change |
|---------|------------------|--------|
| Vocab Trainer | Complete Lesson 1 | No change |
| Verb Trainer | Complete Lesson 5 | No change |
| Catatan | Complete Lesson 7 | No change |
| Koreksi | A1 complete | **Changed from A2** |
| Simulasi | Kapitel test passed | No change |
| Checkpoint | After Kapitel complete | **NEW** |

---

## F. Updated Kapitel Structure

### Kapitel Flow (Revised)

```
Kapitel
├── Lesson 1 (10–15 min)
├── Lesson 2 (10–15 min)
├── Lesson 3 (10–15 min)
├── Lesson 4 (10–15 min) [optional]
├── Kapitel Training
└── Kapitel Checkpoint (15–20 min)
```

### Checkpoint UX (Revised)

```
Kapitel Complete
    ↓
Checkpoint Available
    ↓
[Persiapan Checkpoint] → [Mulai Checkpoint]
    ↓
Score Check
    ↓
≥ 70% → +50 XP, unlock next Kapitel
< 70% → Review + retry (unlimited A1/A2, 3x B1/B2)
```

---

## G. Updated Lesson Progression

### Lesson Flow (Revised)

```
Lesson (10–20 min depending on level)
├── 📖 Learn (40% of time)
│   ├── Read content
│   ├── Listen to audio
│   └── See examples
├── 💪 Practice (40% of time)
│   ├── Exercise 1
│   └── Exercise 2
└── ✅ Complete (20% of time)
    ├── Score check
    ├── XP awarded
    └── Next lesson prompt
```

### Lesson Duration by Level

| Level | Duration | Learn | Practice | Complete |
|-------|----------|-------|----------|----------|
| A1 | 10 min | 4 min | 4 min | 2 min |
| A2 | 12 min | 5 min | 5 min | 2 min |
| B1 | 15 min | 6 min | 6 min | 3 min |
| B2 | 15–20 min | 6–8 min | 6–8 min | 3–4 min |

---

## H. Updated Daily Task System

### Daily Tasks (Revised)

| Level | Tasks | Duration | Rationale |
|-------|-------|----------|-----------|
| A1 | 2–3 | 20–30 min | Shorter lessons |
| A2 | 2 | 24 min | Longer lessons |
| B1 | 1–2 | 15–30 min | Longer lessons |
| B2 | 1 | 15–20 min | Complex content |

### Daily Task Logic (Revised)

```
Daily Tasks = min(remaining lessons, max_tasks_per_level)

A1: max_tasks = 3
A2: max_tasks = 2
B1: max_tasks = 2
B2: max_tasks = 1
```

---

## I. Updated XP System

### XP Rewards (Revised)

| Action | A1 | A2 | B1 | B2 |
|--------|----|----|----|----|
| Lesson complete | 10 | 15 | 20 | 25 |
| Lesson mastery | 20 | 30 | 40 | 50 |
| Checkpoint pass | 50 | 75 | 100 | 125 |
| Level complete | 100 | 150 | 200 | 250 |

### Streak System (No Change)

| Streak | Bonus |
|--------|-------|
| 3 days | +5 XP |
| 7 days | +15 XP |
| 14 days | +30 XP |
| 30 days | +75 XP |

---

## J. Updated Checkpoint Flow

### Checkpoint Types (Revised)

| Type | Duration | Questions | When |
|------|----------|-----------|------|
| Kapitel Checkpoint | 15 min | 20 | After Kapitel |
| Level Checkpoint | 20–25 min | 30 | After Level |

### Checkpoint UX Flow

```
Kapitel Complete
    ↓
Checkpoint Available Banner
    ↓
[Persiapan] → [Mulai Checkpoint]
    ↓
Question 1 → Question 2 → ... → Question 20
    ↓
Submit
    ↓
Score Screen
    ↓
≥ 70% → Unlock next Kapitel
< 70% → Review + Retry
```

---

## K. Updated Mobile Session Design

### Session Durations (Revised)

| Session | Duration | Activities | Levels |
|---------|----------|------------|--------|
| Quick | 5 min | Vocab review | All |
| Standard | 10–12 min | One lesson | A1/A2 |
| Extended | 15–20 min | One lesson | B1/B2 |
| Checkpoint | 15–25 min | Checkpoint | All |

### Optimal Lesson Length (Revised)

| Level | Optimal | Acceptable |
|-------|---------|------------|
| A1 | 10 min | 8–12 min |
| A2 | 12 min | 10–15 min |
| B1 | 15 min | 12–18 min |
| B2 | 15–20 min | 15–25 min |

---

## L. Updated Onboarding

### Onboarding Tutorial (Revised)

```
Step 1: "Selamat datang di DeutschUp!"
        [Mulai →]

Step 2: "Mulai dari Lesson 1 di A1 Kapitel 1."
        [Mengerti →]

Step 3: "Selesaikan lesson untuk mendapatkan XP."
        [Mengerti →]

Step 4: "Latihan setiap hari untuk menjaga streak!"
        [Mulai Belajar →]
```

### First Login Experience (Revised)

```
┌─────────────────────────────────────────────────────────┐
│  Selamat datang di DeutschUp! 👋                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🎯 MULAI BELAJAR                                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │  A1: Kapitel 1 - Grundlagen                     │   │
│  │  Lesson 1: Begrüßung & Alphabet (10 min)        │   │
│  │  [Mulai Belajar →]                               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  📊 PROGRESS                                            │
│  0/54 lesson selesai                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## M. Implementation Impact

### P0 (Must Fix)

| Item | Impact | Effort | Dependency |
|------|--------|--------|------------|
| Update lesson duration logic | HIGH | 4h | None |
| Update dashboard progress calc | HIGH | 3h | Lesson data |
| Update daily task logic | HIGH | 4h | Lesson duration |
| Add checkpoint status to dashboard | MEDIUM | 3h | Checkpoint data |
| Update onboarding lesson count | LOW | 1h | None |

**Total P0:** 15 hours

### P1 (High Value)

| Item | Impact | Effort | Dependency |
|------|--------|--------|------------|
| Update mobile session design | MEDIUM | 4h | Lesson duration |
| Update progressive disclosure | MEDIUM | 3h | Feature unlock |
| Add checkpoint UX flow | MEDIUM | 6h | Checkpoint data |
| Update XP system | LOW | 2h | Level data |

**Total P1:** 15 hours

### P2 (Later)

| Item | Impact | Effort | Dependency |
|------|--------|--------|------------|
| Update navigation sidebar | LOW | 2h | Kapitel data |
| Add B2 content density support | LOW | 4h | Lesson UI |
| Add checkpoint preparation UI | LOW | 3h | Checkpoint UX |

**Total P2:** 9 hours

**Grand Total:** 39 hours

---

## N. New Patterns

### Curriculum-Driven UX Pattern

**Pattern:** UX must adapt to curriculum structure, not vice versa.

**Rule:** When curriculum changes, UX updates first before implementation.

### Lesson Duration Adaptation Pattern

**Pattern:** UI must handle variable lesson durations.

**Rule:** Display actual duration, not fixed "10 min".

### Checkpoint Integration Pattern

**Pattern:** Checkpoints are mandatory waypoints, not optional.

**Rule:** Show checkpoint status on dashboard, require completion.

### Daily Task Scaling Pattern

**Pattern:** Daily task count scales with lesson duration.

**Rule:** Longer lessons = fewer daily tasks.

### Level-Based Session Design Pattern

**Pattern:** Mobile sessions adapt to level complexity.

**Rule:** A1/A2: 10–12 min, B1/B2: 15–20 min.

---

*Document generated by Exilio 🧠 — 2026-06-12*
