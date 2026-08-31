// Typed exercise model — extends the legacy MC-only QuizQuestion WITHOUT
// touching it (checkpointAdapter + checkpoint scoring still consume
// lesson.exercises). New types flow through Lesson.exercisesV2.
export type ExerciseType =
  | 'multiple_choice'
  | 'true_false'
  | 'short_answer'
  | 'fill_blank'
  | 'matching'
  | 'essay';

export interface ExerciseV2Base {
  /** DB sort_order — presentation order inside a lesson quiz. */
  order: number;
  question: string;
  hint?: string;
}

export interface MCExerciseV2 extends ExerciseV2Base {
  type: 'multiple_choice';
  options: string[];
  correctAnswer: number;
}

/** options = [positive label, negative label] (default Richtig/Falsch). */
export interface TFExerciseV2 extends ExerciseV2Base {
  type: 'true_false';
  options: [string, string];
  correctAnswer: 0 | 1;
}

/** question for fill_blank contains `___`; accepted = normalized-match list. */
export interface TextAnswerExerciseV2 extends ExerciseV2Base {
  type: 'short_answer' | 'fill_blank';
  accepted: string[];
}

/** pairs = [left, right]; learner pairs left item → one of the right options. */
export interface MatchingExerciseV2 extends ExerciseV2Base {
  type: 'matching';
  pairs: Array<[string, string]>;
}

/** AI-graded via /api/ai?action=check-answer (same path as the old free_text). */
export interface EssayExerciseV2 extends ExerciseV2Base {
  type: 'essay';
}

export type ExerciseV2 =
  | MCExerciseV2
  | TFExerciseV2
  | TextAnswerExerciseV2
  | MatchingExerciseV2
  | EssayExerciseV2;
