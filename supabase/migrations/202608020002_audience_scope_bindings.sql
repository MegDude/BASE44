-- Explicit consent-aware audience permissions. No browser RLS policies are added:
-- all audience aggregation and binding writes are performed by server-side APIs.

create table if not exists public.audience_scope_bindings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.partner_organizations(id) on delete cascade,
  portfolio_id uuid references public.partner_portfolios(id) on delete cascade,
  listing_id uuid references public.partner_listings(id) on delete cascade,
  building_id uuid not null references public.resident_membership_buildings(id) on delete restrict,
  status text not null default 'active' check (status in ('active','paused','revoked')),
  created_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.audience_scope_bindings enable row level security;

create index if not exists audience_scope_bindings_org_scope_idx
  on public.audience_scope_bindings (organization_id, portfolio_id, listing_id, status);

create index if not exists audience_scope_bindings_building_idx
  on public.audience_scope_bindings (building_id, status);

create unique index if not exists audience_scope_bindings_unique_root_scope
  on public.audience_scope_bindings (
    organization_id,
    building_id,
    coalesce(portfolio_id::text, ''),
    coalesce(listing_id::text, '')
  );
