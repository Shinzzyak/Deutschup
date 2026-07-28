import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router';
import { useEffect as useEffect2, Suspense, lazy, useRef } from 'react';
import { useAuthStore } from './stores/authStore';
import { useAuth } from '@clerk/clerk-react';
import { captureRoute } from './stores/debugStore';
import { Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ClerkProvider } from './lib/clerk';
import { isClerkEnabled } from './lib/clerk/canary';
import { useAuthSync } from './hooks/useAuthSync';
import ClerkSignIn from './pages/ClerkSignIn';
import ClerkSignUp from './pages/ClerkSignUp';
import LandingPage from './components/LandingPage';
import TopNav from './components/layout/TopNav';
import MobileBottomNav from './components/layout/MobileBottomNav';
import DesktopSidebar from './components/layout/DesktopSidebar';

// Lazy-loaded pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DashboardWithPaymentRefresh = lazy(() => import("./pages/DashboardWithPaymentRefresh"));
const LessonView = lazy(() => import('./pages/LessonView'));
const LevelView = lazy(() => import('./pages/LevelView'));
const CurriculumStudio = lazy(() => import('./pages/CurriculumStudio'));
const CheckpointView = lazy(() => import('./pages/CheckpointView'));
const AdminAI = lazy(() => import('./pages/AdminAI'));
const VocabTrainer = lazy(() => import('./pages/VocabTrainerDB'));
const VerbTrainer = lazy(() => import('./pages/VerbTrainer'));
const Koreksi = lazy(() => import('./pages/Koreksi'));
const Catatan = lazy(() => import('./pages/Catatan'));
const Simulasi = lazy(() => import('./pages/Simulasi'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Admin = lazy(() => import('./pages/Admin'));
const ClerkTest = lazy(() => import('./pages/ClerkTest'));
const CanaryDashboard = lazy(() => import('./pages/CanaryDashboard'));
const GoetheExam = lazy(() => import('./pages/GoetheExam'));
const DebugAuth = lazy(() => import('./pages/DebugAuth'));
import ChatWidget from './components/ChatWidget';
import DebugOverlay from './components/DebugOverlay';
import QuickNoteWidget from './components/QuickNoteWidget';
import OnboardingFlow from './components/OnboardingFlow';

// Check if user has completed onboarding
function hasCompletedOnboarding(): boolean {
  return localStorage.getItem('deutschup_onboarding_complete') === 'true';
}

/* The three route-level spinners below used text-slate-400 (#90a1b9), which on
   the app's white `bg-background` measures 2.63:1 — under the 3:1 floor for a
   graphic that carries meaning. brand-rust is 8.89:1 on the same surface and is
   the accent this app already uses for progress and loading states. */

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading, profileData } = useAuthStore();
  console.log('[AUTH_WRAPPER] render:', { hasUser: !!user, loading, hasProfile: !!profileData?.full_name });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-rust" />
      </div>
    );
  }

  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { profileData, profileLoaded } = useAuthStore();

  // Wait for the profile before judging the role — on a deep link/refresh the
  // store still holds an empty profileData when this first renders.
  if (!profileLoaded) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-rust" />
        <p className="text-sm text-muted-foreground">Memeriksa hak akses admin...</p>
        <Link to="/" className="text-sm underline text-muted-foreground">Kembali ke beranda</Link>
      </div>
    );
  }

  if (profileData?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  console.log('[LAYOUT] mount:', { hasUser: !!user, userId: user?.id?.substring(0, 8) });

  return (
    <div className="min-h-screen bg-background relative">
      <a href="#main-content-desktop" className="hidden lg:block sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-background focus:px-4 focus:py-2 focus:text-foreground">
        Langsung ke konten utama
      </a>
      <a href="#main-content-mobile" className="lg:hidden sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-background focus:px-4 focus:py-2 focus:text-foreground">
        Langsung ke konten utama
      </a>
      <div className="glass-bg-ambient" aria-hidden="true" />
      {/* Desktop: top nav + sidebar layout */}
      <div className="hidden lg:flex flex-col h-screen">
        <TopNav />
        <div className="flex flex-1 overflow-hidden">
          <DesktopSidebar />
          <main
            className="flex-1 overflow-y-auto px-6 py-6"
            id="main-content-desktop"
          >
            <div className="max-w-5xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile/Tablet: top nav only + bottom tabs */}
      <div className="lg:hidden flex flex-col min-h-screen">
        <TopNav />
        <main
          className="flex-1 px-4 py-6 pb-[calc(8rem+env(safe-area-inset-bottom))]"
          id="main-content-mobile"
        >
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const prevRoute = useRef(location.pathname);
  
  useEffect(() => {
    if (prevRoute.current !== location.pathname) {
      captureRoute(prevRoute.current, location.pathname);
      prevRoute.current = location.pathname;
    }
  }, [location.pathname]);

  console.log('[ROUTE] AnimatedRoutes:', { pathname: location.pathname });
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><DashboardWithPaymentRefresh /></PageWrapper>} />
        <Route path="/dashboard" element={<PageWrapper><DashboardWithPaymentRefresh /></PageWrapper>} />
        <Route path="/curriculum" element={<PageWrapper><CurriculumStudio /></PageWrapper>} />
        <Route path="/level/:id" element={<PageWrapper><LevelView /></PageWrapper>} />
        <Route path="/lessons" element={<Navigate to="/curriculum" replace />} />
        <Route path="/checkpoint/:id" element={<PageWrapper><CheckpointView /></PageWrapper>} />
        <Route path="/lesson/:id" element={<PageWrapper><LessonView /></PageWrapper>} />
        <Route path="/vocab" element={<PageWrapper><VocabTrainer /></PageWrapper>} />
        <Route path="/vocab-trainer" element={<PageWrapper><VocabTrainer /></PageWrapper>} />
        <Route path="/verbs" element={<PageWrapper><VerbTrainer /></PageWrapper>} />
        <Route path="/verb-trainer" element={<PageWrapper><VerbTrainer /></PageWrapper>} />
        <Route path="/koreksi" element={<PageWrapper><Koreksi /></PageWrapper>} />
        <Route path="/catatan" element={<PageWrapper><Catatan /></PageWrapper>} />
        <Route path="/simulasi" element={<PageWrapper><Simulasi /></PageWrapper>} />
        <Route path="/goethe" element={<PageWrapper><GoetheExam /></PageWrapper>} />
        <Route path="/exam" element={<PageWrapper><GoetheExam /></PageWrapper>} />
        <Route path="/pricing" element={<PageWrapper><Pricing /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><RequireAdmin><Admin /></RequireAdmin></PageWrapper>} />
        <Route path="/admin/ai" element={<PageWrapper><RequireAdmin><AdminAI /></RequireAdmin></PageWrapper>} />
        <Route path="/admin-ai" element={<PageWrapper><RequireAdmin><AdminAI /></RequireAdmin></PageWrapper>} />
        <Route path="/admin/canary" element={<PageWrapper><RequireAdmin><CanaryDashboard /></RequireAdmin></PageWrapper>} />
        <Route path="/clerk-test" element={<PageWrapper><ClerkTest /></PageWrapper>} />
        <Route path="/debug-auth" element={<PageWrapper><DebugAuth /></PageWrapper>} />
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-rust" /></div>}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </Suspense>
  )
}

