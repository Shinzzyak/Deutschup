import { describe, expect, it } from 'vitest';
import { summarizeVocabulary, summarizeLevelCounts, LEVELS } from '../vocabStats';

describe('vocabStats', () => {
  it('summarizes vocabulary by CEFR level and progress state', () => {
    const now = 1_700_000_000_000;
    const rows = [
      { id: 'a1-haus', level_id: 'A1' },
      { id: 'a1-brot', level_id: 'A1' },
      { id: 'a2-reise', level_id: 'A2' },
      { id: 'b1-arbeit', level_id: 'B1' },
    ];

    const summary = summarizeVocabulary(rows, {
      'a1-haus': { status: 'known', nextReview: now + 86_400_000 },
      'a1-brot': { status: 'learning', nextReview: now - 1 },
      'b1-arbeit': { status: 'learning', nextReview: now + 86_400_000 },
    }, now);

    expect(summary.total).toBe(4);
    expect(summary.known).toBe(1);
    expect(summary.learning).toBe(2);
    expect(summary.newWords).toBe(1);
    expect(summary.due).toBe(2);
    expect(summary.byLevel.A1).toMatchObject({ total: 2, known: 1, learning: 1, newWords: 0, due: 1 });
    expect(summary.byLevel.A2).toMatchObject({ total: 1, known: 0, learning: 0, newWords: 1, due: 1 });
    expect(summary.byLevel.B2).toMatchObject({ total: 0, known: 0, learning: 0, newWords: 0, due: 0 });
    expect(summary.knownPercent).toBe(25);
    expect(LEVELS).toEqual(['A1', 'A2', 'B1', 'B2']);
  });

  it('summarizes DB level counts from Supabase count results', () => {
    const counts = summarizeLevelCounts({ A1: 1305, A2: 837, B1: 116, B2: 214 });

    expect(counts.total).toBe(2472);
    expect(counts.largestLevel).toEqual({ level: 'A1', count: 1305 });
    expect(counts.byLevel.A2.percentOfTotal).toBe(34);
    expect(counts.byLevel.B1.percentOfTotal).toBe(5);
  });

  it('handles empty database results without NaN percentages', () => {
    const summary = summarizeVocabulary([], {}, 100);
    const counts = summarizeLevelCounts({});

    expect(summary.knownPercent).toBe(0);
    expect(summary.byLevel.A1.knownPercent).toBe(0);
    expect(counts.total).toBe(0);
    expect(counts.byLevel.A1.percentOfTotal).toBe(0);
    expect(counts.largestLevel).toEqual({ level: 'A1', count: 0 });
  });
});
