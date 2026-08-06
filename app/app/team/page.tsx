import { MailPlus, MapPin, ShieldCheck, UserMinus, Users } from "lucide-react";
import { headers } from "next/headers";
import { canManageOrganization, roleLabel, type AccessScope, type AppRole } from "@/lib/app-types";
import { requireWorkspace } from "@/lib/workspace";
import {
  assignLocationAction,
  inviteMemberAction,
  removeMemberAction,
  updateMemberAction,
} from "../actions";
import { MessageBanner, ProductPageHeader } from "@/components/product/product-ui";
import { ConfirmActionForm } from "@/components/product/confirm-action-form";

type MemberRow = {
  user_id: string;
  role: AppRole;
  access_scope: AccessScope;
  status: string;
};

type ProfileRow = { id: string; email: string | null; full_name: string | null };
type AssignmentRow = { user_id: string; location_id: string; role: AppRole };

const roleOptions: AppRole[] = ["owner", "admin", "manager", "responder", "analyst", "viewer"];

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string; invite?: string }>;
}) {
  const context = await requireWorkspace();
  const params = await searchParams;
  const canManage = canManageOrganization(context.membership.role);
  const assignableRoles = context.membership.role === "owner"
    ? roleOptions
    : roleOptions.filter((role) => role !== "owner");
  const { data: membersData, error } = await context.supabase
    .from("organization_memberships")
    .select("user_id, role, access_scope, status")
    .eq("organization_id", context.organization.id)
    .order("created_at");
  if (error) throw new Error(error.message);
  const members = (membersData ?? []) as MemberRow[];
  const userIds = members.map((member) => member.user_id);
  const [profilesResult, assignmentsResult] = await Promise.all([
    userIds.length
      ? context.supabase.from("profiles").select("id, email, full_name").in("id", userIds)
      : Promise.resolve({ data: [] as ProfileRow[], error: null }),
    context.supabase
      .from("location_memberships")
      .select("user_id, location_id, role")
      .eq("organization_id", context.organization.id),
  ]);
  const profiles = (profilesResult.data ?? []) as ProfileRow[];
  const assignments = (assignmentsResult.data ?? []) as AssignmentRow[];
  const headerStore = await headers();
  const origin = headerStore.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";
  const inviteUrl = params.invite ? `${origin}/invite/${params.invite}` : "";

  return (
    <>
      <ProductPageHeader
        context={context.organization.name}
        description="Organization roles define authority. Location assignments narrow where that authority applies."
        title="People and permissions"
      />
      <MessageBanner error={params.error} notice={params.notice} />
      {inviteUrl ? (
        <div className="invite-result" role="status">
          <div><strong>Invitation link ready</strong><span>Send this link to the invited email address. It expires in seven days.</span></div>
          <label><span className="sr-only">Select and copy invitation link</span><input aria-label="Select and copy invitation link" readOnly value={inviteUrl} /></label>
        </div>
      ) : null}

      <div className="team-workspace">
        <section className="team-register">
          <div className="section-heading"><div><h2>Organization members</h2><p>{members.length} active accounts</p></div></div>
          <div className="team-records">
            {members.map((member) => {
              const profile = profiles.find((item) => item.id === member.user_id);
              const memberAssignments = assignments.filter((item) => item.user_id === member.user_id);
              const isSelf = member.user_id === context.user.id;
              const canManageMember = canManage && (member.role !== "owner" || context.membership.role === "owner");
              return (
                <article key={member.user_id}>
                  <div className="team-identity">
                    <span>{(profile?.full_name || profile?.email || "TM").slice(0, 2).toUpperCase()}</span>
                    <div><strong>{profile?.full_name || profile?.email || "Team member"}</strong><small>{profile?.email || member.user_id.slice(0, 8)}</small></div>
                    {isSelf ? <em>You</em> : null}
                  </div>
                  <div className="team-access-summary">
                    <span><ShieldCheck size={15} /> {roleLabel(member.role)}</span>
                    <span><MapPin size={15} /> {member.access_scope === "organization" ? "All locations" : `${memberAssignments.length} assigned`}</span>
                  </div>
                  {member.access_scope === "assigned_locations" && memberAssignments.length ? <div className="team-assignment-list">{memberAssignments.map((assignment) => {
                    const assignedLocation = context.locations.find((item) => item.id === assignment.location_id);
                    return <span key={assignment.location_id}>{assignedLocation?.name ?? "Location"} · {roleLabel(assignment.role)}</span>;
                  })}</div> : null}
                  {canManageMember ? (
                    <div className="team-controls">
                      <form action={updateMemberAction}>
                        <input name="user_id" type="hidden" value={member.user_id} />
                        <label>Organization role<select defaultValue={member.role} name="role">{assignableRoles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}</select></label>
                        <label>Scope<select defaultValue={member.access_scope} name="access_scope"><option value="organization">All locations</option><option value="assigned_locations">Assigned locations</option></select></label>
                        <button className="product-button secondary compact" type="submit">Update</button>
                      </form>
                      {member.access_scope === "assigned_locations" && context.locations.length ? (
                        <form action={assignLocationAction}>
                          <input name="user_id" type="hidden" value={member.user_id} />
                          <label>Location<select name="location_id">{context.locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}</select></label>
                          <label>Location role<select name="role"><option value="manager">Manager</option><option value="responder">Responder</option><option value="analyst">Analyst</option><option value="viewer">Viewer</option><option value="none">Remove assignment</option></select></label>
                          <button className="product-button secondary compact" type="submit">Set access</button>
                        </form>
                      ) : null}
                      {!isSelf ? <ConfirmActionForm action={removeMemberAction} confirmMessage={`Remove ${profile?.full_name || profile?.email || "this member"} from this organization?`}><input name="user_id" type="hidden" value={member.user_id} /><button aria-label={`Remove ${profile?.full_name || "member"}`} className="icon-button danger" title="Remove member" type="submit"><UserMinus size={16} /></button></ConfirmActionForm> : null}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>

        <aside className="team-invite-panel">
          <div className="panel-icon"><MailPlus size={19} /></div>
          <h2>Invite someone</h2>
          <p>They must sign in with the same email address before the invitation can be accepted.</p>
          {canManage ? (
            <form action={inviteMemberAction} className="product-form">
              <label htmlFor="invite-email">Email address</label><input id="invite-email" name="email" placeholder="manager@business.com" required type="email" />
              <label htmlFor="invite-role">Organization role</label><select defaultValue="manager" id="invite-role" name="role">{assignableRoles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}</select>
              <label htmlFor="invite-scope">Location scope</label><select defaultValue="assigned_locations" id="invite-scope" name="access_scope"><option value="organization">All locations</option><option value="assigned_locations">Assigned locations</option></select>
              <button className="product-button primary" type="submit"><Users size={15} /> Create invitation</button>
            </form>
          ) : <p className="permission-note">Only owners and administrators can change team access.</p>}
        </aside>
      </div>
    </>
  );
}
