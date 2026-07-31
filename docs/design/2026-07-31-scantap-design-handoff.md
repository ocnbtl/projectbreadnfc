# Scantap design handoff

- Created: 2026-07-31
- Status: `DIRECTION PROPOSED`
- Decision owner: Founder
- Recommended direction: `Signal Ledger`
- Local prototype: [`prototype/index.html`](../../prototype/index.html)
- Production implementation: not started

## 1. Design brief

Scantap needs a credible launch system for an owner-operated Cincinnati pilot: an original identity direction, three black/white physical product faces, a neutral tap/scan journey, a useful GetTap-inspired dashboard, complete interface states, and a marketing-site structure. The experience should feel clean, professional, efficient, and appropriate for a business owner checking the system between customer interactions.

The design must support three distinct moments without becoming three disconnected products:

1. A physical prompt earns attention at the counter, in a handoff, or where a customer pauses.
2. A public journey offers an honest review and direct support with equal first-screen access.
3. An operator dashboard explains setup, device health, review work, and data freshness.

No real customer proof, live account, pricing claim, supplier commitment, production connection, or public launch is represented.

## 2. Source of truth and contradictions

| Priority | Source | Governs | Notes |
|---:|---|---|---|
| 1 | Founder instructions through 2026-07-31 | Scope, quality bar, formats, budget, market, and decision authority | Latest explicit instruction wins |
| 2 | [Launch definition v0.2](../launch-definition/2026-07-30-scantap-launch-definition.md) | Product, trust, pilot, and evidence contracts | Canonical planning brief |
| 3 | Current local prototype | Implemented local visual and interaction behavior | Synthetic and non-production |
| 4 | [Supplier comparison](../research/2026-07-31-supplier-cost-comparison.md) | Read-only sourcing hypotheses and cost gates | Shipping, FX, tax, and sample quality remain unknown |
| 5 | Official platform and regulatory sources in the launch definition | Review-flow constraints | Not a substitute for qualified advice |
| 6 | Founder-supplied competitor and design references | Inspiration and pattern evidence | No trade dress, proprietary assets, or product-specific IA is copied |

Resolved contradiction: an earlier rating-dependent support concept conflicts with the honest-review standard and creates review-gating risk. The prototype uses a rating-free first screen with both choices visible together.

Unresolved contradiction: an accessible price position and high-quality customization may conflict once landed cost and labor are known. The visual system therefore supports bounded template customization and makes no public price promise.

## 3. Mode and overlay

- Primary mode: `PRODUCT APPLICATION`
- Overlay: `Scantap launch-system`
- Primary job: help an owner identify setup gaps, device health, reviews needing action, and freshness without decoding analytics jargon.
- Overlay job: make the identity, physical faces, tap journey, dashboard, and homepage behave like one accountable system.

`PRODUCT APPLICATION` owns the component and state architecture because the dashboard has the highest operational complexity. The launch-system overlay supplies the shared signal rail, restrained material language, honest-review copy, physical formats, and evidence conventions.

Plausible secondary modes are intentionally staged:

- `BRAND SYSTEM`: proposed through three directions; not frozen until founder selection.
- `MARKETING SITE`: information structure is prototyped; public copy, production content, and deployment remain later work.

## 4. Direction alternatives and status

| Direction | Character | Signature | Typography | Accent | Status |
|---|---|---|---|---|---|
| A. Signal Ledger | Quietly technical, exact, calm | Routed signal rail and evidence nodes | Bahnschrift + Segoe UI Variable | Cobalt | `RECOMMENDED / PROPOSED` |
| B. Copper Circuit | Crafted, tactile, hospitality-led | Cut corner and copper trace | Georgia + Segoe UI Variable | Copper | `EXPLORATORY` |
| C. Civic Current | Neighborly, legible, local-service confidence | Current loop and location node | Trebuchet MS + Segoe UI Variable | Civic green | `EXPLORATORY` |

Signal Ledger is recommended because it can carry physical product, operational software, and multi-location growth without looking either like a generic review gadget or a luxury object. Copper Circuit is credible for hospitality but risks narrowing the category. Civic Current is approachable but less distinctive in a software dashboard.

Patterns deliberately rejected:

