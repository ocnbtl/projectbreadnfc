import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createGoogleAuthorizationUrl } from "@/lib/integrations/google-business-profile";
import { isGoogleIntegrationConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  if (!isGoogleIntegrationConfigured()) {
    return NextResponse.redirect(new URL("/app/integrations?error=Google+OAuth+is+not+configured.", request.url));
  }

  const organizationId = request.nextUrl.searchParams.get("organization");
  const supabase = await createServerSupabaseClient();
  if (!supabase || !organizationId) return new NextResponse("Bad request", { status: 400 });
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.redirect(new URL("/login?next=/app/integrations", request.url));

  const { data: membership } = await supabase
    .from("organization_memberships")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", authData.user.id)
    .eq("status", "active")
    .single();
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return new NextResponse("Administrator access required", { status: 403 });
  }

  const state = randomUUID();
  const response = NextResponse.redirect(createGoogleAuthorizationUrl(state));
  response.cookies.set("scantap-google-oauth", JSON.stringify({ state, organizationId }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/integrations/google/callback",
    maxAge: 600,
  });
  return response;
}
