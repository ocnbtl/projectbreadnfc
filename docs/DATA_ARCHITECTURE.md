# Scantap data architecture

Last reviewed: 2026-08-18

## Decision

Use a hybrid deployment:

- Vercel continues to host the public Next.js website and application server.
- One self-hosted Supabase stack on an Oracle Cloud Always Free Ampere A1 VM is the initial production system of record.
- The Supabase stack represents one project. Scantap organizations and locations are rows inside the application schema; they are not separate Supabase projects.
- Local Supabase remains a development and restore-testing environment. A customer-facing database must not depend on a laptop or office connection.

This choice minimizes cash cost while preserving an ordinary PostgreSQL migration path. It also means Scantap, rather than Supabase, owns patching, monitoring, TLS, backups, restoration, capacity planning, and incident response. The Oracle VM is an acceptable pilot platform, not a high-availability promise.

Planned production origins are `https://scantapreviews.com` for the Vercel application and `https://api.scantapreviews.com` for the Supabase gateway. `https://status.scantapreviews.com` is reserved for a later status service outside the Oracle failure domain. The domain has not been purchased and none of these names should be treated as live until the cutover runbook passes.

Current official references:

- Supabase self-hosting responsibilities: https://supabase.com/docs/guides/self-hosting
- Supabase Docker deployment: https://supabase.com/docs/guides/self-hosting/docker
- Supabase HTTPS proxy guidance: https://supabase.com/docs/guides/self-hosting/self-hosted-proxy-https
- Oracle Always Free resources: https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm
- Oracle block volumes: https://docs.oracle.com/en-us/iaas/Content/Block/Concepts/overview.htm

The operational procedure and stop conditions are in [the Oracle Supabase runbook](operations/ORACLE_SUPABASE_RUNBOOK.md). Failure decisions are in [the failure and recovery matrix](operations/ORACLE_SUPABASE_FAILURE_MATRIX.md).

## Tenancy model

```text
Scantap platform
├── platform_staff              Scantap owner and future employees
├── customer organization A
│   ├── organization_memberships
│   ├── locations
│   │   ├── location_memberships
│   │   ├── devices
│   │   ├── reviews
│   │   └── replies
│   ├── integrations
│   └── customer_account        Internal lifecycle/commercial record
└── customer organization B
    └── same isolated structure
```

This is a shared-schema, row-isolated SaaS model. Every customer-owned row carries `organization_id`; every location-owned row also carries `location_id`. Composite foreign keys prevent a location or review from being attached to the wrong organization. Row Level Security is the primary browser-facing tenant boundary. Elevated cross-tenant queries are restricted to server-only code after a separate active `platform_staff` check.

Do not create one database, schema, or Supabase deployment per customer. That model raises cost and operational burden, makes migrations inconsistent, and prevents efficient portfolio reporting. A separate deployment is reserved for a future enterprise customer only if a funded isolation or compliance requirement justifies it.

## Data domains

| Domain | Primary tables | Ownership |
| --- | --- | --- |
| Identity | `profiles`, Supabase `auth.users` | Individual account |
| Tenancy | `organizations`, `organization_memberships` | Organization |
| Location access | `locations`, `location_memberships`, `location_policies` | Organization and location |
| Product operations | `devices`, `audit_events`, `invitations` | Organization and location |
| Review operations | `integrations`, `external_locations`, `reviews`, `reply_drafts`, `review_replies` | Organization and location |
| Scantap operations | `platform_staff`, `customer_accounts`, `platform_tasks`, `platform_events` | Scantap only |

`platform_customer_summaries` and `platform_portfolio_pulse` are server-only operational views. Browser roles receive no grant on either view. `integration_credentials` holds encrypted provider credentials and is unavailable to browser roles. Google-supplied review content is cached for no more than 30 days and remains separate from Scantap-owned interaction events.

## Permission model

Customer authority and Scantap authority are deliberately separate.

- Customer roles: owner, administrator, manager, responder, analyst, viewer.
- Customer scope: all organization locations or explicit location assignments.
- Scantap roles: owner, operator, support, read-only.
- A customer administrator never becomes a Scantap platform operator.
- Platform operators use server-side administrative queries only after an active `platform_staff` row is verified against the authenticated user.
- Platform mutations append a `platform_events` row with actor, target, action, and timestamp.
- Provider credentials and the Supabase secret key remain server-only. They are never placed in a `NEXT_PUBLIC_*` variable.

The first platform owner is bootstrapped with the repository's dry-run-first script after that exact email already exists in Supabase Auth. Subsequent staff changes use the owner-only application workflow.

## Query and index rules

