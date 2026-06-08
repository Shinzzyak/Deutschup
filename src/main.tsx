import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { TooltipProvider } from './components/ui/tooltip';

// === DEBUG MODE ===
// Set to true to enable debug overlay and build badge
const DEBUG_MODE = false;

if (DEBUG_MODE) {
  // === BUILD IDENTIFIER ===
  const buildTag = document.createElement('div');
  buildTag.textContent = `BUILD ${new Date().toISOString().replace('T', '-').substring(0, 16)}`;
  buildTag.style.cssText = 'position:fixed;bottom:4px;right:4px;z-index:99999;background:#f00;color:#fff;font:10px monospace;padding:2px 6px;border-radius:4px;pointer-events:none;';
  document.body.appendChild(buildTag);
  // === END BUILD ID ===

  // === TEMPORARY DEBUG — visible overlay + global fetch interceptor ===
  const debugDiv = document.createElement('div');
  debugDiv.id = 'debug-overlay';
  debugDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#000;color:#0f0;font:12px monospace;padding:8px;max-height:40vh;overflow:auto;display:none;word-break:break-all;';
  document.body.appendChild(debugDiv);

  function showDebug(type, data) {
    debugDiv.style.display = 'block';
    const line = document.createElement('div');
    line.style.cssText = 'border-bottom:1px solid #333;padding:4px 0;';
    line.textContent = `[${type}] ${typeof data === 'string' ? data : JSON.stringify(data).substring(0, 500)}`;
    debugDiv.appendChild(line);
  }

  const origFetch = window.fetch;
  window.fetch = async function(...args) {
    const resp = await origFetch.apply(this, args);
    const raw = args[0];
    const url = typeof raw === 'string' ? raw : (raw as any)?.url || '';
    if (url.includes('/api/')) {
      const clone = resp.clone();
      try {
        const text = await clone.text();
        const ct = resp.headers.get('content-type') || '';
        const isHtml = text.trim().startsWith('<!') || text.trim().startsWith('<html');
        showDebug(isHtml ? 'HTML!' : 'API', {
          url,
          status: resp.status,
          ct: ct.substring(0, 50),
          body: text.substring(0, 200)
        });
      } catch(e) {}
    }
    return resp;
  };

  window.addEventListener('error', (e) => {
    showDebug('GLOBAL-ERR', {
      msg: e.message,
      file: e.filename?.replace('https://deutschup.sintec.my.id', ''),
      line: e.lineno,
      col: e.colno,
      stack: e.error?.stack?.substring(0, 400)
    });
  });

  window.addEventListener('unhandledrejection', (e) => {
    showDebug('PROMISE-ERR', {
      msg: e.reason?.message || String(e.reason)?.substring(0, 300),
      stack: e.reason?.stack?.substring(0, 400)
    });
  });
  // === END DEBUG ===
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <App />
    </TooltipProvider>
  </StrictMode>,
);
