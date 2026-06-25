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
  { name: 'Level', href: '/level/A1', icon: Trophy },
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
    return location.pathname.startsWith(href.split('?')[0]);
  }

  return (
    <aside
      className={`hidden lg:flex flex-col border-r border-slate-200/60 dark:border-slate-700/60 transition-all duration-300 ease-in-out shrink-0 ${
        collapsed ? 'w-[68px]' : 'w-64'
      }`}
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(16px) saturate(150%)',
      }}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-20 -right-3 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 z-10 transition-colors"
        aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* User profile card */}
      {!collapsed && (
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center shrink-0 ring-2 ring-white/60 dark:ring-slate-900/60 overflow-hidden">
              {profileData?.avatar_url ? (
                <img src={profileData.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-slate-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {profileData?.full_name || 'Learner'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-full">
                  {currentLevel}
                </span>
                <span className="text-[10px] text-slate-400">
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
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
              } ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : ''}`} />
              {!collapsed && <span>{item.name}</span>}
              {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </Link>
          );
        })}
        {profileData?.role === 'admin' && (
          <Link
            to="/admin"
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              location.pathname.startsWith('/admin')
                ? 'bg-red-50/80 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/60 dark:hover:bg-red-950/20'
            } ${collapsed ? 'justify-center px-0' : ''}`}
            title={collapsed ? 'Admin' : undefined}
          >
            <ShieldCheck className={`w-[18px] h-[18px] shrink-0 ${location.pathname.startsWith('/admin') ? 'text-red-500' : ''}`} />
            {!collapsed && <span>Admin</span>}
          </Link>
        )}
      </nav>

      {/* Progress summary at bottom */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100/80 dark:from-slate-800/60 dark:to-slate-800/30 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs font-bold text-orange-700 dark:text-orange-300">{streak} hari</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{xp} XP</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Target harian
                </span>
                <span className="font-medium">3/5 lesson</span>
              </div>
              <div className="h-1.5 bg-slate-200/80 dark:bg-slate-700/60 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
