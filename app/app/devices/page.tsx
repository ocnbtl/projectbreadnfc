import { Clock3, MapPin, Nfc, Plus, Radio, Settings2 } from "lucide-react";
import { canManageOrganization } from "@/lib/app-types";
import { requireWorkspace } from "@/lib/workspace";
import { createDeviceAction, updateDeviceAction } from "../actions";
import { MessageBanner, ProductEmptyState, ProductPageHeader } from "@/components/product/product-ui";

type DeviceRow = {
  id: string;
  location_id: string;
  serial_number: string;
  name: string;
  product_type: "counter_stand" | "adhesive_plate" | "staff_card";
  status: "active" | "needs_attention" | "offline" | "retired";
  last_seen_at: string | null;
  locations: { name: string } | { name: string }[] | null;
};

const productLabels = {
  counter_stand: "Counter stand",
  adhesive_plate: "Adhesive plate",
  staff_card: "Staff card",
};

export default async function DevicesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const context = await requireWorkspace();
  const params = await searchParams;
  const canManage = canManageOrganization(context.membership.role);
  const { data, error } = await context.supabase
    .from("devices")
    .select("id, location_id, serial_number, name, product_type, status, last_seen_at, locations(name)")
    .eq("organization_id", context.organization.id)
    .order("name");
  if (error) throw new Error(error.message);
  const devices = (data ?? []) as unknown as DeviceRow[];

  return (
    <>
      <ProductPageHeader
        context={context.organization.name}
        description="Register each Scantap product, assign it to a location, and act on devices that stop reporting normally."
        title="Devices"
      />
      <MessageBanner error={params.error} notice={params.notice} />

      <div className="devices-workspace">
        <section className="device-register">
          <div className="section-heading"><div><h2>Device register</h2><p>{devices.length} visible across your current location scope</p></div></div>
          {devices.length ? <div className="device-records">{devices.map((device) => {
            const location = Array.isArray(device.locations) ? device.locations[0] : device.locations;
            return <article key={device.id}>
              <div className="device-record-head"><span><Nfc size={18} /></span><div><h2>{device.name}</h2><small>{productLabels[device.product_type]} · {device.serial_number}</small></div><em className={`product-status ${device.status}`}>{device.status.replaceAll("_", " ")}</em></div>
              <dl><div><dt><MapPin size={14} /> Location</dt><dd>{location?.name ?? "Not assigned"}</dd></div><div><dt><Clock3 size={14} /> Last seen</dt><dd>{device.last_seen_at ? new Date(device.last_seen_at).toLocaleString() : "No activity yet"}</dd></div></dl>
              {canManage ? <details className="device-edit"><summary><Settings2 size={15} /> Manage device</summary><form action={updateDeviceAction} className="product-form device-edit-form">
                <input name="device_id" type="hidden" value={device.id} />
                <label>Name<input defaultValue={device.name} name="name" required /></label>
                <label>Location<select defaultValue={device.location_id} name="location_id">{context.locations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                <label>Status<select defaultValue={device.status} name="status"><option value="active">Active</option><option value="needs_attention">Needs attention</option><option value="offline">Offline</option><option value="retired">Retired</option></select></label>
                <button className="product-button secondary" type="submit">Save device</button>
              </form></details> : null}
            </article>;
          })}</div> : <ProductEmptyState description="Register the first counter stand, adhesive plate, or staff card after assigning its serial number." icon={Radio} title="No devices registered" />}
        </section>

        <aside className="device-create-panel">
          <div className="panel-icon"><Plus size={19} /></div><h2>Register a device</h2><p>Serial numbers keep physical products separate from published review records.</p>
          {canManage ? <form action={createDeviceAction} className="product-form">
            <label htmlFor="device-name">Device name</label><input id="device-name" name="name" placeholder="Front counter stand" required />
            <label htmlFor="device-serial">Serial number</label><input id="device-serial" name="serial_number" placeholder="SCN-000001" required />
            <label htmlFor="device-product">Product</label><select id="device-product" name="product_type"><option value="counter_stand">Counter stand</option><option value="adhesive_plate">Adhesive plate</option><option value="staff_card">Staff card</option></select>
            <label htmlFor="device-location">Location</label><select id="device-location" name="location_id">{context.locations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
            <button className="product-button primary" type="submit"><Nfc size={15} /> Register device</button>
          </form> : <p className="permission-note">Only owners and administrators can register or move devices.</p>}
        </aside>
      </div>
    </>
  );
}
