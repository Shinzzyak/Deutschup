import { courseData } from '../data/lessons';
import { courseIndex, type LessonIndex } from '../data/lessonIndex';
import { listResolvableCheckpointIds } from './checkpointAdapter';

const AVAILABLE_CHECKPOINT_IDS = new Set(listResolvableCheckpointIds(courseData));

/**
 * Units that appear on the map but are deliberately NOT shipped yet.
 *
 * Keep this list empty. It exists so that "not shippable" is an explicit,
 * greppable decision instead of an accident: for a long time a1-checkpoint-4 —
 * the last unit of A1 and the gate to A2 — silently resolved to no route at
 * all, so learners who finished a1-26 hit a wall with no way forward and no
 * failing test anywhere.
 *
 * Anything added here MUST also stay out of progression maths (see
 * buildCurriculumOverview: unreleased units leave the denominator), otherwise a
 * level can never reach 100% for reasons the learner cannot act on.
 */
export const UNRELEASED_UNIT_IDS: readonly string[] = [];

export const isCheckpointUnit = (unit: Pick<LessonIndex, 'id'>) => unit.id.toLowerCase().includes('checkpoint');

export function inferCourseUnitLevel(unit: Pick<LessonIndex, 'id' | 'level'>): string {
  if (unit.level) return unit.level;
  const prefix = unit.id.split('-')[0]?.toUpperCase();
  return prefix || 'A1';
}

export function isCourseUnitRouteAvailable(unit: Pick<LessonIndex, 'id'>): boolean {
  if (UNRELEASED_UNIT_IDS.includes(unit.id)) return false;
  if (!isCheckpointUnit(unit)) return true;
  return AVAILABLE_CHECKPOINT_IDS.has(unit.id);
}

export function getCourseUnitRoute(unit: Pick<LessonIndex, 'id'>): string | null {
  if (!isCourseUnitRouteAvailable(unit)) return null;
  return isCheckpointUnit(unit) ? `/checkpoint/${unit.id}` : `/lesson/${unit.id}`;
}

/**
 * Units the map offers that the app cannot actually open. Every entry here is a
 * dead end for the learner, so this must stay empty apart from ids that are
 * also declared in UNRELEASED_UNIT_IDS.
 */
export function listStrandedCourseUnits(units: LessonIndex[] = courseIndex): LessonIndex[] {
  return units.filter((unit) => !getCourseUnitRoute(unit) && !UNRELEASED_UNIT_IDS.includes(unit.id));
}

export function getCourseUnitContextCopy(unit: Pick<LessonIndex, 'id' | 'level'>, position: number, total: number): string {
  const level = inferCourseUnitLevel(unit);
  const kind = isCheckpointUnit(unit) ? 'Checkpoint' : 'Pelajaran';
  return `${level} • ${kind} ${position} dari ${total}`;
}
