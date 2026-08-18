#!/usr/bin/env bash
set -Eeuo pipefail

usage() {
  cat <<'EOF'
Usage: backup.sh [--apply] [--upload]

Dry-run is the default. --apply creates an encrypted backup. --upload also
copies the encrypted archive and checksum to the configured rclone remote.

Required for --apply:
  SCANTAP_BACKUP_CONFIRM="BACK UP SCANTAP"
  SCANTAP_BACKUP_AGE_RECIPIENT=<public age recipient>

Required for --upload:
  SCANTAP_BACKUP_RCLONE_REMOTE=<remote:path>

Optional:
  SCANTAP_SUPABASE_DIR=/srv/scantap/supabase-project
  SCANTAP_BACKUP_DIR=/srv/scantap/backups
EOF
}

apply=false
upload=false
for argument in "$@"; do
  case "$argument" in
    --apply) apply=true ;;
    --upload) apply=true; upload=true ;;
    --help|-h) usage; exit 0 ;;
    *) echo "Unknown argument: $argument" >&2; usage >&2; exit 2 ;;
  esac
done

project_dir="${SCANTAP_SUPABASE_DIR:-/srv/scantap/supabase-project}"
backup_dir="${SCANTAP_BACKUP_DIR:-/srv/scantap/backups}"
recipient="${SCANTAP_BACKUP_AGE_RECIPIENT:-}"
remote="${SCANTAP_BACKUP_RCLONE_REMOTE:-}"

for command_name in cut date docker flock grep install mktemp sha256sum stat tar tr; do
  command -v "$command_name" >/dev/null 2>&1 || {
    echo "Required command is unavailable: $command_name" >&2
    exit 1
  }
done

[[ -d "$project_dir" ]] || {
  echo "Supabase project directory does not exist: $project_dir" >&2
  exit 1
}
project_dir="$(cd -- "$project_dir" && pwd -P)"
[[ "$project_dir" != "/" && -f "$project_dir/docker-compose.yml" ]] || {
  echo "SCANTAP_SUPABASE_DIR is not a Supabase Docker project." >&2
  exit 1
}

compose() {
  (cd -- "$project_dir" && docker compose "$@")
}

compose config --quiet
db_container="$(compose ps -q db)"
[[ -n "$db_container" ]] || {
  echo "The Supabase database container is not running." >&2
  exit 1
}
db_running="$(docker inspect --format '{{.State.Running}}' "$db_container")"
db_health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}not-configured{{end}}' "$db_container")"
[[ "$db_running" == "true" && ("$db_health" == "healthy" || "$db_health" == "not-configured") ]] || {
  echo "The Supabase database container is not in a healthy running state." >&2
  exit 1
}

env_file="$project_dir/.env"
[[ -f "$env_file" && ! -L "$env_file" ]] || {
  echo "The root-owned Supabase .env file is missing or is a symbolic link." >&2
  exit 1
}
env_mode="$(stat -c '%a' "$env_file")"
[[ "$env_mode" == "600" || "$env_mode" == "400" ]] || {
  echo "The Supabase .env file must have mode 0600 or 0400; found $env_mode." >&2
  exit 1
}

if ! $apply; then
  echo "Dry run passed. The stack, database container, and secret-file permissions are valid."
  echo "No service was stopped and no backup was created."
  echo "Re-run with --apply and the documented confirmation variables."
  exit 0
fi

[[ "${SCANTAP_BACKUP_CONFIRM:-}" == "BACK UP SCANTAP" ]] || {
  echo "Set SCANTAP_BACKUP_CONFIRM exactly to BACK UP SCANTAP before --apply." >&2
  exit 1
}
[[ -n "$recipient" && "$recipient" != *$'\n'* ]] || {
  echo "SCANTAP_BACKUP_AGE_RECIPIENT is required and must be one line." >&2
  exit 1
}
command -v age >/dev/null 2>&1 || {
  echo "age is required to create an encrypted backup." >&2
  exit 1
}

if $upload; then
  [[ -n "$remote" && "$remote" == *:* && "$remote" != *$'\n'* ]] || {
    echo "SCANTAP_BACKUP_RCLONE_REMOTE must be a one-line rclone remote:path." >&2
    exit 1
  }
  command -v rclone >/dev/null 2>&1 || {
    echo "rclone is required for --upload." >&2
    exit 1
  }
fi

if [[ -L "$backup_dir" ]]; then
  echo "The backup directory must not be a symbolic link." >&2
  exit 1
fi
install -d -m 0700 -- "$backup_dir"
backup_dir="$(cd -- "$backup_dir" && pwd -P)"
[[ "$backup_dir" != "/" ]] || {
  echo "Refusing to use the filesystem root as the backup directory." >&2
  exit 1
}

exec 9>"$backup_dir/.backup.lock"
flock -n 9 || {
  echo "Another Scantap backup is already running." >&2
  exit 1
}

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
work_dir="$(mktemp -d "$backup_dir/.scantap-backup.XXXXXX")"
partial_archive="$backup_dir/.scantap-$timestamp.tar.gz.age.partial"
plain_bundle=""
paused_services=()

