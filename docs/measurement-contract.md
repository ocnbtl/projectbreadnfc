# ScanTap public measurement contract

## Scope and destinations

Exact / and /products on https://projectbreadnfc.vercel.app only. Preview collection requires Vercel's exact system-provided deployment or branch hostname. App, authentication, scan/review, pilot, contact, checkout, upload, private, dashboard, demo and server page visits are excluded. No domain, DNS, alias, indexing, access, hosting migration or paid-plan changes.

Dedicated GA4 Standard stream G-1MBW4RLL1E and US PostHog project 756543. Public build settings: NEXT_PUBLIC_GA4_ID, NEXT_PUBLIC_POSTHOG_TOKEN, NEXT_PUBLIC_POSTHOG_REGION=us and NEXT_PUBLIC_MEASUREMENT_VERIFIED=true. Linx owns the Vercel settings and publication. No API secret or Measurement Protocol credential is used.

PostHog is pinned to 1.453.0 with compatible browser-common 0.12.1; the newer versions did not satisfy Vercel's 24-hour minimum. No release-age exclusions are added. The core-js postinstall is disabled.

## Four independent browser controls

- analytics: Google Analytics (GA4), native page_view and public_cta.
- posthog: PostHog audience analytics, native $pageview and public_cta.
- heatmaps: PostHog native $$heatmap.
- replay: PostHog native $snapshot.

A public_cta target is exactly products, pilot, dashboard or privacy. It is a link intent, never a signup, enrollment, review, lead or other conversion. No profiles/identify, automatic interaction events, errors/console, network bodies/headers/timings, canvas, surveys, source queries/hashes/referrers, or arbitrary properties. Native heatmap URL keys are rebuilt and only numeric coordinates, a fixed point type and fixed-position boolean survive.

Preferences use scantap-privacy-choices:v2 in essential browser storage and a SameSite=Lax cookie. Version-1 shared traffic declines apply to both traffic vendors, with independent newer choices taking precedence. Old generic consent declines remain authoritative until an explicit individual change. GPC/DNT and absolute exclusions cannot be overridden by a saved allow.

## Native Google isolation

The parent frames exactly /measurement/google.html on the same build's immutable VERCEL_URL origin, which differs from the canonical site. Preview uses the exact VERCEL_BRANCH_URL as an additionally permitted parent. Both are derived from validated Vercel system values; no caller URL or location parameter chooses an origin.

Only this receiver path has a framing exception. It is a plain route handler without application chrome, collectors, forms or recursion. Its CSP allows only the Google tag script, denies actual ingestion/network/images, and permits the exact canonical parent (plus exact verified preview parent). Direct visits never initialize the tag. The receiver requires credentialless mode, its exact immutable origin, the allowed parent, expected G-ID, and a private MessageChannel. Unsupported browsers leave Google off while separately permitted PostHog continues.

Inside the receiver, cookie and storage access is memory-only. Real, unmodified Google tag code generates each receipt. The receiver intercepts its native transport before egress and returns only a nonce and bounded native consent/sequence fields. The parent requires a pending matching receipt and rebuilds a strict request with fixed G-ID, event/path/title/target and its own bounded pseudonymous session. No native raw URL, fingerprinting properties, helper-page events, advertising identifiers, arbitrary event properties or receipt nonce reaches ingestion. Google browser opt-out flags are honored.

A CTA unloads the isolated receiver to flush Google's real native batch. Source navigation is bounded to 500 ms even when Google is slow or offline; missed delivery is preferable to blocking a product/privacy link. Same-page and new-tab links do not disable the source collectors. Active sends and pending receipts are aborted/discarded on withdrawal or excluded navigation. Ingestion uses credentials:omit and no referrer.

GA's tab-scoped pseudonymous client/session expires after 30 minutes of idle time and clears on withdrawal. PostHog uses memory-only anonymous IDs and never creates a person profile. Returning visitors and unique users across reloads/tabs are not reliable KPIs; use page/click counts and bounded session paths. No synthetic analytics are delivered to production dashboards during verification.

