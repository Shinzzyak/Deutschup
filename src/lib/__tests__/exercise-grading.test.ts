import { describe, it, expect } from 'vitest';
import { normalizeGerman, gradeChoice, gradeTextAnswer, gradeMatching, matchingAnswerKey } from '../exercise-grading';
import { rowToExerciseV2 } from '../exercise-mapper';
import type { ExerciseRow2 } from '../../lib/lessons-db-types';

describe('normalizeGerman', () => {
  it('folds umlauts and ß', () => {
    expect(normalizeGerman('Über Übung')).toBe('ueber uebung');
    expect(normalizeGerman('Größe')).toBe('groesse');
  });
  it('lowercases, collapses whitespace, strips trailing punctuation', () => {
    expect(normalizeGerman('  Guten   Morgen! ')).toBe('guten morgen');
    expect(normalizeGerman('Ja.')).toBe('ja');
  });
  it('keeps internal punctuation', () => {
    expect(normalizeGerman('Ich heiße Anna, danke')).toBe('ich heisse anna, danke');
  });
});

describe('gradeChoice', () => {
  it('matches by index', () => {
    expect(gradeChoice('B', ['A', 'B', 'C'], 1)).toBe(true);
    expect(gradeChoice('A', ['A', 'B', 'C'], 1)).toBe(false);
  });
});

describe('gradeTextAnswer', () => {
  it('accepts any variant with normalization', () => {
    expect(gradeTextAnswer('Übung', ['uebung'])).toBe(true);
    expect(gradeTextAnswer('uebung', ['Übung'])).toBe(true);
    expect(gradeTextAnswer('Ja!', ['ja'])).toBe(true);
  });
  it('rejects wrong answers and empty input', () => {
    expect(gradeTextAnswer('Nein', ['ja'])).toBe(false);
    expect(gradeTextAnswer('  ', ['ja'])).toBe(false);
  });
  it('does not do partial matching', () => {
    expect(gradeTextAnswer('ich gehe', ['gehe'])).toBe(false);
  });
});

describe('gradeMatching', () => {
  const key: Array<[string, string]> = [['der Hund', 'the dog'], ['die Katze', 'the cat']];
  it('accepts the correct full pairing', () => {
    expect(gradeMatching([['die Katze', 'the cat'], ['der Hund', 'the dog']], key)).toBe(true);
  });
  it('rejects a wrong pair', () => {
    expect(gradeMatching([['der Hund', 'the cat'], ['die Katze', 'the dog']], key)).toBe(false);
  });
  it('rejects missing or extra pairs', () => {
    expect(gradeMatching([['der Hund', 'the dog']], key)).toBe(false);
    expect(gradeMatching([...key, ['das Haus', 'the house']], key)).toBe(false);
  });
  it('normalizes umlauts on both sides', () => {
    expect(gradeMatching([['der Bär', 'the bear']], [['der Baer', 'the bear']])).toBe(true);
  });
});

describe('matchingAnswerKey', () => {
  it('formats pairs readably', () => {
    expect(matchingAnswerKey([['a', 'x'], ['b', 'y']])).toBe('a → x   ·   b → y');
  });
});

const baseRow = (over: Partial<ExerciseRow2>): ExerciseRow2 => ({
  lesson_id: 'a1-1', question: 'Q?', options: [], correct_answer: 0, sort_order: 0, ...over,
});

describe('rowToExerciseV2', () => {
  it('maps a v2 MC row (answer = correct index as jsonb number)', () => {
    const ex = rowToExerciseV2(baseRow({ exercise_type: 'multiple_choice', options: ['A', 'B'], correct_answer: 1, answer: 1 }));
    expect(ex).toEqual({ type: 'multiple_choice', order: 0, question: 'Q?', options: ['A', 'B'], correctAnswer: 1 });
  });
  it('returns null for a legacy MC row (answer null — legacy flow serves it)', () => {
    expect(rowToExerciseV2(baseRow({ exercise_type: 'multiple_choice', options: ['A', 'B'], correct_answer: 1, answer: null }))).toBeNull();
  });
  it('rejects v2 MC with out-of-range index', () => {
    expect(rowToExerciseV2(baseRow({ exercise_type: 'multiple_choice', options: ['A', 'B'], correct_answer: 5, answer: 5 }))).toBeNull();
  });
  it('maps true_false with boolean answer', () => {
    const ex = rowToExerciseV2(baseRow({ exercise_type: 'true_false', question: 'Berlin ist in Deutschland.', answer: true }));
    expect(ex).toMatchObject({ type: 'true_false', correctAnswer: 0, options: ['Richtig', 'Falsch'] });
  });
  it('rejects true_false without a boolean answer', () => {
    expect(rowToExerciseV2(baseRow({ exercise_type: 'true_false', answer: null }))).toBeNull();
  });
  it('maps short_answer with accepted variants', () => {
    const ex = rowToExerciseV2(baseRow({ exercise_type: 'short_answer', answer: ['ja', 'Jein'] }));
    expect(ex).toMatchObject({ type: 'short_answer', accepted: ['ja', 'Jein'] });
  });
  it('rejects short_answer with null answer', () => {
    expect(rowToExerciseV2(baseRow({ exercise_type: 'short_answer', answer: null }))).toBeNull();
  });
  it('rejects fill_blank without ___', () => {
    expect(rowToExerciseV2(baseRow({ exercise_type: 'fill_blank', answer: ['der'] }))).toBeNull();
  });
  it('maps fill_blank with ___', () => {
    const ex = rowToExerciseV2(baseRow({ exercise_type: 'fill_blank', question: '___ Hund ist groß.', answer: ['Der', 'der'] }));
    expect(ex).toMatchObject({ type: 'fill_blank', accepted: ['Der', 'der'] });
  });
  it('maps matching pairs', () => {
    const ex = rowToExerciseV2(baseRow({
      exercise_type: 'matching',
      question: 'Paare',
      answer: [['der Hund', 'the dog'], ['die Katze', 'the cat']],
    }));
    expect(ex).toMatchObject({ type: 'matching', pairs: [['der Hund', 'the dog'], ['die Katze', 'the cat']] });
  });
  it('rejects malformed matching payloads', () => {
    expect(rowToExerciseV2(baseRow({ exercise_type: 'matching', answer: [['x']] }))).toBeNull();
    expect(rowToExerciseV2(baseRow({ exercise_type: 'matching', answer: 'nope' }))).toBeNull();
  });
  it('maps essay with no answer payload', () => {
    expect(rowToExerciseV2(baseRow({ exercise_type: 'essay', question: 'Beschreibe deinen Tag.', answer: null })))
      .toMatchObject({ type: 'essay' });
  });
  it('returns null for unknown types (legacy-only, served by legacy flow)', () => {
    expect(rowToExerciseV2(baseRow({ exercise_type: 'quiz', options: ['A', 'B'], correct_answer: 0, answer: null }))).toBeNull();
  });
  it('rejects empty questions', () => {
    expect(rowToExerciseV2(baseRow({ question: '   ' }))).toBeNull();
  });
});
