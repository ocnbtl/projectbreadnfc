create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.app_role as enum (
  'owner',
  'admin',
  'manager',
  'responder',
  'analyst',
  'viewer'
);

create type public.access_scope as enum ('organization', 'assigned_locations');
create type public.membership_status as enum ('active', 'suspended');
create type public.integration_provider as enum (
  'google_business_profile',
  'facebook',
  'instagram',
  'linkedin',
  'trustpilot',
  'yelp',
  'tripadvisor',
  'bbb',
  'other'
);
create type public.integration_mode as enum ('native', 'read_only', 'link_only');
create type public.integration_status as enum (
  'setup_required',
  'connected',
  'paused',
  'error',
  'disconnected'
);
create type public.review_status as enum ('needs_reply', 'replied', 'archived');
create type public.reply_state as enum (
  'draft',
  'pending_approval',
  'approved',
  'rejected',
  'publishing',
  'provider_pending',
  'published',
  'failed'
);
create type public.invitation_status as enum ('pending', 'accepted', 'revoked', 'expired');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  timezone text not null default 'America/New_York',
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_memberships (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  access_scope public.access_scope not null default 'organization',
  status public.membership_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.organization_policies (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  reply_approval_required boolean not null default true,
  allow_location_overrides boolean not null default true,
  ai_drafts_enabled boolean not null default false,
  default_reply_tone text not null default 'Warm and direct',
  response_sla_hours integer not null default 48 check (response_sla_hours between 1 and 720),
  notify_new_reviews boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  timezone text not null default 'America/New_York',
  address_line_1 text,
  city text,
  region text,
  postal_code text,
  google_review_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug),
  unique (id, organization_id)
);

create table public.location_memberships (
  organization_id uuid not null,
  location_id uuid not null,
  user_id uuid not null,
  role public.app_role not null check (role not in ('owner', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (location_id, user_id),
  foreign key (location_id, organization_id)
    references public.locations (id, organization_id) on delete cascade,
  foreign key (organization_id, user_id)
    references public.organization_memberships (organization_id, user_id) on delete cascade
);

create table public.location_policies (
  location_id uuid primary key,
  organization_id uuid not null,
  inherits_organization boolean not null default true,
  reply_approval_required boolean,
  ai_drafts_enabled boolean,
  default_reply_tone text,
  response_sla_hours integer check (response_sla_hours between 1 and 720),
  notify_new_reviews boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (location_id, organization_id)
    references public.locations (id, organization_id) on delete cascade
);

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  provider public.integration_provider not null,
  display_name text not null,
  mode public.integration_mode not null default 'link_only',
  status public.integration_status not null default 'setup_required',
  capabilities text[] not null default '{}',
  external_account_id text,
  profile_url text,
  reply_url text,
  last_synced_at timestamptz,
  last_error text,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.integrations add unique (id, organization_id);

create unique index integrations_external_account_unique
  on public.integrations (organization_id, provider, external_account_id)
  where external_account_id is not null;

create table public.integration_credentials (
  integration_id uuid primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  access_token_ciphertext text not null,
  refresh_token_ciphertext text,
  access_token_iv text not null,
  refresh_token_iv text,
  key_version integer not null default 1,
  expires_at timestamptz,
  scopes text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (integration_id, organization_id)
    references public.integrations (id, organization_id) on delete cascade
);

create table public.external_locations (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  location_id uuid,
  external_location_id text not null,
  display_name text not null,
  source_url text,
  provider_average_rating numeric(2, 1) check (provider_average_rating between 0 and 5),
  provider_total_review_count integer check (provider_total_review_count >= 0),
  source_content_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (integration_id, external_location_id),
  unique (id, organization_id),
  foreign key (integration_id, organization_id)
    references public.integrations (id, organization_id) on delete cascade,
  foreign key (location_id, organization_id)
    references public.locations (id, organization_id) on delete cascade
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  location_id uuid not null,
  external_location_id uuid,
  provider public.integration_provider not null,
  external_review_id text not null,
  author_name text not null default 'Google customer',
  rating smallint not null check (rating between 1 and 5),
  body text,
  provider_url text,
  status public.review_status not null default 'needs_reply',
  review_created_at timestamptz not null,
  provider_updated_at timestamptz,
  replied_at timestamptz,
  raw_payload jsonb not null default '{}',
  source_expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, provider, external_review_id),
  unique (id, organization_id, location_id),
  foreign key (location_id, organization_id)
    references public.locations (id, organization_id) on delete cascade,
  foreign key (external_location_id, organization_id)
    references public.external_locations (id, organization_id) on delete cascade
);

create table public.reply_drafts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  location_id uuid not null,
  review_id uuid not null,
  body text not null check (char_length(body) between 1 and 4000),
  state public.reply_state not null default 'draft',
  created_by uuid not null references auth.users (id),
  approved_by uuid references auth.users (id),
  approved_at timestamptz,
  failure_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (review_id, organization_id, location_id)
    references public.reviews (id, organization_id, location_id) on delete cascade
);

