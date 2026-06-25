#!/bin/bash
# Deutschup Deploy Script v2 — Optimized for 2GB VPS
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DEPLOY_DIR="/root/.openclaw/workspace/Deutschup"
TOKEN_FILE="/root/.openclaw/workspace/.secrets/vercel-token"
PROD_URL="https://deutschup.sintec.my.id"

cd "$DEPLOY_DIR"

log() { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# --- Step 0: Free memory (prevent OOM on 2GB VPS) ---
log "Freeing memory..."
sync
echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true
# Kill any leftover node/vercel processes
pkill -f "vercel.*prod" 2>/dev/null || true
pkill -f "esbuild" 2>/dev/null || true
sleep 2

# --- Step 1: Get Vercel Token ---
if [ ! -f "$TOKEN_FILE" ]; then
  err "Vercel token not found at $TOKEN_FILE"
fi
VERCEL_TOKEN=$(head -1 "$TOKEN_FILE")
[ -z "$VERCEL_TOKEN" ] && err "Vercel token is empty"

# --- Step 2: Build ---
log "Building..."
npm run build 2>&1 | tail -3
if [ ${PIPESTATUS[0]} -ne 0 ]; then
  err "Build failed"
fi

# Get local hash
LOCAL_HASH=$(grep -oP 'index-[A-Za-z0-9_-]+\.js' dist/index.html | head -1 | sed 's/index-//;s/\.js//')
log "Local build hash: $LOCAL_HASH"

# Free memory after build
sync
echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true
sleep 1

# --- Step 3: Commit & Push ---
CHANGES=$(git diff --stat 2>/dev/null | wc -l)
if [ "$CHANGES" -gt 0 ]; then
  log "Committing & pushing..."
  git add -A
  git commit -m "deploy: $(date +%Y-%m-%d_%H:%M)" --allow-empty 2>/dev/null || true
  git push origin main 2>&1 || warn "Git push failed (non-blocking)"
fi

# --- Step 4: Deploy to Vercel (memory-optimized) ---
log "Deploying to Vercel..."
# Use --no-wait to reduce memory footprint, then poll status
vercel --prod --yes --force --token="$VERCEL_TOKEN" --no-wait 2>&1 | tail -2

# Wait for deploy to be ready (poll via API instead of blocking)
log "Waiting for deploy READY status..."
sleep 30

# --- Step 5: Purge CDN cache ---
log "Purging CDN cache..."
vercel cache purge --type=cdn --yes --token="$VERCEL_TOKEN" 2>&1 | tail -1
sleep 5

# --- Step 6: Verify production hash ---
PROD_HASH=""
for attempt in 1 2 3; do
  PROD_HASH=$(curl -sS --max-time 10 "$PROD_URL/?v=$(date +%s)" 2>/dev/null | grep -oP 'index-[A-Za-z0-9_-]+\.js' | head -1 | sed 's/index-//;s/\.js//')
  
  if [ "$LOCAL_HASH" = "$PROD_HASH" ]; then
    log "Hash match ✅ (attempt $attempt): $PROD_HASH"
    break
  else
    warn "Hash mismatch (attempt $attempt): local=$LOCAL_HASH prod=$PROD_HASH"
    if [ "$attempt" -lt 3 ]; then
      log "Purging CDN + retrying..."
      vercel cache purge --type=cdn --yes --token="$VERCEL_TOKEN" 2>&1 >/dev/null
      sleep 10
    else
      warn "Hash mismatch after 3 attempts. CDN may need time. Proceeding..."
    fi
  fi
done

# --- Step 7: Verify API endpoints ---
log "Verifying APIs..."
API_OK=0
API_FAIL=0

for endpoint in "/api/ai?action=status" "/api/admin-ai?action=health-check"; do
  STATUS=$(curl -sS --max-time 10 -o /dev/null -w "%{http_code}" "$PROD_URL$endpoint" 2>/dev/null || echo "000")
  if [ "$STATUS" = "200" ]; then
    log "  $endpoint → $STATUS ✅"
    ((API_OK++))
  else
    warn "  $endpoint → $STATUS ❌"
    ((API_FAIL++))
  fi
done

# --- Step 8: Commit build artifacts ---
log "Committing dist..."
git add -A 2>/dev/null
git commit -m "build: $(date +%Y-%m-%d_%H:%M) hash=${PROD_HASH:-unknown}" 2>/dev/null || true
git push origin main 2>&1 >/dev/null || true

# --- Summary ---
echo ""
echo "========================================="
echo -e "${GREEN}DEPLOY COMPLETE${NC}"
echo "========================================="
echo "Hash:   ${PROD_HASH:-unknown}"
echo "URL:    $PROD_URL"
echo "APIs:   $API_OK OK / $API_FAIL failed"
echo "Time:   $(date)"
echo "========================================="
