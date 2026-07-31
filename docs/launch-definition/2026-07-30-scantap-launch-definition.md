# Scantap launch definition

- Created: 2026-07-30
- Last updated: 2026-07-31
- Status: design-ready v0.3; local prototype and supplier listing evidence incorporated; founder selection and economics remain to be tested
- Decision owner: Founder
- Canonical public name: Scantap Reviews
- Normal shorthand: Scantap

## 1. Executive summary

- **Decision to make:** Define the smallest credible Scantap pilot that can test demand, product fit, fulfillment, dashboard value, the three-business-day configuration target, and founder-led door-to-door selling without committing to a large catalog or premature SaaS build.
- **Recommended direction:** Pilot a counter stand, staff card, and adhesive plate in black and white, with bounded customization available for each, on one shared NFC/QR/dynamic-destination system. Start locally in Cincinnati with a thin GetTap-inspired dashboard and a founder offer that is accessible but not positioned as the absolute cheapest.
- **Why now:** The founder has supplied the launch geography, budget, capacity, SKU targets, visual references, and dashboard preference. The remaining work is no longer broad discovery; it is to prove landed cost, fulfillment, product reliability, willingness to pay, and the operator time behind the dashboard and managed tier.
- **Decisive evidence:** The founder has locked the three launch formats, black/white defaults, customization availability, Cincinnati starting market, roughly $200 first-month budget, 10–30 weekly hours, and a clean, professional, useful dashboard direction led by GetTap. Current competitor prices establish a practical market band but do not prove Scantap margins or demand.
- **Material uncertainty:** Supplier and landed costs, exact materials and dimensions, payment/tax workflow, brand identity, live dashboard data access, managed-service labor, and the scope that fits the three-business-day target remain unknown.
- **Immediate owner action:** Select one of the three proposed identity directions, then source and test the sample-first basket before publishing prices. Signal Ledger is recommended; the local product, journey, dashboard, state, and homepage prototype is ready for founder review.

## 2. Mode, scope, authority, and decision owner

- **Primary mode:** `PRODUCT`
- **Secondary overlay:** `RESEARCH / EVIDENCE`, because current Google, FTC, supplier, pricing, and integration facts constrain the product.
- **Outcome:** A prioritized pilot brief that enables product sampling, website and dashboard design, and a controlled local test without invented business facts.
- **In scope:** Physical NFC/QR offer, activation and destination flow, dashboard MVP, managed-operation boundary, website strategy and sitemap, 30-day door-to-door pilot, assumptions, decisions, risks, and acceptance criteria.
- **Out of scope:** Sibling-company service delivery, full proprietary multi-tenant SaaS, production integrations, public deployment, purchasing, vendor or prospect outreach, legal conclusions, entity formation, domain purchase, trademark filing, and public pricing.
- **Authority:** Read-only inspection and research plus separately authorized local repository setup and local planning artifacts. No remote push, public deployment, spend, account creation, production data access, or external representation.
- **Decision owner:** Founder.
- **Contributors / consulted owners:** Scantap product and operations; Sunderdas for identity work beyond templates; Madagin for later public-site implementation or deep web integration; Profosi for later campaigns and distribution; Callirus for later voice-signal integration; Unigentamos for portfolio governance.
- **Deadline / decision window:** The first-month pilot should begin only after sample, cost, policy, and payment readiness gates pass. No calendar launch date is yet confirmed.
- **Material constraints:** Founder is based in Cincinnati, Ohio, has roughly `$200` available for month one, and expects `10–30 hours/week` of personal capacity. Low starting overhead does not prove scalable custom margins. Public review access cannot depend on sentiment. The customer must not need to understand the wider portfolio.
- **Checks not run:** No supplier quote or contact, physical sample, live NFC encoding, payment/tax setup, domain/handle/trademark clearance, production Google account, OAuth flow, live customer data, deployed site, or production runtime was inspected. Public supplier listings and the local static design prototype were inspected; neither proves landed cost or production behavior.

## 3. Current-state findings

Observation dates: 2026-07-30 through 2026-07-31.

| Domain | Current finding | Confidence | Evidence | Limitation |
|---|---|---|---|---|
| Local repository/worktree | Canonical workspace is `C:\Users\Ocean\Documents\Project Breadnfc`, aligned to branch `main` with the verified `origin` remote; it now contains the launch brief, supplier comparison, and static design prototype | `CONFIRMED` | Local Git inspection, local prototype, and browser QA in this session | Inspect Git for the current local HEAD; the prototype is not a production application |
| Remote | `ocnbtl/projectbreadnfc`, repository ID `1317840003`, is public, size `0`, default branch `main`, and returns `409 Git Repository is empty` for commit listing | `CONFIRMED` | GitHub repository metadata and commit query, 2026-07-30 | No remote branch ref or commit exists |
| Provider/deployment | No provider or deployment is confirmed | `UNKNOWN / NOT CONFIRMED` | No deployment evidence in the repository or continuation evidence | Absence was not tested across every provider account |
| Live behavior | No website, dashboard, redirect service, NFC product, or integration was run | `UNKNOWN / NOT CONFIRMED` | Checks not run | No runtime exists in the inspected scope |
| Intended behavior | Hardware creates a low-friction entry; dashboard and managed service create recurring value | `CONFIRMED` | Founder direction, persisted Scantap model, and live Figma strategy page | Intent is not market validation |
| Founder operating baseline | Cincinnati launch; roughly `$200` first-month budget; `10–30 hours/week` available | `CONFIRMED` | Founder instruction, 2026-07-31 | Actual weekly availability and spend allocation may vary |
| Physical launch scope | Counter stand, staff card, and adhesive plate; black and white available; customization available for each | `CONFIRMED` | Founder instruction, 2026-07-31 | Supplier feasibility, exact materials, minimums, and margin remain unverified |
| Brand/dashboard direction | No established brand identity; clean, professional, efficient dashboard with useful information, using GetTap as the strongest structural reference | `CONFIRMED` | Founder instruction plus live reference inspection, 2026-07-31 | Inspiration is not permission to copy trade dress or product-specific IA |
| Figma strategy page | Node `20:3` contains the Scantap model, three-layer offer, reference patterns, guardrail, and portfolio ownership | `CONFIRMED` | Live Figma metadata inspection, 2026-07-30 | Within the inspected page metadata, no dedicated Scantap logo, asset library, or design-token system was found; this is not proof none exists elsewhere |
| Production/customer data | No production customer, device, order, review, payment, or event data is confirmed | `UNKNOWN / NOT CONFIRMED` | No pipeline or dataset in the inspected repository | Unknown must not be reported as zero until the founder confirms the operational baseline |

## 4. Source-of-truth hierarchy

| Rank / domain | Source | Role | What it governs | Date/version | Authority | Limitation or conflict |
|---:|---|---|---|---|---|---|
| 1 | Founder’s latest explicit instructions | Normative | Intent, naming, offer structure, quality bar, pilot stance, constraints, and authority | Through 2026-07-31 | Decision owner | May change after pilot evidence |
| 2 | Current local Git inspection | Empirical local | Workspace, branch, remote configuration, and files | 2026-07-30 | Direct inspection | Does not prove GitHub or deployment state |
| 3 | GitHub `ocnbtl/projectbreadnfc` metadata | Empirical remote/provider | Repository identity, visibility, default branch, permissions, and emptiness | 2026-07-30; ID `1317840003` | Direct provider evidence | Does not prove local or future state |
| 4 | `SCANTAP_REVIEWS_MODEL.md`, portfolio README, and funnel review | Normative planning/history | Category, layers, offer ladder, portfolio boundaries, and rejected directions | 2026-07-30 | Persisted strategy | Strategy, not operational proof |
| 5 | Figma file `Sunderdas Company Foundation`, node `20:3` | Current visual-planning evidence | Existing Scantap strategy-board content | Inspected 2026-07-30 | Live file metadata | Not an approved identity, UI, or implementation |
| 6 | Current Google Business Profile/Maps documentation and FTC guidance | External authoritative | Review solicitation, access, API prerequisites, review data, incentives, and suppression risk | Inspected 2026-07-30 | Platform owner and U.S. regulator | Not legal advice; applicability is fact-specific |
| 7 | Founder-supplied competitor and design-reference sites | External reference | Current merchandising, price-band, dashboard, motion, and component-pattern hypotheses | Inspected 2026-07-31 | First-party sites and public libraries | Their claims and designs are not accepted as Scantap evidence or copied |
| 8 | This document’s provisional assumptions | Assumption | Reversible pilot defaults | 2026-07-31 v0.3 | Planning convenience only | Cannot support public claims or irreversible spend |

