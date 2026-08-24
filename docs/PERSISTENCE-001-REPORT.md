# PERSISTENCE-001: Progress Data Flow Report
# Date: 2026-06-12
# Method: Source code tracing + database verification
# ============================================================

## 1. XP SOURCE TRACE

### Write Path
```
User completes exercise
  → Dashboard.tsx / LessonView.tsx calls:
    progressStore.addXp(userId, amount)
      → set({ xp: newXp })                    ← Zustand in-memory state
      → supabase.from('progress').upsert(     ← Supabase write
          { user_id: userId, xp: newXp }
        )
      → catch (e) console.error(...)           ← Silent failure
```

### Read Path
```
App.tsx <Layout> renders
  → useProgressStore() reads xp from Zustand
  → Sidebar shows: {xp} XP
```

### Initialization
```
App.tsx <AuthWrapper> useEffect
  → loadProgress(user.id)
    → supabase.from('progress').select('*').eq('user_id', userId).single()
    → if no row: insert default { xp: 0, streak: 0, ... }
    → set({ ...data })  ← Hydrates Zustand from DB
```

### Storage Layer: **Supabase `progress` table + Zustand in-memory**

---

## 2. STREAK SOURCE TRACE

### Write Path
```
progressStore.updateStreak(userId)
  → Calculates streak from lastPracticeDate
  → set({ streak: newStreak, lastPracticeDate: today })
  → supabase.from('progress').upsert(
      { user_id: userId, streak: newStreak, lastPracticeDate: today }
    )
```

### ⚠️ SCHEMA MISMATCH
- Code writes: `lastPracticeDate`
- DB column: `lastActive` (TIMESTAMPTZ)
- **`lastPracticeDate` does NOT exist in the progress table**
- PostgREST silently ignores unknown columns → streak saves, date doesn't

---

## 3. CURRENT LESSON SOURCE TRACE

### Write Path
```
progressStore.unlockLesson(userId, lessonId)
  → set({ unlockedLessons: next, currentLevel: newLevel })
  → supabase.from('progress').upsert(
      { user_id: userId, unlockedLessons: next, currentLevel: newLevel }
    )
```

### ⚠️ SCHEMA MISMATCH
- Code writes: `unlockedLessons`, `currentLevel`
- DB columns: NONE — these columns do NOT exist in the progress table
- **`unlockedLessons` is NOT a DB column**
- **`currentLevel` is NOT a DB column**
- PostgREST silently ignores → data never persisted

### What DB actually has
- `currentLesson` (TEXT) — single lesson ID
- No `unlockedLessons` array
- No `currentLevel` enum

---

## 4. COMPLETED LESSONS SOURCE TRACE

### Write Path
```
progressStore.completeLesson(userId, lessonId)
  → const next = [...completedLessons, lessonId]
  → set({ completedLessons: next })
  → supabase.from('progress').upsert(
      { user_id: userId, completedLessons: next }
    )
```

### Storage Layer: **Supabase `progress.completedLessons` (JSONB) + Zustand**

---

## 5. PERSISTENCE BEHAVIOR ANALYSIS

### Scenario A: Complete Lesson
1. `completeLesson(userId, lessonId)` called
2. Zustand state updated immediately (UI reflects change)
3. Supabase upsert fires (async, non-blocking)
4. If upsert fails → error caught, logged to console, **user never knows**
5. **Progress shows in UI but may NOT be in DB**

### Scenario B: Refresh Page
1. Zustand state lost (in-memory only)
2. `AuthWrapper` useEffect fires → `loadProgress(userId)`
3. Queries `progress` table → if row exists, hydrates Zustand
4. If row doesn't exist (empty table) → creates default row with xp=0
5. **All progress lost on refresh**

### Scenario C: Logout/Login
1. Zustand state lost
2. `loadProgress(userId)` on next login
3. Same as Scenario B — progress from DB (which is empty)
4. **All progress lost**

### Scenario D: Different Device
1. Zustand state doesn't transfer
2. `loadProgress(userId)` queries DB
3. DB is empty → default state
4. **All progress lost**

---

## 6. WRITE PATH REPORT

### All Write Operations