create table public.review_replies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  location_id uuid not null,
  review_id uuid not null,
  draft_id uuid references public.reply_drafts (id) on delete set null,
  body text not null,
  provider_reply_id text,
  state public.reply_state not null default 'publishing',
  authored_by uuid references auth.users (id),
  published_by uuid references auth.users (id),
  published_at timestamptz,
  provider_payload jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (review_id, organization_id, location_id)
    references public.reviews (id, organization_id, location_id) on delete cascade
);

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  location_id uuid not null,
  serial_number text not null unique,
  name text not null,
  product_type text not null check (product_type in ('counter_stand', 'adhesive_plate', 'staff_card')),
  status text not null default 'active' check (status in ('active', 'needs_attention', 'offline', 'retired')),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (location_id, organization_id)
    references public.locations (id, organization_id) on delete cascade
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email text not null,
  role public.app_role not null,
  access_scope public.access_scope not null default 'organization',
  token uuid not null default gen_random_uuid() unique,
  status public.invitation_status not null default 'pending',
  expires_at timestamptz not null default (now() + interval '7 days'),
  invited_by uuid not null references auth.users (id),
  accepted_by uuid references auth.users (id),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index invitations_pending_email_unique
  on public.invitations (organization_id, lower(email))
  where status = 'pending';

create table public.audit_events (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  location_id uuid references public.locations (id) on delete set null,
  actor_user_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index organization_memberships_user_idx
  on public.organization_memberships (user_id, status, organization_id);
create index location_memberships_user_idx
  on public.location_memberships (user_id, organization_id, location_id);
create index locations_org_idx on public.locations (organization_id, status);
create index integrations_org_idx on public.integrations (organization_id, provider, status);
create index reviews_location_date_idx
  on public.reviews (location_id, review_created_at desc);
create index reviews_org_status_idx
  on public.reviews (organization_id, status, review_created_at desc);
create index reviews_source_expiry_idx
  on public.reviews (provider, source_expires_at);
create index external_locations_source_expiry_idx
  on public.external_locations (source_content_expires_at);
create index reply_drafts_review_idx on public.reply_drafts (review_id, state);
create index audit_events_org_date_idx
  on public.audit_events (organization_id, created_at desc);

create or replace function private.role_rank(role_value public.app_role)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case role_value
    when 'owner' then 10
    when 'admin' then 20
    when 'manager' then 30
    when 'responder' then 40
    when 'analyst' then 50
    when 'viewer' then 60
  end;
$$;

create or replace function private.is_org_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_organization_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
  );
$$;

create or replace function private.org_role_at_least(
  target_organization_id uuid,
  required_role public.app_role
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_organization_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and private.role_rank(membership.role) <= private.role_rank(required_role)
  );
$$;

create or replace function private.can_access_location(
  target_organization_id uuid,
  target_location_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_organization_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and (
        membership.role in ('owner', 'admin')
        or membership.access_scope = 'organization'
        or exists (
          select 1
          from public.location_memberships location_membership
          where location_membership.organization_id = target_organization_id
            and location_membership.location_id = target_location_id
            and location_membership.user_id = (select auth.uid())
        )
      )
  );