**Conflict rule:** Founder intent governs desired product behavior; inspected local and provider evidence governs current technical state; official platform and legal sources govern their respective constraints. Material conflicts remain visible until the appropriate owner or evidence resolves them.

## 5. Evidence, confidence, and contradictions

### Evidence ledger

| Claim ID | Claim | Evidence | Confidence | Scope | Limitation | Decision impact | Next verification |
|---|---|---|---|---|---|---|---|
| `E-01` | The remote exists and remains empty | GitHub metadata and empty commit response | `CONFIRMED` | GitHub repository | Volatile | Local docs are the baseline; no merge is needed | Recheck before first push |
| `E-02` | The founder wants a physical-product entry with recurring software and managed tiers | Founder direction and strategy documents | `CONFIRMED` | Offer structure | Final prices and tier boundaries remain open | Preserve the ladder while narrowing the pilot | Test paid demand and operating load |
| `E-03` | The pilot should not force one untested vertical | Founder direction | `CONFIRMED` | Initial go-to-market | A completely unbounded walk-in sample would be hard to learn from | Use three contexts and tag every result | Compare conversion and support by context |
| `E-04` | Google permits asking customers to use a review link or QR code and emphasizes honest, balanced reviews | Google Business Profile review guidance | `CONFIRMED` | Google review requests | Does not approve every Scantap flow | NFC/QR can link to an honest-review path | Review the final journey before launch |
| `E-05` | Google prohibits paid, fake, or biased engagement and incentives for posting, changing, or removing reviews | Google Maps policy and Business Profile guidance | `CONFIRMED` | Google Maps/Business Profile | Other platforms may differ | Do not use incentives in the pilot | Recheck platform-specific rules if destinations expand |
| `E-06` | FTC guidance exposes reputation-management companies to liability for fake reviews, sentiment-conditioned incentives, or suppression conduct | FTC Consumer Reviews and Testimonials Rule Q&A | `CONFIRMED` | U.S. federal rule/guidance | Fact-specific and not a complete legal conclusion | Use neutral routing and retain legal review before launch | Qualified review if the final flow is rating-dependent |
| `E-07` | Google Business Profile API use requires project approval and OAuth for protected data; the API can list reviews and manage replies | Google developer documentation | `CONFIRMED` | Google Business Profile API | Approval, client authorization, and no sandbox constrain timing | Keep live API outside the pilot’s critical path | Validate access with an approved test account later |
| `E-08` | Scantap does not currently have an established brand identity | Founder confirmation plus Figma metadata for node `20:3` | `CONFIRMED` | Current supplied assets and founder knowledge | Domain/handle/trademark work remains unverified | Treat identity as a design task, not a missing-file search | Explore identity directions before visual freeze |
| `E-09` | The founder has fixed the launch formats and default colors | Founder instruction, 2026-07-31 | `CONFIRMED` | Pilot catalog | Supplier feasibility and costs remain open | Specify all three formats in black and white, with customization | Validate samples, minimums, and cost |
| `E-10` | Current comparable hardware spans roughly `$15.95–$44.95` for standard/custom cards, plates, and stands on Tap Tag; Digifeel lists `$29.90` cards and `$39.90` plates | First-party public product pages inspected 2026-07-31 | `CONFIRMED` | Observed current list/sale prices | Promotions change; products and included software differ | Use as a hypothesis band, not a margin model | Recheck at pricing publication and compare landed Scantap cost |
| `E-11` | Tap Tag lists a free tier and a `$19/month` Review+ tier; Review Monkey markets no-contract software and white-glove onboarding but does not expose plan prices in crawlable text | First-party pricing/features pages inspected 2026-07-31 | `CONFIRMED` | Adjacent software offers | Feature scope is not equivalent to Scantap | A low optional monthly tier is plausible, not yet validated | Test willingness to pay and operator load |
| `E-12` | GetTap’s public dashboard presentation prioritizes setup tasks, a restrained navigation shell, date-filtered performance, active members, and top performers | Live visual/DOM inspection, 2026-07-31 | `CONFIRMED` | Public marketing screenshot only | It is a lead/team product, not a reputation dashboard | Borrow hierarchy and setup-first logic, not its metrics or styling | Validate Scantap-specific wireframes with business owners |
| `E-13` | A modular sample path can cover both card colors, on-metal NFC cores, one stand body, inserts, and adhesive without a 500-unit custom minimum | Public supplier listings and [supplier comparison](../research/2026-07-31-supplier-cost-comparison.md), 2026-07-31 | `CONFIRMED AS LISTING EVIDENCE` | Read-only sample arithmetic | Shipping, tax, FX, stock, quality, and labor remain unknown | Prefer one sample-first basket after explicit spend approval | Verify checkout totals and physically test every material stack |
| `E-14` | Three identity directions and responsive product, journey, dashboard, state, and homepage views now exist locally | [Design handoff](../design/2026-07-31-scantap-design-handoff.md) and browser evidence, 2026-07-31 | `CONFIRMED LOCALLY` | Static design prototype | Founder approval and production integration remain absent | Move from open exploration to founder direction selection | Founder selects A, B, or C and records approval |

### Contradictions

| ID | Claim A | Claim B | Source/date difference | Impact | Status | Exact resolution step | Owner |
|---|---|---|---|---|---|---|---|
| `C-01` | v0.1 strategy recommended one initial customer type | Founder wants varied local door-to-door learning | Planning sources through 2026-07-31 | Sampling, collateral, and dashboard templates | Resolved for pilot | Test three contexts with shared eligibility and consistent tracking; narrow only from observed evidence | Founder after pilot |
| `C-02` | Premium-feeling customization should remain affordable | Supplier, design, proofing, and labor costs are unknown | Founder intent vs missing economics | Margin and turnaround | Unresolved | Time and cost every customization step; separate template customization from quoted studio work | Founder |
| `C-03` | Business-specific dashboard configuration should take about three business days | Modules, access, staffing, and revision load are unknown | Founder intent vs untested operation | Public promise and support load | Unresolved | Complete three timed configurations after all inputs are received before publishing an SLA | Founder |
| `C-04` | Optional low-rating support routing was contemplated | Rating-conditioned routing can create gating and trust risk | Founder concept vs refreshed policy/risk evidence | Compliance and customer agency | Resolved for pilot only | Use a rating-free first screen with review and support choices visible together; reopen only after current legal/platform review | Founder |
| `C-05` | A highly art-directed website is required | No brand identity exists yet | Founder references and confirmation, 2026-07-31 | Visual direction and stack | Resolved enough for exploration | Use supplied references by role, develop original identity directions, and validate one before high-fidelity production | Product/brand design |

## 6. Users and jobs supported

| User / role | Context or trigger | Job | Current pain or gap | Desired observable outcome |
|---|---|---|---|---|
| Founder/operator | Selling and fulfilling the first accounts | Demonstrate, sell, activate, configure, support, and learn without inventing a large operation | Offer and workflow boundaries are not yet concrete | A repeatable pilot can be run and measured with bounded labor |
| Local business owner | Considering an accessible reputation tool | Understand the offer, price, setup, and value quickly | Existing tools can feel generic, complex, or disconnected from physical use | Buys or declines with clear reasons and no hidden subscription confusion |
| Location manager | Running daily operations | Know where devices are placed, whether they work, and which reviews need action | Device and review work can be scattered | Sees tasks, status, and exceptions in one place |
| Frontline staff | At checkout or after service | Ask for an honest review without awkward scripts or policy risk | Requests are inconsistent and easy to forget | Uses the right device and a short, neutral prompt |
| Customer/reviewer | After a genuine experience | Leave an honest public review or contact the business directly | Review and support paths can be manipulative or confusing | Both options are clear, accessible, and voluntary |
| Scantap managed operator | Monitoring a managed client | Triage reviews, draft responses, escalate, report, and document authority | Manual work can become unauditable | Every action has an owner, status, approval, and evidence |

## 7. Requirements

### Functional requirements

