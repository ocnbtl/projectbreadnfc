#!/usr/bin/env bash
set -Eeuo pipefail

usage() {
  cat <<'EOF'
Usage: restore-drill.sh --run

This script is intentionally restricted to a local, isolated PostgreSQL
database whose name ends in _restore_drill. It never restores cluster globals.

Required:
  SCANTAP_RESTORE_ARCHIVE=<encrypted .age archive>
  SCANTAP_RESTORE_AGE_IDENTITY=<age private identity file>
  SCANTAP_RESTORE_DRILL_CONFIRM="RESTORE SCANTAP DRILL"
  PGHOST=127.0.0.1|localhost|::1
  PGPORT=<local drill port>
  PGUSER=<drill administrator>
  PGDATABASE=<name ending in _restore_drill>
  PGPASSFILE=<mode 0600 or 0400 password file>

Optional:
  SCANTAP_RESTORE_STORAGE_DIR=<empty path containing restore-drill>
EOF
}

[[ "${1:-}" == "--run" && $# -eq 1 ]] || {
  usage >&2
  exit 2
}

archive="${SCANTAP_RESTORE_ARCHIVE:-}"
identity="${SCANTAP_RESTORE_AGE_IDENTITY:-}"
storage_target="${SCANTAP_RESTORE_STORAGE_DIR:-}"

[[ "${SCANTAP_RESTORE_DRILL_CONFIRM:-}" == "RESTORE SCANTAP DRILL" ]] || {
  echo "Set SCANTAP_RESTORE_DRILL_CONFIRM exactly to RESTORE SCANTAP DRILL." >&2
  exit 1
}
[[ -f "$archive" && ! -L "$archive" ]] || {
  echo "SCANTAP_RESTORE_ARCHIVE must be an existing regular file." >&2
  exit 1
}
[[ -f "$identity" && ! -L "$identity" ]] || {
  echo "SCANTAP_RESTORE_AGE_IDENTITY must be an existing regular file." >&2
  exit 1
}
[[ "${PGHOST:-}" == "127.0.0.1" || "${PGHOST:-}" == "localhost" || "${PGHOST:-}" == "::1" ]] || {
  echo "Restore drills may target localhost only." >&2
  exit 1
}
[[ "${PGDATABASE:-}" =~ ^[a-zA-Z0-9_]+_restore_drill$ ]] || {
  echo "PGDATABASE must end in _restore_drill." >&2
  exit 1
}
[[ -n "${PGPORT:-}" && -n "${PGUSER:-}" ]] || {
  echo "PGPORT and PGUSER are required." >&2
  exit 1
}
[[ -f "${PGPASSFILE:-}" && ! -L "${PGPASSFILE:-}" ]] || {
  echo "PGPASSFILE must reference a regular, non-symlink password file." >&2
  exit 1
}
passfile_mode="$(stat -c '%a' "$PGPASSFILE")"
[[ "$passfile_mode" == "600" || "$passfile_mode" == "400" ]] || {
  echo "PGPASSFILE must have mode 0600 or 0400; found $passfile_mode." >&2
  exit 1
}

for command_name in age find install mktemp pg_restore psql sha256sum stat tar; do
  command -v "$command_name" >/dev/null 2>&1 || {
    echo "Required command is unavailable: $command_name" >&2
    exit 1
  }
done

if [[ -n "$storage_target" ]]; then
  [[ "$storage_target" == *restore-drill* && "$storage_target" != "/" && ! -L "$storage_target" ]] || {
    echo "SCANTAP_RESTORE_STORAGE_DIR must contain restore-drill, must not be /, and must not be a symlink." >&2
    exit 1
  }
  install -d -m 0700 -- "$storage_target"
  [[ -z "$(find "$storage_target" -mindepth 1 -maxdepth 1 -print -quit)" ]] || {
    echo "The restore-drill storage directory must be empty." >&2
    exit 1
  }
fi

umask 077
work_dir="$(mktemp -d)"
cleanup() {
  local exit_code=$?
  trap - EXIT
  case "$work_dir" in
    "${TMPDIR:-/tmp}"/*|/tmp/*) rm -rf -- "$work_dir" ;;
    *) echo "Refusing to remove unexpected temporary path: $work_dir" >&2; exit_code=1 ;;
  esac
  exit "$exit_code"
}
trap cleanup EXIT

plain_bundle="$work_dir/backup.tar.gz"
age --decrypt --identity "$identity" --output "$plain_bundle" "$archive"

while IFS= read -r entry; do
  normalized="${entry#./}"
  case "$normalized" in
    ""|/*|..|../*|*/../*|*/..) echo "Unsafe archive entry detected." >&2; exit 1 ;;
  esac
done < <(tar -tzf "$plain_bundle")

extract_dir="$work_dir/extracted"
mkdir -m 0700 "$extract_dir"
tar -xzf "$plain_bundle" -C "$extract_dir"

for expected in metadata.txt checksums.sha256 database.dump globals.sql migrations.tsv; do
  [[ -f "$extract_dir/$expected" ]] || {
    echo "Backup is missing required file: $expected" >&2
    exit 1
  }
done
(cd -- "$extract_dir" && sha256sum -c checksums.sha256)

actual_database="$(psql -X -v ON_ERROR_STOP=1 -Atqc 'select current_database()')"
[[ "$actual_database" == "$PGDATABASE" ]] || {
  echo "Connected database does not match PGDATABASE." >&2
  exit 1
}

server_version="$(psql -X -v ON_ERROR_STOP=1 -Atqc "select current_setting('server_version_num')::int")"
((server_version >= 170000 && server_version < 180000)) || {
  echo "Restore drill requires PostgreSQL 17 to match the production target." >&2
  exit 1
}

pg_restore \
  --exit-on-error \
  --single-transaction \
  --clean \
  --if-exists \
  --no-owner \
  --dbname "$PGDATABASE" \
  "$extract_dir/database.dump"

psql -X -v ON_ERROR_STOP=1 <<'SQL'
do $$
begin
  if to_regclass('public.organizations') is null then
    raise exception 'Expected Scantap organizations table is absent after restore.';
  end if;
  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and not c.relrowsecurity
      and c.relname not in ('spatial_ref_sys')
  ) then
    raise exception 'One or more public application tables lack RLS after restore.';
  end if;
end
$$;
SQL

if [[ -n "$storage_target" && -f "$extract_dir/storage.tar.gz" ]]; then
  while IFS= read -r entry; do
    normalized="${entry#./}"
    case "$normalized" in
      ""|/*|..|../*|*/../*|*/..) echo "Unsafe Storage archive entry detected." >&2; exit 1 ;;
    esac
  done < <(tar -tzf "$extract_dir/storage.tar.gz")
  tar -xzf "$extract_dir/storage.tar.gz" -C "$storage_target"
fi

echo "Restore drill completed against the isolated local database: $PGDATABASE"
echo "Database archive and RLS baseline were verified. Application login and tenant-denial tests remain separate gates."
