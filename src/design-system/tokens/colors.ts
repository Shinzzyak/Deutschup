/**
 * Design System — Color Tokens
 * Source of truth for all color usage in Deutschup
 */

export const colors = {
  // Semantic: Primary (Brand)
  primary: {
    DEFAULT: 'oklch(0.205 0 0)',
    foreground: 'oklch(0.985 0 0)',
  },

  // Semantic: Secondary
  secondary: {
    DEFAULT: 'oklch(0.97 0 0)',
    foreground: 'oklch(0.205 0 0)',
  },

  // Semantic: Success
  success: {
    DEFAULT: 'oklch(0.6 0.15 145)',
    foreground: 'oklch(0.985 0 0)',
    light: 'oklch(0.95 0.05 145)',
  },

  // Semantic: Warning
  warning: {
    DEFAULT: 'oklch(0.75 0.15 75)',
    foreground: 'oklch(0.205 0 0)',
    light: 'oklch(0.95 0.05 75)',
  },

  // Semantic: Danger
  danger: {
    DEFAULT: 'oklch(0.577 0.245 27.325)',
    foreground: 'oklch(0.985 0 0)',
    light: 'oklch(0.95 0.05 27)',
  },

  // Semantic: Info
  info: {
    DEFAULT: 'oklch(0.55 0.15 264)',
    foreground: 'oklch(0.985 0 0)',
    light: 'oklch(0.95 0.05 264)',
  },

  // Neutral palette (Tailwind slate)
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Semantic: Background
  background: {
    DEFAULT: 'oklch(1 0 0)',
    foreground: 'oklch(0.145 0 0)',
  },

  // Semantic: Card
  card: {
    DEFAULT: 'oklch(1 0 0)',
    foreground: 'oklch(0.145 0 0)',
  },

  // Semantic: Muted
  muted: {
    DEFAULT: 'oklch(0.97 0 0)',
    foreground: 'oklch(0.556 0 0)',
  },

  // Semantic: Border
  border: {
    DEFAULT: 'oklch(0.922 0 0)',
  },

  // Semantic: Destructive (form validation)
  destructive: {
    DEFAULT: 'oklch(0.577 0.245 27.325)',
    foreground: 'oklch(0.985 0 0)',
  },
} as const;

export type ColorToken = typeof colors;
