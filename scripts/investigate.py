#!/usr/bin/env python3
"""CRITICAL INVESTIGATION — Clerk Webhook Failure Analysis"""
import subprocess
import json
import os

# Read tokens from .env
env_path = "/root/.openclaw/workspace/Deutschup/.env"
with open(env_path) as f:
    for line in f:
        if "SUPABASE_ACCESS_TOKEN" in line:
            TOKEN = line.strip().split("=", 1)[1]
            break

CLERK_SECRET = "***"
SUPABASE_URL = "https://api.supabase.com/v1/projects/mnasgrobmwcpqmnjbvan/database/query"
CLERK_URL = "https://api.clerk.com/v1/users"

def run_cmd(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.stdout.strip()

def supabase_query(query):
    import urllib.request
    data = json.dumps({"query": query}).encode()
    req = urllib.request.Request(
        SUPABASE_URL,
        data=data,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json"
        }
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except Exception as e:
        return {"error": str(e)}

def clerk_api(path):
    import urllib.request
    req = urllib.request.Request(
        f"https://api.clerk.com{path}",
        headers={"Authorization": f"Bearer {CLERK_SECRET}"}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except Exception as e:
        return {"error": str(e)}

print("=" * 60)
print("CRITICAL INVESTIGATION — 15 FAILED DELIVERIES")
print("=" * 60)

# 1. webhook_audit_log
print("\n=== EVIDENCE 1: webhook_audit_log ===")
result = supabase_query("SELECT id, event_id, event_type, status, execution_result, error_message, created_at FROM webhook_audit_log ORDER BY created_at DESC;")
print(json.dumps(result, indent=2))

# 2. webhook_events
print("\n=== EVIDENCE 2: webhook_events ===")
result = supabase_query("SELECT * FROM webhook_events ORDER BY created_at DESC LIMIT 10;")
print(json.dumps(result, indent=2))

# 3. user_identities
print("\n=== EVIDENCE 3: user_identities ===")
result = supabase_query("SELECT * FROM user_identities ORDER BY created_at DESC LIMIT 10;")
print(json.dumps(result, indent=2))

# 4. Clerk users
print("\n=== EVIDENCE 4: Clerk users ===")
result = clerk_api("/v1/users")
if isinstance(result, list):
    for user in result:
        print(f"  {user.get('id')}: {user.get('username')} - {[e['email_address'] for e in user.get('email_addresses', [])]}")
else:
    print(json.dumps(result, indent=2))

# 5. Edge Function health check
print("\n=== EVIDENCE 5: Edge Function health check ===")
result = run_cmd('''curl -sS -X POST "https://mnasgrobmwcpqmnjbvan.supabase.co/functions/v1/clerk-webhook" \
  -H "apikey: sb_publishable_R9AGg7pGad6Ja976FDngwg_o1AipWJb" \
  -H "Content-Type: application/json" \
  -d '{\"type\":\"ping\"}' ''')
print(result)

# 6. Supabase secrets
print("\n=== EVIDENCE 6: Supabase secrets ===")
result = run_cmd("supabase secrets list --project-ref mnasgrobmwcpqmnjbvan 2>&1 | grep -E 'CLERK|WEBHOOK'")
print(result)

# 7. Edge Function code inspection
print("\n=== EVIDENCE 7: Edge Function code (first 50 lines) ===")
func_path = "/root/.openclaw/workspace/Deutschup/supabase/functions/clerk-webhook/index.ts"
if os.path.exists(func_path):
    with open(func_path) as f:
        lines = f.readlines()[:50]
        print("".join(lines))
else:
    print("File not found")
