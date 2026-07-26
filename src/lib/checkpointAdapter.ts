import type { Checkpoint, Lesson, Level, QuizQuestion } from '../data/course';
import { courseIndex, type LessonIndex } from '../data/lessonIndex';

export interface ResolvedCheckpointLesson {
  lesson: Lesson;
  checkpoint: Checkpoint;
  /**
   * true when the questions were assembled from the reviewed lessons instead of
   * being authored for this checkpoint. Nothing is invented: every question is
   * an existing, authored exercise taken from a lesson the checkpoint reviews.
   */
  derived: boolean;
}

// A derived checkpoint asks 15 questions; below 10 usable questions we refuse to
// build one at all rather than ship a two-question "exam".
const DERIVED_QUESTION_TARGET = 15;
const DERIVED_QUESTION_MINIMUM = 10;
const DERIVED_REQUIRED_SCORE = 0.7;

const CEFR_LEVELS: readonly Level[] = ['A1', 'A2', 'B1', 'B2'];

const hasQuestionList = (questions: unknown): questions is Checkpoint['questions'] => (
  Array.isArray(questions) && questions.length > 0
);

const lessonId = (lesson: Lesson) => typeof lesson.id === 'string' ? lesson.id : '';

const isCheckpointId = (id: string) => id.toLowerCase().includes('checkpoint');

const levelPrefixOf = (id: string): Level | null => {
  const prefix = id.split('-')[0]?.toUpperCase();
  return CEFR_LEVELS.includes(prefix as Level) ? (prefix as Level) : null;
};

const isTopLevelCheckpointLesson = (lesson: Lesson, id?: string) => {
  const idMatches = id ? lessonId(lesson) === id : isCheckpointId(lessonId(lesson));
  return idMatches && isCheckpointId(lessonId(lesson)) && hasQuestionList(lesson.questions);
};

// ---------------------------------------------------------------------------
// Question sanity
// ---------------------------------------------------------------------------
// CheckpointView scores an answer by comparing the picked option STRING against
// options[correctAnswer]. A question with duplicate options is therefore not
// merely ugly, it is unscoreable — two buttons would both read as correct. Parts
// of lessons.ts were generated in bulk and contain `options: []` and duplicated
// distractors, so every candidate is screened before it can enter a checkpoint.
const isUsableQuestion = (candidate: unknown): candidate is QuizQuestion => {
  if (!candidate || typeof candidate !== 'object') return false;
  const { question, options, correctAnswer } = candidate as Partial<QuizQuestion>;

  if (typeof question !== 'string' || question.trim().length < 5) return false;
  if (!Array.isArray(options) || options.length < 3) return false;

  const trimmed = options.map((option) => typeof option === 'string' ? option.trim() : '');
  if (trimmed.some((option) => option.length === 0)) return false;
  if (new Set(trimmed.map((option) => option.toLowerCase())).size !== trimmed.length) return false;

  if (typeof correctAnswer !== 'number' || !Number.isInteger(correctAnswer)) return false;
  if (correctAnswer < 0 || correctAnswer >= options.length) return false;

  return true;
};

// Listening questions are deliberately excluded: they only make sense next to
// the transcript, which the checkpoint screen does not render.
const questionPoolOf = (lesson: Lesson | undefined): QuizQuestion[] => {
  if (!lesson) return [];
  return [...(lesson.exercises || []), ...(lesson.miniQuiz || [])].filter(isUsableQuestion);
};

