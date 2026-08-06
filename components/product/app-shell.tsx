/**
 * THESIS: Scantap is a role-aware operations ledger, not a wall of equal cards.
 * OWN-WORLD: Signal blue actions, graphite rail, white task canvas, cool steel layers.
 * STORY: See the current organization, find the work, act within visible permissions.
 * FIRST VIEWPORT: Persistent rail, compact workspace bar, then one dominant task region.
 * FORM: Role-aware split workspace; grounded candidate 6, surface seed f4ffa2df.
 */
import { ChevronDown, LogOut, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import type { WorkspaceMembership } from "@/lib/app-types";
import { roleLabel } from "@/lib/app-types";
import { selectOrganizationAction, signOutAction } from "@/app/app/actions";
import { AppNavigation } from "./app-navigation";

export function ProductAppShell({
  children,
  memberships,
  selected,
  email,
}: {
  children: React.ReactNode;
  memberships: WorkspaceMembership[];
  selected: WorkspaceMembership;
  email: string;
}) {
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <div className="product-app">
      <aside className="product-rail">
        <div className="product-rail-brand"><BrandMark compact /></div>
        <AppNavigation />
        <form action={signOutAction} className="product-mobile-signout">
          <button aria-label="Log out" className="icon-button" title="Log out" type="submit"><LogOut size={17} /></button>
        </form>
        <div className="product-rail-foot">
          <span className="product-avatar" aria-hidden="true">{initials}</span>
          <div><strong>{roleLabel(selected.role)}</strong><small>{email}</small></div>
          <form action={signOutAction}>
            <button aria-label="Log out" className="icon-button" title="Log out" type="submit"><LogOut size={17} /></button>
          </form>
        </div>
      </aside>
      <section className="product-app-stage">
        <header className="product-workspace-bar">
          <form action={selectOrganizationAction} className="organization-switcher">
            <ShieldCheck aria-hidden="true" size={17} />
            <label htmlFor="organization-switcher">Organization</label>
            <div>
              <select defaultValue={selected.organizationId} id="organization-switcher" name="organization_id">
                {memberships.map((membership) => (
                  <option key={membership.organizationId} value={membership.organizationId}>
                    {membership.organization.name}
                  </option>
                ))}
              </select>
              <ChevronDown aria-hidden="true" size={15} />
            </div>
            {memberships.length > 1 ? <button className="product-button secondary compact" type="submit">Switch</button> : null}
          </form>
          <div className="workspace-context">
            <span>{roleLabel(selected.role)}</span>
            <small>{selected.accessScope === "organization" ? "All locations" : "Assigned locations"}</small>
          </div>
        </header>
        <div className="product-canvas">{children}</div>
      </section>
    </div>
  );
}
