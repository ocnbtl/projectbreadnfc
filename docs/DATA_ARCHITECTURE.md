# Scantap data architecture

## Decision

Use one managed Supabase project as Scantap's production system of record. Supabase supplies hosted PostgreSQL, authentication, Row Level Security, connection pooling, and a migration path that remains ordinary PostgreSQL. Start on the Free plan, keep spend controls enabled when upgrading, and move to Pro when customer use makes uptime and managed backups business-critical.

Do not run the customer-facing production database from a laptop or office PC. A local Supabase stack is valuable for development and recovery exercises, but a live local database would make every customer login depend on one machine's power, internet connection, patching, firewall, backups, and physical security.

Current official references:

- Free and paid limits: https://supabase.com/pricing
- Free project pausing: https://supabase.com/docs/guides/platform/free-project-pausing
- Self-hosting responsibilities: https://supabase.com/docs/guides/self-hosting
- Backups and logical exports: https://supabase.com/docs/guides/platform/backups

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

This is a shared-schema, row-isolated SaaS model. Every customer-owned row carries `organization_id`; every location-owned row also carries `location_id`. Composite foreign keys prevent a location or review from being attached to the wrong organization. RLS is the primary tenant boundary, and elevated cross-tenant queries are restricted to server-only code after a separate `platform_staff` check.

Do not create one database or one Supabase project per customer. That approach becomes expensive and operationally difficult, complicates reporting, and makes schema changes inconsistent across customers.

## Data domains

| Domain | Primary tables | Ownership |
| --- | --- | --- |
| Identity | `profiles`, Supabase `auth.users` | Individual account |
| Tenancy | `organizations`, `organization_memberships` | Organization |
| Location access | `locations`, `location_memberships`, `location_policies` | Organization and location |
| Product operations | `devices`, `audit_events`, `invitations` | Organization and location |
| Review operations | `integrations`, `external_locations`, `reviews`, `reply_drafts`, `review_replies` | Organization and location |
| Scantap operations | `platform_staff`, `customer_accounts`, `platform_tasks`, `platform_events` | Scantap only |

`platform_customer_summaries` and `platform_portfolio_pulse` are server-only operational views. They let the owner control center read portfolio totals without sending unrestricted tenant rows to the browser. Browser roles receive no grant on either view.

Provider credentials live in `integration_credentials`, encrypted before persistence. Authenticated browser roles receive no grant on that table. Google-supplied review content is cached for no more than 30 days and remains separate from Scantap-owned interaction events.

## Permission model

Customer authority and Scantap authority are deliberately separate.

- Customer roles: owner, administrator, manager, responder, analyst, viewer.
- Customer scope: all organization locations or explicit location assignments.
- Scantap roles: owner, operator, support, read-only.
- A customer administrator never becomes a Scantap platform operator.
- Platform operators use server-side administrative queries only after an active `platform_staff` record is verified against the authenticated user.
- Platform mutations must append a `platform_events` record with actor, target, action, and timestamp.

## Query and index rules

1. Lead every tenant query with `organization_id` and location queries with both tenant keys.
2. Use stable UUIDs for public objects; use identity integers only for append-only internal ledgers.
3. Paginate review, customer, device, location, staff, audit, and task registers. Never present a hard cap as a total.
4. Index the filters used in daily work: tenant plus date, status, provider, location, lifecycle, health, and task due date.
5. Use exact counts sparingly on overview screens; move heavy cross-tenant aggregates to scheduled summary tables once live volume justifies them.
6. Treat provider data freshness as a visible state. Expired or disconnected data is not silently presented as current.

## Retention and backups

- Google Business Profile cached content: delete at 30 days unless refreshed under the provider policy.
- Platform and customer audit events: retain at least 12 months initially; make the period configurable before enterprise contracts.
- Credentials: keep only current encrypted tokens and required refresh material.
- Free plan: run a regular logical `supabase db dump` and store the encrypted export away from Supabase and the application server.
- Pro plan: keep managed daily backups and continue periodic independent logical exports.
- Storage objects require their own export; database backups only contain Storage metadata.

## Cost and scale stages

### Stage 0 — development

- Local migrations and generated fixtures.
- No real customer or provider data.
- Cost: $0.

### Stage 1 — pilot

- One managed Supabase Free project.
- Appropriate for early pilots while the database stays below 500 MB and the project receives regular activity.
- Manual encrypted logical backups are required because the Free plan has no managed automatic backups.

### Stage 2 — paying customers

- Upgrade to Supabase Pro before database pausing, backup recovery time, or support becomes a business risk.
- Current published starting price is $25/month with daily backups and larger included capacity.
- Add a job queue and precomputed daily organization metrics before cross-tenant reporting creates expensive live queries.

### Stage 3 — larger organizations

- Add SSO only when customers fund the requirement.
- Partition high-volume append-only event tables by month if query plans and retained volume show a real need.
- Add read replicas, PITR, or a warehouse only from measured load and recovery requirements.
- Keep the application schema portable so managed Supabase can be migrated to another PostgreSQL host or a hardened self-hosted deployment if economics or compliance later justify it.

## Immediate implementation sequence

1. Create an isolated Scantap Supabase project.
2. Apply migrations in timestamp order.
3. Configure the publishable key and server secret in Vercel.
4. Create the owner Auth account, then insert its user ID into `platform_staff` with role `owner`.
5. Verify customer and platform denied paths before importing any real data.
6. Connect Google only after API approval and OAuth credentials are configured.
7. Schedule encrypted logical backups before onboarding the first external pilot.

The connected Supabase account currently has two active Free projects, so project creation is blocked until a second free organization is created, an existing unrelated project is paused by its owner, or the Supabase account is upgraded. Existing projects must not be repurposed for Scantap.
