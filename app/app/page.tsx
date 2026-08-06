import { ArrowRight, Link2, MapPin, MessageSquareText, ShieldCheck, SmartphoneNfc } from "lucide-react";
import Link from "next/link";
import { MessageBanner, ProductEmptyState, ProductPageHeader } from "@/components/product/product-ui";
import { requireWorkspace } from "@/lib/workspace";

type ReviewSummary = {
  id: string;
  author_name: string;
  rating: number;
  status: "needs_reply" | "replied" | "archived";
  review_created_at: string;
  locations: { name: string } | { name: string }[] | null;
};

export default async function WorkspaceOverview({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const context = await requireWorkspace();
  const params = await searchParams;
  const [reviewsResult, needsReplyResult, integrationsResult, devicesResult] = await Promise.all([
    context.supabase
      .from("reviews")
      .select("id, author_name, rating, status, review_created_at, locations(name)")
      .eq("organization_id", context.organization.id)
      .neq("status", "archived")
      .order("review_created_at", { ascending: false })
      .limit(8),
    context.supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", context.organization.id)
      .eq("status", "needs_reply"),
    context.supabase
      .from("integrations")
      .select("id, status, mode")
      .eq("organization_id", context.organization.id),
    context.supabase
      .from("devices")
      .select("id, status")
      .eq("organization_id", context.organization.id),
  ]);

  const reviews = (reviewsResult.data ?? []) as unknown as ReviewSummary[];
  const needsReply = needsReplyResult.count ?? 0;
  const activeIntegrations = (integrationsResult.data ?? []).filter((item) => item.status === "connected").length;
  const deviceAttention = (devicesResult.data ?? []).filter((item) => item.status !== "active").length;

  return (
    <>
      <ProductPageHeader
        context={context.organization.name}
        description="Start with the work that changed since your last check-in."
        title="What needs attention"
        actions={<Link className="product-button secondary" href="/app/reviews">Open review inbox <ArrowRight size={15} /></Link>}
      />
      <MessageBanner error={params.error} notice={params.notice} />

      <section aria-label="Workspace summary" className="signal-summary">
        <div><span>Visible locations</span><strong>{context.locations.length}</strong><small>within your current scope</small></div>
        <div className={needsReply ? "attention" : ""}><span>Needs a reply</span><strong>{needsReply}</strong><small>{needsReply ? "ready for your team" : "queue is clear"}</small></div>
        <div><span>Connected sources</span><strong>{activeIntegrations}</strong><small>native and link-only</small></div>
        <div><span>Device attention</span><strong>{deviceAttention}</strong><small>offline or flagged</small></div>
      </section>

      <div className="overview-workbench">
        <section className="attention-ledger">
          <div className="section-heading"><div><h2>Attention ledger</h2><p>The shortest path through today’s review work.</p></div><Link href="/app/reviews">View all</Link></div>
          {reviews.length === 0 ? (
            <ProductEmptyState
              action={<Link className="product-button primary" href="/app/integrations">Connect a source</Link>}
              description="Connect Google Business Profile when your API access is approved, or add a link-only source now."
              icon={MessageSquareText}
              title="Your review queue is ready"
            />
          ) : (
            <div className="attention-list">
              {reviews.map((review) => {
                const location = Array.isArray(review.locations) ? review.locations[0] : review.locations;
                return (
                  <Link href={`/app/reviews?review=${review.id}`} key={review.id}>
                    <span className={`attention-state ${review.status}`} />
                    <div><strong>{review.author_name}</strong><small>{location?.name ?? "Location"} · {new Date(review.review_created_at).toLocaleDateString()}</small></div>
                    <span>{review.rating}.0</span>
                    <small>{review.status === "needs_reply" ? "Needs reply" : "Replied"}</small>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <aside className="control-plane">
          <div className="section-heading"><div><h2>Workspace structure</h2><p>Your current operating structure.</p></div></div>
          <Link href="/app/locations"><MapPin size={18} /><div><strong>{context.locations.length} locations</strong><small>Manage rules and review destinations</small></div><ArrowRight size={15} /></Link>
          <Link href="/app/integrations"><Link2 size={18} /><div><strong>{activeIntegrations} connected sources</strong><small>Google-first, capability labeled</small></div><ArrowRight size={15} /></Link>
          <Link href="/app/team"><ShieldCheck size={18} /><div><strong>{context.membership.role} access</strong><small>{context.membership.accessScope === "organization" ? "Organization-wide" : "Assigned locations only"}</small></div><ArrowRight size={15} /></Link>
          <Link href="/app/devices"><SmartphoneNfc size={18} /><div><strong>{devicesResult.data?.length ?? 0} devices</strong><small>{deviceAttention ? `${deviceAttention} need attention` : "All devices reporting normally"}</small></div><ArrowRight size={15} /></Link>
          <div className="control-note"><SmartphoneNfc size={18} /><p><strong>Physical and digital stay distinct.</strong> Device interactions never count as published reviews.</p></div>
        </aside>
      </div>
    </>
  );
}
