import { ReactNode } from 'react';
import { Link } from 'react-router';
import { Lock, Sparkles } from 'lucide-react';
import { isUserPro, canAccessFeature, type SubscriptionData } from '../lib/subscription';

interface FeatureGateProps {
  children: ReactNode;
  feature?: string;
  sub: SubscriptionData | null | undefined;
  role?: string;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

/**
 * Wraps content that requires Pro subscription.
 * If user is Pro → render children.
 * If user is Free → render fallback or upgrade prompt.
 */
export default function FeatureGate({
  children,
  feature,
  sub,
  role,
  fallback,
  showUpgrade = true,
}: FeatureGateProps) {
  const hasAccess = feature
    ? canAccessFeature(sub, feature, role)
    : isUserPro(sub, role);

  if (hasAccess) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  if (!showUpgrade) return null;

  return (
    <div className="relative  border border-[#c8956c]/20  from-amber-50 to-orange-50 p-6 text-center">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -right-4 -top-4 w-24 h-24  bg-[#c8956c]/80 blur-2xl" />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="w-12 h-12  bg-amber-100 flex items-center justify-center">
          <Lock className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h3 className="font-bold text-amber-900 mb-1">Fitur Premium</h3>
          <p className="text-sm text-amber-700">Upgrade ke Pro untuk mengakses fitur ini</p>
        </div>
        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 px-5 py-2.5   from-amber-500 to-orange-500 bg-primary text-primary-foreground font-bold text-sm   hover: hover:scale-105 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Upgrade ke Pro
        </Link>
      </div>
    </div>
  );
}

/**
 * Inline badge for Pro-only features in navigation
 */
export function ProBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5   from-amber-400 to-orange-400 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider ${className}`}>
      <Sparkles className="w-3 h-3" />
      Pro
    </span>
  );
}