- A wall of equal-weight SaaS metric cards.
- Gold stars or celebratory review gradients as the primary brand language.
- NFC-wave decoration repeated without informational meaning.
- Arbitrary floating cards and shadows in the application.
- Device interaction counts presented as completed reviews.

## 5. Decision and approval state

| Decision | State | Owner | Evidence required to approve | Reopen condition |
|---|---|---|---|---|
| Visual direction | `DIRECTION PROPOSED` | Founder | Review all three directions in the local prototype | Founder preference or clearance concern |
| Signal Ledger recommendation | `PROPOSED` | Founder | Confirm it fits the desired market and product ambition | Strong preference for hospitality or civic tone |
| Product-face hierarchy | `PROPOSED` | Founder/product | Arm's-length legibility and sample print test | Print, material, or placement failure |
| Neutral tap journey | `PROPOSED`, required pilot default | Founder/product | Branch audit and current qualified policy review before launch | Source policy or legal review requires a change |
| Dashboard IA | `PROPOSED` | Founder/product | Owner walkthrough on desktop and mobile | Users cannot identify the next action |
| Homepage structure | `PROPOSED` | Founder/product | Copy and conversion review after identity selection | Offer or price model changes |

Nothing in this handoff is marked `APPROVED`, `FINAL`, or `PRODUCTION READY`.

## 6. Audience and task model

| User | Context | Primary task | Observable success |
|---|---|---|---|
| Business owner | Between customer interactions | See what needs attention today | Identifies setup, devices, review work, and freshness without help |
| Location manager | Daily operation | Verify placement and response coverage | Finds an inactive or underused device and assigns follow-up |
| Frontline staff | At a customer handoff | Offer a neutral prompt | Uses the correct face and language without explaining technology |
| Customer | After a genuine interaction | Review publicly or contact the business | Sees both options immediately and understands the handoff |
| Founder/operator | Pilot fulfillment | Configure, support, and learn within capacity | Can distinguish a product issue, source issue, and setup issue |

## 7. Information architecture

```text
Scantap launch system
├── Identity
│   ├── Signal Ledger
│   ├── Copper Circuit
│   └── Civic Current
├── Physical products
│   ├── Counter stand
│   ├── Staff card
│   └── Adhesive plate
├── Public journey
│   ├── Equal-choice landing
│   ├── Public review handoff
│   └── Direct support handoff
├── Operator dashboard
│   ├── Overview and setup
│   ├── Reviews
│   ├── Interactions
│   ├── Devices and locations
│   ├── Reports
│   └── Settings
└── Marketing site
    ├── Outcome and trust contract
    ├── Three formats
    ├── Dashboard value
    ├── Honest-review standard
    └── Pilot interest
```

Dashboard ordering follows action value, not database structure: setup and exceptions first, performance second, work queue third, device evidence fourth, freshness always visible.

## 8. Route, workflow, and state matrix

| Surface | Entry | Primary action | Success | Empty/loading | Stale/error | Permission |
|---|---|---|---|---|---|---|
| Physical face | Customer sees product | Tap or scan | Neutral landing opens | QR remains peer fallback | Replacement/support is operational, not simulated here | Not applicable |
| Public landing | Dynamic destination | Choose review or support | Explicit handoff | Destination must never show a false completion | Truthful recovery; no fabricated provider action | Only approved contact routes appear |
| Review handoff | Review choice | Continue to provider | Provider owns completion | No internal “review completed” event | Provider failure names dependency | Provider/account rules apply |
| Support handoff | Support choice | Call/email/message | Chosen channel owns delivery | No unsent message appears sent | Channel failure remains visible | Only owner-approved channels |
| Dashboard overview | Authenticated account | Resolve next task | Exact object/action confirmed | Dedicated empty and loading contracts | Last-confirmed values and source timestamps preserved | View and publish roles remain distinct |
| Homepage | Direct/referral traffic | Explore products/dashboard/pilot | Intent captured later through a real form | No false social proof | Form failure must preserve input later | Not applicable |

The local prototype implements branch and state simulation only. Authentication, persistence, provider APIs, delivery, payments, and a real pilot form are outside this artifact.

## 9. Design-system definition

The system is derived from four domain objects:

- **Receipt:** quiet paper-colored background, compact evidence labels, dates, and source language.
- **Counter:** stable neutral surfaces and physical-object staging.
- **Signal:** one routed accent that marks movement, current action, and trusted continuity.
- **Ledger:** clear rows, ownership, timestamps, and explicit state transitions.

Hierarchy:

1. Task or outcome headline.
2. Current evidence and freshness.
3. Primary action.
4. Supporting metadata.
5. Explanatory or prototype boundary.

Depth:

- Application: borders and surface shifts; shadows reserved for overlays.
- Physical and marketing renders: restrained object shadows are allowed to communicate material form.
- No arbitrary gradients. The dashboard chart uses a single semantic data fade.

Spacing uses a 4 px base with an 8-point layout rhythm. Touch targets are at least 44 px where the layout permits. Content width is constrained by job, not a single global maximum.

## 10. Tokens

| Token | Signal Ledger value | Purpose |
|---|---|---|
| `--receipt` | `#f4f2ec` | Page and physical paper field |
| `--counter` | `#e8e5dc` | Product staging and muted section |
| `--surface` | `#fbfaf7` | Quiet contained surface |
| `--surface-raised` | `#ffffff` | Active/raised surface |
| `--graphite` | `#151716` | Primary text and dark shell |
| `--ink-secondary` | `#454945` | Supporting prose |
| `--ink-muted` | `#6d726d` | Metadata |
| `--line` | `#d7d4ca` | Default boundaries |
| `--line-strong` | `#b9b6ad` | Controls and stronger separation |
| `--signal` | `#2d5bff` | Current route and primary action |
| `--signal-strong` | `#143dd5` | Accent text and hover |
| `--signal-soft` | `#e7edff` | Accent field |
| `--success` | `#1e7b57` | Confirmed success |
| `--warning` | `#a06112` | Delayed/watch state |
| `--critical` | `#b43c37` | Failed state |
| `--focus` | `#0c69c8` | Keyboard focus |
| `--display-font` | Bahnschrift fallback stack | Display and evidence labels |
| `--body-font` | Segoe UI Variable fallback stack | Body and application text |

Copper Circuit and Civic Current override the material, ink, accent, and display-font tokens without changing semantic meaning or component contracts.

## 11. Component inventory

| Component | Variants | Key contract |
|---|---|---|
| Studio view tabs | Desktop row, mobile disclosure | Arrow-key tab movement and selected state |
| Direction card | Recommended, exploratory, previewing | Recommendation and active preview remain distinct |
| Signal rail | Process and compact mark | Nodes represent a real sequence, not decoration |
| Product face | Stand, card, plate; light/dark | Prompt leads; NFC and QR remain peers |
| QR position study | Standard and compact | Always labeled non-scannable in prototype |
| Tap action | Review and support | Equal visual weight and interaction cost |
| Button | Primary, secondary, inverted, text, icon | One primary action per local task |
| State switcher | Seven prototype states | Changes view only; never persists |
| Setup panel | Completed and next steps | Appears before analytics when setup is the job |
| Metric feature | Review momentum chart | Provider reviews remain distinct from interactions |
| Metric ledger row | Interaction, review open, coverage | Unit/denominator is visible |
| Review queue row | Draft, unassigned, due | Ownership and time remain visible |
| Device health row | Online and watch | Placement, freshness, and count remain visible |
| State panel | Empty, loading, stale, error, permission | Explains what happened and what is safe next |
| Homepage product card | Three moments | Context before format |

## 12. Responsive behavior

| Width | Behavior |
|---|---|
| `>1180 px` | Three-direction comparison, two-column product stage, persistent dashboard sidebar, dashboard work grids |
| `901–1180 px` | Direction comparison wraps; dashboard metrics/work stack; sidebar remains until tablet threshold |
| `641–900 px` | Studio navigation becomes a disclosure; dashboard uses mobile navigation; core two-column stories stack |
| `≤640 px` | Single-column content, 18 px page gutters, vertical setup steps, review metadata simplifies, full-width actions |

Validation targets:

- Desktop: `1440 × 1000`
- Tablet: `1024 × 768`
- Mobile: `390 × 844`

No essential information is encoded only by hover. Dashboard state controls are horizontally scrollable at narrow widths. Product faces preserve their physical aspect ratios. The mobile dashboard keeps overview navigation reachable at the bottom.

