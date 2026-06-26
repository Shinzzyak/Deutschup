import { describe, it, expect, vi } from 'vitest';

// Test AI routing logic (pure functions, no external calls)
describe('AI Router Logic', () => {
  describe('Error Classification', () => {
    // Replicate getFriendlyError logic from api/ai.ts
    function getFriendlyError(error: any): { message: string; status: number } {
      const status = String(error?.status || '');
      const message = error?.message || '';
      if (status === '429' || message.includes('RESOURCE_EXHAUSTED') || message.includes('rate limit')) {
        return { message: 'Terlalu banyak permintaan. Herr Deutsch sedang istirahat sebentar.', status: 429 };
      }
      if (status === '503' || message.includes('UNAVAILABLE')) {
        return { message: 'Layanan sedang sibuk.', status: 503 };
      }
      if (message.includes('SAFETY') || message.includes('BLOCKED')) {
        return { message: 'Permintaan tidak dapat diproses karena batasan keamanan.', status: 400 };
      }
      return { message: 'Herr Deutsch mengalami gangguan teknis.', status: 500 };
    }

    it('should classify 429 rate limit errors', () => {
      const result = getFriendlyError({ status: 429 });
      expect(result.status).toBe(429);
      expect(result.message).toContain('istirahat');
    });

    it('should classify RESOURCE_EXHAUSTED as 429', () => {
      const result = getFriendlyError({ message: 'RESOURCE_EXHAUSTED' });
      expect(result.status).toBe(429);
    });

    it('should classify 503 errors', () => {
      const result = getFriendlyError({ status: 503 });
      expect(result.status).toBe(503);
      expect(result.message).toContain('sibuk');
    });

    it('should classify UNAVAILABLE as 503', () => {
      const result = getFriendlyError({ message: 'UNAVAILABLE' });
      expect(result.status).toBe(503);
    });

    it('should classify SAFETY errors', () => {
      const result = getFriendlyError({ message: 'SAFETY_BLOCKED' });
      expect(result.status).toBe(400);
    });

    it('should default to 500 for unknown errors', () => {
      const result = getFriendlyError({ message: 'something broke' });
      expect(result.status).toBe(500);
      expect(result.message).toContain('gangguan teknis');
    });

    it('should handle null/undefined errors', () => {
      const result = getFriendlyError(null);
      expect(result.status).toBe(500);
    });
  });

  describe('Chat System Prompt', () => {
    const CHAT_SYSTEM = `Anda "Herr Deutsch", seorang Tutor Bahasa Jerman profesional dan ramah untuk siswa Indonesia. Siswa ini berada di level {level}.`;

    it('should inject level into system prompt', () => {
      const prompt = CHAT_SYSTEM.replace('{level}', 'A1');
      expect(prompt).toContain('A1');
      expect(prompt).not.toContain('{level}');
    });

    it('should handle missing level gracefully', () => {
      const prompt = CHAT_SYSTEM.replace('{level}', undefined as any);
      expect(prompt).toBeDefined();
    });
  });

  describe('Input Validation', () => {
    it('should require message for chat', () => {
      const body = { message: '' };
      const isValid = !!(body.message && typeof body.message === 'string' && body.message.length > 0);
      expect(isValid).toBe(false);
    });

    it('should require word for pronunciation', () => {
      const body = {};
      const isValid = 'word' in body && body.word;
      expect(isValid).toBe(false);
    });

    it('should accept valid chat message', () => {
      const body = { message: 'Hallo, wie geht es dir?', level: 'A1' };
      const isValid = body.message && typeof body.message === 'string';
      expect(isValid).toBe(true);
    });
  });
});
