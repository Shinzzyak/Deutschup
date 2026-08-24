import { useEffect, useMemo, useState } from 'react';
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
  User,
} from 'lucide-react';

const navigation = [
  { name: 'Beranda', href: '/', icon: BookOpen },
  { name: 'Kurikulum', href: '/curriculum', icon: Trophy },
  { name: 'Kosakata', href: '/vocab', icon: BrainCircuit },
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

  // Lesson ids of the current level, loaded lazily: the sidebar is in the eager
  // bundle and lessonIndex is ~29KB of course data we do not want there.
  const [levelLessonIds, setLevelLessonIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    import('../../data/lessonIndex')
      .then(({ courseIndex }) => {
        if (cancelled) return;
        setLevelLessonIds(courseIndex.filter((l) => l.level === currentLevel).map((l) => l.id));
      })
      .catch(() => {
        if (!cancelled) setLevelLessonIds([]);
      });
    return () => {
      cancelled = true;
    };
  }, [currentLevel]);

  const levelProgress = useMemo(() => {
    const total = levelLessonIds.length;
    if (total === 0) return null;
    const done = levelLessonIds.filter((id) => completedLessons.includes(id)).length;
    return { done, total, percent: Math.round((done / total) * 100) };
  }, [levelLessonIds, completedLessons]);

  function isActive(href: string) {
    if (href === '/') return location.pathname === '/';
    if (href === '/curriculum') {
      return ['/curriculum', '/level', '/lesson', '/checkpoint'].some((prefix) => location.pathname.startsWith(prefix));
    }
    return location.pathname.startsWith(href.split('?')[0]);
  }

  const adminActive = location.pathname.startsWith('/admin');

  return (
    <aside
      className={`glass-nav relative hidden shrink-0 flex-col transition-all duration-300 ease-in-out lg:flex ${
        collapsed ? 'w-[68px]' : 'w-64'
      }`}
    >
      {/* Collapse toggle — kept in flow: the sidebar's parent is overflow-hidden,
          so the old `absolute -right-3` variant was clipped (and, without a
          positioned ancestor here, it anchored to the page instead). */}
      <div className={`flex p-2 ${collapsed ? 'justify-center' : 'justify-end'}`}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="glass-subtle flex h-7 w-7 items-center justify-center text-ink-muted transition-colors hover:text-brand-ink"
          aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* User profile card */}
      {!collapsed && (
        <div className="border-b-2 border-brand-ink/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden border border-brand-ink/20 bg-primary/10">
              {profileData?.avatar_url ? (
                <img src={profileData.avatar_url} alt="" width="40" height="40" className="h-full w-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-ink-muted" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-brand-ink">
                {profileData?.full_name || 'Pelajar'}
              </p>
              <div className="mt-0.5 flex items-center gap-1">
                <span className="border border-brand-ink/10 bg-primary/5 px-1.5 py-0.5 text-[10px] font-bold text-brand-ink">
                  {currentLevel}
                </span>
                <span className="text-[10px] text-ink-muted">
                  {completedLessons.length} selesai
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation links */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2" aria-label="Navigasi samping">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              aria-current={active ? 'page' : undefined}
              className={`group flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-primary/5 text-brand-ink'
                  : 'text-ink-muted hover:bg-primary/5 hover:text-brand-ink'
              } ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-brand-rust' : ''}`} />
              {!collapsed && <span>{item.name}</span>}
              {active && !collapsed && (
                <div className="ml-auto h-1.5 w-1.5 bg-brand-rust" />
              )}
            </Link>
          );
        })}
        {profileData?.role === 'admin' && (
          <Link
            to="/admin"
            aria-current={adminActive ? 'page' : undefined}
            className={`group flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
              adminActive
                ? 'bg-brand-rust/10 text-brand-rust'
                : 'text-ink-muted hover:bg-brand-rust/5 hover:text-brand-rust'
            } ${collapsed ? 'justify-center px-0' : ''}`}
            title={collapsed ? 'Admin' : undefined}
          >
            <ShieldCheck className={`h-[18px] w-[18px] shrink-0 ${adminActive ? 'text-brand-rust' : ''}`} />
            {!collapsed && <span>Admin</span>}
          </Link>
        )}
      </nav>

      {/* Progress summary at bottom — all values come from the progress store */}
      {!collapsed && (
        <div className="border-t-2 border-brand-ink/10 p-3">
          <div className="glass-subtle space-y-2.5 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {/* brand-tan reads 2.49:1 on .glass-subtle over .glass-nav
                    (#faf8f6). brand-rust is 8.41:1 on the same surface. */}
                <Flame className="h-3.5 w-3.5 text-brand-rust" aria-hidden="true" />
                <span className="text-xs font-bold text-ink-muted">{streak} hari</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-brand-rust" />
                <span className="text-xs font-bold text-ink-muted">{xp} XP</span>
              </div>
            </div>
            {levelProgress && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-ink-muted">
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    Progres {currentLevel}
                  </span>
                  <span className="font-medium">
                    {levelProgress.done}/{levelProgress.total} lesson
                  </span>
                </div>
                <div
                  className="h-1.5 bg-primary/10"
                  role="progressbar"
                  aria-valuenow={levelProgress.percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progres level ${currentLevel}`}
                >
                  <div
                    className="h-full bg-brand-rust transition-all duration-500"
                    style={{ width: `${levelProgress.percent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
