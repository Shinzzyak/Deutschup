import { describe, it, expect, vi } from 'vitest';

// REG-011: Auth Race Condition Patterns
// Root Cause: Multiple auth state changes overlapping
describe('REG-011: Auth Race Condition', () => {
  // Single Source of Truth pattern
  function createAuthStore() {
    let currentUser: any = null;
    let version = 0;
    const listeners: Array<(user: any) => void> = [];

    return {
      get user() { return currentUser; },
      get version() { return version; },

      set(user: any) {
        currentUser = user;
        version++;
        listeners.forEach(fn => fn(user));
      },

      clear() {
        currentUser = null;
        version++;
        listeners.forEach(fn => fn(null));
      },

      onChange(fn: (user: any) => void) {
        listeners.push(fn);
        return () => {
          const idx = listeners.indexOf(fn);
          if (idx >= 0) listeners.splice(idx, 1);
        };
      },
    };
  }

  it('should have single setter path', () => {
    const store = createAuthStore();
    store.set({ id: 'user-1' });
    expect(store.user).toEqual({ id: 'user-1' });
    expect(store.version).toBe(1);
  });

  it('should notify listeners on set', () => {
    const store = createAuthStore();
    const listener = vi.fn();
    store.onChange(listener);

    store.set({ id: 'user-1' });
    expect(listener).toHaveBeenCalledWith({ id: 'user-1' });
  });

  it('should notify listeners on clear', () => {
    const store = createAuthStore();
    const listener = vi.fn();
    store.onChange(listener);

    store.set({ id: 'user-1' });
    store.clear();
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(null);
  });

  it('should handle rapid state changes', () => {
    const store = createAuthStore();
    store.set({ id: 'user-1' });
    store.set({ id: 'user-2' });
    store.clear();
    store.set({ id: 'user-3' });

    expect(store.user).toEqual({ id: 'user-3' });
    expect(store.version).toBe(4);
  });

  it('should allow unsubscribe', () => {
    const store = createAuthStore();
    const listener = vi.fn();
    const unsub = store.onChange(listener);

    store.set({ id: 'user-1' });
    unsub();
    store.set({ id: 'user-2' });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  // Sync beats async — getSession() for trigger only, result discarded
  it('sync getSession should trigger auth recovery but not set state', async () => {
    const store = createAuthStore();
    let triggerCount = 0;

    // Simulate: getSession() triggers Supabase localStorage recovery
    // but result is discarded — onAuthStateChange is the only setter
    const mockGetSession = async () => {
      triggerCount++;
      return { data: { session: { user: { id: 'user-1' } } } };
    };

    // Fire and forget
    mockGetSession();
    expect(triggerCount).toBe(1);
    // Store NOT updated by getSession — only by onAuthStateChange
    expect(store.user).toBeNull();
  });
});
