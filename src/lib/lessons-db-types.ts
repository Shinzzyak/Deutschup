// Server exercise row (snake_case, from /api/curriculum) — extends the legacy
// ExerciseRow with the new typed-exercise columns. Lives in its own module so
// lessons-db keeps its exact existing shape (checkpoint consumers untouched).
export interface ExerciseRow2 {
  lesson_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  sort_order: number | null;
  exercise_type?: string;
  answer?: unknown;
  hint?: string;
}
