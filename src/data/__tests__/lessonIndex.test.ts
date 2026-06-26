import { describe, it, expect } from 'vitest';
import { courseIndex, LessonIndex } from '../lessonIndex';

describe('lessonIndex', () => {
  describe('courseIndex structure', () => {
    it('should have lessons', () => {
      expect(courseIndex.length).toBeGreaterThan(0);
    });

    it('should have all CEFR levels', () => {
      const levelNames = new Set(courseIndex.map(l => l.level).filter(Boolean));
      expect(levelNames.has('A1')).toBe(true);
      expect(levelNames.has('A2')).toBe(true);
      expect(levelNames.has('B1')).toBe(true);
      expect(levelNames.has('B2')).toBe(true);
    });

    it('each lesson should have required fields', () => {
      for (const lesson of courseIndex) {
        expect(lesson).toHaveProperty('id');
        expect(typeof lesson.id).toBe('string');
        expect(lesson.id.length).toBeGreaterThan(0);
      }
    });

    it('lesson IDs should be unique', () => {
      const allIds = courseIndex.map(l => l.id);
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });

    it('should have correct lesson counts per level', () => {
      const byLevel: Record<string, number> = {};
      for (const lesson of courseIndex) {
        const level = lesson.level || 'unknown';
        byLevel[level] = (byLevel[level] || 0) + 1;
      }
      expect(byLevel['A1']).toBe(26);
      expect(byLevel['A2']).toBe(18);
      expect(byLevel['B1']).toBe(14);
      expect(byLevel['B2']).toBe(12);
    });
  });

  describe('filtering by level', () => {
    it('should return A1 lessons', () => {
      const a1Lessons = courseIndex.filter(l => l.level === 'A1');
      expect(a1Lessons.length).toBe(26);
    });

    it('should return empty array for invalid level', () => {
      const result = courseIndex.filter(l => l.level === 'C2');
      expect(result).toEqual([]);
    });
  });
});
