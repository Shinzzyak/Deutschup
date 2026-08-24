# DeutschUp Design System
# Learning App - Warmth & Approachability + Boldness & Clarity
# German language learning for Indonesian speakers

## Domain Exploration
**Concepts:** Lernen (belajar), Fortschritt (kemajuan), Streak (rangkaian), Belohnung (hadiah), Ebene (tingkat), Übung (latihan), Prüfung (ujian)
**Color World:** German flag (schwarz, rot, gold), classroom warmth, notebook paper, chalk on blackboard
**Signature:** German tricolor accent stripe + progress ring with level colors
**Rejecting:** Generic purple gradients → German flag gold/red accent. Plain cards → elevated cards with level-specific colors.

## Design Direction: Warmth & Approachability + Bold Clarity
- Warm, inviting, friendly (learning should feel encouraging)
- Bold progress indicators and gamification elements
- German flag as brand identity (not just decoration)
- Level colors: A1=Emerald, A2=Teal, B1=Blue, B2=Indigo

## Token Architecture

```css
:root {
  /* Font */
  --font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Spacing (8px base) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  
  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --radius-full: 9999px;
  
  /* Colors - Light Mode */
  --color-bg: #FAFAF9;
  --color-surface: #FFFFFF;
  --color-surface-raised: #FFFFFF;
  --color-surface-inset: #F5F5F4;
  
  --color-text-primary: #1C1917;
  --color-text-secondary: #57534E;
  --color-text-muted: #A8A29E;
  
  --color-border: rgba(0, 0, 0, 0.08);
  --color-border-subtle: rgba(0, 0, 0, 0.04);
  --color-border-strong: rgba(0, 0, 0, 0.15);
  
  /* Brand - German Flag */
  --color-black: #1F2937;
  --color-red: #DC2626;
  --color-gold: #F2C94C;
  --color-gold-dark: #D4A418;
  
  /* Accent */
  --color-accent: #F59E0B;
  --color-accent-hover: #D97706;
  
  /* Level Colors */
  --color-level-a1: #10B981;
  --color-level-a2: #14B8A6;
  --color-level-b1: #3B82F6;
  --color-level-b2: #6366F1;
  
  /* Semantic */
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  
  /* Animation */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
}
```

## Component Patterns

### Cards
- Border: 1px solid var(--color-border)
- Shadow: var(--shadow-sm) default, var(--shadow-md) hover
- Radius: var(--radius-lg)
- Padding: var(--space-5)
- Background: var(--color-surface)

### Buttons
- Primary: bg var(--color-accent), text white, shadow-md
- Secondary: bg transparent, border, text var(--color-text-primary)
- Ghost: bg transparent, text var(--color-text-secondary)
- Height: 40px (md), 48px (lg)
- Radius: var(--radius-md)
- Font-weight: 600

### Progress Indicators
- Progress bar: 8px height, rounded-full, bg var(--color-surface-inset)
- Progress ring: SVG circle, stroke-width 8, linecap round
- Level badge: pill shape, level color bg, white text

### Navigation
- Top nav: glass morphism (backdrop-blur), border-bottom
- Mobile: bottom tab bar, icons + labels
- Desktop: optional sidebar

###Gamification
- XP display: gold accent, bold number
- Streak: fire emoji + count, orange gradient
- Achievements: circular badges with icons
- Level progress: ring or bar with percentage

## Typography
- Display: 24-32px, weight 800, tight tracking
- Heading: 18-20px, weight 700
- Body: 14-16px, weight 400-500
- Caption: 12-13px, weight 500, muted color
- Data: tabular-nums, mono font

## Spacing
- Component internal: var(--space-4) to var(--space-6)
- Between components: var(--space-6) to var(--space-8)
- Section gap: var(--space-8) to var(--space-12)
- Page padding: var(--space-6) mobile, var(--space-8) desktop

## Depth Strategy
- Subtle shadows (not borders-only, not dramatic)
- Elevation: base (no shadow) → raised (shadow-sm) → overlay (shadow-lg)
- Hover states increase shadow slightly

## Interaction States
- Hover: subtle background shift + shadow increase
- Focus: 2px ring with offset
- Active: slight scale-down (0.98)
- Disabled: opacity 50%, no pointer events
- Loading: skeleton shimmer or spinner
