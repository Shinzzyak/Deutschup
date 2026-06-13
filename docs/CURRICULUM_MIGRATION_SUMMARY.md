# DeutschUp Curriculum Migration — Executive Summary
# Date: 2026-06-12
# ============================================================

## Problem
Current curriculum is 12K lines of in-memory TypeScript with user progress stored as JSONB blobs.
No relational structure. No database-backed curriculum. No checkpoint system.

## Solution
6 SQL migration files + 4 PL/pgSQL functions + 6 implementation batches.

## What Was Created

### SQL Files (supabase/)
| File | Purpose | Size |
|------|---------|------|
| `00_backup.sql` | Safety snapshot before migration | 4KB |
| `08_curriculum_tables.sql` | New schema (10 tables, RLS, policies) | 12KB |
| `09_curriculum_migration.sql` | Seed data (4 levels, 16 kapitel, 50 lessons, 11 checkpoints) | 9KB |
| `10_progress_migration.sql` | Migrate existing user progress | 3KB |
| `11_checkpoint_system.sql` | PL/pgSQL functions (complete, checkpoint, streak, access) | 9KB |
| `12_curriculum_indexes.sql` | Performance indexes (18 indexes) | 2KB |

### Documentation (docs/)
| File | Purpose |
|------|---------|
| `MIGRATION_INVENTORY.md` | Full migration inventory with risk assessment |
| `IMPLEMENTATION_BATCHES.md` | 6 batches with files, effort, validation |
| `DEV-001_EXECUTION.md` | Step-by-step execution for first task |

## New Data Model

```
curriculum_levels (4)
  └── kapitel (16)
        └── curriculum_lessons (50)
              ├── curriculum_vocabulary (1000+)
              └── curriculum_exercises (500+)
  └── curriculum_checkpoints (11)
        └── curriculum_checkpoint_questions (100+)

user_curriculum_progress (per user)
user_lesson_progress (per user × lesson)
user_checkpoint_progress (per user × checkpoint)
```

## Implementation Batches

| Batch | What | Effort | Status |
|-------|------|--------|--------|
| 1 | Backup + Schema | 2-3h | ✅ READY |
| 2 | Curriculum Migration | 2-4h | ✅ READY |
| 3 | APIs | 4-6h | 🔲 NOT STARTED |
| 4 | Dashboard | 4-6h | 🔲 NOT STARTED |
| 5 | Navigation | 2-3h | 🔲 NOT STARTED |
| 6 | Integration | 6-8h | 🔲 NOT STARTED |

**Total estimated effort:** 20-30 hours

## Key Design Decisions

1. **Content stays in lessons.ts for now** — 12K lines of lesson content (grammar, vocabulary, exercises) remain in-memory. Only structural metadata goes to DB. Content migration is a separate future task.

2. **Old progress table preserved** — During transition, old `progress` table stays operational. New `user_*` tables are additive.

3. **PL/pgSQL for business logic** — `complete_lesson()`, `submit_checkpoint()`, `can_access_lesson()`, `update_streak()` as database functions. Frontend calls these via Supabase RPC.

4. **RLS on all tables** — Curriculum = public read, service_role write. User progress = own data only + admin override.

5. **JSONB for flexible content** — Vocabulary, exercises, listening simulations stored as JSONB within curriculum tables. Good balance of structure and flexibility.

## Next Action
Execute DEV-001: Run `00_backup.sql` in Supabase SQL Editor.
