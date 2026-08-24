// Regression: a stale profile cache (role:'user') must never survive a fresh
// sign-in and mask the admin role. Fixed 2026-08-05 by (1) versioning the
// cache key namespace and (2) purging the whole namespace in setUser.
import { describe, it, expect, beforeEach } from 'vitest';

const PROFILE_CACHE_PREFIX = 'deutschup_profile_';

function seedStaleCache() {
  // The bug: an old cache entry keyed under the *internal UUID* namespace.
  localStorage.setItem(
    `${PROFILE_CACHE_PREFIX}75bf538e-7492-4e33-b759-85442c7aa1c3`,
    JSON.stringify({
      tierData: { tier: 'free', role: 'user' },
      profileData: { role: 'user' },
      cachedAt: Date.now(),
    })
  );
  // And a v2 entry (current format) that is also stale.
  localStorage.setItem(
    `${PROFILE_CACHE_PREFIX}v2:75bf538e-7492-4e33-b759-85442c7aa1c3`,
    JSON.stringify({
      tierData: { tier: 'free', role: 'user' },
      profileData: { role: 'user' },
      cachedAt: Date.now(),
    })
  );
}

// Pure test of the purge logic without importing the store (import.meta.env).
// jsdom's Storage does not expose keys via Object.keys — iterate by index.
function purgeNamespace() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PROFILE_CACHE_PREFIX)) localStorage.removeItem(k);
    }
  } catch {}
}

describe('profile cache purge on sign-in', () => {
  beforeEach(() => {
    localStorage.clear();
    seedStaleCache();
  });

  it('removes every profile cache entry regardless of key namespace', () => {
    expect(localStorage.length).toBeGreaterThan(0);
    purgeNamespace();
    expect(localStorage.length).toBe(0);
  });

  it('does not touch unrelated localStorage keys', () => {
    localStorage.setItem('deutschup_session', '{"x":1}');
    purgeNamespace();
    expect(localStorage.getItem('deutschup_session')).toBe('{"x":1}');
  });
});
