#!/usr/bin/env bash
# Local fallback deploy (prefer GitHub Action CF Pages Deploy to avoid VPS OOM).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

: "${CLOUDFLARE_API_TOKEN:?set CLOUDFLARE_API_TOKEN}"
: "${CLOUDFLARE_ACCOUNT_ID:=abbbf213ba5b4fb9d613480b5f464002}"
export CLOUDFLARE_ACCOUNT_ID

PROJ="deutschup"
PAGES_BRANCH="${PAGES_BRANCH:-main}"

echo "=== 1. Copying Cloudflare Pages Config Files ==="
cp -f public/_headers dist/_headers 2>/dev/null || true
cp -f public/_routes.json dist/_routes.json 2>/dev/null || true
cp -f public/_redirects dist/_redirects 2>/dev/null || true

echo "=== 2. Build SHA Verification ==="
# Get local Git commit SHA
COMMIT_SHA=$(git rev-parse HEAD 2>/dev/null || echo "unknown-sha")
echo "$COMMIT_SHA" > dist/build-sha.txt
echo "Saved build SHA $COMMIT_SHA to dist/build-sha.txt"

# Verify the saved SHA
SAVED_SHA=$(cat dist/build-sha.txt | tr -d '\n\r ')
if [ "$SAVED_SHA" != "$COMMIT_SHA" ]; then
  echo "Error: Saved Build SHA ($SAVED_SHA) does not match expected Git SHA ($COMMIT_SHA)!"
  exit 1
fi
echo "Build SHA verification PASSED."

echo "=== 3. Production Bundle Validation ==="
# Verify index.html exists and is not empty
if [ ! -s dist/index.html ]; then
  echo "Error: dist/index.html is missing or empty!"
  exit 1
fi

# Verify assets directory exists
if [ ! -d dist/assets ]; then
  echo "Error: dist/assets directory is missing!"
  exit 1
fi

# Verify we have compiled JS and CSS files
JS_FILES=$(find dist/assets -name "*.js" | wc -l)
CSS_FILES=$(find dist/assets -name "*.css" | wc -l)
echo "Found $JS_FILES JS files and $CSS_FILES CSS files in dist/assets/"

if [ "$JS_FILES" -eq 0 ]; then
  echo "Error: No JavaScript files found in dist/assets/!"
  exit 1
fi
if [ "$CSS_FILES" -eq 0 ]; then
  echo "Error: No CSS files found in dist/assets/!"
  exit 1
fi

# Verify index.html contains references to assets
if ! grep -q "assets/" dist/index.html; then
  echo "Error: dist/index.html does not contain references to assets/"
  exit 1
fi

# Verify Cloudflare Pages config files exist in dist/
for f in _headers _redirects _routes.json; do
  if [ ! -f "dist/$f" ]; then
    echo "Error: Cloudflare config file dist/$f is missing!"
    exit 1
  fi
  echo "Cloudflare config file dist/$f exists."
done

# Verify Cloudflare Pages functions exist
if [ ! -d functions ]; then
  echo "Error: Cloudflare Functions directory (functions/) is missing!"
  exit 1
fi
if [ ! -f functions/api/[[path]].ts ]; then
  echo "Error: functions/api/[[path]].ts is missing!"
  exit 1
fi
if [ ! -f functions/lib/vercel-adapter.ts ]; then
  echo "Error: functions/lib/vercel-adapter.ts is missing!"
  exit 1
fi

echo "=== Production Bundle Validation PASSED ==="

echo "=== 4. Set Production Branch to main via Cloudflare API ==="
# Make the API call to update the production branch to main
curl --request PATCH \
  "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${PROJ}" \
  --header "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{"production_branch": "main"}' \
  --silent --show-error --fail-with-body -o /tmp/cf_api_res.json

# Check response and verify production_branch is set to main
if ! grep -q '"production_branch":"main"' /tmp/cf_api_res.json; then
  echo "Error: Failed to set production branch to 'main' via API!"
  cat /tmp/cf_api_res.json
  exit 1
fi
echo "Successfully set/verified production branch as 'main' via Cloudflare API ✅"

echo "=== 5. Deploying to Cloudflare Pages ==="
npx --yes wrangler@4.113.0 pages deploy dist \
  --project-name "$PROJ" \
  --branch "$PAGES_BRANCH" \
  --commit-dirty=true