$$;

create or replace function private.location_role_at_least(
  target_organization_id uuid,
  target_location_id uuid,
  required_role public.app_role
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.organization_memberships membership
    left join public.location_memberships location_membership
      on location_membership.organization_id = membership.organization_id
      and location_membership.location_id = target_location_id
      and location_membership.user_id = membership.user_id
    where membership.organization_id = target_organization_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and (
        private.role_rank(membership.role) <= 20
        or (
          membership.access_scope = 'organization'
          and private.role_rank(membership.role) <= private.role_rank(required_role)
        )
        or (
          membership.access_scope = 'assigned_locations'
          and location_membership.user_id is not null
          and private.role_rank(location_membership.role) <= private.role_rank(required_role)
        )
      )
  );
$$;

create or replace function private.shares_org(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select target_user_id = (select auth.uid()) or exists (
    select 1
    from public.organization_memberships mine
    join public.organization_memberships theirs
      on theirs.organization_id = mine.organization_id
    where mine.user_id = (select auth.uid())
      and mine.status = 'active'
      and theirs.user_id = target_user_id
      and theirs.status = 'active'
  );
$$;

revoke all on all functions in schema private from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_org_member(uuid) to authenticated;
grant execute on function private.org_role_at_least(uuid, public.app_role) to authenticated;
grant execute on function private.can_access_location(uuid, uuid) to authenticated;
grant execute on function private.location_role_at_least(uuid, uuid, public.app_role) to authenticated;
grant execute on function private.shares_org(uuid) to authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, lower(new.email), nullif(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

insert into public.profiles (id, email, full_name)
select
  auth_user.id,
  lower(auth_user.email),
  nullif(auth_user.raw_user_meta_data ->> 'full_name', '')
from auth.users auth_user
on conflict (id) do update set email = excluded.email;

create or replace function private.prevent_last_owner_removal()
returns trigger
language plpgsql
set search_path = ''
as $$
declare removing_owner boolean := false;
begin
  if old.role = 'owner' then
    if tg_op = 'DELETE' then
      removing_owner := true;
    else
      removing_owner := new.role <> 'owner' or new.status <> 'active';
    end if;
  end if;

  if removing_owner and not exists (
      select 1
      from public.organization_memberships membership
      where membership.organization_id = old.organization_id
        and membership.user_id <> old.user_id
        and membership.role = 'owner'
        and membership.status = 'active'
    ) then
    raise exception 'An organization must keep at least one active owner.';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger organization_memberships_keep_owner
  before update or delete on public.organization_memberships
  for each row execute function private.prevent_last_owner_removal();

create or replace function private.capture_audit_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_data jsonb;
  target_organization_id uuid;
  target_location_id uuid;
  target_entity_id text;
begin
  if tg_op = 'DELETE' then
    row_data := to_jsonb(old);
  else
    row_data := to_jsonb(new);
  end if;
  target_organization_id := (row_data ->> 'organization_id')::uuid;
  target_location_id := nullif(row_data ->> 'location_id', '')::uuid;
  target_entity_id := coalesce(
    row_data ->> 'id',
    row_data ->> 'user_id',
    row_data ->> 'organization_id'
  );
  insert into public.audit_events (
    organization_id,
    location_id,
    actor_user_id,
    action,
    entity_type,
    entity_id,
    metadata
  ) values (
    target_organization_id,
    target_location_id,
    auth.uid(),
    tg_table_name || '.' || lower(tg_op),
    tg_table_name,
    target_entity_id,
    jsonb_build_object('operation', tg_op)
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'organization_memberships', 'organization_policies', 'locations',
    'location_memberships', 'location_policies', 'integrations', 'invitations',
    'reply_drafts', 'review_replies', 'devices'
  ]
  loop
    execute format(
      'create trigger %I_audit after insert or update or delete on public.%I for each row execute function private.capture_audit_event()',
      table_name,
      table_name
    );
  end loop;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'profiles', 'organizations', 'organization_memberships', 'organization_policies',
    'locations', 'location_memberships', 'location_policies', 'integrations',
    'integration_credentials', 'external_locations', 'reviews', 'reply_drafts',
    'review_replies', 'devices', 'invitations'
  ]
  loop
    execute format(
      'create trigger %I_set_updated_at before update on public.%I for each row execute function private.set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end;
$$;

create or replace function public.create_organization(
  organization_name text,
  organization_slug text,
  first_location_name text default 'Main location'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  new_organization_id uuid;
  new_location_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if char_length(trim(organization_name)) < 2
    or organization_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  then
    raise exception 'A valid organization name and slug are required.';
  end if;

  insert into public.organizations (name, slug, created_by)
  values (trim(organization_name), organization_slug, current_user_id)
  returning id into new_organization_id;

  insert into public.organization_memberships (
    organization_id, user_id, role, access_scope, status
  ) values (
    new_organization_id, current_user_id, 'owner', 'organization', 'active'
  );

  insert into public.organization_policies (organization_id)
  values (new_organization_id);

  insert into public.locations (organization_id, name, slug)
  values (new_organization_id, trim(first_location_name), 'main-location')
  returning id into new_location_id;

  insert into public.location_policies (location_id, organization_id)
  values (new_location_id, new_organization_id);

  insert into public.audit_events (
    organization_id, location_id, actor_user_id, action, entity_type, entity_id
  ) values (
    new_organization_id,
    new_location_id,
    current_user_id,
    'organization.created',
    'organization',
    new_organization_id::text
  );

  return new_organization_id;
end;
$$;

create or replace function public.create_invitation(
  target_organization_id uuid,
  invited_email text,
  invited_role public.app_role,
  invited_scope public.access_scope default 'organization'
)
returns table (invitation_id uuid, invitation_token uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare current_role public.app_role;
begin
  select membership.role into current_role
  from public.organization_memberships membership
  where membership.organization_id = target_organization_id
    and membership.user_id = auth.uid()
    and membership.status = 'active';

  if current_role not in ('owner', 'admin') then
    raise exception 'Administrator access required.';
  end if;

  if invited_role = 'owner' and current_role <> 'owner' then
    raise exception 'Only an owner can invite another owner.';
  end if;

  return query
  insert into public.invitations (
    organization_id, email, role, access_scope, invited_by
  ) values (
    target_organization_id,
    lower(trim(invited_email)),
    invited_role,
    invited_scope,
    auth.uid()
  )
  returning id, token;
end;
$$;

create or replace function public.create_location(
  target_organization_id uuid,
  location_name text,
  location_slug text,
  location_city text default null,
  location_region text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare new_location_id uuid;
begin
  if not private.org_role_at_least(target_organization_id, 'admin') then
    raise exception 'Administrator access required.';
  end if;

  if char_length(trim(location_name)) < 2
    or location_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  then
    raise exception 'A valid location name and slug are required.';
  end if;

  insert into public.locations (
    organization_id, name, slug, city, region
  ) values (
    target_organization_id,
    trim(location_name),
    location_slug,
    nullif(trim(location_city), ''),
    nullif(trim(location_region), '')
  )
  returning id into new_location_id;

  insert into public.location_policies (location_id, organization_id)
  values (new_location_id, target_organization_id);

  return new_location_id;
end;
$$;

create or replace function public.accept_invitation(invitation_token uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  target_invitation public.invitations%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required.';
  end if;

  select * into target_invitation
  from public.invitations invitation
  where invitation.token = invitation_token
  for update;

  if target_invitation.id is null
    or target_invitation.status <> 'pending'
    or target_invitation.expires_at <= now()
  then
    raise exception 'This invitation is no longer valid.';
  end if;

  if lower(target_invitation.email) <> current_email then
    raise exception 'Sign in with the invited email address.';
  end if;

  insert into public.organization_memberships (
    organization_id, user_id, role, access_scope, status
  ) values (
    target_invitation.organization_id,
    current_user_id,
    target_invitation.role,
    target_invitation.access_scope,
    'active'
  )
  on conflict (organization_id, user_id) do update
    set role = excluded.role,
        access_scope = excluded.access_scope,
        status = 'active';

  update public.invitations
  set status = 'accepted', accepted_by = current_user_id, accepted_at = now()
  where id = target_invitation.id;

  return target_invitation.organization_id;
end;
$$;

revoke all on function public.create_organization(text, text, text) from public, anon;
revoke all on function public.create_invitation(uuid, text, public.app_role, public.access_scope) from public, anon;
revoke all on function public.accept_invitation(uuid) from public, anon;
revoke all on function public.create_location(uuid, text, text, text, text) from public, anon;
grant execute on function public.create_organization(text, text, text) to authenticated;
grant execute on function public.create_invitation(uuid, text, public.app_role, public.access_scope) to authenticated;
grant execute on function public.accept_invitation(uuid) to authenticated;
grant execute on function public.create_location(uuid, text, text, text, text) to authenticated;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.organization_policies enable row level security;
alter table public.locations enable row level security;
alter table public.location_memberships enable row level security;
alter table public.location_policies enable row level security;
alter table public.integrations enable row level security;
alter table public.integration_credentials enable row level security;
alter table public.external_locations enable row level security;
alter table public.reviews enable row level security;
alter table public.reply_drafts enable row level security;
alter table public.review_replies enable row level security;
alter table public.devices enable row level security;
alter table public.invitations enable row level security;
alter table public.audit_events enable row level security;

create policy profiles_select_organization_peers on public.profiles
  for select to authenticated
  using (private.shares_org(id));
create policy profiles_update_self on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy organizations_select_members on public.organizations
  for select to authenticated
  using (private.is_org_member(id));
create policy organizations_update_admins on public.organizations
  for update to authenticated
  using (private.org_role_at_least(id, 'admin'))
  with check (private.org_role_at_least(id, 'admin'));

create policy organization_memberships_select_members on public.organization_memberships
  for select to authenticated
  using (private.is_org_member(organization_id));
create policy organization_memberships_insert_admins on public.organization_memberships
  for insert to authenticated
  with check (
    private.org_role_at_least(organization_id, 'admin')
    and (role <> 'owner' or private.org_role_at_least(organization_id, 'owner'))
  );
create policy organization_memberships_update_admins on public.organization_memberships
  for update to authenticated
  using (
    private.org_role_at_least(organization_id, 'admin')
    and (role <> 'owner' or private.org_role_at_least(organization_id, 'owner'))
  )
  with check (
    private.org_role_at_least(organization_id, 'admin')
    and (role <> 'owner' or private.org_role_at_least(organization_id, 'owner'))
  );
create policy organization_memberships_delete_admins on public.organization_memberships
  for delete to authenticated
  using (
    private.org_role_at_least(organization_id, 'admin')
    and (role <> 'owner' or private.org_role_at_least(organization_id, 'owner'))
  );

create policy organization_policies_select_members on public.organization_policies
  for select to authenticated
  using (private.is_org_member(organization_id));
create policy organization_policies_update_admins on public.organization_policies
  for update to authenticated
  using (private.org_role_at_least(organization_id, 'admin'))
  with check (private.org_role_at_least(organization_id, 'admin'));

create policy locations_select_scoped_members on public.locations
  for select to authenticated
  using (private.can_access_location(organization_id, id));
create policy locations_insert_admins on public.locations
  for insert to authenticated
  with check (private.org_role_at_least(organization_id, 'admin'));
create policy locations_update_managers on public.locations
  for update to authenticated
  using (private.location_role_at_least(organization_id, id, 'manager'))
  with check (private.location_role_at_least(organization_id, id, 'manager'));
create policy locations_delete_admins on public.locations
  for delete to authenticated
  using (private.org_role_at_least(organization_id, 'admin'));

create policy location_memberships_select_members on public.location_memberships
  for select to authenticated
  using (private.is_org_member(organization_id));
create policy location_memberships_manage_admins on public.location_memberships
  for all to authenticated
  using (private.org_role_at_least(organization_id, 'admin'))
  with check (private.org_role_at_least(organization_id, 'admin'));

create policy location_policies_select_scoped_members on public.location_policies
  for select to authenticated
  using (private.can_access_location(organization_id, location_id));
create policy location_policies_update_managers on public.location_policies
  for update to authenticated
  using (private.location_role_at_least(organization_id, location_id, 'manager'))
  with check (
    private.location_role_at_least(organization_id, location_id, 'manager')
    and (
      private.org_role_at_least(organization_id, 'admin')
      or exists (
        select 1 from public.organization_policies policy
        where policy.organization_id = location_policies.organization_id
          and policy.allow_location_overrides
      )
    )
  );

create policy integrations_select_members on public.integrations
  for select to authenticated
  using (private.is_org_member(organization_id));
create policy integrations_manage_admins on public.integrations
  for all to authenticated
  using (private.org_role_at_least(organization_id, 'admin'))
  with check (private.org_role_at_least(organization_id, 'admin'));

create policy external_locations_select_scoped_members on public.external_locations
  for select to authenticated
  using (
    location_id is null
    and private.is_org_member(organization_id)
    or location_id is not null
    and private.can_access_location(organization_id, location_id)
  );
create policy external_locations_manage_admins on public.external_locations
  for all to authenticated
  using (private.org_role_at_least(organization_id, 'admin'))
  with check (private.org_role_at_least(organization_id, 'admin'));

create policy reviews_select_scoped_members on public.reviews
  for select to authenticated
  using (private.can_access_location(organization_id, location_id));

create policy reply_drafts_select_scoped_members on public.reply_drafts
  for select to authenticated
  using (private.can_access_location(organization_id, location_id));
create policy reply_drafts_insert_responders on public.reply_drafts
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and state in ('draft', 'pending_approval')
    and private.location_role_at_least(organization_id, location_id, 'responder')
  );
create policy reply_drafts_update_responders on public.reply_drafts
  for update to authenticated
  using (private.location_role_at_least(organization_id, location_id, 'responder'))
  with check (
    state in ('draft', 'pending_approval', 'approved', 'rejected', 'failed')
    and private.location_role_at_least(organization_id, location_id, 'responder')
  );
create policy reply_drafts_delete_authors on public.reply_drafts
  for delete to authenticated
  using (created_by = (select auth.uid()) and state in ('draft', 'rejected', 'failed'));

create policy review_replies_select_scoped_members on public.review_replies
  for select to authenticated
  using (private.can_access_location(organization_id, location_id));

create policy devices_select_scoped_members on public.devices
  for select to authenticated
  using (private.can_access_location(organization_id, location_id));
create policy devices_manage_admins on public.devices
  for all to authenticated
  using (private.org_role_at_least(organization_id, 'admin'))
  with check (private.org_role_at_least(organization_id, 'admin'));

create policy invitations_select_admins on public.invitations
  for select to authenticated
  using (private.org_role_at_least(organization_id, 'admin'));
create policy invitations_update_admins on public.invitations
  for update to authenticated
  using (private.org_role_at_least(organization_id, 'admin'))
  with check (private.org_role_at_least(organization_id, 'admin'));

create policy audit_events_select_members on public.audit_events
  for select to authenticated
  using (private.is_org_member(organization_id));

revoke all on all tables in schema public from anon;
grant select, update on public.profiles to authenticated;
grant select, update on public.organizations to authenticated;
grant select, insert, update, delete on public.organization_memberships to authenticated;
grant select, update on public.organization_policies to authenticated;
grant select, insert, update, delete on public.locations to authenticated;
grant select, insert, update, delete on public.location_memberships to authenticated;
grant select, update on public.location_policies to authenticated;
grant select, insert, update, delete on public.integrations to authenticated;
grant select, insert, update, delete on public.external_locations to authenticated;
grant select on public.reviews to authenticated;
grant select, insert, update, delete on public.reply_drafts to authenticated;
grant select on public.review_replies to authenticated;
grant select, insert, update, delete on public.devices to authenticated;
grant select, update on public.invitations to authenticated;
grant select on public.audit_events to authenticated;
revoke all on public.integration_credentials from anon, authenticated;

grant usage, select on all sequences in schema public to authenticated;
