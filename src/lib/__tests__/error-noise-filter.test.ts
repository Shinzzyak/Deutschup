import { describe, it, expect } from 'vitest';
import { classifyNoise, isAppFaultKind } from '../../../lib/error-noise-filter.js';

/**
 * Cases are written from REAL rows observed in the production `app_errors`
 * table, not invented. The two that matter most:
 *   - beacon + locationless window.error -> noise (was spamming Discord)
 *   - mount-timeout / chunk-load-failure -> MUST survive (real white screen)
 */

const NO_FAULT = { hasRealAppFault: false };
const FAULT = { hasRealAppFault: true };

const BEACON =
  'https://static.cloudflareinsights.com/beacon.min.js/v31edd6df95cf4e85bb4c19e7a9bdbcba1788362987495';
const GSI = 'https://accounts.google.com/gsi/client';

describe('classifyNoise — noise that was spamming Discord', () => {
  it('filters the Cloudflare beacon script-load-error', () => {
    const v = classifyNoise(
      'script-load-error',
      'Failed to load script: v31edd6df95cf4e85bb4c19e7a9bdbcba1788362987495',
      BEACON,
      NO_FAULT,
    );
    expect(v.noise).toBe(true);
    expect(v.reason).toBe('analytics-script-blocked');
  });

  it('filters the locationless window.error that twins every blocked script', () => {
    const v = classifyNoise('window.error', '', 'file:?:?', NO_FAULT);
    expect(v.noise).toBe(true);
    expect(v.reason).toBe('locationless-window-error');
  });
});

describe('classifyNoise — real failures that MUST still page someone', () => {
  it('keeps mount-timeout (React never mounted = white screen)', () => {
    const v = classifyNoise('mount-timeout', 'React did not mount within 8s', '', NO_FAULT);
    expect(v.noise).toBe(false);
    expect(v.reason).toBe('actionable');
  });

  it('keeps a locationless window.error when the page also reported a boot failure', () => {
    // Same signature as the beacon twin, but mount-timeout proves the app broke.
    const v = classifyNoise('window.error', '', 'file:?:?', FAULT);
    expect(v.noise).toBe(false);
    expect(v.reason).toBe('app-fault-in-batch');
  });

  it('keeps a failed vendor chunk even though it points at a third-party origin', () => {
    const v = classifyNoise(
      'unhandledrejection',
      'Loading chunk 344 failed. (timeout: https://clerk.example.com/x.js)',
      '',
      NO_FAULT,
    );
    expect(v.noise).toBe(false);
    expect(v.reason).toBe('chunk-load-failure');
  });

  it('keeps ChunkLoadError phrased the React-way', () => {
    const v = classifyNoise(
      'window.error',
      'ChunkLoadError: Loading CSS chunk 12 failed',
      '',
      NO_FAULT,
    );
    expect(v.noise).toBe(false);
    expect(v.reason).toBe('chunk-load-failure');
  });

  it('keeps any error whose stack points at our own bundle', () => {
    const v = classifyNoise(
      'window.error',
      'x is not a function',
      'at /assets/index-CJ_l8bsi.js:124:8891',
      NO_FAULT,
    );
    expect(v.noise).toBe(false);
    expect(v.reason).toBe('own-asset');
  });

  it('keeps an own-asset failure even when a boot fault is also present', () => {
    const v = classifyNoise('window.error', 'boom', 'at /assets/index-CJ_l8bsi.js:1:1', FAULT);
    expect(v.noise).toBe(false);
    expect(v.reason).toBe('own-asset');
  });

  it('keeps a normal window.error with a real message', () => {
    const v = classifyNoise(
      'window.error',
      'Cannot read properties of null',
      'at Foo (app.js:2:3)',
      NO_FAULT,
    );
    expect(v.noise).toBe(false);
    expect(v.reason).toBe('actionable');
  });
});

describe('classifyNoise — user-facing paths must stay reportable', () => {
  it('KEEPS a Google One-Tap failure — users must never lose a login path silently', () => {
    const v = classifyNoise('script-load-error', 'Failed to load script: client', GSI, NO_FAULT);
    expect(v.noise).toBe(false);
    expect(v.reason).toBe('actionable');
  });

  it('keeps an own-asset script-load-error', () => {
    const v = classifyNoise(
      'script-load-error',
      'Failed to load script: index-abc.js',
      'https://deutschup.sintec.my.id/assets/index-abc.js',
      NO_FAULT,
    );
    expect(v.noise).toBe(false);
    expect(v.reason).toBe('own-asset');
  });
});

describe('classifyNoise — robustness on hostile / malformed input', () => {
  it('does not throw on empty everything, and reports it as actionable', () => {
    // NOTE: an all-empty body never actually reaches this filter —
    // api/error-report.ts short-circuits `if (!message && !stack)` first.
    // The only property worth asserting here is that the function is total
    // (no throw) and does not silently swallow exotic callers as "noise".
    expect(() => classifyNoise('', '', '', NO_FAULT)).not.toThrow();
    expect(classifyNoise('', '', '', NO_FAULT).reason).toBe('actionable');
  });

  it('does not throw on very long input', () => {
    const big = 'x'.repeat(50_000);
    expect(() => classifyNoise('window.error', big, big, NO_FAULT)).not.toThrow();
  });

  it('treats a whitespace-only message as empty', () => {
    const v = classifyNoise('window.error', '   \n  ', 'file:?:?', NO_FAULT);
    expect(v.noise).toBe(true);
  });

  it('recognises app-fault kinds', () => {
    expect(isAppFaultKind('mount-timeout')).toBe(true);
    expect(isAppFaultKind('unhandledrejection')).toBe(true);
    expect(isAppFaultKind('window.error')).toBe(false);
  });
});
