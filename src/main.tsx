import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import { initDebugCapture } from './stores/debugStore';
import './index.css';
import { TooltipProvider } from './components/ui/tooltip';
import { ToastProvider } from './components/ui/toast';

// === REMOTE ERROR REPORTER — fire-and-forget to /api/error-report ===
// Helps diagnose device-specific white screens we cannot reproduce here.
function reportRemote(kind: string, err: unknown, extra?: Record<string, string>) {
  try {
    const e = err as any;
    const payload: Record<string, string> = {
      kind,
      message: String(e?.message || e?.reason?.message || ''),
      stack: String(e?.stack || e?.reason?.stack || '').slice(0, 2000),
      url: window.location.href.slice(0, 300),
      ua: navigator.userAgent.slice(0, 300),
      ...extra,
    };
    fetch('/api/error-report', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {}
}

// === EVIDENCE MODE — always on, captures exact failure ===
// Global error handlers — catch white-screen crashes
window.addEventListener('error', (e) => {
  console.error('[CRASH] window.error:', {
    msg: e.message,
    file: e.filename?.replace('https://deutschup.sintec.my.id', ''),
    line: e.lineno,
    col: e.colno,
    stack: e.error?.stack?.substring(0, 500)
  });
  reportRemote('window.error', e.error || e);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('[CRASH] unhandledrejection:', {
    msg: e.reason?.message || String(e.reason)?.substring(0, 300),
    stack: e.reason?.stack?.substring(0, 500)
  });
  reportRemote('unhandledrejection', e.reason);
});

// If React has not mounted 10s after load, report it — device-specific white screen.
setTimeout(() => {
  try {
    const root = document.getElementById('root');
    if (!root || root.children.length === 0) {
      reportRemote('mount-timeout', new Error('React did not mount within 10s'), {
        build: document.querySelector('script[src*="/assets/index-"]')?.getAttribute('src') || '',
      });
    }
  } catch {}
}, 10000);

console.log('[APP_START] timestamp:', new Date().toISOString());
console.log('[APP_START] URL:', window.location.href);
console.log('[APP_START] hostname:', window.location.hostname);

// Initialize debug capture for mobile debugging
initDebugCapture();

// === DEBUG MODE ===
// Set to true to enable build badge only
const DEBUG_MODE = false;

if (DEBUG_MODE) {
  // === BUILD IDENTIFIER ===
  const buildTag = document.createElement('div');
  buildTag.textContent = `BUILD ${new Date().toISOString().replace('T', '-').substring(0, 16)}`;
  buildTag.style.cssText = 'position:fixed;bottom:4px;right:4px;z-index:99999;background:#f00;color:#fff;font:10px monospace;padding:2px 6px;border-radius:4px;pointer-events:none;';
  document.body.appendChild(buildTag);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {/* Toasts sit inside ErrorBoundary (so a fault in the toast layer is
          caught rather than white-screening) but outside TooltipProvider, so
          every route, dialog and widget can reach useToast(). */}
      <ToastProvider>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
);

console.log('[APP_START] React root mounted');
// force rebuild Wed Jun 24 00:38:08 UTC 2026