## 13. Accessibility

Target: WCAG 2.2 AA for the eventual implementation.

Implemented locally:

- Semantic buttons, links, headings, labels, fieldset/legend, navigation landmarks, and hidden-panel behavior.
- Skip link and visible `:focus-visible` treatment.
- Header view tabs support arrow, Home, and End keys.
- State and theme controls expose pressed or selected state.
- Decorative SVGs are hidden; informative trend/state content has text or labels.
- Color is paired with text, icons, source labels, or timestamps.
- Motion is limited to transform/opacity-style microinteractions and disabled under `prefers-reduced-motion`.
- Tap journey choices use matching hierarchy and target size.

Still required before production:

- Screen-reader walkthrough in at least NVDA/Chrome and VoiceOver/Safari.
- Contrast measurement after identity approval and real content.
- Zoom/reflow test through 200% and text-spacing overrides.
- Real validation/error announcements for forms and provider actions.
- Captions/transcripts if video or audio is introduced.

## 14. Blockers

| Blocker | Blocks | Resolver | Safe work meanwhile |
|---|---|---|---|
| Founder has not selected a direction | Identity freeze and production styling | Founder | Compare all three local directions |
| Product samples are untested | Print dimensions, NFC position, adhesive, and final face size | Founder/product after spend approval | Use proportional face templates |
| Landed cost is unknown | Public prices and inventory quantity | Founder/suppliers after outreach or purchase approval | Use the comparison formula and sample-first basket |
| Name/domain/handle/trademark clearance is not complete | Public identity investment | Founder and qualified owners | Keep Scantap as an internal working brand |
| Production architecture and accounts do not exist in scope | Auth, data, API, persistence, delivery, payments | Later build owner | Keep fixtures and contracts explicit |
| Current legal/platform review of the final journey is pending | External launch | Founder and qualified reviewers | Preserve the rating-free equal-choice default |

## 15. Prototype evidence log

| Evidence | Status | Artifact / expected artifact | Notes |
|---|---|---|---|
| Three directions | Implemented locally | `prototype/index.html` → Directions | Founder selection pending |
| Product faces | Implemented locally | `prototype/index.html` → Product faces | White/black and business-name preview |
| Neutral journey | Implemented locally | `prototype/index.html` → Tap journey | No external action occurs |
| Dashboard architecture | Implemented locally | `prototype/index.html` → Dashboard | Synthetic data notice is persistent |
| State contracts | Implemented locally | `prototype/index.html` → States | Success included in gallery; seven dashboard preview modes |
| Homepage structure | Implemented locally | `prototype/index.html` → Homepage | Internal pilot copy only |
| Identity visual QA | `PASSED LOCALLY` | [`evidence/identity-directions-desktop.png`](evidence/identity-directions-desktop.png) | Three directions visible together at `1440 × 1000` |
| Product-face visual QA | `PASSED LOCALLY` | [`evidence/product-faces-desktop.png`](evidence/product-faces-desktop.png) | Stand and card above the fold; black/white and business-name controls verified |
| Dashboard desktop QA | `PASSED LOCALLY` | [`evidence/dashboard-desktop.png`](evidence/dashboard-desktop.png), [`evidence/dashboard-setup-desktop.png`](evidence/dashboard-setup-desktop.png) | Active and setup-first views at `1440 × 1000` |
| Dashboard mobile QA | `PASSED LOCALLY` | [`evidence/dashboard-mobile.png`](evidence/dashboard-mobile.png) | `390 × 844`; fixed bottom navigation and accessible drawer verified |
| Tap-journey mobile QA | `PASSED LOCALLY` | [`evidence/tap-journey-mobile.png`](evidence/tap-journey-mobile.png) | Equal review/support choices visible at `390 × 844` |
| State-gallery QA | `PASSED LOCALLY` | [`evidence/states-desktop.png`](evidence/states-desktop.png) | Empty/loading/stale row visible at desktop target |
| Homepage desktop/mobile QA | `PASSED LOCALLY` | [`evidence/homepage-desktop.png`](evidence/homepage-desktop.png), [`evidence/homepage-mobile.png`](evidence/homepage-mobile.png) | Desktop and mobile hierarchy verified |
| Interaction/console QA | `PASSED LOCALLY` | Browser run, 2026-07-31 | Theme, product, journey, state, drawer, and keyboard interactions passed; zero browser warnings/errors |
| Responsive overflow QA | `PASSED LOCALLY` | Browser run, 2026-07-31 | Document `scrollWidth` equaled `clientWidth` at `1440`, `1024`, and `390` targets |
| Visible-control semantics | `PASSED FOR CHECKED VIEW` | Tablet dashboard browser run | 30 visible interactive controls; zero unnamed and zero below 24 px in either dimension |

