export type Level = 'A1' | 'A2' | 'B1' | 'B2';

export interface VocabWord {
  id: string;
  word: string;
  article?: 'der' | 'die' | 'das' | 'die (plural)' | string;
  translation: string;
  exampleSentence: string;
  phonetic: string;
  level: Level;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Dialogue {
  personA: string;
  personB: string;
  translation: string;
}

export interface Checkpoint {
  id: string; // e.g. "a1-checkpoint-1"
  title: string;
  requiredScore: number; // 0.70
  questions: QuizQuestion[];
  reviewLessons: string[]; // ids of 3 previous lessons
  type?: 'checkpoint';
}

export interface Lesson {
  id: string;
  level?: Level;
  title?: string;
  grammarDescription?: string;
  sentenceBreakdowns?: string[];
  pronunciationTips?: string | string[];
  vocabulary?: VocabWord[];
  exercises?: QuizQuestion[];
  miniQuiz?: QuizQuestion[];
  dialogues?: Dialogue[];
  culturalNotes?: string;
  checkpoint?: Checkpoint;
  requiredScore?: number; // In case AI put it directly on Lesson
  questions?: QuizQuestion[];
  reviewLessons?: string[];
}

export * from './lessons';

