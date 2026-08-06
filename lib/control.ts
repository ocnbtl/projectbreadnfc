import "server-only";

import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "./supabase/admin";
import { requireAuthenticatedUser } from "./workspace";

export type PlatformRole = "owner" | "operator" | "support" | "read_only";

export type PlatformStaff = {
  user_id: string;
  role: PlatformRole;
  display_name: string | null;
  active: boolean;
  last_seen_at: string | null;
};

export async function loadPlatformStaff(
  supabase: SupabaseClient,
  userId: string,
): Promise<PlatformStaff | null> {
  const { data, error } = await supabase
    .from("platform_staff")
    .select("user_id, role, display_name, active, last_seen_at")
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();

  if (error) return null;
  return data as PlatformStaff | null;
}

export async function authenticatedLandingPath(
  supabase: SupabaseClient,
  user: User,
  requestedPath?: string,
) {
  if (requestedPath?.startsWith("/") && !requestedPath.startsWith("//")) {
    return requestedPath;
  }

  const staff = await loadPlatformStaff(supabase, user.id);
  return staff ? "/control" : "/app";
}

export async function requirePlatformStaff() {
  const { supabase, user } = await requireAuthenticatedUser();
  const staff = await loadPlatformStaff(supabase, user.id);

  if (!staff) redirect("/app?error=Platform+access+is+not+assigned+to+this+account.");

  return {
    supabase,
    admin: createSupabaseAdminClient(),
    user,
    staff,
  };
}

export function canOperatePlatform(role: PlatformRole) {
  return role === "owner" || role === "operator";
}

export function platformRoleLabel(role: PlatformRole) {
  if (role === "read_only") return "Read only";
  return role.charAt(0).toUpperCase() + role.slice(1);
}
