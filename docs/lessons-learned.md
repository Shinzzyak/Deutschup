# Lessons Learned — DeutschUp

Document all key learnings from incidents and debugging sessions.

---

## PAY-001 — Bayar.gg payment_url Required Field (2026-06-10)

### Incident Summary
- **Symptom:** "Payment gateway error" when upgrading to Pro
- **Root Cause:** Missing required `payment_url` field in Bayar.gg API request
- **Resolution:** Added `payment_url: 'https://www.bayar.gg/pay'` to payload
- **Status:** RESOLVED

### Key Learning
**When third-party integrations fail:**
1. Inspect provider response FIRST
2. Inspect documentation
3. Compare actual payload vs documented payload
4. Only then investigate infrastructure

### Never Assume Root Cause Before Provider Response
❌ Vercel deployment issue
❌ Environment variable missing
❌ Supabase configuration
❌ Network connectivity

### Prevention Rules
- Maintain provider contract tests
- Review provider API docs quarterly
- Add payment integration smoke tests

---

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
- Verify cache freshness after mutations

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
