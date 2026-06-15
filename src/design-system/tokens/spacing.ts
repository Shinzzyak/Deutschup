/**
 * Design System — Spacing Tokens
 * 4px base unit. All spacing multiples of 4.
 */

export const spacing = {
  0: '0px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

/** Semantic spacing aliases */
export const semanticSpacing = {
  // Component internal
  'component-xs': spacing[1],    // 4px — tight internal
  'component-sm': spacing[2],    // 8px — compact internal
  'component-md': spacing[3],    // 12px — default internal
  'component-lg': spacing[4],    // 16px — spacious internal
  'component-xl': spacing[6],    // 24px — section internal

  // Between elements
  'gap-xs': spacing[1],          // 4px — tight
  'gap-sm': spacing[2],          // 8px — compact
  'gap-md': spacing[3],          // 12px — default
  'gap-lg': spacing[4],          // 16px — comfortable
  'gap-xl': spacing[6],          // 24px — spacious

  // Section padding
  'section-sm': spacing[4],      // 16px
  'section-md': spacing[6],      // 24px
  'section-lg': spacing[8],      // 32px
  'section-xl': spacing[12],     // 48px

  // Page padding
  'page-sm': spacing[4],         // 16px
  'page-md': spacing[6],         // 24px
  'page-lg': spacing[8],         // 32px
} as const;

export type SpacingToken = typeof spacing;
export type SemanticSpacingToken = typeof semanticSpacing;
