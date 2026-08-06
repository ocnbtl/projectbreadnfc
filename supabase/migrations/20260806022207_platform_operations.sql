create type public.platform_role as enum ('owner', 'operator', 'support', 'read_only');
create type public.customer_lifecycle as enum ('lead', 'pilot', 'active', 'paused', 'churned');
create type public.customer_health as enum ('healthy', 'watch', 'at_risk', 'unknown');
create type public.platform_task_status as enum ('open', 'in_progress', 'blocked', 'completed', 'dismissed');
create type public.platform_task_priority as enum ('urgent', 'high', 'normal', 'low');

create table public.platform_staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.platform_role not null default 'read_only',
  display_name text check (display_name is null or char_length(display_name) between 2 and 120),
  active boolean not null default true,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customer_accounts (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  lifecycle public.customer_lifecycle not null default 'lead',
  health public.customer_health not null default 'unknown',
  plan_name text,
  monthly_recurring_revenue_cents integer not null default 0 check (monthly_recurring_revenue_cents >= 0),
  acquisition_source text,
  account_owner_id uuid references public.platform_staff (user_id) on delete set null,
  activated_at timestamptz,
  churned_at timestamptz,
  internal_notes text check (internal_notes is null or char_length(internal_notes) <= 5000),
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.platform_tasks (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations (id) on delete cascade,
  title text not null check (char_length(title) between 2 and 180),
  detail text check (detail is null or char_length(detail) <= 4000),
  priority public.platform_task_priority not null default 'normal',
  status public.platform_task_status not null default 'open',
  assigned_to uuid references public.platform_staff (user_id) on delete set null,
  due_at timestamptz,
  completed_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.platform_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users (id) on delete set null,
  organization_id uuid references public.organizations (id) on delete set null,
  action text not null check (char_length(action) between 2 and 120),
  entity_type text not null check (char_length(entity_type) between 2 and 80),
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index customer_accounts_lifecycle_idx on public.customer_accounts (lifecycle, health);
create index platform_tasks_work_queue_idx on public.platform_tasks (status, priority, due_at nulls last);
create index platform_tasks_organization_idx on public.platform_tasks (organization_id, created_at desc);
create index platform_events_date_idx on public.platform_events (created_at desc);
create index platform_events_organization_idx on public.platform_events (organization_id, created_at desc);

create trigger platform_staff_set_updated_at
  before update on public.platform_staff
  for each row execute function private.set_updated_at();
create trigger customer_accounts_set_updated_at
  before update on public.customer_accounts
  for each row execute function private.set_updated_at();
create trigger platform_tasks_set_updated_at
  before update on public.platform_tasks
  for each row execute function private.set_updated_at();

create or replace function private.ensure_customer_account()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.customer_accounts (organization_id, lifecycle)
  values (new.id, 'lead')
  on conflict (organization_id) do nothing;
  return new;
end;
$$;

revoke all on function private.ensure_customer_account() from public, anon, authenticated;

create trigger organizations_ensure_customer_account
  after insert on public.organizations
  for each row execute function private.ensure_customer_account();

insert into public.customer_accounts (organization_id, lifecycle)
select id, 'lead' from public.organizations
on conflict (organization_id) do nothing;

alter table public.platform_staff enable row level security;
alter table public.customer_accounts enable row level security;
alter table public.platform_tasks enable row level security;
alter table public.platform_events enable row level security;

create policy platform_staff_select_self on public.platform_staff
  for select to authenticated
  using ((select auth.uid()) = user_id and active);

revoke all on public.platform_staff from anon, authenticated;
grant select on public.platform_staff to authenticated;
revoke all on public.customer_accounts from anon, authenticated;
revoke all on public.platform_tasks from anon, authenticated;
revoke all on public.platform_events from anon, authenticated;

create view public.platform_customer_summaries
with (security_invoker = true)
as
select
  organizations.id as organization_id,
  organizations.name,
  organizations.slug,
  organizations.created_at,
  customer_accounts.lifecycle,
  customer_accounts.health,
  customer_accounts.plan_name,
  customer_accounts.monthly_recurring_revenue_cents,
  (select count(*) from public.locations where locations.organization_id = organizations.id and locations.status <> 'archived') as location_count,
  (select count(*) from public.devices where devices.organization_id = organizations.id) as device_count,
  (select count(*) from public.devices where devices.organization_id = organizations.id and devices.status in ('needs_attention', 'offline')) as device_attention_count,
  (select count(*) from public.integrations where integrations.organization_id = organizations.id and integrations.status = 'connected') as connected_integration_count,
  (select count(*) from public.integrations where integrations.organization_id = organizations.id and integrations.status = 'error') as integration_error_count,
  (select count(*) from public.reviews where reviews.organization_id = organizations.id and reviews.status = 'needs_reply') as needs_reply_count,
  (select count(*) from public.organization_memberships where organization_memberships.organization_id = organizations.id and organization_memberships.status = 'active') as member_count
from public.organizations
join public.customer_accounts on customer_accounts.organization_id = organizations.id;

create view public.platform_portfolio_pulse
with (security_invoker = true)
as
select
  count(*) as organization_count,
  count(*) filter (where lifecycle in ('pilot', 'active')) as customer_count,
  count(*) filter (where health in ('watch', 'at_risk')) as account_attention_count,
  coalesce(sum(monthly_recurring_revenue_cents) filter (where lifecycle = 'active'), 0) as monthly_recurring_revenue_cents,
  coalesce(sum(location_count), 0) as location_count,
  coalesce(sum(device_attention_count), 0) as device_attention_count,
  coalesce(sum(integration_error_count), 0) as integration_error_count,
  coalesce(sum(needs_reply_count), 0) as needs_reply_count
from public.platform_customer_summaries;

revoke all on public.platform_customer_summaries from anon, authenticated;
revoke all on public.platform_portfolio_pulse from anon, authenticated;
grant select on public.platform_customer_summaries to service_role;
grant select on public.platform_portfolio_pulse to service_role;

create or replace function public.create_platform_task(
  task_title text,
  task_detail text default null,
  task_organization_id uuid default null,
  task_priority public.platform_task_priority default 'normal',
  task_due_at timestamptz default null,
  task_assigned_to uuid default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_role public.platform_role;
  task_id bigint;
begin
  select role into actor_role from public.platform_staff
  where user_id = (select auth.uid()) and active;
  if actor_role is null or actor_role not in ('owner', 'operator') then
    raise insufficient_privilege using message = 'Owner or operator access is required.';
  end if;
  if task_assigned_to is not null and not exists (
    select 1 from public.platform_staff where user_id = task_assigned_to and active
  ) then
    raise check_violation using message = 'The assignee is not an active platform staff member.';
  end if;

  insert into public.platform_tasks (
    organization_id, title, detail, priority, assigned_to, due_at, created_by, updated_by
  ) values (
    task_organization_id, task_title, nullif(task_detail, ''), task_priority,
    task_assigned_to, task_due_at, (select auth.uid()), (select auth.uid())
  ) returning id into task_id;

  insert into public.platform_events (
    actor_user_id, organization_id, action, entity_type, entity_id, metadata
  ) values (
    (select auth.uid()), task_organization_id, 'task.created', 'platform_task', task_id::text,
    jsonb_build_object('priority', task_priority, 'assigned_to', task_assigned_to)
  );
  return task_id;
end;
$$;

create or replace function public.update_platform_task_status(
  target_task_id bigint,
  next_status public.platform_task_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_role public.platform_role;
  task_organization_id uuid;
  task_assignee uuid;
begin
  select role into actor_role from public.platform_staff
  where user_id = (select auth.uid()) and active;
  select organization_id, assigned_to into task_organization_id, task_assignee
  from public.platform_tasks where id = target_task_id;
  if actor_role is null or not (
    actor_role in ('owner', 'operator') or
    (actor_role = 'support' and task_assignee = (select auth.uid()))
  ) then
    raise insufficient_privilege using message = 'This task is not available to your role.';
  end if;

  update public.platform_tasks set
    status = next_status,
    completed_at = case when next_status = 'completed' then now() else null end,
    updated_by = (select auth.uid())
  where id = target_task_id;
  if not found then raise no_data_found using message = 'Task not found.'; end if;

  insert into public.platform_events (
    actor_user_id, organization_id, action, entity_type, entity_id, metadata
  ) values (
    (select auth.uid()), task_organization_id, 'task.status_updated', 'platform_task', target_task_id::text,
    jsonb_build_object('status', next_status)
  );
end;
$$;

create or replace function public.update_customer_account(
  target_organization_id uuid,
  next_lifecycle public.customer_lifecycle,
  next_health public.customer_health,
  next_plan_name text,
  next_monthly_recurring_revenue_cents integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare actor_role public.platform_role;
begin
  select role into actor_role from public.platform_staff
  where user_id = (select auth.uid()) and active;
  if actor_role is null or actor_role not in ('owner', 'operator') then
    raise insufficient_privilege using message = 'Owner or operator access is required.';
  end if;

  update public.customer_accounts set
    lifecycle = next_lifecycle,
    health = next_health,
    plan_name = nullif(next_plan_name, ''),
    monthly_recurring_revenue_cents = next_monthly_recurring_revenue_cents,
    activated_at = case when next_lifecycle = 'active' then coalesce(activated_at, now()) else activated_at end,
    churned_at = case when next_lifecycle = 'churned' then coalesce(churned_at, now()) else null end,
    updated_by = (select auth.uid())
  where organization_id = target_organization_id;
  if not found then raise no_data_found using message = 'Customer account not found.'; end if;

  insert into public.platform_events (
    actor_user_id, organization_id, action, entity_type, entity_id, metadata
  ) values (
    (select auth.uid()), target_organization_id, 'customer_account.updated', 'customer_account', target_organization_id::text,
    jsonb_build_object('lifecycle', next_lifecycle, 'health', next_health)
  );
end;
$$;

create or replace function public.set_platform_staff_by_email(
  target_email text,
  next_role public.platform_role,
  next_display_name text,
  next_active boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_role public.platform_role;
  target_user_id uuid;
begin
  select role into actor_role from public.platform_staff
  where user_id = (select auth.uid()) and active;
  if actor_role is distinct from 'owner' then
    raise insufficient_privilege using message = 'Owner access is required.';
  end if;
  select id into target_user_id from auth.users where lower(email) = lower(target_email) limit 1;
  if target_user_id is null then raise no_data_found using message = 'No authenticated account uses that email.'; end if;
  if target_user_id = (select auth.uid()) and (next_role <> 'owner' or not next_active) then
    raise check_violation using message = 'The active owner cannot demote or deactivate their own account.';
  end if;

  insert into public.platform_staff (user_id, role, display_name, active)
  values (target_user_id, next_role, nullif(next_display_name, ''), next_active)
  on conflict (user_id) do update set
    role = excluded.role,
    display_name = excluded.display_name,
    active = excluded.active;

  insert into public.platform_events (
    actor_user_id, action, entity_type, entity_id, metadata
  ) values (
    (select auth.uid()), 'platform_staff.updated', 'platform_staff', target_user_id::text,
    jsonb_build_object('role', next_role, 'active', next_active)
  );
  return target_user_id;
end;
$$;

create or replace function private.prevent_platform_event_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Platform events are append-only.';
end;
$$;

create trigger platform_events_are_append_only
  before update or delete on public.platform_events
  for each row execute function private.prevent_platform_event_mutation();

revoke all on function public.create_platform_task(text, text, uuid, public.platform_task_priority, timestamptz, uuid) from public, anon;
revoke all on function public.update_platform_task_status(bigint, public.platform_task_status) from public, anon;
revoke all on function public.update_customer_account(uuid, public.customer_lifecycle, public.customer_health, text, integer) from public, anon;
revoke all on function public.set_platform_staff_by_email(text, public.platform_role, text, boolean) from public, anon;
grant execute on function public.create_platform_task(text, text, uuid, public.platform_task_priority, timestamptz, uuid) to authenticated;
grant execute on function public.update_platform_task_status(bigint, public.platform_task_status) to authenticated;
grant execute on function public.update_customer_account(uuid, public.customer_lifecycle, public.customer_health, text, integer) to authenticated;
grant execute on function public.set_platform_staff_by_email(text, public.platform_role, text, boolean) to authenticated;

comment on table public.platform_staff is 'Scantap employees and trusted operators. Separate from customer organization membership.';
comment on table public.customer_accounts is 'Internal lifecycle and commercial metadata for each customer organization.';
comment on table public.platform_tasks is 'Internal operating queue. Never exposed through customer organization roles.';
comment on table public.platform_events is 'Append-only audit ledger for cross-tenant platform operations.';
comment on view public.platform_customer_summaries is 'Server-only operational summary used by the Scantap control center.';
comment on view public.platform_portfolio_pulse is 'Server-only portfolio pulse used by the Scantap control center.';
