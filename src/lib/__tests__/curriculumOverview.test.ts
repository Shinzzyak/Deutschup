import { describe, expect, it } from 'vitest';
import { testLessons } from './testLessonsFixture';
import { courseIndex } from '../../data/lessonIndex';
import { listResolvableCheckpointIds } from '../checkpointAdapter';
import { hydrateCourseUnitRoutesFromLessons } from '../courseUnitRoutes';
import { buildCurriculumOverview, inferUnitLevel } from '../curriculumOverview';

const dbCounts = { A1: 1305, A2: 837, B1: 116, B2: 214 };

// Offline snapshot: inject the fixture into the route-availability cache before
// the overview assertions run.
hydrateCourseUnitRoutesFromLessons(testLessons);

const availableCheckpointIds = listResolvableCheckpointIds(testLessons);

describe('curriculumOverview', () => {
  it('summarizes the full A1-B2 roadmap from the static curriculum index', () => {
    const overview = buildCurriculumOverview(courseIndex, {
      currentLevel: 'A1',
      dbLevelCounts: dbCounts,
      completedLessons: [],
      unlockedLessons: ['a1-1'],
      availableCheckpointIds,
    });

    expect(overview.totalUnits).toBe(86);
    expect(overview.totalLessons).toBe(70);
    expect(overview.totalCheckpoints).toBe(16);
    expect(overview.totalVocabulary).toBe(2472);

    expect(overview.levels.A1.lessonCount).toBe(26);
    expect(overview.levels.A1.checkpointCount).toBe(4);
    expect(overview.levels.A2.lessonCount).toBe(18);
    expect(overview.levels.A2.checkpointCount).toBe(4);
    expect(overview.levels.B1.lessonCount).toBe(14);
    expect(overview.levels.B1.checkpointCount).toBe(4);
    expect(overview.levels.B2.lessonCount).toBe(12);
    expect(overview.levels.B2.checkpointCount).toBe(4);
  });

  it('infers checkpoint levels from ids so checkpoint rows are not lost', () => {
    expect(inferUnitLevel({ id: 'a1-checkpoint-1' })).toBe('A1');
    expect(inferUnitLevel({ id: 'b2-checkpoint-4' })).toBe('B2');
  });

  it('only links unlocked units and does not open same-level locked content', () => {
    const overview = buildCurriculumOverview(courseIndex, {
      currentLevel: 'A1',
      dbLevelCounts: dbCounts,
      completedLessons: ['a1-1'],
      unlockedLessons: ['a1-1', 'a1-2', 'a1-checkpoint-1'],
      availableCheckpointIds,
    });

    const completed = overview.levels.A1.units.find((u) => u.id === 'a1-1');
    const nextLesson = overview.levels.A1.units.find((u) => u.id === 'a1-2');
    const lockedSameLevel = overview.levels.A1.units.find((u) => u.id === 'a1-3');
    const checkpoint = overview.levels.A1.units.find((u) => u.id === 'a1-checkpoint-1');
    const levelClosingCheckpoint = overview.levels.A1.units.find((u) => u.id === 'a1-checkpoint-4');

    expect(overview.levels.A1.completedCount).toBe(1);
    expect(completed?.href).toBe('/lesson/a1-1');
    expect(nextLesson?.href).toBe('/lesson/a1-2');
    expect(checkpoint?.href).toBe('/checkpoint/a1-checkpoint-1');
    expect(lockedSameLevel?.href).toBeNull();
    expect(lockedSameLevel?.status).toBe('locked');
    // The gate to A2 has runtime data now; it is locked only because the
    // learner has not reached it, not because it can never be opened.
    expect(levelClosingCheckpoint?.routeAvailable).toBe(true);
    expect(levelClosingCheckpoint?.href).toBeNull();
    expect(levelClosingCheckpoint?.status).toBe('locked');
    expect(overview.nextUnit?.id).toBe('a1-2');
  });

  it('fails closed for checkpoint route availability when no runtime availability list is provided', () => {
    const overview = buildCurriculumOverview(courseIndex, {
      currentLevel: 'A1',
      dbLevelCounts: dbCounts,
      completedLessons: [],
      unlockedLessons: ['a1-checkpoint-1'],
    });

    const checkpoint = overview.levels.A1.units.find((u) => u.id === 'a1-checkpoint-1');

    expect(checkpoint?.routeAvailable).toBe(false);
    expect(checkpoint?.href).toBeNull();
    expect(overview.availableCheckpointCount).toBe(0);
    expect(overview.unavailableCheckpointCount).toBe(16);
  });

  it('summarizes checkpoint and data readiness for the studio UI', () => {
    const overview = buildCurriculumOverview(courseIndex, {
      currentLevel: 'A1',
      dbLevelCounts: dbCounts,
      completedLessons: ['a1-1'],
      unlockedLessons: ['a1-1', 'a1-2', 'a1-checkpoint-1'],
      availableCheckpointIds,
    });

    expect(overview.availableCheckpointCount).toBe(16);
    expect(overview.unavailableCheckpointCount).toBe(0);
    expect(overview.levels.A1.routeReadyCount).toBe(30);
    expect(overview.levels.A1.pendingDataCount).toBe(0);
    expect(overview.levels.A1.countableCount).toBe(30);
  });

  it('keeps unreleased units out of progression so a level can still reach 100%', () => {
    const units = [
      { id: 'a1-1', level: 'A1' as const },
      { id: 'a1-2', level: 'A1' as const },
      { id: 'a1-checkpoint-1' },
    ];
    const overview = buildCurriculumOverview(units, {
      currentLevel: 'A1',
      completedLessons: ['a1-1', 'a1-2'],
      unlockedLessons: ['a1-1', 'a1-2', 'a1-checkpoint-1'],
      availableCheckpointIds: [], // checkpoint has no runtime data — unreleased
    });

    const unreleased = overview.levels.A1.units.find((u) => u.id === 'a1-checkpoint-1');

    expect(unreleased?.routeAvailable).toBe(false);
    expect(unreleased?.href).toBeNull();
    expect(overview.levels.A1.countableCount).toBe(2);
    expect(overview.levels.A1.progressPercent).toBe(100);
    expect(overview.countableUnits).toBe(2);
    expect(overview.progressPercent).toBe(100);
    // And it is never offered as the next step.
    expect(overview.nextUnit).toBeNull();
  });
});