restart_paused_services() {
  if ((${#paused_services[@]} > 0)); then
    compose start "${paused_services[@]}" >/dev/null
    paused_services=()
  fi
}

cleanup() {
  local exit_code=$?
  trap - EXIT
  if ((${#paused_services[@]} > 0)); then
    if ! restart_paused_services; then
      echo "WARNING: one or more paused Supabase services did not restart." >&2
      exit_code=1
    fi
  fi
  case "$work_dir" in
    "$backup_dir"/.scantap-backup.*) rm -rf -- "$work_dir" ;;
    *) echo "Refusing to remove unexpected temporary path: $work_dir" >&2; exit_code=1 ;;
  esac
  if [[ -f "$partial_archive" && "$partial_archive" == "$backup_dir"/.scantap-*.partial ]]; then
    rm -f -- "$partial_archive"
  fi
  if [[ -n "$plain_bundle" && -f "$plain_bundle" && "$plain_bundle" == "$backup_dir"/.scantap-*.tar.gz ]]; then
    rm -f -- "$plain_bundle"
  fi
  exit "$exit_code"
}
trap cleanup EXIT

mapfile -t running_services < <(compose ps --status running --services)
for service in "${running_services[@]}"; do
  [[ "$service" == "db" ]] && continue
  compose stop "$service" >/dev/null
  paused_services+=("$service")
done

database_image="$(docker inspect --format '{{.Config.Image}}' "$db_container")"
postgres_version="$(docker exec "$db_container" psql -h localhost -U supabase_admin -d postgres -Atqc 'show server_version')"
supabase_release="unknown"
if [[ -f "$project_dir/.supabase-version" ]]; then
  supabase_release="$(tr -d '\r\n' < "$project_dir/.supabase-version")"
elif [[ -f "/srv/scantap/release.txt" ]]; then
  supabase_release="$(tr -d '\r\n' < "/srv/scantap/release.txt")"
fi

docker exec "$db_container" pg_dumpall \
  -h localhost -U supabase_admin --globals-only > "$work_dir/globals.sql"
docker exec "$db_container" pg_dump \
  -h localhost -U supabase_admin -d postgres --format=custom --no-owner \
  > "$work_dir/database.dump"

if docker exec "$db_container" test -r /etc/postgresql-custom/pgsodium_root.key; then
  docker exec "$db_container" cat /etc/postgresql-custom/pgsodium_root.key \
    > "$work_dir/pgsodium_root.key"
  chmod 0600 "$work_dir/pgsodium_root.key"
  pgsodium_key="included"
else
  pgsodium_key="not-present"
fi

pgsodium_enabled="$(docker exec "$db_container" psql -h localhost -U supabase_admin -d postgres -Atqc \
  "select exists (select 1 from pg_extension where extname = 'pgsodium')")"
if [[ "$pgsodium_enabled" == "t" && "$pgsodium_key" != "included" ]]; then
  echo "pgsodium is enabled but its root key was not readable; backup aborted." >&2
  exit 1
fi

if docker exec "$db_container" psql -h localhost -U supabase_admin -d postgres -Atqc \
  "select to_regclass('scantap_migrations.schema_migrations') is not null" | grep -qx t; then
  docker exec "$db_container" psql -h localhost -U supabase_admin -d postgres \
    -At -F $'\t' -c \
    "select version, filename, checksum_sha256, applied_at at time zone 'utc' from scantap_migrations.schema_migrations order by version" \
    > "$work_dir/migrations.tsv"
else
  : > "$work_dir/migrations.tsv"
fi

storage_state="absent"
if [[ -d "$project_dir/volumes/storage" && ! -L "$project_dir/volumes/storage" ]]; then
  tar -C "$project_dir/volumes" -czf "$work_dir/storage.tar.gz" storage
  storage_state="included"
fi

cat > "$work_dir/metadata.txt" <<EOF
format_version=1
created_utc=$timestamp
supabase_release=$supabase_release
database_image=$database_image
postgres_version=$postgres_version
storage=$storage_state
pgsodium_key=$pgsodium_key
EOF

checksum_files=(metadata.txt globals.sql database.dump migrations.tsv)
[[ -f "$work_dir/pgsodium_root.key" ]] && checksum_files+=(pgsodium_root.key)
[[ -f "$work_dir/storage.tar.gz" ]] && checksum_files+=(storage.tar.gz)
(cd -- "$work_dir" && sha256sum "${checksum_files[@]}") > "$work_dir/checksums.sha256"

plain_bundle="$backup_dir/.scantap-$timestamp.tar.gz"
tar -C "$work_dir" -czf "$plain_bundle" .
age --encrypt --recipient "$recipient" --output "$partial_archive" "$plain_bundle"
rm -f -- "$plain_bundle"
plain_bundle=""

archive_name="scantap-$timestamp.tar.gz.age"
archive_path="$backup_dir/$archive_name"
mv -- "$partial_archive" "$archive_path"
archive_hash="$(sha256sum "$archive_path" | cut -d ' ' -f 1)"
checksum_path="$archive_path.sha256"
printf '%s  %s\n' "$archive_hash" "$archive_name" > "$checksum_path"

if $upload; then
  remote="${remote%/}"
  rclone copyto --immutable "$archive_path" "$remote/$archive_name"
  rclone copyto --immutable "$checksum_path" "$remote/$archive_name.sha256"
  rclone lsf "$remote" --files-only --include "$archive_name" | grep -Fxq "$archive_name" || {
    echo "The encrypted archive was not found at the off-server destination." >&2
    exit 1
  }
fi

restart_paused_services
echo "Encrypted backup created: $archive_path"
if $upload; then
  echo "Off-server copy confirmed by filename. Run a restore drill to prove recoverability."
else
  echo "The backup is still on the Oracle VM. Use --upload before treating it as disaster recovery."
fi
