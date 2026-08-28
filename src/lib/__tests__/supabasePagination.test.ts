import { describe, expect, it, vi } from 'vitest';
import { fetchAllRows } from '../supabasePagination';

describe('fetchAllRows', () => {
  it('keeps fetching pages until the final short page', async () => {
    const page = vi.fn(async (from: number, to: number) => {
      expect(to - from + 1).toBe(1000);
      if (from === 0) return { data: Array.from({ length: 1000 }, (_, i) => i), error: null };
      if (from === 1000) return { data: Array.from({ length: 1000 }, (_, i) => i + 1000), error: null };
      return { data: [2000, 2001], error: null };
    });

    await expect(fetchAllRows(page)).resolves.toHaveLength(2002);
    expect(page).toHaveBeenCalledTimes(3);
  });

  it('returns the database error without caching a partial result', async () => {
    const error = new Error('network down');
    const page = vi.fn(async (from: number) => from === 0
      ? { data: Array.from({ length: 1000 }, (_, i) => i), error: null }
      : { data: null, error });

    await expect(fetchAllRows(page)).rejects.toThrow('network down');
  });
});
