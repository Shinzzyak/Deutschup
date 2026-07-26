import type { LessonIndex } from '../data/lessonIndex';
import { LEVELS, type CefrLevel } from './vocabStats';

export type CurriculumUnitType = 'lesson' | 'checkpoint';
export type CurriculumUnitStatus = 'completed' | 'current' | 'open' | 'locked';

export interface CurriculumOverviewInput {
  currentLevel: CefrLevel;
  completedLessons: string[];
  unlockedLessons: string[];
  dbLevelCounts?: Partial<Record<CefrLevel | string, number>>;
  availableCheckpointIds?: Iterable<string>;
}

export interface CurriculumUnit {
  id: string;
  title: string;
  level: CefrLevel;
  type: CurriculumUnitType;
  href: string | null;
  completed: boolean;
  unlocked: boolean;
  routeAvailable: boolean;
  status: CurriculumUnitStatus;
  canDoGoals: string[];
}

export interface CurriculumLevelOverview {
  level: CefrLevel;
  title: string;
  description: string;
  accent: string;
  lessonCount: number;
  checkpointCount: number;
  routeReadyCount: number;
  pendingDataCount: number;
  /** Units that can actually be finished — the denominator of progressPercent. */
  countableCount: number;
  completedCount: number;
  progressPercent: number;
  vocabularyCount: number;
  units: CurriculumUnit[];
}

export interface CurriculumOverview {
  levels: Record<CefrLevel, CurriculumLevelOverview>;
  orderedLevels: CurriculumLevelOverview[];
  totalUnits: number;
  totalLessons: number;
  totalCheckpoints: number;
  availableCheckpointCount: number;
  unavailableCheckpointCount: number;
  /** Units that can actually be finished — the denominator of progressPercent. */
  countableUnits: number;
  totalVocabulary: number;
  completedUnits: number;
  progressPercent: number;
  nextUnit: CurriculumUnit | null;
}

const LEVEL_COPY: Record<CefrLevel, Pick<CurriculumLevelOverview, 'title' | 'description' | 'accent'>> = {
  A1: {
    title: 'A1 Foundation Sprint',
    description: 'Salam, artikel, angka, keluarga, Alltag, dan pola kalimat dasar.',
    accent: '#2d8a4e',
  },
  A2: {
    title: 'A2 Daily Fluency',
    description: 'Kasus, preposisi, Alltag lanjut, travel, dan percakapan praktis.',
    accent: '#0f766e',
  },
  B1: {
    title: 'B1 Independent Speaker',
    description: 'Argumentasi, Genitiv, Relativsatz, Konjunktiv II, dan Schreibtraining.',
    accent: '#2563eb',
  },
  B2: {
    title: 'B2 Exam & Academic Edge',
    description: 'Indirekte Rede, Passiv, Wissenschaft, Umwelt, idiom, dan exam polish.',
    accent: '#4f46e5',
  },
};

const levelFromPrefix = (id: string): CefrLevel | null => {
  const prefix = id.split('-')[0]?.toUpperCase();
  return LEVELS.includes(prefix as CefrLevel) ? (prefix as CefrLevel) : null;
};

export function inferUnitLevel(unit: Pick<LessonIndex, 'id' | 'level'>): CefrLevel {
  if (unit.level && LEVELS.includes(unit.level as CefrLevel)) return unit.level as CefrLevel;
  return levelFromPrefix(unit.id) || 'A1';
}

const getUnitType = (id: string): CurriculumUnitType => id.toLowerCase().includes('checkpoint') ? 'checkpoint' : 'lesson';

const getUnitHref = (id: string) => getUnitType(id) === 'checkpoint' ? `/checkpoint/${id}` : `/lesson/${id}`;

const percent = (value: number, total: number) => total > 0 ? Math.round((value / total) * 100) : 0;

