"use client";
import { isLegacyDecline, isPrivacySignal, parseChoices, privacyKey, previousPrivacyKey, type PrivacyChoices, type PrivacyFeature } from "./privacy";
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

export function snapshot() {
  let excluded = cookieValue("scantap-internal") === "1" || document.cookie.split(";").some(cookie => /^\s*sb-[^=]+-auth-token(?:\.\d+)?=/.test(cookie));
  let previous = parseChoices(cookieValue(previousPrivacyKey));
  let choices = parseChoices(cookieValue(privacyKey));
  let legacyDecline = legacyKeys.some((key) => isLegacyDecline(cookieValue(key)));
  try {
    previous = { ...previous, ...parseChoices(localStorage.getItem(previousPrivacyKey)) };
    choices = { ...choices, ...parseChoices(localStorage.getItem(privacyKey)) };
    legacyDecline ||= legacyKeys.some((key) => isLegacyDecline(localStorage.getItem(key)));
    excluded ||= localStorage.getItem("scantap-internal") === "1" || Object.keys(localStorage).some(key => /^sb-.+-auth-token$/.test(key));
  } catch { excluded = true; /* Unreadable prior preferences or authentication fail closed. */ }
  // A former shared traffic decline applies to both vendors. A historical allow
  // never invents separate prior consent for the newly split PostHog category.
  if (previous.analytics === false && previous.posthog === undefined) previous.posthog = false;
  choices = { ...previous, ...choices };
  return JSON.stringify({
    choices: { ...choices, ...volatileChoices }, legacyDecline, saveFailed, excluded,
    signal: isPrivacySignal(navigator, (window as Window & { doNotTrack?: string }).doNotTrack),
  });
}

export const serverSnapshot = JSON.stringify({ choices: {}, legacyDecline: false, signal: false, saveFailed: false });
export function subscribe(callback: () => void) {
  window.addEventListener(changeEvent, callback);
  window.addEventListener("storage", callback);
  window.addEventListener("focus", callback);
  return () => {
    window.removeEventListener(changeEvent, callback);
    window.removeEventListener("storage", callback);
    window.removeEventListener("focus", callback);
  };
}

export function save(feature: PrivacyFeature, allowed: boolean) {
  if (feature === "analytics" && !allowed) try { sessionStorage.removeItem("scantap-google-session:v1"); } catch { /* Collection remains denied. */ }
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

