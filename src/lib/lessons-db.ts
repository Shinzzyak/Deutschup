// lessons-db.ts — DB-backed replacement for src/data/lessons.ts (courseData + allVocab).
// Refactor A (2026-08-28): learning content lives in Supabase (curriculum_lessons,
// curriculum_exercises, curriculum_vocabulary). This module is the single client-side
// fetch layer with in-memory caching. Importers of `data/lessons` switch here.
//
// ponytail: simple module-level cache, no TTL — content is static after seed;
// swap to SWR/stale-while-revalidate if curriculum ever becomes editable at runtime.
import { supabase } from './supabase';
import { fetchAllRows } from './supabasePagination';
import { authedFetch } from './auth-headers';
import type { Lesson, QuizQuestion, VocabWord, Dialogue, Level } from '../data/course';
import type { ExerciseRow2 } from './lessons-db-types';
import { rowToExerciseV2 } from './exercise-mapper';
import type { ExerciseV2 } from './exercise-types';

// ---- Row shapes (DB snake_case) ----

interface LessonRow {
  id: string;
  level_id: string;
  title: string;
  grammar_description: string | null;
  sentence_breakdowns: string[] | null;
  pronunciation_tips: string[] | string | null;
  cultural_notes: string | null;
  register_notes: string | null;
  indonesian_mistakes: string | null;
  can_do_goals: string[] | null;
  listening_simulation: { transcript: Dialogue[]; questions: QuizQuestion[] } | null;
  dialogues: Dialogue[] | null;
}

interface ExerciseRow {
  lesson_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  sort_order: number | null;
}

interface VocabRow {
  id: string;
  lesson_id: string;
  level_id: string;
  word: string;
  article: string | null;
  translation: string;
  example_sentence: string | null;
  phonetic: string | null;
  sort_order: number | null;
}

// ---- Caches ----

const lessonCache = new Map<string, Lesson>();
/** Typed (v2) exercises per lesson — filled by findLesson's single round-trip. */
const exercisesV2Cache = new Map<string, ExerciseV2[]>();
let allLessonsPromise: Promise<Lesson[]> | null = null;
let allVocabPromise: Promise<VocabWord[]> | null = null;

function rowToLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    level: row.level_id as Level,
    title: row.title,
    grammarDescription: row.grammar_description ?? undefined,
    sentenceBreakdowns: row.sentence_breakdowns ?? undefined,
    pronunciationTips: row.pronunciation_tips ?? undefined,
    vocabulary: undefined, // fetched lazily via getLessonVocabulary
    exercises: undefined, // fetched lazily via getLessonExercises
    miniQuiz: undefined,
    dialogues: row.dialogues ?? undefined,
    culturalNotes: row.cultural_notes ?? undefined,
    registerNotes: row.register_notes ?? undefined,
    indonesianMistakes: row.indonesian_mistakes ?? undefined,
    canDoGoals: row.can_do_goals ?? undefined,
    listeningSimulation: row.listening_simulation ?? undefined,
  };
}

// ---- Public API (drop-in for courseData consumers) ----

// In-flight dedup: LessonView awaits findLesson + getLessonExercises in the
// same tick — both must share one API round-trip, not double-fetch.
const lessonInflight = new Map<string, Promise<Lesson | undefined>>();

/** Fetch one lesson + its exercises via the Clerk-JWT-protected API function.
 * Exercises carry correct_answer — anon-readable RLS on that table was revoked
 * (F-1), so direct Supabase reads only work for non-sensitive tables. */
export async function findLesson(id: string): Promise<Lesson | undefined> {
  const hit = lessonCache.get(id);
  if (hit) return hit;
  let inflight = lessonInflight.get(id);
  if (!inflight) {
    inflight = (async () => {
      const resp = await authedFetch(`/api/curriculum?action=get-lesson&lessonId=${encodeURIComponent(id)}`);
      if (!resp.ok) return undefined;
      const { lesson: row, exercises } = await resp.json();
      if (!row) return undefined;
      const lesson = rowToLesson(row as LessonRow);
      const rows = (exercises || []) as ExerciseRow2[];
      lesson.exercises = rows.map(e => ({
        question: e.question, options: e.options, correctAnswer: e.correct_answer,
      }));
      // Typed v2 pool: authored v2 rows take priority, then legacy MC rows fill
      // the remaining slots — seeded lessons keep their mixed types, legacy-only
      // lessons upgrade from the 3-question AI fallback to a full 6-question MC
      // quiz. Legacy MC still feeds checkpoint pools via lesson.exercises.
      const V2_QUIZ_CAP = 6;
      const typed = rows.map(rowToExerciseV2).filter(Boolean) as ExerciseV2[];
      const legacyMc = rows
        .filter(r => (r.exercise_type ?? 'multiple_choice') === 'multiple_choice' && (r.answer === null || r.answer === undefined))
        .map(r => ({
          type: 'multiple_choice' as const, order: r.sort_order ?? 0, question: r.question,
          options: r.options, correctAnswer: r.correct_answer,
        }))
        .filter(e => e.options.length >= 2 && e.correctAnswer >= 0 && e.correctAnswer < e.options.length);
      const selected = typed.slice(0, V2_QUIZ_CAP);
      for (const le of legacyMc) {
        if (selected.length >= V2_QUIZ_CAP) break;
        if (!selected.some(t => t.order === le.order && t.question === le.question)) selected.push(le);
      }
      const pool = selected.sort((a, b) => a.order - b.order);
      exercisesV2Cache.set(id, pool);
      lessonCache.set(id, lesson);
      return lesson;
    })().finally(() => lessonInflight.delete(id));
    lessonInflight.set(id, inflight);
  }
  return inflight;
}

