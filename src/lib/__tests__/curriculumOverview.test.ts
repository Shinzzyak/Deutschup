import { describe, expect, it } from 'vitest';
import { courseData } from '../../data/lessons';
import { courseIndex } from '../../data/lessonIndex';
import { listResolvableCheckpointIds } from '../checkpointAdapter';
import { buildCurriculumOverview, inferUnitLevel } from '../curriculumOverview';

const dbCounts = { A1: 1305, A2: 837, B1: 116, B2: 214 };
const availableCheckpointIds = listResolvableCheckpointIds(courseData);

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
    const missingRuntimeCheckpoint = overview.levels.A1.units.find((u) => u.id === 'a1-checkpoint-4');

    expect(overview.levels.A1.completedCount).toBe(1);
    expect(completed?.href).toBe('/lesson/a1-1');
    expect(nextLesson?.href).toBe('/lesson/a1-2');
    expect(checkpoint?.href).toBe('/checkpoint/a1-checkpoint-1');
    expect(lockedSameLevel?.href).toBeNull();
    expect(lockedSameLevel?.status).toBe('locked');
    expect(missingRuntimeCheckpoint?.routeAvailable).toBe(false);
    expect(missingRuntimeCheckpoint?.href).toBeNull();
    expect(overview.nextUnit?.id).toBe('a1-2');
  });
});
