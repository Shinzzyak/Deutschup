/**
 * Noise filter for /api/error-report.
 *
 * WHY THIS EXISTS
 * Third-party scripts (Cloudflare Web Analytics beacon, Google GSI/One-Tap) get
 * blocked by adblockers, DNS filters and corporate networks on a large slice of
 * real devices. Each blocked script fires TWO events (a `window.error` in the
 * capture phase + a `script-load-error` on the script tag), and every one of
 * them reached Discord as a red "App Error". Real crashes were drowning in them.
 *
 * WHAT IS NOISE
 *   A. kind === 'script-load-error' whose stack points at a known analytics-only
 *      third-party origin. The app cannot load the script, cannot avoid trying,
 *      and does not depend on it for core function.
 *   B. kind === 'window.error' with an empty message AND a locationless stack
 *      (`file:?:?`). That is the browser's own report for a failed external
 *      subresource: no filename, no line, no message. Zero diagnostic value.
 *
 * ⚠️ WHAT IS DELIBERATELY *NOT* FILTERED — products are for paying users
 * 1. accounts.google.com/gsi/client (Google One-Tap). It is filtered by the
 *    same adblockers, but silently swallowing its failure would hide the case
 *    where a NON-adblock user genuinely cannot reach Google and the One-Tap
 *    button just vanishes from /sign-in. Users must never lose a login path
 *    without us hearing about it. It stays reportable.
 * 2. Anything whose stack points at OUR OWN /assets/ bundle. A failure there is
 *    a real app fault, always.
 *
 * ⚠️ THE TRAP THIS GUARD EXISTS TO AVOID
 * A failed MAIN bundle produces EXACTLY the same `file:?:?` + empty-message
 * signature as a blocked beacon (see main.tsx / index.html window.error
 * handlers). Blanket-dropping that signature would silence the worst real
 * failure we have — a white screen on an unverified device.
 *
 * The disambiguator is the page's own self-report: index.html (8s) and
 * main.tsx (10s) both emit `mount-timeout` when React never mounts. Its
 * presence in the same batch means the app really is broken, so the locationless
 * window.error is kept. Its absence means the page booted fine and the error was
 * a blocked third-party subresource.
 */

/**
 * Analytics-only third-party subresources. Deliberately EXCLUDES
 * accounts.google.com/gsi — see header note 1.
 */
const THIRD_PARTY_NOISE_HOSTS = [
  'static.cloudflareinsights.com', // CF Web Analytics beacon — analytics only
  'clients6.google.com', // GSI backing API (not the One-Tap client itself)
  'www.googletagmanager.com',
  'www.google-analytics.com',
  'connect.facebook.net',
];

/** Our own origin — a failure here is ALWAYS a real app fault. */
const OWN_ASSET_MARKERS = ['/assets/', 'deutschup.sintec.my.id', 'deutschup.pages.dev'];

/** Kinds that PROVE the app itself failed to boot. */
const APP_FAULT_KINDS = ['mount-timeout', 'error-boundary', 'unhandledrejection'];

export interface ErrorReportContext {
  /**
   * True when a real app fault was observed for this page load — either a
   * `mount-timeout`, an ErrorBoundary crash, or a failed own-asset chunk.
   */
  hasRealAppFault: boolean;
}

function isThirdPartyNoiseStack(stack: string): boolean {
  return THIRD_PARTY_NOISE_HOSTS.some((host) => stack.includes(host));
}

/**
 * A failed dynamic chunk of OUR OWN app — `Loading chunk 344 failed`,
 * `ChunkLoadError`, `Loading CSS chunk`, etc.
 *
 * ⚠️ This is why a naive "external URL ⇒ noise" rule is dangerous. Vite splits
 * vendor code into chunks served from third-party origins (observed live:
 * `Loading chunk 344 failed. (timeout: https://clerk.…`). That is the app
 * failing to boot for a real user, NOT an adblock casualty, and it must always
 * page someone.
 */
function isChunkLoadFailure(message: string, stack: string): boolean {
  const hay = `${message} ${stack}`;
  return /loading chunk|chunkloaderror|loading css chunk|dynamically imported module|importing a module script failed/i.test(hay);
}

/** A stack that points at one of our own bundles — never filtered. */
export function isOwnAssetStack(stack: string): boolean {
  return OWN_ASSET_MARKERS.some((marker) => stack.includes(marker));
}

/**
 * `file:?:?` — the browser's locationless subresource error: no filename, no
 * line, no column. Also exactly what a failed main bundle looks like, hence the
 * context argument.
 */
export function isLocationlessStack(stack: string): boolean {
  const s = stack.trim();
  return s === '' || s === 'file:?:?' || /^file:\?+:\?*$/.test(s);
}

export interface NoiseVerdict {
  noise: boolean;
  reason: string;
}

/**
 * Decide whether a report is third-party noise. Called BEFORE the DB insert and
 * BEFORE the Discord notify — noise never lands anywhere.
 *
 * @param kind    report kind ('window.error', 'script-load-error', ...)
 * @param message raw message (pre-sanitize is fine; only emptiness matters)
 * @param stack   raw stack / subresource URL
 * @param context page-load context, see ErrorReportContext
 */
export function classifyNoise(
  kind: string,
  message: string,
  stack: string,
  context: ErrorReportContext,
): NoiseVerdict {
  // 1. A failure in our own bundle outranks every filter below.
  if (isOwnAssetStack(stack)) {
    return { noise: false, reason: 'own-asset' };
  }

  // 2. A failed dynamic chunk is an app-boot failure even when the chunk is
  //    served from a third-party origin (Vite vendor chunks, Clerk). Never
  //    filtered — see isChunkLoadFailure.
  if (isChunkLoadFailure(message, stack)) {
    return { noise: false, reason: 'chunk-load-failure' };
  }

  // 3. The app reported that it never booted. Nothing is filtered in that
  //    batch — we want every scrap of evidence for a white screen.
  if (context.hasRealAppFault) {
    return { noise: false, reason: 'app-fault-in-batch' };
  }

  // 4. Explicit analytics-script load failure.
  //    NOTE: only THIRD_PARTY_NOISE_HOSTS here — GSI is intentionally absent,
  //    so a One-Tap failure still reaches Discord.
  if (kind === 'script-load-error' && isThirdPartyNoiseStack(stack)) {
    return { noise: true, reason: 'analytics-script-blocked' };
  }

  // 5. Locationless window.error — the twin of a blocked external script.
  if (kind === 'window.error' && !message.trim() && isLocationlessStack(stack)) {
    return { noise: true, reason: 'locationless-window-error' };
  }

  return { noise: false, reason: 'actionable' };
}

/** True when this kind proves the app failed to boot. */
export function isAppFaultKind(kind: string): boolean {
  return APP_FAULT_KINDS.includes(kind);
}
