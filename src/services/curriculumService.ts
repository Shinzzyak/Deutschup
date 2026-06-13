import { supabase } from '../lib/supabase';

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
// Level API
// ============================================================

export async function fetchLevels(): Promise<CurriculumLevel[]> {
  const { data, error } = await supabase
    .from('curriculum_levels')
    .select('*')
    .eq('is_published', true)
    .order('sort_order');

  if (error) throw error;
  return data || [];
}

export async function fetchLevel(id: string): Promise<CurriculumLevel | null> {
  const { data, error } = await supabase
    .from('curriculum_levels')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
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

  if (error) throw error;
  return data || [];
}

export async function fetchAllKapitel(): Promise<Kapitel[]> {
  const { data, error } = await supabase
    .from('kapitel')
    .select('*')
    .eq('is_published', true)
    .order('sort_order');

  if (error) throw error;
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

  if (error) throw error;
  return data || [];
}

export async function fetchLessonsByKapitel(kapitelId: string): Promise<CurriculumLesson[]> {
  const { data, error } = await supabase
    .from('curriculum_lessons')
    .select('*')
    .eq('kapitel_id', kapitelId)
    .eq('is_published', true)
    .order('sort_order');

  if (error) throw error;
  return data || [];
}

export async function fetchLesson(id: string): Promise<CurriculumLesson | null> {
  const { data, error } = await supabase
    .from('curriculum_lessons')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function fetchAllLessons(): Promise<CurriculumLesson[]> {
  const { data, error } = await supabase
    .from('curriculum_lessons')
    .select('*')
    .eq('is_published', true)
    .order('sort_order');

  if (error) throw error;
  return data || [];
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

  if (error) throw error;
  return data || [];
}

export async function fetchCheckpoint(id: string): Promise<CurriculumCheckpoint | null> {
  const { data, error } = await supabase
    .from('curriculum_checkpoints')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function fetchAllCheckpoints(): Promise<CurriculumCheckpoint[]> {
  const { data, error } = await supabase
    .from('curriculum_checkpoints')
    .select('*')
    .eq('is_published', true)
    .order('sort_order');

  if (error) throw error;
  return data || [];
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
  levelCheckpoint: CurriculumCheckpoint | null;
}

export async function fetchCurriculumTree(): Promise<CurriculumTree[]> {
  const [levels, allKapitel, allLessons, allCheckpoints] = await Promise.all([
    fetchLevels(),
    fetchAllKapitel(),
    fetchAllLessons(),
    fetchAllCheckpoints(),
  ]);

  return levels.map((level) => {
    const levelKapitel = allKapitel.filter((k) => k.level_id === level.id);
    const levelCheckpoints = allCheckpoints.filter((c) => c.level_id === level.id);

    return {
      level,
      kapitel: levelKapitel.map((k) => ({
        kapitel: k,
        lessons: allLessons.filter((l) => l.kapitel_id === k.id),
        checkpoint: levelCheckpoints.find((c) => c.kapitel_id === k.id) || null,
      })),
      levelCheckpoint: levelCheckpoints.find((c) => c.kapitel_id === null) || null,
    };
  });
}

// ============================================================
// Access Control (uses RPC)
// ============================================================

export async function canAccessLesson(userId: string, lessonId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('can_access_lesson', {
    p_user_id: userId,
    p_lesson_id: lessonId,
  });

  if (error) {
    console.error('[CURRICULUM] can_access_lesson error:', error);
    return false;
  }

  return data === true || data === 'true';
}

// ============================================================
// Stats helpers
// ============================================================

export function getLessonsForKapitel(kapitelId: string, lessons: CurriculumLesson[]): CurriculumLesson[] {
  return lessons
    .filter((l) => l.kapitel_id === kapitelId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

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
