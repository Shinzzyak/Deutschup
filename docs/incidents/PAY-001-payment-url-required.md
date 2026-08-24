# PAY-001 — Bayar.gg payment_url Required Field Incident

## Incident Details

**Incident ID:** PAY-001
**Date:** 2026-06-10
**Severity:** High
**Business Impact:** Payments blocked
**Classification:** Missing Required Field
**Status:** RESOLVED

---

## Symptoms

- User receives "Payment gateway error"
- Payment creation fails
- Frontend reaches backend successfully
- Bayar.gg API reachable

---

## Verified Evidence

### 1. Runtime Environment Check
```json
{
  "apiKeyLength": 52,
  "apiKeyPrefix": "BAYAR-...",
  "appUrl": "https://deutschup.sintec.my.id",
  "testMode": false
}
```

**Result:** BAYAR_GG_API_KEY present and readable at runtime. NOT empty.

### 2. Backend Execution Confirmed
- API endpoint reachable
- Authentication middleware passes
- Backend code executes normally

### 3. Bayar.gg API Response
```json
{
  "success": false,
  "error": "payment_url is required and must be a non-empty string"
}
```

**Result:** Provider response identified root cause immediately.

---

## Documentation Evidence

### Source
https://www.bayar.gg/api-docs

### Endpoint
`POST /api/create-payment.php`

### Required Fields (from documentation)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | number | ✅ Required | Nominal (min Rp 1,000, max Rp 500,000 for QRIS) |
| payment_url | string | ✅ Required | Checkout URL. Must be HTTPS. Use default `https://www.bayar.gg/pay` or custom URL from Developer menu. |

### Documentation Excerpt

> **payment_url** string **Required**
> 
> Checkout URL yang ingin dipakai untuk transaksi ini. Wajib string HTTPS. Gunakan default `https://www.bayar.gg/pay` atau salah satu Checkout URL aktif di menu Developer - Checkout URL.

---

## Root Cause

DeutschUp payment payload omitted required field: `payment_url`

### Current Payload (Missing Field)
```typescript
const payload = {
  amount: price,
  description: `DeutschUp ${planType} Subscription`,
  customer_name: name || 'Student',
  customer_email: email || 'student@example.com',
  callback_url: `${APP_URL}/api/payment?action=callback`,
  redirect_url: `${APP_URL}/dashboard?payment=success`,
  payment_method: 'qris',
  // ❌ MISSING: payment_url
};
```

### Required Payload
```typescript
const payload = {
  amount: price,
  description: `DeutschUp ${planType} Subscription`,
  customer_name: name || 'Student',
  customer_email: email || 'student@example.com',
  callback_url: `${APP_URL}/api/payment?action=callback`,
  redirect_url: `${APP_URL}/dashboard?payment=success`,
  payment_method: 'qris',
  payment_url: 'https://www.bayar.gg/pay',  // ✅ ADDED
};
```

---

## Resolution

### Fix Applied
Add `payment_url: "https://www.bayar.gg/pay"` to payment creation payload.

### Code Change
```typescript
// api/payment.ts
const payload = {
  // ... existing fields
  payment_url: 'https://www.bayar.gg/pay',  // NEW: Required by Bayar.gg API
};
```

---

## Prevention

1. **Provider Contract Tests** — Validate required fields before request
2. **Payment Integration Smoke Test** — Automated test for payment creation
3. **Provider API Change Monitoring** — Review API docs quarterly
4. **Runtime Validation** — Check required fields before sending to provider

---

## Lessons Learned

### Do NOT assume root cause until provider response is inspected:

❌ API key issue
❌ Vercel deployment issue
❌ Supabase issue
❌ Frontend issue
❌ Network issue

### Provider response identified root cause immediately:

✅ Bayar.gg error message: "payment_url is required"
✅ Documentation confirmed: payment_url is required field
✅ Fix: Add missing field to payload

---

## Timeline

| Time | Event |
|------|-------|
| 11:30 UTC | Incident reported |
| 11:46 UTC | Initial investigation |
| 11:58 UTC | Vercel API investigation |
| 12:10 UTC | Runtime evidence collected |
| 12:28 UTC | Documentation evidence collected |
| 12:30 UTC | Root cause confirmed |
| 12:35 UTC | Fix implemented |
| 12:40 UTC | End-to-end verification |

---

*Incident documented by Exilio 🧠*
*Resolution verified by Avres*
