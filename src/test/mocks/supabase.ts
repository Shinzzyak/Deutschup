import { vi } from 'vitest';

// Mock Supabase client for integration tests
export function createMockSupabase() {
  const mockFrom = vi.fn();
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();
  const mockMaybeSingle = vi.fn();
  const mockUpsert = vi.fn();

  // Chain builder
  const chain = {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    upsert: mockUpsert,
    eq: mockEq,
    single: mockSingle,
    maybeSingle: mockMaybeSingle,
    then: (cb: any) => cb({ data: null, error: null }),
  };

  // Make chain methods return chain for chaining
  mockSelect.mockReturnValue(chain);
  mockInsert.mockReturnValue(chain);
  mockUpdate.mockReturnValue(chain);
  mockDelete.mockReturnValue(chain);
  mockUpsert.mockReturnValue(chain);
  mockEq.mockReturnValue(chain);
  mockSingle.mockReturnValue(Promise.resolve({ data: null, error: null }));
  mockMaybeSingle.mockReturnValue(Promise.resolve({ data: null, error: null }));

  mockFrom.mockReturnValue(chain);

  const mockAuth = {
    getSession: vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    getUser: vi.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { session: null, user: null },
      error: null,
    }),
    signUp: vi.fn().mockResolvedValue({
      data: { session: null, user: null },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
  };

  return {
    from: mockFrom,
    auth: mockAuth,
    // Expose internals for test assertions
    _mocks: {
      from: mockFrom,
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      single: mockSingle,
      maybeSingle: mockMaybeSingle,
      upsert: mockUpsert,
    },
  };
}

// Mock API Request/Response
export function createMockReqRes(overrides: any = {}) {
  const req: any = {
    method: 'GET',
    headers: {},
    query: {},
    body: {},
    ...overrides,
  };

  const res: any = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
    headersSent: false,
  };

  return { req, res };
}
