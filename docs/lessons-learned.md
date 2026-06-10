
## PAY-001 — Bayar.gg payment_url Required Field Incident (2026-06-10)

### Incident Summary
- **Symptom:** User receives "Payment gateway error" when upgrading to Pro
- **Root Cause:** Missing required `payment_url` field in Bayar.gg API request
- **Resolution:** Added `payment_url: "https://www.bayar.gg/pay"` to payload
- **Status:** RESOLVED

### Initial Assumptions (All Disproven)
❌ Vercel Deployment Protection blocking API routes
❌ Missing environment variables (BAYAR_GG_API_KEY, APP_URL)
❌ Supabase configuration issue
❌ API key missing or empty
❌ Backend deployment issue

### Key Learning
**Always inspect provider response FIRST before investigating infrastructure.**

### Debugging Flow for Third-Party API Failures
1. Confirm request reaches backend
2. Confirm backend reaches provider
3. Capture raw provider response
4. Compare payload with official documentation
5. Identify missing/invalid fields
6. Verify fix with runtime evidence
7. Document incident permanently

### Evidence That Proved Root Cause
```json
// Runtime test showed API key was present
{ "apiKeyLength": 52 }

// Provider response identified the issue
{ "success": false, "error": "payment_url is required" }

// Documentation confirmed requirement
// https://www.bayar.gg/api-docs
// payment_url: Required field
```

### Prevention Rules
- Never assume infrastructure issues before reading provider responses
- Maintain provider contract tests
- Review provider API docs quarterly
- Add payment integration smoke tests

### Related Files
- `docs/incidents/PAY-001-payment-url-required.md`
- `api/payment.ts` (line 45: payment_url added)
- `api/payment-test.ts` (diagnostic endpoint)
