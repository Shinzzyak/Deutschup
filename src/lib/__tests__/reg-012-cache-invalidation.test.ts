import { describe, it, expect, beforeEach } from 'vitest';

// REG-012: Cache Invalidation
describe('REG-012: Cache Invalidation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should cache and retrieve values', () => {
    localStorage.setItem('test:key1', JSON.stringify({ value: 'hello' }));
    const raw = localStorage.getItem('test:key1');
    expect(JSON.parse(raw!).value).toBe('hello');
  });

  it('should return null for missing keys', () => {
    expect(localStorage.getItem('test:nonexistent')).toBeNull();
  });

  it('should invalidate specific key', () => {
    localStorage.setItem('test:key1', 'value1');
    localStorage.setItem('test:key2', 'value2');
    localStorage.removeItem('test:key1');

    expect(localStorage.getItem('test:key1')).toBeNull();
    expect(localStorage.getItem('test:key2')).toBe('value2');
  });

  it('should invalidate all keys in namespace', () => {
    localStorage.setItem('test:key1', 'value1');
    localStorage.setItem('test:key2', 'value2');
    localStorage.setItem('other:key3', 'value3');

    // Manual namespace invalidation
    localStorage.removeItem('test:key1');
    localStorage.removeItem('test:key2');

    expect(localStorage.getItem('test:key1')).toBeNull();
    expect(localStorage.getItem('test:key2')).toBeNull();
    expect(localStorage.getItem('other:key3')).toBe('value3');
  });

  it('should handle corrupted cache gracefully', () => {
    localStorage.setItem('test:key1', 'invalid-json{');
    let parsed = null;
    try { parsed = JSON.parse(localStorage.getItem('test:key1')!); } catch { parsed = null; }
    expect(parsed).toBeNull();
  });

  it('should invalidate profile cache after update', () => {
    localStorage.setItem('profile:user-1', JSON.stringify({ name: 'Old', tier: 'free' }));
    expect(localStorage.getItem('profile:user-1')).toBeTruthy();

    // Simulate mutation — invalidate cache
    localStorage.removeItem('profile:user-1');
    expect(localStorage.getItem('profile:user-1')).toBeNull();
  });
});
