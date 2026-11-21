"use client";

import { useSyncExternalStore } from "react";
import {
  configuredFeatures, isLegacyDecline, isPrivacySignal, parseChoices,
  privacyFeatures, privacyKey, type PrivacyChoices, type PrivacyFeature,
} from "@/lib/privacy";

const legacyKeys = ["scantap-consent", "scantap-analytics-consent", "scantap-privacy",
  "analytics-consent", "cookie-consent", "cookieConsent", "cookie_consent"];
let volatileChoices: PrivacyChoices = {};
let saveFailed = false;
const changeEvent = "scantap-privacy-change";

function cookieValue(key: string) {
  try {
    const prefix = `${encodeURIComponent(key)}=`;
    const value = document.cookie.split("; ").find((cookie) => cookie.startsWith(prefix));
    return value ? decodeURIComponent(value.slice(prefix.length)) : null;
  } catch { return null; }
}

function snapshot() {
  let choices = parseChoices(cookieValue(privacyKey));
  let legacyDecline = legacyKeys.some((key) => isLegacyDecline(cookieValue(key)));
  try {
    choices = { ...choices, ...parseChoices(localStorage.getItem(privacyKey)) };
    legacyDecline ||= legacyKeys.some((key) => isLegacyDecline(localStorage.getItem(key)));
  } catch { /* Use the essential cookie or current in-memory preference. */ }
  return JSON.stringify({
    choices: { ...choices, ...volatileChoices }, legacyDecline, saveFailed,
    signal: isPrivacySignal(navigator, (window as Window & { doNotTrack?: string }).doNotTrack),
  });
}

const serverSnapshot = JSON.stringify({ choices: {}, legacyDecline: false, signal: false, saveFailed: false });
function subscribe(callback: () => void) {
  window.addEventListener(changeEvent, callback);
  window.addEventListener("storage", callback);
  window.addEventListener("focus", callback);
  return () => {
    window.removeEventListener(changeEvent, callback);
    window.removeEventListener("storage", callback);
    window.removeEventListener("focus", callback);
  };
}

function save(feature: PrivacyFeature, allowed: boolean) {
  const current = JSON.parse(snapshot()) as { choices: PrivacyChoices };
  const choices = { ...current.choices, [feature]: allowed };
  volatileChoices = choices;
  let saved = false;
  try {
    localStorage.setItem(privacyKey, JSON.stringify(choices));
    saved = true;
  } catch { /* Try the essential cookie. */ }
  try {
    document.cookie = `${encodeURIComponent(privacyKey)}=${encodeURIComponent(JSON.stringify(choices))}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    saved ||= cookieValue(privacyKey) === JSON.stringify(choices);
  } catch { /* Report failure instead of claiming persistence. */ }
  saveFailed = !saved;
  if (saved) volatileChoices = {};
  window.dispatchEvent(new Event(changeEvent));
}

const labels: Record<PrivacyFeature, string> = {
  analytics: "Audience analytics (GA4)", heatmaps: "Heatmaps", replay: "Masked session replay",
};

export function PrivacyChoicesPanel() {
  const state = JSON.parse(useSyncExternalStore(subscribe, snapshot, () => serverSnapshot)) as {
    choices: PrivacyChoices; legacyDecline: boolean; signal: boolean; saveFailed: boolean;
  };
  return (
    <section id="privacy-choices" className="privacy-choices" aria-labelledby="privacy-choices-heading" tabIndex={-1}>
      <h2 id="privacy-choices-heading">Your Privacy Choices</h2>
      <p>Choose optional measurement for this browser. Changes apply immediately and persist across visits.</p>
      <p>These services are not connected yet, so no optional recording runs. You can save your preferences below.</p>
      {state.signal && <p role="status"><strong>Your browser’s Global Privacy Control or Do Not Track signal is active. All optional measurement is off.</strong></p>}
      {state.legacyDecline && <p>A previous decline is being honored. Only an explicit change to an individual preference can replace it, and browser privacy signals still take priority.</p>}
      <fieldset disabled={state.signal}>
        <legend>Optional measurement preferences</legend>
        {privacyFeatures.map((feature) => (
          <div className="privacy-choice" key={feature}>
            <label>
              <input type="checkbox" checked={!state.signal && (state.choices[feature] ?? false)}
                onChange={(event) => save(feature, event.target.checked)} />
              <span>Allow {labels[feature]}</span>
            </label>
            <span>{configuredFeatures[feature] ? "Configured" : "Not configured — not running"}</span>
          </div>
        ))}
      </fieldset>
      <p role="status" aria-live="polite">{state.saveFailed
        ? "This browser blocked preference storage. Your choice applies to this page, but could not be saved for future visits. Optional collection remains off."
        : "Preferences are saved automatically. Uncheck a category to opt out."}</p>
      <details>
        <summary>Scope and browser privacy signals</summary>
        <p>Global Privacy Control and Do Not Track override optional collection. A future measurement pilot is limited to the homepage and products page. Demo, pilot, review, login, account, contact, payment, upload and private pages are excluded.</p>
        <p>Default-on collection requires verified privacy protections and an eligible visitor region. Unknown regions do not qualify. Essential hosting requests and security logs are separate from optional measurement.</p>
      </details>
      <noscript>Optional measurement is off without JavaScript. JavaScript is required to save these browser preferences.</noscript>
    </section>
  );
}
