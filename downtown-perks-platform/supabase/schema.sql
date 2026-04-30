
create extension if not exists pgcrypto;

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  item_id text not null,
  item_title text not null,
  mode text not null check (mode in ('resident','partner')),
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.redemptions (
  id uuid primary key default gen_random_uuid(),
  item_id text not null,
  item_title text not null,
  mode text not null check (mode in ('resident','partner')),
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.text_links (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  url text not null,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists public.checkouts (
  id uuid primary key default gen_random_uuid(),
  plan text not null,
  success_url text not null,
  cancel_url text not null,
  amount integer,
  provider text,
  email text,
  created_at timestamptz not null default now()
);

alter table public.rsvps enable row level security;
alter table public.redemptions enable row level security;
alter table public.text_links enable row level security;
alter table public.checkouts enable row level security;

create policy "service role full access rsvps" on public.rsvps for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full access redemptions" on public.redemptions for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full access text_links" on public.text_links for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full access checkouts" on public.checkouts for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');


create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_type text not null,
  external_id text,
  payload jsonb not null,
  processed_at timestamptz not null default now()
);

alter table public.webhook_events enable row level security;
create policy "service role full access webhook_events" on public.webhook_events for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public.checkouts add column if not exists status text default 'created';
alter table public.checkouts add column if not exists external_id text;
alter table public.text_links add column if not exists status text default 'queued';
alter table public.text_links add column if not exists external_id text;

-- ─────────────────────────────────────────────────────────
-- QR → OTP → Redemption → Dashboard → Messaging flow
-- ─────────────────────────────────────────────────────────

create table if not exists public.venues (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique,
  created_at  timestamptz not null default now()
);

create table if not exists public.perks (
  id          uuid primary key default gen_random_uuid(),
  venue_id    uuid not null references public.venues(id) on delete cascade,
  title       text not null,
  description text,
  created_at  timestamptz not null default now()
);

create table if not exists public.qr_codes (
  id          uuid primary key default gen_random_uuid(),
  venue_id    uuid not null references public.venues(id) on delete cascade,
  code        text not null unique,
  created_at  timestamptz not null default now()
);

create table if not exists public.resident_users (
  id           uuid primary key default gen_random_uuid(),
  phone        text not null unique,
  phone_masked text not null,
  role         text not null default 'resident'
                 check (role in ('resident', 'venue_admin', 'platform_admin')),
  created_at   timestamptz not null default now()
);

create table if not exists public.perk_redemptions (
  id              uuid primary key default gen_random_uuid(),
  resident_id     uuid not null references public.resident_users(id),
  venue_id        uuid not null references public.venues(id),
  perk_id         uuid not null references public.perks(id),
  redemption_date date not null default current_date,
  redeemed_at     timestamptz not null default now()
);

-- Enforce 1 redemption per resident per perk per calendar day
create unique index if not exists perk_redemptions_one_per_day
  on public.perk_redemptions(resident_id, perk_id, redemption_date);

create table if not exists public.partner_messages (
  id          uuid primary key default gen_random_uuid(),
  venue_id    uuid not null references public.venues(id),
  content     text not null,
  sent_count  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- Row-level security: all accessed via service role only
alter table public.venues            enable row level security;
alter table public.perks             enable row level security;
alter table public.qr_codes          enable row level security;
alter table public.resident_users    enable row level security;
alter table public.perk_redemptions  enable row level security;
alter table public.partner_messages  enable row level security;

create policy "service role full access venues"
  on public.venues for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role full access perks"
  on public.perks for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role full access qr_codes"
  on public.qr_codes for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role full access resident_users"
  on public.resident_users for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role full access perk_redemptions"
  on public.perk_redemptions for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role full access partner_messages"
  on public.partner_messages for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────
-- Scan event state machine: QR → SMS → Redemption
-- ─────────────────────────────────────────────────────────

-- Add active flag to perks so a venue can enable/disable individual offers
alter table public.perks add column if not exists active boolean not null default true;

-- Add unique redemption code to perk_redemptions (set on scan flow)
alter table public.perk_redemptions add column if not exists redemption_code text unique;

-- Event log: every scan, sms_sent, and redeemed state transition
create table if not exists public.scan_events (
  id             uuid primary key default gen_random_uuid(),
  resident_id    uuid references public.resident_users(id),
  venue_id       uuid not null references public.venues(id),
  perk_id        uuid references public.perks(id),
  redemption_id  uuid references public.perk_redemptions(id),
  event_type     text not null check (event_type in ('scan', 'sms_sent', 'sms_failed', 'redeemed')),
  metadata       jsonb,
  created_at     timestamptz not null default now()
);

alter table public.scan_events enable row level security;
create policy "service role full access scan_events"
  on public.scan_events for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Analytics view: scan → redemption conversion rate per venue
create or replace view public.scan_conversion_stats as
select
  v.id as venue_id,
  v.name as venue_name,
  count(*) filter (where se.event_type = 'scan')     as total_scans,
  count(*) filter (where se.event_type = 'sms_sent') as sms_sent,
  count(*) filter (where se.event_type = 'redeemed') as total_redeemed,
  round(
    count(*) filter (where se.event_type = 'redeemed')::numeric
    / nullif(count(*) filter (where se.event_type = 'scan'), 0) * 100,
    1
  ) as conversion_rate_pct
from public.venues v
left join public.scan_events se on se.venue_id = v.id
group by v.id, v.name;

-- ─────────────────────────────────────────────────────────
-- Behavioral simulation learning loop
-- ─────────────────────────────────────────────────────────

create table if not exists public.simulation_model_weights (
  id text primary key,
  distance_weight numeric not null default 0.2,
  time_weight numeric not null default 0.2,
  category_weight numeric not null default 0.3,
  engagement_weight numeric not null default 0.3,
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_runs (
  id uuid primary key default gen_random_uuid(),
  offer_id text not null,
  input_payload jsonb not null,
  result_payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.simulation_learning_events (
  id uuid primary key default gen_random_uuid(),
  simulation_id uuid,
  offer_id text not null,
  predicted_ctr numeric not null,
  actual_ctr numeric not null,
  predicted_redemption numeric not null,
  actual_redemption numeric not null,
  learning_payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.simulation_model_weights enable row level security;
alter table public.simulation_runs enable row level security;
alter table public.simulation_learning_events enable row level security;

create policy "service role full access simulation_model_weights"
  on public.simulation_model_weights for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role full access simulation_runs"
  on public.simulation_runs for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role full access simulation_learning_events"
  on public.simulation_learning_events for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
