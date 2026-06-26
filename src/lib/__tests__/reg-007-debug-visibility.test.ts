import { describe, it, expect } from 'vitest';

// REG-007: Debug Visibility Rule
// Root Cause: Vite replaces import.meta.env.* at build time → optimizer removes dead code
// NEVER use import.meta.env.MODE for debug component visibility
describe('REG-007: Debug Visibility', () => {
  // Safe patterns for debug visibility
  function isDebugVisible_hostname(hostname: string): boolean {
    return hostname === 'localhost';
  }

  function isDebugVisible_urlParam(hasDebugParam: boolean): boolean {
    return hasDebugParam;
  }

  function isDebugVisible_windowVar(debugEnabled?: boolean): boolean {
    return debugEnabled === true;
  }

  // UNSAFE pattern (should never be used)
  // import.meta.env.MODE === 'development' — replaced at build time!

  it('should show debug on localhost', () => {
    expect(isDebugVisible_hostname('localhost')).toBe(true);
  });

  it('should hide debug on production domain', () => {
    expect(isDebugVisible_hostname('deutschup.sintec.my.id')).toBe(false);
  });

  it('should hide debug on Vercel preview', () => {
    expect(isDebugVisible_hostname('deutschup-delta.vercel.app')).toBe(false);
  });

  it('should show debug with URL param', () => {
    expect(isDebugVisible_urlParam(true)).toBe(true);
  });

  it('should hide debug without URL param', () => {
    expect(isDebugVisible_urlParam(false)).toBe(false);
  });

  it('should show debug with window flag', () => {
    expect(isDebugVisible_windowVar(true)).toBe(true);
  });

  it('should hide debug without window flag', () => {
    expect(isDebugVisible_windowVar(undefined)).toBe(false);
  });

  it('should hide debug with window flag false', () => {
    expect(isDebugVisible_windowVar(false)).toBe(false);
  });
});
