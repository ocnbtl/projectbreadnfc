"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { canManageOrganization, canReply, type AppRole } from "@/lib/app-types";
import { publishGoogleReply } from "@/lib/integrations/google-business-profile";
import { getGoogleAccessToken, syncGoogleIntegration } from "@/lib/integrations/google-runtime";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAuthenticatedUser, requireWorkspace } from "@/lib/workspace";

const roles = ["owner", "admin", "manager", "responder", "analyst", "viewer"] as const;
const locationRoles = ["manager", "responder", "analyst", "viewer"] as const;
const scopes = ["organization", "assigned_locations"] as const;
const linkProviders = ["facebook", "instagram", "linkedin", "trustpilot", "yelp", "tripadvisor", "bbb", "other"] as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

function withMessage(path: string, kind: "error" | "notice", message: string) {
  const params = new URLSearchParams({ [kind]: message });
  return `${path}?${params.toString()}`;
}

function ensureOrganizationAdmin(role: (typeof roles)[number]) {
  if (!canManageOrganization(role)) {
    redirect(withMessage("/app", "error", "Administrator access is required for that change."));
  }
}

export async function createOrganizationAction(formData: FormData) {
  const parsed = z.object({
    name: z.string().trim().min(2).max(120),
    first_location: z.string().trim().min(2).max(120),
  }).safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirect(withMessage("/app/onboarding", "error", "Add an organization and location name."));
  }

  const { supabase } = await requireAuthenticatedUser();
  const slug = slugify(parsed.data.name);
  const { error } = await supabase.rpc("create_organization", {
    organization_name: parsed.data.name,
    organization_slug: `${slug}-${crypto.randomUUID().slice(0, 6)}`,
    first_location_name: parsed.data.first_location,
  });

  if (error) redirect(withMessage("/app/onboarding", "error", error.message));
  redirect("/app");
}

