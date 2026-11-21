"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  privacyFeatures, type PrivacyChoices, type PrivacyFeature,
} from "@/lib/privacy";

import { save, snapshot, subscribe, serverSnapshot } from "@/lib/privacy-store";
import { configuredFeatures } from "@/lib/measurement-config";

const labels: Record<PrivacyFeature, string> = {
  analytics: "Google Analytics (GA4)", posthog: "PostHog audience analytics", heatmaps: "PostHog heatmaps", replay: "PostHog masked session replay",
};

export function PrivacyChoicesPanel() {
  const [context, setContext] = useState({ jurisdiction: "unknown", signal: false, blocked: false, replayRequiresConsent: true });
  const [policyReady, setPolicyReady] = useState(false);
  useEffect(() => {
    void fetch("/api/privacy-context", { cache: "no-store", credentials: "same-origin" })
      .then(response => response.ok ? response.json() : null)
      .then(value => { if (value) { setContext(value); setPolicyReady(true); } }).catch(() => {});
  }, []);
  const state = JSON.parse(useSyncExternalStore(subscribe, snapshot, () => serverSnapshot)) as {
    choices: PrivacyChoices; legacyDecline: boolean; signal: boolean; saveFailed: boolean; excluded?: boolean;
  };
  return (
    <section id="privacy-choices" className="privacy-choices" aria-labelledby="privacy-choices-heading" tabIndex={-1}>
      <h2 id="privacy-choices-heading">Your Privacy Choices</h2>
      <p>Choose optional measurement for this browser. Changes apply immediately and persist across visits.</p>
      <p>Google Analytics (GA4) and PostHog have separate controls for public visits and selected link clicks. PostHog also provides independently controlled heatmaps and masked replay. Collection is limited to the homepage and products page. Google measurement stays off in browsers without the required isolation.</p>
      <p>Defaults depend on the visitor’s region. Where prior choice is required, optional measurement waits for your permission. Unknown locations remain off, including with saved preferences. Replay preserves reviewed public content while masking inputs, private or dynamic text, and unrecognized attributes.</p>
      {(context.blocked || state.excluded) && <p role="status">Optional measurement is excluded for this browser or visitor context.</p>}
      {!policyReady && <p role="status">Checking the visitor privacy policy. Optional measurement remains off until the check succeeds.</p>}
      {(state.signal || context.signal) && <p role="status"><strong>Your browser’s Global Privacy Control or Do Not Track signal is active. All optional measurement is off.</strong></p>}
      {state.legacyDecline && <p>A previous decline is being honored. Only an explicit change to an individual preference can replace it, and browser privacy signals still take priority.</p>}
      <fieldset disabled={!policyReady || state.signal || context.signal || context.blocked || state.excluded}>
        <legend>Optional measurement preferences</legend>
        {privacyFeatures.map((feature) => (
          <div className="privacy-choice" key={feature}>
            <label>
              <input type="checkbox" checked={!state.signal && !context.signal && (state.choices[feature] ?? (!state.legacyDecline && configuredFeatures[feature] && context.jurisdiction === "default-on-permitted" && (feature !== "replay" || !context.replayRequiresConsent)))}
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
        <p>Global Privacy Control and Do Not Track override optional collection. The measurement pilot is limited to the homepage and products page. Demo, pilot, review, login, account, contact, payment, upload and private pages are excluded.</p>
        <p>Default-on collection requires verified privacy protections and an eligible visitor region. Unknown regions do not qualify. Essential hosting requests and security logs are separate from optional measurement.</p>
      </details>
      <noscript>Optional measurement is off without JavaScript. JavaScript is required to save these browser preferences.</noscript>
    </section>
  );
}
