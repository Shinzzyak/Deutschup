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
  { name: 'Dashboard', href: '/', icon: BookOpen },
  { name: 'Kurikulum', href: '/curriculum', icon: Trophy },
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
  const userMenuRef = useRef<HTMLDivElement>(null);

  const streak = useProgressStore((s) => s.streak);
  const xp = useProgressStore((s) => s.xp);

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
            <Link to="/" className="flex items-center space-x-2.5 shrink-0 group">
              <div className="flex flex-col w-2 h-4">
                <div className="flex-1 bg-primary" />
                <div className="flex-1 bg-[#8b2500]" />
                <div className="flex-1 bg-[#c8956c]" />
              </div>
              <span className="font-serif text-lg font-bold text-[#0a0a0a] tracking-tight">DeutschUp</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-0">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? 'text-[#0a0a0a] bg-primary/5'
                        : 'text-[#0a0a0a]/50 hover:text-[#0a0a0a] hover:bg-primary/5'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                    {active && <span className="absolute -bottom-[13px] left-1/2 -translate-x-1/2 w-5 h-0.5 bg-[#8b2500]" />}
                  </Link>
                );
              })}
              {profileData?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/admin')
                      ? 'text-[#8b2500] bg-[#8b2500]/5'
                      : 'text-[#0a0a0a]/50 hover:text-[#8b2500] hover:bg-[#8b2500]/5'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>

            {/* Right section */}
            <div className="flex items-center gap-1.5">
              <button onClick={() => setSearchOpen(true)} className="p-2 text-[#0a0a0a]/40 hover:text-[#0a0a0a] hover:bg-primary/5 transition-colors" aria-label="Cari materi">
                <Search className="w-4 h-4" />
              </button>

              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 border border-[#0a0a0a]/10">
                <Flame className="w-3.5 h-3.5 text-[#c8956c]" />
                <span className="text-xs font-bold text-[#0a0a0a]/70">{streak}</span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 border border-[#0a0a0a]/10">
                <Zap className="w-3.5 h-3.5 text-[#8b2500]" />
                <span className="text-xs font-bold text-[#0a0a0a]/70">{xp}</span>
              </div>

              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-1 hover:bg-primary/5 transition-colors" aria-label="Menu profil" aria-expanded={showUserMenu} aria-controls="user-menu">
                  <div className="w-8 h-8 bg-primary/10 flex items-center justify-center overflow-hidden">
                    {profileData?.avatar_url ? (
                      <img src={profileData.avatar_url} alt="" width="32" height="32" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-[#0a0a0a]/40" />
                    )}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#0a0a0a]/40 transition-transform duration-200 hidden sm:block ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {showUserMenu && (
                  <div id="user-menu" className="glass absolute right-0 mt-2 w-56 z-50">
                    <div className="px-4 py-3 border-b border-[#0a0a0a]/10">
                      <p className="text-sm font-bold text-[#0a0a0a] truncate">{profileData?.full_name || 'Learner'}</p>
                      <p className="text-xs text-[#0a0a0a]/40 truncate mt-0.5">{user?.email}</p>
                    </div>
                    <div className="p-1.5">
                      <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#0a0a0a]/70 hover:text-[#0a0a0a] hover:bg-primary/5 transition-colors">
                        <User className="w-4 h-4 text-[#0a0a0a]/30" /> Profil
                      </Link>
                      <Link to="/pricing" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#0a0a0a]/70 hover:text-[#0a0a0a] hover:bg-primary/5 transition-colors">
                        <CreditCard className="w-4 h-4 text-[#0a0a0a]/30" /> Langganan
                      </Link>
                      <button onClick={() => { setShowUserMenu(false); logout(); }} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-[#8b2500] hover:bg-[#8b2500]/5 transition-colors">
                        <LogOut className="w-4 h-4" /> Keluar
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
