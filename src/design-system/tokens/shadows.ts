/**
 * Design System — Shadow Tokens
 * Elevation system for depth
 */

export const shadows = {
  // Level 0: No shadow
  none: 'none',

  // Level 1: Subtle lift (cards at rest)
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',

  // Level 2: Hover state (interactive elements)
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',

  // Level 3: Floating (dropdowns, popovers)
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',

  // Level 4: Modal overlays
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
} as const;

/** Semantic shadow by component */
export const componentShadows = {
  // Cards
  card: shadows.sm,
  'card-hover': shadows.md,

  // Dialogs/Modals
  dialog: shadows.xl,
  modal: shadows.xl,

  // Dropdowns
  dropdown: shadows.lg,
  popover: shadows.lg,
  tooltip: shadows.md,

  // Widgets
  widget: shadows.sm,
  'widget-hover': shadows.md,

  // Navigation
  sidebar: shadows.none,
  header: shadows.sm,

  // Buttons
  button: shadows.none,
  'button-hover': shadows.sm,
} as const;

export type ShadowToken = typeof shadows;
export type ComponentShadowToken = typeof componentShadows;
