-- Partner-owned connection requests. Secrets are never stored here or sent from the browser.
create table if not exists public.partner_integration_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.partner_organizations(id) on delete cascade,
  provider text not null check (provider in ('luxury_presence','google_analytics','stripe','resend','webhook')),
  status text not null default 'requested' check (status in ('requested','configuring','connected','declined','revoked')),
  requested_by_user_id uuid references auth.users(id) on delete set null,
  note text,
  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.partner_integration_requests enable row level security;
create index if not exists partner_integration_requests_org_status_idx on public.partner_integration_requests (organization_id, status, requested_at desc);
create unique index if not exists partner_integration_requests_active_unique
  on public.partner_integration_requests (organization_id, provider)
  where status in ('requested','configuring');
