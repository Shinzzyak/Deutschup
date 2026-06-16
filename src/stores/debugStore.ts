const STORAGE_KEY = 'debug_logs';
const MAX_ENTRIES = 100;

export interface DebugEntry {
  timestamp: string;
  type: string;
  message?: string;
  detail?: string;
  route?: string;
}

function readAll(): DebugEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function append(entry: DebugEntry) {
  try {
    const all = readAll();
    all.unshift(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all.slice(0, MAX_ENTRIES)));
  } catch {}
}

export function getDebugLogs(): DebugEntry[] {
  return readAll();
}

export function clearDebugLogs() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

export function captureError(e: string | Event | ErrorEvent | PromiseRejectionEvent, type: string) {
  let msg = '';
  let detail = '';
  let route = window.location.pathname;

  if (e instanceof ErrorEvent) {
    msg = e.message;
    detail = `file: ${e.filename || '?'}  line: ${e.lineno || '?'}  col: ${e.colno || '?'}`;
  } else if (e instanceof PromiseRejectionEvent) {
    msg = String(e.reason?.message || e.reason || 'unknown');
    detail = e.reason?.stack?.substring(0, 500) || '';
  } else if (e instanceof Error) {
    msg = e.message;
    detail = e.stack?.substring(0, 500) || '';
  } else {
    msg = String(e);
  }

  append({ timestamp: new Date().toISOString(), type, message: msg, detail, route });
}

export function captureRoute(from: string, to: string) {
  append({ timestamp: new Date().toISOString(), type: 'route', message: `${from} → ${to}`, route: to });
}

export function captureAuth(event: string, detail?: string) {
  append({ timestamp: new Date().toISOString(), type: 'auth', message: event, detail, route: window.location.pathname });
}

export function initDebugCapture() {
  // Global error handlers
  window.addEventListener('error', (e) => captureError(e, 'window.error'));
  window.addEventListener('unhandledrejection', (e) => captureError(e, 'unhandledrejection'));

  // Capture initial route
  captureRoute('', window.location.pathname);
}

// Convenience: get last N errors
export function getRecentErrors(n = 50): DebugEntry[] {
  return readAll()
    .filter(e => e.type.includes('error') || e.type === 'unhandledrejection')
    .slice(0, n);
}

// Get auth events
export function getAuthEvents(n = 50): DebugEntry[] {
  return readAll()
    .filter(e => e.type === 'auth')
    .slice(0, n);
}
