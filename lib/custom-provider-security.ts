import { isIP } from 'node:net';

const BLOCKED_HOSTS = new Set(['localhost', 'localhost.', 'metadata.google.internal', 'metadata.google.internal.']);

// Own platform (VansRouter) — public IP, plain HTTP allowed.
const ALLOWED_INSECURE_HOSTS = new Set(['150.109.12.245']);

function isPrivateIpv4(parts: number[]) {
  return parts[0] === 0 || parts[0] === 10 || parts[0] === 127 || parts[0] >= 224 ||
    (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    (parts[0] === 198 && (parts[1] === 18 || parts[1] === 19));
}

function isPrivateIp(host: string) {
  const normalized = host.replace(/^\[|\]$/g, '').toLowerCase();
  const version = isIP(normalized);
  if (version === 4) return isPrivateIpv4(normalized.split('.').map(Number));
  if (version !== 6) return false;

  const [left, right = ''] = normalized.split('::');
  const leftParts = left ? left.split(':') : [];
  const rightParts = right ? right.split(':') : [];
  const parts = [...leftParts, ...Array(8 - leftParts.length - rightParts.length).fill('0'), ...rightParts].map(part => parseInt(part, 16));
  const first = parts[0];
  if (normalized === '::' || normalized === '::1' ||
      (first >= 0xfc00 && first <= 0xfdff) || (first >= 0xfe80 && first <= 0xfeff) || first >= 0xff00) return true;

  const v4Mapped = parts.slice(0, 5).every(part => part === 0) && parts[5] === 0xffff;
  const v4Compatible = parts.slice(0, 6).every(part => part === 0);
  return (v4Mapped || v4Compatible) && isPrivateIpv4([parts[6] >> 8, parts[6] & 255, parts[7] >> 8, parts[7] & 255]);
}

export function validateCustomProviderUrl(value: unknown): { ok: true } | { ok: false; error: string } {
  if (typeof value !== 'string') return { ok: false, error: 'base_url must be a URL' };
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/\.$/, '');
    const insecureOk = ALLOWED_INSECURE_HOSTS.has(host);
    if ((!insecureOk && url.protocol !== 'https:') || url.username || url.password || BLOCKED_HOSTS.has(host) || host.endsWith('.localhost') || isPrivateIp(host)) {
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
