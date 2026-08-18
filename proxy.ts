import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { organizationSchemaJson } from "@/lib/organization-schema";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";

function apiOrigin(configUrl?: string) {
  try {
    return new URL(configUrl || "https://api.scantapreviews.com").origin;
  } catch {
    return "https://api.scantapreviews.com";
  }
}

async function protectedContentSecurityPolicy(configUrl?: string) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const schemaHashBytes = new Uint8Array(
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(organizationSchemaJson),
    ),
  );
  const schemaHash = Buffer.from(schemaHashBytes).toString("base64");
  const isDevelopment = process.env.NODE_ENV === "development";
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'sha256-${schemaHash}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self' data:",
    `connect-src 'self' ${apiOrigin(configUrl)}`,
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "manifest-src 'self'",
    ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

  return { nonce, policy };
}

export async function proxy(request: NextRequest) {
  const protectedPath =
    request.nextUrl.pathname.startsWith("/app") ||
    request.nextUrl.pathname.startsWith("/control");
  const config = getPublicSupabaseConfig();
  const { nonce, policy } = await protectedContentSecurityPolicy(config?.url);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);

  const secure = (response: NextResponse) => {
    response.headers.set("Content-Security-Policy", policy);
    return response;
  };
  const nextResponse = () =>
    secure(
      NextResponse.next({
        request: { headers: requestHeaders },
      }),
    );

  if (!config) {
    if (protectedPath) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("reason", "setup");
      return secure(NextResponse.redirect(loginUrl));
    }
    return nextResponse();
  }

  let response = nextResponse();
  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = nextResponse();
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  if (protectedPath && !data?.claims) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return secure(NextResponse.redirect(loginUrl));
  }

  return secure(response);
}

export const config = {
  matcher: ["/app/:path*", "/control/:path*", "/login", "/auth/:path*"],
};
