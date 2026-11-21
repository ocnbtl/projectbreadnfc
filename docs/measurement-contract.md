# ScanTap public measurement pilot

Scope: exact / and /products only, on the confirmed projectbreadnfc.vercel.app origin. Preview collection requires Vercel's exact deployment or branch hostname and preview environment. No app, auth, scan/review, pilot, contact, checkout, upload, private, dashboard, demo or server page collection.

## Destination and categories

PostHog US project 756543, pinned browser SDK 1.453.2. Public build settings: NEXT_PUBLIC_POSTHOG_TOKEN, NEXT_PUBLIC_POSTHOG_REGION=us, NEXT_PUBLIC_MEASUREMENT_VERIFIED=true. GA4 G-1MBW4RLL1E is provisioned but this first candidate does not initialize Google. Its real tag suppressed events in an opaque sandbox. Native distinct-origin receiver verification follows independently.

Audience analytics controls native $pageview and public_cta. Heatmaps controls native $$heatmap. Replay controls native $snapshot. A public_cta target can only be products, pilot, dashboard or privacy; it represents a click, never signup/enrollment/review/conversion. Outbound CTA navigation waits at most 200 ms for its permitted native send. No profiles, identify, automatic events, error/console capture, network bodies/headers/timings, canvas, surveys, source query/hash, referrer or arbitrary event properties.

The SDK uses memory-only anonymous IDs, so returning visitors and unique users across reloads are not valid KPIs for this first release. Use public page/event counts and within-page interactions. No fake signup or production form submission is part of verification.

## Consent and exclusions

/api/privacy-context uses only Vercel-provided country and region, emits no location/IP, is private/no-store, and ignores query/cookie location claims. Before its successful recognized response, including with saved allow, no SDK loads. Unknown country or missing/invalid US state or Canadian province stays off. DNT/Sec-GPC, browser GPC/DNT, prior declines, failed preference storage, staff/testing and authentication take priority. Only a new explicit category choice replaces its prior decline; signals and absolute holds remain authoritative.

EEA plus AX/GF/GP/MF/MQ/RE/YT, GB, CH, BR, TR and Québec require prior choice. Replay separately requires choice in CA/CT/DE/FL/IL/MD/MA/MI/MT/NV/NH/PA/WA and all Canada. Mainland China stays off because this implementation has no separate overseas-processing consent. Other recognized eligible contexts receive defaults. These are operational controls aligned with this rollout, not a claim that all recording statutes apply to masked public browsing.

Set localStorage['scantap-internal']='1' in a staff/test browser to exclude it; remove that single key to restore ordinary policy. An equivalent scantap-internal=1 essential cookie is honored. Existing sb-*-auth-token cookie/local-storage names exclude authenticated browsers without transmitting their contents. Tests use synthetic markers only.

## Replay boundary

content/replay-public-values.json is an explicit reviewed allowlist from the two public pages. It never learns visitor values. All inputs and private/form/contenteditable/media/iframe/script elements are blocked; new/dynamic text and unknown attributes are masked before serialization. Reviewed public copy, static classes, image URLs and static CSS links preserve useful layout. Console, JSON-LD and network/canvas recording are disabled. The test decompresses native nested gzip snapshots and checks both full DOM and mutation payloads.

Both event capture and fetch/beacon transport recheck current route, signals and independent choices. Mixed buffered batches are filtered again immediately before transmission, in-flight requests are aborted on policy change, and retries/unload cannot restore withdrawn categories. No site credentials or referrer accompany ingestion.

## Verification and release

Run node scripts/verify-measurement.mjs [origin] with Node 24 and installed Google Chrome. It reads the public provider configuration, then intercepts all native analytics/recording sends before delivery. Hosted preview permits only the exact Vercel toolbar bootstrap GET; it is blocked and never treated as an analytics success. Regional cases are synthetic policy responses, separate from actual Vercel country resolution. Typecheck, lint, secrets, production contract and the provider build are separate gates.

The original checkout and its pre-existing untracked files are untouched. Rollback for activation: ae39e8319eb49ba62eaf489da549fe71e4539bdf, Vercel dpl_A9mnUC68bpA8w9ejVKaPoy3MwRVb, immutable projectbreadnfc-ckusbmxl0-unigentamos.vercel.app. Linx owns public Vercel settings and publication. No hostname, alias, indexing, access, paid-plan or infrastructure changes.

Primary references: https://posthog.com/docs/session-replay/privacy ; https://posthog.com/docs/libraries/js ; https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/ ; https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32002L0058 ; https://www.priv.gc.ca/en/privacy-topics/collecting-personal-information/consent/gl_omc_201805/ ; https://en.spp.gov.cn/2021-12/29/c_948419_2.htm .
