import type { VocabProgress } from '../stores/progressStore';

export const LEVELS = ['A1', 'A2', 'B1', 'B2'] as const;
export type CefrLevel = (typeof LEVELS)[number];

export interface VocabularyLike {
  id: string;
  level_id?: string | null;
}

export interface LevelVocabularySummary {
  total: number;
  known: number;
  learning: number;
  newWords: number;
  due: number;
  knownPercent: number;
}

export interface VocabularySummary extends LevelVocabularySummary {
  byLevel: Record<CefrLevel, LevelVocabularySummary>;
}

export interface LevelCountSummary {
  total: number;
  percentOfTotal: number;
}

export interface DatabaseLevelCounts {
  total: number;
  byLevel: Record<CefrLevel, LevelCountSummary>;
  largestLevel: { level: CefrLevel; count: number };
}

const emptyLevelSummary = (): LevelVocabularySummary => ({
  total: 0,
  known: 0,
  learning: 0,
  newWords: 0,
  due: 0,
  knownPercent: 0,
});

const makeLevelMap = <T>(factory: () => T): Record<CefrLevel, T> => ({
  A1: factory(),
  A2: factory(),
  B1: factory(),
  B2: factory(),
});

const percent = (value: number, total: number) => {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
};

const normalizeLevel = (level: string | null | undefined): CefrLevel | null => {
  const upper = (level || '').toUpperCase();
  return LEVELS.includes(upper as CefrLevel) ? (upper as CefrLevel) : null;
};

export function summarizeVocabulary(
  rows: VocabularyLike[],
  progress: Record<string, VocabProgress>,
  now = Date.now(),
): VocabularySummary {
  const summary: VocabularySummary = {
    ...emptyLevelSummary(),
    byLevel: makeLevelMap(emptyLevelSummary),
  };

  for (const row of rows) {
    const level = normalizeLevel(row.level_id);
    const buckets = [summary, ...(level ? [summary.byLevel[level]] : [])];
    const state = progress[row.id];
    const isDue = !state || state.nextReview <= now;

    for (const bucket of buckets) {
      bucket.total += 1;
      if (state?.status === 'known') bucket.known += 1;
      else if (state?.status === 'learning') bucket.learning += 1;
      else bucket.newWords += 1;
      if (isDue) bucket.due += 1;
    }
  }

  summary.knownPercent = percent(summary.known, summary.total);
  for (const level of LEVELS) {
    summary.byLevel[level].knownPercent = percent(summary.byLevel[level].known, summary.byLevel[level].total);
  }

  return summary;
}

export function summarizeLevelCounts(counts: Partial<Record<CefrLevel | string, number>>): DatabaseLevelCounts {
  const byLevel = makeLevelMap<LevelCountSummary>(() => ({ total: 0, percentOfTotal: 0 }));
  let total = 0;

  for (const level of LEVELS) {
    const count = counts[level] || 0;
    byLevel[level].total = count;
    total += count;
  }

  let largestLevel: { level: CefrLevel; count: number } = { level: 'A1', count: byLevel.A1.total };
  for (const level of LEVELS) {
    byLevel[level].percentOfTotal = percent(byLevel[level].total, total);
    if (byLevel[level].total > largestLevel.count) {
      largestLevel = { level, count: byLevel[level].total };
    }
  }

  return { total, byLevel, largestLevel };
}
