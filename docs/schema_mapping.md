# Schema Mapping: Firestore to Supabase (PostgreSQL)

This document describes the mapping of data structures from the DeutschUp frontend stores (previously Firestore-based) to the normalized PostgreSQL schema in Supabase.

## 1. User Profiles (`profiles`)
Maps to `authStore.ts`. Extends the base Supabase Auth user with application-specific tiering.

| Firestore/Store Field | Postgres Column | Data Type | Notes |
| :--- | :--- | :--- | :--- |
| `user.id` | `id` | `uuid` | Primary Key, References `auth.users(id)` |
| `tierData.tier` | `tier` | `varchar` | 'free' or 'pro'. Default: 'free' |
| `tierData.tierExpiry` | `tierExpiry` | `bigint` | Unix timestamp |

## 2. User Progress (`progress`)
Maps to `progressStore.ts`. Tracks learning milestones and vocabulary state.

| Firestore/Store Field | Postgres Column | Data Type | Notes |
| :--- | :--- | :--- | :--- |
| `userId` | `user_id` | `uuid` | Primary Key, References `auth.users(id)` |
| `xp` | `xp` | `integer` | Default: 0 |
| `streak` | `streak` | `integer` | Default: 0 |
| `lastPracticeDate` | `lastPracticeDate` | `date` | ISO Date string (`YYYY-MM-DD`) |
| `currentLevel` | `currentLevel` | `varchar` | 'A1', 'A2', 'B1', 'B2'. Default: 'A1' |
| `unlockedLessons` | `unlockedLessons` | `jsonb` | Array of lesson IDs. Default: `["a1-1"]` |
| `completedLessons` | `completedLessons` | `jsonb` | Array of lesson IDs. Default: `[]` |
| `vocab` | `vocab` | `jsonb` | Map of `wordId` $\to$ `{ status, nextReview }` |

## 3. Learning Notes (`notes`)
Maps to `learningStore.ts` -> `Note`.

| Firestore/Store Field | Postgres Column | Data Type | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `id` | `uuid` | Primary Key |
| `userId` | `user_id` | `uuid` | References `auth.users(id)` |
| `text` | `text` | `text` | Note content |
| `tag` | `tag` | `varchar` | 'Grammar', 'Kosakata', 'Pengucapan', 'Umum' |
| `createdAt` | `createdAt` | `bigint` | Unix timestamp |

## 4. Study Plans (`study_plans`)
Maps to `learningStore.ts` -> `StudyPlan`.

| Firestore/Store Field | Postgres Column | Data Type | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `id` | `uuid` | Primary Key |
| `userId` | `user_id` | `uuid` | References `auth.users(id)` |
| `tasks` | `tasks` | `jsonb` | Array of `{ id, text, completed }` |

## 5. Quick Notes (`quick_notes`)
Maps to `learningStore.ts` -> `QuickNote`.

| Firestore/Store Field | Postgres Column | Data Type | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `id` | `uuid` | Primary Key |
| `userId` | `user_id` | `uuid` | References `auth.users(id)` |
| `text` | `text` | `text` | Scratchpad content |
| `updatedAt` | `updatedAt` | `bigint` | Unix timestamp |

## 6. Mock Test Results (`mock_tests`)
Maps to `learningStore.ts` -> `MockTestResult`.

| Firestore/Store Field | Postgres Column | Data Type | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `id` | `uuid` | Primary Key |
| `userId` | `user_id` | `uuid` | References `auth.users(id)` |
| `level` | `level` | `varchar` | Target test level (e.g., 'A1') |
| `score` | `score` | `integer` | Points earned |
| `total` | `total` | `integer` | Total possible points |
| `createdAt` | `createdAt` | `bigint` | Unix timestamp |
