# Mobile-First Evidence Collection System — Design Report

**Agent:** Agent D (UX Agent)
**Date:** 2026-06-10
**Status:** Design Only — No Code Changes

---

## 1. Current UX Friction Points

### 1.1 Debug Auth Overlay — Desktop-Only Gate

**Current State:**
- `DebugAuthOverlay.tsx` renders a fixed-position debug panel showing auth state (user.id, email, tierData, profileData)
- Requires `VITE_DEBUG_AUTH=true` environment variable at build time
- Only accessible in development builds or when explicitly enabled in production

**Friction:**
- ❌ Requires rebuild with env var to enable
- ❌ Not available in production builds (default: `DEBUG_MODE = false` in `main.tsx`)
- ❌ No mobile-accessible toggle — must rebuild and redeploy
- ❌ User cannot self-serve evidence collection

---

### 1.2 Debug User Endpoint — Auth Header Required

**Current State:**
- `api/debug-user.ts` requires `Authorization` header via `authMiddleware`
- Returns user profile, orders, and `isPro` evaluation
- Requires manual curl/fetch with valid Supabase session token

**Friction:**
- ❌ Cannot open in browser directly (returns 401 without auth header)
- ❌ Requires DevTools or terminal to make authenticated request
- ❌ User on mobile cannot access without technical knowledge
- ❌ No in-app UI to view this diagnostic data

---

### 1.3 Payment History Console Logs

**Current State:**
- `Pricing.tsx` logs `[PAYMENT-HISTORY]` to console on fetch
- Errors logged via `console.error('Failed to fetch orders:', e)`
- Payment creation logs `[payment]` and `[BAYARGG]` prefixed messages

**Friction:**
- ❌ Requires browser DevTools (Console tab) — not available on mobile Safari/Chrome
- ❌ Logs are ephemeral — cleared on page refresh
- ❌ No structured error display in UI
- ❌ User cannot copy/share diagnostic info

---

### 1.4 Dashboard PDF Export Errors

**Current State:**
- `Dashboard.tsx` shows `errorMsg` state inline when PDF export fails
- Console logs error details
- No structured error reporting

**Friction:**
- ⚠️ Error message is user-friendly but lacks diagnostic detail
- ❌ No "copy error details" button
- ❌ No structured data for support team
- ❌ User must manually describe error in chat

---

### 1.5 Global Debug Mode (main.tsx)

**Current State:**
- `DEBUG_MODE = false` hardcoded in `main.tsx`
- When enabled: fetch interceptor, global error handler, promise rejection handler
- Shows green debug overlay at top of screen

**Friction:**
- ❌ Requires rebuild to enable (const is compile-time constant)
- ❌ Not accessible in production
- ❌ No user-facing toggle
- ❌ Overlay covers UI — not mobile-friendly

---

## 2. Proposed Mobile-First Evidence Collection Architecture

### 2.1 Core Principle: "Debug Panel in Pocket"

**Design Philosophy:**
- Every diagnostic tool must be accessible within the authenticated UI
- No external tools required (no DevTools, no curl, no rebuilds)
- One-tap evidence collection and sharing
- Secure: never expose secrets, only user's own data

---

### 2.2 Architecture Components

#### Component A: In-App Debug Panel (React Component)

**Location:** Accessible via Settings menu or long-press on profile avatar

**Features:**
- Toggle-able panel (bottom sheet on mobile, sidebar on desktop)
- Shows real-time auth state (user ID, email, tier, subscription status)
- Shows localStorage cache state
- Shows recent API call history (last 10 requests)
- "Copy All Debug Info" button → copies JSON to clipboard
- "Share Debug Info" button → uses Web Share API (native share sheet)

**Data Sources:**
- `useAuthStore()` — user, tierData, profileData
- `useProgressStore()` — current level, completed lessons
- Custom `useDebugStore()` — intercepted API calls, errors

**Mobile UX:**
- Bottom sheet with drag handle
- Large touch targets (min 44px)
- Scrollable content
- Color-coded status indicators (green = OK, red = error, yellow = warning)

---

#### Component B: API Call Interceptor (Client-Side)

**Location:** `src/lib/api-interceptor.ts`

