/**
 * Design System — Typography Tokens
 * Font scale, weights, line heights
 */

export const typography = {
  // Font families
  fontFamily: {
    sans: "'Geist Variable', system-ui, sans-serif",
    heading: 'var(--font-sans)',
  },

  // Font sizes (Tailwind classes)
  fontSize: {
    xs: { size: '0.75rem', lineHeight: '1rem' },      // 12px
    sm: { size: '0.875rem', lineHeight: '1.25rem' },   // 14px
    base: { size: '1rem', lineHeight: '1.5rem' },      // 16px
    lg: { size: '1.125rem', lineHeight: '1.75rem' },   // 18px
    xl: { size: '1.25rem', lineHeight: '1.75rem' },    // 20px
    '2xl': { size: '1.5rem', lineHeight: '2rem' },     // 24px
    '3xl': { size: '1.875rem', lineHeight: '2.25rem' },// 30px
    '4xl': { size: '2.25rem', lineHeight: '2.5rem' },  // 36px
    '5xl': { size: '3rem', lineHeight: '1' },           // 48px
  },

  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Semantic typography presets
  presets: {
    // Display: hero, marketing headers
    display: 'text-5xl font-bold tracking-tight',
    // H1: page titles
    h1: 'text-4xl font-bold tracking-tight',
    // H2: section headers
    h2: 'text-3xl font-bold',
    // H3: subsection headers
    h3: 'text-2xl font-semibold',
    // H4: card titles
    h4: 'text-xl font-semibold',
    // Body: default text
    body: 'text-base font-medium',
    // Body small: secondary text
    'body-sm': 'text-sm font-medium',
    // Caption: labels, hints
    caption: 'text-xs font-medium',
    // Label: form labels
    label: 'text-sm font-semibold',
  },
} as const;

export type TypographyToken = typeof typography;
