#!/usr/bin/env bash
# Local fallback deploy (prefer GitHub Action CF Pages Deploy to avoid VPS OOM).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
: "${CLOUDFLARE_API_TOKEN:?set CLOUDFLARE_API_TOKEN}"
: "${CLOUDFLARE_ACCOUNT_ID:=abbbf213ba5b4fb9d613480b5f464002}"
export CLOUDFLARE_ACCOUNT_ID
test -f dist/index.html || { echo "missing dist/ — run vite build first (use GHA)"; exit 1; }
test -d functions || { echo "missing functions/"; exit 1; }
cp -f public/_headers dist/_headers 2>/dev/null || true
cp -f public/_routes.json dist/_routes.json 2>/dev/null || true
cp -f public/_redirects dist/_redirects 2>/dev/null || true
npx --yes wrangler@4.113.0 pages deploy dist \
  --project-name deutschup \
  --branch "${PAGES_BRANCH:-main}" \
  --commit-dirty=true
