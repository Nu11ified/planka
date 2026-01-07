#!/bin/bash

set -eu

# Load secrets from files if corresponding *__FILE environment variables are set.
# Only the first line of each file is read (stripping carriage returns and newlines).

read_secret() {
  local file="$1"
  head -n 1 "$file" | tr -d '\r\n'
}

load_secret() {
  local envar="$1"
  local file="${envar}__FILE"
  if [[ -z "${!envar:-}" && -e "${!file:-}" ]]; then
    export "$envar"="$(read_secret "${!file}")"
  fi
}

if [[ -n "${DATABASE_URL}" ]]; then
  if [[ -z "${DATABASE_PASSWORD:-}" && -e "${DATABASE_PASSWORD__FILE:-}" ]]; then
    DATABASE_PASSWORD="$(read_secret "${DATABASE_PASSWORD__FILE}")"
    export DATABASE_URL="${DATABASE_URL/\$\{DATABASE_PASSWORD\}/${DATABASE_PASSWORD}}"
  fi
fi

load_secret SECRET_KEY
load_secret DEFAULT_ADMIN_PASSWORD
load_secret S3_SECRET_ACCESS_KEY
load_secret OIDC_CLIENT_SECRET
load_secret SMTP_PASSWORD

export NODE_ENV=production

echo "Starting Planka..."

# Wait for database to be ready
echo "Waiting for database..."
MAX_RETRIES=30
RETRY_COUNT=0

until node -e "
const knex = require('knex')(require('./db/knexfile'));
knex.raw('SELECT 1').then(() => {
  console.log('Database is ready');
  knex.destroy();
  process.exit(0);
}).catch((err) => {
  console.log('Database not ready:', err.message);
  knex.destroy();
  process.exit(1);
});
" 2>/dev/null; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "ERROR: Database not available after $MAX_RETRIES attempts"
    exit 1
  fi
  echo "Waiting for database... (attempt $RETRY_COUNT/$MAX_RETRIES)"
  sleep 2
done

echo "Running database initialization..."
node db/init.js
echo "Database initialization complete."

echo "Starting application..."
exec node app.js --prod