| ID | Requirement | Source / rationale | Priority | Dependencies | Verification |
|---|---|---|---|---|---|
| `FR-01` | Every pilot device exposes both NFC and QR and resolves through an updateable tokenized destination | Locked product direction | Must | Product/supplier selection and redirect prototype | Test NFC and QR on the device matrix; change destination without replacing hardware |
| `FR-02` | The first destination screen shows “Leave an honest review” and “Contact the business” together without asking for a rating first | Policy/trust evidence | Must | Journey design | Side-by-side branch audit confirms equal visibility and no sentiment condition |
| `FR-03` | An authorized operator can activate, pause, reassign, and update a device destination with history | Operational safety | Must | Device registry | Fixture test covers success, invalid token, duplicate assignment, and rollback |
| `FR-04` | A new client receives a useful default dashboard immediately after activation | Founder intent | Must | Dashboard prototype and fixture data | Usability walkthrough completes without custom configuration |
| `FR-05` | Bounded business-specific configuration can be applied within a target of three business days after complete inputs | Founder intent | Must, target not public SLA | Configuration contract and staffing | Time three completed pilot configurations |
| `FR-06` | Scan/tap events, review-link clicks, support-link clicks, device, location, timestamp, and source channel remain distinct | Measurement integrity | Must | Redirect/event contract | Data dictionary and fixture tests preserve event semantics |
| `FR-07` | Review monitoring and replies can be added without making Google API approval a pilot dependency | Provider constraint | Must | Manual/fixture adapter first; API later | Portal works with fixtures/manual imports when provider is unavailable |
| `FR-08` | Managed operations support a queue for onboarding, review triage, response drafts, approvals, escalation, and monthly reporting | Offer ladder | Should | Service-tier decision | Task-flow walkthrough with accountable owner and audit state |
| `FR-09` | The website distinguishes default product purchase, custom-product inquiry, dashboard value, managed service, and multi-location inquiry | Conversion clarity | Must | Founder references, pricing/payment decisions | Sitemap and prototype test show a clear destination for each intent |
| `FR-10` | Every field interaction can be tracked from qualified visit through conversation, demo, sale, activation, use, support, and follow-up | Pilot learning | Must | Lead tracker and operating definitions | Pilot scorecard reconciles every stage denominator |

### Non-functional requirements

| ID | Quality attribute | Requirement / threshold | Scope | Verification | Owner |
|---|---|---|---|---|---|
| `NFR-01` | Accessibility | Public and dashboard prototypes target WCAG 2.2 AA; all critical actions work by keyboard and with reduced motion | Website, destination, dashboard | Automated checks plus keyboard/screen-reader review | Design/build owner |
| `NFR-02` | Performance | The public destination should target LCP at or below 2.5 seconds at the 75th percentile and avoid motion that blocks first action | Review/support destination | Local lab and later field telemetry | Build owner |
| `NFR-03` | Security | No secret, PII, or mutable destination URL is embedded directly in the NFC/QR payload; tokens are revocable | Device and redirect | Payload inspection and revocation test | Build owner |
| `NFR-04` | Tenant isolation | Organization, location, device, review, and response data cannot cross tenant boundaries | Dashboard/ops | Permission tests with two fixture organizations | Build owner |
| `NFR-05` | Auditability | Destination changes, role changes, and response publish actions retain actor, time, prior value, and authority | Dashboard/ops | Audit-log fixture and review | Build owner |
| `NFR-06` | Reliability | A failed provider import does not erase last-known data or present stale data as current | Dashboard | Dependency-failure test and freshness indicator | Build owner |
| `NFR-07` | Privacy | Collect only data needed for activation, support, measurement, and authorized review operations; define retention before production | All protected surfaces | Data inventory and retention review | Founder/privacy owner |

### Launch SKU contract

| SKU | Context | Locked variants | Shared technical contract | Customization boundary | Validation focus |
|---|---|---|---|---|---|
| `P-01 Counter Stand` | Fixed checkout, reception, waiting area | Black and white | NFC + printed QR; opaque device token; dynamic destination | Business logo/name/color adaptation through an approved template; bespoke structure/material quoted separately | Visibility, stability, cleanability, scan/tap reliability |
| `P-02 Staff Card` | Staff-carried, appointment closeout, mobile service | Black and white | Same contract | Business logo/name/color adaptation through an approved template; staff personalization only if unit economics support it | Durability, handoff script, accidental taps, field usability |
| `P-03 Adhesive Plate` | Door, mirror, counter edge, vehicle or equipment surface where appropriate | Black and white | Same contract | Business logo/name/color adaptation through an approved template; special shapes/materials quoted separately | Surface compatibility, removal, weather/cleaning resistance, anti-metal need, scan/tap reliability |

The three SKUs and both base colors are `LOCKED` founder inputs. Exact dimensions, materials, print method, packaging, and inventory quantity remain `PROPOSED` until samples and landed costs are verified. Bundles are merchandising combinations, not additional formats.

### Default-versus-custom configuration contract

| Layer | Included default | Bounded configuration | Quoted/custom work | Explicit exclusion |
|---|---|---|---|---|
| Physical product | Scantap neutral layout; approved review/support wording; black and white base variants | Business name, logo, up to two approved brand colors, one template family, one digital proof, one revision | New layouts, unusual materials, extensive brand adaptation, multi-SKU campaign systems | Unlimited revisions, full identity work, or untested rush promises |
| Destination | Business name, honest-review CTA, support CTA, privacy/support links | CTA labels within approved vocabulary, destination URLs, contact channel, location-specific details | Custom form logic or deep website integration | Rating-conditioned public-review access |
| Dashboard | Default overview, interactions, reviews, locations/devices, tasks, and settings | Module visibility/order, alert thresholds, roles, location groups, approved CTAs, report cadence | New modules, custom integrations, complex migrations | Custom application development inside the three-day target |
| Managed service | Standard onboarding, placement plan, monitoring queue, draft/approval workflow, monthly summary | Response voice guide, escalation contacts, approval rules, report focus | High-volume, regulated, multi-brand, or bespoke governance | Automatic publishing without explicit tier authority |

The three-business-day clock starts only after required inputs and access are complete. It pauses for missing assets, approvals, unavailable providers, or scope changes. This is a pilot target, not public SLA, until three timed configurations pass.

### Dashboard MVP information architecture

**Design direction:** Use GetTap’s restrained shell, setup-first hierarchy, high information density, and clear date controls as structural inspiration. Do not copy its trade dress, lead/team metrics, or decorative details. Scantap should feel calm, operational, and specific to reputation work.

#### Customer surface

1. **Overview:** the default landing page.
   - During onboarding, show a dismissible setup checklist before analytics: connect a review destination, activate the first device, confirm the support route, place the device, and invite a manager if needed.
   - Once active, show four primary measures: interactions, review-link clicks, new provider reviews, and response coverage. Each card includes its definition, comparison period, freshness, and source.
   - Follow with one interaction/review trend, a recent-review action queue, device/location health, and current tasks or alerts.
2. **Reviews:** review feed, rating, date, provider, response status, owner, theme tags, and escalation state.
3. **Interactions:** taps/scans, review-link clicks, support-link clicks, location/device/source breakdown, and persistent date range.
4. **Devices & locations:** locations, placements, device tokens, status, destination, last interaction, and reassignment.
5. **Responses:** draft, client approval, publish status, rejection/failure, and history.
6. **Reports:** monthly summary, export, data freshness, methodology notes, and plain-language interpretation.
7. **Settings:** destinations, team roles, notifications, service tier, retention/privacy controls, and support.

#### Dashboard interaction rules

- Tasks appear before metrics while setup is incomplete; the dashboard never celebrates zero-data charts.
- Empty states explain why data is absent and offer exactly one useful next action.
- A persistent date range applies consistently to all comparable analytics.
- “Tap,” “scan,” “review click,” and “completed provider review” remain distinct in labels and tooltips.
- Source and freshness are visible wherever provider data appears; stale or unavailable is never rendered as zero.
- Color is supplementary, not the only signal; destructive, warning, success, and neutral states have text/icon support.
- Charts earn their space by supporting a decision. No vanity gauges, 3D charts, or duplicate summaries.
- Desktop uses a compact sidebar and readable content width; mobile prioritizes tasks, review actions, and device status over dense analytics.
- Use an 8-point spacing system, a limited type scale, predictable card padding, and progressive disclosure for advanced configuration.
- All critical actions are keyboard accessible, have visible focus, and respect reduced-motion preferences.

#### Internal operations surface

1. Onboarding and activation queue.
2. Configuration requests, completeness, owner, due date, and SLA clock.
3. Device assignment, placement, QA, and exceptions.
4. Review triage, response draft, approval, and publish queue.
5. Sensitive-feedback escalation and client contacts.
6. Account health, service load, report status, and renewal/expansion signals.

#### What is intentionally deferred

- Cross-platform aggregation beyond the validated first provider.
- AI-generated “insights” without enough evidence or a visible source trail.
- Leaderboards that incentivize staff to pressure customers for reviews.
- Real-time claims when the underlying provider is delayed.
- Custom dashboard builders, arbitrary widgets, and bespoke client applications.

### Website brief and sitemap

**Working communication goal:** Make the physical product immediately understandable, then reveal the dashboard and managed program as the reason Scantap is more than an NFC-product store.

**Working descriptor:** “Reviews & reputation systems.”