function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/sign-in/*" element={<ClerkSignIn />} />
      <Route path="/sign-up/*" element={<ClerkSignUp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function OnboardingWrapper({ children }: { children: React.ReactNode }) {
  const { profileData } = useAuthStore();
  
  // If backend says completed, OR local storage says completed (fallback for guest), we hide it
  const isCompletedInDB = profileData?.onboarding_completed === true;
  const isCompletedLocally = localStorage.getItem('deutschup_onboarding_complete') === 'true';
  
  const [showOnboarding, setShowOnboarding] = useState(!(isCompletedInDB || isCompletedLocally));

  const handleOnboardingComplete = () => {
    localStorage.setItem('deutschup_onboarding_complete', 'true');
    setShowOnboarding(false);
  };

  // Auto-hide if profile fetch finishes later and says it's completed
  useEffect(() => {
    if (isCompletedInDB) setShowOnboarding(false);
  }, [isCompletedInDB]);

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return <>{children}</>;
}

function AuthenticatedShell({ user }: { user: unknown }) {
  return (
    <>{user ? (
      <AuthWrapper>
        <OnboardingWrapper>
          <Layout>
            <AnimatedRoutes />
            <ChatWidget />
            <DebugOverlay />
            <QuickNoteWidget />
          </Layout>
        </OnboardingWrapper>
      </AuthWrapper>
    ) : (
      <PublicRoutes />
    )}</>
  );
}

function ClerkAppContent() {
  const { user, loading } = useAuthStore();
  const { isLoaded: clerkLoaded, isSignedIn } = useAuth();

  // Call useAuthSync here so it always runs (sets user when Clerk is ready)
  useAuthSync();

  console.log('[ROUTE] App render:', { hasUser: !!user, loading, clerkLoaded, isSignedIn, pathname: window.location.pathname });

  // Show loading while Clerk is initializing OR while signed in but user not set yet
  if (!clerkLoaded || (isSignedIn && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* border-amber-500 (#fe9a00) is 2.13:1 on the white bg-background — under
            the 3:1 floor, and this is the first thing a signed-out visitor sees
            while Clerk boots. brand-rust is 8.89:1. Square corner to match the
            rest of the brand; the spin still reads as motion. */}
        <div className="animate-spin h-8 w-8 border-b-2 border-brand-rust" role="status" aria-label="Memuat"></div>
      </div>
    );
  }

  return <AuthenticatedShell user={isSignedIn ? user : null} />;
}

function AppContent() {
  const { user, loading } = useAuthStore();

  if (isClerkEnabled()) {
    return <ClerkAppContent />;
  }

  console.log('[ROUTE] App render:', { hasUser: !!user, loading, clerkLoaded: true, isSignedIn: !!user, pathname: window.location.pathname });

  return <AuthenticatedShell user={user} />;
}

export default function App() {
  return (
    <ClerkProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ClerkProvider>
  );
}

// force rebuild Wed Jun 24 00:38:08 UTC 2026
