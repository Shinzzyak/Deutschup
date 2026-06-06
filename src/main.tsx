import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { TooltipProvider } from './components/ui/tooltip';

// === TEMPORARY DEBUG ===
window.addEventListener('error', (e) => {
  console.error('[GLOBAL ERROR]', {
    message: e.message,
    filename: e.filename,
    lineno: e.lineno,
    colno: e.colno,
    error: e.error?.stack || e.error
  });
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('[PROMISE ERROR]', {
    reason: e.reason?.stack || e.reason,
    message: e.reason?.message
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
