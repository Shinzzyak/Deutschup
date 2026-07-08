import type { Checkpoint, Lesson } from '../data/course';

export interface ResolvedCheckpointLesson {
  lesson: Lesson;
  checkpoint: Checkpoint;
}

const hasQuestionList = (questions: unknown): questions is Checkpoint['questions'] => (
  Array.isArray(questions) && questions.length > 0
);

const lessonId = (lesson: Lesson) => typeof lesson.id === 'string' ? lesson.id : '';

const isTopLevelCheckpointLesson = (lesson: Lesson, id?: string) => {
  const idMatches = id ? lessonId(lesson) === id : lessonId(lesson).toLowerCase().includes('checkpoint');
  return idMatches && lessonId(lesson).toLowerCase().includes('checkpoint') && hasQuestionList(lesson.questions);
};

export function resolveCheckpointLesson(lessons: Lesson[], id: string | undefined): ResolvedCheckpointLesson | null {
  if (!id) return null;

  const lesson = lessons.find((candidate) => (
    lessonId(candidate) === id || candidate.checkpoint?.id === id
  ));
  if (!lesson) return null;

  if (lesson.checkpoint?.id === id && hasQuestionList(lesson.checkpoint.questions)) {
    return { lesson, checkpoint: lesson.checkpoint };
  }

  if (isTopLevelCheckpointLesson(lesson, id)) {
    return {
      lesson,
      checkpoint: {
        id: lessonId(lesson),
        title: lesson.title || 'Checkpoint',
        requiredScore: lesson.requiredScore || 0.7,
        questions: lesson.questions || [],
        reviewLessons: lesson.reviewLessons || [],
        type: 'checkpoint',
      },
    };
  }

  return null;
}

export function listResolvableCheckpointIds(lessons: Lesson[]): string[] {
  const ids = new Set<string>();

  for (const lesson of lessons) {
    if (lesson.checkpoint?.id && hasQuestionList(lesson.checkpoint.questions)) {
      ids.add(lesson.checkpoint.id);
    }
    if (isTopLevelCheckpointLesson(lesson)) {
      ids.add(lessonId(lesson));
    }
  }

  return Array.from(ids).sort();
}
