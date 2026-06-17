import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router';
import { useEffect, Suspense, lazy, useState, useRef } from 'react';
import { useAuthStore } from './stores/authStore';
import { useProgressStore } from './stores/progressStore';
import { captureRoute } from './stores/debugStore';
import { BookOpen, BrainCircuit, Search, LogOut, Loader2, Trophy, Flame, Sparkles, CreditCard, ShieldCheck, Users, Check, Zap, Star, ArrowRight, GraduationCap, MessageSquare, Mic, TrendingUp, Target, ChevronRight, Globe, BookMarked, BarChart3 } from 'lucide-react';
import { Button } from './components/ui/button';
import { AnimatePresence, motion } from 'motion/react';
import { ClerkProvider } from './lib/clerk';
import LandingPage from './components/LandingPage';

// Lazy-loaded pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DashboardWithPaymentRefresh = lazy(() => import("./pages/DashboardWithPaymentRefresh"));
const LessonView = lazy(() => import('./pages/LessonView'));
const LevelView = lazy(() => import('./pages/LevelView'));
const CheckpointView = lazy(() => import('./pages/CheckpointView'));
const AdminAI = lazy(() => import('./pages/AdminAI'));
const VocabTrainer = lazy(() => import('./pages/VocabTrainer'));
const VerbTrainer = lazy(() => import('./pages/VerbTrainer'));
const Koreksi = lazy(() => import('./pages/Koreksi'));
const Catatan = lazy(() => import('./pages/Catatan'));
const Simulasi = lazy(() => import('./pages/Simulasi'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Admin = lazy(() => import('./pages/Admin'));
const ClerkTest = lazy(() => import('./pages/ClerkTest'));
const CanaryDashboard = lazy(() => import('./pages/CanaryDashboard'));
const DebugAuth = lazy(() => import('./pages/DebugAuth'));
import ChatWidget from './components/ChatWidget';
import DebugOverlay from './components/DebugOverlay';
import QuickNoteWidget from './components/QuickNoteWidget';

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading, profileData } = useAuthStore();
  console.log('[AUTH_WRAPPER] render:', { hasUser: !!user, loading, hasProfile: !!profileData?.full_name });
  const navigate = (window as any).__navigate || (() => {});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, profileData } = useAuthStore();
  console.log('[LAYOUT] mount:', { hasUser: !!user, userId: user?.id?.substring(0, 8) });
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BookOpen },
    { name: 'Level', href: '/level/1', icon: Trophy },
    { name: 'Vocab', href: '/vocab', icon: BrainCircuit },
    { name: 'Catatan', href: '/catatan', icon: BookOpen },
    { name: 'Simulasi', href: '/simulasi', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50" aria-label="Navigasi utama">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-0.5">
                <div className="w-2.5 h-4 bg-black dark:bg-white rounded-sm"></div>
                <div className="w-2.5 h-4 bg-red-600 rounded-sm"></div>
                <div className="w-2.5 h-4 bg-yellow-400 rounded-sm"></div>
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">DeutschUp</span>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== '/' && location.pathname.startsWith(item.href.split('?')[0]));
                return (
                  <Link key={item.name} to={item.href}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}>
                    {item.name}
                  </Link>
                );
              })}
              {profileData?.role === 'admin' && (
                <Link to="/admin"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}>
                  <ShieldCheck className="w-4 h-4 inline mr-1" />
                  Admin
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg"
                aria-label="Cari materi">
                <Search className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center space-x-1 text-sm">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-bold">{useProgressStore.getState().streak}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout} className="text-slate-600 dark:text-slate-400"
                aria-label="Keluar dari akun">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {showSearch && (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <input type="text" placeholder="Cari materi, level, atau topik..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus />
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6" id="main-content">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} aria-label="Navigasi mobile">
        <div className="flex justify-around py-1.5">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/' && location.pathname.startsWith(item.href.split('?')[0]));
            return (
              <Link key={item.name} to={item.href}
                className={`flex flex-col items-center px-2 py-1 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`} aria-label={item.name}>
                <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
              </Link>
            );
          })}
          {profileData?.role === 'admin' && (
            <Link to="/admin"
              className={`flex flex-col items-center px-2 py-1 rounded-xl transition-all ${
                location.pathname.startsWith('/admin')
                  ? 'bg-red-50 dark:bg-red-950 text-red-500'
                  : 'text-slate-500 dark:text-slate-400'
              }`} aria-label="Admin">
              <ShieldCheck className={`w-5 h-5 ${location.pathname.startsWith('/admin') ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-[10px] mt-0.5 ${location.pathname.startsWith('/admin') ? 'font-bold' : 'font-medium'}`}>Admin</span>
            </Link>
          )}
        </div>
      </nav>
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
        <Route path="/level/:id" element={<PageWrapper><LevelView /></PageWrapper>} />
        <Route path="/checkpoint/:id" element={<PageWrapper><CheckpointView /></PageWrapper>} />
        <Route path="/lesson/:id" element={<PageWrapper><LessonView /></PageWrapper>} />
        <Route path="/vocab" element={<PageWrapper><VocabTrainer /></PageWrapper>} />
        <Route path="/verbs" element={<PageWrapper><VerbTrainer /></PageWrapper>} />
        <Route path="/koreksi" element={<PageWrapper><Koreksi /></PageWrapper>} />
        <Route path="/catatan" element={<PageWrapper><Catatan /></PageWrapper>} />
        <Route path="/simulasi" element={<PageWrapper><Simulasi /></PageWrapper>} />
        <Route path="/pricing" element={<PageWrapper><Pricing /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><Admin /></PageWrapper>} />
        <Route path="/admin/ai" element={<PageWrapper><AdminAI /></PageWrapper>} />
        <Route path="/admin/canary" element={<PageWrapper><CanaryDashboard /></PageWrapper>} />
        <Route path="/clerk-test" element={<PageWrapper><ClerkTest /></PageWrapper>} />
        <Route path="/debug-auth" element={<PageWrapper><DebugAuth /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>}>
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const { user, loading } = useAuthStore();
  console.log('[ROUTE] App render:', { hasUser: !!user, loading, pathname: window.location.pathname });

  return (
    <ClerkProvider>
      <BrowserRouter>
        {user ? (
          <AuthWrapper>
            <Layout>
              <AnimatedRoutes />
              <ChatWidget />
              <DebugOverlay />

              <QuickNoteWidget />
            </Layout>
          </AuthWrapper>
        ) : (
          <PublicRoutes />
        )}
      </BrowserRouter>
    </ClerkProvider>
  );
}

