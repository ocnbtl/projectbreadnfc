import { NextResponse, type NextRequest } from "next/server";
import { applicationUrl } from "@/lib/canonical-url";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { authenticatedLandingPath } from "@/lib/control";

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : undefined;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const supabase = await createServerSupabaseClient();

  if (code && supabase) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const landing = await authenticatedLandingPath(supabase, data.user, next);
      return NextResponse.redirect(applicationUrl(landing, request));
    }
  }

  return NextResponse.redirect(applicationUrl("/login?reason=confirmation", request));
}