// ---------------------------------------------------------------------------
// Which lessons a missing checkpoint reviews
// ---------------------------------------------------------------------------
// Bounded by courseIndex, not by courseData: courseData also holds lessons that
// never made it onto the map (a2-19..a2-25) plus duplicate ids. A review may
// only ask about material the learner was actually shown.
export function planCheckpointReviewLessons(id: string, index: LessonIndex[] = courseIndex): string[] {
  const position = index.findIndex((unit) => unit.id === id);
  if (position < 0) return [];

  const level = levelPrefixOf(id);
  if (!level) return [];

  const sameLevelBefore = index.slice(0, position).filter((unit) => levelPrefixOf(unit.id) === level);
  const isLastUnitOfLevel = !index.slice(position + 1).some((unit) => levelPrefixOf(unit.id) === level);

  // A level-closing checkpoint reviews the whole level ("Review A1 Lengkap").
  // A mid-level one only reviews what came after the previous checkpoint.
  let start = 0;
  if (!isLastUnitOfLevel) {
    for (let i = 0; i < sameLevelBefore.length; i += 1) {
      if (isCheckpointId(sameLevelBefore[i].id)) start = i + 1;
    }
  }

  return sameLevelBefore
    .slice(start)
    .filter((unit) => !isCheckpointId(unit.id))
    .map((unit) => unit.id);
}

// ---------------------------------------------------------------------------
// Building the checkpoint
// ---------------------------------------------------------------------------
interface PickedQuestion {
  poolIndex: number;
  order: number;
  lessonId: string;
  question: QuizQuestion;
}

/**
 * Walks the review lessons evenly instead of front-loading the first ones, so a
 * 26-lesson A1 review spans a1-1 to a1-25 rather than stopping at a1-15.
 * Fully deterministic — the same learner sees the same exam on every reload.
 */
function collectDerivedQuestions(pools: { lessonId: string; questions: QuizQuestion[] }[]): PickedQuestion[] {
  if (pools.length === 0) return [];

  const cursors = pools.map(() => 0);
  const seen = new Set<string>();
  const picked: PickedQuestion[] = [];

  const takeFrom = (poolIndex: number): boolean => {
    const pool = pools[poolIndex];
    while (cursors[poolIndex] < pool.questions.length) {
      const order = cursors[poolIndex];
      const question = pool.questions[order];
      cursors[poolIndex] += 1;
      const fingerprint = question.question.trim().toLowerCase();
      if (seen.has(fingerprint)) continue;
      seen.add(fingerprint);
      picked.push({ poolIndex, order, lessonId: pool.lessonId, question });
      return true;
    }
    return false;
  };

  const span = Math.max(DERIVED_QUESTION_TARGET - 1, 1);
  for (let slot = 0; slot < DERIVED_QUESTION_TARGET; slot += 1) {
    const poolIndex = pools.length > 1
      ? Math.min(pools.length - 1, Math.floor((slot * (pools.length - 1)) / span))
      : 0;
    takeFrom(poolIndex);
  }

  // Top-up pass for levels with fewer lessons than slots: keep drawing a second
  // and third question per lesson, still in curriculum order.
  let poolIndex = 0;
  while (poolIndex < pools.length && picked.length < DERIVED_QUESTION_TARGET) {
    if (!takeFrom(poolIndex)) poolIndex += 1;
  }

  // Curriculum order, so the exam moves from early to late material.
  return picked
    .sort((a, b) => a.poolIndex - b.poolIndex || a.order - b.order)
    .slice(0, DERIVED_QUESTION_TARGET);
}

function buildDerivedCheckpoint(
  lessons: Lesson[],
  id: string,
  index: LessonIndex[],
): ResolvedCheckpointLesson | null {
  const level = levelPrefixOf(id);
  if (!level) return null;

  const indexEntry = index.find((unit) => unit.id === id);
  if (!indexEntry) return null;

  const reviewPlan = planCheckpointReviewLessons(id, index);
  if (reviewPlan.length === 0) return null;

  // courseData carries duplicate ids; the first copy wins, exactly like the
  // `courseData.find(...)` every page does.
  const byId = new Map<string, Lesson>();
  for (const lesson of lessons) {
    const key = lessonId(lesson);
    if (key && !byId.has(key)) byId.set(key, lesson);
  }

  const pools = reviewPlan
    .map((reviewId) => ({ lessonId: reviewId, questions: questionPoolOf(byId.get(reviewId)) }))
    .filter((pool) => pool.questions.length > 0);

  const picked = collectDerivedQuestions(pools);
  if (picked.length < DERIVED_QUESTION_MINIMUM) return null;

  // Only the lessons that actually contributed a question are listed as review
  // material — the screen says "soal berikut diambil dari pelajaran ini", and
  // that sentence has to stay true.
  const contributingLessons: string[] = [];
  for (const item of picked) {
    if (!contributingLessons.includes(item.lessonId)) contributingLessons.push(item.lessonId);
  }

  const title = indexEntry.title || `Review ${level} Lengkap`;
  const questions = picked.map((item) => item.question);

  const checkpoint: Checkpoint = {
    id,
    title,
    requiredScore: DERIVED_REQUIRED_SCORE,
    questions,
    reviewLessons: contributingLessons,
    type: 'checkpoint',
  };

  const lesson: Lesson = {
    id,
    level,
    title,
    canDoGoals: indexEntry.canDoGoals || [],
    requiredScore: DERIVED_REQUIRED_SCORE,
    questions,
    reviewLessons: contributingLessons,
    checkpoint,
  };

  return { lesson, checkpoint, derived: true };
}

