# Scantap local design prototype

This is a static, local-only design study for Scantap. It contains synthetic example data and does not connect to a customer, review provider, database, payment system, redirect service, or production account.

## Run locally

From the repository root:

```powershell
python -m http.server 4173 --directory prototype --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173`.

Opening `index.html` directly also works in modern browsers, although a local server gives the most representative behavior.

## Prototype views

- **Directions:** Signal Ledger, Copper Circuit, and Civic Current identity studies.
- **Product faces:** Counter stand, staff card, and adhesive plate in white and black with a bounded business-name preview.
- **Tap journey:** Equal first-screen access to an honest public review or direct business support; no rating gate.
- **Dashboard:** Responsive, setup-first account overview with synthetic operational metrics.
- **States:** Empty, loading, stale, error, success, and permission-denied behavior.
- **Homepage:** Structural marketing-site prototype with internal pilot copy.

## Interaction notes

- Use the header navigation to switch views.
- Direction buttons apply each proposed theme across the prototype.
- Product controls update the sample business name and black/white base.
- Journey controls simulate branches but never open, submit, persist, call, or send anything.
- Dashboard state chips expose active, setup, empty, loading, stale, error, and permission states.
- QR graphics are position studies and are deliberately not scannable.

## Status and boundaries

`Signal Ledger` is recommended, not approved. Founder selection is required before an identity is treated as final.

This prototype demonstrates interface structure and interaction contracts. It does not prove supplier fit, NFC reliability, production integration, accessibility with every assistive technology, legal compliance, pricing, or market demand.

Project sources:

- [Launch definition](../docs/launch-definition/2026-07-30-scantap-launch-definition.md)
- [Design handoff](../docs/design/2026-07-31-scantap-design-handoff.md)
- [Supplier cost comparison](../docs/research/2026-07-31-supplier-cost-comparison.md)
