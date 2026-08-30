import { useState, useMemo, useCallback, useEffect } from 'react';
import { getAllVocab } from '../../lib/lessons-db';
import { verbDatabase } from '../../data/verbs';
import { courseIndex } from '../../data/lessonIndex';
import type { VocabWord } from '../../data/course';

export interface SearchResult {
  id: string;
  type: 'vocabulary' | 'lesson' | 'verb';
  primary: string;
  secondary: string;
  level?: string;
  article?: string;
  route: string;
}

const RECENT_KEY = 'deutschup_recent_searches';
const MAX_RECENT = 5;

// Normalize German umlauts so "ubung" finds "Übung"
function normalizeGerman(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');
}

function fuzzyScore(query: string, target: string): number {
  const q = normalizeGerman(query);
  const t = normalizeGerman(target);

  if (t === q) return 100;
  if (t.startsWith(q)) return 90;
  if (t.includes(q)) return 70;

  const words = t.split(/\s+/);
  for (const word of words) {
    if (word.startsWith(q)) return 60;
    if (word.includes(q)) return 40;
  }

  // ponytail: removed subsequence match (score 30) — too loose, matched unrelated words
  return 0;
}

export function useSearch() {
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    } catch {
      return [];
    }
  });

  // Vocabulary from DB (async — lesson vocab + level vocab groups)
  const [vocab, setVocab] = useState<VocabWord[]>([]);
  useEffect(() => {
    let alive = true;
    getAllVocab().then(v => { if (alive) setVocab(v); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const index = useMemo(() => {
    const items: SearchResult[] = [];
    const seen = new Set<string>();

    // Vocabulary from lessons (richer data)
    for (const v of vocab) {
      if (seen.has(v.word)) continue;
      seen.add(v.word);
      items.push({
        id: `vocab-${v.id}`,
        type: 'vocabulary',
        primary: v.word,
        secondary: v.translation,
        level: v.level,
        article: v.article,
        // Deep-link: pre-fills the trainer's own search so the clicked word
        // is immediately on screen instead of a generic /vocab page. Level
        // comes along so cross-level words resolve on arrival.
        route: `/vocab?q=${encodeURIComponent(v.word)}&level=${v.level}`,
      });
    }

    // Verbs
    for (const v of verbDatabase) {
      items.push({
        id: `verb-${v.infinitive}`,
        type: 'verb',
        primary: v.infinitive,
        secondary: `${v.translation} (${v.type === 'irregular' ? 'tidak beraturan' : 'beraturan'})`,
        level: 'A1-A2',
        route: `/verb-trainer`,
      });
    }

    // Lessons
    for (const l of courseIndex) {
      items.push({
        id: `lesson-${l.id}`,
        type: 'lesson',
        primary: l.title,
        secondary: l.canDoGoals?.[0] || '',
        level: l.level,
        route: `/lesson/${l.id}`,
      });
    }

    return items;
  }, [vocab]);

  const search = useCallback((query: string): SearchResult[] => {
    if (!query.trim()) return [];
    
    const scored = index
      .map(item => ({
        ...item,
        score: Math.max(
          fuzzyScore(query, item.primary),
          fuzzyScore(query, item.secondary) * 0.8
        ),
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    return scored;
  }, [index]);

  const addRecent = useCallback((query: string) => {
    setRecentSearches(prev => {
      const next = [query, ...prev.filter(r => r !== query)].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    localStorage.removeItem(RECENT_KEY);
    setRecentSearches([]);
  }, []);

  return { search, recentSearches, addRecent, clearRecent };
}
