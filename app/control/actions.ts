"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { canOperatePlatform, requirePlatformStaff } from "@/lib/control";
import { signOutAction } from "@/app/app/actions";

export { signOutAction };

function withMessage(kind: "error" | "notice", message: string) {
  return `/control?${new URLSearchParams({ [kind]: message }).toString()}`;
}

function requireOperator(role: "owner" | "operator" | "support" | "read_only") {
  if (!canOperatePlatform(role)) {
    redirect(withMessage("error", "Owner or operator access is required for that change."));
  }
}

export async function createPlatformTaskAction(formData: FormData) {
  const context = await requirePlatformStaff();
  requireOperator(context.staff.role);

  const parsed = z.object({
    title: z.string().trim().min(2).max(180),
    detail: z.string().trim().max(4000).optional(),
    organization_id: z.union([z.literal(""), z.string().uuid()]).optional(),
    priority: z.enum(["urgent", "high", "normal", "low"]),
    due_at: z.union([z.literal(""), z.iso.date()]).optional(),
    assigned_to: z.union([z.literal(""), z.string().uuid()]).optional(),
  }).safeParse(Object.fromEntries(formData));

  if (!parsed.success) redirect(withMessage("error", "Check the task title and selections."));

  const dueAt = parsed.data.due_at
    ? new Date(`${parsed.data.due_at}T17:00:00`).toISOString()
    : null;
  const { error } = await context.supabase.rpc("create_platform_task", {
    task_title: parsed.data.title,
    task_detail: parsed.data.detail || null,
    task_organization_id: parsed.data.organization_id || null,
    task_priority: parsed.data.priority,
    task_due_at: dueAt,
    task_assigned_to: parsed.data.assigned_to || null,
  });

  if (error) redirect(withMessage("error", "The task could not be created."));

  revalidatePath("/control");
  redirect(withMessage("notice", "Task added to the operating queue."));
}

export async function updatePlatformTaskAction(formData: FormData) {
  const context = await requirePlatformStaff();
  const parsed = z.object({
    task_id: z.coerce.number().int().positive(),
    status: z.enum(["open", "in_progress", "blocked", "completed", "dismissed"]),
  }).safeParse(Object.fromEntries(formData));

  if (!parsed.success) redirect(withMessage("error", "That task update was not valid."));

  const { error } = await context.supabase.rpc("update_platform_task_status", {
    target_task_id: parsed.data.task_id,
    next_status: parsed.data.status,
  });

  if (error) redirect(withMessage("error", "The task could not be updated."));

  revalidatePath("/control");
  redirect(withMessage("notice", "Task status updated."));
}

export async function updateCustomerAccountAction(formData: FormData) {
  const context = await requirePlatformStaff();
  requireOperator(context.staff.role);
  const parsed = z.object({
    organization_id: z.string().uuid(),
    lifecycle: z.enum(["lead", "pilot", "active", "paused", "churned"]),
    health: z.enum(["healthy", "watch", "at_risk", "unknown"]),
    plan_name: z.string().trim().max(80).optional(),
    monthly_recurring_revenue_dollars: z.coerce.number().min(0).max(1000000),
  }).safeParse(Object.fromEntries(formData));

  if (!parsed.success) redirect(withMessage("error", "Check the customer account values."));

  const { error } = await context.supabase.rpc("update_customer_account", {
    target_organization_id: parsed.data.organization_id,
    next_lifecycle: parsed.data.lifecycle,
    next_health: parsed.data.health,
    next_plan_name: parsed.data.plan_name || "",
    next_monthly_recurring_revenue_cents: Math.round(parsed.data.monthly_recurring_revenue_dollars * 100),
  });

  if (error) redirect(withMessage("error", "The customer account could not be updated."));

  revalidatePath("/control");
  redirect(withMessage("notice", "Customer account updated."));
}

export async function setPlatformStaffAction(formData: FormData) {
  const context = await requirePlatformStaff();
  if (context.staff.role !== "owner") {
    redirect(withMessage("error", "Owner access is required to manage Scantap staff."));
  }
  const parsed = z.object({
    email: z.email(),
    display_name: z.string().trim().min(2).max(120),
    role: z.enum(["owner", "operator", "support", "read_only"]),
    active: z.enum(["true", "false"]),
  }).safeParse(Object.fromEntries(formData));

  if (!parsed.success) redirect(withMessage("error", "Check the staff account values."));
  const { error } = await context.supabase.rpc("set_platform_staff_by_email", {
    target_email: parsed.data.email,
    next_display_name: parsed.data.display_name,
    next_role: parsed.data.role,
    next_active: parsed.data.active === "true",
  });
  if (error) redirect(withMessage("error", error.message));
  revalidatePath("/control");
  redirect(withMessage("notice", "Platform staff access updated."));
}
