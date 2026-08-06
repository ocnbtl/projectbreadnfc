import { NextResponse, type NextRequest } from "next/server";
import { syncGoogleIntegration } from "@/lib/integrations/google-runtime";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("integrations")
    .select("id")
    .eq("provider", "google_business_profile")
    .in("status", ["connected", "error"])
    .limit(100);

  if (error) return NextResponse.json({ error: "Integration register unavailable." }, { status: 500 });

  const results: Array<{ integrationId: string; ok: boolean; imported?: number; error?: string }> = [];
  for (const integration of data ?? []) {
    try {
      const result = await syncGoogleIntegration(integration.id);
      results.push({ integrationId: integration.id, ok: true, imported: result.imported });
    } catch (syncError) {
      results.push({
        integrationId: integration.id,
        ok: false,
        error: syncError instanceof Error ? syncError.message : "Synchronization failed.",
      });
    }
  }

  const { error: cleanupError } = await admin
    .from("reviews")
    .delete()
    .eq("provider", "google_business_profile")
    .lte("source_expires_at", new Date().toISOString());
  const { error: summaryCleanupError } = await admin
    .from("external_locations")
    .update({
      provider_average_rating: null,
      provider_total_review_count: null,
      source_content_expires_at: null,
    })
    .lte("source_content_expires_at", new Date().toISOString());

  return NextResponse.json({
    processed: results.length,
    retentionCleanup: cleanupError || summaryCleanupError ? "failed" : "complete",
    results,
  });
}
