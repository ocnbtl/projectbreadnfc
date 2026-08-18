# Oracle Supabase operations runbook

Last reviewed: 2026-08-18
Scope: the first Scantap private-pilot backend

## Purpose

This runbook defines the authorized path from Oracle capacity becoming available to a private, verified self-hosted Supabase deployment. It is deliberately fail-closed: capacity availability permits the next checks, not automatic acceptance of charges, broad network access, destructive disk operations, or customer onboarding.

The public Next.js application remains on Vercel. Oracle hosts the database, Auth, REST API, Realtime, and optional Storage services. The intended origins are `https://scantapreviews.com` and `https://api.scantapreviews.com`. The domain has not been purchased, so DNS, public TLS, OAuth callback, and production email steps remain blocked until ownership is verified.

## Target resource

| Resource | Target | Hard limit |
| --- | --- | --- |
| Compute | `VM.Standard.A1.Flex`, ARM64 | 2 OCPUs and 12 GB RAM unless a later approved plan changes it |
| Region | Oracle tenancy home region | Do not create Always Free storage outside the home region |
| Boot disk | 100 GB, encrypted | Must be shown as Always Free-eligible |
| Optional data disk | 100 GB block volume | Create only if the combined allocation remains free and the Console confirms eligibility |
| Public ingress | HTTPS 443; HTTP 80 for certificate issuance/redirect | Never publish database, pooler, Studio, or gateway ports directly |
| Administrative ingress | SSH 22 from one current administrator IPv4 `/32` | Never use `0.0.0.0/0` for SSH |
| Database | Supabase-supported PostgreSQL 17 | Pin the self-hosted Supabase release and image set |

Supabase currently recommends at least 8 GB RAM and 80 GB SSD for this workload. Optional Logs & Analytics remain disabled during the pilot because they increase resource use.

## Phase 1 — acquire capacity

1. Search all availability domains in the home region for the exact A1 shape.
2. Before submitting, confirm the summary still shows the intended OCPUs, RAM, encrypted boot size, and Always Free eligibility.
3. Submit exactly one instance request.
4. Treat `Out of host capacity` as a retryable result. Do not create a paid shape as a fallback.
5. After a successful response, list instances and confirm there is exactly one active Scantap production instance. Stop if a duplicate exists.

Success evidence:

- Instance OCID and display name recorded outside source control.
- Shape, OCPUs, memory, architecture, availability domain, and lifecycle state captured.
- No second instance or paid resource created.

## Phase 2 — pre-bootstrap gates

Do not install or format anything until all gates pass.

### Identity and architecture

- The instance is `RUNNING`.
- The guest architecture reports `aarch64`.
- The expected SSH public key is present.
- The instance and boot volume are in the home region.
- The current Supabase self-hosted stable release supports ARM64 for every enabled image.
- The exact release tag is recorded in `/srv/scantap/release.txt`; do not deploy from an unpinned `master` checkout.

### Network

- The subnet has an internet gateway and a route for public egress.
- The instance has one expected public IP.
- OCI network rules and the host firewall both allow SSH only from the current administrator IPv4 `/32`.
- Ports 80 and 443 remain closed until a reverse proxy is ready.
- Ports 5432, 6543, and 8000 are not open in OCI and are not bound to a public host interface. The same applies to Supabase Studio.
- No new public load balancer, NAT gateway, or reserved address is created without a separate free-eligibility check.

### Storage decision gate

Oracle currently documents 200 GB total of Always Free boot and block storage combined in the home region. The Console's current eligibility and tenancy usage are authoritative.

1. Confirm the actual boot-volume size and all other boot/block allocations in the tenancy.
2. Confirm that adding the optional 100 GB volume remains within the documented free total.
3. Confirm the creation screen labels the volume Always Free-eligible and shows no estimated charge.
4. If any answer is unknown, do not create the volume. Use the boot-volume fallback.
5. If a volume is created, attach it, then identify it using OCI attachment metadata and `lsblk`.
6. Before formatting, verify all of the following:
   - it is not the root disk or a root-disk partition;
   - it is not mounted;
   - `blkid` and `wipefs -n` show no filesystem or partition signatures;
   - its size and attachment identity match the newly created volume.
7. Format only the explicit verified device, mount it by filesystem UUID at `/srv/scantap`, and add an `/etc/fstab` entry with `nofail`.
8. Reboot once and confirm the same UUID mounts successfully before storing database data there.

Boot-volume fallback:

- Create `/srv/scantap` on the encrypted boot filesystem.
- Record `storage_mode=boot-volume` in the non-secret deployment audit.
- Begin disk alerts at 70% use; require cleanup or expansion planning at 80%; enter maintenance before 90%.
- Do not enable optional analytics services or retain unbounded container logs.

A separate volume is not a backup. Both storage layouts still require off-server recovery copies.

## Host bootstrap

