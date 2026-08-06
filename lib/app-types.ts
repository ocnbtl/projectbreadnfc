export type AppRole =
  | "owner"
  | "admin"
  | "manager"
  | "responder"
  | "analyst"
  | "viewer";

export type AccessScope = "organization" | "assigned_locations";

export type WorkspaceOrganization = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
};

export type WorkspaceMembership = {
  organizationId: string;
  role: AppRole;
  accessScope: AccessScope;
  organization: WorkspaceOrganization;
};

export type WorkspaceLocation = {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  status: "active" | "paused" | "archived";
  timezone: string;
  address_line_1: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  google_review_url: string | null;
};

export function canManageOrganization(role: AppRole) {
  return role === "owner" || role === "admin";
}

export function canReply(role: AppRole) {
  return ["owner", "admin", "manager", "responder"].includes(role);
}

export function roleLabel(role: AppRole) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
