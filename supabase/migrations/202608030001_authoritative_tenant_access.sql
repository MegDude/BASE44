begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

insert into public.partner_organizations (external_id, name, organization_type, status)
values
  ('legends-real-estate', 'Legends Real Estate', 'brokerage', 'active'),
  ('waterloo-greenway', 'Waterloo Greenway', 'civic', 'active'),
  ('larry-and-guy', 'Larry & Guy', 'brand', 'active'),
  ('hotel-van-zandt', 'Hotel Van Zandt', 'hotel', 'active')
on conflict (external_id) do update set
  name = excluded.name,
  organization_type = excluded.organization_type,
  status = 'active',
  updated_at = now();

-- Operational workspace tables retain the legacy partners key. Bridge each
-- canonical organization to exactly one operational partner record.
insert into public.partners (name, partner_type, status)
select o.name,
  case o.external_id
    when 'legends-real-estate' then 'real_estate'
    when 'hotel-van-zandt' then 'property'
    else o.organization_type
  end,
  'active'
from public.partner_organizations o
where o.external_id in ('legends-real-estate','waterloo-greenway','larry-and-guy','hotel-van-zandt')
  and o.legacy_partner_id is null
  and not exists (select 1 from public.partners p where lower(p.name)=lower(o.name));

update public.partner_organizations o
set legacy_partner_id=p.id, updated_at=now()
from public.partners p
where o.external_id in ('legends-real-estate','waterloo-greenway','larry-and-guy','hotel-van-zandt')
  and o.legacy_partner_id is null
  and lower(p.name)=lower(o.name);

create table if not exists public.account_assignments (
  email text primary key check (email = lower(email)),
  platform_role text not null check (platform_role in ('resident','partner','platform_admin','super_admin')),
  partner_id uuid references public.partner_organizations(id) on delete restrict,
  partner_role text check (partner_role in ('owner','manager','editor','analyst')),
  protected_account boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((platform_role = 'partner') = (partner_id is not null)),
  check (platform_role = 'partner' or partner_role is null)
);

alter table public.account_assignments enable row level security;
revoke all on public.account_assignments from anon, authenticated;

-- Keep the canonical access roles accepted by the existing profile table.
alter table public.platform_profiles drop constraint if exists platform_profiles_platform_role_check;
alter table public.platform_profiles add constraint platform_profiles_platform_role_check
  check (platform_role in ('super_admin','platform_admin','admin','partner','partner_admin','partner_member','resident'));

insert into public.account_assignments (email, platform_role, protected_account)
values
  ('me@megdude.com', 'super_admin', true),
  ('meganatx@icloud.com', 'super_admin', true)
on conflict (email) do update set platform_role=excluded.platform_role, protected_account=true, updated_at=now();

insert into public.account_assignments (email, platform_role, partner_id, partner_role)
select v.email, 'partner', o.id, 'owner'
from (values
  ('legends@downtownperks.com','legends-real-estate'),
  ('waterloogreenway@downtownperks.com','waterloo-greenway'),
  ('larryandguy@downtownperks.com','larry-and-guy'),
  ('hotelvanzandt@downtownperks.com','hotel-van-zandt')
) as v(email, external_id)
join public.partner_organizations o on o.external_id=v.external_id
on conflict (email) do update set platform_role='partner', partner_id=excluded.partner_id, partner_role='owner', updated_at=now();

create table if not exists public.admin_impersonation_sessions (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id) on delete cascade,
  partner_id uuid not null references public.partner_organizations(id) on delete cascade,
  started_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '60 minutes'),
  ended_at timestamptz,
  reason text not null default 'Workspace support',
  constraint valid_impersonation_window check (expires_at > started_at and expires_at <= started_at + interval '4 hours')
);
create unique index if not exists one_active_impersonation_per_admin on public.admin_impersonation_sessions(actor_user_id) where ended_at is null;
alter table public.admin_impersonation_sessions enable row level security;

