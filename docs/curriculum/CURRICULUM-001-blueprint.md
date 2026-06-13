# CURRICULUM-001: Final Blueprint

**Status:** COMPLETE  
**Date:** 2026-06-12  
**Author:** Exilio 🧠  
**Focus:** A1–B2 architecture, lesson framework, progression, data model

---

## Executive Summary

Complete curriculum architecture: 50 lessons, 12 checkpoints, 4 levels. 10-minute mobile learning sessions. Implementation-ready data model.

---

## A. Curriculum Structure Summary

| Level | Kapitel | Lessons | Checkpoints | Total Time |
|-------|---------|---------|-------------|------------|
| A1 | 3 | 12 | 3 | 135 min |
| A2 | 3 | 12 | 3 | 135 min |
| B1 | 3 | 13 | 3 | 145 min |
| B2 | 3 | 13 | 3 | 145 min |
| **Total** | **12** | **50** | **12** | **560 min** |

---

## B. Lesson Framework

### 10-Minute Structure

```
Learn (4 min) → Practice (4 min) → Complete (2 min)
```

| Phase | Duration | Content |
|-------|----------|---------|
| Learn | 4 min | Read, listen, examples |
| Practice | 4 min | 2 exercises |
| Complete | 2 min | Score, XP, next |

### Content Types

| Type | Per Lesson |
|------|------------|
| Vocabulary | 10–18 words |
| Grammar | 0–2 rules |
| Listening | 1–3 dialogues |
| Reading | 1–3 texts |
| Writing | 0–3 prompts |
| Speaking | 0–3 practices |

---

## C. Progression Framework

### XP System

| Action | XP |
|--------|----|
| Lesson complete (≥70%) | 10 |
| Lesson mastery (≥90%) | 20 |
| Kapitel test pass | 50 |
| Level test pass | 100 |
| Daily streak bonus | 5 |
| Perfect score (100%) | 30 |

### Streak System

| Streak | Bonus |
|--------|-------|
| 3 days | +5 XP |
| 7 days | +15 XP |
| 14 days | +30 XP |
| 30 days | +75 XP |

### Unlock Requirements

| Feature | Unlock Condition |
|---------|------------------|
| Next lesson | Score ≥ 70% |
| Next Kapitel | All lessons + test ≥ 70% |
| Next level | All Kapitel + test ≥ 70% |
| Vocab Trainer | Complete Lesson 1 |
| Verb Trainer | Complete Lesson 5 |
| Catatan | Complete Lesson 7 |
| Koreksi (Pro) | A2 complete |
| Simulasi | Kapitel test passed |

---

## D. Checkpoint Framework

### Checkpoint Types

| Type | When | Duration | Questions |
|------|------|----------|-----------|
| Kapitel Checkpoint | After 4 lessons | 15 min | 20 |
| Level Checkpoint | After 3 Kapitel | 20 min | 30 |

### Checkpoint Content

| Skill | Kapitel Check | Level Check |
|-------|---------------|-------------|
| Vocabulary | 30% | 25% |
| Grammar | 30% | 25% |
| Listening | 20% | 20% |
| Reading | 10% | 15% |
| Writing | 5% | 10% |
| Speaking | 5% | 5% |

### Scoring

| Score | Result | XP |
|-------|--------|----|
| ≥ 90% | Mastery | 75 |
| ≥ 70% | Pass | 50 |
| < 70% | Retry | 10 |

---

## E. Data Model

### Level Structure

```typescript
interface Level {
  id: string;           // 'A1', 'A2', 'B1', 'B2'
  title: string;        // 'Beginner', 'Elementary', etc.
  description: string;
  order: number;        // 1, 2, 3, 4
  kapitelIds: string[];
  requiredScore: number; // 0.70
}
```

### Kapitel Structure

```typescript
interface Kapitel {
  id: string;           // 'a1-k1', 'a1-k2', etc.
  levelId: string;      // 'A1'
  title: string;        // 'Perkenalan & Salam'
  order: number;        // 1, 2, 3
  lessonIds: string[];
  requiredScore: number; // 0.70
}
```

### Lesson Structure

