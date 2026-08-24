# Payment Integration Cross-Check: DeutschUp vs Bayar.gg Official Repo

**Date:** 2026-07-03
**Reference:** https://github.com/bayar-global-gateway/bayargg-api-integrations
**Our file:** `api/payment.ts` + `src/pages/Pricing.tsx`

---

## 1. Create Payment — `POST /api/create-payment.php`

### Official spec (from `endpoints.json` + `example.mjs`):
```json
{
  "amount": 10000,
  "description": "Order #INV-001",
  "customer_name": "Customer Name",
  "customer_email": "customer@example.com",
  "customer_phone": "6281234567890",
  "callback_url": "https://example.com/webhook",
  "redirect_url": "https://example.com/thank-you",
  "payment_url": "https://www.bayar.gg/pay",
  "payment_method": "qris"
}
```

Auth: `X-API-Key` header.

### Our code (`api/payment.ts` lines 71-86):
```json
{
  "amount": price,
  "description": "DeutschUp PRO Subscription",
  "customer_name": name || 'Student',
  "customer_email": email || 'student@example.com',
  "callback_url": "${APP_URL}/api/payment?action=callback",
  "redirect_url": "${APP_URL}/dashboard?payment=success",
  "payment_method": "qris",
  "payment_url": "https://www.bayar.gg/pay"
}
```

### Verdict: ✅ MATCH
| Field | Official | Ours | Status |
|-------|----------|------|--------|
| `amount` | integer | `price` (49000 or 1000 test) | ✅ |
| `description` | string | `DeutschUp PRO Subscription` | ✅ |
| `customer_name` | string | `name \|\| 'Student'` | ✅ |
| `customer_email` | string | `email \|\| 'student@example.com'` | ✅ |
| `customer_phone` | optional | **missing** | ⚠️ optional, not required |
| `callback_url` | string | `${APP_URL}/api/payment?action=callback` | ✅ |
| `redirect_url` | string | `${APP_URL}/dashboard?payment=success` | ✅ |
| `payment_url` | `https://www.bayar.gg/pay` | `https://www.bayar.gg/pay` | ✅ |
| `payment_method` | `qris` etc | `qris` | ✅ |
| Auth header | `X-API-Key` | `X-API-Key` | ✅ |
| Endpoint | `/api/create-payment.php` | `/api/create-payment.php` | ✅ |

**No mismatches.** `customer_phone` is optional per official docs; omitting is safe.

---

## 2. Check Payment — `GET /api/check-payment.php`

### Official spec:
```
GET /api/check-payment.php?invoice=INVOICE_ID
Headers: X-API-Key, Accept: application/json
```

