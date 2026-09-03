import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuthStore } from '../../stores/authStore';
import SearchOverlay from '../search/SearchOverlay';
import {
  Home,
  Trophy,
  BrainCircuit,
  Sparkles,
  User,
  ShieldCheck,
  Search,
} from 'lucide-react';

const navigation = [
  { name: 'Beranda', href: '/', icon: Home },
  { name: 'Kurikulum', href: '/curriculum', icon: Trophy },
  { name: 'Vocab', href: '/vocab', icon: BrainCircuit },
  { name: 'Cari', href: '#search', icon: Search, action: 'search' },
  { name: 'Simulasi', href: '/simulasi', icon: Sparkles },
  { name: 'Profil', href: '/profile', icon: User },
] as const;

// flex-1 + min-w-0 keeps 7 items (6 + Admin) inside a 320px viewport instead of
// pushing the row wider than the screen; the label truncates rather than wraps.
const itemClass =
  'relative flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 transition-colors duration-200';

export default function MobileBottomNav() {
  const location = useLocation();
  const { profileData } = useAuthStore();
  const [searchOpen, setSearchOpen] = useState(false);

  function isActive(href: string) {
    if (href === '/') return location.pathname === '/';
    if (href === '/curriculum') {
      return ['/curriculum', '/level', '/lesson', '/checkpoint'].some((prefix) => location.pathname.startsWith(prefix));
    }
    return location.pathname.startsWith(href.split('?')[0]);
  }

  const adminActive = location.pathname.startsWith('/admin');

  return (
    <>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <nav
        className="glass-nav fixed right-0 bottom-0 left-0 z-50 lg:hidden"
        aria-label="Navigasi mobile"
      >
        <div className="flex items-stretch justify-around px-1 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
          {navigation.map((item) => {
            if ('action' in item && item.action === 'search') {
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Cari materi"
                  className={`${itemClass} text-ink-muted active:text-brand-ink`}
                >
                  <div className="relative">
                    <item.icon className="h-5 w-5 stroke-[1.8]" />
                  </div>
                  <span className="w-full truncate text-center text-[10px] leading-none font-medium">
                    {item.name}
                  </span>
                </button>
              );
            }
            const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              aria-current={active ? 'page' : undefined}
              className={`${itemClass} ${active ? 'text-brand-rust' : 'text-ink-muted active:text-brand-ink'}`}
            >
              <div className="relative">
                <item.icon
                  className={`h-5 w-5 transition-all duration-200 ${
                    active ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />
                {active && (
                  <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 bg-brand-rust" />
                )}
              </div>
              <span
                className={`w-full truncate text-center text-[10px] leading-none ${
                  active ? 'font-bold' : 'font-medium'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
        {profileData?.role === 'admin' && (
          <Link
            to="/admin"
            aria-current={adminActive ? 'page' : undefined}
            className={`${itemClass} ${adminActive ? 'text-brand-rust' : 'text-ink-muted active:text-brand-ink'}`}
          >
            <div className="relative">
              <ShieldCheck
                className={`h-5 w-5 transition-all duration-200 ${
                  adminActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'
                }`}
              />
              {adminActive && (
                <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 bg-brand-rust" />
              )}
            </div>
            <span className={`w-full truncate text-center text-[10px] leading-none ${adminActive ? 'font-bold' : 'font-medium'}`}>
              Admin
            </span>
          </Link>
        )}
          </div>
        </nav>
    </>
  );
}
