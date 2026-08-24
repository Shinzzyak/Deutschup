import { describe, it, expect } from 'vitest';

// REG-005: RLS Recursive Policy Detection
describe('REG-005: RLS Recursive Policy', () => {
  function detectSelfReference(tableName: string, policyQuery: string): boolean {
    const lower = policyQuery.toLowerCase();
    const fromPattern = new RegExp(`from\\s+${tableName}`, 'i');
    const inPattern = new RegExp(`in\\s*\\(.*from\\s+${tableName}`, 'i');
    return fromPattern.test(lower) && inPattern.test(lower);
  }

  it('should detect self-referencing policy on profiles', () => {
    const badPolicy = 'SELECT * FROM profiles WHERE id IN (SELECT user_id FROM profiles WHERE role = $1)';
    expect(detectSelfReference('profiles', badPolicy)).toBe(true);
  });

  it('should accept safe policy using auth.uid()', () => {
    const goodPolicy = 'SELECT * FROM profiles WHERE id = auth.uid()';
    expect(detectSelfReference('profiles', goodPolicy)).toBe(false);
  });

  it('should accept policy subquerying different table', () => {
    const crossTablePolicy = 'SELECT * FROM orders WHERE user_id IN (SELECT id FROM profiles WHERE role = $1)';
    expect(detectSelfReference('orders', crossTablePolicy)).toBe(false);
  });
});
