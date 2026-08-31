// Clerk appearance tokens — maps Clerk's card chrome onto the DeutschUp
// design system (docs/DESIGN-LANGUAGE.md): zero radius, zero shadow, surface
// ladder, hairlines only. Shared by SignIn / SignUp / GoogleOneTap.
export const clerkAppearance = {
  baseTheme: undefined, // keep default light; we recolor every surface below
  variables: {
    colorBackground: '#faf7f4',        // surface-1
    colorInputBackground: '#ffffff',   // inputs sit one step above the card
    colorInputText: '#0a0a0a',
    colorText: '#0a0a0a',
    colorTextSecondary: '#5c5956',     // ink-muted
    colorMuted: '#ece5dd',             // surface-2
    colorMutedForeground: '#706d6b',   // ink-subtle
    colorPrimary: '#0a0a0a',           // ink buttons, no colored CTA
    colorPrimaryText: '#f5f0eb',
    colorDanger: '#8b2500',            // rust, not stock red
    colorSuccess: '#2d8a4e',
    colorWarning: '#8b2500',
    colorAlphaShade: '#0a0a0a',
    borderRadius: '0px',
    borderRadiusSm: '0px',
    borderRadiusMd: '0px',
    borderRadiusLg: '0px',
    borderRadiusXl: '0px',
    boxShadow: 'none',
    fontFamily: "'Geist Variable', sans-serif",
    fontFamilyButtons: "'Geist Variable', sans-serif",
    fontWeight: { regular: 400, medium: 600, semibold: 700, bold: 800 },
  },
  elements: {
    // Card
    rootBox: 'w-full',
    card: 'bg-surface-1! border-[1px]! border-brand-ink/20! rounded-none! shadow-none! p-6!',
    headerTitle: 'text-ink! text-xl! font-bold! tracking-tight! font-sans!',
    headerSubtitle: 'text-ink-muted! text-sm! mt-1!',
    socialButtonsBlockButtonText: 'text-ink! text-sm! font-semibold!',
    socialButtonsBlockButton:
      'bg-white! border-[1px]! border-brand-ink/20! rounded-none! shadow-none! min-h-11! ' +
      'hover:bg-surface-2! transition-colors!',
    dividerText: 'text-ink-subtle! text-[11px]! uppercase! tracking-widest!',
    dividerLine: 'bg-brand-ink/10!',
    formFieldLabel: 'text-ink! text-xs! font-semibold! uppercase! tracking-widest!',
    formFieldInput:
      'bg-white! text-ink! text-base! rounded-none! border-brand-ink/20! ' +
      'shadow-none! focus:ring-0! focus-visible:rounded-none!',
    formButtonPrimary:
      'bg-brand-ink! text-brand-cream! rounded-none! min-h-11! ' +
      'text-sm! font-semibold! hover:bg-brand-ink/90! shadow-none!',
    formButtonReset: 'text-brand-rust!',
    formHeaderTitle: 'text-ink! font-sans!',
    identityPreviewText: 'text-ink!',
    identityPreviewEditButton: 'text-brand-rust!',
    footerActionText: 'text-ink-muted! text-sm!',
    footerActionLink: 'text-brand-rust! font-semibold! hover:underline!',
    alertText: 'text-brand-rust!',
    formFieldErrorText: 'text-brand-rust!',
    // Badge / chips
    badge: 'bg-surface-2! text-ink-subtle! rounded-none! border border-brand-ink/10! text-[10px]! uppercase! tracking-widest!',
    // OTP / code inputs
    otpCodeFieldInput:
      'rounded-none! border-brand-ink/20! bg-white! text-ink! ' +
      'font-bold! focus:ring-0! focus-visible:rounded-none!',
    // Phone inputs
    countryCodeSelect: 'rounded-none! bg-white! text-ink! border-brand-ink/20!',
    // Loading
    loadingBar: 'bg-brand-ink!',
    spinner: 'text-brand-ink!',
    // Logo inside Clerk header (we render our own above the card)
    logoImage: 'hidden!',
    logoBox: 'hidden!',
    profileSectionTitle: 'text-ink!',
  },
};
