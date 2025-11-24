#!/bin/sh
set -e

# Simple entrypoint that waits for DB, runs migrations and seed, then starts the app.
# It expects DATABASE_URL in the environment.

MAX_RETRIES=30
SLEEP_TIME=2

i=0
until npx prisma migrate deploy; do
  i=$((i+1))
  if [ "$i" -ge "$MAX_RETRIES" ]; then
    echo "Failed to run prisma migrate deploy after $MAX_RETRIES attempts. Exiting."
    exit 1
  fi
  echo "prisma migrate deploy failed, retrying in $SLEEP_TIME seconds... (attempt $i/$MAX_RETRIES)"
  sleep $SLEEP_TIME
done

npx prisma db seed

exec npm run start:prod
