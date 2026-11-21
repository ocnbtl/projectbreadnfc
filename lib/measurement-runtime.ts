"use client";
import { collectionAllowed, type PrivacyFeature, type CollectionPolicy } from "./privacy";
import { snapshot, subscribe } from "./privacy-store";
import { gaId, posthogToken, posthogHost, configuredFeatures } from "./measurement-config";
import { maskPublicText, maskPublicAttribute } from "./replay-privacy";
import { createGoogleAnalytics } from "./google-analytics";

type Region = { jurisdiction: CollectionPolicy["jurisdiction"]; signal: boolean; replayRequiresConsent?: boolean; blocked?: boolean; googleFrame?: {origin:string;parents:string[]} };
let region: Region = { jurisdiction: "unknown", signal: false };
let regionResolved = false;
let google: ReturnType<typeof createGoogleAnalytics> | null = null;
function stopGoogle(clear = false) {
  google?.stop(clear); google = null;
  if (clear) try { sessionStorage.removeItem("scantap-google-session:v1"); } catch { /* No transmission is permitted. */ }
}
let stopped = true;
let client: import("posthog-js/dist/module.full.no-external").PostHog | null = null;
let loading = false;
let lastPage = "";
let lastPolicy = "";
let transportInstalled = false;
let ctaSettled: (() => void) | undefined;
const pending = new Map<AbortController, string>();
function transportAllowed(path: string) {
  if (path.startsWith("/s/")) return allowed("replay");
  if (path.startsWith("/e/") || path.startsWith("/i/v0/e/")) return allowed("posthog") || allowed("heatmaps");
  return allowed("posthog") || allowed("heatmaps") || allowed("replay");
}
function eventAllowed(event: { event?: string }) {
  if (event.event === "$snapshot") return allowed("replay");
  if (event.event === "$$heatmap") return allowed("heatmaps");
  return ["$pageview", "public_cta"].includes(event.event ?? "") && allowed("posthog");
}
async function filteredBody(body: BodyInit | null | undefined) {
  try {
    const raw = typeof body === "string" ? body : body instanceof Blob ? await body.text() : "";
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      const events = data.filter(eventAllowed);
      return events.length ? JSON.stringify(events) : null;
    }
    if (Array.isArray(data.batch)) {
      data.batch = data.batch.filter(eventAllowed);
      return data.batch.length ? JSON.stringify(data) : null;
    }
  } catch { /* Unknown transport formats fail closed. */ }
  return null;
}
function installTransportGuard() {
  if (transportInstalled) return;
  transportInstalled = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : String(input), location.href);
    if (url.origin !== posthogHost) return originalFetch(input, init);
    if (!transportAllowed(url.pathname)) return Promise.reject(new DOMException("Optional measurement disabled", "AbortError"));
    const body = await filteredBody(init?.body);
    if (!body || !transportAllowed(url.pathname)) throw new DOMException("Optional measurement disabled", "AbortError");
    const controller = new AbortController(); pending.set(controller, url.pathname);
    if (init?.signal) init.signal.addEventListener("abort", () => controller.abort(), {once:true});
    return originalFetch(input, {...init, body, credentials:"omit", referrerPolicy:"no-referrer", signal:controller.signal})
      .finally(() => { pending.delete(controller); if (body.includes('"event":"public_cta"')) ctaSettled?.(); });
  };
  const originalBeacon = navigator.sendBeacon.bind(navigator);
  navigator.sendBeacon = (input, data) => {
    const url = new URL(String(input), location.href);
    if (url.origin !== posthogHost) return originalBeacon(input, data);
    // Keep unload sends on the same guarded, credential-free transport.
    if (!transportAllowed(url.pathname)) return false;
    void window.fetch(url, {method:"POST",body:data,keepalive:true}).catch(() => {});
    return true;
  };
}
function allowed(feature: PrivacyFeature) {
  if (stopped) return false;
  if (feature === "analytics" && (window as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] === true) return false;
  const preview = process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" && [process.env.NEXT_PUBLIC_VERCEL_URL, process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL].includes(location.hostname);
  if (location.origin !== "https://projectbreadnfc.vercel.app" && !preview) return false;
  const state = JSON.parse(snapshot());
  return collectionAllowed(feature, { ...state, signal: state.signal || region.signal || state.saveFailed,
    blocked: state.excluded || region.blocked, replayRequiresConsent: region.replayRequiresConsent,
    pathname: location.pathname, configured: configuredFeatures[feature], maskingVerified: true,
    jurisdiction: region.jurisdiction });
}
const safeUrl = () => "https://projectbreadnfc.vercel.app" + (location.pathname === "/products" ? "/products" : "/");
function stopPosthog() {
  if (!client) return;
  client.stopSessionRecording(); client.set_config({ capture_heatmaps: false, disable_session_recording: true });
  client.opt_out_capturing(); client = null;
}
async function startPosthog() {
  if (client || loading || !posthogToken || !(allowed("posthog") || allowed("heatmaps") || allowed("replay"))) return;
  loading = true;
  try {
    const { default: posthog } = await import("posthog-js/dist/module.full.no-external");
    await import("posthog-js/dist/posthog-recorder");
    if (!(allowed("posthog") || allowed("heatmaps") || allowed("replay"))) return;
    client = posthog.init(posthogToken, {
      api_host: posthogHost, persistence: "memory", disable_persistence: true,
      api_transport: "fetch", disable_compression: true,
      person_profiles: "never", autocapture: false, capture_pageview: false, capture_pageleave: false,
      capture_heatmaps: allowed("heatmaps"), disable_session_recording: !allowed("replay"),
      capture_exceptions: false, enable_recording_console_log: false, capture_performance: false,
      get_current_url: safeUrl, advanced_disable_feature_flags: true,
      disable_surveys: true, disable_external_dependency_loading: true,
      session_recording: {
        maskAttributeFn: maskPublicAttribute, captureJsonLd: false, inlineStylesheet: false,
        collectFonts: false, recordHeaders: false, recordBody: false,
        captureCanvas: { recordCanvas: false },
        maskAllInputs: true, maskTextSelector: "*", maskTextFn: maskPublicText, maskInputFn: () => "[masked]",
        blockSelector: "input,textarea,select,form,iframe,canvas,video,audio,script,[data-private],[contenteditable],.ph-no-capture",
        recordCrossOriginIframes: false,
        maskCapturedNetworkRequestFn: request => ({ ...request, name: safeUrl() }),
      },
      before_send: event => {
        if (!event) return null;
        if (event.event === "$snapshot") {
          if (!allowed("replay")) return null;
          event.properties = Object.fromEntries(Object.entries(event.properties).filter(([key]) => ["token","distinct_id","$session_id","$window_id","$snapshot_data","$snapshot_bytes","$lib","$lib_version"].includes(key)));
          return event;
        }
        if (event.event === "$$heatmap") {
          if (!allowed("heatmaps")) return null;
          event.properties = Object.fromEntries(Object.entries(event.properties).filter(([key]) => ["token","distinct_id","$session_id","$window_id","$heatmap_data","$lib","$lib_version"].includes(key)));
          const data = event.properties.$heatmap_data;
          const points = data && typeof data === "object" ? Object.values(data).flat() : [];
          event.properties.$heatmap_data = { [safeUrl()]: points.map(point => {
            const p = point as Record<string, unknown>;
            return Object.fromEntries(Object.entries(p).filter(([key, value]) =>
              (["x", "y"].includes(key) && typeof value === "number") ||
              (key === "target_fixed" && typeof value === "boolean") ||
              (key === "type" && ["click", "mousemove", "deadclick", "rageclick"].includes(String(value)))));
          }) };
          event.properties.$current_url = safeUrl();
          return event;
        }
        if ((event.event === "$pageview" || event.event === "public_cta") && allowed("posthog")) {
          if (event.event === "public_cta" && !["products", "pilot", "dashboard", "privacy"].includes(event.properties.target)) return null;
          event.properties = Object.fromEntries(Object.entries(event.properties).filter(([key]) => ["token","distinct_id","$session_id","$window_id","$lib","$lib_version","target"].includes(key)));
          event.properties.$current_url = safeUrl();
          return event;
        }
        return null;
      },
      loaded: instance => {
        if (!allowed("posthog") && !allowed("heatmaps") && !allowed("replay")) { instance.opt_out_capturing(); return; }
        if (allowed("replay")) instance.startSessionRecording();
      },
    }, "scantap_public") ?? null;
    client?.opt_in_capturing({ captureEventName: false });
    if (allowed("posthog")) client?.capture("$pageview", { $current_url: safeUrl() });
    if (allowed("replay")) client?.startSessionRecording();
  } finally { loading = false; }
}
function refresh() {
  for (const [controller, path] of pending) if (!transportAllowed(path)) controller.abort();
  const policy = `${location.pathname}:${regionResolved}:${allowed("analytics")}:${allowed("posthog")}:${allowed("heatmaps")}:${allowed("replay")}`;
  if (lastPolicy === policy) return;
  for (const controller of pending.keys()) controller.abort();
  lastPolicy = policy;
  const page = location.pathname;
  if (lastPage !== page) { stopPosthog(); stopGoogle(); lastPage = page; }
  if (allowed("analytics") && region.googleFrame?.parents.includes(location.origin)) {
    if (!google) { google = createGoogleAnalytics(region.googleFrame.origin, () => allowed("analytics")); google.start(); }
  } else {
    const state = JSON.parse(snapshot());
    stopGoogle(regionResolved || state.choices.analytics === false || state.signal || state.excluded);
  }
  if (!allowed("posthog") && !allowed("heatmaps") && !allowed("replay")) stopPosthog();
  else if (client) {
    client.set_config({ capture_heatmaps: allowed("heatmaps"), disable_session_recording: !allowed("replay") });
    if (!allowed("replay")) client.stopSessionRecording();
    else client.startSessionRecording();
  } else void startPosthog();
}
export function startMeasurement(navigate: (href: string) => void) {
  stopped = false;
  region = { jurisdiction: "unknown", signal: false };
  regionResolved = false;
  let disposed = false, navigationPending = false;
  lastPolicy = "";
  installTransportGuard();
  const unsubscribe = subscribe(refresh);
  const click = (event: MouseEvent) => {
    const link = (event.target as Element)?.closest?.("a");
    if (!link) return;
    const href = new URL(link.href, location.href);
    const target = href.origin === location.origin && ["/products","/pilot","/dashboard","/privacy"].includes(href.pathname) ? href.pathname.slice(1) : null;
    const posthogClick = allowed("posthog") && client;
    const googleClick = allowed("analytics") && google;
    if ((posthogClick || googleClick) && target && href.pathname !== location.pathname && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && link.target !== "_blank") {
      event.preventDefault(); event.stopPropagation();
      if (navigationPending) return;
      navigationPending = true;
      let navigated = false;
      let remaining = Number(Boolean(posthogClick)) + Number(Boolean(googleClick));
      const finish = () => { if (navigated || disposed) return; navigated = true; ctaSettled = undefined; stopPosthog(); stopGoogle(); navigate(href.pathname + href.search + href.hash); };
      const settle = () => { if (--remaining <= 0) finish(); };
      if (posthogClick) { ctaSettled = settle; posthogClick.capture("public_cta", { target }, {send_instantly:true}); }
      if (googleClick) googleClick.capture("public_cta", target, settle);
      window.setTimeout(finish, 500);
      return;
    }
    // Tear down collectors before Next or the browser can expose another route's DOM.
    if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && link.target !== "_blank" && (href.origin !== location.origin || href.pathname !== location.pathname)) { stopPosthog(); stopGoogle(); }
  };
  const exit = () => { stopPosthog(); stopGoogle(); };
  document.addEventListener("click", click, true);
  window.addEventListener("pagehide", exit);
  const interval = window.setInterval(refresh, 250);
  void fetch("/api/privacy-context", {cache:"no-store",credentials:"same-origin"}).then(r=>r.ok?r.json():null).then(data=>{
    if (disposed) return;
    regionResolved = true;
    if (data && ["unknown","prior-consent","default-on-permitted"].includes(data.jurisdiction)) region = {jurisdiction:data.jurisdiction,signal:data.signal === true,replayRequiresConsent:data.replayRequiresConsent === true,blocked:data.blocked === true,googleFrame:data.googleFrame};
    refresh();
  }).catch(()=>{ if (!disposed) { regionResolved = true; refresh(); } });
  refresh();
  return () => { disposed = true; stopped = true; ctaSettled = undefined; unsubscribe(); clearInterval(interval); document.removeEventListener("click",click,true); window.removeEventListener("pagehide",exit); exit(); };
}