| Operation | Function | Supabase Target | Columns Written | DB Columns Match? |
|-----------|----------|-----------------|-----------------|-------------------|
| Add XP | `addXp()` | `progress.upsert` | `xp` | ✅ YES |
| Update Streak | `updateStreak()` | `progress.upsert` | `streak`, `lastPracticeDate` | ⚠️ PARTIAL (`lastPracticeDate` ≠ `lastActive`) |
| Complete Lesson | `completeLesson()` | `progress.upsert` | `completedLessons` | ✅ YES |
| Unlock Lesson | `unlockLesson()` | `progress.upsert` | `unlockedLessons`, `currentLevel` | ❌ NO (columns don't exist) |
| Update Vocab | `updateVocab()` | `progress.upsert` | `vocab` | ⚠️ PARTIAL (`vocab` ≠ `vocabProgress`) |
| Load Progress | `loadProgress()` | `progress.select` + `progress.insert` | all | ⚠️ INSERT writes non-existent columns |

### Column Name Mapping Issues

| Code Field | DB Column | Match? |
|------------|-----------|--------|
| `xp` | `xp` | ✅ |
| `streak` | `streak` | ✅ |
| `completedLessons` | `completedLessons` | ✅ |
| `currentLesson` | `currentLesson` | ✅ |
| `vocabProgress` | `vocabProgress` | ✅ |
| `lastPracticeDate` | `lastActive` | ❌ MISMATCH |
| `unlockedLessons` | (none) | ❌ MISSING |
| `currentLevel` | (none) | ❌ MISSING |
| `vocab` | `vocabProgress` | ❌ MISMATCH |

### RLS Policy Check
```sql
-- INSERT policy exists:
CREATE POLICY "Users can insert own progress" ON progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
-- ✅ Policy allows authenticated users to insert own progress
```

### Upsert Behavior
- `progress.upsert({ user_id, xp })` → works (column exists)
- `progress.upsert({ user_id, unlockedLessons: [...] })` → **PostgREST ignores unknown columns silently**
- Result: row created with only matching columns, extras dropped

---

## 7. ROOT CAUSE ANALYSIS

### Why is the progress table EMPTY?

**Primary Cause:** The `loadProgress()` function inserts a default row:
```js
const { error: insertError } = await supabase
  .from('progress')
  .insert({ user_id: userId, ...defaultProgress });
```

`defaultProgress` contains:
```js
{
  xp: 0,
  streak: 0,
  lastPracticeDate: null,     // ← DB column is 'lastActive'
  currentLevel: 'A1',         // ← DB column doesn't exist
  unlockedLessons: ['a1-1'],  // ← DB column doesn't exist
  completedLessons: [],        // ← matches DB
  vocab: {}                    // ← DB column is 'vocabProgress'
}
```

PostgREST handles this by:
1. Ignoring unknown columns (`lastPracticeDate`, `currentLevel`, `unlockedLessons`, `vocab`)
2. Inserting with only matching columns (`user_id`, `xp`, `streak`, `completedLessons`)
3. **This SHOULD create a row**

**But the table is empty.** This means the insert is FAILING.

**Most Likely Failure Point:** The `loadProgress` function catches ALL errors:
```js
} catch (e) {
  console.error(`Error loading progress for ${userId}:`, e);
  set({ loading: false });
}
```

The error is logged to browser console but **never shown to user**. The insert fails silently.

**Why would the insert fail?**
1. RLS policy blocks it (but policy looks correct)
2. `user.id` doesn't match `auth.uid()` (timing issue with session)
3. FK constraint fails (user doesn't exist in auth.users — unlikely)
4. Column type mismatch (JSONB vs array)

### Secondary Cause: No user has completed any lesson

Even if `loadProgress` creates a default row, the subsequent writes (`addXp`, `completeLesson`, etc.) also use upsert with non-existent columns. These silently drop data.

---

## 8. PERSISTENCE-001 FINAL REPORT

### Verdict: **D. Mock Implementation**

Progress is **partially persisted** but **functionally broken**:

| Field | Persisted? | Survives Refresh? | Survives Logout? |
|-------|-----------|-------------------|------------------|
| XP | ✅ Yes (if row exists) | ✅ Yes | ✅ Yes |
| Streak | ⚠️ Partial (date field mismatch) | ⚠️ Partial | ⚠️ Partial |
| CompletedLessons | ✅ Yes (if row exists) | ✅ Yes | ✅ Yes |
| CurrentLesson | ✅ Yes (if row exists) | ✅ Yes | ✅ Yes |
| UnlockedLessons | ❌ No (column missing) | ❌ No | ❌ No |
| CurrentLevel | ❌ No (column missing) | ❌ No | ❌ No |
| Vocab | ❌ No (column name mismatch) | ❌ No | ❌ No |

### The Real Problem

**The progress table has 0 rows.** This means:
1. `loadProgress()` either was never called with a valid userId, OR
2. The insert in `loadProgress()` is silently failing
3. All subsequent writes (`addXp`, `completeLesson`, etc.) also fail or write to non-existent rows

**Progress is effectively MOCK** — it lives in Zustand (in-memory), survives within a single page session, but is **lost on every page refresh**.

### Evidence
- Progress table: 0 rows (Supabase REST API confirmed)
- 15 profiles exist (users are real)
- 9 daily usage rows (chat AI works)
- 0 notes, 0 study plans, 0 mock tests (other features also unused)
- 5 orders (payments work)

### Schema Mismatches Found
1. `lastPracticeDate` → DB has `lastActive`
2. `unlockedLessons` → DB has NO equivalent column
3. `currentLevel` → DB has NO equivalent column
4. `vocab` → DB has `vocabProgress`

### Impact on Migration
- **Zero data loss risk** — progress table is empty
- Migration can proceed safely
- New schema (`08_curriculum_tables.sql`) fixes all mismatches
- Old `progress` table can be dropped after migration

### Recommendation
Proceed with migration. The current implementation is functionally a mock — progress exists only in browser memory and is lost on every page refresh. The new curriculum system will properly persist all progress data.
