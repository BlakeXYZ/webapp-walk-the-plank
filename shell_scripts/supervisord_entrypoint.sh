#!/usr/bin/env sh
set -e

# Default command fallback
if [ $# -eq 0 ] || [ "${1#-}" != "$1" ]; then
  set -- supervisord "$@"
fi

# Only run the migration if we're starting supervisord
# installing postgresql-client in Dockerfile to use pg_isready to check if the database is ready
if [ "$1" = "supervisord" ]; then
  echo "Waiting for Postgres to be ready..."
  until pg_isready -h "${DB_HOST:-db}" -p "${DB_PORT:-5432}" -U "${POSTGRES_USER:-postgres}"; do
    sleep 2
  done

  echo "Postgres is ready. Applying migrations..."
  flask db upgrade
fi

# Run the final command
exec "$@"
