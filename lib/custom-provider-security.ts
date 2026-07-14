import { isIP } from 'node:net';

const BLOCKED_HOSTS = new Set(['localhost', 'metadata.google.internal', 'metadata.google.internal.']);

function isPrivateIp(host: string) {
  const normalized = host.replace(/^\[|\]$/g, '').toLowerCase();
  const version = isIP(normalized);
  if (version === 6) {
    return normalized.startsWith('::') || normalized.startsWith('fc') || normalized.startsWith('fd') ||
      normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb');
  }
  if (version !== 4) return false;
  const parts = normalized.split('.').map(Number);
  return parts[0] === 0 || parts[0] === 10 || parts[0] === 127 || parts[0] >= 224 ||
    (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    (parts[0] === 198 && (parts[1] === 18 || parts[1] === 19));
}

export function validateCustomProviderUrl(value: unknown): { ok: true } | { ok: false; error: string } {
  if (typeof value !== 'string') return { ok: false, error: 'base_url must be a URL' };
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || BLOCKED_HOSTS.has(url.hostname.toLowerCase()) || isPrivateIp(url.hostname)) {
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

export function joinCustomProviderUrl(baseUrl: string, endpoint: string): string {
  const basePolicy = validateCustomProviderUrl(baseUrl);
  if ('error' in basePolicy) throw new Error(basePolicy.error);
  const pathPolicy = validateProviderPath(endpoint);
  if ('error' in pathPolicy) throw new Error(pathPolicy.error);
  return `${baseUrl.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
}
