# REG-003 — Stale Profile Cache After Payment

## Incident Details

**Incident ID:** REG-003
**Date:** 2026-06-10
**Severity:** High
**Business Impact:** User sees incorrect subscription status
**Classification:** Cache Invalidation Missing
**Status:** IDENTIFIED (Partial Fix Applied)

---

## Symptoms

- Payment succeeds but UI shows "Pilih Pro"
- Payment history empty
- Pro badge not visible

---

## Verified Evidence

### 1. Cache Structure
**File:** src/stores/authStore.ts

```typescript
const PROFILE_CACHE_PREFIX = 'deutschup_profile_';

function cacheProfile(userId: string, tierData: TierData, profileData: ProfileData) {
  localStorage.setItem(`${PROFILE_CACHE_PREFIX}${userId}`, JSON.stringify({
    tierData,
    profileData,
    cachedAt: Date.now(),
  }));
}
```

### 2. Cache Validity (24 Hours)
```typescript
function loadCachedProfile(userId: string): { tierData: TierData; profileData: ProfileData } | null {
  const raw = localStorage.getItem(`${PROFILE_CACHE_PREFIX}${userId}`);
  if (!raw) return null;
  const { tierData, profileData, cachedAt } = JSON.parse(raw);
  // Use cache if less than 24h old
  if (Date.now() - cachedAt > 24 * 60 * 60 * 1000) {
    localStorage.removeItem(`${PROFILE_CACHE_PREFIX}${userId}`);
    return null;
  }
  return { tierData, profileData };
}
```

### 3. Boot Sequence
```typescript
// BOOT: instant restore from cache
const cachedUser = loadCachedUser();
if (cachedUser) {
  const cached = loadCachedProfile(cachedUser.id);
  if (cached) {
    set({
      user: cachedUser,
      loading: false,
      profileLoaded: true,
      tierData: cached.tierData,      // ← OLD CACHED DATA
      profileData: cached.profileData, // ← OLD CACHED DATA
    });
  }
}
```

### 4. No Cache Invalidation After Payment
```typescript
// Pricing.tsx line 115
if (data.url) {
  window.location.href = data.url;  // ← Redirects to Bayar.gg
  // No cache invalidation
  // No explicit profile refresh
}
```

---

## Root Cause

localStorage profile cache not invalidated after payment completion.

### Cache Flow Without Invalidation
1. User logs in → Cache loaded (old `tier: 'free'`)
2. Payment created → Redirect to Bayar.gg
3. Payment completed → Webhook updates database
4. User returns → Cache loaded again (still `tier: 'free'`)
5. No auth event → Profile NOT re-fetched

---

## Resolution

### Partial Fix Applied
**File:** src/pages/DashboardWithPaymentRefresh.tsx

```typescript
useEffect(() => {
  if (paymentSuccess && user) {
    localStorage.removeItem(`deutschup_profile_${user.id}`);
    window.location.href = '/dashboard';
  }
}, [paymentSuccess, user]);
```

### Complete Fix Required
1. Invalidate cache on payment success
2. Force profile refetch
3. Update authStore with fresh data

---

## Prevention

1. **Cache Invalidation** — Clear relevant cache after mutations
2. **Payment Success Flow** — Add cache invalidation to payment success
3. **Cache Freshness** — Verify cache freshness at critical points
4. **Profile Refresh** — Force profile refresh after state changes

---

## Lessons Learned

### Invalidate cache after state-changing operations

❌ Cache persists after mutations
✅ Clear cache after payment completion
✅ Force profile refetch

---

## Timeline

| Time | Event |
|------|-------|
| 15:30 UTC | Stale cache identified |
| 15:35 UTC | Partial fix implemented |
| Pending | Complete fix required |

---

*Incident documented by Exilio 🧠*
