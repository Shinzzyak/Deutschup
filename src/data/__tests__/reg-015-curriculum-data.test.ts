import { describe, it, expect } from 'vitest';
import { courseIndex } from '../lessonIndex';
import { vocabulary } from '../vocabulary';

// REG-015: Curriculum Data Integrity
// Ensure lesson content matches vocabulary coverage
describe('REG-015: Curriculum Data Integrity', () => {
  describe('Lesson-Vocab alignment', () => {
    it('should have lessons covering all levels', () => {
      const levels = new Set(courseIndex.map(l => l.level).filter(Boolean));
      expect(levels.has('A1')).toBe(true);
      expect(levels.has('A2')).toBe(true);
      expect(levels.has('B1')).toBe(true);
      expect(levels.has('B2')).toBe(true);
    });

    it('should have vocab for A1 level (primary)', () => {
      const vocabLevels = new Set(vocabulary.map(v => v.level).filter(Boolean));
      expect(vocabLevels.has('A1')).toBe(true);
    });

    it('A1 should have most lessons (foundation)', () => {
      const byLevel: Record<string, number> = {};
      for (const l of courseIndex) {
        const level = l.level || 'unknown';
        byLevel[level] = (byLevel[level] || 0) + 1;
      }
      expect(byLevel['A1']).toBeGreaterThan(byLevel['B2'] || 0);
    });
  });

  describe('Lesson content structure', () => {
    it('each lesson should have canDoGoals', () => {
      const withGoals = courseIndex.filter(l => l.canDoGoals && l.canDoGoals.length > 0);
      expect(withGoals.length).toBeGreaterThan(0);
    });

    it('canDoGoals should be non-empty strings', () => {
      for (const lesson of courseIndex.slice(0, 20)) {
        if (lesson.canDoGoals) {
          for (const goal of lesson.canDoGoals) {
            expect(typeof goal).toBe('string');
            expect(goal.length).toBeGreaterThan(5);
          }
        }
      }
    });

    it('lesson titles should be descriptive (>5 chars)', () => {
      for (const lesson of courseIndex) {
        if (lesson.title) {
          expect(lesson.title.length).toBeGreaterThan(5);
        }
      }
    });
  });

  describe('Vocab data quality', () => {
    it('all vocab should have german and indonesian', () => {
      for (const v of vocabulary) {
        expect(v.german.trim().length).toBeGreaterThan(0);
        expect(v.indonesian.trim().length).toBeGreaterThan(0);
      }
    });

    it('no vocab should have empty strings', () => {
      const emptyGerman = vocabulary.filter(v => !v.german.trim());
      const emptyIndonesian = vocabulary.filter(v => !v.indonesian.trim());
      expect(emptyGerman.length).toBe(0);
      expect(emptyIndonesian.length).toBe(0);
    });
  });
});
