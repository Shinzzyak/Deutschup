import { describe, it, expect } from 'vitest';

// REG-010: PostgreSQL Case-Sensitive Identifiers
// Root Cause: PostgreSQL treats unquoted identifiers as lowercase
// Columns created with camelCase must be quoted with double quotes
describe('REG-010: PostgreSQL Identifiers', () => {
  function quoteIfNeeded(identifier: string): string {
    // If identifier has uppercase chars, it needs double quotes
    if (identifier !== identifier.toLowerCase()) {
      return `"${identifier}"`;
    }
    return identifier;
  }

  function buildSelect(columns: string[], table: string): string {
    const quoted = columns.map(c => quoteIfNeeded(c));
    return `SELECT ${quoted.join(', ')} FROM ${table}`;
  }

  it('should double-quote camelCase columns', () => {
    expect(quoteIfNeeded('geminiApiKey')).toBe('"geminiApiKey"');
  });

  it('should not quote lowercase columns', () => {
    expect(quoteIfNeeded('created_at')).toBe('created_at');
  });

  it('should quote mixed-case columns', () => {
    expect(quoteIfNeeded('pro_expiresAt')).toBe('"pro_expiresAt"');
  });

  it('should generate correct SQL for camelCase columns', () => {
    const sql = buildSelect(['geminiApiKey', 'created_at'], 'config');
    expect(sql).toBe('SELECT "geminiApiKey", created_at FROM config');
  });

  it('should handle all-lowercase columns', () => {
    const sql = buildSelect(['id', 'name', 'created_at'], 'profiles');
    expect(sql).toBe('SELECT id, name, created_at FROM profiles');
  });

  // Known problematic column names from the codebase
  const knownCamelCaseColumns = [
    'geminiApiKey',
    'deepseekApiKey',
    'mimoApiKey',
    'secretKey',
    'providerId',
    'modelId',
    'pro_expiresAt',
  ];

  it('all known camelCase columns should be quoted', () => {
    for (const col of knownCamelCaseColumns) {
      const quoted = quoteIfNeeded(col);
      expect(quoted.startsWith('"')).toBe(true);
      expect(quoted.endsWith('"')).toBe(true);
    }
  });
});