**Primary conversion hypothesis:** Buy a default product or starter kit.

**Secondary conversions:** Request custom products, see the dashboard, discuss managed service, or qualify a multi-location need.

| Route | Job | Primary CTA | Required proof / content |
|---|---|---|---|
| Home | Understand Scantap in under one minute | Shop products | Physical-to-software story, three formats, honest-review guardrail, setup sequence |
| Products | Choose by physical context | View product | Counter, staff-carried, and adhesive context comparison |
| Product detail | Decide whether the format fits | Buy default / request custom | Dimensions, compatibility, setup, destination, shipping/returns once approved |
| Dashboard | Understand recurring utility | See dashboard / join pilot | Jobs, modules, fixture screenshots, data-source limits, configuration contract |
| Managed | Understand hands-on service | Request a conversation | Scope, approvals, escalation, reporting, exclusions |
| Multi-location | Qualify a complex need | Request a plan | Locations, roles, governance, reporting, integration boundaries |
| How it works | Reduce activation uncertainty | Start with a product | Tap/scan, neutral destination, activation, configuration, ongoing operation |
| Trust standards | Understand review integrity | Read standards | Honest reviews, no gating, no incentives, privacy, access model |
| Custom | Submit bounded customization need | Request custom | Included variables, one-proof contract, quoted-work boundary |
| Activate / Support | Complete setup or get help | Activate / contact support | Device code, business data, review URL, support channel, status |

**Visual and motion principles:**

- Human-directed, editorial, product-aware, and materially grounded rather than a generic SaaS template.
- Show real product context and operational detail once samples exist; do not fabricate product photography or customer proof.
- Use motion to explain tap-to-destination, product-to-dashboard, state change, and data flow.
- Motion must respect `prefers-reduced-motion`, preserve keyboard focus, avoid blocking the primary action, and remain performant on mobile.
- Use the founder’s libraries as research inputs by role: product flows, marketing composition, component behavior, icons, or motion. A library is not a coherent brand direction on its own.
- Favor brief state transitions, restrained stagger, and product demonstrations over constant parallax, autoplay spectacle, or animation attached to every scroll.
- The current Figma strategy board provides hierarchy and strategic language, not an approved visual identity.

### Annotated inspiration matrix

| Reference | Primary role | Borrow | Avoid or limitation | Status |
|---|---|---|---|---|
| GetTap | Dashboard structure and polished SaaS presentation | Restrained shell, obvious hierarchy, onboarding tasks before analytics, compact metric/recent-activity layout, clear date filter | Lead/team-specific metrics, trade-dress copying, enterprise complexity | Live visual/DOM inspection 2026-07-31 |
| Tap Tag home/products/pricing | Hardware, customization, dashboard connection, and U.S. price context | Immediate product/software relationship, dynamic destination, placement-based products, optional software | Catalog sprawl, permanent sale framing, review filtration, unsupported uplift claims | First-party pages inspected 2026-07-31 |
| Tap Tag MyTT summary | Software-story hierarchy | Concise “how it works,” proof-oriented sections, operational outcomes | Oversized empty space without added comprehension; vanity scale claims without Scantap evidence | Live visual/DOM inspection 2026-07-31 |
| Digifeel | Physical-product explanation and format comparison | Simple format matching, setup sequence, real product context | “Rank first,” “5x,” guaranteed doubling, and other claims Scantap cannot substantiate | First-party site inspected 2026-07-31 |
| Rocket Review Cards | High-contrast direct-response merchandising | Fast comprehension, strong product demo, decisive CTA hierarchy | Aggressive uppercase density, “5-star” and ranking promises, visual pressure | Live visual/DOM inspection 2026-07-31 |
| Review Monkey | Service-led reputation software | Ease of adoption, hands-on onboarding, centralized operations | “5-star” outcome framing, sentiment-routed language, dated mascot-heavy presentation | First-party site inspected 2026-07-31 |
| Reviews Card | Retail/catalog merchandising | Real product photography, benefits near purchase, comparison by placement, bundles | Deep launch catalog, persistent promotion bars, non-U.S. price assumptions | First-party site inspected 2026-07-31 |
| Nicelydone and Refero | Real-product flow and dashboard research | Search onboarding, dashboard, empty-state, filtering, table, permission, and activity patterns before designing | Using isolated screenshots without understanding flow, state, or accessibility | Live sites inspected 2026-07-31 |
| Details.so | Marketing composition and motion taxonomy | Research heroes, navigation, features, scroll animation, and transitions by category | Treating “exceptional” visuals as evidence of fit; motion without a user job | Live site inspected 2026-07-31 |
| InspoAI and Lazyweb | Broad ideation and growth exploration | Rapidly expand directions and discover adjacent references | Product decisions based on generated novelty or generic growth tactics | Public sites inspected 2026-07-31 |
| NameThatUI | Shared terminology | Name patterns precisely when discussing or searching UI | Using vocabulary as design validation | Public site inspected 2026-07-31 |
| UX Components | Component behavior and accessibility | Usage guidance, states, cross-system naming, W3C ARIA mapping | Copying the site’s visual theme; assuming beta guidance is infallible | Live visual/DOM inspection 2026-07-31 |
| Mx Icons | Candidate React icon library | Consistent linear/bold/mini variants, `currentColor`, tree-shakeable imports | Selecting before checking actual icon coverage, maintenance, visual fit, and bundle | GitHub README inspected 2026-07-31 |
| Shieldcn | Documentation/repository presentation | Status cards or badges only if later project documentation benefits | It is not a dashboard or marketing-site component system | Public site inspected 2026-07-31 |
| Palmier | Marketing restraint and product video tooling | Calm monochrome presentation and later short product demonstrations | Treating a video editor as a UI component authority; macOS-only production assumptions | Live visual/DOM inspection 2026-07-31 |
| Live Scantap Figma strategy page | Strategic hierarchy | Offer clarity, restraint, specialist ownership | Treating a strategy board as final identity or interface design | Metadata inspected 2026-07-30 |

**Working visual direction:** an original, primarily neutral interface with one distinctive brand accent to be chosen during identity exploration; generous but not wasteful spacing; real physical-product photography once samples exist; and motion reserved for cause-and-effect. The references establish a quality bar and research vocabulary, not a collage to reproduce.

### Primary workflows

| Workflow | Trigger | Preconditions | Happy path | Alternate / failure path | Recovery | Observable success |
|---|---|---|---|---|---|---|
| Device activation | Product is sold or assigned | Valid unused token and verified business/location | Scan device, verify business, bind location and destination, run NFC/QR QA | Invalid/duplicate token or wrong business | Quarantine token; preserve prior assignment; operator review | Both paths resolve correctly and assignment is logged |
| Customer review/support | Genuine customer taps or scans | Active device | Landing page shows both options; user chooses review or direct support | Destination unavailable or unsupported device | Accessible fallback URL and support contact | Choice is completed without sentiment prompt |
| Client onboarding | Product/dashboard sale | Complete intake and authority | Default dashboard activates; configuration request is scoped and timed | Missing access/assets or scope expansion | Clock pauses visibly; request returns to client | Default is usable and configured version is accepted |
| Review response | New review is available | Authorized provider/data and client rules | Operator drafts; approver accepts; authorized actor publishes | Provider failure, sensitive content, or rejection | Escalate, retain draft/status, retry safely | Published or explicitly escalated with audit history |
| Door-to-door sale | Qualified business accepts demo | Approved offer, terms, demo, and tracker | Need assessed, format demonstrated, order recorded, activation scheduled | No decision, mismatch, price objection | Record reason and consented follow-up | Every outcome has a stage and reason |

### State and edge-case matrix

| Surface / state | Empty | Loading | Success | Validation failure | Dependency failure | Permission failure | Recovery |
|---|---|---|---|---|---|---|---|
| Destination | No active assignment | Minimal non-blocking status | Both CTAs available | Invalid token | Redirect/provider unavailable | Not applicable to public action | Support fallback; operator alert |
| Dashboard | Explain what data will appear | Freshness indicator | Current fixtures/data with source | Bad configuration | Provider unavailable/stale | Action hidden or disabled with reason | Retry/import later; preserve last-known data |
| Device admin | No devices yet and activation CTA | Assignment in progress | Device, location, status, destination | Duplicate/invalid token | Registry unavailable | Unauthorized mutation blocked | Retry without losing prior assignment |
| Response queue | No reviews needing action | Provider sync in progress | Draft/approved/published states | Invalid reply | Provider rejection or timeout | Publish blocked without authority | Edit, reapprove, or escalate |

### Pilot metrics and decision consequences

