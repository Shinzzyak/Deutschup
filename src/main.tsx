import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { TooltipProvider } from './components/ui/tooltip';

// === TEMPORARY DEBUG — visible overlay ===
const debugDiv = document.createElement('div');
debugDiv.id = 'debug-overlay';
debugDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#000;color:#0f0;font:12px monospace;padding:8px;max-height:40vh;overflow:auto;display:none;';
document.body.appendChild(debugDiv);

function showDebug(type, data) {
  debugDiv.style.display = 'block';
  const line = document.createElement('div');
  line.style.cssText = 'border-bottom:1px solid #333;padding:4px 0;word-break:break-all;';
  line.textContent = `[${type}] ${typeof data === 'string' ? data : JSON.stringify(data)}`;
  debugDiv.appendChild(line);
}

window.addEventListener('error', (e) => {
  showDebug('GLOBAL', {
    msg: e.message,
    file: e.filename,
    line: e.lineno,
    col: e.colno,
    stack: e.error?.stack?.substring(0, 500)
  });
});

window.addEventListener('unhandledrejection', (e) => {
  showDebug('PROMISE', {
    msg: e.reason?.message || String(e.reason)?.substring(0, 300),
    stack: e.reason?.stack?.substring(0, 500)
  });
});
// === END DEBUG ===

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <App />
    </TooltipProvider>
  </StrictMode>,
);