### Our code (`api/payment.ts` callback handler):
```js
const checkRes = await fetch(
  `https://www.bayar.gg/api/check-payment.php?invoice=${encodeURIComponent(invoice_id)}`,
  { headers: { 'X-API-Key': BAYAR_GG_API_KEY, 'Accept': 'application/json' } }
);
```

### Verdict: ✅ EXACT MATCH
- Query param name: `invoice` ✅
- Header: `X-API-Key` + `Accept: application/json` ✅
- URL encoding: `encodeURIComponent` ✅
- Trusts API response `status === 'paid'` only ✅

---

## 3. Webhook/Callback Handler

### Official pattern (from `docs/webhooks.md`):
1. Receive POST with body including `invoice_id`
2. **NEVER trust body `status`** — body is NOT signed
3. Extract `invoice_id`
4. Call `check-payment.php` with API Key
5. Only fulfill if API returns `status: 'paid'`
6. Be idempotent (don't process same invoice twice)

### Our code (`api/payment.ts` callback handler):
1. ✅ Receives POST, extracts `invoice_id` from body
2. ✅ Never trusts `body.status`
3. ✅ Calls `check-payment.php?invoice=X` with `X-API-Key`
4. ✅ Only fulfills if `verifyStatus === 'paid'`
5. ⚠️ **Idempotency: NOT explicitly guarded**
   - If Bayar.gg sends the same callback twice, our code will:
     - Update `profiles` again (no harm, same values)
     - Update `orders` again (no harm, same values)
   - But: no explicit `if (order.status === 'paid') return ok` check
   - **Risk:** Low (idempotent by coincidence), but should be explicit

### Idempotency fix recommended:
```js
const { data: order } = await getDb().from('orders').select('*').eq('id', invoice_id).single();
if (order?.status === 'paid') {
  console.log('[payment/callback] Already processed, idempotent skip');
  return res.json({ success: true, message: 'Already processed' });
}
```

---

## 4. Webhook Payload Fields — Official vs Our Usage

| Field | Official | Our Usage | Status |
|-------|----------|-----------|--------|
| `invoice_id` | ✅ in docs | ✅ extracted | ✅ |
| `status` | ✅ in docs | ❌ ignored (correct!) | ✅ |
| `amount` | ✅ in docs | ❌ not used | ⚠️ minor |
| `final_amount` | ✅ in docs | ❌ not used | ⚠️ minor |
| `payment_method` | ✅ in docs | ✅ used for order update | ✅ |
| `paid_via` | ✅ in docs | ❌ not used | ⚠️ minor |
| `paid_at` | ✅ in docs | ✅ used for order update | ✅ |
| `paid_reff_num` | ⚠️ not in official docs | ✅ used for order update | ✅ safe |
| `customer_email` | ✅ in docs | ❌ not used | ✅ ok |

**Note:** Official docs recommend matching `final_amount` with order amount. We don't do this.
- **Risk:** Low for now (QRIS amount is fixed by Bayar.gg at create time)
- **Recommendation:** Add `final_amount` verification as defense-in-depth

---

## 5. Errors We Hit + Root Causes + Fixes

### Error 1: HMAC Signature Verification (H4 fix — WRONG)
- **Symptom:** Webhook callback rejected because `BAYARGG_WEBHOOK_SECRET` not set
- **Root cause:** We assumed Bayar.gg signs webhook bodies (HMAC SHA256). This was WRONG.
- **Official docs:** "Body callback **tidak ditandatangani**" (body is NOT signed)
- **Fix:** Removed HMAC entirely. Replaced with `check-payment.php` API verification.
- **Commit:** `67c3ca6`
- **Status:** ✅ FIXED

### Error 2: Duplicate Variable Declaration
- **Symptom:** `SyntaxError: Identifier 'webhookPayload' has already been declared`
- **Root cause:** During multi-edit on `payment.ts`, `const webhookPayload = req.body` was declared twice in same scope
- **Fix:** Removed duplicate declaration
- **Commit:** `b3ca35d`
- **Status:** ✅ FIXED

### Error 3: 401 on Payment Create (Frontend)
- **Symptom:** Logged-in user clicks "Pilih Pro" → 401 Unauthorized
- **Root cause:** Backend hardened to require verified Bearer token, but Pricing page still used raw `fetch` with only `Content-Type` header
- **Fix:** Pricing page imports `getAuthHeaders()` and sends `Authorization: Bearer <token>`
- **Commit:** `bf9a733`
- **Status:** ✅ FIXED

### Error 4: 401 on Profile Fetch (Frontend → Backend)
- **Symptom:** Logged-in user on `/profile` → `/api/db-proxy?action=get-profile` returns 401
- **Root cause:** `getVerifiedIdentity()` resolved Clerk JWT by `email` only. Clerk browser tokens carry `sub` (Clerk user id) reliably, but `email` may be absent.
- **Fix:** Server now verifies Clerk JWT with `@clerk/backend` + `CLERK_SECRET_KEY`, maps `sub` → `user_identities.clerk_id` → `internal_id`
- **Commit:** `052c155`
- **Status:** ✅ FIXED

---

## 6. Production Log Verbosity ⚠️

### Current logging in `payment.ts`:
- `[payment/create] Provider: bayar_gg`
- `[payment/create] API_KEY_LENGTH` ← **leaks key length**
- `[payment/create] BASE_URL`
- `[payment/create] APP_URL`
- `[BAYARGG REQUEST]` ← full payload including customer email
- `[payment/create] RAW_RESPONSE_FIRST_3000` ← raw gateway response
- `[BAYARGG RESPONSE]` ← full gateway response
- `[payment/callback] Received webhook:` ← full webhook payload
- `[payment/callback] check-payment result:` ← full verification response

### Official examples: No logging at all (minimal)

### Recommendation:
- Remove `API_KEY_LENGTH` log (information leakage)
- Remove `RAW_RESPONSE_FIRST_3000` in production
- Keep only error logs + `[payment/create] started` + `[payment/callback] invoice_id=X status=paid`
- Gate full debug logs behind `process.env.DEBUG_PAYMENTS === 'true'`

---

## 7. Summary Scorecard

| Area | Official Spec | Our Code | Status |
|------|--------------|----------|--------|
| Create payment endpoint | `/api/create-payment.php` | ✅ same | ✅ |
| Create payment payload | All required fields | ✅ match | ✅ |
| Auth header | `X-API-Key` | ✅ | ✅ |
| Check payment endpoint | `/api/check-payment.php` | ✅ | ✅ |
| Check payment query | `invoice=ID` | ✅ | ✅ |
| Webhook verification | check-payment API, not body | ✅ | ✅ |
| Webhook idempotency | recommended | ⚠️ implicit only | ⚠️ FIX |
| `final_amount` verification | recommended | ❌ not done | ⚠️ FIX |
| `customer_phone` | optional | omitted | ✅ OK |
| Log verbosity | minimal | excessive | ⚠️ FIX |
| CORS | not spec | our domain only | ✅ OK |
| Rate limiting | not spec | 5/min create, 20/min callback | ✅ OK |

### Issues found by cross-check:
1. **Idempotency guard missing** — callback bisa proses same invoice 2x (low risk, but should be explicit)
2. **`final_amount` not verified** — official docs recommend matching with order amount
3. **Production logs too verbose** — leaks customer email, API key length, raw gateway responses
4. **No `customer_phone`** — optional per spec, OK to omit

### What was already correct:
- Endpoint URLs match exactly
- Auth pattern (`X-API-Key` header) correct
- Webhook verification pattern (check-payment API, not body trust) exactly matches official docs
- Payment method (`qris`) valid
- `payment_url: 'https://www.bayar.gg/pay'` correct
- Callback URL format correct
- Redirect URL format correct
- Rate limiting added on top (not required but good practice)
