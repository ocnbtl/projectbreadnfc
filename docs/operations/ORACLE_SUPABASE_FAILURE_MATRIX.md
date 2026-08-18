# Oracle Supabase failure and recovery matrix

Last reviewed: 2026-08-18

This matrix is the decision layer for the autonomous acquisition and bootstrap workflow. “Automatic action” means the system may take that bounded action without waiting. Anything in “Stop condition” requires user attention or a later approved change.

| Risk | Detection | Automatic action | Stop condition / fallback |
| --- | --- | --- | --- |
| A1 compute capacity remains unavailable | Oracle returns `Out of host capacity` in every availability domain | End the current attempt and retry on the next scheduled interval | Do not create a paid shape or a duplicate VM. Continue repository work while waiting. |
| Capacity appears after a retry | One exact instance request succeeds | Verify shape, state, region, boot disk, IP, and duplicate count; then start the gated bootstrap | If any property differs from the approved target, stop before installing software |
| Automation login or browser session expires | Oracle redirects to sign-in, CAPTCHA, MFA, or an authorization error | Preserve current state and report the exact gate | User signs in again. An already running VM continues operating; only automation is paused. |
| More than one VM is created | Instance list shows duplicate active Scantap resources | Make no further changes | Stop and ask which resource to retain. Do not terminate either autonomously. |
| 100 GB optional volume is not clearly free | Eligibility label absent, combined allocation exceeds the documented free total, cost estimate is nonzero, or status is ambiguous | Skip volume creation and use `/srv/scantap` on the 100 GB encrypted boot filesystem | No paid volume. Revisit expansion only with an explicit cost decision. |
| Attached disk identity is ambiguous | Device path, size, attachment, mount state, or filesystem signatures do not match | Do not format or mount it | Stop for manual disk identification. Never guess from `/dev/sdX` or `/dev/oracleoci/oraclevdX` ordering. |
| Optional volume does not mount after reboot | Filesystem UUID absent or `/srv/scantap` is not the expected device | Leave Supabase stopped | Repair `fstab`/attachment first or deliberately return to boot-volume storage before data exists. |
| Boot volume approaches capacity | Filesystem use crosses 70%, 80%, or 90% thresholds | At 70%, alert and measure growth; rotate bounded logs and verify backup retention | At 80%, approve cleanup/expansion; before 90%, enter maintenance. Never delete DB files or unverified backups to make space. |
| Oracle reclaims an idle Always Free VM | Instance is stopped/terminated unexpectedly or Oracle sends a reclamation notice | Alert and preserve available boot/volume backups | Restore to available Oracle capacity or the approved paid fallback. Do not generate artificial load to evade provider policy. |
| ARM64 container is missing | Docker reports no matching manifest or a service repeatedly fails with exec-format errors | Keep the stack private and stop that release attempt | Select a stable release whose enabled images support ARM64 or move to an approved x86 host. Do not use emulation for pilot production. |
| Docker or package installation fails | Signed repository, package verification, daemon health, or Compose check fails | Retry only safe idempotent package operations with bounded backoff | Stop on signature errors, repository mismatch, or repeated failure. Do not disable verification. |
| Public IP changes or is lost | DNS no longer matches the instance public IP | Keep services private; update monitoring state | Reassign DNS after verifying the instance, or separately evaluate a reserved IP. Do not point DNS to an unverified address. |
| SSH source IP changes | Administrator receives timeout while service remains healthy | Leave SSH closed to the old range; use Oracle Console access if available | Update the `/32` rule to the new verified administrator IP. Never open SSH globally as a shortcut. |
| Network rule exposes internal ports | External scan reaches 5432, 6543, 8000, or Studio | Close the offending OCI and host rule immediately, then rotate exposed administrative credentials | Investigate logs and rotate database/API credentials before resuming. |
| DNS or TLS validation fails | Certificate issuance fails, wrong A/AAAA record, or HTTPS hostname mismatch | Keep the gateway private and retry after DNS propagation | Do not use public plain HTTP or a self-signed certificate for production OAuth/Auth traffic. |
| Domain is not purchased or ownership is unverified | Registrar ownership and renewal controls cannot be confirmed | Keep `scantapreviews.com` values as planned configuration only | Do not change Vercel, Oracle DNS, OAuth, or SMTP production callbacks. |
| Gateway configuration assumes Kong after the Envoy change | Compose exposes `api-gw` but proxy or checks target `kong`, or a custom `kong.yml` is silently ignored | Keep 80/443 closed and reconcile against the pinned self-hosted release | Do not rename services or opt back into Kong heuristically. Record any deliberate gateway exception. |
| Default or weak Supabase secrets remain | Placeholder comparison or secret-length validation fails | Refuse to start the stack | Regenerate on the server. Never commit or print the values. |
| Secret appears in source, logs, screenshot, or transcript | Secret scanning or review finds a value outside the server secret store | Remove the exposed artifact from current surfaces without echoing it | Rotate the secret and assess history/cache exposure before continuing. Deletion alone is insufficient. |
| Supabase service health fails | Required container is unhealthy, restarting, or its local health endpoint fails | Collect redacted service status and bounded logs; retry once after dependencies settle | Stop after repeated failures. Do not publish 80/443 or configure Vercel. |
| Supabase release changes underneath setup | Unpinned files or image tags differ from the recorded release | Abort before initialization | Fetch a stable tagged configuration and record its tag/commit. |
| Postgres 17 cannot start | Version mismatch, stale data/config volume, or unsupported extension | Keep the original data and config untouched | Follow the version-specific recovery guide. Never point PG17 at PG15 data without the official upgrade procedure. |
| Migration fails | Migration runner receives a SQL error | Transaction rolls back and runner stops | Fix a new forward migration; do not edit an already applied migration checksum. |
| Applied migration checksum changes | Runner finds the same timestamp with a different SHA-256 | Refuse all later migrations | Reconcile source and database history. Never “accept” drift silently. |
| RLS isolation test fails | Test user can read or mutate another tenant, secret table, or platform table | Block real data and deployment handoff | Add a forward security migration and repeat every denied-path test. |
| First owner bootstrap has no or multiple matches | Exact case-insensitive Auth email lookup returns zero or more than one user | Dry run exits without mutation | Correct the Auth account before applying. Do not create or choose a user heuristically. |
| Server secret is used in client code | Build/static review finds secret key in a public variable or client import | Block deployment | Move it to server-only code and rotate if it reached a browser bundle. |
| SMTP is absent or unreliable | Signup/reset/confirmation email cannot be delivered and observed | Keep onboarding private | Configure a production SMTP provider and rate limits before external invitations. |
| Encrypted backup exists only on the VM | Backup archive succeeds but no independent destination contains it | Keep the local encrypted artifact and retry bounded upload | Do not call it disaster recovery; configure a separate rclone destination before pilot data. |
| Off-server upload is incomplete | rclone fails or the archive filename cannot be listed at the destination | Keep the local encrypted artifact and report failure | Do not prune local copies or enable onboarding until upload and a later restore drill succeed. |
| Restore drill targets a non-drill or remote database | Host is not localhost or database name lacks `_restore_drill` | Restore script refuses to run | Provision an isolated Supabase-compatible PostgreSQL 17 target. Never test by cleaning production. |
| Backup decrypts but restore fails | Checksum, `pg_restore`, PostgreSQL version, schema, RLS, login, or Storage verification fails | Preserve the encrypted source and drill logs without credentials | Repair backup/restore compatibility and repeat before customer data is accepted. |
| Google API access is unapproved | OAuth or Business Profile APIs reject the project | Keep Google integration disabled and expose only truthful link-only behavior | Wait for approval; do not scrape or claim native synchronization. |
| Backup succeeds only on the same VM | Local dump exists but no independent copy is verified | Continue development without customer data | Configure encrypted off-server copies and a restore test before pilot onboarding. |
| Restore test fails | Isolated restore cannot start, authenticate, or pass tenant tests | Preserve source backups and record the failure | Fix the backup/restore procedure before onboarding. |
| Oracle region or tenancy outage | VM, volumes, or API are unavailable from independent checks | Notify and avoid repeated destructive recovery actions | Accept pilot downtime or restore to the approved secondary host when recovery objectives require it. |
| Single VM becomes insufficient | Sustained CPU, memory, connections, latency, or recovery time exceed thresholds | Gather measurements and reduce optional services | Move to a paid U.S. VPS, managed Supabase, or HA PostgreSQL based on measured demand. |
| Provider bills or eligibility changes | Console, usage API, or invoice shows a charge or free-label change | Stop creating resources and report the exact resource | User decides whether to keep, resize, or migrate. Never assume a small charge is acceptable. |
| Windows computer sleeps or automation stops | Scheduled checks cease while no VM exists | No cloud mutation occurs | Resume checks when the computer and session are available. Once provisioned, the Oracle VM operates independently of the PC. |