/** All lessons (was: courseData array). Ordered by level, then sort order is not
 * guaranteed here — use courseIndex for sequencing (same contract as before:
 * courseData was content-only with duplicate ids and unsafe order). */
export async function getAllLessons(): Promise<Lesson[]> {
  if (!allLessonsPromise) {
    allLessonsPromise = (async () => {
      // Lessons + exercises come from the Clerk-JWT-protected API function
      // (exercise rows carry correct_answer — F-1). Vocab is not sensitive and
      // still reads direct. Single round-trip per resource, then merge in
      // memory — keeps the old `lesson.exercises`/`lesson.vocabulary` shape so
      // consumers (notably checkpointAdapter) work without touching internals.
      const [contentRes, vocabRows] = await Promise.all([
        (async () => {
          const resp = await authedFetch('/api/curriculum?action=get-all-content');
          if (!resp.ok) throw new Error(`get-all-content ${resp.status}`);
          return resp.json() as Promise<{ lessons: LessonRow[]; exercises: ExerciseRow[] }>;
        })(),
        fetchAllRows<VocabRow>((from, to) => supabase
          .from('curriculum_vocabulary')
          .select('id, word, article, translation, example_sentence, phonetic, level_id, lesson_id, sort_order')
          .order('sort_order', { ascending: true })
          .range(from, to)),
      ]);
      const { lessonRows, exerciseRows } = { lessonRows: contentRes.lessons, exerciseRows: contentRes.exercises };

      const exByLesson = new Map<string, QuizQuestion[]>();
      for (const e of exerciseRows) {
        const arr = exByLesson.get(e.lesson_id) || [];
        arr.push({ question: e.question, options: e.options, correctAnswer: e.correct_answer });
        exByLesson.set(e.lesson_id, arr);
      }
      const vocabByLesson = new Map<string, VocabWord[]>();
      for (const v of vocabRows) {
        const arr = vocabByLesson.get(v.lesson_id) || [];
        arr.push({
          id: v.id, word: v.word,
          article: v.article ?? undefined,
          translation: v.translation,
          exampleSentence: v.example_sentence ?? '',
          phonetic: v.phonetic ?? '',
          level: v.level_id as Level,
        });
        vocabByLesson.set(v.lesson_id, arr);
      }

      const lessons = lessonRows.map((row) => {
        const lesson = rowToLesson(row);
        lesson.exercises = exByLesson.get(lesson.id);
        lesson.vocabulary = vocabByLesson.get(lesson.id);
        return lesson;
      });
      lessons.forEach(l => lessonCache.set(l.id, l));
      return lessons;
    })().catch((error) => {
      allLessonsPromise = null;
      throw error;
    });
  }
  return allLessonsPromise;
}

/** Exercises + miniQuiz for one lesson, merged in sort order (was: lesson.exercises). */
export async function getLessonExercises(id: string): Promise<QuizQuestion[]> {
  // Route through findLesson so the single API round-trip fills the cache for
  // both calls (LessonView awaits findLesson + getLessonExercises together).
  const lesson = await findLesson(id);
  return lesson?.exercises ?? [];
}

/** Typed exercises (all six types) for one lesson. Same round-trip as
 * findLesson — the v2 cache is filled there. Empty for legacy lessons. */
export async function getLessonExercisesV2(id: string): Promise<ExerciseV2[]> {
  await findLesson(id);
  return exercisesV2Cache.get(id) ?? [];
}

/** Per-lesson vocabulary (was: lesson.vocabulary). */
export async function getLessonVocabulary(id: string): Promise<VocabWord[]> {
  const { data, error } = await supabase
    .from('curriculum_vocabulary')
    .select('id, word, article, translation, example_sentence, phonetic, level_id')
    .eq('lesson_id', id)
    .order('sort_order', { ascending: true });
  if (error || !data) return [];
  return (data as VocabRow[]).map(v => ({
    id: v.id,
    word: v.word,
    article: v.article ?? undefined,
    translation: v.translation,
    exampleSentence: v.example_sentence ?? '',
    phonetic: v.phonetic ?? '',
    level: v.level_id as Level,
  }));
}

/** Full vocab index for search (was: allVocab from data/lessons). Includes both
 * per-lesson vocab and the level-vocab groups (a1-vocab etc.) — same superset the
 * static file shipped. */
export async function getAllVocab(): Promise<VocabWord[]> {
  if (!allVocabPromise) {
    allVocabPromise = (async () => {
      const rows = await fetchAllRows<VocabRow>((from, to) => supabase
        .from('curriculum_vocabulary')
        .select('id, lesson_id, word, article, translation, example_sentence, phonetic, level_id, sort_order')
        .order('sort_order', { ascending: true })
        .range(from, to));
      return rows.map(v => ({
        id: v.id,
        word: v.word,
        article: v.article ?? undefined,
        translation: v.translation,
        exampleSentence: v.example_sentence ?? '',
        phonetic: v.phonetic ?? '',
        level: v.level_id as Level,
      }));
    })().catch((error) => {
      allVocabPromise = null;
      throw error;
    });
  }
  return allVocabPromise;
}
