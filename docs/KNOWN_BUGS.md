# Known Bugs & Resolved Incidents

Track all production issues, regressions, and their resolutions.

---

## PAY-001 — Bayar.gg payment_url Required Field

| Field | Value |
|-------|-------|
| **Incident ID** | PAY-001 |
| **Date** | 2026-06-10 |
| **Severity** | High |
| **Status** | RESOLVED |
| **Root Cause** | Missing required `payment_url` field in Bayar.gg API request |
| **Fix Commit** | 29d0cbd |
| **Prevention Rule** | Always check provider API docs for required fields before implementation |

### Symptoms
- User receives "Payment gateway error"
- Payment creation fails
- Bayar.gg API returns: `"payment_url is required and must be a non-empty string"`

### Resolution
Added `payment_url: 'https://www.bayar.gg/pay'` to payment payload.

### Documentation
- `docs/incidents/PAY-001-payment-url-required.md`

---

## REG-001 — White Screen After Payment Success Cache Invalidation

| Field | Value |
|-------|-------|
| **Incident ID** | REG-001 |
| **Date** | 2026-06-10 |
| **Severity** | Critical |
| **Status** | RESOLVED |
| **Root Cause** | Missing import for `DashboardWithPaymentRefresh` in `App.tsx` |
| **Fix Commit** | bcf9780 |
| **Prevention Rule** | Always verify imports before using components |

### Symptoms
- Dashboard renders white screen after commit 3f42169
- React crash due to undefined component

### Resolution
Added lazy import for `DashboardWithPaymentRefresh`.

### Documentation
- Commit message: `fix: add missing import for DashboardWithPaymentRefresh`

---

## REG-002 — Admin Panel Action Mismatch

| Field | Value |
|-------|-------|
| **Incident ID** | REG-002 |
| **Date** | 2026-06-10 |
| **Severity** | Medium |
| **Status** | IDENTIFIED |
| **Root Cause** | Frontend uses `action=users` and `action=config`, backend only supports `env-check`, `system-health`, `stats`, `update-role`, `toggle-pro` |
| **Fix Commit** | Pending |
| **Prevention Rule** | Maintain API contract between frontend and backend |

### Symptoms
- Admin panel shows Total Users = 0
- Admin panel shows Pro Members = 0
- API returns: `{"error":"Invalid admin action"}`

### Evidence
- Frontend: `Admin.tsx` lines 25, 29, 55, 75, 84
- Backend: `api/admin.ts` switch statement

### Resolution Pending
Add `users` and `config` actions to `api/admin.ts`.

---

## REG-003 — Stale Profile Cache After Payment

| Field | Value |
|-------|-------|
| **Incident ID** | REG-003 |
| **Date** | 2026-06-10 |
| **Severity** | High |
| **Status** | IDENTIFIED |
| **Root Cause** | localStorage profile cache not invalidated after payment completion |
| **Fix Commit** | 3f42169 (partial) |
| **Prevention Rule** | Invalidate cache after state-changing operations |

### Symptoms
- Payment succeeds but UI shows "Pilih Pro"
- Payment history empty
- Pro badge not visible

### Evidence
- `authStore.ts` lines 45-58: Cache validity 24h
- `DashboardWithPaymentRefresh.tsx`: Clears cache on `payment=success`

### Resolution Partial
Cache invalidation implemented but may need additional verification.

---

## REG-004 — Payment History Query Not Returning Rows

| Field | Value |
|-------|-------|
| **Incident ID** | REG-004 |
| **Date** | 2026-06-10 |
| **Severity** | High |
| **Status** | UNDER INVESTIGATION |
| **Root Cause** | Unknown — possibly RLS, user.id mismatch, or query error |
| **Fix Commit** | Pending |
| **Prevention Rule** | Add logging to all database queries |

### Symptoms
- Pricing page shows empty payment history
- Console log shows: `[PAYMENT-HISTORY] user.id: <uuid> rows: 0 error: null`

### Evidence Pending
- Actual `user.id` from authStore
- Actual `orders.user_id` from database
- RLS policies on orders table

---

## REG-005 — Pro Badge Not Rendering

| Field | Value |
|-------|-------|
| **Incident ID** | REG-005 |
| **Date** | 2026-06-10 |
| **Severity** | High |
| **Status** | UNDER INVESTIGATION |
| **Root Cause** | Unknown — possibly stale tierData or missing pro_expires_at |
| **Fix Commit** | Pending |
| **Prevention Rule** | Verify subscription state at multiple layers |

### Symptoms
- Dashboard shows Free instead of Pro
- PDF export blocked with "Fitur Export PDF hanya tersedia untuk pengguna Pro"

### Evidence Pending
- Actual `profiles.subscription` value
- Actual `profiles.pro_expires_at` value
- `tierData` from authStore at runtime

---

## Tracking Template

```markdown
## <INCIDENT_ID> — <Title>

| Field | Value |
|-------|-------|
| **Incident ID** | <ID> |
| **Date** | <YYYY-MM-DD> |
| **Severity** | Critical/High/Medium/Low |
| **Status** | IDENTIFIED/INVESTIGATING/RESOLVED |
| **Root Cause** | <description> |
| **Fix Commit** | <commit hash or Pending> |
| **Prevention Rule** | <rule> |

### Symptoms
- <symptom 1>
- <symptom 2>

### Resolution
- <resolution description>

### Documentation
- <link to detailed incident doc>
```

---

*Last updated: 2026-06-10 15:30 UTC*
