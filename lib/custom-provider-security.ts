const BLOCKED_HOSTS = new Set(['localhost', 'metadata.google.internal', 'metadata.google.internal.']);

function isPrivateIpv4(host: string) {
  const parts = host.split('.').map(Number);
  return parts.length === 4 && parts.every(Number.isInteger) && (
    parts[0] === 0 || parts[0] === 10 || parts[0] === 127 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168)
  );
}

export function validateCustomProviderUrl(value: unknown): { ok: true } | { ok: false; error: string } {
  if (typeof value !== 'string') return { ok: false, error: 'base_url must be a URL' };
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || BLOCKED_HOSTS.has(url.hostname.toLowerCase()) || isPrivateIpv4(url.hostname)) {
      return { ok: false, error: 'base_url must be a public HTTPS endpoint' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'base_url must be a valid HTTPS URL' };
  }
}

export function validateProviderPath(value: unknown): { ok: true } | { ok: false; error: string } {
  return typeof value === 'string' && /^\/[a-zA-Z0-9._~!$&'()*+,;=:@/%-]*$/.test(value)
    ? { ok: true }
    : { ok: false, error: 'endpoint must be a relative path starting with /' };
}