| Metric | Type | Definition | Baseline | Provisional target | Window | Data source | Owner | Decision consequence |
|---|---|---|---|---|---|---|---|---|
| Qualified-visit conversation rate | Success | Owner/decision-maker conversations ÷ qualified visits | Gap | Measure; no vanity target before baseline | 30 days | Lead tracker | Founder | Adjust access hours, segment, or pitch |
| Demo-to-paid conversion | Success | Paid pilot accounts ÷ completed demos | Gap | At least 3 paid activations across at least 2 contexts, assuming 32 qualified visits; cap initial active pilots at 5 | 30 days | Lead/order tracker | Founder | Continue, revise offer, or stop |
| Activation completion | Quality | Devices passing NFC and QR QA ÷ devices assigned | Gap | 100% before placement | Per batch | QA checklist | Operator | Quarantine failed units |
| Default activation time | Operational | Operator minutes from complete input to tested assignment | Gap | Median at or below 30 minutes | First 10 activations | Task log | Operator | Simplify activation if missed |
| Config turnaround | Operational | Business days from complete intake to accepted configured dashboard | Gap | Three consecutive pilots within 3 business days | First 3 configurations | SLA log | Founder | Publish, narrow, or reject SLA |
| Config labor | Guardrail | Active operator hours per configured dashboard | Gap | At or below 4 hours for bounded configuration | First 3 configurations | Time log | Founder | Reprice or narrow scope |
| Interaction-to-review-click rate | Behavioral | Review-link clicks ÷ unique destination sessions | Gap | Learn baseline; do not equate with completed reviews | Per account, 30 days | Redirect events | Product owner | Improve placement/copy without gating |
| Support-contact rate | Behavioral | Support-link clicks ÷ unique destination sessions | Gap | Learn baseline | Per account, 30 days | Redirect events | Product owner | Inform client operations |
| Hardware unit gross margin | Guardrail | (Price − landed product, packaging, payment, warranty allowance, activation labor) ÷ price | Gap | Proposed floor 60% for a repeatable default SKU | Per SKU | Cost sheet | Founder | Do not scale or publish price below approved floor |
| Custom contribution margin | Guardrail | (Custom price − all variable cost and design/coordination labor) ÷ custom price | Gap | Proposed floor 50% | Per order | Cost/time sheet | Founder | Reprice, template, or decline |
| Defect/support load | Quality | Defective units and support minutes per activated account | Gap | Record every incident; threshold set after first batch | 30 days | QA/support log | Operator | Change supplier, format, or instructions |

### Positioning and pricing hypothesis

**Recommended position:** “Accessible reputation tools for owner-operated businesses,” not “the cheapest NFC card.” The differentiator is a well-made physical prompt, honest-review flow, useful dashboard, and local setup help with transparent boundaries. Hardware must remain usable without a subscription; paid software and service should be optional upgrades with no long contract during the pilot.

Current first-party comparison points inspected on 2026-07-31 include Tap Tag standard/custom cards from `$15.95/$29.95`, plates from `$24.95/$39.95`, stands from `$29.95/$44.95`, and Review+ at `$19/month`; Digifeel lists a `$29.90` card and `$39.90` plate. Promotions and feature scope vary, so these are market anchors, not proof of value or margin.

| Offer | Pilot price hypothesis | Included | Gate before publication |
|---|---:|---|---|
| Staff card | `$19` standard / `$39` template-custom | Programmed NFC + QR, activation, black or white | All variable cost at or below `$7.60` for standard at the 60% margin floor; custom labor fully timed |
| Adhesive plate | `$29` standard / `$49` template-custom | Programmed NFC + QR, activation, black or white | Surface/anti-metal QA and all variable cost at or below `$11.60` for standard |
| Counter stand | `$39` standard / `$59` template-custom | Programmed NFC + QR, activation, black or white | Stability/cleaning QA and all variable cost at or below `$15.60` for standard |
| Founder location kit | `$69` standard / `$109` template-custom | One of each format, setup, placement plan, 30-day Dashboard Essentials trial | Total variable cost at or below `$27.60` for standard; no hidden custom revisions |
| Control Portal | `$0` with hardware | Device status, destination changes, activation history, and a rolling 7-day interaction count | Ongoing redirect/control cost is supportable inside hardware margin |
| Dashboard Essentials | First 30 days included, then `$9/location/month` | Historical interactions, review/action overview, comparisons, alerts, and monthly summary | Usability and support load tested; software/payment/privacy basics ready |
| Managed Lite | `$49/location/month` pilot | Essentials plus monthly check-in, exception monitoring, and up to four response drafts | Hard cap of 60 active operator minutes/account/month; no sensitive or regulated response work |

These prices are `PROPOSED FOR TESTING`, not approved public prices. If a cost gate fails, Scantap should raise the price, change the supplier/specification, or decline the format—not subsidize an unprofitable promise. “Custom” means template customization with one proof and one revision; new identity or bespoke product design is separately quoted.

### Month-one budget and capacity

No purchase is authorized by this document. If the founder approves month-one spend, use staged caps rather than committing the full `$200` immediately.

| Use | Cap | Why |
|---|---:|---|
| Samples, freight, NFC/QR test materials | `$80` | Prove one example of each format before inventory |
| Packaging and printed demo/leave-behind materials | `$25` | Make in-person selling credible without overproducing collateral |
| Local travel and field-demo supplies | `$25` | Support two nearby field blocks per week |
| Basic software/domain/payment reserve | `$20` | Cover only an essential launch dependency once selected |
| Contingency, replacement, or proven-SKU reorder | `$50` | Protect against defect/freight surprises and preserve working capital |
| **Total maximum** | **`$200`** | Unspent amounts remain reserve |

Inventory rule: do not stock every format/color/custom combination. First obtain one sample of each format, with black and white represented across the sample set. After QA, hold only a tiny batch of the fastest format and sell other colors/custom work by paid order or deposit. Both colors can be available without both being carried in quantity.

Base founder schedule at `12 hours/week`:

- 4 hours: two compact field blocks in nearby Cincinnati business clusters.
- 2 hours: follow-up, qualification, and paid-order handling.
- 2 hours: activation, placement, and support.
- 2 hours: product/dashboard/design iteration.
- 1 hour: metrics and cost reconciliation.
- 1 hour: buffer.

At the 10-hour end, reduce prospecting before reducing QA or follow-up. At the 30-hour end, add field blocks and research, but keep the first active paid accounts capped at five until configuration and managed-service labor are measured.

### Pilot inclusion and exclusion

“Pilot exclusions” are not permanent bans or judgments about a business. They are the boundaries that keep the first month affordable, comparable, safe, and possible for one founder to support.

Include a business when it:

- Operates within a practical Cincinnati service radius, provisionally about 20 minutes from the founder.
- Has one location, or at most two simple locations, and an owner/decision-maker available.
- Has a claimed review profile or can verify authority to use the destination.
- Has regular, genuine customer interactions and a clear moment to present a stand, card, or plate.
- Accepts the neutral no-gating/no-incentive review standard.
- Will allow placement QA and a short weekly feedback check during the 30-day pilot.

Exclude from the first managed/dashboard pilot:

- Chains, franchises, or organizations with more than two locations.
- Businesses outside the practical Cincinnati service area or requiring shipping/rush fulfillment.
- Prospects asking for fake, incentivized, gated, or only-positive review collection, guaranteed rankings, or guaranteed review counts.
- Organizations without authority over the review destination or without genuine recent customer interactions.
- Bespoke fabrication, full brand-identity work, custom software, deep integrations, or unlimited revisions.
- Healthcare, financial, legal, childcare, and other sensitive/regulated response-management work until privacy, escalation, and approval procedures are validated. A simple hardware-only sale can be evaluated separately.

Pilot cohort: aim for `32` qualified visits across fixed-counter businesses, appointment/service locations, and mobile/home-service entrepreneurs, with roughly balanced representation. The stretch range is `48–60` only when the founder is consistently near the upper end of the time budget. Cap active paid pilots at five and require evidence across at least two contexts before narrowing the market.

## 8. Non-goals

| Non-goal | Why excluded | Revisit condition | Owner |
|---|---|---|---|
| Full multi-tenant SaaS before pilot | Workflows and demand are unvalidated | Repeated paid use justifies productization | Founder |
| Large product catalog | Adds inventory, merchandising, and support complexity | SKU-level demand and margin evidence | Founder |
| Automated response publishing by default | Requires client authority, provider access, and risk controls | Approved tier, audit trail, and client policy | Founder |
| Sentiment-conditioned review routing | Creates gating and trust risk | Current official guidance and qualified review approve a precise alternative | Founder |
| Cross-platform review aggregation in pilot | Multiplies provider and data complexity | Google workflow is validated and customers demand more | Founder |
| Custom client application work inside three-day configuration | Makes the promise unbounded | Separate quoted implementation scope | Founder |
| Public pricing or performance claims | Costs and results are not validated | Accepted cost model and pilot evidence | Founder |
| Public explanation of the Unigentamos portfolio | Adds client homework | Only disclose a specialist when it materially supports the engagement | Founder |