export function buildCurriculumOverview(units: LessonIndex[], input: CurriculumOverviewInput): CurriculumOverview {
  const completed = new Set(input.completedLessons);
  const unlocked = new Set(input.unlockedLessons);
  const availableCheckpointIds = input.availableCheckpointIds ? new Set(input.availableCheckpointIds) : null;
  const levels = Object.fromEntries(
    LEVELS.map((level) => [
      level,
      {
        level,
        title: LEVEL_COPY[level].title,
        description: LEVEL_COPY[level].description,
        accent: LEVEL_COPY[level].accent,
        lessonCount: 0,
        checkpointCount: 0,
        routeReadyCount: 0,
        pendingDataCount: 0,
        countableCount: 0,
        completedCount: 0,
        progressPercent: 0,
        vocabularyCount: Number(input.dbLevelCounts?.[level] || 0),
        units: [] as CurriculumUnit[],
      },
    ]),
  ) as Record<CefrLevel, CurriculumLevelOverview>;

  for (const unit of units) {
    const level = inferUnitLevel(unit);
    const type = getUnitType(unit.id);
    const isCompleted = completed.has(unit.id);
    const routeAvailable = type === 'lesson' || Boolean(availableCheckpointIds?.has(unit.id));
    const progressUnlocked = unlocked.has(unit.id) || isCompleted;
    const isUnlocked = progressUnlocked && routeAvailable;
    const status: CurriculumUnitStatus = isCompleted
      ? 'completed'
      : isUnlocked
        ? 'current'
        : 'locked';

    const mapped: CurriculumUnit = {
      id: unit.id,
      title: unit.title || unit.id,
      level,
      type,
      href: isUnlocked ? getUnitHref(unit.id) : null,
      completed: isCompleted,
      unlocked: isUnlocked,
      routeAvailable,
      status,
      canDoGoals: unit.canDoGoals || [],
    };

    levels[level].units.push(mapped);
    if (type === 'checkpoint') levels[level].checkpointCount += 1;
    else levels[level].lessonCount += 1;
    if (routeAvailable) levels[level].routeReadyCount += 1;
    else levels[level].pendingDataCount += 1;
    // A unit with no route can never be finished, so it stays out of the
    // denominator — otherwise the ring sticks below 100% for a reason the
    // learner can do nothing about. Already-completed units stay countable even
    // if their route later disappears, so progress never silently drops.
    if (routeAvailable || isCompleted) levels[level].countableCount += 1;
    if (isCompleted) levels[level].completedCount += 1;
  }

  for (const level of LEVELS) {
    const item = levels[level];
    item.progressPercent = percent(item.completedCount, item.countableCount);
  }

  const orderedLevels = LEVELS.map((level) => levels[level]);
  const flatUnits = orderedLevels.flatMap((level) => level.units);
  const totalUnits = flatUnits.length;
  const totalLessons = flatUnits.filter((unit) => unit.type === 'lesson').length;
  const totalCheckpoints = flatUnits.filter((unit) => unit.type === 'checkpoint').length;
  const availableCheckpointCount = flatUnits.filter((unit) => unit.type === 'checkpoint' && unit.routeAvailable).length;
  const unavailableCheckpointCount = totalCheckpoints - availableCheckpointCount;
  const countableUnits = orderedLevels.reduce((sum, level) => sum + level.countableCount, 0);
  const completedUnits = flatUnits.filter((unit) => unit.completed).length;
  const totalVocabulary = orderedLevels.reduce((sum, level) => sum + level.vocabularyCount, 0);
  const nextUnit = flatUnits.find((unit) => !unit.completed && unit.unlocked && unit.href) || null;

  return {
    levels,
    orderedLevels,
    totalUnits,
    totalLessons,
    totalCheckpoints,
    availableCheckpointCount,
    unavailableCheckpointCount,
    countableUnits,
    totalVocabulary,
    completedUnits,
    progressPercent: percent(completedUnits, countableUnits),
    nextUnit,
  };
}
