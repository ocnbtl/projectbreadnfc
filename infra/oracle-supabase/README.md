# Oracle Supabase infrastructure

This directory contains Scantap-owned operational helpers. It intentionally does not vendor Supabase's Docker Compose files or hold deployment secrets.

- Use the official, pinned `self-hosted/vX.Y.Z` Docker release on the Oracle VM.
- Keep its generated `.env` only on the server with mode `0600`.
- Use [the operations runbook](../../docs/operations/ORACLE_SUPABASE_RUNBOOK.md) for provisioning, networking, storage, TLS, backups, and release gates.
- Use [the failure matrix](../../docs/operations/ORACLE_SUPABASE_FAILURE_MATRIX.md) whenever a precondition is unclear.
- Use [the domain and email cutover](../../docs/operations/DOMAIN_EMAIL_CUTOVER.md) after `scantapreviews.com` is purchased.
- Use [the capacity-day checklist](../../docs/operations/CAPACITY_DAY_CHECKLIST.md) as the short execution order after the first successful A1 request.

## Migration runner

`apply-migrations.sh` applies this repository's timestamped SQL migrations to the running `supabase-db` container. It records a SHA-256 checksum and stops on drift.

Read-only check:

```bash
SCANTAP_DB_CONTAINER=supabase-db bash ./infra/oracle-supabase/apply-migrations.sh --check
```

Explicit apply:

```bash
export SCANTAP_DB_CONTAINER=supabase-db
export SCANTAP_MIGRATION_CONFIRM=YES
bash ./infra/oracle-supabase/apply-migrations.sh --apply
unset SCANTAP_MIGRATION_CONFIRM
```

Optional variables:

- `SCANTAP_DB_CONTAINER` defaults to `supabase-db`.
- `SCANTAP_DB_NAME` defaults to `postgres`.
- `SCANTAP_DB_USER` defaults to `postgres`.

The runner is idempotent for unchanged migrations. If an applied migration's checksum changes, it refuses to continue. Correct the database/source provenance or add a new forward migration; never overwrite recorded history.

The runner performs DDL and must be executed only against the intended Scantap instance after a backup and static contract check. It never resets a database, deletes a volume, or prints credentials.

## Encrypted backup and restore drill

`backup.sh` is dry-run by default. With its exact confirmation, a public age recipient, and `--apply`, it pauses the write-facing Compose services, captures database/Storage recovery material, encrypts the bundle, and restarts the services. `--upload` additionally requires a configured rclone destination outside the VM.

`restore-drill.sh` is destructive only to an explicitly named local database ending in `_restore_drill`. It decrypts and verifies the archive, restores the custom-format database dump, and checks the Scantap schema/RLS baseline. It never accepts a remote database host and never applies cluster globals automatically.

The templates under `systemd/` schedule a nightly upload only after the manual backup and separate-machine restore drill have passed. Do not put the age private identity on the Oracle VM.

`runtime-overrides.env.example` contains only the intended public URL and blank SMTP override contract. It is not a complete Supabase environment and must not replace the official generated `.env`.
