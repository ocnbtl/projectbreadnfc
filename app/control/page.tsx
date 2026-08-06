import { ControlDashboard, type CustomerSummary, type PlatformEvent, type PlatformTask, type PortfolioPulse } from "@/components/control/control-dashboard";
import { requirePlatformStaff } from "@/lib/control";
import { redirect } from "next/navigation";

const emptyPulse: PortfolioPulse = {
  organization_count: 0,
  customer_count: 0,
  account_attention_count: 0,
  monthly_recurring_revenue_cents: 0,
  location_count: 0,
  device_attention_count: 0,
  integration_error_count: 0,
  needs_reply_count: 0,
};

export default async function ControlPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string; customer_page?: string; task_page?: string; q?: string }>;
}) {
  const { admin, staff, user } = await requirePlatformStaff();
  const params = await searchParams;
  const customerPage = Math.max(1, Number.parseInt(params.customer_page ?? "1", 10) || 1);
  const taskPage = Math.max(1, Number.parseInt(params.task_page ?? "1", 10) || 1);
  const search = params.q?.trim().slice(0, 80) ?? "";
  const customerPageSize = 20;
  const taskPageSize = 8;
  let customerQuery = admin.from("platform_customer_summaries").select("*", { count: "exact" });
  if (search) customerQuery = customerQuery.ilike("name", `%${search.replaceAll("%", "")}%`);
  customerQuery = customerQuery.order("created_at", { ascending: false }).range((customerPage - 1) * customerPageSize, customerPage * customerPageSize - 1);
  const taskQuery = admin.from("platform_tasks")
    .select("id, organization_id, title, detail, priority, status, assigned_to, due_at, created_at", { count: "exact" })
    .not("status", "in", "(completed,dismissed)")
    .order("priority")
    .order("due_at", { ascending: true, nullsFirst: false })
    .range((taskPage - 1) * taskPageSize, taskPage * taskPageSize - 1);
  const [pulseResult, customerResult, taskResult, eventResult, staffResult, authUsersResult] = await Promise.all([
    admin.from("platform_portfolio_pulse").select("*").single(),
    customerQuery,
    taskQuery,
    admin.from("platform_events").select("id, action, entity_type, organization_id, created_at").order("created_at", { ascending: false }).limit(12),
    admin.from("platform_staff").select("user_id, role, display_name, active, last_seen_at").order("created_at"),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  if (pulseResult.error || customerResult.error || taskResult.error || eventResult.error || staffResult.error || authUsersResult.error) {
    throw new Error("The Scantap control center could not load its operational data.");
  }
  const customerTotal = customerResult.count ?? 0;
  const taskTotal = taskResult.count ?? 0;
  const customerPages = Math.max(1, Math.ceil(customerTotal / customerPageSize));
  const taskPages = Math.max(1, Math.ceil(taskTotal / taskPageSize));
  const baseParams = new URLSearchParams();
  if (search) baseParams.set("q", search);
  if (taskPage > 1) baseParams.set("task_page", String(taskPage));
  if (customerTotal > 0 && (customerResult.data ?? []).length === 0 && customerPage > customerPages) {
    baseParams.set("customer_page", String(customerPages));
    redirect(`/control?${baseParams.toString()}`);
  }
  if (customerPage > 1) baseParams.set("customer_page", String(customerPage));
  if (taskTotal > 0 && (taskResult.data ?? []).length === 0 && taskPage > taskPages) {
    baseParams.set("task_page", String(taskPages));
    redirect(`/control?${baseParams.toString()}`);
  }
  const emailByUserId = new Map(authUsersResult.data.users.map((authUser) => [authUser.id, authUser.email ?? null]));

  const message = params.error
    ? { kind: "error" as const, text: params.error }
    : params.notice
      ? { kind: "notice" as const, text: params.notice }
      : undefined;

  return (
    <ControlDashboard
      customers={(customerResult.data ?? []) as CustomerSummary[]}
      customerPage={customerPage}
      customerTotal={customerTotal}
      events={(eventResult.data ?? []) as PlatformEvent[]}
      message={message}
      pulse={(pulseResult.data ?? emptyPulse) as PortfolioPulse}
      role={staff.role}
      search={search}
      staffMembers={(staffResult.data ?? []).map((member) => ({ ...member, email: emailByUserId.get(member.user_id) ?? null }))}
      taskPage={taskPage}
      taskTotal={taskTotal}
      tasks={(taskResult.data ?? []) as PlatformTask[]}
      userId={user.id}
    />
  );
}
