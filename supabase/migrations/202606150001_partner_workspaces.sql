do $$
begin
  create extension if not exists pgcrypto;
  create extension if not exists postgis;
  create extension if not exists vector;
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('prospect','resident','partner','admin','superadmin');
  end if;
  if not exists (select 1 from pg_type where typname = 'workspace_type') then
    create type public.workspace_type as enum ('community','partner','hotel','brand','civic');
  end if;
end
$$;

create table if not exists public.profiles (
  id uuid references auth.users (id) primary key,
  email text not null,
  role public.user_role not null default 'prospect',
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.workspace_type not null,
  verified boolean not null default false,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_memberships (
  workspace_id uuid references public.workspaces (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  role public.user_role not null,
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces (id) on delete cascade,
  user_id uuid references auth.users (id),
  name text not null,
  company_name text,
  partner_type text not null,
  subscription_plan text,
  active boolean not null default true,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  address text,
  district text,
  lat numeric,
  lng numeric,
  website text,
  phone text,
  image_url text,
  logo_url text,
  partner_status text not null default 'candidate',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hotels (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  address text,
  district text,
  lat numeric,
  lng numeric,
  website text,
  image_url text,
  logo_url text,
  partner_status text not null default 'candidate',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  description text,
  address text,
  district text,
  lat numeric,
  lng numeric,
  website text,
  image_url text,
  logo_url text,
  partner_status text not null default 'candidate',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  website text,
  image_url text,
  logo_url text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.civic_entities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  address text,
  district text,
  lat numeric,
  lng numeric,
  website text,
  image_url text,
  logo_url text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.entities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces (id) on delete cascade,
  slug text not null unique,
  title text not null,
  type text not null,
  district text,
  lat double precision,
  lng double precision,
  address text,
  status text not null default 'live',
  cover_photo text,
  metrics jsonb not null default '{}'::jsonb,
  pulse jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.perks (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid,
  entity_type text,
  title text not null,
  description text,
  offer_text text,
  start_date date,
  end_date date,
  redemption_type text not null default 'show_card',
  qr boolean not null default false,
  show_card boolean not null default true,
  promo_code text,
  active boolean not null default true,
  start_at timestamptz,
  end_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid,
  title text not null,
  description text,
  start_time timestamptz,
  end_time timestamptz,
  address text,
  lat numeric,
  lng numeric,
  image_url text,
  rsvp_enabled boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners (id) on delete set null,
  title text not null,
  campaign_type text not null check (campaign_type in ('perk','event','visibility','survey')),
  tier text not null default 'standard' check (tier in ('standard','featured','sponsored')),
  status text not null default 'scheduled' check (status in ('scheduled','active','completed','draft','paused')),
  start_date date,
  end_date date,
  budget numeric,
  impressions integer not null default 0,
  views integer not null default 0,
  saves integer not null default 0,
  clicks integer not null default 0,
  redemptions integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.residents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id),
  name text,
  email text not null,
  building_id uuid,
  membership_status text not null default 'pending',
  joined_at timestamptz not null default now()
);

create table if not exists public.saved_places (
  resident_id uuid references public.residents (id) on delete cascade,
  entity_id uuid not null,
  entity_type text not null,
  saved_at timestamptz not null default now(),
  primary key (resident_id, entity_id, entity_type)
);

create table if not exists public.rsvps (
  resident_id uuid references public.residents (id) on delete cascade,
  event_id uuid references public.events (id) on delete cascade,
  status text not null default 'interested' check (status in ('going','interested')),
  created_at timestamptz not null default now(),
  primary key (resident_id, event_id)
);

create table if not exists public.redemptions (
  id uuid primary key default gen_random_uuid(),
  resident_id uuid references public.residents (id) on delete set null,
  perk_id uuid references public.perks (id) on delete set null,
  perk_card_id uuid,
  venue_offer_id uuid,
  venue_id uuid,
  redeemed_at timestamptz not null default now()
);

create table if not exists public.surveys (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid,
  entity_type text,
  title text not null,
  questions jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners (id) on delete set null,
  campaign_id uuid references public.campaigns (id) on delete set null,
  title text not null,
  summary text,
  metrics jsonb not null default '{}'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_context (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid,
  entity_type text not null,
  summary text not null,
  tags text[] not null default '{}',
  district text,
  embedding vector(1536),
  updated_at timestamptz not null default now()
);

create table if not exists public.search_index (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null,
  entity_type text not null,
  title text not null,
  body text,
  district text,
  search_vector tsvector generated always as (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, '') || ' ' || coalesce(district, ''))
  ) stored,
  embedding vector(1536),
  updated_at timestamptz not null default now()
);

create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces (id) on delete cascade,
  entity_id uuid references public.entities (id),
  user_id uuid references auth.users (id),
  event_type text not null check (event_type in ('check-in','redemption','rsvp','save','directions','open')),
  points integer not null default 0,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.loyalty_points (
  user_id uuid references auth.users (id) primary key,
  points integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.resident_verification (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id),
  email text not null,
  building_domain text not null,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users (id),
  action text not null,
  target text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_items (
  profile_id text not null,
  entity_type text not null,
  entity_id text not null,
  created_at timestamptz not null default now(),
  primary key (profile_id, entity_type, entity_id)
);

create table if not exists public.map_impressions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  entity_id text not null,
  entity_type text not null,
  lat numeric,
  lng numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.search_logs (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  query text not null,
  lat numeric,
  lng numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null,
  venue_id text not null,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists public.listing_interest_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  move_timeline text,
  message text,
  listing jsonb not null,
  session_id text,
  profile_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_signals (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  action_type text not null,
  value numeric not null default 1,
  session_token text,
  user_email text,
  district text,
  campaign_id uuid,
  venue_id uuid,
  event_id uuid,
  building_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.perk_cards (
  id uuid primary key default gen_random_uuid(),
  card_code text not null unique,
  resident_id uuid references public.residents (id) on delete set null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists memberships_user_idx on public.workspace_memberships (user_id);
create index if not exists interactions_workspace_idx on public.interactions (workspace_id);

alter table public.profiles enable row level security;
alter table public.workspace_memberships enable row level security;
alter table public.workspaces enable row level security;
alter table public.partners enable row level security;
alter table public.properties enable row level security;
alter table public.hotels enable row level security;
alter table public.venues enable row level security;
alter table public.brands enable row level security;
alter table public.civic_entities enable row level security;
alter table public.entities enable row level security;
alter table public.perks enable row level security;
alter table public.events enable row level security;
alter table public.campaigns enable row level security;
alter table public.residents enable row level security;
alter table public.saved_places enable row level security;
alter table public.rsvps enable row level security;
alter table public.redemptions enable row level security;
alter table public.surveys enable row level security;
alter table public.reports enable row level security;
alter table public.ai_context enable row level security;
alter table public.search_index enable row level security;
alter table public.interactions enable row level security;
alter table public.loyalty_points enable row level security;
alter table public.resident_verification enable row level security;
alter table public.audit_logs enable row level security;
alter table public.saved_items enable row level security;
alter table public.map_impressions enable row level security;
alter table public.search_logs enable row level security;
alter table public.visits enable row level security;
alter table public.listing_interest_requests enable row level security;
alter table public.analytics_signals enable row level security;
alter table public.perk_cards enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles self read') then
    create policy "profiles self read" on public.profiles for select using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles self update') then
    create policy "profiles self update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'workspaces' and policyname = 'workspaces member read') then
    create policy "workspaces member read" on public.workspaces for select using (
      exists (
        select 1 from public.workspace_memberships wm
        where wm.workspace_id = workspaces.id and wm.user_id = auth.uid()
      )
    );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'workspace_memberships' and policyname = 'memberships scoped read') then
    create policy "memberships scoped read" on public.workspace_memberships for select using (
      user_id = auth.uid()
      or workspace_id in (
        select wm.workspace_id from public.workspace_memberships wm where wm.user_id = auth.uid()
      )
    );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'partners' and policyname = 'partners own read') then
    create policy "partners own read" on public.partners for select using (
      user_id = auth.uid()
      or workspace_id in (
        select wm.workspace_id from public.workspace_memberships wm where wm.user_id = auth.uid()
      )
    );
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'partners' and policyname = 'partners own manage') then
    create policy "partners own manage" on public.partners for all using (
      user_id = auth.uid()
      or workspace_id in (
        select wm.workspace_id from public.workspace_memberships wm
        where wm.user_id = auth.uid() and wm.role in ('partner','admin','superadmin')
      )
    ) with check (
      user_id = auth.uid()
      or workspace_id in (
        select wm.workspace_id from public.workspace_memberships wm
        where wm.user_id = auth.uid() and wm.role in ('partner','admin','superadmin')
      )
    );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'entities' and policyname = 'entities workspace read') then
    create policy "entities workspace read" on public.entities for select using (
      workspace_id in (
        select wm.workspace_id from public.workspace_memberships wm where wm.user_id = auth.uid()
      )
    );
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'entities' and policyname = 'entities partner manage') then
    create policy "entities partner manage" on public.entities for all using (
      workspace_id in (
        select wm.workspace_id from public.workspace_memberships wm
        where wm.user_id = auth.uid() and wm.role in ('partner','admin','superadmin')
      )
    ) with check (
      workspace_id in (
        select wm.workspace_id from public.workspace_memberships wm
        where wm.user_id = auth.uid() and wm.role in ('partner','admin','superadmin')
      )
    );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'residents' and policyname = 'residents self read') then
    create policy "residents self read" on public.residents for select using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'residents' and policyname = 'residents self manage') then
    create policy "residents self manage" on public.residents for all using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'saved_places' and policyname = 'saved places resident manage') then
    create policy "saved places resident manage" on public.saved_places for all using (
      exists (select 1 from public.residents r where r.id = saved_places.resident_id and r.user_id = auth.uid())
    ) with check (
      exists (select 1 from public.residents r where r.id = saved_places.resident_id and r.user_id = auth.uid())
    );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'rsvps' and policyname = 'rsvps resident manage') then
    create policy "rsvps resident manage" on public.rsvps for all using (
      exists (select 1 from public.residents r where r.id = rsvps.resident_id and r.user_id = auth.uid())
    ) with check (
      exists (select 1 from public.residents r where r.id = rsvps.resident_id and r.user_id = auth.uid())
    );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'redemptions' and policyname = 'redemptions resident read') then
    create policy "redemptions resident read" on public.redemptions for select using (
      exists (select 1 from public.residents r where r.id = redemptions.resident_id and r.user_id = auth.uid())
    );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'campaigns' and policyname = 'campaigns partner scoped') then
    create policy "campaigns partner scoped" on public.campaigns for all using (
      partner_id in (select p.id from public.partners p where p.user_id = auth.uid())
    ) with check (
      partner_id in (select p.id from public.partners p where p.user_id = auth.uid())
    );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'reports' and policyname = 'reports partner scoped') then
    create policy "reports partner scoped" on public.reports for all using (
      partner_id in (select p.id from public.partners p where p.user_id = auth.uid())
    ) with check (
      partner_id in (select p.id from public.partners p where p.user_id = auth.uid())
    );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'interactions' and policyname = 'interactions scoped insert') then
    create policy "interactions scoped insert" on public.interactions for insert with check (
      user_id = auth.uid()
      or workspace_id in (
        select wm.workspace_id from public.workspace_memberships wm where wm.user_id = auth.uid()
      )
    );
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'interactions' and policyname = 'interactions scoped read') then
    create policy "interactions scoped read" on public.interactions for select using (
      user_id = auth.uid()
      or workspace_id in (
        select wm.workspace_id from public.workspace_memberships wm where wm.user_id = auth.uid()
      )
    );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'loyalty_points' and policyname = 'loyalty points self read') then
    create policy "loyalty points self read" on public.loyalty_points for select using (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'resident_verification' and policyname = 'resident verification self') then
    create policy "resident verification self" on public.resident_verification for all using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end
