-- Tighten browser-facing privileges after the initial application migrations.
-- Service-role publishing remains server-only; authenticated clients create drafts
-- but cannot promote or mutate them after submission.

drop policy if exists reply_drafts_update_responders on public.reply_drafts;
revoke update on public.reply_drafts from authenticated;
revoke insert on public.reply_drafts from authenticated;
grant insert (
  organization_id,
  location_id,
  review_id,
  body,
  state,
  created_by
) on public.reply_drafts to authenticated;

comment on table public.reply_drafts is
  'Customer reply drafts. Authenticated users may create drafts under RLS; state transitions and publishing are server-only.';

create or replace function private.prevent_last_owner_removal()
returns trigger
language plpgsql
set search_path = ''
as $$
declare removing_owner boolean := false;
begin
  -- A deliberate organization deletion must be allowed to cascade through its
  -- memberships. Direct membership changes still keep one active owner.
  if tg_op = 'DELETE' and not exists (
    select 1 from public.organizations
    where id = old.organization_id
  ) then
    return old;
  end if;

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

revoke create on schema public from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;

grant usage on schema private to authenticated;
grant execute on function private.is_org_member(uuid) to authenticated;
grant execute on function private.org_role_at_least(uuid, public.app_role) to authenticated;
grant execute on function private.can_access_location(uuid, uuid) to authenticated;
grant execute on function private.location_role_at_least(uuid, uuid, public.app_role) to authenticated;
grant execute on function private.shares_org(uuid) to authenticated;

alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema private revoke execute on functions from public;
