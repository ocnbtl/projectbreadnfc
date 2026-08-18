#!/usr/bin/env bash
set -Eeuo pipefail

mode="--check"
if [ "$#" -gt 0 ]; then
  mode="$1"
  shift
fi

if [ "$mode" != "--check" ] && [ "$mode" != "--apply" ]; then
  echo "Usage: apply-migrations.sh [--check|--apply] [migrations-directory]" >&2
  exit 64
fi

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repository_root=$(CDPATH= cd -- "$script_dir/../.." && pwd)
migrations_dir="$repository_root/supabase/migrations"
if [ "$#" -gt 0 ]; then
  migrations_dir="$1"
  shift
fi
if [ "$#" -gt 0 ]; then
  echo "Only one migrations directory may be supplied." >&2
  exit 64
fi

database_container=$(printenv SCANTAP_DB_CONTAINER 2>/dev/null || true)
if [ -z "$database_container" ]; then
  database_container="supabase-db"
fi
database_name=$(printenv SCANTAP_DB_NAME 2>/dev/null || true)
if [ -z "$database_name" ]; then
  database_name="postgres"
fi
database_user=$(printenv SCANTAP_DB_USER 2>/dev/null || true)
if [ -z "$database_user" ]; then
  database_user="postgres"
fi

if [ ! -d "$migrations_dir" ]; then
  echo "Migrations directory not found: $migrations_dir" >&2
  exit 66
fi
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required." >&2
  exit 69
fi
if [ "$(docker inspect -f '{{.State.Running}}' "$database_container" 2>/dev/null || true)" != "true" ]; then
  echo "Database container is not running: $database_container" >&2
  exit 69
fi

lock_path="/tmp/scantap-supabase-migrations.lock"
exec 9>"$lock_path"
if ! flock -n 9; then
  echo "Another Scantap migration process is running." >&2
  exit 75
fi

history_exists=$(docker exec "$database_container" \
  psql -X -U "$database_user" -d "$database_name" -At -v ON_ERROR_STOP=1 \
  -c "select to_regclass('scantap_migrations.schema_migrations') is not null;")

if [ "$mode" = "--apply" ]; then
  migration_confirmation=$(printenv SCANTAP_MIGRATION_CONFIRM 2>/dev/null || true)
  if [ "$migration_confirmation" != "YES" ]; then
    echo "Apply mode requires SCANTAP_MIGRATION_CONFIRM=YES." >&2
    exit 77
  fi

  docker exec "$database_container" \
    psql -X -U "$database_user" -d "$database_name" -v ON_ERROR_STOP=1 \
    -c "create schema if not exists scantap_migrations; create table if not exists scantap_migrations.schema_migrations (version text primary key, filename text not null unique, checksum_sha256 text not null, applied_at timestamptz not null default now()); revoke all on schema scantap_migrations from public, anon, authenticated; revoke all on all tables in schema scantap_migrations from public, anon, authenticated;" \
    >/dev/null
  history_exists="t"
fi

migration_count=0
while IFS= read -r migration_file; do
  migration_count=$((migration_count + 1))
  filename=$(basename -- "$migration_file")

  if ! printf '%s' "$filename" | grep -Eq '^[0-9]{14}_[a-z0-9_]+\.sql$'; then
    echo "Invalid migration filename: $filename" >&2
    exit 65
  fi

  version=$(printf '%s' "$filename" | cut -d_ -f1)
  checksum=$(sha256sum "$migration_file" | awk '{print $1}')

  if [ "$history_exists" != "t" ]; then
    echo "PENDING $filename"
    continue
  fi

  applied_checksum=$(docker exec "$database_container" \
    psql -X -U "$database_user" -d "$database_name" -At -v ON_ERROR_STOP=1 \
    -v migration_version="$version" \
    -c "select checksum_sha256 from scantap_migrations.schema_migrations where version = :'migration_version';")

  if [ -n "$applied_checksum" ]; then
    if [ "$applied_checksum" != "$checksum" ]; then
      echo "CHECKSUM MISMATCH $filename" >&2
      exit 65
    fi
    echo "APPLIED $filename"
    continue
  fi

  if [ "$mode" = "--check" ]; then
    echo "PENDING $filename"
    continue
  fi

  {
    printf 'begin;\n'
    cat "$migration_file"
    printf "\ninsert into scantap_migrations.schema_migrations (version, filename, checksum_sha256) values ('%s', '%s', '%s');\n" \
      "$version" "$filename" "$checksum"
    printf 'commit;\n'
  } | docker exec -i "$database_container" \
    psql -X -U "$database_user" -d "$database_name" -v ON_ERROR_STOP=1 >/dev/null

  echo "APPLIED $filename"
done < <(find "$migrations_dir" -maxdepth 1 -type f -name '*.sql' -print | LC_ALL=C sort)

if [ "$migration_count" -eq 0 ]; then
  echo "No migrations found." >&2
  exit 66
fi
