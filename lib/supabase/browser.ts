"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseConfig } from "./config";

export function createBrowserSupabaseClient() {
  const config = getPublicSupabaseConfig();
  if (!config) {
    throw new Error("Scantap account services are not configured.");
  }

  return createBrowserClient(config.url, config.publishableKey);
}
