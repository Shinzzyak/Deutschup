import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuthStore } from '../../stores/authStore';
import { useProgressStore } from '../../stores/progressStore';
import {
  BookOpen,
  Trophy,
  BrainCircuit,
  Sparkles,
  CreditCard,
  ShieldCheck,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Flame,
  Zap,
  Target,
  TrendingUp,
  User,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: BookOpen },
  { name: 'Kurikulum', href: '/curriculum', icon: Trophy },
  { name: 'Vocab', href: '/vocab', icon: BrainCircuit },
  { name: 'Catatan', href: '/catatan', icon: BarChart3 },
  { name: 'Simulasi', href: '/simulasi', icon: Sparkles },
  { name: 'Goethe', href: '/goethe', icon: Trophy },
  { name: 'Langganan', href: '/pricing', icon: CreditCard },
];

export default function DesktopSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { profileData } = useAuthStore();
  const { streak, xp, completedLessons, currentLevel } = useProgressStore();

  function isActive(href: string) {
    if (href === '/') return location.pathname === '/';
    if (href === '/curriculum') {
      return ['/curriculum', '/level', '/lesson', '/checkpoint'].some((prefix) => location.pathname.startsWith(prefix));
    }
    return location.pathname.startsWith(href.split('?')[0]);
  }

  return (
    <aside
      className={`hidden lg:flex flex-col glass-nav transition-all duration-300 ease-in-out shrink-0 ${
        collapsed ? 'w-[68px]' : 'w-64'
      }`}

    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-20 -right-3 w-6 h-6 glass-subtle flex items-center justify-center text-[#0a0a0a]/50 hover:text-[#0a0a0a] z-10 transition-colors"
        aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* User profile card */}
      {!collapsed && (
        <div className="p-4 border-b-2 border-[#0a0a0a]/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0a0a0a]/10 flex items-center justify-center overflow-hidden border border-[#0a0a0a]/20">
              {profileData?.avatar_url ? (
                <img src={profileData.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-[#0a0a0a]/50" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#0a0a0a] truncate">
                {profileData?.full_name || 'Learner'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] font-bold text-[#0a0a0a] bg-[#0a0a0a]/5 border border-[#0a0a0a]/10 px-1.5 py-0.5">
                  {currentLevel}
                </span>
                <span className="text-[10px] text-[#0a0a0a]/40">
                  {completedLessons.length} selesai
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation links */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-[#0a0a0a]/5 text-[#0a0a0a]'
                  : 'text-[#0a0a0a]/50 hover:text-[#0a0a0a] hover:bg-[#0a0a0a]/5'
              } ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-[#8b2500]' : ''}`} />
              {!collapsed && <span>{item.name}</span>}
              {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 bg-[#8b2500]" />
              )}
            </Link>
          );
        })}
        {profileData?.role === 'admin' && (
          <Link
            to="/admin"
            className={`group flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
              location.pathname.startsWith('/admin')
                ? 'bg-[#8b2500]/10 text-[#8b2500]'
                : 'text-[#0a0a0a]/50 hover:text-[#8b2500] hover:bg-[#8b2500]/5'
            } ${collapsed ? 'justify-center px-0' : ''}`}
            title={collapsed ? 'Admin' : undefined}
          >
            <ShieldCheck className={`w-[18px] h-[18px] shrink-0 ${location.pathname.startsWith('/admin') ? 'text-[#8b2500]' : ''}`} />
            {!collapsed && <span>Admin</span>}
          </Link>
        )}
      </nav>

      {/* Progress summary at bottom */}
      {!collapsed && (
        <div className="p-3 border-t-2 border-[#0a0a0a]/10">
          <div className="glass-subtle p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#c8956c]" />
                <span className="text-xs font-bold text-[#0a0a0a]/70">{streak} hari</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#8b2500]" />
                <span className="text-xs font-bold text-[#0a0a0a]/70">{xp} XP</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-[#0a0a0a]/50">
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Target harian
                </span>
                <span className="font-medium">3/5 lesson</span>
              </div>
              <div className="h-1.5 bg-[#0a0a0a]/10">
                <div className="h-full bg-[#8b2500] transition-all duration-500" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
