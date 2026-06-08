/**
 * Subscription utilities for DeutschUp
 * Handles Free vs Pro tier logic with expiration checking
 */

export interface SubscriptionData {
  subscription: 'free' | 'pro';
  pro_expires_at: string | null;
}

/**
 * Check if a user is currently Pro.
 * Returns true ONLY if subscription is 'pro' AND pro_expires_at is in the future.
 */
export function isUserPro(sub: SubscriptionData | null | undefined): boolean {
  if (!sub) return false;
  if (sub.subscription !== 'pro') return false;
  if (!sub.pro_expires_at) return false;
  return new Date(sub.pro_expires_at).getTime() > Date.now();
}

/**
 * Get effective subscription status (handles expired Pro → Free).
 */
export function getEffectiveSubscription(sub: SubscriptionData | null | undefined): 'free' | 'pro' {
  return isUserPro(sub) ? 'pro' : 'free';
}

/**
 * Get days remaining for Pro subscription.
 * Returns 0 if not Pro or expired.
 */
export function getProDaysRemaining(sub: SubscriptionData | null | undefined): number {
  if (!isUserPro(sub)) return 0;
  const expiresAt = new Date(sub!.pro_expires_at!).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)));
}

/**
 * Feature gate: check if user can access a Pro feature.
 */
export function canAccessFeature(sub: SubscriptionData | null | undefined, feature: string): boolean {
  const proFeatures = ['b2_material', 'unlimited_herr_deutsch', 'unlimited_simulations', 'pdf_reports'];
  if (proFeatures.includes(feature)) {
    return isUserPro(sub);
  }
  return true; // Free features accessible to all
}