## 9. Constraints and guardrails

| Constraint / guardrail | Type | Source / authority | Impact | Reopen condition |
|---|---|---|---|---|
| Public brand is Scantap Reviews; Project Breadnfc is internal-only | Brand | Founder | Repository name must never leak into public surfaces | Founder changes naming |
| Ask for honest reviews; no gating, fake reviews, or sentiment-conditioned incentives | Trust/platform/legal | Founder, Google, FTC | Neutral destination and operating scripts | Only current authoritative guidance and qualified review |
| Review and support choices appear together without a rating prompt | Pilot product | Refreshed evidence and risk analysis | Removes rating-based branch in v0 | Approved alternative after review |
| Product catalog is limited to counter stand, staff card, and adhesive plate in black and white; each can be customized | Operations/product | Founder | Concentrates supplier and QA learning while satisfying launch scope | Founder changes scope after SKU evidence |
| Month-one cash spend cannot exceed roughly `$200` without a new founder decision | Finance | Founder | Requires staged samples, tiny inventory, and no paid advertising assumption | Founder changes budget |
| Founder capacity is planned around `12 hours/week` inside a `10–30` range | Capacity | Founder plus operating recommendation | Caps active paid pilots at five until labor is measured | Measured capacity and support load justify change |
| Pilot is local to a practical Cincinnati service radius | Go-to-market | Founder plus operating recommendation | Focuses field blocks and avoids shipping/rush complexity | Founder approves wider geography after local proof |
| Three-business-day configuration is a test target, not a public SLA | Business/operations | Founder intent plus missing evidence | Requires timed trials before publication | Three consecutive accepted configurations |
| Physical customization is templated; deeper identity work is quoted | Margin/portfolio | Founder direction and portfolio boundary | Protects turnaround and routes deep work to Sunderdas | Cost/capacity evidence |
| Client retains primary ownership of its Business Profile; Scantap uses authorized manager access when needed | Security/platform | Google role guidance and strategy guardrail | Avoids password sharing and ownership risk | Provider model changes |
| No production data or provider connection before explicit authority | Privacy/security | Founder authority boundary | Fixtures and manual paths first | Explicit approval and client authorization |
| No spend, public deployment, external outreach, or remote push in this phase | Authority | Founder continuation packet | Local planning only | Explicit founder approval |

### Neutral review/support journey contract

1. The device opens a Scantap-hosted location page through an opaque revocable token.
2. The first actionable view contains both:
   - **Leave an honest review**
   - **Contact the business**
3. Neither option depends on a star rating, sentiment answer, prior selection, identity, or incentive.
4. Both options have comparable visibility, readable labels, keyboard access, and no deceptive preselection.
5. The review action opens the client-approved public review destination.
6. The support action opens the client-approved phone, email, form, or messaging route.
7. Scantap records only the interaction events required for operation and measurement; a click is never reported as a completed review.
8. No review count, rating, ranking, or revenue improvement is guaranteed.

## 10. Data and integration implications

| Data / integration | Current owner | Proposed implication | Contract / schema | Privacy or trust boundary | Failure behavior | Consumer |
|---|---|---|---|---|---|---|
| Device registry | Scantap | Required for pilot | `device_id`, opaque token, format, status, org, location, placement, destination version | Token reveals no PII or mutable destination | Invalid/duplicate tokens quarantine without overwrite | Redirect, dashboard, ops |
| Redirect events | Scantap | Required for pilot | Event ID, device, location, timestamp/timezone, channel (`nfc`/`qr`), action (`landing`/`review_click`/`support_click`) | IP/device data minimized and retention defined | Queue/retry or mark gap; never fabricate events | Dashboard, pilot scorecard |
| Business/location configuration | Client + Scantap | Required | Organization, location, review URL, support channel, timezone, consented contacts | Tenant isolation and approval history | Last accepted version remains active | Destination, dashboard |
| Google review data | Google/client | Deferred adapter | External review ID, rating, text, timestamps, reply, source, freshness | OAuth, approved project, client authorization; reviewer data minimized | Fixtures/manual input remain usable; stale state visible | Dashboard, managed ops |
| Review replies | Client authority + Scantap workflow | Deferred publish integration | Draft, approver, approval time, publish actor, provider state, error | No publish without attributable authority | Retain draft and provider error; escalate | Client, managed operator |
| Orders/payments | `UNKNOWN / NOT CONFIRMED` | Needed before sales | Order, SKU, price, tax, payment, refund, fulfillment | Payment data stays with approved processor | No fulfilled order without accepted payment state | Storefront, operations |
| Support contact | Client | Configurable | Destination type and value, optional case reference | Do not expose private contact unintentionally | Fallback to approved public contact | Customer, client |
| CRM/lead tracker | Scantap | Manual pilot tracker first | Business, context, visit, conversation, demo, outcome, objection, consented follow-up | Minimize personal data and document consent | Offline/manual capture with reconciliation | Founder, pilot review |

### Data-source map by phase

| Dashboard area | Pilot source | Later source | Current status |
|---|---|---|---|
| Interactions | Local fixture or prototype redirect-event stream | Production redirect service | `PROPOSED` |
| Review volume/rating/feed | Fixture and client-confirmed baseline; manual entry only if provenance is retained | Google Business Profile API after approval/OAuth | `OPEN` |
| Response status | Manual managed-ops state | Google reply API plus audit state | `OPEN` |
| Devices/locations | Local device/configuration fixtures | Scantap registry | `PROPOSED` |
| Alerts | Rule evaluation on fixture/manual states | Event/provider notifications | `PROPOSED` |
| Themes | Manual tags in pilot | Assisted analysis with human review | `PROPOSED` |
| Orders/subscriptions | Manual order fixture | Approved commerce/payment provider | `UNKNOWN / NOT CONFIRMED` |

Integrity rules:

- A scan is not a review, a review click is not a completed review, and a drafted response is not a published response.
- Every external review retains provider provenance and immutable external identity.
- Every mutable destination and configuration retains version history.
- Unknown or unavailable provider data is shown as unknown or stale, never as zero.
- Tenant data and permissions never cross organizations.

## 11. Alternatives and tradeoffs

| Alternative | Benefits | Costs | Risks | Reversibility | Dependencies | Evidence that changes choice |
|---|---|---|---|---|---|---|
| A: One universal hardware format | Lowest sourcing and QA complexity | Tests only one placement context | False negative if the format, not offer, is wrong | High | One supplier/sample | Strong founder constraint or supplier economics |
| B: Three contexts on one shared system | Learns fixed, portable, and adhesive use without catalog sprawl | Three sample/QA paths | Slightly more operational load | High | Suppliers for stand/card/plate | Recommended unless sample economics fail |
| C: Managed location kit only | Tests recurring value quickly | Higher price and sales friction | Hides demand for simple one-time product | Medium | Service capacity | Strong managed demand and low hardware-only interest |

**Recommendation:** Alternative B for hardware.

| Alternative | Benefits | Costs | Risks | Reversibility | Dependencies | Evidence that changes choice |
|---|---|---|---|---|---|---|
| A: Full proprietary dashboard now | Maximum control | High build cost before evidence | Builds unused features and delays field learning | Low | Engineering, API access, security program | Strong paid demand with repeated workflows |
| B: Thin portal plus manual managed operations | Fast learning, visible recurring value, provider-independent | More operator work | Manual work may not scale | High | Fixtures, simple registry, clear tasks | Recommended for pilot |
| C: No portal | Fastest hardware launch | Does not test recurring value | Scantap becomes commodity hardware | High | None | Use only if founder explicitly isolates hardware test |

**Recommendation:** Alternative B for software/service.

| Alternative | Benefits | Costs | Risks | Reversibility | Dependencies | Evidence that changes choice |
|---|---|---|---|---|---|---|
| A: Unlimited low-cost customization | Attractive headline | Unbounded design/proof labor | Margin loss and missed turnaround | Medium | High operator capacity | Rejected unless time/cost evidence supports it |
| B: Template configuration plus quoted studio work | Predictable and still differentiated | Requires clear boundaries | Some buyers may want more included | High | Template system and proof process | Recommended |
| C: Default products only | Simplest operations | Leaves differentiation and demand untested | Misses premium custom opportunity | High | None | Use if custom margins fail |

**Recommendation:** Alternative B for customization.

