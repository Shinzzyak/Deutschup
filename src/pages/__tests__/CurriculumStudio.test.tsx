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
    expect(screen.getByText(/12 checkpoint siap/i)).toBeInTheDocument();
    expect(screen.getByText(/4 data belum siap/i)).toBeInTheDocument();
    expect(screen.getAllByText(/29 unit siap/i)).toHaveLength(2);
  });
});
