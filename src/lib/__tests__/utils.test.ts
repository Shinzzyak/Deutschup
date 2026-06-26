import { describe, it, expect } from 'vitest';

// Test utility functions
// Note: Import actual utils once they exist. For now, test common patterns.

describe('Utility Functions', () => {
  describe('Date formatting', () => {
    it('should format ISO date to locale string', () => {
      const isoDate = '2026-06-26T04:21:00Z';
      const formatted = new Date(isoDate).toLocaleDateString('id-ID');
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });

    it('should handle invalid date gracefully', () => {
      const invalidDate = 'not-a-date';
      const result = new Date(invalidDate);
      expect(isNaN(result.getTime())).toBe(true);
    });
  });

  describe('String validation', () => {
    it('should validate email format', () => {
      const isValidEmail = (email: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    it('should validate non-empty string', () => {
      const isNonEmpty = (s: string) => s.trim().length > 0;

      expect(isNonEmpty('hello')).toBe(true);
      expect(isNonEmpty('')).toBe(false);
      expect(isNonEmpty('   ')).toBe(false);
    });
  });

  describe('Number formatting', () => {
    it('should format number with separator', () => {
      const formatNumber = (n: number) =>
        n.toLocaleString('id-ID');

      expect(formatNumber(1000)).toBe('1.000');
      expect(formatNumber(1000000)).toBe('1.000.000');
    });

    it('should handle zero', () => {
      expect((0).toLocaleString('id-ID')).toBe('0');
    });
  });
});
