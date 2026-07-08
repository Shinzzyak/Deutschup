import { courseData } from '../data/lessons';
import type { LessonIndex } from '../data/lessonIndex';
import { listResolvableCheckpointIds } from './checkpointAdapter';

const AVAILABLE_CHECKPOINT_IDS = new Set(listResolvableCheckpointIds(courseData));

export const isCheckpointUnit = (unit: Pick<LessonIndex, 'id'>) => unit.id.toLowerCase().includes('checkpoint');

export function inferCourseUnitLevel(unit: Pick<LessonIndex, 'id' | 'level'>): string {
  if (unit.level) return unit.level;
  const prefix = unit.id.split('-')[0]?.toUpperCase();
  return prefix || 'A1';
}

export function isCourseUnitRouteAvailable(unit: Pick<LessonIndex, 'id'>): boolean {
  if (!isCheckpointUnit(unit)) return true;
  return AVAILABLE_CHECKPOINT_IDS.has(unit.id);
}

export function getCourseUnitRoute(unit: Pick<LessonIndex, 'id'>): string | null {
  if (!isCourseUnitRouteAvailable(unit)) return null;
  return isCheckpointUnit(unit) ? `/checkpoint/${unit.id}` : `/lesson/${unit.id}`;
}

export function getCourseUnitContextCopy(unit: Pick<LessonIndex, 'id' | 'level'>, position: number, total: number): string {
  const level = inferCourseUnitLevel(unit);
  const kind = isCheckpointUnit(unit) ? 'Checkpoint' : 'Pelajaran';
  return `${level} • ${kind} ${position} dari ${total}`;
}
