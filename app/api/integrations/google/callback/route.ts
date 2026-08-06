import { NextResponse, type NextRequest } from "next/server";
import { exchangeGoogleAuthorizationCode, listGoogleAccounts, listGoogleLocations } from "@/lib/integrations/google-business-profile";
import { encryptSecret } from "@/lib/integrations/secret-crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type OAuthCookie = { state: string; organizationId: string };

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieValue = request.cookies.get("scantap-google-oauth")?.value;
  let oauthCookie: OAuthCookie | null = null;
  try { oauthCookie = cookieValue ? JSON.parse(cookieValue) as OAuthCookie : null; } catch { oauthCookie = null; }
  if (!code || !state || !oauthCookie || oauthCookie.state !== state) {
    return NextResponse.redirect(new URL("/app/integrations?error=Google+connection+verification+failed.", request.url));
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.redirect(new URL("/login", request.url));
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.redirect(new URL("/login?next=/app/integrations", request.url));
  const { data: membership } = await supabase.from("organization_memberships").select("role").eq("organization_id", oauthCookie.organizationId).eq("user_id", authData.user.id).eq("status", "active").single();
  if (!membership || !["owner", "admin"].includes(membership.role)) return new NextResponse("Administrator access required", { status: 403 });

  try {
    const token = await exchangeGoogleAuthorizationCode(code);
    const accounts = await listGoogleAccounts(token.access_token);
    if (!accounts.length) throw new Error("Google did not return a Business Profile account.");
    const admin = createSupabaseAdminClient();

    for (const account of accounts) {
      const { data: existing } = await supabase.from("integrations").select("id").eq("organization_id", oauthCookie.organizationId).eq("provider", "google_business_profile").eq("external_account_id", account.name).maybeSingle();
      let integrationId = existing?.id as string | undefined;
      if (integrationId) {
        const { error } = await supabase.from("integrations").update({ status: "connected", mode: "native", capabilities: ["read_reviews", "publish_reply", "location_sync"], display_name: account.accountName || "Google Business Profile", last_error: null }).eq("id", integrationId);
        if (error) throw error;
      } else {
        const { data: created, error } = await supabase.from("integrations").insert({ organization_id: oauthCookie.organizationId, provider: "google_business_profile", display_name: account.accountName || "Google Business Profile", mode: "native", status: "connected", capabilities: ["read_reviews", "publish_reply", "location_sync"], external_account_id: account.name, created_by: authData.user.id }).select("id").single();
        if (error) throw error;
        integrationId = created.id;
      }

      const access = encryptSecret(token.access_token);
      const credentialRecord = { integration_id: integrationId, organization_id: oauthCookie.organizationId, access_token_ciphertext: access.ciphertext, access_token_iv: access.iv, expires_at: new Date(Date.now() + token.expires_in * 1000).toISOString(), scopes: token.scope?.split(" ") ?? [] };
      if (token.refresh_token) {
        const refresh = encryptSecret(token.refresh_token);
        const { error } = await admin.from("integration_credentials").upsert({ ...credentialRecord, refresh_token_ciphertext: refresh.ciphertext, refresh_token_iv: refresh.iv });
        if (error) throw error;
      } else {
        const { error } = await admin.from("integration_credentials").upsert(credentialRecord);
        if (error) throw error;
      }

      const googleLocations = await listGoogleLocations(token.access_token, account.name);
      if (googleLocations.length) {
        const { error } = await supabase.from("external_locations").upsert(googleLocations.map((location) => ({ integration_id: integrationId, organization_id: oauthCookie.organizationId, external_location_id: `${account.name}/${location.name}`, display_name: location.title || location.storeCode || location.name, source_url: location.metadata?.placeId ? `https://www.google.com/maps/place/?q=place_id:${location.metadata.placeId}` : null })), { onConflict: "integration_id,external_location_id" });
        if (error) throw error;
      }
    }

    const response = NextResponse.redirect(new URL("/app/integrations?notice=Google+Business+Profile+connected.", request.url));
    response.cookies.delete("scantap-google-oauth");
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google connection failed.";
    return NextResponse.redirect(new URL(`/app/integrations?error=${encodeURIComponent(message)}`, request.url));
  }
}