**Features:**
- Wraps `fetch` and Supabase client methods
- Logs request/response metadata (no body content for security)
- Stores last N requests in memory (not localStorage)
- Captures: URL, status, duration, error message
- Exposes via `useDebugStore()` hook

**What to Log:**
- ✅ URL path (not query params with tokens)
- ✅ HTTP status code
- ✅ Request duration
- ✅ Error message (if any)
- ❌ Request/response bodies (security risk)
- ❌ Authorization headers
- ❌ API keys or tokens

---

#### Component C: Error Context Capture

**Location:** `src/lib/error-capture.ts`

**Features:**
- Wraps `console.error` calls
- Captures error with context (page, action, timestamp)
- Stores in `useDebugStore()` — last 20 errors
- Provides "Copy Error Report" functionality

**Error Report Format:**
```json
{
  "timestamp": "2026-06-10T16:00:00Z",
  "page": "/pricing",
  "action": "fetchOrders",
  "error": "Failed to fetch orders",
  "userId": "uuid-here",
  "tierData": { "subscription": "free" },
  "userAgent": "Mozilla/5.0...",
  "url": "https://deutschup.sintec.my.id/pricing"
}
```

---

#### Component D: Structured Error Display

**Location:** Replace `alert()` calls with `Toast` or `ErrorDialog` components

**Features:**
- User-friendly message (Indonesian)
- "Show Details" expander (diagnostic info)
- "Copy Error Report" button
- "Contact Support" button (pre-fills error report)

**Example:**
```
┌─────────────────────────────────┐
│ ❌ Gagal membuat pembayaran      │
│                                 │
│ [Tunjukkan Detail ▼]            │
│                                 │
│ [Salin Laporan Error]           │
│ [Hubungi Support]               │
└─────────────────────────────────┘
```

---

#### Component E: One-Tap Debug Info Collector

**Location:** Settings → "Kirim Laporan Debug"

**Features:**
- Aggregates all debug data into single JSON payload
- Shows preview before sending
- "Copy to Clipboard" button
- "Share via..." button (Web Share API)
- Optional: "Send to Developer" button (posts to `/api/debug-report`)

**Payload Structure:**
```json
{
  "reportId": "uuid",
  "timestamp": "2026-06-10T16:00:00Z",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "auth": {
    "subscription": "free",
    "pro_expires_at": null,
    "isPro": false,
    "cacheAge": "2h 30m"
  },
  "progress": {
    "currentLevel": "A1",
    "completedLessons": 5,
    "xp": 150
  },
  "recentErrors": [
    {
      "time": "2026-06-10T15:55:00Z",
      "page": "/pricing",
      "error": "Failed to fetch orders"
    }
  ],
  "recentApiCalls": [
    {
      "time": "2026-06-10T15:58:00Z",
      "url": "/api/payment",
      "status": 200,
      "duration": 234
    }
  ],
  "environment": {
    "userAgent": "Mozilla/5.0...",
    "platform": "iOS 17",
    "viewport": "390x844"
  }
}
```

---

### 2.3 Integration Points

| Component | Replaces | Integration |
|-----------|----------|-------------|
| Debug Panel | `DebugAuthOverlay` | Settings page, profile long-press |
| API Interceptor | `console.log` in Pricing | Wraps fetch/Supabase |
| Error Context | `console.error` calls | Wraps error handlers |
| Structured Error | `alert()` calls | Toast/Dialog components |
| One-Tap Collector | `api/debug-user.ts` | Settings → Debug Report |

---

## 3. Recommended Implementation Approach

### Phase 1: Low-Hanging Fruit (1-2 days)

1. **Replace `alert()` with Toast/Dialog** — Already have `sonner` or can use shadcn toast
   - Add "Copy Error" button to error toasts
   - Pre-fill support message with error context

2. **Add "Debug Info" section to Settings** — Simple React component
   - Show user ID, email, tier, subscription status
   - Show localStorage cache state
   - "Copy All" button

### Phase 2: Error Capture System (2-3 days)

3. **Create `useDebugStore`** — Zustand store for debug data
   - Intercept fetch calls (wrapper around global fetch)
   - Store last 20 errors with context
   - Store last 10 API calls

4. **Create `ErrorReportDialog`** — Modal with structured error display
   - User-friendly message
   - Expandable technical details
   - Copy/Share buttons

