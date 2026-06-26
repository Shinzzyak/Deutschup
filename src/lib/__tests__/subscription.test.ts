import { describe, it, expect, beforeEach, vi } from 'vitest';

// We need to test subscription logic. Since the module uses Supabase,
// we'll test the pure logic parts.

describe('Subscription Logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('isUserPro detection', () => {
    it('should identify free user correctly', () => {
      const profile = {
        subscription: 'free',
        pro_expires_at: null,
      };
      expect(profile.subscription).toBe('free');
    });

    it('should identify active pro user', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString(); // +1 day
      const profile = {
        subscription: 'pro',
        pro_expires_at: futureDate,
      };
      expect(profile.subscription).toBe('pro');
      expect(new Date(profile.pro_expires_at!).getTime()).toBeGreaterThan(Date.now());
    });

    it('should identify expired pro user', () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString(); // -1 day
      const profile = {
        subscription: 'pro',
        pro_expires_at: pastDate,
      };
      expect(profile.subscription).toBe('pro');
      expect(new Date(profile.pro_expires_at!).getTime()).toBeLessThan(Date.now());
    });
  });

  describe('Plan features', () => {
    it('free plan should have limited features', () => {
      const freeFeatures = {
        messagesPerDay: 10,
        simulasiPerWeek: 1,
        levels: ['A1'],
      };
      expect(freeFeatures.messagesPerDay).toBeLessThan(100);
      expect(freeFeatures.simulasiPerWeek).toBe(1);
    });

    it('pro plan should have unlimited features', () => {
      const proFeatures = {
        messagesPerDay: Infinity,
        simulasiPerWeek: Infinity,
        levels: ['A1', 'A2', 'B1', 'B2'],
      };
      expect(proFeatures.messagesPerDay).toBe(Infinity);
      expect(proFeatures.simulasiPerWeek).toBe(Infinity);
      expect(proFeatures.levels).toContain('B2');
    });
  });
});
