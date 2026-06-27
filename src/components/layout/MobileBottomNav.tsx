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
  { name: 'Level', href: '/level/A1', icon: Trophy },
  { name: 'Vocab', href: '/vocab', icon: BrainCircuit },
  { name: 'Simulasi', href: '/simulasi', icon: Sparkles },
  { name: 'Goethe', href: '/goethe', icon: Trophy },
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
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t-2 border-[#0a0a0a]/10 bg-[#f5f0eb]"

      aria-label="Navigasi mobile"
    >
      <div className="flex justify-around items-end py-1.5 px-1">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`relative flex flex-col items-center gap-0.5 px-2 py-1.5 transition-all duration-200 min-w-[48px] ${
                active
                  ? 'text-[#8b2500]'
                  : 'text-[#0a0a0a]/40 active:text-[#0a0a0a]/60'
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
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#8b2500]" />
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
            className={`relative flex flex-col items-center gap-0.5 px-2 py-1.5  transition-all duration-200 min-w-[48px] ${
              location.pathname.startsWith('/admin')
                ? 'text-[#8b2500]'
                : 'text-[#0a0a0a]/40 active:text-[#0a0a0a]/60'
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
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#8b2500]" />
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
