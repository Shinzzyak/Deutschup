import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

const counts: Record<string, number> = { A1: 1305, A2: 837, B1: 116, B2: 214 };

vi.mock('../../stores/progressStore', () => ({
  useProgressStore: () => ({
    currentLevel: 'A1',
    completedLessons: ['a1-1'],
    unlockedLessons: ['a1-1', 'a1-2', 'a1-checkpoint-1'],
  }),
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: async (_field: string, level: string) => ({ count: counts[level] || 0, error: null }),
      }),
    }),
  },
}));

// Refactor A: CurriculumStudio resolves checkpoint availability via lessons-db
// (getAllLessons). Mock the fetch layer with all 16 checkpoints so the studio's
// readiness counters match the static course index offline.
const ALL_CHECKPOINTS = ['a1', 'a2', 'b1', 'b2'].flatMap(prefix =>
  [1, 2, 3, 4].map(n => ({
    id: `${prefix}-checkpoint-${n}`,
    level: prefix.toUpperCase(),
    title: `Review ${prefix.toUpperCase()} ${n}`,
    requiredScore: 0.7,
    reviewLessons: ['a1-1'],
    questions: [{ question: `Frage ${prefix}-${n}?`, options: ['A', 'B', 'C'], correctAnswer: 0 }],
  })),
);

vi.mock('../../lib/lessons-db', () => ({
  getAllLessons: async () => [
    { id: 'a1-1', level: 'A1', title: 'Perkenalan & Salam' },
    { id: 'a1-2', level: 'A1', title: 'Lektion 2' },
    ...ALL_CHECKPOINTS,
  ],
}));

import CurriculumStudio from '../CurriculumStudio';

describe('CurriculumStudio', () => {
  it('renders a database-aware curriculum map while preserving legacy exercise links', async () => {
    render(
      <MemoryRouter>
        <CurriculumStudio />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /Kurikulum Studio/i })).toBeInTheDocument();
    expect(screen.getByText(/86 unit kurikulum/i)).toBeInTheDocument();
    expect(screen.getByText(/70 pelajaran/i)).toBeInTheDocument();
    expect(screen.getByText(/16 evaluasi/i)).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText(/2\.472 kata tersedia/i)).toBeInTheDocument());

    expect(screen.getByRole('link', { name: /Mulai pelajaran berikutnya/i })).toHaveAttribute('href', '/lesson/a1-2');
    expect(screen.getByRole('link', { name: /Buka latihan kosakata/i })).toHaveAttribute('href', '/vocab');
    expect(screen.getByRole('link', { name: /Perkenalan & Salam/i })).toHaveAttribute('href', '/lesson/a1-1');
    expect(screen.getAllByRole('link', { name: /Review Konten Sebelumnya/i })[0]).toHaveAttribute('href', '/checkpoint/a1-checkpoint-1');
    expect(screen.getByText(/16 checkpoint siap/i)).toBeInTheDocument();
    expect(screen.getByText(/0 data belum siap/i)).toBeInTheDocument();
    expect(screen.getAllByText(/30 unit siap/i)).toHaveLength(2);
  });
});
