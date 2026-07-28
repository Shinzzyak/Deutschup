import { supabase, dbProxy } from '../lib/supabase';

// ============================================================
// What talks to what, and why
//
// Curriculum CONTENT (levels, kapitel, lessons, checkpoints) is public data:
// supabase/08_curriculum_tables.sql grants `FOR SELECT USING (is_published =
// true)` to everyone, so the anon client can read it directly and no server
// round trip is needed.
//
// Anything scoped to a USER is different: RLS on those tables is written
// against auth.uid(), which is always NULL under Clerk, so the anon client can
// never pass it. can_access_lesson therefore goes through /api/db-proxy, which
// verifies the Clerk token and calls the RPC with service_role.
// ============================================================

// ============================================================
// Types
// ============================================================

export interface CurriculumLevel {
  id: string; // 'A1', 'A2', 'B1', 'B2'
  title: string;
  description: string | null;
  sort_order: number;
  is_published: boolean;
}

export interface Kapitel {
  id: string; // 'a1-k1', 'a1-k2', etc.
  level_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  is_published: boolean;
}

export interface CurriculumLesson {
  id: string; // 'a1-1', 'a1-2', etc.
  level_id: string;
  kapitel_id: string | null;
  title: string;
  sort_order: number;
  grammar_description: string | null;
  sentence_breakdowns: string[];
  pronunciation_tips: string[];
  cultural_notes: string | null;
  register_notes: string | null;
  indonesian_mistakes: string | null;
  can_do_goals: string[];
  listening_simulation: unknown;
  is_published: boolean;
}

// Columns as they exist live: id, level_id, kapitel_id, title, required_score,
// review_lessons, sort_order, is_published. There is no `questions` column —
// checkpoint questions live in curriculum_checkpoint_questions.
export interface CurriculumCheckpoint {
  id: string; // 'a1-checkpoint-1', etc.
  level_id: string;
  kapitel_id: string | null;
  title: string;
  required_score: number;
  review_lessons: string[];
  sort_order: number;
  is_published: boolean;
}

// ============================================================
// Normalisers — array columns come back NULL on rows that were never filled in,
// and a caller that maps over them would crash on the real data.
// ============================================================

const toArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];

const toNumber = (value: unknown, fallback: number): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

function normalizeLesson(row: any): CurriculumLesson {
  return {
    ...row,
    id: String(row?.id ?? ''),
    kapitel_id: row?.kapitel_id ?? null,
    sort_order: toNumber(row?.sort_order, 0),
    sentence_breakdowns: toArray(row?.sentence_breakdowns),
    pronunciation_tips: toArray(row?.pronunciation_tips),
    can_do_goals: toArray(row?.can_do_goals),
  };
}

function normalizeCheckpoint(row: any): CurriculumCheckpoint {
  return {
    ...row,
    id: String(row?.id ?? ''),
    kapitel_id: row?.kapitel_id ?? null,
    // Fraction, not a percentage: the column is DECIMAL(3,2) and submit_checkpoint
    // compares the submitted score against it directly (0.70 = 70%).
    required_score: toNumber(row?.required_score, 0.7),
    review_lessons: toArray(row?.review_lessons),
    sort_order: toNumber(row?.sort_order, 0),
  };
}

function logAndRethrow(action: string, error: unknown): never {
  console.error(`[CURRICULUM] ${action} failed:`, error);
  throw error;
}

const bySortOrder = (a: { sort_order: number }, b: { sort_order: number }) =>
  a.sort_order - b.sort_order;

// ============================================================
// Level API
// ============================================================

export async function fetchLevels(): Promise<CurriculumLevel[]> {
  const { data, error } = await supabase
    .from('curriculum_levels')
    .select('*')
    .eq('is_published', true)
    .order('sort_order');

  if (error) logAndRethrow('fetchLevels', error);
  return data || [];
}

export async function fetchLevel(id: string): Promise<CurriculumLevel | null> {
  const { data, error } = await supabase
    .from('curriculum_levels')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) logAndRethrow('fetchLevel', error);
  return data;
}

