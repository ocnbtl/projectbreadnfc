import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  googleRating,
  listGoogleReviews,
  refreshGoogleAccessToken,
} from "./google-business-profile";
import { decryptSecret, encryptSecret } from "./secret-crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type CredentialRow = {
  access_token_ciphertext: string;
  access_token_iv: string;
  refresh_token_ciphertext: string | null;
  refresh_token_iv: string | null;
  expires_at: string | null;
};

type IntegrationRow = {
  id: string;
  organization_id: string;
  status: string;
};

type ExternalLocationRow = {
  id: string;
  organization_id: string;
  location_id: string | null;
  external_location_id: string;
  source_url: string | null;
};

async function validGoogleAccessToken(
  admin: SupabaseClient,
  integrationId: string,
) {
  const { data, error } = await admin
    .from("integration_credentials")
    .select(
      "access_token_ciphertext, access_token_iv, refresh_token_ciphertext, refresh_token_iv, expires_at",
    )
    .eq("integration_id", integrationId)
    .single();

  if (error || !data) throw new Error("Google credentials are not available.");
  const credential = data as CredentialRow;
  const expiresAt = credential.expires_at ? new Date(credential.expires_at).getTime() : 0;

  if (expiresAt > Date.now() + 60_000) {
    return decryptSecret(credential.access_token_ciphertext, credential.access_token_iv);
  }

  if (!credential.refresh_token_ciphertext || !credential.refresh_token_iv) {
    throw new Error("Google authorization expired. Reconnect this account.");
  }

  const refreshToken = decryptSecret(
    credential.refresh_token_ciphertext,
    credential.refresh_token_iv,
  );
  const refreshed = await refreshGoogleAccessToken(refreshToken);
  const encrypted = encryptSecret(refreshed.access_token);
  const { error: updateError } = await admin
    .from("integration_credentials")
    .update({
      access_token_ciphertext: encrypted.ciphertext,
      access_token_iv: encrypted.iv,
      expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
      scopes: refreshed.scope?.split(" ") ?? undefined,
    })
    .eq("integration_id", integrationId);

  if (updateError) throw new Error("Refreshed Google credentials could not be saved.");
  return refreshed.access_token;
}

export async function getGoogleAccessToken(integrationId: string) {
  const admin = createSupabaseAdminClient();
  return validGoogleAccessToken(admin, integrationId);
}

export async function syncGoogleIntegration(integrationId: string) {
  const admin = createSupabaseAdminClient();
  const { data: integrationData, error: integrationError } = await admin
    .from("integrations")
    .select("id, organization_id, status")
    .eq("id", integrationId)
    .eq("provider", "google_business_profile")
    .single();

  if (integrationError || !integrationData) throw new Error("Google integration not found.");
  const integration = integrationData as IntegrationRow;
  if (integration.status === "disconnected") throw new Error("Google integration is disconnected.");

  try {
    const accessToken = await validGoogleAccessToken(admin, integration.id);
    const { data: externalData, error: externalError } = await admin
      .from("external_locations")
      .select("id, organization_id, location_id, external_location_id, source_url")
      .eq("integration_id", integration.id)
      .not("location_id", "is", null);

    if (externalError) throw new Error("Mapped Google locations could not be loaded.");
    const externalLocations = (externalData ?? []) as ExternalLocationRow[];
    let imported = 0;

    for (const externalLocation of externalLocations) {
      if (!externalLocation.location_id) continue;
      const result = await listGoogleReviews(accessToken, externalLocation.external_location_id);
      const sourceExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await admin.from("external_locations").update({
        provider_average_rating: result.averageRating,
        provider_total_review_count: result.totalReviewCount,
        source_content_expires_at: sourceExpiresAt,
      }).eq("id", externalLocation.id);
      if (!result.reviews.length) continue;

      const rows = result.reviews.map((review) => ({
        organization_id: externalLocation.organization_id,
        location_id: externalLocation.location_id,
        external_location_id: externalLocation.id,
        provider: "google_business_profile",
        external_review_id: review.name || review.reviewId,
        author_name: review.reviewer?.displayName || "Google customer",
        rating: googleRating(review.starRating),
        body: review.comment || null,
        provider_url: externalLocation.source_url,
        status: review.reviewReply?.comment && review.reviewReply.reviewReplyState !== "REJECTED" && review.reviewReply.reviewReplyState !== "PENDING" ? "replied" : "needs_reply",
        review_created_at: review.createTime,
        provider_updated_at: review.updateTime || review.createTime,
        replied_at: review.reviewReply?.updateTime || null,
        raw_payload: review,
        source_expires_at: sourceExpiresAt,
      }));

      const { error: reviewError } = await admin
        .from("reviews")
        .upsert(rows, { onConflict: "organization_id,provider,external_review_id" });
      if (reviewError) throw new Error(`Reviews for ${externalLocation.external_location_id} could not be saved.`);
      imported += rows.length;
    }

    const syncedAt = new Date().toISOString();
    await Promise.all([
      admin
        .from("integrations")
        .update({ status: "connected", last_synced_at: syncedAt, last_error: null })
        .eq("id", integration.id),
      admin
        .from("reviews")
        .delete()
        .eq("organization_id", integration.organization_id)
        .eq("provider", "google_business_profile")
        .lte("source_expires_at", syncedAt),
    ]);

    return { imported, mappedLocations: externalLocations.length, syncedAt };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google synchronization failed.";
    await admin
      .from("integrations")
      .update({ status: "error", last_error: message })
      .eq("id", integration.id);
    throw error;
  }
}
