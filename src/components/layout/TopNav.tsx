import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuthStore } from '../../stores/authStore';
import { useProgressStore } from '../../stores/progressStore';
import SearchOverlay from '../search/SearchOverlay';
import {
  Search, LogOut, Flame, Zap, ShieldCheck, User, ChevronDown,
  BookOpen, Trophy, BrainCircuit, Sparkles, CreditCard, BarChart3,
} from 'lucide-react';

const navigation = [
  { name: 'Beranda', href: '/', icon: BookOpen },
  { name: 'Kurikulum', href: '/curriculum', icon: Trophy },
  { name: 'Kosakata', href: '/vocab', icon: BrainCircuit },
  { name: 'Catatan', href: '/catatan', icon: BarChart3 },
  { name: 'Simulasi', href: '/simulasi', icon: Sparkles },
  { name: 'Langganan', href: '/pricing', icon: CreditCard },
];

export default function TopNav() {
  const { user, logout, profileData } = useAuthStore();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const streak = useProgressStore((s) => s.streak);
  const xp = useProgressStore((s) => s.xp);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    // Escape closes the menu — it was only dismissible with the mouse before.
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowUserMenu(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  function isActive(href: string) {
    if (href === '/') return location.pathname === '/';
    if (href === '/curriculum') {
      return ['/curriculum', '/level', '/lesson', '/checkpoint'].some((prefix) => location.pathname.startsWith(prefix));
    }
    return location.pathname.startsWith(href.split('?')[0]);
  }

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
      <nav className="glass-nav sticky top-0 z-50" aria-label="Navigasi utama">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="group flex shrink-0 items-center space-x-2.5">
              <div className="flex h-4 w-2 flex-col" aria-hidden="true">
                <div className="flex-1 bg-brand-ink" />
                <div className="flex-1 bg-brand-rust" />
                <div className="flex-1 bg-brand-tan" />
              </div>
              <span className="font-serif text-lg font-bold tracking-tight text-brand-ink">DeutschUp</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-0">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary/5 text-brand-ink'
                        : 'text-ink-muted hover:bg-primary/5 hover:text-brand-ink'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                    {active && <span className="absolute -bottom-[13px] left-1/2 h-0.5 w-5 -translate-x-1/2 bg-brand-rust" />}
                  </Link>
                );
              })}
              {profileData?.role === 'admin' && (
                <Link
                  to="/admin"
                  aria-current={location.pathname.startsWith('/admin') ? 'page' : undefined}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-brand-rust/5 text-brand-rust'
                      : 'text-ink-muted hover:bg-brand-rust/5 hover:text-brand-rust'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </Link>
              )}
            </div>

            {/* Right section */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex h-10 w-10 items-center justify-center text-ink-muted transition-colors hover:bg-primary/5 hover:text-brand-ink"
                aria-label="Cari materi"
              >
                <Search className="h-4 w-4" />
              </button>

              <div className="hidden items-center gap-1.5 border border-brand-ink/15 px-2.5 py-1 sm:flex" title="Streak harian">
                <Flame className="h-3.5 w-3.5 text-brand-tan" aria-hidden="true" />
                <span className="text-xs font-bold text-ink-muted">
                  <span className="sr-only">Streak: </span>{streak}
                </span>
              </div>

              <div className="hidden items-center gap-1.5 border border-brand-ink/15 px-2.5 py-1 sm:flex" title="Total XP">
                <Zap className="h-3.5 w-3.5 text-brand-rust" aria-hidden="true" />
                <span className="text-xs font-bold text-ink-muted">
                  <span className="sr-only">XP: </span>{xp}
                </span>
              </div>

              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex min-h-10 items-center gap-2 p-1 transition-colors hover:bg-primary/5" aria-label="Menu profil" aria-expanded={showUserMenu} aria-controls="user-menu" aria-haspopup="true">
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden bg-primary/10">
                    {profileData?.avatar_url ? (
                      <img src={profileData.avatar_url} alt="" width="32" height="32" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-ink-muted" />
                    )}
                  </div>
                  <ChevronDown className={`hidden h-3.5 w-3.5 text-ink-muted transition-transform duration-200 sm:block ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {showUserMenu && (
                  <div id="user-menu" className="glass absolute right-0 z-50 mt-2 w-56">
                    <div className="border-b border-brand-ink/10 px-4 py-3">
                      <p className="truncate text-sm font-bold text-brand-ink">{profileData?.full_name || 'Pelajar'}</p>
                      <p className="mt-0.5 truncate text-xs text-ink-muted">{user?.email}</p>
                    </div>
                    <div className="p-1.5">
                      <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-ink-muted transition-colors hover:bg-primary/5 hover:text-brand-ink">
                        <User className="h-4 w-4 text-ink-subtle" /> Profil
                      </Link>
                      <Link to="/pricing" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-ink-muted transition-colors hover:bg-primary/5 hover:text-brand-ink">
                        <CreditCard className="h-4 w-4 text-ink-subtle" /> Langganan
                      </Link>
                      <button onClick={() => { setShowUserMenu(false); logout(); }} className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-brand-rust transition-colors hover:bg-brand-rust/5">
                        <LogOut className="h-4 w-4" /> Keluar
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
