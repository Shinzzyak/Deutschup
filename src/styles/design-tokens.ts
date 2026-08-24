// DeutschUp Design System - Modern Learning App
// Inspired by Duolingo, Babbel, Memrise

export const colors = {
  // Primary brand
  primary: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Main gold
    600: '#D97706',
    700: '#B45309',
  },
  // German flag accent
  german: {
    black: '#1F2937',
    red: '#DC2626',
    gold: '#F2C94C',
  },
  // Learning levels
  level: {
    A1: '#10B981', // Emerald
    A2: '#14B8A6', // Teal
    B1: '#3B82F6', // Blue
    B2: '#6366F1', // Indigo
  },
  // Status colors
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  // Neutral
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceHover: '#F9FAFB',
  border: '#E5E7EB',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    muted: '#9CA3AF',
  }
};

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    display: ['Poppins', 'system-ui', 'sans-serif'],
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
};

export const borderRadius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  glow: '0 0 20px rgb(251 191 36 / 0.4)',
};

export const animations = {
  fadeIn: 'fadeIn 0.2s ease-out',
  slideUp: 'slideUp 0.3s ease-out',
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  bounce: 'bounce 1s infinite',
};

// CSS keyframes as string for inline styles
export const keyframes = {
  fadeIn: `@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`,
  slideUp: `@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`,
};