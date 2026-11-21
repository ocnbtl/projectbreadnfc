export const gaId = /^G-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GA4_ID ?? "") ? process.env.NEXT_PUBLIC_GA4_ID! : "";
export const posthogToken = /^phc_[A-Za-z0-9]+$/.test(process.env.NEXT_PUBLIC_POSTHOG_TOKEN ?? "") ? process.env.NEXT_PUBLIC_POSTHOG_TOKEN! : "";
export const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_REGION === "eu" ? "https://eu.i.posthog.com" : "https://us.i.posthog.com";
export const measurementVerified = process.env.NEXT_PUBLIC_MEASUREMENT_VERIFIED === "true";
export const configuredFeatures = {
  analytics: Boolean(posthogToken) && measurementVerified,
  heatmaps: Boolean(posthogToken) && measurementVerified,
  replay: Boolean(posthogToken) && measurementVerified,
};