$$;

do $$
declare
  public_table text;
begin
  foreach public_table in array array[
    'properties',
    'hotels',
    'venues',
    'brands',
    'civic_entities',
    'perks',
    'events',
    'surveys',
    'ai_context',
    'search_index'
  ]
  loop
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = public_table
        and policyname = 'public read published downtown objects'
    ) then
      execute format('create policy "public read published downtown objects" on public.%I for select using (true)', public_table);
    end if;
  end loop;
end
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.score_interaction_points(kind text)
returns integer language sql immutable as $$
  select case kind
    when 'check-in' then 10
    when 'redemption' then 20
    when 'rsvp' then 10
    when 'save' then 5
    else 0
  end;
$$;

create or replace function public.apply_interaction_points()
returns trigger language plpgsql as $$
begin
  new.points = public.score_interaction_points(new.event_type);
  if new.user_id is not null and new.points > 0 then
    insert into public.loyalty_points (user_id, points)
    values (new.user_id, new.points)
    on conflict (user_id) do update set
      points = public.loyalty_points.points + excluded.points,
      updated_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists score_interactions on public.interactions;
create trigger score_interactions before insert on public.interactions
for each row execute function public.apply_interaction_points();

create or replace function public.approve_partner(target_user_id uuid, workspace_name text, workspace_type public.workspace_type default 'partner')
returns uuid language plpgsql security definer as $$
declare
  created_workspace_id uuid;
