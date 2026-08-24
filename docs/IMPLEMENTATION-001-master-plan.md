# IMPLEMENTATION-001: Master Implementation Plan

**Status:** COMPLETE  
**Date:** 2026-06-12  
**Author:** Exilio 🧠  
**Purpose:** Execution roadmap for Deutschup curriculum-first rebuild

---

## Executive Summary

10 completed artifacts → 4 implementation phases → 55 hours total. CURRICULUM-002 is source of truth. UX-003 is UI specification. AI-001 is infrastructure.

---

## A. Dependency Mapping

### Artifact Dependencies

```
CURRICULUM-002 (Source of Truth)
    ↓
UX-003 (Curriculum-Aligned Blueprint)
    ↓
AI-001 (Provider Infrastructure)
    ↓
IMPLEMENTATION-001 (This Document)
    ↓
Phase 1 → Phase 2 → Phase 3 → Phase 4
```

### Shared Data Models

| Model | Used By | Location |
|-------|---------|----------|
| Level | CURRICULUM-002, UX-003, Progress | `curriculum_levels` table |
| Kapitel | CURRICULUM-002, UX-003, Dashboard | `curriculum_kapitel` table |
| Lesson | CURRICULUM-002, UX-003, LessonView | `curriculum_lessons` table |
| Checkpoint | CURRICULUM-002, UX-003, CheckpointUI | `curriculum_checkpoints` table |
| UserProgress | CURRICULUM-002, UX-003, Dashboard | `user_progress` table |

### Shared UI Components

| Component | Used By | Location |
|-----------|---------|----------|
| LessonCard | Dashboard, KapitelView | `src/components/LessonCard.tsx` |
| CheckpointBadge | Dashboard, CheckpointView | `src/components/CheckpointBadge.tsx` |
| ProgressRing | Dashboard, LessonView | `src/components/ProgressRing.tsx` |
| DailyTask | Dashboard | `src/components/DailyTask.tsx` |
| BottomNav | All pages | `src/components/BottomNav.tsx` |

### Shared APIs

| API | Used By | Location |
|-----|---------|----------|
| /api/curriculum | Dashboard, LessonView | `api/curriculum.ts` |
| /api/progress | Dashboard, LessonView | `api/progress.ts` |
| /api/checkpoint | CheckpointView | `api/checkpoint.ts` |
| /api/ai | AI features | `api/ai.ts` (existing) |

---

## B. Implementation Breakdown

### PHASE 1: Database & Data Layer (8h)

**Goal:** CURRICULUM-002 data model in Supabase

**Files Affected:**
- `supabase/08_curriculum_tables.sql` (NEW)
- `supabase/09_user_progress.sql` (NEW)
- `src/data/course.ts` (MODIFY)
- `src/data/lessonIndex.ts` (MODIFY)
- `src/data/lessons.ts` (MODIFY)

**Database Changes:**
- CREATE `curriculum_levels` table
- CREATE `curriculum_kapitel` table
- CREATE `curriculum_lessons` table
- CREATE `curriculum_checkpoints` table
- CREATE `user_progress` table
- Migrate existing lesson data

**Testing:**
- Table creation success
- Data migration success
- Foreign key integrity
- RLS policies

---

### PHASE 2: API & Backend (10h)

**Goal:** Curriculum and progress APIs

**Files Affected:**
- `api/curriculum.ts` (NEW)
- `api/progress.ts` (NEW)
- `api/checkpoint.ts` (NEW)
- `api/admin.ts` (MODIFY)

**API Endpoints:**
- GET `/api/curriculum` — fetch levels, kapitel, lessons
- GET `/api/curriculum/:levelId` — fetch level details
- GET `/api/curriculum/:kapitelId` — fetch kapitel details
- GET `/api/progress/:userId` — fetch user progress
- POST `/api/progress/:userId/complete` — complete lesson
- POST `/api/progress/:userId/checkpoint` — complete checkpoint
- GET `/api/checkpoint/:checkpointId` — fetch checkpoint questions
- POST `/api/checkpoint/:checkpointId/submit` — submit checkpoint

**Testing:**
- API endpoint success
- Authentication checks
- Error handling

---

### PHASE 3: Frontend Core (18h)

**Goal:** Curriculum-first UI

**Files Affected:**
- `src/pages/Dashboard.tsx` (REWRITE)
- `src/pages/LessonView.tsx` (MODIFY)
- `src/pages/KapitelView.tsx` (NEW)
- `src/pages/CheckpointView.tsx` (NEW)
- `src/components/BottomNav.tsx` (NEW)
- `src/components/LessonCard.tsx` (NEW)
- `src/components/CheckpointBadge.tsx` (NEW)
- `src/components/DailyTask.tsx` (NEW)
- `src/components/ProgressRing.tsx` (NEW)
- `src/stores/curriculumStore.ts` (NEW)
- `src/stores/progressStore.ts` (MODIFY)
- `src/App.tsx` (MODIFY)

