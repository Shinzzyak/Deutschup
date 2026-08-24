# Debugging Playbook — DeutschUp

## Third-Party API Failure Investigation Flow

When a third-party integration fails, follow this checklist:

### Step 1: Confirm Request Reaches Backend
- Check HTTP status code
- Verify authentication middleware passes
- Check backend logs for request entry

### Step 2: Confirm Backend Reaches Provider
- Check if fetch/HTTP call to provider executes
- Verify API key is present and loaded
- Check provider endpoint URL is correct

### Step 3: Capture Raw Provider Response
- Log HTTP status from provider
- Log response body
- Log content-type header

### Step 4: Compare Payload with Documentation
- Fetch official API docs
- List all required fields
- List all optional fields
- Compare actual payload vs documented payload

### Step 5: Identify Missing/Invalid Fields
- Field-by-field diff
- Check field names (camelCase vs snake_case)
- Check field types (string vs number)
- Check field values (empty vs populated)

### Step 6: Verify Fix with Runtime Evidence
- Deploy fix
- Run integration test
- Capture success response
- Verify end-to-end flow

### Step 7: Document Incident
- Create incident report in `docs/incidents/`
- Update lessons learned
- Update debugging playbook
- Commit to version control

---

## Common Dead Ends to Avoid

### ❌ Infrastructure Assumptions
Do NOT assume:
- Vercel deployment issue
- Environment variable missing
- Supabase configuration
- Network connectivity
- DNS resolution

Until you have:
- Provider response evidence
- Documentation comparison

### ❌ Code Assumptions
Do NOT assume:
- Frontend bug
- Backend bug
- Authentication issue
- Permission issue

Until you have:
- Raw provider response
- Payload comparison with docs

---

## Evidence Collection Template

```json
{
  "timestamp": "2026-06-10T12:30:00Z",
  "endpoint": "POST /api/payment?action=create",
  "backend_status": 200,
  "api_key_length": 52,
  "provider_status": 400,
  "provider_response": {
    "success": false,
    "error": "payment_url is required"
  },
  "documentation_url": "https://www.bayar.gg/api-docs",
  "root_cause": "Missing required field",
  "fix": "Added payment_url to payload"
}
```

---

## Provider Integration Checklist

Before going live with a new provider:

- [ ] Read full API documentation
- [ ] List all required fields
- [ ] List all optional fields
- [ ] Create contract test
- [ ] Test with valid credentials
- [ ] Test with invalid credentials
- [ ] Test with missing required fields
- [ ] Verify error handling
- [ ] Document incident response flow
