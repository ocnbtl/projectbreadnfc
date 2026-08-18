# Scantap Reviews

Scantap helps local businesses turn in-person customer moments into a simple, measurable review workflow using NFC and QR products. `Project Breadnfc` is an internal repository name only; public surfaces use the Scantap name.

## What is in this repository

This is the production Next.js codebase for the Scantap marketing website, public dashboard demo, protected customer application, and Scantap owner control center. It follows the **Signal Ledger** direction: cobalt blue, graphite, white, and cool gray; crisp typography; compact operating surfaces; and explicit system states.

The protected application includes:

- Supabase email/password authentication and onboarding.
- Multiple organizations per account with a persistent organization switcher.
- Organization roles: owner, administrator, manager, responder, analyst, and viewer.
- Organization-wide or assigned-location access scopes.
- Per-location roles and configurable organization/location reply rules.
- Invitation links bound to the invited email address and expiring after seven days.
- An RLS-protected review inbox, reply drafts, approval-aware Google publishing, locations, devices, integrations, and administrative audit events.
- Google Business Profile OAuth, encrypted refresh tokens, account/location mapping, manual sync, scheduled sync support, and provider-confirmed replies.
- Link-only shortcuts for providers without an approved or practical API connection.

The separate Scantap control center includes:

- Platform roles for the Scantap owner, operators, support staff, and read-only staff.
- A cross-organization business pulse, customer health, plan, and recurring-revenue register.
- An internal operating queue and append-only platform event ledger.
- Customer portfolio signals for locations, team members, devices, integrations, and replies waiting.
- A recorded walkthrough of the interactive public dashboard.

Customer membership never grants platform access. An authenticated user must also have an active row in `platform_staff` before server-only cross-tenant queries are created.

The marketing website includes the homepage, product catalog, public dashboard demo, pilot planner, industry and location resources, about, privacy, terms, sitemap, and robots routes.

## Customer review path

Scantap sends a customer directly to the business's configured Google review destination. It does not hide or delay that destination based on a rating and does not use a sentiment-gated detour. QR remains available as a fallback on every physical format.

## Run locally

Requirements: Node.js 24 and pnpm 11.

```powershell
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

Then open `http://localhost:3000`.

Quality gates:

```powershell
pnpm typecheck
pnpm lint
pnpm check:secrets
pnpm verify:production
pnpm verify:supabase
pnpm build
```

To regenerate the embedded dashboard walkthrough, install the Playwright Chromium runtime, start the app on port 3017, and record the real interactive demo:

```powershell
pnpm exec playwright install chromium
pnpm dev -- --port 3017 --hostname 127.0.0.1
pnpm record-demo
```

## Application configuration

Scantap's initial backend target is one self-hosted Supabase stack on an Oracle Cloud Always Free A1 VM; the public Next.js application remains on Vercel. Apply every file in `supabase/migrations` in timestamp order and configure the environment names documented in `.env.example`. The complete hybrid storage, tenancy, backup, and scale decision is in [the data architecture](docs/DATA_ARCHITECTURE.md), with provisioning and recovery gates in [the Oracle runbook](docs/operations/ORACLE_SUPABASE_RUNBOOK.md).

The intended production names are `scantapreviews.com`, `api.scantapreviews.com`, and the reserved `status.scantapreviews.com`; the planned public inbox is `contact@scantapreviews.com`. The domain and mailbox do not exist yet. Keep those values in planned state until the [domain and email cutover](docs/operations/DOMAIN_EMAIL_CUTOVER.md) has real ownership, DNS, TLS, and delivery evidence.

After creating the owner in Supabase Auth, bootstrap that exact account with the dry-run-first script. It requires an HTTPS backend unless the target is localhost and will not create an Auth user:

```powershell
$env:SCANTAP_OWNER_EMAIL = "replace-with-owner-email@example.com"
$env:SCANTAP_OWNER_DISPLAY_NAME = "Ocean"
pnpm bootstrap:owner
$env:SCANTAP_OWNER_BOOTSTRAP_CONFIRM = "YES"
pnpm bootstrap:owner -- --apply
```

Provide `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SECRET_KEY` through the trusted shell or deployment secret store, never source control. Clear the temporary bootstrap values after use.

The next normal login routes an active platform staff account to `/control`; customer accounts continue to `/app`.

The scheduled sync endpoint is `GET /api/cron/google-sync`. It requires `Authorization: Bearer <CRON_SECRET>`. Google review content receives a 30-day source expiry and the sync job purges expired cached records.

Read-only deployment verification is available after DNS exists:

```powershell
$env:SCANTAP_VERIFY_APP_URL = "https://scantapreviews.com"
$env:SCANTAP_VERIFY_API_URL = "https://api.scantapreviews.com"
pnpm verify:deployment -- --full
```

Never expose `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `INTEGRATION_ENCRYPTION_KEY`, `GOOGLE_CLIENT_SECRET`, or `CRON_SECRET` to client code.

## Route groups

- `/` — marketing homepage
- `/products` — standard and custom-branded product options
- `/dashboard` — fictional, interactive public demo
- `/login` — shared authentication with role-aware destination
- `/app` — protected customer workspace
- `/app/reviews`, `/app/locations`, `/app/devices`, `/app/team`, `/app/integrations`, `/app/settings`
- `/control` — protected Scantap owner and employee control center
- `/pilot` — browser-only pilot planning tool
- `/industries`, `/locations`, `/solutions`, and `/resources` — curated SEO/resource routes
- `/about`, `/privacy`, and `/terms`

## Honest current limits

- The protected application and migrations are implemented, but this checkout is not yet connected to the Scantap production backend.
- Oracle A1 capacity acquisition is still pending. The autonomous workflow may create only the approved Always Free VM and must stop on paid or ambiguous resources.
- `scantapreviews.com` has not been purchased; the public origin, API hostname, status hostname, and `contact@scantapreviews.com` are planned contracts rather than live services.
- Self-hosted Supabase is a single-project, community-supported deployment. Scantap owns its patching, TLS, monitoring, backups, restoration, uptime, and scaling.
- The first Oracle VM is a single failure domain with no uptime SLA. External customer data remains blocked until HTTPS, SMTP, off-server backups, a restore drill, and live RLS denial tests pass.
- Google connectivity cannot operate until Google grants Business Profile API access and production OAuth credentials are configured.
- Link-only integrations open the provider directly; they do not claim review sync or reply APIs.
- The public `/dashboard` route remains fictional demo data and is separate from `/app`.
- Pilot planner output remains in the browser unless the user copies or downloads it.
- Pricing, supplier terms, lead times, inventory, payment processing, transactional email, and a verified public contact channel remain unconfigured.

## Product and supplier work

The current product targets are a black or white counter stand, adhesive plate, and staff card. Standard units carry Scantap branding; a separately scoped custom-business-branded option may be offered after artwork, lead time, and landed cost are confirmed.

Supplier observations and physical QA gates are recorded in [the supplier comparison](docs/research/2026-07-31-supplier-cost-comparison.md). No supplier order is created by this codebase.

## Design evidence

Accepted direction and implementation evidence live in `DESIGN.md`, `PRODUCT.md`, `.impeccable/`, `docs/design/concepts/`, `docs/design/evidence/`, and `.interface-design/system.md`.

The earlier `prototype/` remains a historical decision artifact; the Next.js application at the repository root is the implementation source.

## Repository

- Public brand: Scantap Reviews
- Default branch: `main`
- Remote: `https://github.com/ocnbtl/projectbreadnfc.git`
- Hosting target: Vercel project `unigentamos/projectbreadnfc`
