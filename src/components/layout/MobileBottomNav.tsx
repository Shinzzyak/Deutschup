import { Link, useLocation } from 'react-router';
import { useAuthStore } from '../../stores/authStore';
import {
  Home,
  Trophy,
  BrainCircuit,
  Sparkles,
  User,
  ShieldCheck,
} from 'lucide-react';

const navigation = [
  { name: 'Beranda', href: '/', icon: Home },
  { name: 'Level', href: '/level/1', icon: Trophy },
  { name: 'Vocab', href: '/vocab', icon: BrainCircuit },
  { name: 'Simulasi', href: '/simulasi', icon: Sparkles },
  { name: 'Profil', href: '/profile', icon: User },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const { profileData } = useAuthStore();

  function isActive(href: string) {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href.split('?')[0]);
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/60 dark:border-slate-700/60"
      style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label="Navigasi mobile"
    >
      <div className="flex justify-around items-end py-1.5 px-1">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[48px] ${
                active
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-400 dark:text-slate-500 active:text-slate-600'
              }`}
              aria-label={item.name}
            >
              <div className="relative">
                <item.icon
                  className={`w-5 h-5 transition-all duration-200 ${
                    active ? 'stroke-[2.5] scale-110' : 'stroke-[1.8]'
                  }`}
                />
                {active && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />
                )}
              </div>
              <span
                className={`text-[10px] leading-none transition-all duration-200 ${
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
            className={`relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[48px] ${
              location.pathname.startsWith('/admin')
                ? 'text-red-500 dark:text-red-400'
                : 'text-slate-400 dark:text-slate-500 active:text-slate-600'
            }`}
            aria-label="Admin"
          >
            <div className="relative">
              <ShieldCheck
                className={`w-5 h-5 transition-all duration-200 ${
                  location.pathname.startsWith('/admin') ? 'stroke-[2.5] scale-110' : 'stroke-[1.8]'
                }`}
              />
              {location.pathname.startsWith('/admin') && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-500" />
              )}
            </div>
            <span
              className={`text-[10px] leading-none transition-all duration-200 ${
                location.pathname.startsWith('/admin') ? 'font-bold' : 'font-medium'
              }`}
            >
              Admin
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
