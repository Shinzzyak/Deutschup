// testLessonsFixture.ts — offline test replacement for the old src/data/lessons.ts
// import in unit tests. Refactor A moved course content to the DB (lessons-db).
// Unit tests must stay sync/offline, so they exercise the adapter logic against
// this compact hand-written fixture instead of the real seed. It mirrors the
// shapes the DB rows produce (Lesson objects with exercises/miniQuiz/checkpoint).
import type { Lesson } from '../../data/course';

const mkExercise = (lessonNum: number, i: number) => ({
  question: `Fixture L${lessonNum} question ${i}: Was bedeutet "Hallo"?`,
  options: ['Hallo', 'Tschüss', 'Danke', 'Bitte'],
  correctAnswer: 0,
});

const mkMiniQuiz = (lessonNum: number, i: number) => ({
  question: `Fixture L${lessonNum} mini ${i}: "Guten Morgen" artinya?`,
  options: ['Selamat pagi', 'Selamat malam', 'Sampai jumpa', 'Terima kasih'],
  correctAnswer: 0,
});

const mkLevelLessons = (prefix: 'a1' | 'a2' | 'b1' | 'b2', count: number): Lesson[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    level: prefix.toUpperCase() as 'A1' | 'A2' | 'B1' | 'B2',
    title: `Fixture ${prefix.toUpperCase()} Lektion ${i + 1}`,
    grammarDescription: `Grammar point ${i + 1}`,
    exercises: Array.from({ length: 5 }, (_, k) => mkExercise(i + 1, k)),
    miniQuiz: Array.from({ length: 3 }, (_, k) => mkMiniQuiz(i + 1, k)),
    vocabulary: [
      { id: `${prefix}-${i + 1}-v1`, word: 'Hallo', translation: 'Halo', exampleSentence: 'Hallo!', phonetic: 'HA-lo', level: prefix.toUpperCase() as 'A1' },
    ],
  }));

const a1 = mkLevelLessons('a1', 15);
const a2 = mkLevelLessons('a2', 10);
const b1 = mkLevelLessons('b1', 8);
const b2 = mkLevelLessons('b2', 6);

// Legacy top-level checkpoint lessons for mid-level checkpoints (1-3) of
// A1/B1/B2 — the level-closing #4 stays UN-authored so the derive-from-pool
// logic keeps being exercised (see derivableCheckpointIds).
const topLevelCheckpoints: Lesson[] = (['a1', 'b1', 'b2'] as const).flatMap(prefix =>
  [1, 2, 3].map((n): Lesson => ({
    id: `${prefix}-checkpoint-${n}`,
    level: prefix.toUpperCase() as 'A1' | 'B1' | 'B2',
    title: `Review ${prefix.toUpperCase()} — checkpoint ${n}`,
    requiredScore: 0.7,
    reviewLessons: [],
    questions: Array.from({ length: 10 }, (_, i) => mkExercise(prefix.length * 100 + n, i)),
  })),
);

// Nested checkpoint inside a lesson (lesson.checkpoint.id carries the route id).
const a1CheckpointLegacy: Lesson = {
  id: 'a1-checkpoint-1',
  level: 'A1',
  title: 'Review Konten Sebelumnya',
  requiredScore: 0.7,
  reviewLessons: ['a1-1', 'a1-2', 'a1-3'],
  questions: Array.from({ length: 10 }, (_, i) => mkExercise(0, i)),
};

// Nested checkpoint inside a lesson (lesson.checkpoint.id carries the route id).
const a2CheckpointNested: Lesson = {
  id: 'a2-checkpoint-lesson',
  level: 'A2',
  title: 'A2 Zwischenstop',
  checkpoint: {
    id: 'a2-checkpoint-1',
    title: 'Review A2',
    requiredScore: 0.7,
    reviewLessons: ['a2-1', 'a2-2'],
    questions: Array.from({ length: 10 }, (_, i) => mkMiniQuiz(0, i)),
  },
};

// Nested a2 mid-level checkpoints (2..4 are derivable; a2-checkpoint-1 authored).
const a2MidCheckpoints: Lesson[] = [2, 3].map((n): Lesson => ({
  id: `a2-checkpoint-${n}`,
  level: 'A2',
  title: `Review A2 — checkpoint ${n}`,
  requiredScore: 0.7,
  reviewLessons: [],
  questions: Array.from({ length: 10 }, (_, i) => mkMiniQuiz(200 + n, i)),
}));

export const testLessons: Lesson[] = [
  ...a1,
  ...topLevelCheckpoints,
  a1CheckpointLegacy,
  ...a2,
  a2CheckpointNested,
  ...a2MidCheckpoints,
  ...b1,
  ...b2,
];

// Ids the derived-checkpoint logic should be able to rebuild from exercise
// pools (no authored questions exist for these in the fixture).
export const derivableCheckpointIds = [
  'a1-checkpoint-4',
  'a2-checkpoint-4',
  'b1-checkpoint-4',
  'b2-checkpoint-4',
];
