export async function getAuthHeaders(includeJson = false): Promise<Record<string, string>> {
  const headers: Record<string, string> = includeJson ? { 'Content-Type': 'application/json' } : {};

  try {
    const clerk = (window as any).Clerk;
    const token = clerk?.session && typeof clerk.session.getToken === 'function'
      ? await clerk.session.getToken()
      : null;

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  } catch (e: any) {
    console.warn('[AUTH] Failed to get Clerk token:', e.message);
  }

  return headers;
}

export async function authedFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const hasBody = typeof init.body !== 'undefined';
  const authHeaders = await getAuthHeaders(hasBody);
  return fetch(input, {
    ...init,
    headers: {
      ...authHeaders,
      ...(init.headers || {}),
    },
  });
}