begin
  insert into public.workspaces (name, type, verified, created_by)
  values (workspace_name, workspace_type, true, target_user_id)
  returning id into created_workspace_id;

  update public.profiles set role = 'partner' where id = target_user_id;

  insert into public.workspace_memberships (workspace_id, user_id, role)
  values (created_workspace_id, target_user_id, 'partner');

  insert into public.audit_logs (actor_user_id, action, target, meta)
  values (auth.uid(), 'approve_partner', target_user_id::text, jsonb_build_object('workspace_id', created_workspace_id));

  return created_workspace_id;
end;
$$;

create or replace view public.map_entities as
  select id, 'property'::text as entity_type, name as title, description, lat, lng, image_url, district, partner_status
  from public.properties
  union all
  select id, 'hotel'::text as entity_type, name as title, description, lat, lng, image_url, district, partner_status
  from public.hotels
  union all
  select id, 'venue'::text as entity_type, name as title, description, lat, lng, image_url, district, partner_status
  from public.venues
  union all
  select id, 'brand'::text as entity_type, name as title, description, null::numeric as lat, null::numeric as lng, image_url, null::text as district, status as partner_status
  from public.brands
  union all
  select id, 'civic'::text as entity_type, name as title, description, lat, lng, image_url, district, status as partner_status
  from public.civic_entities
  union all
  select id, 'event'::text as entity_type, title, description, lat, lng, image_url, null::text as district, case when active then 'active' else 'inactive' end as partner_status
  from public.events;

insert into storage.buckets (id, name, public)
values
  ('entity-images', 'entity-images', true),
  ('logos', 'logos', true),
  ('campaign-images', 'campaign-images', true),
  ('event-images', 'event-images', true),
  ('property-images', 'property-images', true)
on conflict (id) do nothing;