export async function selectOrganizationAction(formData: FormData) {
  const { memberships } = await requireWorkspace();
  const organizationId = z.string().uuid().safeParse(formData.get("organization_id"));
  if (!organizationId.success || !memberships.some((item) => item.organizationId === organizationId.data)) {
    redirect(withMessage("/app", "error", "That organization is not available to this account."));
  }

  const cookieStore = await cookies();
  cookieStore.set("scantap-organization", organizationId.data, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect("/app");
}

export async function signOutAction() {
  const { supabase } = await requireAuthenticatedUser();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function acceptInvitationAction(formData: FormData) {
  const token = z.string().uuid().safeParse(formData.get("token"));
  if (!token.success) redirect(withMessage("/login", "error", "That invitation link is invalid."));
  const { supabase } = await requireAuthenticatedUser();
  const { data, error } = await supabase.rpc("accept_invitation", {
    invitation_token: token.data,
  });
  if (error) redirect(`/invite/${token.data}?error=${encodeURIComponent(error.message)}`);

  const organizationId = typeof data === "string" ? data : String(data);
  const cookieStore = await cookies();
  cookieStore.set("scantap-organization", organizationId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect(withMessage("/app", "notice", "Invitation accepted."));
}

export async function createLocationAction(formData: FormData) {
  const context = await requireWorkspace();
  ensureOrganizationAdmin(context.membership.role);
  const parsed = z.object({
    name: z.string().trim().min(2).max(120),
    city: z.string().trim().max(120).optional(),
    region: z.string().trim().max(80).optional(),
  }).safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirect(withMessage("/app/locations", "error", "Add a valid location name."));
  }

  const { error } = await context.supabase.rpc("create_location", {
    target_organization_id: context.organization.id,
    location_name: parsed.data.name,
    location_slug: `${slugify(parsed.data.name)}-${crypto.randomUUID().slice(0, 5)}`,
    location_city: parsed.data.city || null,
    location_region: parsed.data.region || null,
  });

  if (error) redirect(withMessage("/app/locations", "error", error.message));
  revalidatePath("/app/locations");
  redirect(withMessage("/app/locations", "notice", "Location added."));
}

export async function updateLocationAction(formData: FormData) {
  const context = await requireWorkspace();
  ensureOrganizationAdmin(context.membership.role);
  const parsed = z.object({
    location_id: z.string().uuid(),
    name: z.string().trim().min(2).max(120),
    status: z.enum(["active", "paused", "archived"]),
    timezone: z.string().trim().min(3).max(80),
    address_line_1: z.string().trim().max(180).optional(),
    city: z.string().trim().max(120).optional(),
    region: z.string().trim().max(80).optional(),
    postal_code: z.string().trim().max(24).optional(),
    google_review_url: z.union([z.url(), z.literal("")]).optional(),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success || !context.locations.some((item) => item.id === parsed.data.location_id)) {
    redirect(withMessage("/app/locations", "error", "Check the location details and review destination."));
  }

  const { location_id, ...values } = parsed.data;
  const { error } = await context.supabase
    .from("locations")
    .update({
      ...values,
      address_line_1: values.address_line_1 || null,
      city: values.city || null,
      region: values.region || null,
      postal_code: values.postal_code || null,
      google_review_url: values.google_review_url || null,
    })
    .eq("organization_id", context.organization.id)
    .eq("id", location_id);
  if (error) redirect(withMessage("/app/locations", "error", error.message));
  revalidatePath("/app");
  revalidatePath("/app/locations");
  redirect(withMessage("/app/locations", "notice", "Location updated."));
}

export async function createDeviceAction(formData: FormData) {
  const context = await requireWorkspace();
  ensureOrganizationAdmin(context.membership.role);
  const parsed = z.object({
    name: z.string().trim().min(2).max(120),
    serial_number: z.string().trim().min(3).max(120),
    product_type: z.enum(["counter_stand", "adhesive_plate", "staff_card"]),
    location_id: z.string().uuid(),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success || !context.locations.some((item) => item.id === parsed.data.location_id)) {
    redirect(withMessage("/app/devices", "error", "Check the device name, serial number, and location."));
  }

  const { error } = await context.supabase.from("devices").insert({
    ...parsed.data,
    organization_id: context.organization.id,
    status: "active",
  });
  if (error) redirect(withMessage("/app/devices", "error", error.message));
  revalidatePath("/app");
  revalidatePath("/app/devices");
  revalidatePath("/app/locations");
  redirect(withMessage("/app/devices", "notice", "Device registered."));
}

export async function updateDeviceAction(formData: FormData) {
  const context = await requireWorkspace();
  ensureOrganizationAdmin(context.membership.role);
  const parsed = z.object({
    device_id: z.string().uuid(),
    name: z.string().trim().min(2).max(120),
    location_id: z.string().uuid(),
    status: z.enum(["active", "needs_attention", "offline", "retired"]),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success || !context.locations.some((item) => item.id === parsed.data.location_id)) {
    redirect(withMessage("/app/devices", "error", "Choose a valid device, location, and status."));
  }

  const { device_id, ...values } = parsed.data;
  const { error } = await context.supabase
    .from("devices")
    .update(values)
    .eq("organization_id", context.organization.id)
    .eq("id", device_id);
  if (error) redirect(withMessage("/app/devices", "error", error.message));
  revalidatePath("/app");
  revalidatePath("/app/devices");
  revalidatePath("/app/locations");
  redirect(withMessage("/app/devices", "notice", "Device updated."));
}

export async function inviteMemberAction(formData: FormData) {
  const context = await requireWorkspace();
  ensureOrganizationAdmin(context.membership.role);
  const parsed = z.object({
    email: z.email(),
    role: z.enum(roles),
    access_scope: z.enum(scopes),
  }).safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirect(withMessage("/app/team", "error", "Check the email, role, and access scope."));
  }

  const { data, error } = await context.supabase.rpc("create_invitation", {
    target_organization_id: context.organization.id,
    invited_email: parsed.data.email,
    invited_role: parsed.data.role,
    invited_scope: parsed.data.access_scope,
  });

  if (error) redirect(withMessage("/app/team", "error", error.message));
  const result = Array.isArray(data) ? data[0] : data;
  const token = result && typeof result === "object" && "invitation_token" in result
    ? String(result.invitation_token)
    : "";
  const params = new URLSearchParams({ notice: "Invitation created.", invite: token });
  revalidatePath("/app/team");
  redirect(`/app/team?${params.toString()}`);
}

export async function updateMemberAction(formData: FormData) {
  const context = await requireWorkspace();
  ensureOrganizationAdmin(context.membership.role);
  const parsed = z.object({
    user_id: z.string().uuid(),
    role: z.enum(roles),
    access_scope: z.enum(scopes),
  }).safeParse(Object.fromEntries(formData));

  if (!parsed.success) redirect(withMessage("/app/team", "error", "Choose a valid role and scope."));
  const { error } = await context.supabase
    .from("organization_memberships")
    .update({ role: parsed.data.role, access_scope: parsed.data.access_scope })
    .eq("organization_id", context.organization.id)
    .eq("user_id", parsed.data.user_id);

  if (error) redirect(withMessage("/app/team", "error", error.message));
  revalidatePath("/app/team");
  redirect(withMessage("/app/team", "notice", "Member access updated."));
}

export async function removeMemberAction(formData: FormData) {
  const context = await requireWorkspace();
  ensureOrganizationAdmin(context.membership.role);
  const userId = z.string().uuid().safeParse(formData.get("user_id"));
  if (!userId.success) redirect(withMessage("/app/team", "error", "That member could not be identified."));

  const { error } = await context.supabase
    .from("organization_memberships")
    .delete()
    .eq("organization_id", context.organization.id)
    .eq("user_id", userId.data);

  if (error) redirect(withMessage("/app/team", "error", error.message));
  revalidatePath("/app/team");
  redirect(withMessage("/app/team", "notice", "Member removed."));
}

export async function assignLocationAction(formData: FormData) {
  const context = await requireWorkspace();
  ensureOrganizationAdmin(context.membership.role);
  const parsed = z.object({
    user_id: z.string().uuid(),
    location_id: z.string().uuid(),
    role: z.union([z.enum(locationRoles), z.literal("none")]),
  }).safeParse(Object.fromEntries(formData));

  if (!parsed.success) redirect(withMessage("/app/team", "error", "Choose a valid location assignment."));
  if (parsed.data.role === "none") {
    const { error } = await context.supabase
      .from("location_memberships")
      .delete()
      .eq("location_id", parsed.data.location_id)
      .eq("user_id", parsed.data.user_id);
    if (error) redirect(withMessage("/app/team", "error", error.message));
  } else {
    const { error } = await context.supabase.from("location_memberships").upsert({
      organization_id: context.organization.id,
      location_id: parsed.data.location_id,
      user_id: parsed.data.user_id,
      role: parsed.data.role,
    });
    if (error) redirect(withMessage("/app/team", "error", error.message));
  }

  revalidatePath("/app/team");
  redirect(withMessage("/app/team", "notice", "Location access updated."));
}

export async function updateOrganizationPoliciesAction(formData: FormData) {
  const context = await requireWorkspace();
  ensureOrganizationAdmin(context.membership.role);

  const { error } = await context.supabase
    .from("organization_policies")
    .update({
      reply_approval_required: formData.get("reply_approval_required") === "on",
      allow_location_overrides: formData.get("allow_location_overrides") === "on",
    })
    .eq("organization_id", context.organization.id);

  if (error) redirect(withMessage("/app/settings", "error", error.message));
  revalidatePath("/app/settings");
  redirect(withMessage("/app/settings", "notice", "Organization rules saved."));
}

export async function addLinkIntegrationAction(formData: FormData) {
  const context = await requireWorkspace();
  ensureOrganizationAdmin(context.membership.role);
  const parsed = z.object({
    provider: z.enum(linkProviders),
    display_name: z.string().trim().min(2).max(120),
    profile_url: z.url(),
    reply_url: z.union([z.url(), z.literal("")]).optional(),
  }).safeParse(Object.fromEntries(formData));

  if (!parsed.success) redirect(withMessage("/app/integrations", "error", "Add a provider name and valid profile URL."));
  const { error } = await context.supabase.from("integrations").insert({
    organization_id: context.organization.id,
    provider: parsed.data.provider,
    display_name: parsed.data.display_name,
    mode: "link_only",
    status: "connected",
    capabilities: ["open_at_source"],
    profile_url: parsed.data.profile_url,
    reply_url: parsed.data.reply_url || parsed.data.profile_url,
    created_by: context.user.id,
  });

  if (error) redirect(withMessage("/app/integrations", "error", error.message));
  revalidatePath("/app/integrations");
  redirect(withMessage("/app/integrations", "notice", "External review source added."));
}

export async function disconnectIntegrationAction(formData: FormData) {
  const context = await requireWorkspace();
  ensureOrganizationAdmin(context.membership.role);
  const integrationId = z.string().uuid().safeParse(formData.get("integration_id"));
  if (!integrationId.success) redirect(withMessage("/app/integrations", "error", "That integration could not be identified."));

  const { error } = await context.supabase
    .from("integrations")
    .update({ status: "disconnected", last_error: null })
    .eq("organization_id", context.organization.id)
    .eq("id", integrationId.data);
  if (error) redirect(withMessage("/app/integrations", "error", error.message));

  try {
    const admin = createSupabaseAdminClient();
    await admin.from("integration_credentials").delete().eq("integration_id", integrationId.data);
  } catch {
    // Link-only integrations have no credentials. Native credentials require server setup.
  }

  revalidatePath("/app/integrations");
  redirect(withMessage("/app/integrations", "notice", "Integration disconnected."));
}

export async function mapExternalLocationAction(formData: FormData) {
  const context = await requireWorkspace();
  ensureOrganizationAdmin(context.membership.role);
  const parsed = z.object({
    external_location_id: z.string().uuid(),
    location_id: z.union([z.string().uuid(), z.literal("")]),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(withMessage("/app/integrations", "error", "Choose a valid location mapping."));

  const { error } = await context.supabase
    .from("external_locations")
    .update({ location_id: parsed.data.location_id || null })
    .eq("organization_id", context.organization.id)
    .eq("id", parsed.data.external_location_id);
  if (error) redirect(withMessage("/app/integrations", "error", error.message));

  revalidatePath("/app/integrations");
  redirect(withMessage("/app/integrations", "notice", "Google location mapping saved."));
}

export async function syncGoogleIntegrationAction(formData: FormData) {
  const context = await requireWorkspace();
  ensureOrganizationAdmin(context.membership.role);
  const integrationId = z.string().uuid().safeParse(formData.get("integration_id"));
  if (!integrationId.success) redirect(withMessage("/app/integrations", "error", "That integration could not be identified."));

  const { data: integration, error } = await context.supabase
    .from("integrations")
    .select("id")
    .eq("id", integrationId.data)
    .eq("organization_id", context.organization.id)
    .eq("provider", "google_business_profile")
    .single();
  if (error || !integration) redirect(withMessage("/app/integrations", "error", "That Google connection is not available."));

  let imported = 0;
  try {
    const result = await syncGoogleIntegration(integration.id);
    imported = result.imported;
  } catch (syncError) {
    const message = syncError instanceof Error ? syncError.message : "Google synchronization failed.";
    redirect(withMessage("/app/integrations", "error", message));
  }
  revalidatePath("/app");
  revalidatePath("/app/reviews");
  revalidatePath("/app/integrations");
  redirect(withMessage("/app/integrations", "notice", `${imported} Google reviews synchronized.`));
}

async function effectiveLocationRole(
  context: Awaited<ReturnType<typeof requireWorkspace>>,
  locationId: string,
): Promise<AppRole> {
  if (context.membership.role === "owner" || context.membership.role === "admin") {
    return context.membership.role;
  }
  if (context.membership.accessScope === "organization") return context.membership.role;

  const { data } = await context.supabase
    .from("location_memberships")
    .select("role")
    .eq("organization_id", context.organization.id)
    .eq("location_id", locationId)
    .eq("user_id", context.user.id)
    .maybeSingle();
  return (data?.role as AppRole | undefined) ?? "viewer";
}

type PublishableReview = {
  id: string;
  organization_id: string;
  location_id: string;
  provider: string;
  external_review_id: string;
  external_location_id: string | null;
};

async function publishDraftToGoogle(
  context: Awaited<ReturnType<typeof requireWorkspace>>,
  draftId: string,
  body: string,
  review: PublishableReview,
  authoredBy = context.user.id,
) {
  if (Buffer.byteLength(body, "utf8") > 4096) {
    throw new Error("Google replies must be no more than 4,096 bytes. Shorten this reply and try again.");
  }
  if (review.provider !== "google_business_profile" || !review.external_location_id) {
    throw new Error("This source must be answered at the provider.");
  }

  const { data: externalLocation, error: locationError } = await context.supabase
    .from("external_locations")
    .select("integration_id")
    .eq("id", review.external_location_id)
    .eq("organization_id", context.organization.id)
    .single();
  if (locationError || !externalLocation) throw new Error("The Google source mapping is unavailable.");

  const admin = createSupabaseAdminClient();
  const { error: publishingError } = await admin.from("reply_drafts").update({
    state: "publishing",
    approved_by: context.user.id,
    approved_at: new Date().toISOString(),
    failure_message: null,
  }).eq("id", draftId);
  if (publishingError) throw new Error("The reply could not enter the publishing queue.");

  try {
    const accessToken = await getGoogleAccessToken(externalLocation.integration_id);
    const confirmation = await publishGoogleReply(accessToken, review.external_review_id, body);
    if (confirmation.reviewReplyState === "REJECTED") {
      throw new Error(`Google rejected this reply${confirmation.policyViolation ? `: ${confirmation.policyViolation.replaceAll("_", " ").toLowerCase()}` : "."}`);
    }

    const confirmedAt = confirmation.updateTime || new Date().toISOString();
    const providerPending = confirmation.reviewReplyState === "PENDING";
    const replyState = providerPending ? "provider_pending" : "published";
    const { error: replyError } = await admin.from("review_replies").insert({
      organization_id: review.organization_id,
      location_id: review.location_id,
      review_id: review.id,
      draft_id: draftId,
      body: confirmation.comment || body,
      state: replyState,
      authored_by: authoredBy,
      published_by: context.user.id,
      published_at: providerPending ? null : confirmedAt,
      provider_payload: confirmation,
    });
    if (replyError) throw new Error("Google confirmed the reply, but its local receipt could not be stored.");

    await Promise.all([
      admin.from("reply_drafts").update({ state: replyState, failure_message: null }).eq("id", draftId),
      admin.from("reviews").update({ status: providerPending ? "needs_reply" : "replied", replied_at: providerPending ? null : confirmedAt }).eq("id", review.id),
    ]);
    return providerPending
      ? "Google received the reply and is reviewing it."
      : "Google confirmed and published the reply.";
  } catch (publishError) {
    const message = publishError instanceof Error ? publishError.message : "Google did not confirm the reply.";
    await admin.from("reply_drafts").update({ state: "failed", failure_message: message }).eq("id", draftId);
    throw new Error(message);
  }
}

export async function publishReplyAction(formData: FormData) {
  const context = await requireWorkspace();
  const parsed = z.object({
    review_id: z.string().uuid(),
    body: z.string().trim().min(1).max(4000),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(withMessage("/app/reviews", "error", "Write a reply before continuing."));

  const { data: review, error: reviewError } = await context.supabase
    .from("reviews")
    .select("id, organization_id, location_id, provider, external_review_id, external_location_id")
    .eq("id", parsed.data.review_id)
    .eq("organization_id", context.organization.id)
    .single();
  if (reviewError || !review) redirect(withMessage("/app/reviews", "error", "That review is not available."));

  const role = await effectiveLocationRole(context, review.location_id);
  if (!canReply(role)) redirect(withMessage("/app/reviews", "error", "Your role cannot prepare or publish replies."));

  const [{ data: organizationPolicy }, { data: locationPolicy }] = await Promise.all([
    context.supabase
      .from("organization_policies")
      .select("reply_approval_required")
      .eq("organization_id", context.organization.id)
      .single(),
    context.supabase
      .from("location_policies")
      .select("inherits_organization, reply_approval_required")
      .eq("location_id", review.location_id)
      .maybeSingle(),
  ]);
  const approvalRequired = locationPolicy?.inherits_organization === false
    && locationPolicy.reply_approval_required !== null
    ? locationPolicy.reply_approval_required
    : organizationPolicy?.reply_approval_required ?? true;
  const needsApproval = approvalRequired && role === "responder";

  const { data: draft, error: draftError } = await context.supabase
    .from("reply_drafts")
    .insert({
      organization_id: review.organization_id,
      location_id: review.location_id,
      review_id: review.id,
      body: parsed.data.body,
      state: needsApproval ? "pending_approval" : "draft",
      created_by: context.user.id,
    })
    .select("id")
    .single();
  if (draftError || !draft) redirect(withMessage("/app/reviews", "error", draftError?.message || "The reply could not be saved."));

  if (needsApproval) {
    revalidatePath("/app/reviews");
    redirect(withMessage("/app/reviews", "notice", "Reply submitted for manager approval."));
  }

  if (review.provider !== "google_business_profile" || !review.external_location_id) {
    redirect(withMessage("/app/reviews", "notice", "Draft saved. This source must be answered at the provider."));
  }

  let outcomeMessage = "";
  try {
    outcomeMessage = await publishDraftToGoogle(context, draft.id, parsed.data.body, review);
  } catch (publishError) {
    const message = publishError instanceof Error ? publishError.message : "Google did not confirm the reply.";
    redirect(withMessage("/app/reviews", "error", message));
  }

  revalidatePath("/app");
  revalidatePath("/app/reviews");
  redirect(withMessage("/app/reviews", "notice", outcomeMessage));
}

export async function approveReplyAction(formData: FormData) {
  const context = await requireWorkspace();
  const draftId = z.string().uuid().safeParse(formData.get("draft_id"));
  if (!draftId.success) redirect(withMessage("/app/reviews", "error", "That reply draft could not be identified."));

  const { data: draft, error: draftError } = await context.supabase
    .from("reply_drafts")
    .select("id, body, state, review_id, location_id, created_by")
    .eq("id", draftId.data)
    .eq("organization_id", context.organization.id)
    .single();
  if (draftError || !draft || draft.state !== "pending_approval") {
    redirect(withMessage("/app/reviews", "error", "That draft is no longer waiting for approval."));
  }

  const role = await effectiveLocationRole(context, draft.location_id);
  if (!["owner", "admin", "manager"].includes(role)) {
    redirect(withMessage("/app/reviews", "error", "Manager access is required to approve replies."));
  }

  const { data: review, error: reviewError } = await context.supabase
    .from("reviews")
    .select("id, organization_id, location_id, provider, external_review_id, external_location_id")
    .eq("id", draft.review_id)
    .eq("organization_id", context.organization.id)
    .single();
  if (reviewError || !review) redirect(withMessage("/app/reviews", "error", "The source review is unavailable."));

  let outcomeMessage = "";
  try {
    outcomeMessage = await publishDraftToGoogle(context, draft.id, draft.body, review, draft.created_by);
  } catch (publishError) {
    const message = publishError instanceof Error ? publishError.message : "Google did not confirm the reply.";
    redirect(withMessage("/app/reviews", "error", message));
  }

  revalidatePath("/app");
  revalidatePath("/app/reviews");
  redirect(withMessage("/app/reviews", "notice", outcomeMessage));
}

export async function saveReplyDraftAction(formData: FormData) {
  const context = await requireWorkspace();
  const parsed = z.object({
    review_id: z.string().uuid(),
    body: z.string().trim().min(1).max(4000),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(withMessage("/app/reviews", "error", "Write a reply before saving."));

  const { data: review, error: reviewError } = await context.supabase
    .from("reviews")
    .select("id, organization_id, location_id")
    .eq("id", parsed.data.review_id)
    .single();
  if (reviewError || !review) redirect(withMessage("/app/reviews", "error", "That review is not available."));

  const { error } = await context.supabase.from("reply_drafts").insert({
    organization_id: review.organization_id,
    location_id: review.location_id,
    review_id: review.id,
    body: parsed.data.body,
    state: "draft",
    created_by: context.user.id,
  });
  if (error) redirect(withMessage("/app/reviews", "error", error.message));

  revalidatePath("/app/reviews");
  redirect(withMessage("/app/reviews", "notice", "Reply draft saved. Publishing opens after Google is connected."));
}

export async function updateLocationPolicyAction(formData: FormData) {
  const context = await requireWorkspace();
  const parsed = z.object({
    location_id: z.string().uuid(),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(withMessage("/app/settings", "error", "Check the location rule values."));

  const inherits = formData.get("inherits_organization") === "on";
  const changes = inherits
    ? {
        inherits_organization: true,
        reply_approval_required: null,
      }
    : {
        inherits_organization: false,
        reply_approval_required: formData.get("reply_approval_required") === "on",
      };

  const { error } = await context.supabase
    .from("location_policies")
    .update(changes)
    .eq("organization_id", context.organization.id)
    .eq("location_id", parsed.data.location_id);
  if (error) redirect(withMessage("/app/settings", "error", error.message));

  revalidatePath("/app/settings");
  redirect(withMessage("/app/settings", "notice", "Location rules saved."));
}
