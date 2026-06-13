#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.prod.yml"
ENV_FILE="$ROOT_DIR/.env.production"
BACKUP_DIR="$ROOT_DIR/backups/mysql"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUTPUT="$BACKUP_DIR/kodeye_$TIMESTAMP.sql.gz"

[ -f "$ENV_FILE" ] || { echo ".env.production not found" >&2; exit 1; }
mkdir -p "$BACKUP_DIR"

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T mysql \
  sh -c 'exec mysqldump --single-transaction --routines --triggers -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' \
  | gzip > "$OUTPUT"

test -s "$OUTPUT" || { rm -f "$OUTPUT"; echo "Backup is empty" >&2; exit 1; }
echo "Backup created: $OUTPUT"