**Frontend Changes:**
- Dashboard rewrite (60/20/15/5/5 layout)
- KapitelView (lesson list)
- CheckpointView (checkpoint flow)
- BottomNav (mobile navigation)
- Curriculum-first routing

**Testing:**
- Component rendering
- State management
- API integration
- Mobile responsiveness

---

### PHASE 4: Integration & Polish (19h)

**Goal:** Complete curriculum-first experience

**Files Affected:**
- `src/pages/VocabTrainer.tsx` (MODIFY)
- `src/pages/VerbTrainer.tsx` (MODIFY)
- `src/pages/Koreksi.tsx` (MODIFY)
- `src/pages/Catatan.tsx` (MODIFY)
- `src/pages/Simulasi.tsx` (MODIFY)
- `src/components/Onboarding.tsx` (NEW)
- `src/stores/progressStore.ts` (MODIFY)

**Frontend Changes:**
- Tool integration in lessons
- Onboarding tutorial
- XP/streak system
- Progressive disclosure

**Testing:**
- End-to-end flow
- Mobile session testing
- Performance testing
- Regression testing

---

## C. Database Migration Plan

### New Tables

```sql
CREATE TABLE curriculum_levels (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  order_num INTEGER,
  required_score DECIMAL(3,2) DEFAULT 0.70,
  lesson_duration INTEGER DEFAULT 10
);

CREATE TABLE curriculum_kapitel (
  id TEXT PRIMARY KEY,
  level_id TEXT REFERENCES curriculum_levels(id),
  title TEXT NOT NULL,
  order_num INTEGER,
  required_score DECIMAL(3,2) DEFAULT 0.70
);

CREATE TABLE curriculum_lessons (
  id TEXT PRIMARY KEY,
  kapitel_id TEXT REFERENCES curriculum_kapitel(id),
  level_id TEXT REFERENCES curriculum_levels(id),
  title TEXT NOT NULL,
  order_num INTEGER,
  duration INTEGER DEFAULT 10,
  required_score DECIMAL(3,2) DEFAULT 0.70,
  xp_reward INTEGER DEFAULT 10,
  grammar_focus TEXT[],
  vocabulary JSONB,
  grammar JSONB,
  exercises JSONB
);

CREATE TABLE curriculum_checkpoints (
  id TEXT PRIMARY KEY,
  type TEXT CHECK (type IN ('kapitel', 'level')),
  kapitel_id TEXT REFERENCES curriculum_kapitel(id),
  level_id TEXT REFERENCES curriculum_levels(id),
  title TEXT NOT NULL,
  duration INTEGER,
  required_score DECIMAL(3,2) DEFAULT 0.70,
  xp_reward INTEGER DEFAULT 50,
  questions JSONB
);

CREATE TABLE user_progress (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  current_level TEXT DEFAULT 'A1',
  current_kapitel TEXT,
  current_lesson TEXT,
  completed_lessons TEXT[] DEFAULT '{}',
  completed_kapitel TEXT[] DEFAULT '{}',
  completed_levels TEXT[] DEFAULT '{}',
  lesson_scores JSONB DEFAULT '{}',
  kapitel_scores JSONB DEFAULT '{}',
  level_scores JSONB DEFAULT '{}',
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  unlocked_features TEXT[] DEFAULT '{}'
);
```

### Migration Order

1. Create `curriculum_levels` (no dependencies)
2. Create `curriculum_kapitel` (depends on levels)
3. Create `curriculum_lessons` (depends on kapitel)
4. Create `curriculum_checkpoints` (depends on kapitel/levels)
5. Create `user_progress` (depends on auth.users)
6. Migrate existing lesson data
7. Create RLS policies
8. Create indexes

### Rollback Strategy

```sql
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS curriculum_checkpoints;
DROP TABLE IF EXISTS curriculum_lessons;
DROP TABLE IF EXISTS curriculum_kapitel;
DROP TABLE IF EXISTS curriculum_levels;
```

---

## D. Frontend Refactor Plan

### Pages Affected

| Page | Change | Effort |
|------|--------|--------|
| Dashboard | REWRITE (60/20/15/5/5) | 8h |
| LessonView | MODIFY (duration-aware) | 4h |
| KapitelView | NEW (lesson list) | 3h |
| CheckpointView | NEW (checkpoint flow) | 4h |
| VocabTrainer | MODIFY (contextual) | 2h |
| VerbTrainer | MODIFY (contextual) | 2h |
| Simulasi | MODIFY (after checkpoint) | 2h |

### Components Affected

| Component | Change | Effort |
|-----------|--------|--------|
| BottomNav | NEW (mobile nav) | 2h |
| LessonCard | NEW (lesson display) | 2h |
| CheckpointBadge | NEW (checkpoint status) | 1h |
| DailyTask | NEW (daily tasks) | 2h |
| ProgressRing | NEW (progress display) | 1h |

### State Stores Affected

| Store | Change | Effort |
|-------|--------|--------|
| curriculumStore | NEW (curriculum data) | 3h |
| progressStore | MODIFY (XP/streak) | 3h |

