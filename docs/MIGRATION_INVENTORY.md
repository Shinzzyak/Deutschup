# Migration Inventory — DeutschUp Curriculum System

## Overview

Transform DeutschUp from in-memory curriculum + JSONB progress blob to a proper relational curriculum system with database-backed progress tracking.

## Current State (Before Migration)

| Component | Storage | Location |
|-----------|---------|----------|
| Lesson data | In-memory TS | `src/data/lessons.ts` (12,314 lines) |
| Lesson index | In-memory TS | `src/data/lessonIndex.ts` |
| Type definitions | In-memory TS | `src/data/course.ts` |
| User progress | Supabase JSONB | `progress` table |
| Vocab progress | JSONB in progress | `progress.vocab` |
| XP/Streak | Integer in progress | `progress.xp`, `progress.streak` |

## Migration Files

### 00_backup.sql — BACKUP-001
- **Purpose:** Snapshot all existing data before migration
- **Creates:** `_backup_*_20260612` tables
- **Includes:** Row count verification, spot checks, restore procedure, cleanup
- **Tables affected:** progress, profiles, notes, mock_tests
- **Dependencies:** None
- **Rollback:** Restore from backup tables

### 08_curriculum_tables.sql — CURRICULUM-002
- **Purpose:** Create new relational curriculum schema
- **Creates:** 10 new tables (curriculum_levels, kapitel, curriculum_lessons, curriculum_vocabulary, curriculum_exercises, curriculum_checkpoints, curriculum_checkpoint_questions, user_lesson_progress, user_checkpoint_progress, user_curriculum_progress)
- **Tables affected:** New tables only (no modifications to existing)
- **Dependencies:** None (but must run AFTER backup)
- **Rollback:** DROP all new tables

### 09_curriculum_migration.sql
- **Purpose:** Seed curriculum structure from existing lessonIndex.ts
- **Creates:** 4 levels, 16 kapitel, 50 lessons, 11 checkpoints
- **Tables affected:** curriculum_levels, kapitel, curriculum_lessons, curriculum_checkpoints
- **Dependencies:** 08_curriculum_tables.sql
- **Rollback:** DELETE from seeded tables

### 10_progress_migration.sql
- **Purpose:** Migrate existing user progress from JSONB to relational
- **Creates:** user_curriculum_progress rows, user_lesson_progress rows
- **Tables affected:** user_curriculum_progress, user_lesson_progress (reads from progress)
- **Dependencies:** 08 + 09
- **Rollback:** DELETE from user_* tables

### 11_checkpoint_system.sql
- **Purpose:** PL/pgSQL functions for lesson completion, checkpoint submission, streak
- **Creates:** 4 functions (can_access_lesson, complete_lesson, submit_checkpoint, update_streak)
- **Tables affected:** None (functions only)
- **Dependencies:** 08
- **Rollback:** DROP functions

### 12_curriculum_indexes.sql
- **Purpose:** Performance indexes for all curriculum tables
- **Creates:** 18 indexes
- **Tables affected:** All new curriculum tables
- **Dependencies:** 08
- **Rollback:** DROP indexes

## Execution Order

```
00_backup.sql              ← RUN FIRST (safety net)
08_curriculum_tables.sql   ← Schema creation
09_curriculum_migration.sql ← Seed structure
10_progress_migration.sql   ← Migrate user data
11_checkpoint_system.sql    ← Business logic functions
12_curriculum_indexes.sql   ← Performance indexes
```

## Validation Checklist

After each step, run verification queries embedded in the SQL files.

| Step | Verification |
|------|-------------|
| 00_backup | Row counts match between source and backup tables |
| 08 | All 10 tables exist, RLS enabled, policies created |
| 09 | 4 levels, 16 kapitel, 50 lessons, 11 checkpoints seeded |
| 10 | User counts match, completed lessons preserved, XP/streak intact |
| 11 | Functions compile, `can_access_lesson('a1-1')` returns true |
| 12 | `EXPLAIN` on common queries shows index usage |

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss during migration | HIGH | 00_backup.sql creates full snapshot |
| Broken RLS policies | MEDIUM | Admin override policies included |
| Function errors | MEDIUM | Test with single user first |
| JSONB → relational mapping errors | HIGH | Verification queries in 10_progress_migration.sql |
| Existing frontend breaks | HIGH | Keep old `progress` table operational during transition |

## Rollback Plan

**Immediate (within session):** Run restore procedure in 00_backup.sql

**Deferred (after cleanup):** Restore backup tables, re-run 03_rls.sql + 04_triggers.sql