### Phase 3: Debug Panel (3-5 days)

5. **Create `DebugPanel` component** — Bottom sheet on mobile, sidebar on desktop
   - Auth state visualization
   - Error history
   - API call history
   - Cache status

6. **Create "Send Debug Report"** — Optional server-side endpoint
   - POST to `/api/debug-report`
   - Stores in Supabase `debug_reports` table
   - Admin can view in Admin Panel

### Phase 4: Advanced (Optional)

7. **Session Replay Integration** — Lightweight session recording
8. **Performance Metrics** — Core Web Vitals, load times
9. **Network Quality Detection** — Connection type, latency

---

## 4. Security Analysis

### 4.1 What to Expose ✅

| Data | Why Safe | Risk Level |
|------|----------|------------|
| User ID (UUID) | User's own ID, already in localStorage | Low |
| Email | User's own email, already visible in UI | Low |
| Subscription tier | User's own subscription status | Low |
| API call URLs | Path only, no query params or tokens | Low |
| Error messages | Generic error text, no stack traces | Low |
| Request duration | Performance metric, no PII | None |

### 4.2 What to Never Expose ❌

| Data | Why Dangerous | Risk Level |
|------|---------------|------------|
| Supabase access token | Full API access, impersonation | Critical |
| Session tokens | Account takeover | Critical |
| API keys | Service abuse, billing fraud | Critical |
| Request/response bodies | May contain PII, payment data | High |
| Authorization headers | Enables unauthorized API calls | Critical |
| Stack traces | Source code structure, vulnerability hints | Medium |

### 4.3 Security Controls

1. **Client-Side Redaction**
   - API interceptor strips auth headers before logging
   - Error capture sanitizes stack traces
   - Debug store never stores raw request/response bodies

2. **Server-Side Validation**
   - `/api/debug-report` endpoint requires authentication
   - Rate limiting: max 5 reports per user per day
   - Auto-expiry: debug reports deleted after 30 days

3. **Admin Access Control**
   - Debug reports visible only to admin role
   - Audit log for who accessed debug reports
   - No bulk export capability

4. **User Consent**
   - "Send Debug Report" requires explicit tap
   - Clear explanation of what data is sent
   - Option to review data before sending

---

## 5. Confidence Level

### Overall Recommendation Confidence: **HIGH (85%)**

| Aspect | Confidence | Rationale |
|--------|------------|-----------|
| Problem Analysis | 95% | Clear evidence from code review |
| Solution Architecture | 85% | Standard patterns, proven approaches |
| Implementation Approach | 80% | Phased approach reduces risk |
| Security Analysis | 90% | Conservative approach, minimal exposure |
| Mobile UX | 85% | Bottom sheet + Web Share API are proven |

### Risk Factors

1. **localStorage sensitivity** — Debug panel may expose cache state that reveals internal implementation details. Mitigation: Only show "Cache: Valid/Expired" not raw data.

2. **Web Share API compatibility** — Not available in all browsers. Mitigation: Fallback to clipboard copy.

3. **Performance overhead** — API interceptor adds latency. Mitigation: Async logging, no blocking.

### Alternative Approaches Considered

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| Keep current (console.log) | Zero cost | Desktop-only, ephemeral | ❌ Rejected |
| Screenshot-based | No code needed | Manual, low fidelity | ❌ Rejected |
| Email auto-send | Automated | Privacy concerns, complex | ⚠️ Consider later |
| In-app debug panel | Mobile-first, structured | Development effort | ✅ Selected |

---

## 6. Summary

### Current State
- Debugging requires desktop + DevTools or rebuild with env vars
- Mobile users cannot provide structured diagnostic evidence
- Errors are ephemeral (console logs) or low-fidelity (alerts)

### Proposed State
- One-tap debug info collection from any page
- Structured error reports with context
- Copy/Share functionality for mobile users
- Optional server-side reporting for admin review
- Zero secrets exposed, all data user-scoped

### Next Steps
1. Review this report with engineering team
2. Prioritize Phase 1 (Toast replacements + Settings debug section)
3. Begin Phase 2 (Error capture system)
4. Iterate based on user feedback

---

*Report generated by Agent D (UX Agent)*
*Review requested by Main Agent*