### Routing Changes

| Route | Component | Change |
|-------|-----------|--------|
| `/` | Dashboard | MODIFY |
| `/lesson/:id` | LessonView | MODIFY |
| `/kapitel/:id` | KapitelView | NEW |
| `/checkpoint/:id` | CheckpointView | NEW |
| `/vocab` | VocabTrainer | No change |
| `/verb` | VerbTrainer | No change |
| `/koreksi` | Koreksi | No change |
| `/catatan` | Catatan | No change |
| `/simulasi` | Simulasi | MODIFY |
| `/admin` | Admin | No change |

---

## E. Curriculum Migration Plan

### Lesson Moves

| Current ID | New ID | Move | Reason |
|------------|--------|------|--------|
| a1-1 to a1-12 | a1-k1-l1 to a1-k3-l4 | Same | No change |
| — | a1-k4-l1 | **NEW** | Negation |
| — | a1-k4-l2 | **NEW** | Akkusativ/Dativ |

### Checkpoint Creation

| Level | Checkpoints | ID Pattern |
|-------|-------------|------------|
| A1 | 4 | a1-k1-checkpoint to a1-k4-checkpoint |
| A2 | 4 | a2-k5-checkpoint to a2-k8-checkpoint |
| B1 | 3 | b1-k9-checkpoint to b1-k11-checkpoint |
| B2 | 4 | b2-k12-checkpoint to b2-k15-checkpoint |

---

## F. Risk Analysis

### Highest-Risk Changes

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data migration failure | HIGH | MEDIUM | Backup before migration, test rollback |
| UX regression | HIGH | MEDIUM | Visual regression testing |
| Performance degradation | MEDIUM | LOW | Load testing, optimization |
| User confusion | MEDIUM | MEDIUM | A/B testing, gradual rollout |

### Data-Loss Risks

| Risk | Mitigation |
|------|------------|
| Lesson data loss | Backup existing data before migration |
| Progress data loss | Migrate progress data carefully |
| User account loss | No changes to auth system |

---

## G. Execution Order

### Step 1: Database Backup
**Rationale:** Safety net before any migration
**Effort:** 0.5h

### Step 2: Create Curriculum Tables
**Rationale:** Foundation for all curriculum data
**Effort:** 4h

### Step 3: Migrate Lesson Data
**Rationale:** Populate new tables with existing content
**Effort:** 4h

### Step 4: Create Curriculum API
**Rationale:** Backend ready before frontend
**Effort:** 6h

### Step 5: Create Progress API
**Rationale:** XP/streak system ready
**Effort:** 4h

### Step 6: Create Checkpoint API
**Rationale:** Checkpoint flow ready
**Effort:** 4h

### Step 7: Create Curriculum Store
**Rationale:** Frontend state management ready
**Effort:** 3h

### Step 8: Create BottomNav Component
**Rationale:** Mobile navigation foundation
**Effort:** 2h

### Step 9: Create KapitelView Page
**Rationale:** Curriculum browsing ready
**Effort:** 3h

### Step 10: Create CheckpointView Page
**Rationale:** Checkpoint flow ready
**Effort:** 4h

### Step 11: Rewrite Dashboard
**Rationale:** Core curriculum-first UI
**Effort:** 8h

### Step 12: Update LessonView
**Rationale:** Duration-aware lessons
**Effort:** 4h

### Step 13: Create Onboarding
**Rationale:** First-time user experience
**Effort:** 4h

### Step 14: Integrate Tools
**Rationale:** Vocab/Verb/Koreksi in lessons
**Effort:** 6h

### Step 15: Mobile Polish
**Rationale:** Touch targets, responsiveness
**Effort:** 3h

### Step 16: Regression Testing
**Rationale:** Ensure nothing broke
**Effort:** 4h

**Total:** 57.5 hours

---

## H. Definition of Done

### Completion Criteria

- [ ] All 54 lessons in database
- [ ] All 15 checkpoints in database
- [ ] Dashboard shows Continue Learning
- [ ] Dashboard shows Today's Tasks
- [ ] Dashboard shows Progress
- [ ] Dashboard shows Checkpoint Status
- [ ] BottomNav works on mobile
- [ ] KapitelView shows lesson list
- [ ] LessonView handles 10–20 min lessons
- [ ] CheckpointView flow complete
- [ ] Onboarding tutorial works
- [ ] XP system awards points
- [ ] Streak system tracks days

### Validation Criteria

- [ ] All API endpoints return 200
- [ ] All pages render without errors
- [ ] Mobile layout responsive
- [ ] Data migration successful
- [ ] Rollback strategy tested

### Regression Checks

- [ ] Existing login still works
- [ ] Existing progress preserved
- [ ] Vocab Trainer still works
- [ ] Verb Trainer still works
- [ ] Koreksi still works
- [ ] Admin panel still works

---

*Document generated by Exilio 🧠 — 2026-06-12*
