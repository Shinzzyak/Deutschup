import { describe, expect, it } from 'vitest';
import { joinCustomProviderUrl, validateCustomProviderUrl } from '../../../lib/custom-provider-security';

describe('custom provider endpoint policy', () => {
  it.each([
    'https://openrouter.ai/api/v1',
    'https://[2001:4860:4860::8888]/v1',
    'https://[::ffff:8.8.8.8]/v1',
  ])('allows public HTTPS endpoint %s', (url) => {
    expect(validateCustomProviderUrl(url)).toEqual({ ok: true });
  });

  it.each([
    'http://api.example.com/v1',
    'https://localhost:11434/v1',
    'https://127.0.0.1/v1',
    'https://10.0.0.1/v1',
    'https://169.254.169.254/latest/meta-data',
    'https://[::1]/v1',
    'https://[::ffff:127.0.0.1]/v1',
    'https://[fd00:ec2::254]/latest/meta-data',
    'https://[fe80::1]/v1',
    'https://[fec0::1]/v1',
    'https://[ff02::1]/v1',
    'https://foo.localhost/v1',
    'https://foo.localhost./v1',
    'https://metadata.google.internal/v1',
    'https://user:pass@api.example.com/v1',
  ])('rejects unsafe provider endpoint %s', (url) => {
    expect(validateCustomProviderUrl(url).ok).toBe(false);
  });

  it('allows own-platform plain HTTP host (VansRouter) via allowlist', () => {
    expect(validateCustomProviderUrl('http://150.109.12.245:20128/v1')).toEqual({ ok: true });
    expect(validateCustomProviderUrl('http://150.109.12.245/v1')).toEqual({ ok: true });
  });

  it('allows only relative API paths', async () => {
    const { validateProviderPath } = await import('../../../lib/custom-provider-security');
    expect(validateProviderPath('/chat/completions')).toEqual({ ok: true });
    expect(validateProviderPath('https://metadata.google.internal/v1')).toMatchObject({ ok: false });
  });

  it('rejects unsafe stored provider URLs and absolute endpoint overrides before fetch', () => {
    expect(() => joinCustomProviderUrl('https://[::1]', '/v1/models')).toThrow('public HTTPS');
    expect(() => joinCustomProviderUrl('https://openrouter.ai/v1', 'https://169.254.169.254/latest')).toThrow('relative path');
  });
});
