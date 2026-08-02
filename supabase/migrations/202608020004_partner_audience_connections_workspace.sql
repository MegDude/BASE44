-- Protected Audience and Connections workspace support tables.
-- Server APIs use the service-role client. No browser grants are added.

create table if not exists public.audience_scope_bindings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.partner_organizations(id) on delete cascade,
  portfolio_id uuid references public.partner_portfolios(id) on delete set null,
  listing_id uuid references public.partner_listings(id) on delete set null,
  building_id uuid not null references public.resident_membership_buildings(id) on delete cascade,
  source_id uuid references public.audience_sources(id) on delete set null,
  status text not null default 'active' check (status in ('active','paused','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, portfolio_id, listing_id, building_id)
);
alter table public.audience_scope_bindings enable row level security;
create index if not exists audience_scope_bindings_scope_idx
  on public.audience_scope_bindings (organization_id, portfolio_id, listing_id, status);
create index if not exists audience_scope_bindings_building_idx
  on public.audience_scope_bindings (building_id, status);

create table if not exists public.partner_integration_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.partner_organizations(id) on delete cascade,
  portfolio_id uuid references public.partner_portfolios(id) on delete set null,
  listing_id uuid references public.partner_listings(id) on delete set null,
  provider text not null,
  status text not null default 'requested' check (status in ('requested','configuring','connected','failed','cancelled')),
  requested_by_user_id uuid,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, provider)
);
alter table public.partner_integration_requests enable row level security;
create index if not exists partner_integration_requests_scope_idx
  on public.partner_integration_requests (organization_id, portfolio_id, listing_id, status, updated_at desc);
