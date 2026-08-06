import "server-only";

const GOOGLE_SCOPE = "https://www.googleapis.com/auth/business.manage";

type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type: string;
};

export type GoogleAccount = { name: string; accountName?: string; type?: string };
export type GoogleLocation = { name: string; title?: string; storeCode?: string; metadata?: { placeId?: string } };
export type GoogleReview = {
  name: string;
  reviewId: string;
  reviewer?: { displayName?: string; profilePhotoUrl?: string };
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string;
  createTime: string;
  updateTime?: string;
  reviewReply?: {
    comment?: string;
    updateTime?: string;
    reviewReplyState?: "PENDING" | "REJECTED" | "APPROVED" | "REVIEW_REPLY_STATE_UNSPECIFIED";
    policyViolation?: string;
  };
};

function googleCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google Business Profile OAuth is not configured.");
  }
  return { clientId, clientSecret, redirectUri };
}

async function googleJson<T>(url: string, accessToken: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    const pathname = new URL(url).pathname;
    throw new Error(`Google Business Profile returned ${response.status} for ${pathname}.`);
  }
  return response.json() as Promise<T>;
}

export function createGoogleAuthorizationUrl(state: string) {
  const { clientId, redirectUri } = googleCredentials();
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", GOOGLE_SCOPE);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("state", state);
  return url;
}

export async function exchangeGoogleAuthorizationCode(code: string) {
  const { clientId, clientSecret, redirectUri } = googleCredentials();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Google OAuth exchange failed with ${response.status}.`);
  return response.json() as Promise<GoogleTokenResponse>;
}

export async function refreshGoogleAccessToken(refreshToken: string) {
  const { clientId, clientSecret } = googleCredentials();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Google token refresh failed with ${response.status}.`);
  return response.json() as Promise<GoogleTokenResponse>;
}

export async function listGoogleAccounts(accessToken: string) {
  const data = await googleJson<{ accounts?: GoogleAccount[] }>(
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
    accessToken,
  );
  return data.accounts ?? [];
}

export async function listGoogleLocations(accessToken: string, accountName: string) {
  const locations: GoogleLocation[] = [];
  let pageToken = "";
  do {
    const url = new URL(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations`);
    url.searchParams.set("readMask", "name,title,storeCode,metadata");
    url.searchParams.set("pageSize", "100");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const data = await googleJson<{ locations?: GoogleLocation[]; nextPageToken?: string }>(url.toString(), accessToken);
    locations.push(...(data.locations ?? []));
    pageToken = data.nextPageToken ?? "";
  } while (pageToken);
  return locations;
}

export async function listGoogleReviews(accessToken: string, parent: string) {
  const reviews: GoogleReview[] = [];
  let averageRating: number | null = null;
  let totalReviewCount: number | null = null;
  let pageToken = "";
  do {
    const url = new URL(`https://mybusiness.googleapis.com/v4/${parent}/reviews`);
    url.searchParams.set("pageSize", "50");
    url.searchParams.set("orderBy", "updateTime desc");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const data = await googleJson<{ reviews?: GoogleReview[]; averageRating?: number; totalReviewCount?: number; nextPageToken?: string }>(url.toString(), accessToken);
    reviews.push(...(data.reviews ?? []));
    averageRating ??= data.averageRating ?? null;
    totalReviewCount ??= data.totalReviewCount ?? null;
    pageToken = data.nextPageToken ?? "";
  } while (pageToken);
  return { reviews, averageRating, totalReviewCount };
}

export async function publishGoogleReply(accessToken: string, reviewName: string, comment: string) {
  return googleJson<{
    comment: string;
    updateTime: string;
    reviewReplyState?: "PENDING" | "REJECTED" | "APPROVED" | "REVIEW_REPLY_STATE_UNSPECIFIED";
    policyViolation?: string;
  }>(
    `https://mybusiness.googleapis.com/v4/${reviewName}/reply`,
    accessToken,
    { method: "PUT", body: JSON.stringify({ comment }) },
  );
}

export function googleRating(starRating: GoogleReview["starRating"]) {
  return { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }[starRating];
}
