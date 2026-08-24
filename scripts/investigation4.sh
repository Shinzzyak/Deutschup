#!/bin/bash
# CRITICAL INVESTIGATION — Evidence Collection
TOKEN=*** "SUPABASE_ACCESS_TOKEN" /root/.openclaw/workspace/Deutschup/.env | cut -d'=' -f2)

echo "=========================================="
echo "CRITICAL INVESTIGATION — 15 FAILED DELIVERIES"
echo "=========================================="

echo ""
echo "=== EVIDENCE 1: webhook_audit_log (all entries) ==="
curl -sS -X POST "https://api.supabase.com/v1/projects/mnasgrobmwcpqmnjbvan/database/query" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT id, event_id, event_type, status, execution_result, error_message, created_at FROM webhook_audit_log ORDER BY created_at DESC;"}' 2>&1 | jq '.' 2>/dev/null

echo ""
echo "=== EVIDENCE 2: webhook_events (all entries) ==="
curl -sS -X POST "https://api.supabase.com/v1/projects/mnasgrobmwcpqmnjbvan/database/query" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT * FROM webhook_events ORDER BY created_at DESC;"}' 2>&1 | jq '.' 2>/dev/null

echo ""
echo "=== EVIDENCE 3: user_identities (all entries) ==="
curl -sS -X POST "https://api.supabase.com/v1/projects/mnasgrobmwcpqmnjbvan/database/query" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT * FROM user_identities ORDER BY created_at DESC;"}' 2>&1 | jq '.' 2>/dev/null

echo ""
echo "=== EVIDENCE 4: Clerk users ==="
CLERK_SECRET="sk_tes…qD26"
curl -sS "https://api.clerk.com/v1/users" \
  -H "Authorization: Bearer $CLERK_SECRET" 2>&1 | jq '.[] | {id, username, email_addresses: [.email_addresses[].email_address]}' 2>/dev/null

echo ""
echo "=== EVIDENCE 5: Edge Function health check ==="
curl -sS -X POST "https://mnasgrobmwcpqmnjbvan.supabase.co/functions/v1/clerk-webhook" \
  -H "apikey: sb_publishable_R9AGg7pGad6Ja976FDngwg_o1AipWJb" \
  -H "Content-Type: application/json" \
  -d '{"type":"ping"}' 2>&1

echo ""
echo "=== EVIDENCE 6: Supabase secrets ==="
supabase secrets list --project-ref mnasgrobmwcpqmnjbvan 2>&1 | grep -E "CLERK|WEBHOOK"
