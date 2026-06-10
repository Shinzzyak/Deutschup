import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router';
import { useEffect, Suspense, lazy, useState } from 'react';
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
  const { user, loading: authLoading, profileLoaded } = useAuthStore();
  const { loadProgress, initialized, loading: progressLoading } = useProgressStore();
  const [timeout, setTimeoutState] = useState(false);

  useEffect(() => {
    if (user && !initialized) {
      loadProgress(user.id);
    }
  }, [user, initialized, loadProgress]);

  useEffect(() => {
    const timer = setTimeout(() => setTimeoutState(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  // P1: Always render children — profile loads in background
  // Show subtle loading indicator only if no cached profile yet
  if (authLoading && !timeout && !profileLoaded) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <>
      {children}
      {/* P1: Background profile refresh indicator */}
      {authLoading && profileLoaded && (
        <div className="fixed top-2 right-2 z-50">
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        </div>
      )}
    </>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const { user, loginWithGoogle, logout, profileData } = useAuthStore();
  const { xp, streak } = useProgressStore();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      {/* Skip navigation link for keyboard users */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:rounded-xl focus:shadow-lg focus:text-slate-900 focus:font-bold">
        Lewati navigasi ke konten utama
      </a>
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 bg-white border-r border-slate-200 p-4 flex flex-col md:h-screen md:sticky top-0 z-50 shadow-sm md:shadow-none" aria-label="Navigasi sidebar">
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
            <Link to="/" className="flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none" aria-label="Kurikulum">
              <BookOpen className="w-5 h-5 flex-shrink-0" />
              <span className="hidden md:inline">Kurikulum</span>
            </Link>
          </li>
          <li>
            <Link to="/vocab" className="flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none" aria-label="Latihan Kosakata">
              <BrainCircuit className="w-5 h-5 flex-shrink-0" />
              <span className="hidden md:inline">Latihan Kosakata</span>
            </Link>
          </li>
          <li>
            <Link to="/verbs" className="flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none" aria-label="Kamus Mini">
              <Search className="w-5 h-5 flex-shrink-0" />
              <span className="hidden md:inline">Kamus Mini</span>
            </Link>
          </li>
          <li>
            <Link to="/koreksi" className="flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none" aria-label="Koreksi Pintar">
              <Sparkles className="w-5 h-5 flex-shrink-0 text-yellow-500" />
              <span className="hidden md:inline">Koreksi Pintar</span>
            </Link>
          </li>
          <li>
            <Link to="/catatan" className="flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none" aria-label="Catatan Belajar">
              <BookOpen className="w-5 h-5 flex-shrink-0 text-blue-500" />
              <span className="hidden md:inline">Catatan Belajar</span>
            </Link>
          </li>
          <li>
            <Link to="/simulasi" className="flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none" aria-label="Simulasi Ujian">
              <BookOpen className="w-5 h-5 flex-shrink-0 text-amber-500" />
              <span className="hidden md:inline">Simulasi Ujian</span>
            </Link>
          </li>
          <li>
            <Link to="/pricing" className="flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none" aria-label="Langganan">
              <CreditCard className="w-5 h-5 flex-shrink-0 text-indigo-500" />
              <span className="hidden md:inline">Langganan</span>
            </Link>
          </li>
          {(user) && (
            <li>
              <Link to="/admin" className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors font-medium focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none" aria-label="Admin Panel">
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
                <img src={profileData?.avatar_url || user?.user_metadata?.avatar_url || ''} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white shadow-sm flex-shrink-0" />
                <div className="truncate hidden md:block lg:block">
                  <p className="text-sm font-bold truncate">{profileData?.full_name || user?.user_metadata?.full_name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
                {/* Show on mobile */}
                <div className="truncate md:hidden">
                  <p className="text-sm font-bold truncate">{profileData?.full_name || user?.user_metadata?.full_name}</p>
                </div>
              </div>
              <button onClick={logout} className="text-slate-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 p-2" title="Keluar">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </nav>

      <main id="main-content" className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8">
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

  // P1: Show landing immediately for unauthenticated users
  // For authenticated users, render shell immediately with cached data
  return (
    <BrowserRouter>
      {user ? (
        <AuthWrapper>
          <Layout>
            <AnimatedRoutes />
            <ChatWidget />
            <QuickNoteWidget />
          </Layout>
        </AuthWrapper>
      ) : (
        <PublicRoutes />
      )}
    </BrowserRouter>
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
            <p className="text-slate-600">Latihan ujian seperti Goethe-Zertifikat dengan soal-soal realistis dan skor otomatis.</p>
          </div>
        </div>
      </section>

      {/* Levels */}
      <section className="max-w-6xl mx-auto px-4 py-20 bg-white rounded-3xl mx-4 mb-20 shadow-sm">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Kurikulum Terstruktur</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {['A1', 'A2', 'B1', 'B2'].map((level, i) => (
            <div key={level} className={`p-6 rounded-2xl text-center ${i === 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-slate-50 border border-slate-200'}`}>
              <div className={`text-4xl font-black mb-2 ${i === 0 ? 'text-green-600' : 'text-slate-400'}`}>{level}</div>
              <p className="text-sm font-medium text-slate-600">{['Pemula', 'Dasar', 'Menengah', 'Mahir'][i]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="flex space-x-0.5">
              <div className="w-2 h-4 bg-white rounded-sm"></div>
              <div className="w-2 h-4 bg-red-500 rounded-sm"></div>
              <div className="w-2 h-4 bg-yellow-400 rounded-sm"></div>
            </div>
            <span className="font-bold tracking-tight text-lg">DeutschUp</span>
          </div>
          <p className="text-slate-400 mb-6">Platform belajar bahasa Jerman untuk semua kalangan.</p>
          <div className="flex justify-center space-x-6 text-sm text-slate-400">
            <a href="/pricing" className="hover:text-white transition-colors" aria-label="Lihat harga dan paket">Harga</a>
            <a href="#fitur" className="hover:text-white transition-colors" aria-label="Lihat fitur DeutschUp">Fitur</a>
            <a href="mailto:abdullahalmughiroh@gmail.com" className="hover:text-white transition-colors" aria-label="Hubungi kami via email">Kontak</a>
          </div>
          <p className="text-slate-500 text-xs mt-8">© {new Date().getFullYear()} DeutschUp. Semua hak dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
