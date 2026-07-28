import { describe, expect, it } from 'vitest';
import { courseIndex } from '../../data/lessonIndex';
import { courseData } from '../../data/lessons';
import { resolveCheckpointLesson } from '../checkpointAdapter';
import {
  UNRELEASED_UNIT_IDS,
  getCourseUnitContextCopy,
  getCourseUnitRoute,
  isCheckpointUnit,
  isCourseUnitRouteAvailable,
  listStrandedCourseUnits,
} from '../courseUnitRoutes';

describe('courseUnitRoutes', () => {
  it('routes lessons and checkpoints to their correct legacy engines', () => {
    expect(getCourseUnitRoute({ id: 'a1-1' })).toBe('/lesson/a1-1');
    expect(getCourseUnitRoute({ id: 'a1-checkpoint-1' })).toBe('/checkpoint/a1-checkpoint-1');
    expect(getCourseUnitRoute({ id: 'a2-checkpoint-1' })).toBe('/checkpoint/a2-checkpoint-1');
  });

  // The regression this file used to enshrine: getCourseUnitRoute returned null
  // for a1-checkpoint-4, the LAST unit of A1 and the gate to A2. The learner saw
  // it as their next step and it led nowhere.
  it('keeps every level-closing checkpoint reachable so a level can be finished', () => {
    expect(getCourseUnitRoute({ id: 'a1-checkpoint-4' })).toBe('/checkpoint/a1-checkpoint-4');
    expect(getCourseUnitRoute({ id: 'a2-checkpoint-4' })).toBe('/checkpoint/a2-checkpoint-4');
    expect(getCourseUnitRoute({ id: 'b1-checkpoint-4' })).toBe('/checkpoint/b1-checkpoint-4');
    expect(getCourseUnitRoute({ id: 'b2-checkpoint-4' })).toBe('/checkpoint/b2-checkpoint-4');
  });

  it('leaves no unit stranded: everything on the map is reachable or explicitly unreleased', () => {
    expect(listStrandedCourseUnits(courseIndex).map((unit) => unit.id)).toEqual([]);
  });

  it('never advertises a route for a unit declared unreleased', () => {
    for (const id of UNRELEASED_UNIT_IDS) {
      expect(getCourseUnitRoute({ id })).toBeNull();
      expect(isCourseUnitRouteAvailable({ id })).toBe(false);
    }
  });

  it('backs every advertised checkpoint route with data the checkpoint screen can render', () => {
    const checkpoints = courseIndex.filter(isCheckpointUnit);
    const linkedButUnrenderable = checkpoints
      .filter((unit) => getCourseUnitRoute(unit))
      .filter((unit) => {
        const resolved = resolveCheckpointLesson(courseData, unit.id);
        return !resolved || resolved.checkpoint.questions.length === 0;
      })
      .map((unit) => unit.id);

    expect(checkpoints.length).toBe(16);
    expect(linkedButUnrenderable).toEqual([]);
  });

  it('formats dashboard copy without undefined levels for checkpoint entries', () => {
    expect(getCourseUnitContextCopy({ id: 'a1-checkpoint-1' }, 4, 86)).toBe('A1 • Checkpoint 4 dari 86');
    expect(getCourseUnitContextCopy({ id: 'a1-1', level: 'A1' }, 1, 86)).toBe('A1 • Pelajaran 1 dari 86');
  });
});