1. Lead every tenant query with `organization_id`; lead location queries with both tenant keys.
2. Use stable UUIDs for public objects and identity integers only for append-only internal ledgers.
3. Paginate review, customer, device, location, staff, audit, and task registers. Never present a page limit as a total.
4. Index the filters used in daily work: tenant plus date, status, provider, location, lifecycle, health, and due date.
5. Use exact counts sparingly. Move expensive cross-tenant aggregates to scheduled summary tables after measured query plans justify it.
6. Treat provider freshness as visible state. Expired or disconnected data is never silently presented as current.

## Storage layout

The initial Oracle VM is planned with a 100 GB encrypted boot volume. A second 100 GB block volume is optional and may be attached only when Oracle shows that the combined boot and block allocation remains inside the tenancy's Always Free allowance in its home region.

- If the second volume is confirmed free, mount it by filesystem UUID at `/srv/scantap` and store the Supabase deployment and persistent bind mounts there.
- If free eligibility is absent or ambiguous, do not create it. Use `/srv/scantap` on the encrypted boot volume and set conservative retention thresholds.
- Never auto-format a device merely because it appears unused. The device path, lack of filesystem signatures, attachment identity, and absence from the root filesystem must all be verified first.
- A second block volume is capacity, not disaster recovery. A failure in the tenancy or availability domain can still affect both volumes.

Oracle currently documents 200 GB total of Always Free boot and block volume storage combined in the home region. The Console's eligibility and usage view is authoritative at creation time; automation stops rather than creating a resource that is paid or unclear.

## Retention and backups

- Google Business Profile cached content: delete at 30 days unless refreshed under the provider policy.
- Platform and customer audit events: retain at least 12 months initially; make this contractual before enterprise sales.
- Credentials: retain only current encrypted tokens and required refresh material.
- Before the first external pilot, schedule encrypted logical database exports and copy them off the Oracle VM.
- Back up Storage objects separately; a database dump contains Storage metadata, not object bytes.
- Keep at least one tested off-server restore point. A backup that has never been restored is unverified.
- Record the Supabase self-hosted release and Postgres major with every backup.
- Use the repository backup helper to capture the database, cluster globals, migration ledger, optional pgsodium key, and Storage bytes within a short maintenance boundary. Keep the age private identity off the server.

Oracle includes a limited number of Always Free volume backups, but those do not replace portable, encrypted, off-server logical exports. The first restore drill must occur before customer data is considered recoverable.

## Cost and scale stages

### Stage 0 — development and provisioning

- Local migrations, generated fixtures, and static security checks.
- Oracle capacity automation may provision only resources clearly labeled Always Free.
- No real customer or provider data.
- Target infrastructure cost: $0.

### Stage 1 — private pilot

- One A1 VM with 2 OCPUs, 12 GB RAM, and at least 100 GB encrypted boot storage.
- Base Supabase services only; optional analytics/log explorer services remain disabled to preserve memory.
- HTTPS reverse proxy, narrow SSH ingress, encrypted secrets, off-server backups, and restore testing are mandatory before onboarding.
- This stage has a single-server failure domain and no uptime SLA.

### Stage 2 — paying customers

- Add external uptime monitoring, alerting, tested restore automation, mail delivery, and a defined maintenance window.
- Move to a paid U.S. VPS or managed Supabase before Oracle capacity policy, single-VM recovery time, or self-managed operations becomes a customer risk.
- Add a job queue and precomputed daily organization metrics when provider sync or reporting load justifies them.

### Stage 3 — larger organizations

- Add SSO only when a customer funds the requirement.
- Introduce replicas, point-in-time recovery, or a managed PostgreSQL service from measured recovery and uptime requirements.
- Partition high-volume append-only tables only after query plans and retained volume show a need.
- Keep application migrations portable so the database can move without redesigning the tenant model.

## Immediate implementation sequence

1. Acquire exactly one Always Free A1 VM in the Oracle home region without creating paid resources.
2. Verify compute shape, architecture, boot storage, public IP, VCN routing, and narrow ingress before installing software.
3. Decide the storage path using the explicit free-volume gate; use the boot-volume fallback when the gate is not satisfied.
4. Install Docker Engine and Compose from the vendor repository.
5. Pin and record a stable self-hosted Supabase release; start with Postgres 17 and the minimum base services.
6. Keep Studio, Postgres, Supavisor, and the API gateway's direct port private. Publish only HTTPS through the reverse proxy after DNS is correct.
7. Apply repository migrations in timestamp order and run `pnpm verify:supabase` plus live RLS denial tests before importing real data.
8. Create the owner Auth account and run `pnpm bootstrap:owner` in dry-run mode, then repeat with both explicit apply confirmations.
9. Configure Vercel with the public Supabase URL and publishable key plus server-only secrets. Rotate any value exposed during setup.
10. Configure SMTP, complete a restore drill, and verify authentication callbacks before the first pilot.
11. Connect Google only after API approval and production OAuth credentials are configured.

Capacity availability authorizes provisioning only. It does not waive the storage, networking, secret, backup, or migration gates above.
