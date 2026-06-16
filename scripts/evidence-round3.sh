#!/bin/bash
# Evidence Collection Script — Round 3
TOKEN=$(grep "SUPABASE_ACCESS_TOKEN" /root/.openclaw/workspace/Deutschup/.env | cut -d'=' -f2)
CLERK_SECRET="sk_test_FrRm9kDhErKrQgR7a2M5SPRfTsOUVQk1fAOFxwqD26"

echo "=========================================="
echo "EVIDENCE COLLECTION — ROUND 3"
echo "=========================================="

echo ""
echo "=== A. Clerk Webhook Endpoints (try all variations) ==="
for path in "/v1/webhooks" "/v1/webhooks/endpoints" "/v1/webhooks_payouts" "/v1/instances"; do
  echo "  GET $path →"
  curl -sS "https://api.clerk.com$path" \
    -H "Authorization: Bearer $CLERK_SECRET" 2>&1 | head -1
  echo ""
done

echo ""
echo "=== B. Clerk Users (trigger webhooks) ==="
curl -sS "https://api.clerk.com/v1/users" \
  -H "Authorization: Bearer $CLERK_SECRET" 2>&1 | jq '. | length' 2>/dev/null

echo ""
echo "=== C. webhook_audit_log ==="
curl -sS -X POST "https://api.supabase.com/v1/projects/mnasgrobmwcpqmnjbvan/database/query" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT id, event_id, event_type, status, execution_result, error_message, created_at FROM webhook_audit_log ORDER BY created_at DESC;"}' 2>&1 | jq '.' 2>/dev/null

echo ""
echo "=== D. webhook_events ==="
curl -sS -X POST "https://api.supabase.com/v1/projects/mnasgrobmwcpqmnjbvan/database/query" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT COUNT(*) as count FROM webhook_events;"}' 2>&1 | jq '.' 2>/dev/null

echo ""
echo "=== E. user_identities ==="
curl -sS -X POST "https://api.supabase.com/v1/projects/mnasgrobmwcpqmnjbvan/database/query" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT COUNT(*) as count FROM user_identities;"}' 2>&1 | jq '.' 2>/dev/null

echo ""
echo "=== F. Edge Function health check ==="
curl -sS -X POST "https://mnasgrobmwcpqmnjbvan.supabase.co/functions/v1/clerk-webhook" \
  -H "apikey: sb_publishable_R9AGg7pGad6Ja976FDngwg_o1AipWJb" \
  -H "Content-Type: application/json" \
  -d '{"type":"ping"}' 2>&1

echo ""
echo "=== G. Clerk Secret Key validity (different endpoints) ==="
echo "  GET /v1/users →"
curl -sS "https://api.clerk.com/v1/users?limit=1" \
  -H "Authorization: Bearer $CLERK_SECRET" 2>&1 | jq 'if type == "array" then "VALID (array)" elif .errors then "INVALID: \(.errors[0].message)" else "UNKNOWN" end' 2>/dev/null
