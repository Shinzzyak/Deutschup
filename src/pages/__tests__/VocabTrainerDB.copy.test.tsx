import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

const vocabRows = [
  {
    id: 'vocab-a1-1',
    lesson_id: 'a1-1',
    level_id: 'A1',
    word: 'Hallo',
    article: null,
    translation: 'Halo',
    example_sentence: 'Hallo, ich bin Anna.',
    phonetic: 'ha-lo',
    sort_order: 1,
  },
];

const counts: Record<string, number> = { A1: 1305, A2: 837, B1: 116, B2: 214 };

vi.mock('../../stores/authStore', () => ({
  useAuthStore: () => ({ user: null }),
}));

vi.mock('../../stores/progressStore', () => ({
  useProgressStore: () => ({
    vocab: {},
    loadProgress: vi.fn().mockResolvedValue(undefined),
    updateVocab: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: (_columns: string, options?: { count?: string; head?: boolean }) => ({
        eq: (_field: string, level: string) => {
          if (options?.head) return Promise.resolve({ count: counts[level] || 0, error: null });
          return {
            order: () => Promise.resolve({ data: level === 'A1' ? vocabRows : [], error: null }),
          };
        },
      }),
    }),
  },
}));

import VocabTrainerDB from '../VocabTrainerDB';

describe('VocabTrainerDB production copy', () => {
  it('renders learner-facing wording without backend or design-system jargon', async () => {
    render(<VocabTrainerDB />);

    await waitFor(() => expect(screen.getByRole('heading', { name: /Pusat Latihan Kosakata/i })).toBeInTheDocument());

    expect(screen.getByText(/Kosakata Kurikulum/i)).toBeInTheDocument();
    expect(screen.getByText(/2\.472 kata tersedia/i)).toBeInTheDocument();
    expect(screen.getAllByText(/1 perlu review/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Latihan kosakata Jerman/i)).toBeInTheDocument();

    expect(screen.queryByText(/Supabase/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Stisla/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/DB words/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Command Center/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/token konsisten|card dense|database curriculum/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/All Words|New Words|Flashcards|Progress filter|Sort/i)).not.toBeInTheDocument();
  });
});