```typescript
interface Lesson {
  id: string;           // 'a1-k1-l1'
  kapitelId: string;    // 'a1-k1'
  levelId: string;      // 'A1'
  title: string;        // 'Salam & Perkenalan'
  order: number;        // 1, 2, 3, 4
  duration: number;     // 10 (minutes)
  
  // Learning content
  vocabulary: VocabWord[];
  grammar: GrammarRule[];
  listening: ListeningExercise[];
  reading: ReadingExercise[];
  writing: WritingExercise[];
  speaking: SpeakingExercise[];
  
  // Exercises
  exercises: Exercise[];
  
  // Completion
  requiredScore: number; // 0.70
  xpReward: number;     // 10
}
```

### Checkpoint Structure

```typescript
interface Checkpoint {
  id: string;           // 'a1-k1-checkpoint'
  type: 'kapitel' | 'level';
  kapitelId?: string;
  levelId: string;
  title: string;
  duration: number;     // 15 or 20 (minutes)
  questions: Question[];
  requiredScore: number; // 0.70
  xpReward: number;     // 50 or 75
  reviewLessons: string[];
}
```

### Progress Structure

```typescript
interface UserProgress {
  userId: string;
  
  // Current position
  currentLevel: string;    // 'A1'
  currentKapitel: string;  // 'a1-k1'
  currentLesson: string;   // 'a1-k1-l1'
  
  // Completion status
  completedLessons: string[];
  completedKapitel: string[];
  completedLevels: string[];
  
  // Scores
  lessonScores: Record<string, number>;
  kapitelScores: Record<string, number>;
  levelScores: Record<string, number>;
  
  // XP and streak
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  
  // Unlocked features
  unlockedFeatures: string[];
}
```

---

## F. UX-002 Compatibility

| UX-002 Requirement | Curriculum-001 Support |
|---------------------|------------------------|
| Continue Learning | `progress.currentLesson` |
| What Next | Next lesson in `kapitel.lessonIds` |
| Daily Tasks | Calculate from current position |
| Kapitel Progress | `completedLessons / kapitel.lessonIds.length` |
| Mandatory Checkpoints | `checkpoint` required after kapitel |

---

## G. Implementation Recommendations

### Data Migration

1. Add `kapitelId` to existing lessons
2. Add `levelId` to existing checkpoints
3. Add `order` to lessons and kapitel
4. Create `user_progress` table

### New Tables

```sql
CREATE TABLE curriculum_levels (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  order_num INTEGER,
  required_score DECIMAL(3,2) DEFAULT 0.70
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
  xp_reward INTEGER DEFAULT 10
);

CREATE TABLE curriculum_checkpoints (
  id TEXT PRIMARY KEY,
  type TEXT CHECK (type IN ('kapitel', 'level')),
  kapitel_id TEXT REFERENCES curriculum_kapitel(id),
  level_id TEXT REFERENCES curriculum_levels(id),
  title TEXT NOT NULL,
  duration INTEGER,
  required_score DECIMAL(3,2) DEFAULT 0.70,
  xp_reward INTEGER DEFAULT 50
);

CREATE TABLE user_progress (
  user_id UUID REFERENCES auth.users(id),
  current_level TEXT DEFAULT 'A1',
  current_kapitel TEXT,
  current_lesson TEXT,
  completed_lessons TEXT[] DEFAULT '{}',
  completed_kapitel TEXT[] DEFAULT '{}',
  completed_levels TEXT[] DEFAULT '{}',
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  unlocked_features TEXT[] DEFAULT '{}',
  PRIMARY KEY (user_id)
);
```

---

## H. New Patterns

### Lesson Duration Heuristic

**Rule:** 10 minutes per lesson (Learn 4 + Practice 4 + Complete 2)

**Why:** Fits 5–15 minute mobile sessions.

### Checkpoint Placement

**Rule:** Mandatory checkpoint after every Kapitel

**Why:** Ensures mastery before progression.

### XP Scaling

**Rule:** XP increases with level (A1: 10, A2: 15, B1: 20, B2: 25)

**Why:** Rewards progression, maintains motivation.

### Feature Unlock Timing

**Rule:** Unlock features based on lessons completed, not time

**Why:** Mastery-based, not time-based.

---

*Document generated by Exilio 🧠 — 2026-06-12*
