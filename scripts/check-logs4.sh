#!/bin/bash
TOKEN=$(grep "SUPABASE_ACCESS_TOKEN" /root/.openclaw/workspace/Deutschup/.env | cut -d'=' -f2)
echo "Token length: ${#TOKEN}"
echo ""
echo "=== Try Supabase Logs API ==="
curl -sS "https://api.supabase.com/v1/projects/mnasgrobmwcpqmnjbvan/logs" \
  -H "Authorization: Bearer $TOKEN" 2>&1 | head -50
