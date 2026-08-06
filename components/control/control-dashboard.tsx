import {
  AlertTriangle, ArrowRight, Building2, Check, Clock3, Film, MapPin,
  MessageSquareText, Plus, Radio, RefreshCw, Search, ShieldCheck, Users,
} from "lucide-react";
import Link from "next/link";
import {
  createPlatformTaskAction, setPlatformStaffAction, updateCustomerAccountAction,
  updatePlatformTaskAction,
} from "@/app/control/actions";
import { canOperatePlatform, type PlatformRole } from "@/lib/control";

export type PortfolioPulse = {
  organization_count: number; customer_count: number; account_attention_count: number;
  monthly_recurring_revenue_cents: number; location_count: number;
  device_attention_count: number; integration_error_count: number; needs_reply_count: number;
};
export type CustomerSummary = {
  organization_id: string; name: string; slug: string; created_at: string;
  lifecycle: "lead" | "pilot" | "active" | "paused" | "churned";
  health: "healthy" | "watch" | "at_risk" | "unknown"; plan_name: string | null;
  monthly_recurring_revenue_cents: number; location_count: number; device_count: number;
  device_attention_count: number; connected_integration_count: number;
  integration_error_count: number; needs_reply_count: number; member_count: number;
};
export type PlatformTask = {
  id: number; organization_id: string | null; title: string; detail: string | null;
  priority: "urgent" | "high" | "normal" | "low";
  status: "open" | "in_progress" | "blocked" | "completed" | "dismissed";
  assigned_to: string | null; due_at: string | null; created_at: string;
};
export type PlatformEvent = {
  id: number; action: string; entity_type: string; organization_id: string | null; created_at: string;
};
export type PlatformStaffMember = {
  user_id: string; role: PlatformRole; display_name: string | null; email: string | null;
  active: boolean; last_seen_at: string | null;
};

function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
}
function shortDate(value: string | null) {
  if (!value) return "No due date";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value));
}
function statusLabel(value: string) { return value.replaceAll("_", " "); }