create or replace function private.is_platform_admin(request_user uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public, auth, pg_temp as $$
  select exists (
    select 1 from public.platform_profiles p
    where p.user_id=request_user and p.is_active
      and (p.is_super_admin or p.platform_role in ('platform_admin','super_admin'))
  );
$$;

create or replace function private.direct_partner_id(request_user uuid default auth.uid())
returns uuid language sql stable security definer set search_path = public, auth, pg_temp as $$
  select o.id
  from public.partner_users pu
  join public.partner_organizations o on o.legacy_partner_id=pu.partner_id
  where pu.auth_user_id=request_user and pu.active and o.status='active'
  order by pu.created_at limit 1;
$$;

create or replace function private.active_impersonated_partner_id(request_user uuid default auth.uid())
returns uuid language sql stable security definer set search_path = public, auth, pg_temp as $$
  select s.partner_id from public.admin_impersonation_sessions s
  where s.actor_user_id=request_user and s.ended_at is null and s.expires_at > now()
  order by s.started_at desc limit 1;
$$;

create or replace function private.authorized_partner_id(request_user uuid default auth.uid())
returns uuid language sql stable security definer set search_path = public, auth, pg_temp as $$
  select case when private.is_platform_admin(request_user)
    then private.active_impersonated_partner_id(request_user)
    else private.direct_partner_id(request_user)
  end;
$$;

create or replace function public.current_access_context()
returns table(platform_role text, partner_id uuid, is_impersonating boolean, impersonation_expires_at timestamptz)
language sql stable security invoker set search_path=public,private,auth,pg_temp as $$
  select p.platform_role,
    private.authorized_partner_id(auth.uid()),
    private.is_platform_admin(auth.uid()) and private.active_impersonated_partner_id(auth.uid()) is not null,
    (select max(s.expires_at) from public.admin_impersonation_sessions s where s.actor_user_id=auth.uid() and s.ended_at is null and s.expires_at > now())
  from public.platform_profiles p where p.user_id=auth.uid() and p.is_active;
$$;

grant execute on function public.current_access_context() to authenticated;

create or replace function public.start_partner_impersonation(target_partner_id uuid, session_reason text default 'Workspace support')
returns uuid language plpgsql security invoker set search_path=public,private,auth,pg_temp as $$
declare new_id uuid;
begin
  if not private.is_platform_admin(auth.uid()) then raise exception 'forbidden' using errcode='42501'; end if;
  if not exists(select 1 from public.partner_organizations where id=target_partner_id and status='active') then raise exception 'unknown partner'; end if;
  update public.admin_impersonation_sessions set ended_at=now() where actor_user_id=auth.uid() and ended_at is null;
  insert into public.admin_impersonation_sessions(actor_user_id,partner_id,reason)
  values(auth.uid(),target_partner_id,left(coalesce(nullif(trim(session_reason),''),'Workspace support'),240)) returning id into new_id;
  insert into public.audit_logs(actor_user_id,action,target,meta)
  values(auth.uid(),'impersonation.started',target_partner_id::text,jsonb_build_object('session_id',new_id,'reason',session_reason));
  return new_id;
end; $$;

create or replace function public.stop_partner_impersonation()
returns void language plpgsql security invoker set search_path=public,private,auth,pg_temp as $$
declare ended_ids uuid[];
begin
  if not private.is_platform_admin(auth.uid()) then raise exception 'forbidden' using errcode='42501'; end if;
  with ended as (update public.admin_impersonation_sessions set ended_at=now() where actor_user_id=auth.uid() and ended_at is null returning id)
  select array_agg(id) into ended_ids from ended;
  insert into public.audit_logs(actor_user_id,action,target,meta)
  values(auth.uid(),'impersonation.ended','partner_workspace',jsonb_build_object('session_ids',coalesce(to_jsonb(ended_ids),'[]'::jsonb)));
end; $$;

grant execute on function public.start_partner_impersonation(uuid,text), public.stop_partner_impersonation() to authenticated;

create policy "admins manage own impersonation sessions" on public.admin_impersonation_sessions
for all to authenticated
using (actor_user_id=auth.uid() and private.is_platform_admin(auth.uid()))
with check (actor_user_id=auth.uid() and private.is_platform_admin(auth.uid()));

create or replace function private.assign_account_metadata()
returns trigger language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare assignment public.account_assignments%rowtype;
begin
  select * into assignment from public.account_assignments where email=lower(new.email);
  if not found then assignment.platform_role := 'resident'; assignment.protected_account := false; end if;
  new.raw_app_meta_data := coalesce(new.raw_app_meta_data,'{}'::jsonb) || jsonb_build_object(
    'platform_role',assignment.platform_role,
    'is_super_admin',assignment.platform_role='super_admin',
    'partner_id',assignment.partner_id
  );
  return new;
end; $$;

create or replace function private.sync_account_assignment()
returns trigger language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare
  assignment public.account_assignments%rowtype;
  operational_partner_id uuid;
begin
  select * into assignment from public.account_assignments where email=lower(new.email);
  if not found then assignment.platform_role := 'resident'; assignment.protected_account := false; end if;
  insert into public.platform_profiles(user_id,email,platform_role,is_active,is_super_admin,protected_account)
  values(new.id,lower(new.email),assignment.platform_role,true,assignment.platform_role='super_admin',coalesce(assignment.protected_account,false))
  on conflict(user_id) do update set email=excluded.email, platform_role=excluded.platform_role, is_active=true, is_super_admin=excluded.is_super_admin, protected_account=excluded.protected_account, updated_at=now();
  if assignment.platform_role='partner' then
    select legacy_partner_id into operational_partner_id
    from public.partner_organizations
    where id=assignment.partner_id and status='active';
    if operational_partner_id is null then
      raise exception 'partner organization is not linked to an operational workspace';
    end if;
    insert into public.partner_users(partner_id,auth_user_id,role,active)
    values(operational_partner_id,new.id,assignment.partner_role,true)
    on conflict(partner_id,auth_user_id) do update set role=excluded.role,active=true;
  end if;
  return new;
end; $$;

drop trigger if exists assign_account_metadata_before_auth_user_write on auth.users;
create trigger assign_account_metadata_before_auth_user_write before insert or update of email on auth.users
for each row execute function private.assign_account_metadata();
drop trigger if exists sync_account_assignment_after_auth_user_write on auth.users;
create trigger sync_account_assignment_after_auth_user_write after insert or update of email on auth.users
for each row execute function private.sync_account_assignment();

update public.platform_profiles set platform_role='super_admin',is_super_admin=true,protected_account=true,updated_at=now()
where lower(email) in ('me@megdude.com','meganatx@icloud.com');
update auth.users u set raw_app_meta_data=coalesce(u.raw_app_meta_data,'{}'::jsonb)||jsonb_build_object('platform_role','super_admin','is_super_admin',true)
where lower(u.email) in ('me@megdude.com','meganatx@icloud.com');

commit;
