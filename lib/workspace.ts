import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type {
  AccessScope,
  AppRole,
  WorkspaceLocation,
  WorkspaceMembership,
  WorkspaceOrganization,
} from "./app-types";
import { createServerSupabaseClient } from "./supabase/server";

type MembershipRow = {
  organization_id: string;
  role: AppRole;
  access_scope: AccessScope;
  status: string;
  organizations: WorkspaceOrganization | WorkspaceOrganization[] | null;
};

export async function requireAuthenticatedUser() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) redirect("/login?reason=setup");

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login?next=/app");

  return { supabase, user: data.user };
}

export async function loadMemberships() {
  const { supabase, user } = await requireAuthenticatedUser();
  const { data, error } = await supabase
    .from("organization_memberships")
    .select(
      "organization_id, role, access_scope, status, organizations(id, name, slug, timezone)",
    )
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Unable to load workspace access: ${error.message}`);

  const memberships = ((data ?? []) as unknown as MembershipRow[])
    .map((row): WorkspaceMembership | null => {
      const organization = Array.isArray(row.organizations)
        ? row.organizations[0]
        : row.organizations;
      if (!organization) return null;
      return {
        organizationId: row.organization_id,
        role: row.role,
        accessScope: row.access_scope,
        organization,
      };
    })
    .filter((membership): membership is WorkspaceMembership => membership !== null);

  return { supabase, user, memberships };
}

export async function requireWorkspace() {
  const { supabase, user, memberships } = await loadMemberships();
  if (memberships.length === 0) redirect("/app/onboarding");

  const cookieStore = await cookies();
  const selectedId = cookieStore.get("scantap-organization")?.value;
  const membership =
    memberships.find((item) => item.organizationId === selectedId) ?? memberships[0];

  const { data, error } = await supabase
    .from("locations")
    .select(
      "id, organization_id, name, slug, status, timezone, address_line_1, city, region, postal_code, google_review_url",
    )
    .eq("organization_id", membership.organizationId)
    .neq("status", "archived")
    .order("name");

  if (error) throw new Error(`Unable to load locations: ${error.message}`);

  return {
    supabase,
    user,
    memberships,
    membership,
    organization: membership.organization,
    locations: (data ?? []) as WorkspaceLocation[],
  };
}
