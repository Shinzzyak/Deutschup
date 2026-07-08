import { describe, expect, it } from 'vitest';
import { courseIndex } from '../../data/lessonIndex';
import { getCourseUnitRoute, isCourseUnitRouteAvailable } from '../courseUnitRoutes';

describe('courseUnitRoutes', () => {
  it('routes lessons and renderable checkpoints to their correct legacy engines', () => {
    expect(getCourseUnitRoute({ id: 'a1-1' })).toBe('/lesson/a1-1');
    expect(getCourseUnitRoute({ id: 'a1-checkpoint-1' })).toBe('/checkpoint/a1-checkpoint-1');
    expect(getCourseUnitRoute({ id: 'a2-checkpoint-1' })).toBe('/checkpoint/a2-checkpoint-1');
  });

  it('does not generate broken links for checkpoints missing runtime checkpoint data', () => {
    expect(getCourseUnitRoute({ id: 'a1-checkpoint-4' })).toBeNull();
    expect(getCourseUnitRoute({ id: 'a2-checkpoint-4' })).toBeNull();
    expect(getCourseUnitRoute({ id: 'b1-checkpoint-4' })).toBeNull();
    expect(getCourseUnitRoute({ id: 'b2-checkpoint-4' })).toBeNull();
  });

  it('classifies every indexed checkpoint consistently with route availability', () => {
    const checkpoints = courseIndex.filter((unit) => unit.id.includes('checkpoint'));
    const brokenLinks = checkpoints
      .map((unit) => ({ id: unit.id, href: getCourseUnitRoute(unit), available: isCourseUnitRouteAvailable(unit) }))
      .filter((unit) => unit.href && !unit.available);

    expect(brokenLinks).toEqual([]);
    expect(checkpoints.some((unit) => !isCourseUnitRouteAvailable(unit))).toBe(true);
  });
});
