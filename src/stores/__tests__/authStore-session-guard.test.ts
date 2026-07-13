import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  dbProxy: vi.fn(),
  resolveInternalId: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: mocks.signOut,
    },
  },
  dbProxy: mocks.dbProxy,
}));

vi.mock('../../lib/clerk/identity', () => ({
  resolveInternalId: mocks.resolveInternalId,
}));

const futureExpiry = () => Math.floor(Date.now() / 1000) + 60 * 60;
const cachedSession = (id = 'cached_user') => ({
  user: {
    id,
    email: `${id}@example.test`,
    user_metadata: { full_name: 'Cached User', avatar_url: '' },
  },
  expires_at: futureExpiry(),
});

async function importFreshStore() {
  vi.resetModules();
  return import('../authStore');
}

async function flushAsync() {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('authStore session guard', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllEnvs();
    mocks.dbProxy.mockReset();
    mocks.resolveInternalId.mockReset();
    mocks.signOut.mockReset();
  });

  it('does not authenticate from user-controlled localStorage by default when Clerk is disabled', async () => {
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', '');
    localStorage.setItem('deutschup_session', JSON.stringify(cachedSession('stale_cached')));

    const { useAuthStore } = await importFreshStore();

    expect(useAuthStore.getState().user).toBeNull();
  });

  it('allows cached local auth only for explicit development/e2e smoke tests when Clerk is disabled', async () => {
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', '');
    vi.stubEnv('VITE_ENABLE_LOCAL_AUTH_CACHE_FOR_E2E', 'true');
    localStorage.setItem('deutschup_session', JSON.stringify(cachedSession('e2e_cached')));

    const { useAuthStore } = await importFreshStore();

    expect(useAuthStore.getState().user?.id).toBe('e2e_cached');
  });

  it('never trusts the E2E cache in a production build', async () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', '');
    vi.stubEnv('VITE_ENABLE_LOCAL_AUTH_CACHE_FOR_E2E', 'true');
    localStorage.setItem('deutschup_session', JSON.stringify(cachedSession('attacker')));

    const { useAuthStore } = await importFreshStore();

    expect(useAuthStore.getState().user).toBeNull();
  });

  it('ignores cached local auth when Clerk is enabled, even if the e2e flag is present', async () => {
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_1234567890');
    vi.stubEnv('VITE_ENABLE_LOCAL_AUTH_CACHE_FOR_E2E', 'true');
    localStorage.setItem('deutschup_session', JSON.stringify(cachedSession('stale_clerk_cache')));

    const { useAuthStore } = await importFreshStore();

    expect(useAuthStore.getState().user).toBeNull();
  });

  it('fetches profile data when Clerk reports the same user but profile state is not loaded yet', async () => {
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_1234567890');
    const internalId = '550e8400-e29b-41d4-a716-446655440000';
    const clerkUser = {
      id: 'user_same_profile_missing',
      email: 'same@example.test',
      user_metadata: { full_name: 'Same User', avatar_url: '' },
    } as any;
    mocks.resolveInternalId.mockResolvedValue(internalId);
    mocks.dbProxy.mockResolvedValue({
      data: {
        full_name: 'Same User',
        avatar_url: '',
        role: 'user',
        subscription: 'pro',
        pro_expires_at: new Date(Date.now() + 86_400_000).toISOString(),
      },
    });

    const { useAuthStore } = await importFreshStore();
    useAuthStore.setState({ user: clerkUser, profileLoaded: false, profileData: {}, tierData: { tier: 'free' } });

    useAuthStore.getState().setUser(clerkUser);
    await flushAsync();

    expect(mocks.resolveInternalId).toHaveBeenCalledWith(clerkUser.id);
    expect(mocks.dbProxy).toHaveBeenCalledWith('get-profile', { userId: internalId });
    expect(useAuthStore.getState().profileLoaded).toBe(true);
    expect(useAuthStore.getState().tierData.tier).toBe('pro');
  });

  it('retains server onboarding completion after local storage is cleared', async () => {
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_1234567890');
    const clerkUser = { id: 'user_onboarded', email: 'onboarded@example.test', user_metadata: {} } as any;
    mocks.resolveInternalId.mockResolvedValue('550e8400-e29b-41d4-a716-446655440000');
    mocks.dbProxy.mockResolvedValue({ data: { onboarding_completed: true, subscription: 'free', role: 'user' } });

    const { useAuthStore } = await importFreshStore();
    useAuthStore.getState().setUser(clerkUser);
    await flushAsync();

    expect(useAuthStore.getState().profileData.onboarding_completed).toBe(true);
  });
});
