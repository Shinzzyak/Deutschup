import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

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
    render(
      <MemoryRouter initialEntries={['/vocab']}>
        <VocabTrainerDB />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByRole('heading', { name: /^Latihan Kosakata$/i })).toBeInTheDocument());

    expect(screen.getByText(/Kosakata Kurikulum/i)).toBeInTheDocument();
    expect(screen.getByText('2.472')).toBeInTheDocument();
    expect(screen.getByText((_text, element) =>
      element?.tagName === 'P' && element.textContent?.includes('1 siap diulang') === true
    )).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Daftar Kata/i })).toBeInTheDocument();

    expect(screen.queryByText(/Supabase/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Stisla/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/DB words/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Command Center/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/token konsisten|card dense|database curriculum/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/All Words|New Words|Flashcards|Progress filter|Sort/i)).not.toBeInTheDocument();
  });
});
