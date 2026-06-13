#!/usr/bin/env sh
set -eu

API_URL="${API_URL:-http://localhost:3001}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"

check() {
  name="$1"
  url="$2"
  curl --fail --silent --show-error "$url" >/dev/null
  printf '[pass] %s\n' "$name"
}

check "API health" "$API_URL/api/health"
check "Public plans" "$API_URL/api/plans?currency=IDR"
check "Frontend" "$FRONTEND_URL"

headers="$(curl --silent --show-error --dump-header - "$API_URL/api/health" --output /dev/null)"
printf '%s' "$headers" | grep -qi '^x-content-type-options:' || {
  echo '[fail] API security headers are missing'
  exit 1
}
echo '[pass] API security headers'

status="$(curl --silent --output /dev/null --write-out '%{http_code}' \
  --header 'content-type: application/json' \
  --data '{"email":"invalid@example.test","password":"invalid-password"}' \
  "$API_URL/api/auth/login")"
[ "$status" = 400 ] || [ "$status" = 401 ] || {
  echo "[fail] Invalid login returned $status"
  exit 1
}
echo '[pass] Invalid login rejected'
