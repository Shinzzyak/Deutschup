import { describe, it, expect } from 'vitest';

// REG-009: Error Handling Transparency
// Root Cause: Generic error messages hide root causes
describe('REG-009: Error Handling', () => {
  function getFriendlyError(error: any): { userMessage: string; logMessage: string; status: number } {
    const status = error?.status || 500;
    const message = error?.message || 'Unknown error';
    const stack = error?.stack || '';

    // Log full error (REQUIRED by REG-009)
    const logMessage = `[AI-ERROR] ${message} ${stack}`;

    // User-friendly message
    let userMessage = 'Herr Deutsch mengalami gangguan teknis.';
    if (status === 429) userMessage = 'Terlalu banyak permintaan. Coba lagi dalam 1-2 menit.';
    if (status === 503) userMessage = 'Layanan sedang sibuk.';

    return { userMessage, logMessage, status };
  }

  it('should log full error details', () => {
    const error = new Error('Connection timeout to Gemini API');
    const result = getFriendlyError(error);
    expect(result.logMessage).toContain('Connection timeout to Gemini API');
    expect(result.logMessage).toContain('[AI-ERROR]');
  });

  it('should return friendly message to user', () => {
    const error = { status: 429, message: 'RESOURCE_EXHAUSTED' };
    const result = getFriendlyError(error);
    expect(result.userMessage).toContain('Coba lagi');
    expect(result.userMessage).not.toContain('RESOURCE_EXHAUSTED');
  });

  it('should preserve status code', () => {
    const error = { status: 503, message: 'UNAVAILABLE' };
    const result = getFriendlyError(error);
    expect(result.status).toBe(503);
  });

  it('should handle null error', () => {
    const result = getFriendlyError(null);
    expect(result.status).toBe(500);
    expect(result.userMessage).toContain('gangguan teknis');
  });

  it('should not expose internal details to user', () => {
    const error = {
      status: 500,
      message: 'ECONNREFUSED 10.0.0.1:5432 postgres://admin:secret@db.internal',
      stack: 'at Connection.connect (/app/node_modules/pg/lib/connection.js:42:17)',
    };
    const result = getFriendlyError(error);
    expect(result.userMessage).not.toContain('10.0.0.1');
    expect(result.userMessage).not.toContain('secret');
    expect(result.userMessage).not.toContain('postgres://');
    // But log should contain everything
    expect(result.logMessage).toContain('ECONNREFUSED');
  });
});
