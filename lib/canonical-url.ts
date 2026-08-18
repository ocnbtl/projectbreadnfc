import "server-only";

import type { NextRequest } from "next/server";

export function applicationUrl(pathname: string, request: NextRequest) {
  if (!pathname.startsWith("/") || pathname.startsWith("//")) {
    throw new Error("Application redirects require a same-origin path.");
  }

  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL;
  const baseValue =
    process.env.NODE_ENV === "production"
      ? configuredOrigin
      : request.nextUrl.origin;

  if (!baseValue) {
    throw new Error("NEXT_PUBLIC_SITE_URL is required in production.");
  }

  const base = new URL(baseValue);
  if (process.env.NODE_ENV === "production" && base.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_SITE_URL must use HTTPS in production.");
  }

  return new URL(pathname, base.origin);
}