## 12. Decision log and open questions

### Decision log

| ID | Topic | Status | Decision / options | Owner | Evidence / rationale | Date needed | Reopen or resolution condition |
|---|---|---|---|---|---|---|---|
| `D-01` | Public naming | `LOCKED` | Scantap Reviews publicly; Scantap normally; Project Breadnfc internal-only | Founder | Explicit founder instruction | Complete | Founder changes it |
| `D-02` | Offer ladder | `LOCKED` | Product → Dashboard → Managed → Multi-location | Founder | Explicit founder instruction | Complete | Pilot evidence changes structure |
| `D-03` | Initial vertical | `LOCKED` | Do not invent one; learn across a bounded mix | Founder | Explicit founder instruction | Complete | Access constraints force narrowing |
| `D-04` | Pilot product scope | `LOCKED` | Counter stand, staff card, and adhesive plate; black and white; customization available for each; one shared system | Founder | Explicit founder instruction, 2026-07-31 | Complete | Founder changes scope after sample evidence |
| `D-05` | Review/support flow | `PROPOSED` | Rating-free first screen with both options visible together | Founder | Lowest-risk interpretation of current evidence | Before prototype approval | Current qualified review approves a different precise flow |
| `D-06` | Dashboard approach | `PROPOSED` | Thin fixture/manual portal before live provider integration; GetTap-inspired restrained, setup-first structure with Scantap-specific jobs | Founder | Founder preference plus inspected dashboard evidence | Before build | Usability evidence or provider access changes sequence |
| `D-07` | Configuration target | `PROPOSED` | Test three-business-day target; do not publish it yet | Founder | Founder intent but no operating evidence | After 3 timed trials | Trial results |
| `D-08` | Full proprietary SaaS | `REJECTED` | Do not build before workflow demand | Founder/strategy | High premature cost | After pilot | Repeated paid workflows justify it |
| `D-09` | Operating envelope | `LOCKED` | Cincinnati; roughly `$200` month-one budget; `10–30 hours/week` founder capacity | Founder | Explicit founder instruction, 2026-07-31 | Complete | Founder changes constraints |
| `D-10` | Market position | `PROPOSED` | Accessible and transparent for owner-operated businesses, not cheapest-at-all-costs | Founder | Competitor price bands plus recurring-service ambition | Before public copy | Field objections, margins, or conversion evidence |
| `D-11` | Pilot pricing | `PROPOSED` | `$19/$29/$39` standard hardware; `$69` standard trio; `$9/month` Essentials; `$49/month` Managed Lite, with cost/time gates | Founder | Current first-party market anchors and small-business goal | After sample costs | Landed cost, payment fees, labor, or demand fails thresholds |
| `D-12` | Pilot eligibility | `PROPOSED` | Local, owner-accessible, one-to-two-location businesses with genuine customer moments; exclude risky, regulated, multi-location, rush, and bespoke scope | Founder | Budget, capacity, measurement, and trust guardrails | Before outreach | Founder accepts or edits exclusions |
| `D-13` | Brand identity | `PROPOSED` | Signal Ledger recommended; Copper Circuit and Civic Current remain alternatives | Founder/design owner | [Local design prototype](../../prototype/index.html), design handoff, and browser QA | Before visual freeze | Founder selects one direction; later clearance evidence can still reopen the choice |

### Remaining decision checkpoints

The founder’s latest answers unblock local design and pilot preparation. These checkpoints remain before external execution:

1. **Existing operational baseline:** Confirm whether any supplier, sample, product, prospect, domain, payment, or dashboard work already exists outside this repository so it is not duplicated.
2. **Economics and readiness:** Accept, revise, or reject `D-11` and `D-12` after sample costs, QA, payment/tax handling, and expected support labor are evidenced.
3. **Identity direction:** Select an original identity direction after low-fidelity exploration; then confirm domain/handle/name clearance before public investment.

## 13. Risks and failure modes

| Risk / failure mode | Trigger | Likelihood | Impact | Detection evidence | Mitigation | Contingency | Owner |
|---|---|---|---|---|---|---|---|
| Review-gating perception or behavior | Rating changes path visibility/friction | Avoidable | Existential trust/platform risk | Branch audit, complaint, platform notice | Rating-free equal-choice flow | Pause journey and obtain review | Founder |
| Commodity positioning | Site leads with generic NFC hardware and price | Material | Weak differentiation and margin | Prospect language and price objections | Lead with system and operation; keep catalog narrow | Rework offer framing | Founder |
| “Cheap” positioning creates unserviceable accounts | Price promises outrun support and software cost | Material | Margin loss and poor support | Contribution margin and minutes/account | Position as accessible; enforce cost/labor gates | Raise price, simplify tier, or pause managed sales | Founder |
| Inventory consumes the month-one budget | Too many color/SKU combinations are stocked | Material | No cash for QA, field work, or replacements | Budget reconciliation | Sample first; tiny proven-SKU batch; paid orders for variants | Stop reorders and preserve contingency | Founder |
| Custom work erodes margin | Revisions and manual design exceed scope | Material | Cash and capacity loss | Time/cost log | Template contract, one proof/revision, quoted exception | Raise price, narrow, or route to Sunderdas | Founder |
| Three-day target fails | Missing inputs, too many modules, or manual work | Material | Broken customer promise | SLA and active-hours log | Start clock after complete inputs; bound scope | Do not publish; revise contract | Founder |
| API approval blocks dashboard | Google project/access unavailable | Material | Delayed live review data | Access status and provider errors | Fixtures/manual portal first | Continue pilot without live integration | Build owner |
| Device reliability fails | NFC, QR, adhesive, or placement defects | Unknown | Support and reputation cost | QA failure/incident log | Sample matrix and 100% pre-placement QA | Quarantine supplier/SKU | Product/operator |
| Pilot data cannot support a decision | Untracked visits or inconsistent qualification | Material | Wasted month | Missing denominators and outcomes | Single tracker and definitions | Extend only the missing evidence slice | Founder |
| Founder overload | Sales, configuration, and support collide | Material | Slow response and poor learning | Queue age and hours | Cap accounts and record labor | Pause new sales or narrow service | Founder |
| Privacy/tenant leakage | Incorrect assignment or permissions | Low tolerance | Severe | Permission and two-tenant fixture tests | Opaque tokens, least privilege, audit history | Disable affected surface and investigate | Build/privacy owner |

## 14. Blockers and required inputs by class

| Class | Item | Blocks | Evidence | Owner / resolver | Needed by | Unblock condition | Safe work meanwhile |
|---|---|---|---|---|---|---|---|
| Technical blocker | No product samples or tested redirect/device registry | Physical pilot | Empty repository and no sample evidence | Product/build owner | Before field use | Tested sample and activation prototype | Supplier rubric, fixtures, wireframes |
| Client/user input | Existing off-repository operational work, if any | Avoiding duplicate supplier/product/domain/payment work | Remaining checkpoint 1 | Founder | Before external commitment | Current inventory of prior work | Continue local design and specifications |
| External dependency | Supplier quotes, samples, lead times, and QA | Price and fulfillment | No current evidence | Suppliers after outreach approval | Before product sale | Comparable samples and landed cost sheet | Research candidate criteria |
| External dependency | Google API approval and OAuth/client authorization | Live review ingestion and replies | Official documentation | Google, client, founder | After workflow validation | Approved project and authorized test account | Fixtures/manual path |
| Missing evidence | Unit economics and customization labor | Public pricing and SLA | No costs/time studies | Founder/operator | Before publication | Cost every unit and time first custom orders | Formula and thresholds in this brief |
| Missing evidence | Domain/handle/legal-name/trademark status | Identity investment and publication | Not inspected | Founder and qualified professionals | Before identity freeze | Dated clearance record | Use working name internally |
| Missing authority | Spend, orders, outreach, account connection, push, or deploy | External execution | Explicit authority boundary | Founder | Before each action | Explicit scoped approval | Local planning/prototyping |
| Unresolved product decision | Public pilot pricing and exclusions | Outreach, offer publication, and accepting payment | `D-11` and `D-12` | Founder | After cost/readiness evidence | Accepted prices, eligibility, and payment process | Continue reversible work |

## 15. Measurable acceptance criteria

