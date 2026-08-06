import { ChevronLeft, ChevronRight, ExternalLink, Inbox, MessageSquareText, Search, Send, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { canReply, roleLabel, type AppRole } from "@/lib/app-types";
import { requireWorkspace } from "@/lib/workspace";
import { approveReplyAction, publishReplyAction, saveReplyDraftAction } from "../actions";
import { MessageBanner, ProductEmptyState, ProductPageHeader, RatingStars } from "@/components/product/product-ui";

type ReviewRow = {
  id: string;
  location_id: string;
  provider: string;
  author_name: string;
  rating: number;
  body: string | null;
  provider_url: string | null;
  status: "needs_reply" | "replied" | "archived";
  review_created_at: string;
  locations: { name: string } | { name: string }[] | null;
};

type LocationAssignment = { location_id: string; role: AppRole };
type DraftRow = { id: string; body: string; state: string; created_at: string };

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string; review?: string; page?: string; q?: string; status?: string; location?: string; source?: string }>;
}) {
  const context = await requireWorkspace();
  const params = await searchParams;
  const pageSize = 50;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const search = params.q?.trim().slice(0, 80) ?? "";
  const status = params.status === "needs_reply" || params.status === "replied" ? params.status : "";
  const location = context.locations.some((item) => item.id === params.location) ? params.location ?? "" : "";
  const source = /^[a-z0-9_]{2,64}$/.test(params.source ?? "") ? params.source ?? "" : "";
  let reviewQuery = context.supabase
    .from("reviews")
    .select("id, location_id, provider, author_name, rating, body, provider_url, status, review_created_at, locations(name)", { count: "exact" })
    .eq("organization_id", context.organization.id)
    .neq("status", "archived")
    .order("review_created_at", { ascending: false });
  if (search) reviewQuery = reviewQuery.ilike("author_name", `%${search}%`);
  if (status) reviewQuery = reviewQuery.eq("status", status);
  if (location) reviewQuery = reviewQuery.eq("location_id", location);
  if (source) reviewQuery = reviewQuery.eq("provider", source);

  const [{ data, error, count }, needsReplyResult, sourceResult] = await Promise.all([
    reviewQuery.range((page - 1) * pageSize, page * pageSize - 1),
    context.supabase.from("reviews").select("id", { count: "exact", head: true }).eq("organization_id", context.organization.id).eq("status", "needs_reply"),
    context.supabase.from("integrations").select("provider, display_name").eq("organization_id", context.organization.id).order("display_name"),
  ]);
  if (error) throw new Error(error.message);
  const reviews = (data ?? []) as unknown as ReviewRow[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const totalNeedsReply = needsReplyResult.count ?? 0;
  const hasFilters = Boolean(search || status || location || source);
  const providers = Array.from(new Map((sourceResult.data ?? []).map((item) => [item.provider, item.display_name])).entries());
  const pageHref = (nextPage: number) => {
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (status) query.set("status", status);
    if (location) query.set("location", location);
    if (source) query.set("source", source);
    query.set("page", String(nextPage));
    return `/app/reviews?${query.toString()}`;
  };
  if (total > 0 && reviews.length === 0 && page > totalPages) redirect(pageHref(totalPages));
  const selected = reviews.find((review) => review.id === params.review) ?? reviews[0];
  const { data: assignmentData } = context.membership.accessScope === "assigned_locations"
    ? await context.supabase.from("location_memberships").select("location_id, role").eq("user_id", context.user.id)
    : { data: [] };
  const assignments = (assignmentData ?? []) as LocationAssignment[];
  const effectiveRole = selected && context.membership.accessScope === "assigned_locations"
    ? assignments.find((assignment) => assignment.location_id === selected.location_id)?.role ?? context.membership.role
    : context.membership.role;
  const canDraftReply = canReply(effectiveRole);
  const [organizationPolicyResult, locationPolicyResult, draftResult] = selected
    ? await Promise.all([
        context.supabase.from("organization_policies").select("reply_approval_required").eq("organization_id", context.organization.id).single(),
        context.supabase.from("location_policies").select("inherits_organization, reply_approval_required").eq("location_id", selected.location_id).maybeSingle(),
        context.supabase.from("reply_drafts").select("id, body, state, created_at").eq("review_id", selected.id).order("created_at", { ascending: false }).limit(4),
      ])
    : [{ data: null }, { data: null }, { data: [] }];
  const organizationPolicy = organizationPolicyResult.data;
  const locationPolicy = locationPolicyResult.data;
  const approvalRequired = locationPolicy?.inherits_organization === false && locationPolicy.reply_approval_required !== null
    ? locationPolicy.reply_approval_required
    : organizationPolicy?.reply_approval_required ?? true;
  const needsApproval = approvalRequired && effectiveRole === "responder";
  const canApprove = ["owner", "admin", "manager"].includes(effectiveRole);
  const drafts = (draftResult.data ?? []) as DraftRow[];

  return (
    <>
      <ProductPageHeader
        context={context.organization.name}
        description="Review content stays attached to its source and location. Drafts never become published replies without a provider confirmation."
        title="Review inbox"
      />
      <MessageBanner error={params.error} notice={params.notice} />

      <form className="review-filter-bar" method="get">
        <label><span className="sr-only">Search reviewer</span><Search size={15} /><input defaultValue={search} name="q" placeholder="Search reviewer" /></label>
        <select aria-label="Reply status" defaultValue={status} name="status"><option value="">All statuses</option><option value="needs_reply">Needs reply</option><option value="replied">Replied</option></select>
        <select aria-label="Location" defaultValue={location} name="location"><option value="">All locations</option>{context.locations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <select aria-label="Source" defaultValue={source} name="source"><option value="">All sources</option>{providers.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <button className="product-button secondary compact" type="submit">Filter</button>
        {(search || status || location || source) ? <Link href="/app/reviews">Clear</Link> : null}
      </form>

      {reviews.length === 0 && total === 0 ? (
        <ProductEmptyState
          action={hasFilters ? <Link className="product-button secondary" href="/app/reviews">Clear filters</Link> : <Link className="product-button primary" href="/app/integrations">Open integrations</Link>}
          description={hasFilters ? "Try a different reviewer, status, location, or source." : "Connect Google Business Profile after API approval, or add a link-only review source to keep every destination close."}
          icon={Inbox}
          title={hasFilters ? "No reviews match these filters" : "No reviews have synced yet"}
        />
      ) : (
        <div className="review-workbench-live">
          <aside className="review-queue-live">
            <div className="review-queue-heading"><strong>{total} reviews</strong><span>{totalNeedsReply} need a reply</span></div>
            <div>
              {reviews.map((review) => {
                const location = Array.isArray(review.locations) ? review.locations[0] : review.locations;
                return (
                  <Link aria-current={selected.id === review.id ? "true" : undefined} href={`/app/reviews?review=${review.id}`} key={review.id}>
                    <div><strong>{review.author_name}</strong><RatingStars rating={review.rating} /></div>
                    <p>{review.body || "Rating only"}</p>
                    <small>{location?.name || "Location"} · {new Date(review.review_created_at).toLocaleDateString()}</small>
                  </Link>
                );
              })}
            </div>
          </aside>

          <section className="review-detail-live">
            <header>
              <div><span className="product-source">{selected.provider.replaceAll("_", " ")}</span><h2>{selected.author_name}</h2><RatingStars rating={selected.rating} /></div>
              <span className={`product-status ${selected.status}`}>{selected.status === "needs_reply" ? "Needs reply" : "Replied"}</span>
            </header>
            <blockquote>{selected.body || "This customer left a rating without written feedback."}</blockquote>
            <div className="review-provenance"><ShieldCheck size={16} /><span>Source record · {new Date(selected.review_created_at).toLocaleString()}</span>{selected.provider_url ? <a href={selected.provider_url} rel="noreferrer" target="_blank">Open at source <ExternalLink size={14} /></a> : null}</div>
            <div className="reply-composer-live">
              <div><MessageSquareText size={18} /><div><strong>Reply draft</strong><span>{roleLabel(effectiveRole)} access at this location</span></div></div>
              {canDraftReply ? (
                <form action={saveReplyDraftAction}>
                  <input name="review_id" type="hidden" value={selected.id} />
                  <label className="sr-only" htmlFor="reply-body">Reply</label>
                  <textarea defaultValue={`Hi ${selected.author_name.split(" ")[0]}, thank you for taking the time to share this.`} id="reply-body" maxLength={4000} name="body" rows={6} />
                  <div>
                    <p>{selected.provider === "google_business_profile" ? needsApproval ? "This reply goes to a manager before it can be published." : "Scantap shows success only after Google confirms the reply." : "Save the draft, then open the source to publish it there."}</p>
                    <span className="reply-actions">
                      <button className="product-button secondary" type="submit"><MessageSquareText size={15} /> Save draft</button>
                      {selected.provider === "google_business_profile" ? <button className="product-button primary" formAction={publishReplyAction} type="submit"><Send size={15} /> {needsApproval ? "Submit for approval" : "Publish to Google"}</button> : null}
                    </span>
                  </div>
                </form>
              ) : (
                <div className="permission-note"><ShieldCheck size={17} /><p>Your current role can read this review but cannot prepare a reply.</p></div>
              )}
              {drafts.length ? <div className="draft-history"><strong>Recent drafts</strong>{drafts.map((draft) => <div key={draft.id}><span className={`product-status ${draft.state}`}>{draft.state.replaceAll("_", " ")}</span><p>{draft.body}</p><small>{new Date(draft.created_at).toLocaleString()}</small>{canApprove && draft.state === "pending_approval" ? <form action={approveReplyAction}><input name="draft_id" type="hidden" value={draft.id} /><button className="product-button primary compact" type="submit">Approve and publish</button></form> : null}</div>)}</div> : null}
            </div>
          </section>
        </div>
      )}
      {total > pageSize ? <nav aria-label="Review pages" className="review-pagination">
        <span>Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} of {total}</span>
        <div>{page > 1 ? <Link href={pageHref(page - 1)}><ChevronLeft size={15} /> Previous</Link> : <span aria-disabled="true"><ChevronLeft size={15} /> Previous</span>}<strong>Page {page} of {totalPages}</strong>{page < totalPages ? <Link href={pageHref(page + 1)}>Next <ChevronRight size={15} /></Link> : <span aria-disabled="true">Next <ChevronRight size={15} /></span>}</div>
      </nav> : null}
    </>
  );
}
