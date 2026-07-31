# Scantap Reviews

Scantap helps local businesses turn in-person customer moments into a simple, measurable review workflow using NFC and QR products. `Project Breadnfc` is an internal repository name only; public surfaces use the Scantap name.

## Production website

This repository contains the production Next.js website and an interactive dashboard experience built in the selected **Signal Ledger** direction: cobalt blue, graphite, white, and cool gray; crisp typography; compact command surfaces; and clear operational states.

The website includes:

- A comprehensive marketing homepage.
- Product pages for the counter stand, adhesive plate, and staff card.
- A hands-on dashboard demo with review, request, device, location, report, and settings workflows.
- A client-side pilot planner that never claims to submit or create an order.
- Industry, location, and editorial resource hubs.
- Curated location-and-industry pages with original local context.
- About, privacy, terms, sitemap, robots, metadata, and responsive navigation.

## Customer review path

Scantap sends the customer directly to the business's configured Google review destination. The implementation does not hide or delay that destination based on a rating and does not use a sentiment-gated detour. QR remains available as a fallback on every physical format.

## Run locally

Requirements: Node.js 24 and pnpm 11.

```powershell
pnpm install
pnpm dev
```

Then open `http://localhost:3000`.

Quality gates:

```powershell
pnpm typecheck
pnpm lint
pnpm build
```

## Routes

- `/` — marketing homepage
- `/products` — standard and custom-branded product options
- `/dashboard` — interactive sample workspace
- `/pilot` — pilot planning tool
- `/industries` and `/industries/[slug]`
- `/locations` and `/locations/[slug]`
- `/solutions/[location]/[industry]` — intentionally limited to curated combinations
- `/resources` and `/resources/[slug]`
- `/about`, `/privacy`, and `/terms`

## Honest current limits

- Dashboard data is fictitious and explicitly labeled as demo data.
- Google Business Profile connectivity, authentication, database persistence, payments, transactional email, and live customer accounts are not enabled yet.
- Pilot planner output remains in the browser unless the user copies or downloads it.
- Pricing, supplier terms, product lead times, and inventory remain unconfirmed until physical sampling and landed-cost validation are complete.
- No public contact form is shown because a verified delivery channel has not been configured.

## Product and supplier work

The current product targets are a black or white counter stand, adhesive plate, and staff card. Standard units carry Scantap branding; a separately scoped custom-business-branded option may be offered after artwork, lead time, and landed cost are confirmed.

Supplier observations and physical QA gates are recorded in [the supplier comparison](docs/research/2026-07-31-supplier-cost-comparison.md). No supplier order is created by this codebase.

## Design evidence

Accepted direction and implementation evidence live in:

- `docs/design/concepts/`
- `docs/design/evidence/`
- `.interface-design/system.md`

The earlier `prototype/` remains an historical decision artifact; the Next.js application at the repository root is now the implementation source.

## Repository

- Public brand: Scantap Reviews
- Branch: `main`
- Remote: `https://github.com/ocnbtl/projectbreadnfc.git`
- Hosting target: Vercel project `unigentamos/projectbreadnfc`
