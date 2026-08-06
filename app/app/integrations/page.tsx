import { ArrowUpRight, Check, CircleDashed, ExternalLink, Link2, PlugZap, ShieldCheck, Unplug } from "lucide-react";
import { canManageOrganization } from "@/lib/app-types";
import { isGoogleIntegrationConfigured } from "@/lib/supabase/config";
import { requireWorkspace } from "@/lib/workspace";
import {
  addLinkIntegrationAction,
  disconnectIntegrationAction,
  mapExternalLocationAction,
  syncGoogleIntegrationAction,
} from "../actions";
import { MessageBanner, ProductPageHeader } from "@/components/product/product-ui";
import { ConfirmActionForm } from "@/components/product/confirm-action-form";

type IntegrationRow = {
  id: string;
  provider: string;
  display_name: string;
  mode: "native" | "read_only" | "link_only";
  status: string;
  capabilities: string[];
  profile_url: string | null;
  reply_url: string | null;
  last_synced_at: string | null;
  last_error: string | null;
};
type ExternalLocationRow = {
  id: string;
  integration_id: string;
  location_id: string | null;
  display_name: string;
  provider_average_rating: number | null;
  provider_total_review_count: number | null;
};

const providerOptions = [
  ["facebook", "Facebook"], ["instagram", "Instagram"], ["linkedin", "LinkedIn"],
  ["trustpilot", "Trustpilot"], ["yelp", "Yelp"], ["tripadvisor", "TripAdvisor"],
  ["bbb", "Better Business Bureau"], ["other", "Another review source"],
];

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const context = await requireWorkspace();
  const params = await searchParams;
  const canManage = canManageOrganization(context.membership.role);
  const [{ data: integrationData, error }, { data: externalLocationData }] = await Promise.all([
    context.supabase.from("integrations").select("id, provider, display_name, mode, status, capabilities, profile_url, reply_url, last_synced_at, last_error").eq("organization_id", context.organization.id).order("created_at"),
    context.supabase.from("external_locations").select("id, integration_id, location_id, display_name, provider_average_rating, provider_total_review_count").eq("organization_id", context.organization.id).order("display_name"),
  ]);
  if (error) throw new Error(error.message);
  const integrations = (integrationData ?? []) as IntegrationRow[];
  const externalLocations = (externalLocationData ?? []) as ExternalLocationRow[];
  const googleReady = isGoogleIntegrationConfigured();

  return (
    <>
      <ProductPageHeader
        context={context.organization.name}
        description="Every source says exactly what Scantap can do: sync and reply, read only, or open the provider directly."
        title="Integrations"
      />
      <MessageBanner error={params.error} notice={params.notice} />

      <section className="google-integration-stage">
        <div className="google-integration-mark">G</div>
        <div><span>Primary integration</span><h2>Google Business Profile</h2><p>Sync reviews by location, prepare replies, and publish only after Google confirms the action.</p></div>
        <ul><li><Check size={15} /> Native review sync</li><li><Check size={15} /> Location mapping</li><li><Check size={15} /> Confirmed replies</li></ul>
        {canManage && googleReady ? <a className="product-button primary" href={`/api/integrations/google/connect?organization=${context.organization.id}`}><PlugZap size={15} /> Connect Google</a> : <span className="integration-setup-state"><CircleDashed size={16} /> {googleReady ? "Administrator access required" : "Connection unavailable"}</span>}
      </section>

      {!googleReady ? <div className="setup-checklist"><ShieldCheck size={18} /><div><strong>Google connection setup is not complete.</strong><p>{canManage ? "Finish the secure workspace and Google authorization setup before connecting an account." : "An organization administrator is preparing this connection."}</p></div></div> : null}

      <div className="integrations-workspace">
        <section className="integration-register">
          <div className="section-heading"><div><h2>Connected and saved sources</h2><p>Native connections and free link-only shortcuts share one honest register.</p></div></div>
          {integrations.length ? <div className="integration-records">{integrations.map((integration) => {
            const mapped = externalLocations.filter((location) => location.integration_id === integration.id);
            return <article key={integration.id}>
              <div className="integration-record-head"><span><Link2 size={18} /></span><div><h2>{integration.display_name}</h2><small>{integration.provider.replaceAll("_", " ")}</small></div><em className={`product-status ${integration.status}`}>{integration.status.replaceAll("_", " ")}</em></div>
              <div className="capability-row"><span>{integration.mode === "native" ? "Sync and manage" : integration.mode === "read_only" ? "Read only" : "Open at source"}</span>{integration.capabilities.map((capability) => <small key={capability}>{capability.replaceAll("_", " ")}</small>)}</div>
              {integration.last_error ? <p className="integration-error">The last sync needs attention. An administrator can retry it or reconnect this source.</p> : null}
              {mapped.length ? <div className="external-location-maps">{mapped.map((external) => <form action={mapExternalLocationAction} key={external.id}><input name="external_location_id" type="hidden" value={external.id} /><label>{external.display_name}{external.provider_average_rating !== null ? <span className="external-location-snapshot">Google reports {external.provider_average_rating.toFixed(1)} from {external.provider_total_review_count ?? 0} reviews</span> : null}<select defaultValue={external.location_id || ""} name="location_id"><option value="">Not mapped</option>{context.locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}</select></label><button className="product-button secondary compact" type="submit">Map</button></form>)}</div> : null}
              <footer>
                {integration.profile_url ? <a href={integration.profile_url} rel="noreferrer" target="_blank">Open profile <ExternalLink size={14} /></a> : <span>{integration.last_synced_at ? `Synced ${new Date(integration.last_synced_at).toLocaleString()}` : "Not synced yet"}</span>}
                <div className="integration-actions">
                  {canManage && integration.provider === "google_business_profile" && integration.status !== "disconnected" ? <form action={syncGoogleIntegrationAction}><input name="integration_id" type="hidden" value={integration.id} /><button type="submit">Sync now</button></form> : null}
                  {canManage ? <ConfirmActionForm action={disconnectIntegrationAction} confirmMessage={`Disconnect ${integration.display_name}? Synced content will no longer refresh.`}><input name="integration_id" type="hidden" value={integration.id} /><button className="text-danger" type="submit"><Unplug size={14} /> Disconnect</button></ConfirmActionForm> : null}
                </div>
              </footer>
            </article>;
          })}</div> : <div className="integration-empty"><PlugZap size={20} /><div><strong>No sources configured</strong><p>Start with a free profile shortcut while Google access is being prepared.</p></div></div>}
        </section>

        <aside className="link-integration-panel">
          <div className="panel-icon"><ArrowUpRight size={19} /></div><h2>Add a free source shortcut</h2><p>Keep the source and response destination inside Scantap without claiming API access the provider has not granted.</p>
          {canManage ? <form action={addLinkIntegrationAction} className="product-form">
            <label htmlFor="provider">Provider</label><select id="provider" name="provider">{providerOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
            <label htmlFor="display-name">Display name</label><input id="display-name" name="display_name" placeholder="Main Street Yelp" required />
            <label htmlFor="profile-url">Public profile URL</label><input id="profile-url" name="profile_url" placeholder="https://example.com/profile" required type="url" />
            <label htmlFor="reply-url">Response URL <small>optional</small></label><input id="reply-url" name="reply_url" placeholder="https://example.com/respond" type="url" />
            <button className="product-button primary" type="submit"><Link2 size={15} /> Add shortcut</button>
          </form> : <p className="permission-note">Only owners and administrators can add integrations.</p>}
        </aside>
      </div>
    </>
  );
}
