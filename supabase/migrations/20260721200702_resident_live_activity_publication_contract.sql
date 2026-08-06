-- One canonical publication contract for Partner Workspace and Resident Home.
-- Partner writes remain server-only; Resident Home reads through a sanitized
-- Cloudflare function rather than receiving service-role database access.

alter table public.perks
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete restrict,
  entity_id text,
  title text not null,
  description text,
  start_time timestamptz,
  end_time timestamptz,
  address text,
  district text,
  lat numeric,
  lng numeric,
  image_url text,
  rsvp_enabled boolean not null default true,
  active boolean not null default true,
  status text not null default 'upcoming'
    check (status in ('upcoming', 'scheduled', 'active', 'live', 'published', 'past', 'cancelled')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_partner_updated_idx
  on public.events(partner_id, updated_at desc);
create index if not exists events_public_schedule_idx
  on public.events(status, start_time)
  where active = true;

alter table public.events enable row level security;

revoke all on public.events from public, anon, authenticated;
grant all on public.events to service_role;

-- Existing `perks` policies continue to govern direct client reads. The new
-- metadata column is descriptive only and does not change authorization.
grant all on public.perks to service_role;
