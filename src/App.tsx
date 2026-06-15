import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router';
import { useEffect, Suspense, lazy, useState } from 'react';
import { useAuthStore } from './stores/authStore';
import { useProgressStore } from './stores/progressStore';
import { BookOpen, BrainCircuit, Search, LogOut, Loader2, Trophy, Flame, Sparkles, CreditCard, ShieldCheck } from 'lucide-react';
import { Button } from './components/ui/button';
import { AnimatePresence, motion } from 'motion/react';
import { ClerkProvider } from './lib/clerk';

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
import ChatWidget from './components/ChatWidget';
import DebugAuthOverlay from "./components/DebugAuthOverlay";
import QuickNoteWidget from './components/QuickNoteWidget';

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading, profileData } = useAuthStore();
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
  const { user, logout } = useAuthStore();
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" id="main-content">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 z-50 safe-area-pb" aria-label="Navigasi mobile">
        <div className="flex justify-around py-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/' && location.pathname.startsWith(item.href.split('?')[0]));
            return (
              <Link key={item.name} to={item.href}
                className={`flex flex-col items-center px-3 py-1 ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                }`} aria-label={item.name}>
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] mt-0.5 font-medium">{item.name}</span>
              </Link>
            );
          })}
          {profileData?.role === 'admin' && (
            <Link to="/admin"
              className={`flex flex-col items-center px-3 py-1 ${
                location.pathname.startsWith('/admin') ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'
              }`} aria-label="Admin">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">Admin</span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
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
        <Route path="/clerk-test" element={<PageWrapper><ClerkTest /></PageWrapper>} />
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

  return (
    <ClerkProvider>
      <BrowserRouter>
        {user ? (
          <AuthWrapper>
            <Layout>
              <AnimatedRoutes />
              <ChatWidget />
              <DebugAuthOverlay />
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

// Landing page for unauthenticated users
function LandingPage() {
  const { loginWithGoogle } = useAuthStore();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between" aria-label="Navigasi utama">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-0.5">
              <div className="w-3 h-5 bg-black rounded-sm"></div>
              <div className="w-3 h-5 bg-red-600 rounded-sm"></div>
              <div className="w-3 h-5 bg-yellow-400 rounded-sm"></div>
            </div>
            <span className="font-bold tracking-tight text-xl text-slate-900">DeutschUp</span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="/login" className="text-slate-600 hover:text-slate-900 font-medium transition-colors" aria-label="Masuk ke akun Anda">Masuk</a>
            <Button onClick={loginWithGoogle} className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl">
              Daftar Gratis
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
          Belajar Bahasa Jerman<br />
          <span className="text-red-600">Lebih Cepat</span> dengan AI
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          DeutschUp membantu kamu menguasai bahasa Jerman dari nol hingga mahir dengan tutor AI, latihan interaktif, dan simulasi ujian realistis.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={loginWithGoogle} className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-6 rounded-2xl font-bold shadow-lg">
            Mulai Belajar
          </Button>
          <a href="#fitur" className="text-slate-600 hover:text-slate-900 font-medium text-lg underline underline-offset-4" aria-label="Lihat materi pembelajaran">
            Lihat Materi
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Kenapa DeutschUp?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl" role="img" aria-label="Robot AI">🤖</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Tutor AI</h3>
            <p className="text-slate-600">Bertanya apa saja tentang bahasa Jerman, dapatkan penjelasan instan dari AI tutor kami.</p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl" role="img" aria-label="Koreksi">📝</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Koreksi Pintar</h3>
            <p className="text-slate-600">Kirim kalimat dalam bahasa Jerman, dapatkan koreksi instan dengan penjelasan grammar.</p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl" role="img" aria-label="Ujian">🎓</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Simulasi Ujian</h3>
            <p className="text-slate-600">Latihan ujian seperti TestDaF, DSH, atau Goethe dengan feedback detail.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="bg-slate-900 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Siap Mulai?</h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">Bergabung dengan ribuan pelajar yang sudah meningkatkan kemampuan bahasa Jerman mereka.</p>
          <Button onClick={loginWithGoogle} className="bg-white text-slate-900 hover:bg-slate-100 text-lg px-8 py-6 rounded-2xl font-bold">
            Daftar Sekarang
          </Button>
        </div>
      </section>
    </div>
  );
}
