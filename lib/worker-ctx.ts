// Background-promise bridge for Cloudflare Pages Functions.
// Handlers run through the legacy Node-style adapter without access to the
// Workers executionContext. The router registers ctx.waitUntil here so
// fire-and-forget work (Discord notifications) survives response delivery.
let waitUntil: ((p: Promise<unknown>) => void) | null = null;

export function setWaitUntil(fn: ((p: Promise<unknown>) => void) | null) {
  waitUntil = fn;
}

export function reportBackground(p: Promise<unknown>) {
  try {
    waitUntil?.(p);
  } catch {
    /* no-op outside Workers */
  }
}
