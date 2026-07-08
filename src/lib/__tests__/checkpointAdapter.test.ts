import { describe, expect, it } from 'vitest';
import { courseIndex } from '../../data/lessonIndex';
import { courseData } from '../../data/lessons';
import { listResolvableCheckpointIds, resolveCheckpointLesson } from '../checkpointAdapter';

describe('checkpointAdapter', () => {
  it('resolves legacy top-level checkpoint lessons used by CheckpointView routes', () => {
    const resolved = resolveCheckpointLesson(courseData, 'a1-checkpoint-1');

    expect(resolved?.lesson.id).toBe('a1-checkpoint-1');
    expect(resolved?.checkpoint.title).toMatch(/Review Konten Sebelumnya/i);
    expect(resolved?.checkpoint.questions.length).toBeGreaterThan(0);
    expect(resolved?.checkpoint.requiredScore).toBeGreaterThan(0);
  });

  it('resolves current nested checkpoints where the route id lives in lesson.checkpoint.id', () => {
    const resolved = resolveCheckpointLesson(courseData, 'a2-checkpoint-1');

    expect(resolved?.checkpoint.id).toBe('a2-checkpoint-1');
    expect(resolved?.checkpoint.questions.length).toBeGreaterThan(0);
  });

  it('lists only checkpoint ids that CheckpointView can actually render', () => {
    const resolvable = listResolvableCheckpointIds(courseData);
    const unresolved = courseIndex
      .filter((unit) => unit.id.includes('checkpoint'))
      .map((unit) => unit.id)
      .filter((id) => !resolvable.includes(id));

    expect(resolvable).toContain('a1-checkpoint-1');
    expect(resolvable).toContain('a2-checkpoint-1');
    expect(unresolved).toEqual(expect.arrayContaining(['a1-checkpoint-4', 'a2-checkpoint-4', 'b1-checkpoint-4', 'b2-checkpoint-4']));
  });
});
