import { FileCheck2, MapPinned, ShieldCheck } from "lucide-react";
import { canManageOrganization } from "@/lib/app-types";
import { requireWorkspace } from "@/lib/workspace";
import { updateLocationPolicyAction, updateOrganizationPoliciesAction } from "../actions";
import { MessageBanner, ProductPageHeader } from "@/components/product/product-ui";

type PolicyRow = {
  reply_approval_required: boolean;
  allow_location_overrides: boolean;
};
type AuditRow = { id: number; action: string; entity_type: string; created_at: string };
type LocationPolicyRow = {
  location_id: string;
  inherits_organization: boolean;
  reply_approval_required: boolean | null;
};
type LocationAssignmentRow = { location_id: string; role: string };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const context = await requireWorkspace();
  const params = await searchParams;
  const canManage = canManageOrganization(context.membership.role);
  const [policyResult, auditResult, locationPolicyResult, assignmentResult] = await Promise.all([
    context.supabase.from("organization_policies").select("reply_approval_required, allow_location_overrides").eq("organization_id", context.organization.id).single(),
    context.supabase.from("audit_events").select("id, action, entity_type, created_at").eq("organization_id", context.organization.id).order("created_at", { ascending: false }).limit(8),
    context.supabase.from("location_policies").select("location_id, inherits_organization, reply_approval_required").eq("organization_id", context.organization.id),
    context.supabase.from("location_memberships").select("location_id, role").eq("organization_id", context.organization.id).eq("user_id", context.user.id),
  ]);
  if (policyResult.error) throw new Error(policyResult.error.message);
  const policy = policyResult.data as PolicyRow;
  const audit = (auditResult.data ?? []) as AuditRow[];
  const locationPolicies = (locationPolicyResult.data ?? []) as LocationPolicyRow[];
  const assignments = (assignmentResult.data ?? []) as LocationAssignmentRow[];

  return (
    <>
      <ProductPageHeader context={context.organization.name} description="Organization rules establish the default. Location rules may only override them when this workspace allows it." title="Rules and governance" />
      <MessageBanner error={params.error} notice={params.notice} />
      <div className="settings-workspace">
        <section className="rules-panel">
          <div className="section-heading"><div><h2>Organization rules</h2><p>Applied across every location by default.</p></div><span><ShieldCheck size={16} /> {canManage ? "Editable" : "Read only"}</span></div>
          <form action={updateOrganizationPoliciesAction} className="rules-form">
            <label className="rule-toggle"><span><FileCheck2 size={18} /><span><strong>Require reply approval</strong><small>Responders submit drafts; managers and administrators publish.</small></span></span><input defaultChecked={policy.reply_approval_required} disabled={!canManage} name="reply_approval_required" type="checkbox" /></label>
            <label className="rule-toggle"><span><MapPinned size={18} /><span><strong>Allow location overrides</strong><small>Location managers may tailor permitted rules for their operation.</small></span></span><input defaultChecked={policy.allow_location_overrides} disabled={!canManage} name="allow_location_overrides" type="checkbox" /></label>
            {canManage ? <button className="product-button primary" type="submit">Save organization rules</button> : null}
          </form>
        </section>
        <aside className="audit-panel">
          <div className="section-heading"><div><h2>Recent changes</h2><p>An accountable record of workspace administration.</p></div></div>
          {audit.length ? <ol>{audit.map((event) => <li key={event.id}><span /><div><strong>{event.action.replaceAll("_", " ").replaceAll(".", " · ")}</strong><small>{event.entity_type} · {new Date(event.created_at).toLocaleString()}</small></div></li>)}</ol> : <p>No administrative changes recorded yet.</p>}
        </aside>
      </div>

      <section className="location-rules-panel">
        <div className="section-heading"><div><h2>Location rules</h2><p>Keep the organization defaults or make a deliberate exception for one operation.</p></div><span><MapPinned size={16} /> {policy.allow_location_overrides ? "Overrides permitted" : "Admin controlled"}</span></div>
        <div className="location-rule-list">
          {context.locations.map((location) => {
            const locationPolicy = locationPolicies.find((item) => item.location_id === location.id);
            const assignedRole = assignments.find((item) => item.location_id === location.id)?.role;
            const isOrganizationManager = context.membership.role === "manager" && context.membership.accessScope === "organization";
            const isAssignedManager = context.membership.accessScope === "assigned_locations" && assignedRole === "manager";
            const canEdit = canManage || (policy.allow_location_overrides && (isOrganizationManager || isAssignedManager));
            const inherits = locationPolicy?.inherits_organization ?? true;
            return (
              <details key={location.id}>
                <summary><span><MapPinned size={17} /><span><strong>{location.name}</strong><small>{inherits ? "Using organization rules" : "Custom location rules"}</small></span></span><em>{canEdit ? "Manage" : "Read only"}</em></summary>
                <form action={updateLocationPolicyAction} className="location-rule-form">
                  <input name="location_id" type="hidden" value={location.id} />
                  <label className="rule-toggle compact"><span><ShieldCheck size={17} /><span><strong>Inherit organization rules</strong><small>When enabled, Scantap ignores the custom values below.</small></span></span><input defaultChecked={inherits} disabled={!canEdit} name="inherits_organization" type="checkbox" /></label>
                  <div className="location-rule-checks">
                    <label><input defaultChecked={locationPolicy?.reply_approval_required ?? policy.reply_approval_required} disabled={!canEdit} name="reply_approval_required" type="checkbox" /> Require reply approval</label>
                  </div>
                  {canEdit ? <button className="product-button secondary" type="submit">Save {location.name} rules</button> : null}
                </form>
              </details>
            );
          })}
        </div>
      </section>
    </>
  );
}