## Recovery priorities

1. Protect credentials and avoid destructive disk or database actions.
2. Preserve the most recent known-good data and configuration.
3. Keep internal services private.
4. Restore database integrity and tenant isolation before availability.
5. Restore Auth, API, Storage, and Vercel connectivity.
6. Re-enable provider synchronization only after the core system is stable.

## Pilot limits that must remain visible

- One VM is one failure domain.
- Oracle Always Free capacity is not an availability guarantee.
- A second volume is not off-server recovery.
- Self-hosted Supabase has no managed platform backups, PITR, organization/project console, or managed support.
- The system is not ready for customer data until HTTPS, SMTP, off-server backups, a restore drill, and live RLS denial tests are complete.

Official policy references:

- Oracle Always Free capacity, storage allowance, and idle reclamation: https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm
- Oracle public IP lifecycle: https://docs.oracle.com/en-us/iaas/Content/Network/Tasks/managingpublicIPs.htm
- Supabase self-hosting responsibilities: https://supabase.com/docs/guides/self-hosting
- Supabase Docker requirements and secret handling: https://supabase.com/docs/guides/self-hosting/docker
- Supabase reverse proxy and HTTPS: https://supabase.com/docs/guides/self-hosting/self-hosted-proxy-https
- Supabase PostgreSQL 17 guidance: https://supabase.com/docs/guides/self-hosting/postgres-upgrade-17
