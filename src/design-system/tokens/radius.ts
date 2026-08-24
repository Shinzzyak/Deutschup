/**
 * Design System — Border Radius Tokens
 * Consistent radius scale
 */

export const radius = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
} as const;

/** Semantic radius by component */
export const componentRadius = {
  // Form elements
  button: radius.md,
  input: radius.md,
  select: radius.md,
  textarea: radius.md,

  // Containers
  card: radius['3xl'],
  dialog: radius.xl,
  modal: radius.xl,
  popover: radius.lg,

  // Overlays
  tooltip: radius.sm,
  badge: radius.full,
  avatar: radius.full,
  chip: radius.full,

  // Navigation
  sidebar: radius.none,
  navItem: radius.xl,

  // Widgets
  widget: radius['3xl'],
  chatBubble: radius.xl,
} as const;

export type RadiusToken = typeof radius;
export type ComponentRadiusToken = typeof componentRadius;
