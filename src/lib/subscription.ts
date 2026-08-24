/**
 * Subscription utilities for DeutschUp
 * Handles Free vs Pro tier logic with expiration checking
 */

export interface SubscriptionData {
  subscription?: 'free' | 'pro';
  pro_expires_at?: string | null;
}

/**
 * Check if a user is currently Pro.
 * Admin users are always Pro.
 * Regular users need subscription='pro' AND pro_expires_at in the future.
 */
export function isUserPro(sub: SubscriptionData | null | undefined, role?: string): boolean {
  // Admins are always Pro
  if (role === 'admin') return true;
  if (!sub) return false;
  if (sub.subscription !== 'pro') return false;
  if (!sub.pro_expires_at) return false;
  return new Date(sub.pro_expires_at).getTime() > Date.now();
}

/**
 * Get effective subscription status (handles expired Pro → Free).
 */
export function getEffectiveSubscription(sub: SubscriptionData | null | undefined, role?: string): 'free' | 'pro' {
  return isUserPro(sub, role) ? 'pro' : 'free';
}

/**
 * Get days remaining for Pro subscription.
 * Returns 0 if not Pro or expired.
 */
export function getProDaysRemaining(sub: SubscriptionData | null | undefined, role?: string): number {
  if (!isUserPro(sub, role)) return 0;
  const expiresAt = new Date(sub!.pro_expires_at!).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)));
}

/**
 * Feature gate: check if user can access a Pro feature.
 */
export function canAccessFeature(sub: SubscriptionData | null | undefined, feature: string, role?: string): boolean {
  const proFeatures = ['b2_material', 'unlimited_herr_deutsch', 'unlimited_simulations', 'pdf_reports'];
  if (proFeatures.includes(feature)) {
    return isUserPro(sub, role);
  }
  return true; // Free features accessible to all
}