// ============================================================
// Kapitel API
// ============================================================

export async function fetchKapitelByLevel(levelId: string): Promise<Kapitel[]> {
  const { data, error } = await supabase
    .from('kapitel')
    .select('*')
    .eq('level_id', levelId)
    .eq('is_published', true)
    .order('sort_order');

  if (error) logAndRethrow('fetchKapitelByLevel', error);
  return data || [];
}

export async function fetchAllKapitel(): Promise<Kapitel[]> {
  const { data, error } = await supabase
    .from('kapitel')
    .select('*')
    .eq('is_published', true)
    .order('sort_order');

  if (error) logAndRethrow('fetchAllKapitel', error);
  return data || [];
}

// ============================================================
// Lesson API
// ============================================================

export async function fetchLessonsByLevel(levelId: string): Promise<CurriculumLesson[]> {
  const { data, error } = await supabase
    .from('curriculum_lessons')
    .select('*')
    .eq('level_id', levelId)
    .eq('is_published', true)
    .order('sort_order');

  if (error) logAndRethrow('fetchLessonsByLevel', error);
  return (data || []).map(normalizeLesson);
}

export async function fetchLessonsByKapitel(kapitelId: string): Promise<CurriculumLesson[]> {
  const { data, error } = await supabase
    .from('curriculum_lessons')
    .select('*')
    .eq('kapitel_id', kapitelId)
    .eq('is_published', true)
    .order('sort_order');

  if (error) logAndRethrow('fetchLessonsByKapitel', error);
  return (data || []).map(normalizeLesson);
}

export async function fetchLesson(id: string): Promise<CurriculumLesson | null> {
  const { data, error } = await supabase
    .from('curriculum_lessons')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) logAndRethrow('fetchLesson', error);
  return data ? normalizeLesson(data) : null;
}

export async function fetchAllLessons(): Promise<CurriculumLesson[]> {
  const { data, error } = await supabase
    .from('curriculum_lessons')
    .select('*')
    .eq('is_published', true)
    .order('sort_order');

  if (error) logAndRethrow('fetchAllLessons', error);
  return (data || []).map(normalizeLesson);
}

// ============================================================
// Checkpoint API
// ============================================================

export async function fetchCheckpointsByLevel(levelId: string): Promise<CurriculumCheckpoint[]> {
  const { data, error } = await supabase
    .from('curriculum_checkpoints')
    .select('*')
    .eq('level_id', levelId)
    .eq('is_published', true)
    .order('sort_order');

  if (error) logAndRethrow('fetchCheckpointsByLevel', error);
  return (data || []).map(normalizeCheckpoint);
}

export async function fetchCheckpoint(id: string): Promise<CurriculumCheckpoint | null> {
  const { data, error } = await supabase
    .from('curriculum_checkpoints')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) logAndRethrow('fetchCheckpoint', error);
  return data ? normalizeCheckpoint(data) : null;
}

export async function fetchAllCheckpoints(): Promise<CurriculumCheckpoint[]> {
  const { data, error } = await supabase
    .from('curriculum_checkpoints')
    .select('*')
    .eq('is_published', true)
    .order('sort_order');

  if (error) logAndRethrow('fetchAllCheckpoints', error);
  return (data || []).map(normalizeCheckpoint);
}

// ============================================================
// Curriculum Tree (level → kapitel → lessons + checkpoints)
// ============================================================

export interface CurriculumTree {
  level: CurriculumLevel;
  kapitel: {
    kapitel: Kapitel;
    lessons: CurriculumLesson[];
    checkpoint: CurriculumCheckpoint | null;
  }[];
  /** First checkpoint that belongs to the level as a whole. Legacy field. */
  levelCheckpoint: CurriculumCheckpoint | null;
  /** Every checkpoint of this level that no kapitel claimed, in sort order. */
  levelCheckpoints: CurriculumCheckpoint[];
}

