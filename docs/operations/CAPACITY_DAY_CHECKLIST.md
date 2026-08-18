# Oracle capacity-day checklist

Last reviewed: 2026-08-18

This is the short execution order for the first successful A1 capacity request. The detailed gates and stop conditions remain authoritative in [the runbook](ORACLE_SUPABASE_RUNBOOK.md) and [failure matrix](ORACLE_SUPABASE_FAILURE_MATRIX.md).

## 1. Freeze the input

- Record the exact approved Git commit.
- Require GitHub CI to pass for that commit.
- Confirm there are no production credentials in the repository or terminal transcript.
- Record that `scantapreviews.com` is still pending unless registrar ownership has separately been verified.

## 2. Verify the one Oracle resource

- Confirm exactly one active Scantap instance.
- Confirm `VM.Standard.A1.Flex`, ARM64, 2 OCPUs, 12 GB RAM, home region, and 100 GB encrypted Always Free boot volume.
- Record the instance identity and IP outside source control.
- Stop before installation if the shape, cost, duplicate count, region, or architecture differs.

## 3. Choose storage without guessing

- Recalculate total tenancy boot/block allocation.
- Create the optional 100 GB volume only if Oracle explicitly shows it remains free and the cost estimate is zero.
- If anything is ambiguous, use the encrypted boot-volume fallback.
- Never format a disk until attachment identity, size, signatures, mount state, and root-disk exclusion all pass.
- Reboot and verify the filesystem UUID before storing data on an optional volume.

## 4. Harden the host

- Patch Ubuntu and reboot when required.
- Install Docker Engine and Compose from Docker's signed repository.
- Create the restricted deployment account and root-owned `/srv/scantap` hierarchy.
- Restrict SSH to the verified administrator IPv4 `/32` in OCI and the host firewall.
- Keep 80/443 closed and 5432/6543/8000/Studio unreachable publicly.
- Enable bounded journald/container logs and disk alerts.

## 5. Pin and start Supabase privately

- Read the current self-hosted breaking-change changelog.
- Select and record one stable `self-hosted/vX.Y.Z` tag and source commit.
- Verify every enabled image supports ARM64.
- Generate all secrets on the server and replace every default before start.
- Keep the root-owned `.env` at mode `0600`.
- Use the base stack without optional Logs & Analytics.
- Expect Envoy (`api-gw`) in current releases; keep it private and prepare the matching official Caddy override.
- Start locally and require every base service to become healthy before opening ingress.

## 6. Apply and prove the database contract

From the exact repository revision:

```bash
pnpm verify:supabase
SCANTAP_DB_CONTAINER=supabase-db bash infra/oracle-supabase/apply-migrations.sh --check
export SCANTAP_MIGRATION_CONFIRM=YES
SCANTAP_DB_CONTAINER=supabase-db bash infra/oracle-supabase/apply-migrations.sh --apply
unset SCANTAP_MIGRATION_CONFIRM
```

- Confirm PostgreSQL 17.
- Confirm migration names/checksums.
- Run the temporary live RLS denial suite against the empty pilot database.
- Create the exact owner Auth user, run owner bootstrap dry-run, then use its explicit apply confirmation.
- Do not import real data after any failed denial or bootstrap check.

## 7. Prove recovery before customer data

- Configure an age public recipient whose private identity stays off the VM.
- Configure a root-only rclone destination outside the VM.
- Run the backup script dry-run, then one encrypted `--apply --upload` run.
- Download that backup to a separate trusted machine.
- Restore to an isolated PostgreSQL 17 Supabase-compatible database ending in `_restore_drill`.
- Repeat login, tenant-denial, and Storage checks against the restored stack.
- Enable the nightly systemd timer only after the manual backup and restore drill pass.

## 8. Stop here if the domain is still unpurchased

Without verified ownership of `scantapreviews.com`, the automation may finish private local health, migrations, owner setup, and recovery work. It must not:

- publish the Oracle API over plain HTTP or an IP address;
- request production certificates for an unowned name;
- set Vercel production Supabase secrets;
- register production Google callback URLs;
- advertise `contact@scantapreviews.com`;
- invite external users.

The healthy private stack can remain stopped when not being tested, subject to Oracle's documented idle-resource policy. Keep the off-server backup and exact release record.

## 9. Complete DNS, TLS, SMTP, and Vercel after purchase

- Follow [the domain and email cutover](DOMAIN_EMAIL_CUTOVER.md).
- Publish only Caddy on 80/443; proxy to private Envoy.
- Verify Auth health and unauthenticated boundaries over valid HTTPS.
- Verify contact mailbox delivery and production Auth SMTP.
- Set Vercel environment variables without exposing server secrets.
- Redeploy the exact CI-passing revision.
- Run `pnpm verify:deployment -- --full`, then browser login, role denial, OAuth callback, Storage, and redacted-log checks.

## 10. Pilot admission decision

The first external pilot remains blocked until all are true: HTTPS, SMTP, off-server encrypted backup, successful restore drill, live RLS denials, owner access, internal-port closure, and exact-deployment verification. A running VM or green build alone is not admission evidence.
