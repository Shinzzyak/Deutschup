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
    // Every checkpoint the map shows must resolve. The level-closing ones used
    // to be listed here as permanently unresolvable, which is exactly what left
    // A1 impossible to finish.
    expect(unresolved).toEqual([]);
  });

  it('rebuilds level-closing checkpoints from the lessons they review', () => {
    const resolved = resolveCheckpointLesson(courseData, 'a1-checkpoint-4');

    expect(resolved?.derived).toBe(true);
    expect(resolved?.checkpoint.id).toBe('a1-checkpoint-4');
    expect(resolved?.checkpoint.questions.length).toBeGreaterThanOrEqual(10);
    expect(resolved?.checkpoint.requiredScore).toBe(0.7);
    // "Review A1 Lengkap" has to span the level, not just its opening lessons.
    expect(resolved?.checkpoint.reviewLessons).toContain('a1-1');
    expect(resolved?.checkpoint.reviewLessons.some((id) => Number(id.split('-')[1]) > 15)).toBe(true);
  });

  it('only ever reuses real authored questions from the lessons it names', () => {
    const resolved = resolveCheckpointLesson(courseData, 'a1-checkpoint-4');
    const sourceQuestions = new Set(
      (resolved?.checkpoint.reviewLessons || [])
        .map((id) => courseData.find((lesson) => lesson.id === id))
        .flatMap((lesson) => [...(lesson?.exercises || []), ...(lesson?.miniQuiz || [])])
        .map((question) => question.question),
    );

    for (const question of resolved?.checkpoint.questions || []) {
      expect(sourceQuestions.has(question.question)).toBe(true);
    }
  });

  it('keeps derived questions scoreable: CheckpointView compares option strings', () => {
    for (const id of ['a1-checkpoint-4', 'a2-checkpoint-4', 'b1-checkpoint-4', 'b2-checkpoint-4']) {
      const resolved = resolveCheckpointLesson(courseData, id);
      expect(resolved, id).not.toBeNull();

      const questions = resolved?.checkpoint.questions || [];
      expect(questions.length, id).toBeGreaterThanOrEqual(10);

      for (const question of questions) {
        expect(question.options.length).toBeGreaterThanOrEqual(3);
        expect(new Set(question.options).size).toBe(question.options.length);
        expect(question.options[question.correctAnswer]).toBeTruthy();
      }
      // Same exam on every reload — the score would be meaningless otherwise.
      // A copied index bypasses the memo, so this really re-derives.
      const rederived = resolveCheckpointLesson(courseData, id, [...courseIndex]);
      expect(rederived?.checkpoint.questions).toEqual(questions);
    }
  });

  it('does not derive a checkpoint when the reviewed lessons carry no usable questions', () => {
    const emptyLessons = [
      { id: 'a1-1', level: 'A1' as const, title: 'Kosong', exercises: [] },
      { id: 'a1-2', level: 'A1' as const, title: 'Kosong', exercises: [] },
    ];
    const index = [
      { id: 'a1-1', level: 'A1' as const },
      { id: 'a1-2', level: 'A1' as const },
      { id: 'a1-checkpoint-1', title: 'Review A1' },
    ];

    expect(resolveCheckpointLesson(emptyLessons, 'a1-checkpoint-1', index)).toBeNull();
    expect(listResolvableCheckpointIds(emptyLessons, index)).toEqual([]);
  });
});