| AC ID | Requirement / risk | Observable condition | Verification method | Target / threshold | Environment / artifact | Owner | Timing | Evidence produced |
|---|---|---|---|---|---|---|---|---|
| `AC-01` | Canonical workspace | Local repository is on `main`, points to the verified origin, and contains the canonical brief | Git inspection | Exact path, branch, remote, and status recorded | Local repository | Codex/founder | Definition | Git output |
| `AC-02` | Launch brief completeness | Website matrix, SKU hypothesis, configuration contract, dashboard IA/data map, pilot plan, decision register, and blocker list are present | Document review | All seven present | This document | Founder | Definition | Accepted brief |
| `AC-03` | Decision discipline | Only genuinely consequential checkpoints remain grouped | Count and review | Three checkpoints, none blocking local design | Section 12 | Founder | Definition | Decision update |
| `AC-04` | Neutral journey | Every tested path exposes review and support without sentiment-conditioned visibility, delay, or friction | Branch and accessibility audit | 100% of states pass | Prototype | Product owner | Design | Flow audit |
| `AC-05` | Product QA | NFC and QR resolve correctly, token can be revoked, and destination can change without replacing hardware | Device matrix test | 100% of pilot units before placement | Samples/prototype | Operator | Pilot readiness | QA log |
| `AC-06` | Dashboard default | Owner can identify current tasks, device status, interactions, review state, and data freshness without customization | Moderated walkthrough | All five jobs completed | Fixture prototype | Product owner | Design | Test notes |
| `AC-07` | Three-day target | Three consecutive bounded configurations finish after complete intake | SLA/time log | Each at or below 3 business days and 4 active operator hours | Pilot operations | Founder | Pilot | Time study |
| `AC-08` | Data integrity | Scan, landing, review click, support click, review, draft, approval, and publish remain distinct | Fixture/schema test | No semantic conflation | Data dictionary/fixtures | Build owner | Implementation | Test report |
| `AC-09` | Pilot measurability | Every qualified visit has context, stage, outcome/reason, and consented follow-up state | Tracker reconciliation | 100% of qualified visits | Pilot tracker | Founder | Daily | Reconciliation report |
| `AC-10` | Authority boundary | No unapproved spend, external representation, production connection, push, or deployment occurs | Activity review | Zero unauthorized actions | Project records | Founder | Every phase | Approval log |

## 16. Phased plan and dependencies

| Phase | Category | Outcome | Inputs / dependencies | Authority | Owner | Completion evidence | Stop / escalation condition |
|---:|---|---|---|---|---|---|---|
| 0 | Targeted evidence still required | Inventory any prior work; obtain supplier/cost/sample evidence when outreach/spend is approved; verify domain/name and final policy risks | Remaining checkpoints and current sources | Read-only until outreach/spend approval | Founder + discovery owner | Updated economics and readiness ledger | Stop before outreach, purchase, or legal conclusion |
| 1 | Decisions required | Accept prices, eligibility, cost floors, payment process, and readiness gates | Phase 0 evidence | Founder decision | Founder | Accepted `D-11` and `D-12` | Escalate if economics, compliance, or promise changes materially |
| 2 | Design work | Local identity directions, product faces, neutral destination journey, dashboard states, and homepage structure are implemented; founder selection remains | This v0.3 brief and supplied references | Local design authority | `product-design-and-prototype` applied | [Design handoff](../design/2026-07-31-scantap-design-handoff.md), prototype, and browser evidence | Do not treat the recommended direction as approved or invent customer proof, photography, or claims |
| 3 | Implementation work | Local redirect/device registry, fixture dashboard, local site, tracker, and tests | Settled design and requirements | Local implementation authority only | `production-build-and-integration` recommended later | Local build and automated/manual checks | Stop before production credentials, push, or deploy |
| 4 | Release verification | Formal sample/pilot readiness decision | Candidate samples, local product, terms, pricing, privacy/compliance review | Founder release authority | `production-launch-gate` recommended later | Go/no-go record and evidence | No field launch with failed critical criteria |
| 5 | Operational follow-up | Controlled 30-day pilot and evidence-led next decision | Approved launch, samples, tracker, founder capacity | Founder-led external authority | Founder + later operations owner | Cohort, unit-economics, time, quality, and support results | Pause on compliance, quality, economics, or capacity failure |

Phase 6 continuity is intentionally omitted. The active instruction is to continue project work and not generate another handoff.

### Provisional 30-day pilot

| Days | Focus | Actions | Evidence |
|---:|---|---|---|
| 1–5 | Readiness | Accept decisions; test samples and demo; finalize tracker, terms, pricing hypotheses, activation, and QA | Readiness checklist and zero critical failures |
| 6–12 | Field round 1 | Visit a balanced set of fixed-counter, appointment/service-location, and mobile/field-service businesses; record every denominator and objection | Daily tracker and debrief |
| 13–19 | Activation and configuration | Fulfill accepted pilots, time activation/configuration, observe placement, and run first support/review workflow | QA, SLA, labor, and incident logs |
| 20–26 | Field round 2 | Refine the pitch and format recommendation without changing measurement definitions; add accounts only within capacity | Comparable cohort results |
| 27–30 | Decision review | Reconcile visits, conversions, activations, behavior, review/support signals, defects, labor, and contribution margin | Continue/narrow/stop decision |

Provisional sampling target: 32 qualified visits, roughly balanced across the three physical/business contexts, with a stretch range of 48–60 only when founder capacity is consistently high. Cap the first active paid pilots at five. A valid result records all outcomes; it is not defined solely by sales.

## 17. Recommended next owner with runtime availability

| Canonical owner | Needed next? | Availability | Availability evidence | Relationship | Bounded fallback or blocker |
|---|---|---|---|---|---|
| `product-design-and-prototype` (S02) | Yes; local design work is complete enough for founder selection and revision | `AVAILABLE` | Present in the current runtime skill catalog | `APPLIED IN THIS TASK` | Review the three directions, refine the selected system, and freeze it only after founder approval |
| `production-build-and-integration` (S03) | Later, after the pilot brief and prototypes are accepted | `AVAILABLE` | Present in the current runtime skill catalog | `RECOMMENDED ONLY` | Do not begin production coupling or deployment from this provisional brief |
| `production-launch-gate` (S04) | Later, before external pilot launch | `AVAILABLE` | Present in the current runtime skill catalog | `RECOMMENDED ONLY` | Founder must approve release authority |
| `post-launch-operations` (S05) | Later, once a live pilot exists | `AVAILABLE` | Present in the current runtime skill catalog | `RECOMMENDED ONLY` | Not applicable before live operation |

## 18. Plain-English summary

Scantap now has a concrete founder pilot and a tested local design prototype: three identity directions, black/white faces for all three formats, a neutral customer journey, a GetTap-inspired operational dashboard, complete state contracts, and a homepage structure. Signal Ledger is recommended but not approved. Read-only supplier research supports a modular sample-first path, while shipping, samples, payment readiness, name clearance, founder approval, and real production behavior still precede public prices or field sales.

## Current external sources

Observed 2026-07-30 through 2026-07-31:

- [Google Business Profile: Tips to get more reviews](https://support.google.com/business/answer/3474122?hl=en)
- [Google Maps: Incentivized or biased reviews](https://support.google.com/contributionpolicy/answer/16597558?hl=en)
- [Google Maps: Prohibited and restricted content](https://support.google.com/contributionpolicy/answer/7400114?hl=en-GB)
- [Google Business Profile: Owners and managers](https://support.google.com/business/answer/3403100)
- [Google Business Profile APIs: Basic setup](https://developers.google.com/my-business/content/basic-setup)
- [Google Business Profile APIs: Work with review data](https://developers.google.com/my-business/content/review-data)
- [FTC: Consumer Reviews and Testimonials Rule Q&A](https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers)
- [GetTap](https://gettap.co/)
- [Tap Tag](https://taptag.shop/)
- [Tap Tag product catalog](https://taptag.shop/pages/products)
- [Tap Tag pricing](https://taptag.shop/pages/tap-tag-pricing)
- [Tap Tag MyTT summary](https://taptag.shop/pages/mytt-ag-summary)
- [Digifeel](https://www.digifeel.io/)
- [Digifeel products](https://www.digifeel.io/collections/our-products)
- [Rocket Review Cards](https://rocketreviewcards.com/)
- [Review Monkey](https://reviewmonkey.app/)
- [Review Monkey pricing](https://reviewmonkey.app/pricing/)
- [Reviews Card](https://www.reviewscard.com/)
- [Nicelydone](https://nicelydone.club/)
- [Refero](https://refero.design/)
- [Lazyweb](https://www.lazyweb.com/)
- [InspoAI](https://www.inspoai.io/)
- [Details.so inspiration](https://www.details.so/inspo)
- [NameThatUI](https://namethatui.com/)
- [Mx Icons README](https://github.com/ig-imanish/mx-icons/blob/main/README.md)
- [Shieldcn](https://shieldcn.dev/)
- [UX Components](https://www.ux-components.com/)
- [Palmier](https://www.palmier.io/)
