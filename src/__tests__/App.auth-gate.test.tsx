import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

const state = vi.hoisted(() => ({
  clerkAuth: { isLoaded: true, isSignedIn: false },
  authStore: {
    user: { id: 'stale_user', email: 'stale@example.test', user_metadata: {} },
    loading: false,
    profileData: {},
  },
}));

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => state.clerkAuth,
}));

vi.mock('../lib/clerk', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../lib/clerk/canary', () => ({
  isClerkEnabled: () => true,
}));

vi.mock('../hooks/useAuthSync', () => ({
  useAuthSync: vi.fn(),
}));

vi.mock('../stores/authStore', () => ({
  useAuthStore: () => state.authStore,
}));

vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
}));

vi.mock('../components/LandingPage', () => ({
  default: () => <div>PUBLIC LANDING</div>,
}));

vi.mock('../components/layout/TopNav', () => ({
  default: () => <div>AUTH TOP NAV</div>,
}));

vi.mock('../components/layout/DesktopSidebar', () => ({
  default: () => <div>AUTH DESKTOP SIDEBAR</div>,
}));

vi.mock('../components/layout/MobileBottomNav', () => ({
  default: () => <div>AUTH MOBILE NAV</div>,
}));

vi.mock('../components/ChatWidget', () => ({ default: () => <div>AUTH CHAT</div> }));
vi.mock('../components/DebugOverlay', () => ({ default: () => <div>AUTH DEBUG</div> }));
vi.mock('../components/QuickNoteWidget', () => ({ default: () => <div>AUTH NOTE</div> }));
vi.mock('../components/OnboardingFlow', () => ({ default: () => <div>AUTH ONBOARDING</div> }));
vi.mock('../pages/DashboardWithPaymentRefresh', () => ({ default: () => <div>AUTH DASHBOARD</div> }));
vi.mock('../pages/Pricing', () => ({ default: () => <div>PUBLIC PRICING</div> }));
vi.mock('../pages/ClerkSignIn', () => ({ default: () => <div>PUBLIC SIGN IN</div> }));
vi.mock('../pages/ClerkSignUp', () => ({ default: () => <div>PUBLIC SIGN UP</div> }));

import App from '../App';

describe('App Clerk auth gate', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('deutschup_onboarding_complete', 'true');
    window.history.pushState({}, '', '/dashboard');
    state.clerkAuth = { isLoaded: true, isSignedIn: false };
    state.authStore = {
      user: { id: 'stale_user', email: 'stale@example.test', user_metadata: {} },
      loading: false,
      profileData: {},
    };
  });

  it('renders public routes when Clerk is signed out even if authStore still has a stale user', async () => {
    render(<App />);

    await waitFor(() => expect(screen.getByText('PUBLIC LANDING')).toBeInTheDocument());
    expect(screen.queryByText('AUTH DASHBOARD')).not.toBeInTheDocument();
    expect(screen.queryByText('AUTH TOP NAV')).not.toBeInTheDocument();
  });
});
