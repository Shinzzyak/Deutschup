import { courseData } from '../data/lessons';
import type { LessonIndex } from '../data/lessonIndex';
import { listResolvableCheckpointIds } from './checkpointAdapter';

const AVAILABLE_CHECKPOINT_IDS = new Set(listResolvableCheckpointIds(courseData));

export const isCheckpointUnit = (unit: Pick<LessonIndex, 'id'>) => unit.id.toLowerCase().includes('checkpoint');

export function isCourseUnitRouteAvailable(unit: Pick<LessonIndex, 'id'>): boolean {
  if (!isCheckpointUnit(unit)) return true;
  return AVAILABLE_CHECKPOINT_IDS.has(unit.id);
}

export function getCourseUnitRoute(unit: Pick<LessonIndex, 'id'>): string | null {
  if (!isCourseUnitRouteAvailable(unit)) return null;
  return isCheckpointUnit(unit) ? `/checkpoint/${unit.id}` : `/lesson/${unit.id}`;
}
