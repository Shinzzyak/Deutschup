# Implementation Batches — DeutschUp Curriculum Migration

## Batch 1: Backup + Schema (DAY 1)
**Status:** READY TO EXECUTE
**Estimated effort:** 2-3 hours

### Files Affected
- `supabase/00_backup.sql` — NEW
- `supabase/08_curriculum_tables.sql` — NEW
- `supabase/12_curriculum_indexes.sql` — NEW

### Steps
1. Run `00_backup.sql` in Supabase SQL Editor
2. Verify backup row counts match source tables
3. Run `08_curriculum_tables.sql`
4. Verify all 10 tables created with RLS
5. Run `12_curriculum_indexes.sql`
6. Verify indexes with `\di` or `pg_indexes`

### Validation
- [ ] Backup tables exist with correct row counts
- [ ] All curriculum tables created
- [ ] RLS policies active (test with anon key)
- [ ] Indexes created (check `pg_indexes`)

### Rollback
- DROP all new tables
- Restore from backup tables

---

## Batch 2: Curriculum Migration (DAY 1-2)
**Status:** READY TO EXECUTE
**Estimated effort:** 2-4 hours

### Files Affected
- `supabase/09_curriculum_migration.sql` — NEW
- `src/data/lessons.ts` — NO CHANGE (content stays in-memory for now)

### Steps
1. Run `09_curriculum_migration.sql`
2. Verify 4 levels, 16 kapitel, 50 lessons, 11 checkpoints
3. Spot-check lesson titles match `lessonIndex.ts`
4. Verify checkpoint review_lessons references are valid

### Validation
- [ ] Level count = 4 (A1, A2, B1, B2)
- [ ] Kapitel count = 16 (4 per level)
- [ ] Lesson count = 50 (13+13+12+12)
- [ ] Checkpoint count = 11
- [ ] All foreign key references valid

### Rollback
- DELETE from seeded tables

---

## Batch 3: APIs (DAY 2-3)
**Status:** NOT STARTED
**Estimated effort:** 4-6 hours

### Files Affected
- `src/lib/supabase.ts` — UPDATE (add new query helpers)
- `src/stores/progressStore.ts` — REWRITE (use new tables)
- `src/stores/learningStore.ts` — UPDATE (if needed)
- `api/admin.ts` — UPDATE (add curriculum admin endpoints)

### New API Endpoints Needed
```
GET  /api/curriculum?level=A1         — Get lessons for level
GET  /api/curriculum/lesson/:id       — Get single lesson with content
POST /api/curriculum/complete         — Mark lesson complete (calls complete_lesson)
POST /api/curriculum/checkpoint       — Submit checkpoint (calls submit_checkpoint)
GET  /api/curriculum/progress/:userId — Get user progress (admin)
```

### Validation
- [ ] `GET /api/curriculum?level=A1` returns 13 lessons
- [ ] `POST /api/curriculum/complete` creates user_lesson_progress row
- [ ] XP increments correctly
- [ ] Next lesson auto-unlocks

### Rollback
- Revert to old progressStore.ts

---

## Batch 4: Dashboard (DAY 3-4)
**Status:** NOT STARTED
**Estimated effort:** 4-6 hours

### Files Affected
- `src/pages/Dashboard.tsx` — REWRITE
- `src/pages/DashboardWithPaymentRefresh.tsx` — UPDATE
- `src/components/` — NEW components needed

### New Components
- `CurriculumBrowser.tsx` — Level → Kapitel → Lesson tree
- `LessonCard.tsx` — Individual lesson card with progress indicator
- `ProgressBar.tsx` — Per-kapitel progress bar
- `CheckpointCard.tsx` — Checkpoint attempt UI

### Validation
- [ ] Dashboard shows curriculum tree from database
- [ ] Completed lessons show checkmark
- [ ] Locked lessons show lock icon
- [ ] XP and streak display correctly
- [ ] Click lesson → navigates to LessonView

### Rollback
- Revert to old Dashboard.tsx

---

## Batch 5: Navigation (DAY 4-5)
**Status:** NOT STARTED
**Estimated effort:** 2-3 hours

### Files Affected
- `src/App.tsx` — UPDATE routes
- `src/pages/LessonView.tsx` — REWRITE (load from DB)
- `src/pages/VocabTrainer.tsx` — UPDATE (use curriculum vocabulary)
- `src/pages/Simulasi.tsx` — UPDATE (use checkpoint questions)

### Route Changes
```
/lesson/:id  → Load from curriculum_lessons + curriculum_vocabulary + curriculum_exercises
/checkpoint/:id → Load from curriculum_checkpoints + curriculum_checkpoint_questions
```

### Validation
- [ ] `/lesson/a1-1` loads from database
- [ ] Vocabulary displays correctly
- [ ] Exercises render and accept answers
- [ ] Checkpoint quiz works end-to-end

### Rollback
- Revert to old routing

---

## Batch 6: Integration (DAY 5-7)
**Status:** NOT STARTED
**Estimated effort:** 6-8 hours

### Files Affected
- All files from batches 3-5
- `src/stores/progressStore.ts` — FINAL version
- `src/lib/subscription.ts` — UPDATE (pro features)
- `src/components/ChatWidget.tsx` — UPDATE (context from curriculum)

### Integration Points
- Chat widget knows current lesson context
- Vocabulary trainer pulls from curriculum_vocabulary
- Simulasi uses curriculum_checkpoints
- Admin panel shows curriculum management

### Validation
- [ ] Full user flow: signup → A1-1 → complete → next unlocks
- [ ] Checkpoint flow: complete 3 lessons → checkpoint appears → pass → next level
- [ ] Streak updates daily
- [ ] XP accumulates correctly
- [ ] Pro features gated correctly
- [ ] Admin can view/manage curriculum

### Rollback
- Full revert to pre-migration state (use backup tables)