## 16. Functional preservation

| Contract | State | Evidence / limitation |
|---|---|---|
| Review and support visible together | `PRESERVED` | Landing prototype gives both equal action cards |
| No rating gate or sentiment collection | `PRESERVED` | No star/rating question exists in public journey |
| Interaction is not a completed review | `PRESERVED` | Dashboard labels interactions, link opens, and provider reviews separately |
| Unknown/stale is not zero | `PRESERVED` | Dedicated empty, stale, loading, and error states |
| Last-confirmed data survives a source error | `PRESERVED IN DESIGN CONTRACT` | Requires production implementation and tests |
| Authentication and tenant boundaries | `UNKNOWN — VERIFY` | No runtime or account model in scope |
| Provider API behavior | `UNKNOWN — VERIFY` | No approved project, OAuth flow, or test account |
| Form delivery and persistence | `UNKNOWN — VERIFY` | Homepage CTA is intentionally inert |
| Payments, taxes, receipts, and refunds | `UNKNOWN — VERIFY` | No commerce implementation exists |
| NFC/QR resolution and revocation | `UNKNOWN — VERIFY` | Product graphics are non-scannable studies |

## 17. Implementation handoff and acceptance criteria

The later production build should implement the accepted direction without weakening the state and honesty contracts.

Acceptance criteria:

1. Founder-approved direction is recorded before token freeze.
2. Public journey always exposes review and support together before any sentiment question.
3. Review provider opens, interactions, and provider-confirmed reviews use distinct events and labels.
4. Desktop, tablet, and mobile match the intended hierarchy without horizontal page overflow.
5. Every async surface has loading, empty, stale, error, success, and permission behavior where applicable.
6. Source and freshness remain beside provider-derived data.
7. Controls are keyboard reachable with visible focus and correct accessible names.
8. Reduced-motion preference removes nonessential animation.
9. Real forms preserve input and never report success without server confirmation.
10. Tenant and role tests prove one customer cannot see or act on another customer's data.
11. NFC and QR are tested on the approved device/material matrix before field use.
12. No public price, turnaround, outcome, or compliance claim is published without its evidence gate.

Required implementation evidence:

- Component and token mapping to the approved direction.
- Automated event-semantic and tenant-isolation tests.
- Browser matrix screenshots at the three target viewports.
- Keyboard and screen-reader notes.
- Provider/API fixture and failure-state tests.
- Sample-device QA log.

## 18. Runtime and next owner

| Owner | Availability | Relationship | Next bounded work |
|---|---|---|---|
| `product-design-and-prototype` | `AVAILABLE` | `APPLIED IN THIS TASK` | Founder review, direction revision, and approved-system freeze |
| `production-build-and-integration` | `AVAILABLE` | `RECOMMENDED ONLY` | Begin only after direction and functional contracts are accepted |
| `production-launch-gate` | `AVAILABLE` | `RECOMMENDED LATER` | Verify samples, policy, payments, privacy, and release evidence before pilot |
| `post-launch-operations` | `AVAILABLE` | `NOT YET APPLICABLE` | Operate only after a real pilot exists |

No skill invocation or local prototype creates authority to push, deploy, spend, contact vendors, connect production accounts, or launch publicly.

## 19. Plain-English summary

Scantap now has a coherent proposed launch system rather than a collection of generic review-card screens. Signal Ledger is the recommended identity: quiet receipt and graphite surfaces, one cobalt signal, and ledger-like evidence. The same hierarchy drives the counter stand, staff card, adhesive plate, customer journey, dashboard, and homepage. The prototype is local and synthetic. The founder's next design decision is to select Signal Ledger, Copper Circuit, or Civic Current; samples, costs, clearance, production integrations, and launch evidence still remain separate gates.