export function ControlDashboard({
  pulse, customers, tasks, events, role, message, customerPage, customerTotal,
  taskPage, taskTotal, search, staffMembers, userId,
}: {
  pulse: PortfolioPulse; customers: CustomerSummary[]; tasks: PlatformTask[];
  events: PlatformEvent[]; role: PlatformRole; message?: { kind: "error" | "notice"; text: string };
  customerPage: number; customerTotal: number; taskPage: number; taskTotal: number;
  search: string; staffMembers: PlatformStaffMember[]; userId: string;
}) {
  const canOperate = canOperatePlatform(role);
  const organizationNames = new Map(customers.map((customer) => [customer.organization_id, customer.name]));
  const systemAttention = pulse.device_attention_count + pulse.integration_error_count;
  const activeStaff = staffMembers.filter((member) => member.active);
  const customerPages = Math.max(1, Math.ceil(customerTotal / 20));
  const taskPages = Math.max(1, Math.ceil(taskTotal / 8));
  const controlHref = (updates: { customerPage?: number; taskPage?: number; search?: string }) => {
    const query = new URLSearchParams();
    const nextSearch = updates.search ?? search;
    const nextCustomerPage = updates.customerPage ?? customerPage;
    const nextTaskPage = updates.taskPage ?? taskPage;
    if (nextSearch) query.set("q", nextSearch);
    if (nextCustomerPage > 1) query.set("customer_page", String(nextCustomerPage));
    if (nextTaskPage > 1) query.set("task_page", String(nextTaskPage));
    return query.size ? `/control?${query.toString()}` : "/control";
  };

  return <>
    <header className="control-page-heading" id="pulse"><div><span>Owner view</span><h1>Run Scantap from one clear operating view.</h1></div><p>Customer health, platform exceptions, and the work behind the business—kept separate from customer workspaces.</p></header>
    {message ? <div className={`control-message ${message.kind}`} role="status">{message.text}</div> : null}

    <section aria-label="Business pulse" className="control-pulse">
      <article><span>Active monthly revenue</span><strong>{money(pulse.monthly_recurring_revenue_cents)}</strong><small>Active customer accounts only</small></article>
      <article><span>Pilot + active customers</span><strong>{pulse.customer_count}</strong><small>{pulse.organization_count} organizations total</small></article>
      <article className={pulse.account_attention_count ? "needs-attention" : ""}><span>Accounts to check</span><strong>{pulse.account_attention_count}</strong><small>Watch or at-risk health</small></article>
      <article className={pulse.needs_reply_count ? "needs-attention" : ""}><span>Customer reply backlog</span><strong>{pulse.needs_reply_count}</strong><small>Across managed organizations</small></article>
    </section>

    <div className="control-command-grid">
      <section className="control-panel control-work-queue">
        <div className="control-panel-heading"><div><span>Today</span><h2>Operating queue</h2></div><strong>{taskTotal} open</strong></div>
        {tasks.length ? <div className="control-task-list">{tasks.map((task) => {
          const assignee = staffMembers.find((member) => member.user_id === task.assigned_to);
          const canUpdate = canOperate || (role === "support" && task.assigned_to === userId);
          return <article key={task.id}>
            <span className={`control-priority ${task.priority}`}>{task.priority}</span>
            <div><strong>{task.title}</strong><small>{task.organization_id ? organizationNames.get(task.organization_id) ?? "Customer account" : "Scantap operations"} · {shortDate(task.due_at)} · {assignee?.display_name || assignee?.email || "Unassigned"}</small>{task.detail ? <p>{task.detail}</p> : null}</div>
            {canUpdate ? <form action={updatePlatformTaskAction}><input name="task_id" type="hidden" value={task.id} /><input name="status" type="hidden" value="completed" /><button aria-label={`Complete ${task.title}`} title="Mark complete" type="submit"><Check size={16} /></button></form> : <span className="control-read-state">{statusLabel(task.status)}</span>}
          </article>;
        })}</div> : <div className="control-empty"><Check size={22} /><div><strong>The operating queue is clear.</strong><p>Add the next customer or platform follow-up when it appears.</p></div></div>}
        {taskPages > 1 ? <nav aria-label="Operating queue pages" className="control-pager"><span>Page {taskPage} of {taskPages}</span><div>{taskPage > 1 ? <Link href={controlHref({ taskPage: taskPage - 1 })}>Previous</Link> : <span>Previous</span>}{taskPage < taskPages ? <Link href={controlHref({ taskPage: taskPage + 1 })}>Next</Link> : <span>Next</span>}</div></nav> : null}
        {canOperate ? <details className="control-add-task"><summary><Plus size={16} /> Add operating task</summary><form action={createPlatformTaskAction}>
          <label>Task<input maxLength={180} name="title" placeholder="Follow up with a pilot account" required /></label>
          <label>Customer<select defaultValue="" name="organization_id"><option value="">Scantap operations</option>{customers.map((customer) => <option key={customer.organization_id} value={customer.organization_id}>{customer.name}</option>)}</select></label>
          <div><label>Priority<select defaultValue="normal" name="priority"><option value="urgent">Urgent</option><option value="high">High</option><option value="normal">Normal</option><option value="low">Low</option></select></label><label>Due date<input name="due_at" type="date" /></label></div>
          <label>Assign to<select defaultValue="" name="assigned_to"><option value="">Unassigned</option>{activeStaff.map((member) => <option key={member.user_id} value={member.user_id}>{member.display_name || member.email || member.user_id.slice(0, 8)} · {statusLabel(member.role)}</option>)}</select></label>
          <label>Notes<textarea maxLength={4000} name="detail" placeholder="Optional context for the team" rows={3} /></label><button type="submit">Add to queue <ArrowRight size={15} /></button>
        </form></details> : null}
      </section>

      <aside className="control-panel control-system-card"><div className="control-panel-heading"><div><span>Platform</span><h2>System posture</h2></div><span className={systemAttention ? "system-watch" : "system-good"}>{systemAttention ? "Check" : "Clear"}</span></div><div className="control-system-list">
        <div><Radio size={17} /><span><strong>{pulse.device_attention_count}</strong> device exceptions</span></div><div><RefreshCw size={17} /><span><strong>{pulse.integration_error_count}</strong> integration errors</span></div><div><MapPin size={17} /><span><strong>{pulse.location_count}</strong> customer locations</span></div><div><MessageSquareText size={17} /><span><strong>{pulse.needs_reply_count}</strong> replies waiting</span></div>
      </div><p className="control-system-note"><ShieldCheck size={16} /> Provider errors and customer review queues stay visible here without exposing one customer’s data to another.</p></aside>
    </div>

    <section className="control-accounts" id="accounts"><div className="control-section-heading"><div><span>Portfolio</span><h2>Customer accounts</h2></div><p>Commercial status and operating health live beside usage signals, not inside the customer’s dashboard.</p></div>
      <form className="control-account-search" method="get"><label><Search size={15} /><span className="sr-only">Search customer accounts</span><input defaultValue={search} name="q" placeholder="Search customer accounts" /></label><button type="submit">Search</button>{search ? <Link href={controlHref({ search: "", customerPage: 1 })}>Clear</Link> : null}</form>
      {customers.length ? <div className="control-account-list">{customers.map((customer) => <article key={customer.organization_id}>
        <div className="control-account-primary"><span className={`health-dot ${customer.health}`} /><div><strong>{customer.name}</strong><small>{statusLabel(customer.lifecycle)} · {customer.plan_name || "Plan not set"}</small></div></div>
        <div className="control-account-signals"><span><MapPin size={14} />{customer.location_count}</span><span><Users size={14} />{customer.member_count}</span><span><Radio size={14} />{customer.device_count}</span><span className={customer.needs_reply_count ? "signal-alert" : ""}><MessageSquareText size={14} />{customer.needs_reply_count}</span></div>
        <div className="control-account-money"><strong>{money(customer.monthly_recurring_revenue_cents)}</strong><small>monthly</small></div>
        {canOperate ? <details className="control-account-editor"><summary>Manage</summary><form action={updateCustomerAccountAction}><input name="organization_id" type="hidden" value={customer.organization_id} /><label>Status<select defaultValue={customer.lifecycle} name="lifecycle"><option value="lead">Lead</option><option value="pilot">Pilot</option><option value="active">Active</option><option value="paused">Paused</option><option value="churned">Churned</option></select></label><label>Health<select defaultValue={customer.health} name="health"><option value="unknown">Unknown</option><option value="healthy">Healthy</option><option value="watch">Watch</option><option value="at_risk">At risk</option></select></label><label>Plan<input defaultValue={customer.plan_name ?? ""} maxLength={80} name="plan_name" placeholder="Pilot" /></label><label>Monthly revenue<input defaultValue={(customer.monthly_recurring_revenue_cents / 100).toFixed(0)} min="0" name="monthly_recurring_revenue_dollars" step="1" type="number" /></label><button type="submit">Save account</button></form></details> : <span className="control-read-state">View only</span>}
      </article>)}</div> : <div className="control-empty wide"><Building2 size={24} /><div><strong>No customer organizations found.</strong><p>{search ? "Try a different customer name." : "The first organization created in the customer app will appear here automatically."}</p></div></div>}
      {customerPages > 1 ? <nav aria-label="Customer account pages" className="control-pager"><span>Showing {Math.min((customerPage - 1) * 20 + 1, customerTotal)}–{Math.min(customerPage * 20, customerTotal)} of {customerTotal}</span><div>{customerPage > 1 ? <Link href={controlHref({ customerPage: customerPage - 1 })}>Previous</Link> : <span>Previous</span>}{customerPage < customerPages ? <Link href={controlHref({ customerPage: customerPage + 1 })}>Next</Link> : <span>Next</span>}</div></nav> : null}
    </section>

    <section className="control-staff-panel" id="staff"><div className="control-section-heading"><div><span>Permissions</span><h2>Scantap staff</h2></div><p>Platform roles stay independent from customer roles. Support can complete assigned work; read-only staff cannot mutate records.</p></div><div className="control-staff-grid">
      <div className="control-staff-list">{staffMembers.map((member) => <article key={member.user_id}><span className={`health-dot ${member.active ? "healthy" : ""}`} /><div><strong>{member.display_name || member.email || "Scantap staff"}</strong><small>{member.email || member.user_id} · {statusLabel(member.role)}</small></div><em>{member.active ? "Active" : "Inactive"}</em></article>)}</div>
      {role === "owner" ? <form action={setPlatformStaffAction} className="control-staff-form"><h3>Add or update staff</h3><p>The person must create a Scantap login before platform access can be granted.</p><label>Email<input name="email" required type="email" /></label><label>Display name<input maxLength={120} name="display_name" required /></label><div><label>Role<select defaultValue="support" name="role"><option value="owner">Owner</option><option value="operator">Operator</option><option value="support">Support</option><option value="read_only">Read only</option></select></label><label>Status<select defaultValue="true" name="active"><option value="true">Active</option><option value="false">Inactive</option></select></label></div><button type="submit">Save staff access</button></form> : null}
    </div></section>

    <div className="control-lower-grid"><section className="control-panel control-activity" id="activity"><div className="control-panel-heading"><div><span>Audit trail</span><h2>Recent platform activity</h2></div><Clock3 size={18} /></div>{events.length ? <ol>{events.map((event) => <li key={event.id}><span /><div><strong>{statusLabel(event.action)}</strong><small>{event.organization_id ? organizationNames.get(event.organization_id) ?? "Customer account" : "Scantap operations"} · {new Date(event.created_at).toLocaleString()}</small></div></li>)}</ol> : <div className="control-empty"><Clock3 size={21} /><div><strong>No platform changes recorded.</strong><p>Owner, operator, and assigned support actions will appear here.</p></div></div>}</section>
      <section className="control-panel control-walkthrough" id="walkthrough"><div className="control-panel-heading"><div><span>Training</span><h2>Product walkthrough</h2></div><Film size={18} /></div><div className="control-video-frame"><video controls playsInline poster="/demo/scantap-product-walkthrough-poster.png" preload="metadata"><source src="/demo/scantap-product-walkthrough.webm" type="video/webm" />Your browser does not support the product walkthrough video.</video></div><div className="control-walkthrough-copy"><p>A recorded tour of the public product demo: review pulse, response workflow, locations, and device health.</p><a href="/dashboard" target="_blank">Open interactive demo <ArrowRight size={15} /></a></div><details className="control-transcript"><summary>Walkthrough transcript</summary><ol><li>The overview opens with rating, review, response, and Google-link activity.</li><li>The review inbox opens and a sample Google reply is written and marked sent.</li><li>Device health opens and checks an offline Scantap device.</li><li>The location portfolio opens before returning to the overview.</li></ol></details></section>
    </div>
    <footer className="control-footnote"><AlertTriangle size={15} /><p>Commercial values are entered by Scantap operators. Review and device totals come from the connected customer data model.</p></footer>
  </>;
}