// Derivation walks every review lesson, so cache per (lessons array, id). The
// module-level route table and CheckpointView both hit this on every render.
const derivedCache = new WeakMap<Lesson[], Map<string, ResolvedCheckpointLesson | null>>();

function deriveCheckpointLesson(
  lessons: Lesson[],
  id: string,
  index: LessonIndex[],
): ResolvedCheckpointLesson | null {
  if (index !== courseIndex) return buildDerivedCheckpoint(lessons, id, index);

  let cache = derivedCache.get(lessons);
  if (!cache) {
    cache = new Map();
    derivedCache.set(lessons, cache);
  }
  if (!cache.has(id)) cache.set(id, buildDerivedCheckpoint(lessons, id, index));
  return cache.get(id) ?? null;
}

function resolveAuthoredCheckpoint(lessons: Lesson[], id: string): ResolvedCheckpointLesson | null {
  const lesson = lessons.find((candidate) => (
    lessonId(candidate) === id || candidate.checkpoint?.id === id
  ));
  if (!lesson) return null;

  if (lesson.checkpoint?.id === id && hasQuestionList(lesson.checkpoint.questions)) {
    return { lesson, checkpoint: lesson.checkpoint, derived: false };
  }

  if (isTopLevelCheckpointLesson(lesson, id)) {
    return {
      lesson,
      checkpoint: {
        id: lessonId(lesson),
        title: lesson.title || 'Checkpoint',
        requiredScore: lesson.requiredScore || 0.7,
        questions: lesson.questions || [],
        reviewLessons: lesson.reviewLessons || [],
        type: 'checkpoint',
      },
      derived: false,
    };
  }

  return null;
}

export function resolveCheckpointLesson(
  lessons: Lesson[],
  id: string | undefined,
  index: LessonIndex[] = courseIndex,
): ResolvedCheckpointLesson | null {
  if (!id) return null;

  const authored = resolveAuthoredCheckpoint(lessons, id);
  if (authored) return authored;

  // No hand-written questions for this checkpoint. Rather than leaving the
  // learner at a wall — a1-checkpoint-4 is the last unit of A1 and the gate to
  // A2 — rebuild the exam out of the exercises of the lessons it reviews.
  if (!isCheckpointId(id)) return null;
  return deriveCheckpointLesson(lessons, id, index);
}

export function listResolvableCheckpointIds(lessons: Lesson[], index: LessonIndex[] = courseIndex): string[] {
  const ids = new Set<string>();

  for (const lesson of lessons) {
    if (lesson.checkpoint?.id && hasQuestionList(lesson.checkpoint.questions)) {
      ids.add(lesson.checkpoint.id);
    }
    if (isTopLevelCheckpointLesson(lesson)) {
      ids.add(lessonId(lesson));
    }
  }

  for (const unit of index) {
    if (!isCheckpointId(unit.id) || ids.has(unit.id)) continue;
    if (deriveCheckpointLesson(lessons, unit.id, index)) ids.add(unit.id);
  }

  return Array.from(ids).sort();
}
