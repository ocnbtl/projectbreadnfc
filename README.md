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
pnpm build
```

To regenerate the embedded dashboard walkthrough, install the Playwright Chromium runtime, start the app on port 3017, and record the real interactive demo:

```powershell
pnpm exec playwright install chromium
pnpm dev -- --port 3017 --hostname 127.0.0.1
pnpm record-demo
```

## Application configuration

Create a dedicated Supabase project, apply the migration in `supabase/migrations`, and configure the environment names documented in `.env.example`. The Google connection additionally requires an approved Google Business Profile API project, OAuth consent screen, the listed Business Profile APIs, and a base64-encoded 32-byte integration encryption key.

After creating the owner in Supabase Auth, promote that exact account from the SQL editor:

```sql
insert into public.platform_staff (user_id, role, display_name)
select id, 'owner', 'Ocean'
from auth.users
where lower(email) = lower('replace-with-owner-email@example.com');
```

The next normal login routes an active platform staff account to `/control`; customer accounts continue to `/app`. The complete storage, tenancy, backup, and scale decision is in [the data architecture proposal](docs/DATA_ARCHITECTURE.md).

The scheduled sync endpoint is `GET /api/cron/google-sync`. It requires `Authorization: Bearer <CRON_SECRET>`. Google review content receives a 30-day source expiry and the sync job purges expired cached records.

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

- The protected application and migration are implemented locally, but this checkout is not connected to a dedicated Scantap Supabase project.
- The connected Supabase owner currently has the Free-plan maximum of two active projects. A new Scantap project requires a second free organization, an owner-approved pause of an existing unrelated project, or an upgrade; no existing project was repurposed.
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
