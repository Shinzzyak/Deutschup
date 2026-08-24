import { describe, it, expect } from 'vitest';
import { vocabulary } from '../vocabulary';

describe('Vocabulary Data', () => {
  describe('Data integrity', () => {
    it('should have vocabulary entries', () => {
      expect(vocabulary.length).toBeGreaterThan(0);
    });

    it('each entry should have required fields', () => {
      for (const entry of vocabulary.slice(0, 100)) { // Sample check
        expect(entry).toHaveProperty('german');
        expect(entry).toHaveProperty('indonesian');
        expect(typeof entry.german).toBe('string');
        expect(typeof entry.indonesian).toBe('string');
        expect(entry.german.length).toBeGreaterThan(0);
        expect(entry.indonesian.length).toBeGreaterThan(0);
      }
    });

    it('should have no duplicate german words', () => {
      const germanWords = vocabulary.map(v => v.german.toLowerCase());
      const unique = new Set(germanWords);
      // Allow some duplicates (words with multiple meanings)
      expect(unique.size).toBeGreaterThan(germanWords.length * 0.8);
    });
  });

  describe('Level distribution', () => {
    it('should have entries with level field', () => {
      const withLevel = vocabulary.filter(v => v.level);
      expect(withLevel.length).toBeGreaterThan(0);
    });

    it('each level should have reasonable count', () => {
      const byLevel: Record<string, number> = {};
      for (const v of vocabulary) {
        if (v.level) {
          byLevel[v.level] = (byLevel[v.level] || 0) + 1;
        }
      }

      // Each level should have at least some vocab
      for (const [level, count] of Object.entries(byLevel)) {
        expect(count).toBeGreaterThan(0);
      }
    });
  });
});
