-- Canonical workspace inventory, audience and attribution foundation.
-- Server-side APIs use the service-role client; no browser grants are added.

create table if not exists public.map_inventory (
  id text primary key,
  slug text not null,
  name text not null,
  entity_type text not null,
  category text,
  district text,
  address text,
  latitude double precision,
  longitude double precision,
  status text not null default 'active' check (status in ('draft','active','paused','archived')),
  source_name text not null,
  source_updated_at timestamptz,
  source_payload jsonb not null default '{}'::jsonb,
  imported_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.map_inventory enable row level security;
create index if not exists map_inventory_status_district_idx on public.map_inventory (status, district);
create index if not exists map_inventory_entity_type_idx on public.map_inventory (entity_type);

create table if not exists public.partner_campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.partner_organizations(id) on delete cascade,
  portfolio_id uuid references public.partner_portfolios(id) on delete set null,
  listing_id uuid references public.partner_listings(id) on delete set null,
  title text not null,
  status text not null default 'draft' check (status in ('draft','scheduled','active','paused','completed','archived')),
  starts_at timestamptz,
  ends_at timestamptz,
  source_name text not null default 'partner_workspace',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.partner_campaigns enable row level security;
create index if not exists partner_campaigns_scope_status_idx on public.partner_campaigns (organization_id, portfolio_id, listing_id, status);

create table if not exists public.audience_sources (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  source_name text not null,
  source_type text not null check (source_type in ('resident','dana','crm','building','partner')),
  status text not null default 'pending' check (status in ('pending','connected','paused','error')),
  last_synced_at timestamptz,
  freshness_seconds integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.audience_sources enable row level security;

create table if not exists public.audience_members (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.audience_sources(id) on delete cascade,
  external_member_id text not null,
  resident_profile_id uuid references public.resident_profiles(id) on delete set null,
  email_hash text,
  district text,
  building_id uuid references public.resident_membership_buildings(id) on delete set null,
  status text not null default 'active' check (status in ('active','inactive','suppressed')),
  consent_partner_contact boolean not null default false,
  consent_personalization boolean not null default false,
  source_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, external_member_id)
);
alter table public.audience_members enable row level security;
create index if not exists audience_members_source_status_idx on public.audience_members (source_id, status, consent_partner_contact);
create index if not exists audience_members_resident_profile_idx on public.audience_members (resident_profile_id) where resident_profile_id is not null;

alter table public.analytics_signals add column if not exists partner_organization_id uuid references public.partner_organizations(id) on delete set null;
alter table public.analytics_signals add column if not exists listing_id uuid references public.partner_listings(id) on delete set null;
alter table public.analytics_signals add column if not exists perk_id uuid references public.perks(id) on delete set null;
create index if not exists analytics_signals_partner_scope_idx on public.analytics_signals (partner_organization_id, listing_id, created_at desc);
create index if not exists analytics_signals_entity_idx on public.analytics_signals (entity_id, created_at desc);

insert into public.audience_sources (source_key, source_name, source_type, status, last_synced_at)
values
  ('resident-profiles', 'Downtown Perks resident profiles', 'resident', 'connected', now()),
  ('dana-members', 'DANA members', 'dana', 'pending', null)
on conflict (source_key) do update
set source_name = excluded.source_name,
    source_type = excluded.source_type,
    status = excluded.status,
    last_synced_at = excluded.last_synced_at,
    updated_at = now();
