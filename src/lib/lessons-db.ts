// lessons-db.ts — DB-backed replacement for src/data/lessons.ts (courseData + allVocab).
// Refactor A (2026-08-28): learning content lives in Supabase (curriculum_lessons,
// curriculum_exercises, curriculum_vocabulary). This module is the single client-side
// fetch layer with in-memory caching. Importers of `data/lessons` switch here.
//
// ponytail: simple module-level cache, no TTL — content is static after seed;
// swap to SWR/stale-while-revalidate if curriculum ever becomes editable at runtime.
import { supabase } from './supabase';
import { fetchAllRows } from './supabasePagination';
import type { Lesson, QuizQuestion, VocabWord, Dialogue, Level } from '../data/course';

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

/** Find one lesson by id (was: courseData.find(l => l.id === id)). */
export async function findLesson(id: string): Promise<Lesson | undefined> {
  const hit = lessonCache.get(id);
  if (hit) return hit;
  const { data, error } = await supabase
    .from('curriculum_lessons')
    .select('id, level_id, title, grammar_description, sentence_breakdowns, pronunciation_tips, cultural_notes, register_notes, indonesian_mistakes, can_do_goals, listening_simulation, dialogues')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return undefined;
  const lesson = rowToLesson(data as LessonRow);
  lessonCache.set(id, lesson);
  return lesson;
}

/** All lessons (was: courseData array). Ordered by level, then sort order is not
 * guaranteed here — use courseIndex for sequencing (same contract as before:
 * courseData was content-only with duplicate ids and unsafe order). */
export async function getAllLessons(): Promise<Lesson[]> {
  if (!allLessonsPromise) {
    allLessonsPromise = (async () => {
      // Single round-trip per resource, then merge in memory — keeps the old
      // `lesson.exercises`/`lesson.vocabulary` shape so consumers (notably
      // checkpointAdapter) work without touching their internals.
      const [lessonRows, exerciseRows, vocabRows] = await Promise.all([
        fetchAllRows<LessonRow>((from, to) => supabase
          .from('curriculum_lessons')
          .select('id, level_id, title, grammar_description, sentence_breakdowns, pronunciation_tips, cultural_notes, register_notes, indonesian_mistakes, can_do_goals, listening_simulation, dialogues')
          .range(from, to)),
        fetchAllRows<ExerciseRow>((from, to) => supabase
          .from('curriculum_exercises')
          .select('lesson_id, question, options, correct_answer, sort_order')
          .order('sort_order', { ascending: true })
          .range(from, to)),
        fetchAllRows<VocabRow>((from, to) => supabase
          .from('curriculum_vocabulary')
          .select('id, word, article, translation, example_sentence, phonetic, level_id, lesson_id, sort_order')
          .order('sort_order', { ascending: true })
          .range(from, to)),
      ]);

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
  const { data, error } = await supabase
    .from('curriculum_exercises')
    .select('question, options, correct_answer, sort_order')
    .eq('lesson_id', id)
    .order('sort_order', { ascending: true });
  if (error || !data) return [];
  return (data as ExerciseRow[]).map(e => ({
    question: e.question,
    options: e.options,
    correctAnswer: e.correct_answer,
  }));
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
