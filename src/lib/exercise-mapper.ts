// DB row (snake_case) → typed ExerciseV2. Legacy rows (answer jsonb 'null' +
// non-MC exercise_type in legacy 'quiz'/'multiple_choice' semantics) still
// resolve as multiple_choice via correct_answer index.
import type { ExerciseRow2 } from './lessons-db-types';
import type { ExerciseV2, ExerciseType } from './exercise-types';

const KNOWN: ExerciseType[] = ['multiple_choice', 'true_false', 'short_answer', 'fill_blank', 'matching', 'essay'];

export function rowToExerciseV2(row: ExerciseRow2): ExerciseV2 | null {
  const question = typeof row.question === 'string' ? row.question.trim() : '';
  if (!question) return null;
  const order = typeof row.sort_order === 'number' ? row.sort_order : 0;
  const hint = typeof row.hint === 'string' && row.hint.trim() ? row.hint : undefined;

  const rawType = KNOWN.includes(row.exercise_type as ExerciseType) ? row.exercise_type as ExerciseType : 'multiple_choice';
  const answer = row.answer ?? null;

  switch (rawType) {
    case 'true_false': {
      const pos = Array.isArray(row.options) && typeof row.options[0] === 'string' ? row.options[0] : 'Richtig';
      const neg = Array.isArray(row.options) && typeof row.options[1] === 'string' ? row.options[1] : 'Falsch';
      const correct = answer === true || answer === 'true' ? 0 : answer === false || answer === 'false' ? 1 : null;
      if (correct === null) return null;
      return { type: 'true_false', order, question, hint, options: [pos, neg], correctAnswer: correct as 0 | 1 };
    }
    case 'short_answer':
    case 'fill_blank': {
      if (!Array.isArray(answer)) return null;
      const accepted = answer.filter((a): a is string => typeof a === 'string' && a.trim().length > 0);
      if (accepted.length === 0) return null;
      if (rawType === 'fill_blank' && !question.includes('___')) return null;
      return { type: rawType, order, question, hint, accepted };
    }
    case 'matching': {
      if (!Array.isArray(answer) || answer.length < 2) return null;
      const pairs: Array<[string, string]> = [];
      for (const pair of answer) {
        if (!Array.isArray(pair) || pair.length !== 2) return null;
        const [l, r] = pair;
        if (typeof l !== 'string' || typeof r !== 'string' || !l.trim() || !r.trim()) return null;
        pairs.push([l, r]);
      }
      return { type: 'matching', order, question, hint, pairs };
    }
    case 'essay':
      return { type: 'essay', order, question, hint };
    case 'multiple_choice':
    default: {
      const options = Array.isArray(row.options) ? row.options.filter((o): o is string => typeof o === 'string') : [];
      if (options.length < 2) return null;
      const idx = row.correct_answer;
      if (typeof idx !== 'number' || idx < 0 || idx >= options.length) return null;
      return { type: 'multiple_choice', order, question, hint, options, correctAnswer: idx };
    }
  }
}