Run host changes only after the gates above pass.

1. Apply Ubuntu security updates and reboot if required.
2. Install Docker Engine and Docker Compose from Docker's signed Ubuntu repository.
3. Confirm Docker starts at boot and `docker compose version` succeeds.
4. Create a dedicated non-login deployment account and a root-owned `/srv/scantap` hierarchy with least-privilege group access.
5. Configure log rotation and persistent journal limits.
6. Configure the host firewall before opening OCI ingress.
7. Keep unattended security updates enabled, but schedule application image upgrades through the controlled procedure below.

Do not use a curl-to-shell installer without first pinning and reviewing its source or verifying the official vendor path.

## Supabase deployment

1. Read the current self-hosted changelog, then fetch the official Docker configuration at a stable `self-hosted/vX.Y.Z` tag.
2. Record the tag and source commit. The versions in that release are tested together; do not independently chase latest container tags.
3. Start with the base service set. Do not enable optional Logs & Analytics during the pilot.
4. Generate every password, API key, JWT secret, encryption key, and dashboard credential on the server.
5. Store secrets in the server deployment `.env`, owned by root with mode `0600`. Never print it into an audit log, terminal transcript, Git file, screenshot, or Codex message.
6. Replace every example/default credential before first start.
7. Configure:
   - `SUPABASE_PUBLIC_URL=https://api.scantapreviews.com`
   - `API_EXTERNAL_URL=https://api.scantapreviews.com/auth/v1`
   - `SITE_URL=https://scantapreviews.com`
   - the exact approved redirect allowlist
   - production SMTP before external users are invited
8. Current stable self-hosted releases use Envoy (`api-gw`) as the default gateway. Do not assume the older `kong` service name. Keep Envoy on the private Docker network and place the official Caddy override in front of it. If a pinned release deliberately opts back into Kong, record that exception and verify the matching proxy configuration.
9. Point DNS to the expected public IP, open 80/443, obtain a valid certificate, and verify WebSocket proxying.
10. Keep Studio behind private access or an SSH tunnel even though it also has basic authentication.

If DNS is not ready, the stack may be health-checked locally, but it is not production-ready and Vercel must not be pointed at an IP-based HTTP endpoint.

## Database migrations

Run the repository contract check before any database mutation:

```powershell
pnpm verify:supabase
```

Then copy or check out the exact approved repository revision on the server and apply migrations with [the tracked migration runner](../../infra/oracle-supabase/apply-migrations.sh). The runner:

- validates timestamped filenames;
- records a SHA-256 checksum for every applied migration;
- refuses to continue if an applied filename's checksum changes;
- uses `ON_ERROR_STOP` and one transaction per migration;
- never targets a database unless its container is explicitly selected.

After migration:

1. Confirm PostgreSQL reports major version 17.
2. Confirm every public table has RLS enabled.
3. Confirm browser roles cannot select `integration_credentials`, platform service tables, or platform portfolio views.
4. Confirm two isolated test users cannot read each other's organizations, locations, reviews, or devices.
5. Confirm a responder cannot approve a pending draft or update another person's draft.
6. Confirm an organization administrator cannot acquire `platform_staff` access.
7. Confirm the service key is accepted only by server-side code.

Run the repository live denial test only against the intended empty staging/pilot database. It creates two temporary Auth users and tenant records, performs cross-tenant and privilege-escalation probes, then removes them:

```powershell
$env:SCANTAP_RLS_TEST_EXPECTED_ORIGIN = "https://api.scantapreviews.com"
$env:SCANTAP_RLS_TEST_CONFIRM = "RUN TEMPORARY RLS TESTS"
$env:SCANTAP_RLS_TEST_ALLOW_REMOTE = "YES"
pnpm test:rls:live -- --run
```

The test also requires the Supabase URL, publishable key, and server secret in the trusted shell. Never run it against a database whose temporary record creation would violate an operational policy.

No real data is imported until the live denied-path tests pass.

## Initial platform owner

1. Create the exact owner email in Supabase Auth through the private administration path.
2. On a trusted machine, provide `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SCANTAP_OWNER_EMAIL`, and `SCANTAP_OWNER_DISPLAY_NAME` without committing them.
3. Run a dry run:

```powershell
pnpm bootstrap:owner
```

4. Review that exactly one existing Auth user matched.
5. Apply only with both confirmations:

```powershell
$env:SCANTAP_OWNER_BOOTSTRAP_CONFIRM = "YES"
pnpm bootstrap:owner -- --apply
```

6. Remove the temporary environment values from the shell and verify the owner can reach `/control`.
7. Use the application owner workflow for all later platform staff changes.

The script does not create Auth users and refuses to apply over plain HTTP unless the target is localhost.

## Backups and recovery gate

