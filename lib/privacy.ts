export const privacyKey = "scantap-privacy-choices:v2";
export const previousPrivacyKey = "scantap-privacy-choices:v1";
export const privacyFeatures = ["analytics", "posthog", "heatmaps", "replay"] as const;
export type PrivacyFeature = (typeof privacyFeatures)[number];
export type PrivacyChoices = Partial<Record<PrivacyFeature, boolean>>;

export function parseChoices(value: string | null): PrivacyChoices {
  try {
    const parsed: unknown = JSON.parse(value ?? "null");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const record = parsed as Record<string, unknown>;
    return Object.fromEntries(privacyFeatures
      .filter((key) => typeof record[key] === "boolean")
      .map((key) => [key, record[key]]));
  } catch { return {}; }
}

export function isPrivacySignal(navigator: {
  globalPrivacyControl?: boolean; doNotTrack?: string | null;
}, windowDnt?: string | null) {
  return navigator.globalPrivacyControl === true ||
    [navigator.doNotTrack, windowDnt].some((value) => value === "1" || value === "yes");
}

export function isLegacyDecline(value: string | null): boolean {
  if (!value) return false;
  if (/^(denied|deny|declined|rejected|reject|false|0|necessary-only)$/i.test(value)) return true;
  try {
    const data: unknown = JSON.parse(value);
    if (data && typeof data === "object") {
      const record = data as Record<string, unknown>;
      return ["accepted", "analytics", "consent", "optional"].some((key) =>
        record[key] === false || /^(denied|declined|rejected)$/i.test(String(record[key])));
    }
  } catch { /* Unrecognized data never grants consent. */ }
  return false;
}

export type CollectionPolicy = {
  pathname: string;
  signal: boolean;
  choices: PrivacyChoices;
  legacyDecline: boolean;
  configured: boolean;
  maskingVerified: boolean;
  jurisdiction: "default-on-permitted" | "prior-consent" | "unknown";
  replayRequiresConsent?: boolean;
  blocked?: boolean;
};

// Every future collector must call this before loading and before each send.
// A verified implementation and regional policy are required even after opt-in.
export function collectionAllowed(feature: PrivacyFeature, policy: CollectionPolicy): boolean {
  if (!policy.configured || !policy.maskingVerified || policy.signal || policy.blocked || policy.jurisdiction === "unknown") return false;
  if (policy.pathname !== "/" && policy.pathname !== "/products") return false;
  if (policy.choices[feature] === false) return false;
  if (policy.choices[feature] === true) return true;
  if (policy.legacyDecline) return false;
  if (feature === "replay" && policy.replayRequiresConsent) return false;
  return policy.jurisdiction === "default-on-permitted";
}
