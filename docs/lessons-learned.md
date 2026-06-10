
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

## REG-001 — White Screen After Payment Success Cache Invalidation (2026-06-10)

### Incident Summary
- **Symptom:** Dashboard renders white screen after commit 3f42169
- **Root Cause:** Missing import for `DashboardWithPaymentRefresh` in `App.tsx`
- **Resolution:** Added lazy import
- **Status:** RESOLVED

### Key Learning
**Always verify imports before using components.**

### Prevention Rules
- Import components before referencing them
- Run type checking before commit
- Test component rendering in isolation

---

## REG-002 — Admin Panel Action Mismatch (2026-06-10)

### Incident Summary
- **Symptom:** Admin panel returns 400 "Invalid admin action"
- **Root Cause:** Frontend uses `action=users` and `action=config`, backend doesn't support them
- **Resolution:** Pending
- **Status:** IDENTIFIED

### Key Learning
**Maintain API contract between frontend and backend.**

### Prevention Rules
- Document all API actions
- Create shared API contract/type definitions
- Test API endpoints before frontend integration

---

## REG-003 — Stale Profile Cache After Payment (2026-06-10)

### Incident Summary
- **Symptom:** Payment succeeds but UI shows "Pilih Pro"
- **Root Cause:** localStorage profile cache not invalidated after payment
- **Resolution:** Partial (cache invalidation on payment=success)
- **Status:** IDENTIFIED

### Key Learning
**Invalidate cache after state-changing operations.**

### Prevention Rules
- Clear relevant cache after mutations
- Add cache invalidation to payment success flow
- Verify cache freshness at critical points

---

## Debugging Playbook Additions

### White Screen Investigation
1. Check browser console for errors
2. Verify all components are imported
3. Check for undefined component references
4. Verify lazy load syntax

### API Action Mismatch
1. List all frontend API calls
2. List all backend supported actions
3. Compare for mismatches
4. Document API contract

### Cache Invalidation
1. Identify all cached data
2. List all state-changing operations
3. Verify cache is cleared after each operation
4. Test cache freshness after mutations
