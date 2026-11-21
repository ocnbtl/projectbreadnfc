"use client";
import { gaId } from "./measurement-config";
const SESSION_KEY = "scantap-google-session:v1";
type RecordEvent = { nonce: string; event: "page_view" | "public_cta"; path: "/" | "/products"; target?: string; sessionId: number; settle?: () => void };
export function createGoogleAnalytics(frameOrigin: string, allowed: () => boolean) {
  let stopped = false, frame: HTMLIFrameElement | undefined, channel: MessageChannel | undefined;
  let session: { client: string; id: number; updated: number } | undefined;
  const pending = new Map<string, RecordEvent>(), queue: object[] = [], inflight = new Set<AbortController>();
  const active = () => !stopped && allowed() && ["/", "/products"].includes(location.pathname);
  const distinctOrigin = frameOrigin !== location.origin && (/^https:\/\/projectbreadnfc-[a-z0-9]+-unigentamos\.vercel\.app$/.test(frameOrigin) || (process.env.NODE_ENV === "development" && frameOrigin === "http://localhost:3168"));
  function capture(event: "page_view" | "public_cta", target?: string, settle?: () => void) {
    if (!active() || !session || !channel || pending.size >= 30) { settle?.(); return; }
    if (event === "public_cta" && !["products", "pilot", "dashboard", "privacy"].includes(target ?? "")) { settle?.(); return; }
    const now = Date.now();
    if (now - session.updated >= 1800000) { stop(true); settle?.(); return; }
    session.updated = now;
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch { stop(true); settle?.(); return; }
    const nonce = "r" + crypto.randomUUID();
    const record: RecordEvent = { nonce, event, path: location.pathname as RecordEvent["path"], target, sessionId: session.id, settle };
    pending.set(nonce, record);
    const message = { nonce, event, path: record.path, location: "https://projectbreadnfc.vercel.app" + record.path };
    if (frame?.dataset.ready === "true") channel.port1.postMessage(message); else queue.push(message);
    window.setTimeout(() => { if (pending.delete(nonce)) settle?.(); }, 15000);
  }
  function stop(clear = false) {
    stopped = true;
    pending.clear(); queue.length = 0; channel?.port1.close(); channel?.port2.close(); frame?.remove(); frame = undefined;
    for (const abort of inflight) abort.abort(); inflight.clear();
    if (clear) try { sessionStorage.removeItem(SESSION_KEY); } catch { /* No optional storage survives a successful removal. */ }
  }
  return {
    start() {
      if (!distinctOrigin || !gaId || !active() || frame) return;
      const candidate = document.createElement("iframe");
      if (!("credentialless" in candidate)) return;
      try {
        const now = Date.now(), raw = sessionStorage.getItem(SESSION_KEY);
        let prior; try { prior = JSON.parse(raw ?? "null"); } catch { /* Ignore corrupt optional session state. */ }
        session = prior && /^\d{1,20}\.\d{1,20}$/.test(prior.client) && Number.isFinite(prior.updated) && now >= prior.updated && now - prior.updated < 1800000 && /^\d{1,12}$/.test(String(prior.id))
          ? { ...prior, updated: now } : { client: crypto.getRandomValues(new Uint32Array(1))[0] + "." + Math.floor(now / 1000), id: Math.floor(now / 1000), updated: now };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } catch { return; }
      frame = candidate; channel = new MessageChannel(); frame.hidden = true;
      frame.title = "Optional website measurement"; frame.setAttribute("aria-hidden", "true");
      frame.setAttribute("sandbox", "allow-scripts allow-same-origin"); frame.setAttribute("credentialless", ""); frame.referrerPolicy = "no-referrer";
      channel.port1.onmessage = e => {
        const record = pending.get(e.data?.nonce); if (!record || !session) return; pending.delete(record.nonce);
        if (!active() || record.path !== location.pathname) { record.settle?.(); return; }
        // Only a real native-tag receipt permits this bounded native request.
        const params = new URLSearchParams({ v: "2", tid: gaId, en: record.event, cid: session.client, sid: String(record.sessionId), dl: "https://projectbreadnfc.vercel.app" + record.path, dt: record.path === "/" ? "Home" : "Products", dr: "", npa: "1" });
        for (const key of ["gcs", "gcd", "_p", "_s", "_ss", "_fv", "sct", "seg"]) {
          const value = e.data.fields?.[key]; if (typeof value === "string" && /^[0-9A-Za-z.-]{1,40}$/.test(value)) params.set(key, value);
        }
        if (record.event === "public_cta" && record.target) params.set("ep.target", record.target);
        const abort = new AbortController(); inflight.add(abort);
        void fetch("https://www.google-analytics.com/g/collect?" + params, { method: "POST", mode: "no-cors", credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store", signal: abort.signal })
          .catch(() => {}).finally(() => { inflight.delete(abort); record.settle?.(); });
      };
      frame.addEventListener("load", () => {
        if (!active() || !frame?.contentWindow || !channel || !session) return;
        frame.contentWindow.postMessage({type:"init", id:gaId, client:session.client}, frameOrigin, [channel.port2]);
        frame.dataset.ready = "true";
        for (const message of queue.splice(0)) channel.port1.postMessage(message);
      }, {once:true});
      frame.src = frameOrigin + "/measurement/google.html"; document.body.append(frame); capture("page_view");
    },
    capture,
    stop,
  };
}
