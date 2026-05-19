import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router';
import { useEffect, Suspense, lazy } from 'react';
import { useAuthStore } from './stores/authStore';
import { useProgressStore } from './stores/progressStore';
import { BookOpen, BrainCircuit, Search, LogOut, Loader2, Trophy, Flame, Sparkles, CreditCard, ShieldCheck } from 'lucide-react';
import { Button } from './components/ui/button';
import { AnimatePresence, motion } from 'motion/react';

// Lazy load Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LessonView = lazy(() => import('./pages/LessonView'));
const VocabTrainer = lazy(() => import('./pages/VocabTrainer'));
const VerbTrainer = lazy(() => import('./pages/VerbTrainer'));
const Koreksi = lazy(() => import('./pages/Koreksi'));
const Catatan = lazy(() => import('./pages/Catatan'));
const Simulasi = lazy(() => import('./pages/Simulasi'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Admin = lazy(() => import('./pages/Admin'));
import ChatWidget from './components/ChatWidget';
import QuickNoteWidget from './components/QuickNoteWidget';

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuthStore();
  const { loadProgress, initialized, loading: progressLoading } = useProgressStore();

  useEffect(() => {
    if (user && !initialized) {
      loadProgress(user.uid);
    }
  }, [user, initialized, loadProgress]);

  if (authLoading || (user && progressLoading && !initialized)) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  // Not blocking login anymore, guest mode is allowed
  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  const { user, loginWithGoogle, logout } = useAuthStore();
  const { xp, streak } = useProgressStore();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 bg-white border-r border-slate-200 p-4 flex flex-col md:h-screen md:sticky top-0 z-50 shadow-sm md:shadow-none">
        <div className="flex items-center space-x-2 mb-8 px-2 pt-2 pb-4 border-b border-slate-100">
           <div className="flex space-x-0.5">
             <div className="w-3 h-5 bg-black rounded-sm"></div>
             <div className="w-3 h-5 bg-red-600 rounded-sm"></div>
             <div className="w-3 h-5 bg-yellow-400 rounded-sm"></div>
           </div>
           <span className="font-bold tracking-tight text-xl">DeutschUp</span>
        </div>

        <div className="flex gap-4 mb-8 px-2 md:flex-col">
          <div className="flex items-center space-x-2 text-orange-500 font-bold bg-orange-50 px-3 py-2 rounded-xl flex-1 justify-center md:justify-start">
            <Flame className="w-5 h-5" />
            <span>{streak} Hari</span>
          </div>
          <div className="flex items-center space-x-2 text-blue-600 font-bold bg-blue-50 px-3 py-2 rounded-xl flex-1 justify-center md:justify-start">
            <Trophy className="w-5 h-5" />
            <span>{xp} XP</span>
          </div>
        </div>

        <ul className="flex-1 space-y-2 flex flex-row overflow-x-auto md:flex-col items-center md:items-stretch pb-2">
          <li>
            <Link to="/" className="flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium hover:text-slate-900 focus:bg-slate-100">
              <BookOpen className="w-5 h-5 flex-shrink-0" />
              <span className="hidden md:inline">Kurikulum</span>
            </Link>
          </li>
          <li>
            <Link to="/vocab" className="flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium hover:text-slate-900 focus:bg-slate-100">
              <BrainCircuit className="w-5 h-5 flex-shrink-0" />
              <span className="hidden md:inline">Latihan Kosakata</span>
            </Link>
          </li>
          <li>
            <Link to="/verbs" className="flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium hover:text-slate-900 focus:bg-slate-100">
              <Search className="w-5 h-5 flex-shrink-0" />
              <span className="hidden md:inline">Kamus Mini</span>
            </Link>
          </li>
          <li>
            <Link to="/koreksi" className="flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium hover:text-slate-900 focus:bg-slate-100">
              <Sparkles className="w-5 h-5 flex-shrink-0 text-yellow-500" />
              <span className="hidden md:inline">Koreksi Pintar</span>
            </Link>
          </li>
          <li>
            <Link to="/catatan" className="flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium hover:text-slate-900 focus:bg-slate-100">
              <BookOpen className="w-5 h-5 flex-shrink-0 text-blue-500" />
              <span className="hidden md:inline">Catatan Belajar</span>
            </Link>
          </li>
          <li>
            <Link to="/simulasi" className="flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium hover:text-slate-900 focus:bg-slate-100">
              <BookOpen className="w-5 h-5 flex-shrink-0 text-amber-500" />
              <span className="hidden md:inline">Simulasi Ujian</span>
            </Link>
          </li>
          <li>
            <Link to="/pricing" className="flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium hover:text-slate-900 focus:bg-slate-100">
              <CreditCard className="w-5 h-5 flex-shrink-0 text-indigo-500" />
              <span className="hidden md:inline">Langganan</span>
            </Link>
          </li>
          {user?.email === 'abdullahalmughiroh@gmail.com' && (
            <li>
              <Link to="/admin" className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors font-medium focus:bg-red-50">
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                <span className="hidden md:inline">Admin Panel</span>
              </Link>
            </li>
          )}
        </ul>

        <div className="mt-auto flex flex-col space-y-2 p-4 bg-slate-50 rounded-2xl md:bg-transparent md:p-0 lg:p-4 lg:bg-slate-50">
          {!user ? (
            <Button onClick={loginWithGoogle} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md">
              Masuk (Login)
            </Button>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3 overflow-hidden">
                <img src={user?.photoURL || ''} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white shadow-sm flex-shrink-0" />
                <div className="truncate hidden md:block lg:block">
                  <p className="text-sm font-bold truncate">{user?.displayName}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
                {/* Show on mobile */}
                <div className="truncate md:hidden">
                  <p className="text-sm font-bold truncate">{user?.displayName}</p>
                </div>
              </div>
              <button onClick={logout} className="text-slate-400 hover:text-red-500 focus:outline-none p-2" title="Keluar">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/lesson/:id" element={<PageWrapper><LessonView /></PageWrapper>} />
        <Route path="/vocab" element={<PageWrapper><VocabTrainer /></PageWrapper>} />
        <Route path="/verbs" element={<PageWrapper><VerbTrainer /></PageWrapper>} />
        <Route path="/koreksi" element={<PageWrapper><Koreksi /></PageWrapper>} />
        <Route path="/catatan" element={<PageWrapper><Catatan /></PageWrapper>} />
        <Route path="/simulasi" element={<PageWrapper><Simulasi /></PageWrapper>} />
        <Route path="/pricing" element={<PageWrapper><Pricing /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><Admin /></PageWrapper>} />
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

export default function App() {
  return (
    <BrowserRouter>
      <AuthWrapper>
        <Layout>
          <AnimatedRoutes />
          <ChatWidget />
          <QuickNoteWidget />
        </Layout>
      </AuthWrapper>
    </BrowserRouter>
  );
}
