import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router';
import { useEffect, Suspense, lazy, useState } from 'react';
import { useAuthStore } from './stores/authStore';
import { useProgressStore } from './stores/progressStore';
import { BookOpen, BrainCircuit, Search, LogOut, Loader2, Trophy, Flame, Sparkles, CreditCard, ShieldCheck } from 'lucide-react';
import { Button } from './components/ui/button';
import { AnimatePresence, motion } from 'motion/react';

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
  const { loading: authLoading } = useAuthStore();
  const [timeout, setTimeoutState] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTimeoutState(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (authLoading && !timeout) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }
  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, profileData } = useAuthStore();
  const { xp, streak } = useProgressStore();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      <nav className="w-full md:w-64 bg-white border-r border-slate-200 p-4">
         <span className="font-bold text-xl">DeutschUp</span>
         <ul className="mt-8 space-y-2">
          {(user?.email === import.meta.env.VITE_ADMIN_EMAIL || profileData?.role === 'admin') && (
            <li>
              <Link to="/admin" className="text-red-600 font-bold">Admin Panel</Link>
            </li>
          )}
         </ul>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthWrapper>
        <Layout>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
            </Routes>
        </Layout>
      </AuthWrapper>
    </BrowserRouter>
  );
}
