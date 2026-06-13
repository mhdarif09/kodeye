#!/usr/bin/env sh
set -eu

LANDING_URL="${LANDING_URL:-https://kodeye.net}"
WWW_URL="${WWW_URL:-https://www.kodeye.net}"
APP_URL="${APP_URL:-https://app.kodeye.net}"
API_HEALTH_URL="${API_HEALTH_URL:-https://backend.kodeye.net/api/health}"

check() {
  name="$1"
  url="$2"
  curl --fail --silent --show-error --location --proto '=https' --tlsv1.2 "$url" >/dev/null
  printf '[pass] %s\n' "$name"
}

check "Landing page" "$LANDING_URL"
check "www redirect" "$WWW_URL"
check "App" "$APP_URL"
check "API health" "$API_HEALTH_URL"
