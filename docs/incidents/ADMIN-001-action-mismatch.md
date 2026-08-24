# ADMIN-001 — Admin Panel Action Mismatch

## Incident Details

**Incident ID:** ADMIN-001
**Date:** 2026-06-10
**Severity:** Medium
**Business Impact:** Admin panel non-functional
**Classification:** API Contract Mismatch
**Status:** IDENTIFIED

---

## Symptoms

- Admin panel shows Total Users = 0
- Admin panel shows Pro Members = 0
- API returns: `{"error":"Invalid admin action"}`

---

## Verified Evidence

### 1. Frontend API Calls
**File:** src/pages/Admin.tsx

```typescript
// Line 25
fetch('/api/admin?action=users', { ... })

// Line 29
fetch('/api/admin?action=config', { ... })

// Line 55
fetch('/api/admin?action=config', { ... })

// Line 75
fetch('/api/admin?action=users', { ... })

// Line 84
fetch('/api/admin?action=users', { ... })
```

### 2. Backend Supported Actions
**File:** api/admin.ts

```typescript
switch (action) {
  case 'env-check':      // ✅ Supported
  case 'system-health':  // ✅ Supported
  case 'stats':          // ✅ Supported
  case 'update-role':    // ✅ Supported
  case 'toggle-pro':     // ✅ Supported
  default:
    return res.status(400).json({ error: 'Invalid admin action' });
}
```

### 3. Action Mismatch
| Frontend Action | Backend Support | Status |
|-----------------|-----------------|--------|
| `action=users` | ❌ Not in switch | **400 Invalid admin action** |
| `action=config` | ❌ Not in switch | **400 Invalid admin action** |
| `action=env-check` | ✅ Supported | Not used by frontend |
| `action=system-health` | ✅ Supported | Not used by frontend |
| `action=stats` | ✅ Supported | Not used by frontend |
| `action=update-role` | ✅ Supported | Not used by frontend |
| `action=toggle-pro` | ✅ Supported | Not used by frontend |

---

## Root Cause

Frontend uses `action=users` and `action=config`, but backend only supports different actions.

### API Contract Violation
- Frontend expects: `users`, `config`
- Backend provides: `env-check`, `system-health`, `stats`, `update-role`, `toggle-pro`

---

## Resolution

### Fix Required
Add `users` and `config` actions to `api/admin.ts` switch statement.

### Proposed Implementation
```typescript
case 'users':
  return handleGetUsers(req, res);
case 'config':
  return handleGetConfig(req, res);
```

---

## Prevention

1. **API Contract Documentation** — Document all API actions in shared contract
2. **Frontend-Backend Validation** — Validate frontend calls against backend support
3. **Integration Testing** — Add integration tests for API actions
4. **Regression Testing** — Verify API actions work after changes

---

## Lessons Learned

### Maintain API contract between frontend and backend

❌ Frontend assumes actions exist
✅ Document all supported actions
✅ Validate frontend calls against backend

---

## Timeline

| Time | Event |
|------|-------|
| 15:00 UTC | Admin panel returns 400 |
| 15:05 UTC | Root cause identified: action mismatch |
| Pending | Fix implementation |

---

*Incident documented by Exilio 🧠*
