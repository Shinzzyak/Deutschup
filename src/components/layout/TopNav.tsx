import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuthStore } from '../../stores/authStore';
import { useProgressStore } from '../../stores/progressStore';
import { useTheme } from '../../lib/theme';
import SearchOverlay from '../search/SearchOverlay';
import {
  Search,
  LogOut,
  Flame,
  Zap,
  ShieldCheck,
  User,
  Settings,
  ChevronDown,
  X,
  BookOpen,
  Trophy,
  BrainCircuit,
  Sparkles,
  CreditCard,
  BarChart3,
  Moon,
  Sun,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: BookOpen },
  { name: 'Level', href: '/level/A1', icon: Trophy },
  { name: 'Vocab', href: '/vocab', icon: BrainCircuit },
  { name: 'Catatan', href: '/catatan', icon: BarChart3 },
  { name: 'Simulasi', href: '/simulasi', icon: Sparkles },
  { name: 'Langganan', href: '/pricing', icon: CreditCard },
];

export default function TopNav() {
  const { user, logout, profileData } = useAuthStore();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { isDark, toggle } = useTheme();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const streak = useProgressStore((s) => s.streak);
  const xp = useProgressStore((s) => s.xp);

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function isActive(href: string) {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href.split('?')[0]);
  }

  // Keyboard shortcut: Ctrl+K or / to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <nav
        className="sticky top-0 z-50 border-b border-slate-200/60 dark:border-slate-700/60"
        style={{
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        }}
        aria-label="Navigasi utama"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2.5 shrink-0 group">
              <div className="flex space-x-[3px] rounded-md overflow-hidden shadow-sm ring-1 ring-slate-200/50">
                <div className="w-2.5 h-4 bg-slate-800 dark:bg-slate-200" />
                <div className="w-2.5 h-4 bg-red-600" />
                <div className="w-2.5 h-4 bg-yellow-400" />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                DeutschUp
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-0.5">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      active
                        ? 'text-slate-900 dark:text-white bg-slate-100/80 dark:bg-slate-800/80'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                    {active && (
                      <span className="absolute -bottom-[13px] left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-gradient-to-r from-red-500 via-red-600 to-yellow-400" />
                    )}
                  </Link>
                );
              })}
              {profileData?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    location.pathname.startsWith('/admin')
                      ? 'text-red-600 dark:text-red-400 bg-red-50/80 dark:bg-red-950/40'
                      : 'text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/60 dark:hover:bg-red-950/30'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>

            {/* Right section */}
            <div className="flex items-center gap-1.5">
              {/* Dark mode toggle */}
              <button
                onClick={toggle}
                className="p-2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label={isDark ? 'Mode terang' : 'Mode gelap'}
              >
                {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
              </button>

              {/* Search toggle */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Cari materi"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              {/* Streak badge */}
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200/50 dark:border-orange-800/30">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs font-bold text-orange-700 dark:text-orange-300">{streak}</span>
              </div>

              {/* XP badge */}
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/30">
                <Zap className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{xp}</span>
              </div>

              {/* User menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Menu profil"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center overflow-hidden ring-2 ring-white/50 dark:ring-slate-900/50">
                    {profileData?.avatar_url ? (
                      <img
                        src={profileData.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    )}
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${
                      showUserMenu ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-slate-900/10 dark:shadow-black/20 overflow-hidden z-50">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {profileData?.full_name || 'Learner'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {user?.email}
                      </p>
                    </div>
                    <div className="p-1.5">
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        Profil
                      </Link>
                      <Link
                        to="/pricing"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        Langganan
                      </Link>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

    </>
  );
}
