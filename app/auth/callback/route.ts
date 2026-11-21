import { NextResponse, type NextRequest } from "next/server";
import { loginDestination } from "@/lib/login-destination";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { authenticatedLandingPath } from "@/lib/control";

function returnTo(path: string) {
  // Relative redirects stay on the host that owns the PKCE cookies. An explicit
  // fragment prevents browsers carrying provider-supplied fragments to the next page.
  return new NextResponse(null, {
    status: 303,
    headers: {
      Location: path.includes("#") ? path : path + "#",
      "Cache-Control": "private, no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const invalidLink = "/login?reason=confirmation";
  if (params.has("error") || params.has("error_code") || !code?.trim()) {
    return returnTo(invalidLink);
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return returnTo("/login?reason=auth-unavailable");

  const flowId = params.get("sb_flow_id");
  const { data, error } = await supabase.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);
  if (error || !data.user) {
    return returnTo(error && (error.status ?? 0) >= 500 ? "/login?reason=auth-unavailable" : invalidLink);
  }
  const landing = await authenticatedLandingPath(supabase, data.user, loginDestination(params.get("next")));
  return returnTo(landing);
}
