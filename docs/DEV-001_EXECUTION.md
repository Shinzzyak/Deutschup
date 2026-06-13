# DEVELOPMENT-001 EXECUTION PACKAGE
# Step 1: Database Backup
# Date: 2026-06-12
# Status: READY TO EXECUTE
# ============================================================

## Objective
Create a full backup of all existing database tables before curriculum migration begins.

## Pre-requisites
- Supabase SQL Editor access (service_role)
- No active write traffic (optional, recommended)

## Execution Steps

### Step 1.1: Open Supabase SQL Editor
Go to: https://supabase.com/dashboard → Project → SQL Editor

### Step 1.2: Run Backup Script
Copy and execute the contents of:
```
supabase/00_backup.sql
```

### Step 1.3: Verify Backup
After execution, run the verification queries at the bottom of `00_backup.sql`:
```sql
-- Should return matching row counts
SELECT 'progress' AS tbl, COUNT(*) AS cnt FROM progress
UNION ALL SELECT 'backup_progress', COUNT(*) FROM _backup_progress_20260612;
```

### Step 1.4: Record Results
Expected output:
| Table | Source Count | Backup Count |
|-------|-------------|--------------|
| progress | N | N |
| profiles | N | N |
| notes | N | N |
| mock_tests | N | N |

If counts don't match → STOP. Do not proceed to Batch 2.

## Files Created
- `supabase/00_backup.sql` — Backup + restore + cleanup procedures

## Success Criteria
- [ ] All 4 backup tables created
- [ ] Row counts match between source and backup
- [ ] Spot check shows real user data in backup
- [ ] No errors in SQL Editor execution log

## Failure Criteria
- Any backup table fails to create
- Row counts don't match
- SQL execution errors

## Rollback
If backup fails: no action needed (nothing changed in source tables)

## Next Step
After successful backup verification → proceed to Batch 1: Schema Creation
Run `08_curriculum_tables.sql`