## Regions, signals and internal exclusions

/api/privacy-context uses only Vercel-supplied country/subdivision, returns no IP/country/city/coordinates, is private/no-store, and ignores caller query/cookie location claims. No SDK loads before a successful recognized policy response, including with saved allow. Unknown country or missing/invalid US state or Canadian province remains off. Stale responses from a prior route are discarded.

EEA including AX/GF/GP/MF/MQ/RE/YT, GB, CH, BR, TR and Québec require prior choice. Replay separately requires choice in CA/CT/DE/FL/IL/MD/MA/MI/MT/NV/NH/PA/WA and all Canada. Mainland China remains off because separate overseas-processing consent is not implemented. Other recognized eligible contexts receive defaults. These are the rollout's operational controls, not a universal legal determination about masked replay.

DNT/Sec-GPC, browser GPC/DNT, historical declines, restricted preference storage, staff/testing and authentication take priority. Set localStorage['scantap-internal']='1' to exclude a staff/test browser; remove that single key to restore ordinary policy. An equivalent scantap-internal=1 essential cookie is honored. Existing sb-*-auth-token cookie/local-storage names exclude authenticated browsers without transmitting their contents. Tests use synthetic exclusion markers only.

## Replay and transport boundary

content/replay-public-values.json contains 170 reviewed public text values and 195 attribute pairs from the two public pages. It never learns visitor values. Inputs and private/form/contenteditable/media/iframe/script elements are blocked; new/dynamic text and unknown attributes are masked before serialization. Exact reviewed public copy/classes/images and safe static CSS links preserve useful layout. JSON-LD, console, network/canvas recording are disabled. Tests decompress nested native gzip data and examine full DOM and mutation snapshots for canaries.

Both event capture and fetch/beacon transport check current route, signals and independent choices. Buffered mixed batches are filtered again before transmission; in-flight sends are aborted on policy change; retries/unload cannot restore withdrawn categories. Source credentials and referrers never accompany ingestion.

## Verification

With Node 24 and installed Chrome:

    node scripts/verify-measurement.mjs [origin]
    node scripts/verify-google-measurement.mjs [origin]

For hosted Google checks use the preview branch alias, not its immutable origin, so source and receiver are distinct. Production uses the canonical hostname. The tests read public provider configuration and the actual Google tag, then intercept all native ingestion before delivery. They cover desktop/mobile native packets, exact project bindings, decompressed masking, signals, previous declines, independent categories, staff/auth exclusions, unknown/failed policy, geographic rules, withdrawal/reload/navigation, native receipt absence, unsupported isolation, and timed slow/offline link behavior. The sole permitted preview exception is the exact Vercel toolbar bootstrap GET, which is blocked.

Geographic simulations exercise decisions separately from actual Vercel resolution. Typecheck, lint, secret scan, the 47-check production contract, provider build, hostname provenance and live browser tests are separate gates. Local webpack compilation/type checking succeeds; final prerendering in this Windows environment has intermittently failed to create generated folders. The hosted build must pass before release.

Rollback: ae39e8319eb49ba62eaf489da549fe71e4539bdf, deployment dpl_A9mnUC68bpA8w9ejVKaPoy3MwRVb, immutable projectbreadnfc-ckusbmxl0-unigentamos.vercel.app. The original checkout and its pre-existing untracked files remain untouched.

Primary references: https://posthog.com/docs/session-replay/privacy ; https://posthog.com/docs/libraries/js ; https://developers.google.com/analytics/devguides/collection/ga4/reference/config ; https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/ ; https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32002L0058 ; https://www.priv.gc.ca/en/privacy-topics/collecting-personal-information/consent/gl_omc_201805/ ; https://en.spp.gov.cn/2021-12/29/c_948419_2.htm .
