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

// Simple fuzzy match score
function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  
  if (t === q) return 100;
  if (t.startsWith(q)) return 90;
  if (t.includes(q)) return 70;
  
  // Word boundary match
  const words = t.split(/\s+/);
  for (const word of words) {
    if (word.startsWith(q)) return 60;
    if (word.includes(q)) return 40;
  }
  
  // Character sequence match
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length ? 30 : 0;
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
        route: `/vocab`,
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
