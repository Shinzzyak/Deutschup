import { useState, useEffect, useCallback } from 'react';

/**
 * NOT WIRED UP. Nothing in src/ calls this hook, so the `.dark` class is never
 * put on <html> and the app renders permanently light — including the `.dark`
 * token block in src/index.css, which is therefore also dead.
 *
 * This matters because it is easy to assume otherwise: the admin pages were
 * authored with dark-surface colours (text-emerald-400, text-amber-400,
 * text-blue-300) that consequently landed on white cards at 1.3–2.8:1. Those
 * pages have since been converted to light-native brand tokens.
 *
 * Kept rather than deleted because the implementation is sound and the `.dark`
 * token block already exists. Before calling it, be aware that turning dark
 * mode on app-wide requires dark variants on every surface — none currently
 * have them, so enabling this today would break contrast broadly rather than
 * fix it.
 */

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'system';
    }
    return 'system';
  });

  const applyTheme = useCallback((t: Theme) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (t === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(isDark ? 'dark' : 'light');
    } else {
      root.classList.add(t);
    }
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem('theme', t);
    applyTheme(t);
  }, [applyTheme]);

  useEffect(() => {
    applyTheme(theme);
    
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme, applyTheme]);

  return { theme, setTheme };
}