/**
 * Match a checkpoint to a kapitel.
 *
 * Every curriculum_checkpoints row in production has kapitel_id = NULL, so
 * matching on that column alone hides all but the first checkpoint per level.
 * When it is NULL we fall back to the lessons the checkpoint reviews: if all of
 * them sit in one kapitel, the checkpoint belongs to that kapitel. Lesson sets
 * of two kapitel are disjoint, so this can never claim the same checkpoint
 * twice, and a checkpoint that spans kapitel stays at level scope.
 */
function checkpointBelongsToKapitel(
  checkpoint: CurriculumCheckpoint,
  kapitelId: string,
  levelLessons: CurriculumLesson[]
): boolean {
  if (checkpoint.kapitel_id) return checkpoint.kapitel_id === kapitelId;
  if (checkpoint.review_lessons.length === 0) return false;
  const lessonIds = new Set(
    levelLessons.filter((l) => l.kapitel_id === kapitelId).map((l) => l.id)
  );
  if (lessonIds.size === 0) return false;
  return checkpoint.review_lessons.every((id) => lessonIds.has(id));
}

export async function fetchCurriculumTree(): Promise<CurriculumTree[]> {
  const [levels, allKapitel, allLessons, allCheckpoints] = await Promise.all([
    fetchLevels(),
    fetchAllKapitel(),
    fetchAllLessons(),
    fetchAllCheckpoints(),
  ]);

  return levels.map((level) => {
    const levelKapitel = allKapitel.filter((k) => k.level_id === level.id).sort(bySortOrder);
    const levelLessons = allLessons.filter((l) => l.level_id === level.id);
    const levelCheckpoints = allCheckpoints
      .filter((c) => c.level_id === level.id)
      .sort(bySortOrder);

    const claimed = new Set<string>();
    const kapitel = levelKapitel.map((k) => {
      const checkpoint =
        levelCheckpoints.find(
          (c) => !claimed.has(c.id) && checkpointBelongsToKapitel(c, k.id, levelLessons)
        ) || null;
      if (checkpoint) claimed.add(checkpoint.id);
      return {
        kapitel: k,
        lessons: getLessonsForKapitel(k.id, levelLessons),
        checkpoint,
      };
    });

    const unclaimed = levelCheckpoints.filter((c) => !claimed.has(c.id));

    return {
      level,
      kapitel,
      levelCheckpoint: unclaimed[0] || null,
      levelCheckpoints: unclaimed,
    };
  });
}

// ============================================================
// Access Control
// ============================================================

/**
 * Whether the learner may open a lesson.
 *
 * The RPC runs server-side through /api/db-proxy: the client cannot call it
 * itself (anon key, auth.uid() NULL) and must not be trusted to decide access
 * anyway. `userId` is kept in the signature for the existing call sites but is
 * ignored — the identity comes from the verified Clerk token.
 *
 * Fails closed: an unreachable server means "not allowed", never "allowed".
 */
export async function canAccessLesson(_userId: string, lessonId: string): Promise<boolean> {
  if (!lessonId) return false;

  const { data, error, status } = await dbProxy('can-access', { lessonId });

  if (error) {
    console.error(`[CURRICULUM] can-access failed (${status ?? '?'}):`, error);
    return false;
  }

  return data?.allowed === true;
}

// ============================================================
// Stats helpers
// ============================================================

export function getLessonsForKapitel(kapitelId: string, lessons: CurriculumLesson[]): CurriculumLesson[] {
  return lessons
    .filter((l) => l.kapitel_id === kapitelId)
    .sort(bySortOrder);
}

/**
 * Direct kapitel_id match only. Production rows all have kapitel_id NULL, so
 * this returns undefined for them by design — fetchCurriculumTree() does the
 * review_lessons fallback and is the function to prefer.
 */
export function getCheckpointForKapitel(
  kapitelId: string,
  checkpoints: CurriculumCheckpoint[]
): CurriculumCheckpoint | undefined {
  return checkpoints.find((c) => c.kapitel_id === kapitelId);
}

export function getLevelCheckpoint(
  levelId: string,
  checkpoints: CurriculumCheckpoint[]
): CurriculumCheckpoint | undefined {
  return checkpoints.find((c) => c.level_id === levelId && c.kapitel_id === null);
}
