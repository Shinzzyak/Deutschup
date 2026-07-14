import { describe, expect, it } from 'vitest';
import { validateCustomProviderUrl } from '../../../lib/custom-provider-security';

describe('custom provider endpoint policy', () => {
  it('allows a public HTTPS OpenAI-compatible endpoint', () => {
    expect(validateCustomProviderUrl('https://openrouter.ai/api/v1')).toEqual({ ok: true });
  });

  it.each([
    'http://api.example.com/v1',
    'https://localhost:11434/v1',
    'https://127.0.0.1/v1',
    'https://10.0.0.1/v1',
    'https://169.254.169.254/latest/meta-data',
    'https://metadata.google.internal/v1',
    'https://user:pass@api.example.com/v1',
  ])('rejects unsafe provider endpoint %s', (url) => {
    expect(validateCustomProviderUrl(url).ok).toBe(false);
  });

  it('allows only relative API paths', async () => {
    const { validateProviderPath } = await import('../../../lib/custom-provider-security');
    expect(validateProviderPath('/chat/completions')).toEqual({ ok: true });
    expect(validateProviderPath('https://metadata.google.internal/v1')).toMatchObject({ ok: false });
  });
});
