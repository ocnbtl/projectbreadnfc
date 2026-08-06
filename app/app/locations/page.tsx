import { Building2, MapPin, Pencil, Plus, Radio, ShieldCheck } from "lucide-react";
import { canManageOrganization } from "@/lib/app-types";
import { requireWorkspace } from "@/lib/workspace";
import { createLocationAction, updateLocationAction } from "../actions";
import { MessageBanner, ProductPageHeader } from "@/components/product/product-ui";

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const context = await requireWorkspace();
  const params = await searchParams;
  const canManage = canManageOrganization(context.membership.role);
  const { data: deviceRows } = await context.supabase
    .from("devices")
    .select("location_id, status")
    .eq("organization_id", context.organization.id);

  return (
    <>
      <ProductPageHeader
        context={context.organization.name}
        description="Locations keep review sources, devices, policies, and team assignments attached to the right operation."
        title="Locations"
      />
      <MessageBanner error={params.error} notice={params.notice} />

      <div className="locations-workspace">
        <section className="location-register">
          <div className="section-heading"><div><h2>Location register</h2><p>{context.locations.length} visible to your current role</p></div></div>
          <div className="location-records">
            {context.locations.map((location) => {
              const devices = (deviceRows ?? []).filter((device) => device.location_id === location.id);
              const attention = devices.filter((device) => device.status !== "active").length;
              return (
                <article key={location.id}>
                  <div className="location-record-mark"><MapPin size={19} /></div>
                  <div className="location-record-main">
                    <div><h2>{location.name}</h2><span className={`product-status ${location.status}`}>{location.status}</span></div>
                    <p>{[location.city, location.region].filter(Boolean).join(", ") || "Address not added"}</p>
                    <dl>
                      <div><dt>Google destination</dt><dd>{location.google_review_url ? "Configured" : "Not configured"}</dd></div>
                      <div><dt>Devices</dt><dd>{devices.length}</dd></div>
                      <div><dt>Needs attention</dt><dd>{attention}</dd></div>
                    </dl>
                  </div>
                  <div className="location-record-policy"><ShieldCheck size={16} /><span>Organization rules</span><small>Review or override them in Rules</small></div>
                  {canManage ? <details className="location-edit">
                    <summary><Pencil size={15} /> Edit location</summary>
                    <form action={updateLocationAction} className="product-form location-edit-form">
                      <input name="location_id" type="hidden" value={location.id} />
                      <label>Name<input defaultValue={location.name} name="name" required /></label>
                      <label>Status<select defaultValue={location.status} name="status"><option value="active">Active</option><option value="paused">Paused</option><option value="archived">Archived</option></select></label>
                      <label>Address<input defaultValue={location.address_line_1 ?? ""} name="address_line_1" placeholder="123 Main Street" /></label>
                      <label>City<input defaultValue={location.city ?? ""} name="city" /></label>
                      <label>State or region<input defaultValue={location.region ?? ""} name="region" /></label>
                      <label>Postal code<input defaultValue={location.postal_code ?? ""} name="postal_code" /></label>
                      <label>Timezone<input defaultValue={location.timezone} name="timezone" required /></label>
                      <label className="location-edit-wide">Google review destination<input defaultValue={location.google_review_url ?? ""} name="google_review_url" placeholder="https://g.page/r/.../review" type="url" /></label>
                      <button className="product-button secondary location-edit-wide" type="submit">Save location</button>
                    </form>
                  </details> : null}
                </article>
              );
            })}
          </div>
        </section>

        <aside className="location-create-panel">
          <div className="panel-icon"><Plus size={19} /></div>
          <h2>Add a location</h2>
          <p>New locations inherit organization rules until an administrator permits an override.</p>
          {canManage ? (
            <form action={createLocationAction} className="product-form">
              <label htmlFor="location-name">Location name</label>
              <div className="input-with-icon"><Building2 size={16} /><input id="location-name" name="name" placeholder="Downtown" required /></div>
              <div className="form-row">
                <div><label htmlFor="location-city">City</label><input id="location-city" name="city" placeholder="Cincinnati" /></div>
                <div><label htmlFor="location-region">State</label><input id="location-region" maxLength={80} name="region" placeholder="OH" /></div>
              </div>
              <button className="product-button primary" type="submit"><Plus size={15} /> Add location</button>
            </form>
          ) : (
            <div className="permission-note"><Radio size={17} /><p>An organization owner or administrator can add locations.</p></div>
          )}
        </aside>
      </div>
    </>
  );
}