The repository includes a fail-closed backup script, an isolated restore-drill script, and a systemd timer template in `infra/oracle-supabase`. The backup script briefly pauses every Compose service except Postgres so the database and local Storage bytes share one maintenance-window boundary. It captures a Postgres custom dump, cluster globals, migration ledger, optional pgsodium root key, Storage archive, metadata, and checksums. The plaintext bundle is encrypted with `age` before it becomes a retained artifact.

The age private identity must stay off the Oracle VM. Configure `rclone` with a destination outside the VM and preferably outside the Oracle tenancy. A successful local archive is not an off-server backup.

Initial manual sequence:

```bash
bash infra/oracle-supabase/backup.sh
export SCANTAP_BACKUP_CONFIRM="BACK UP SCANTAP"
export SCANTAP_BACKUP_AGE_RECIPIENT="<public-age-recipient>"
export SCANTAP_BACKUP_RCLONE_REMOTE="<remote:path>"
bash infra/oracle-supabase/backup.sh --apply --upload
```

Install the systemd service and timer only after one manual encrypted upload succeeds and a separate-machine restore drill passes. The root-owned `/etc/scantap/backup.env` must have mode `0600`; the rclone configuration must also be root-only.

On a trusted separate machine, provision a disposable PostgreSQL 17 Supabase-compatible database whose name ends in `_restore_drill`, then run:

```bash
export SCANTAP_RESTORE_ARCHIVE="<downloaded-encrypted-backup>"
export SCANTAP_RESTORE_AGE_IDENTITY="<private-age-identity>"
export SCANTAP_RESTORE_DRILL_CONFIRM="RESTORE SCANTAP DRILL"
export PGHOST=127.0.0.1
export PGPORT="<local-drill-port>"
export PGUSER="<drill-admin>"
export PGDATABASE="scantap_restore_drill"
export PGPASSFILE="<mode-0600-password-file>"
bash infra/oracle-supabase/restore-drill.sh --run
```

The restore script refuses remote database hosts and non-drill database names. It does not restore cluster globals automatically. After the archive restore succeeds, run application login, `pnpm test:rls:live -- --run`, and Storage download checks against the isolated stack.

Before the first external pilot:

- Schedule a daily logical database backup.
- Back up Storage object bytes separately.
- Encrypt backup archives before they leave the VM.
- Copy backups to a separate provider, account, or trusted encrypted machine.
- Retain multiple daily and weekly recovery points within the available budget.
- Record the Supabase release, Postgres version, migration checksums, and backup checksum.
- Restore the newest backup into an isolated test stack and perform login plus tenant-isolation checks.

An Oracle volume backup or a second attached disk is useful, but neither is the only recovery copy.

## Vercel handoff

Only after domain ownership, HTTPS, migrations, RLS tests, SMTP, and restore verification:

- Set `NEXT_PUBLIC_SUPABASE_URL` to the HTTPS backend origin.
- Set the publishable key as the only browser-exposed Supabase key.
- Set `SUPABASE_SECRET_KEY`, `INTEGRATION_ENCRYPTION_KEY`, Google OAuth secrets, and `CRON_SECRET` as server-only production secrets.
- Set the canonical public site URL and Google callback URL.
- Redeploy the exact approved Git revision.
- Run the read-only deployment contract:

```powershell
$env:SCANTAP_VERIFY_APP_URL = "https://scantapreviews.com"
$env:SCANTAP_VERIFY_API_URL = "https://api.scantapreviews.com"
pnpm verify:deployment -- --full
```

- Verify browser login, callback behavior, denied routes, and redacted server logs. A successful build or one HTTP check alone is not release evidence.

Follow [the domain and email cutover](DOMAIN_EMAIL_CUTOVER.md) for registrar, DNS, mailbox, SMTP, SPF, DKIM, and DMARC gates. `status.scantapreviews.com` remains reserved until a status surface outside the Oracle failure domain is selected.

## Controlled updates

1. Read the Supabase self-hosted changelog and release manifest.
2. Create an off-server backup and complete a pre-upgrade health check.
3. Run the official update dry run against the recorded base version.
4. Stop for any Postgres-major, removed-extension, secret-variable, or merge-conflict warning.
5. Apply the update during a maintenance window.
6. Verify container health, Postgres version, migrations, Auth, tenant isolation, Storage, Realtime, and the Vercel application.
7. Keep the previous configuration and backup until the verification window passes.

Never run a destructive reset script on production. Never use `docker compose down -v` on the production stack.

## Minimum operational evidence

Keep a non-secret audit with:

- UTC timestamps;
- resource identifiers without credentials;
- shape, region, and free-eligibility decision;
- storage mode and filesystem UUID;
- allowed ingress ranges;
- OS, Docker, Supabase release, and Postgres versions;
- migration filenames and checksums;
- health-check results;
- backup and restore-test timestamps;
- any stop condition or manual intervention.

Do not include passwords, private keys, API tokens, cookies, database URLs, or OAuth material.
