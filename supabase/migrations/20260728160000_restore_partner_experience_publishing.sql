-- Canonical durable publishing ledger for experiences, campaigns, surveys, routes, and collections.
-- Applied to production through Supabase migration restore_partner_experience_publishing.

create table if not exists public.partner_experiences (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  organization_id uuid references public.partner_organizations(id) on delete set null,
  created_by_partner_user_id uuid references public.partner_users(id) on delete set null,
  experience_type text not null,
  title text not null,
  objective text not null,
  primary_result text not null,
  status text not null default 'draft' check (status in ('draft','published','paused','archived')),
  content_items jsonb not null default '[]'::jsonb,
  audience jsonb not null default '[]'::jsonb,
  placements jsonb not null default '[]'::jsonb,
  interactions jsonb not null default '[]'::jsonb,
  timing jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists partner_experiences_partner_updated_idx on public.partner_experiences(partner_id, updated_at desc);
create index if not exists partner_experiences_org_status_idx on public.partner_experiences(organization_id, status, updated_at desc);
create index if not exists partner_experiences_placements_gin_idx on public.partner_experiences using gin(placements);

alter table public.partner_experiences enable row level security;
grant select, insert, update on public.partner_experiences to authenticated;

drop policy if exists "partner members read experiences" on public.partner_experiences;
create policy "partner members read experiences" on public.partner_experiences for select to authenticated
using ((select private.is_super_admin()) or exists (
  select 1 from public.partner_users pu where pu.partner_id = partner_experiences.partner_id
  and pu.auth_user_id = (select auth.uid()) and pu.active
));

drop policy if exists "partner publishers create experiences" on public.partner_experiences;
create policy "partner publishers create experiences" on public.partner_experiences for insert to authenticated
with check ((select private.is_super_admin()) or exists (
  select 1 from public.partner_users pu where pu.partner_id = partner_experiences.partner_id
  and pu.auth_user_id = (select auth.uid()) and pu.active and pu.role in ('owner','manager','staff')
  and (created_by_partner_user_id is null or created_by_partner_user_id = pu.id)
));

drop policy if exists "partner publishers update experiences" on public.partner_experiences;
create policy "partner publishers update experiences" on public.partner_experiences for update to authenticated
using ((select private.is_super_admin()) or exists (
  select 1 from public.partner_users pu where pu.partner_id = partner_experiences.partner_id
  and pu.auth_user_id = (select auth.uid()) and pu.active and pu.role in ('owner','manager','staff')
))
with check ((select private.is_super_admin()) or exists (
  select 1 from public.partner_users pu where pu.partner_id = partner_experiences.partner_id
  and pu.auth_user_id = (select auth.uid()) and pu.active and pu.role in ('owner','manager','staff')
));

create or replace function public.touch_partner_experience()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  new.version = old.version + 1;
  if new.status = 'published' and old.status is distinct from 'published' then new.published_at = now(); end if;
  return new;
end;
$$;

drop trigger if exists partner_experiences_touch on public.partner_experiences;
create trigger partner_experiences_touch before update on public.partner_experiences
for each row execute function public.touch_partner_experience();

do $$
begin
  if not exists (
    select 1 from pg_publication_tables where pubname='supabase_realtime'
    and schemaname='public' and tablename='partner_experiences'
  ) then alter publication supabase_realtime add table public.partner_experiences; end if;
end $$;

with new_partner as (
  insert into public.partners(name,partner_type,status,timezone)
  select 'Downtown Perks','platform','active','America/Chicago'
  where not exists (select 1 from public.partners where lower(name)=lower('Downtown Perks'))
  returning id
), selected_partner as (
  select id from new_partner union all
  select id from public.partners where lower(name)=lower('Downtown Perks') limit 1
)
insert into public.partner_users(partner_id,auth_user_id,role,active)
select sp.id,au.id,'owner',true from selected_partner sp
join auth.users au on lower(au.email)=lower('me@megdude.com')
where not exists (select 1 from public.partner_users pu where pu.auth_user_id=au.id and pu.partner_id=sp.id);

with selected_partner as (select id from public.partners where lower(name)=lower('Downtown Perks') limit 1)
insert into public.partner_organizations(legacy_partner_id,external_id,name,organization_type,status,timezone)
select id,'downtown-perks','Downtown Perks','platform','active','America/Chicago' from selected_partner
where not exists (select 1 from public.partner_organizations where external_id='downtown-perks');
