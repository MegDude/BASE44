-- Canonical map query and Luxury Presence persistence foundation.
-- All tables are server-only: RLS is enabled and this migration adds no browser grants or policies.

create table if not exists public.luxury_presence_webhook_events (
  id uuid primary key default gen_random_uuid(),
  external_event_id text not null unique,
  event_type text not null default 'leads',
  activity_type text not null,
  raw_payload jsonb not null default '{}'::jsonb,
  status text not null default 'received' check (status in ('received','processed','failed')),
  error_message text,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.luxury_presence_webhook_events enable row level security;
create index if not exists luxury_presence_webhook_events_status_created_idx on public.luxury_presence_webhook_events (status, created_at desc);

create table if not exists public.lead_activity_events (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  external_lead_id text,
  external_agent_id text,
  external_listing_id text,
  activity_type text not null,
  activity_category text,
  lead_email text,
  lead_name text,
  listing_title text,
  listing_address text,
  listing_url text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.lead_activity_events enable row level security;
create index if not exists lead_activity_events_listing_idx on public.lead_activity_events (external_listing_id, occurred_at desc);
create index if not exists lead_activity_events_lead_idx on public.lead_activity_events (external_lead_id, occurred_at desc);

create table if not exists public.luxury_presence_listing_intelligence (
  external_listing_id text primary key,
  listing_title text,
  listing_address text,
  listing_url text,
  views_last_7_days integer not null default 0,
  favorites_last_7_days integer not null default 0,
  inquiries_last_7_days integer not null default 0,
  demand_score integer not null default 0,
  seller_intent_score integer not null default 0,
  last_activity_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.luxury_presence_listing_intelligence enable row level security;

create table if not exists public.luxury_presence_followup_queue (
  id uuid primary key default gen_random_uuid(),
  external_lead_id text,
  external_agent_id text,
  external_listing_id text,
  activity_type text not null,
  priority text not null,
  reason text not null,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'open' check (status in ('open','resolved','dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
alter table public.luxury_presence_followup_queue enable row level security;
create index if not exists luxury_presence_followup_queue_open_idx on public.luxury_presence_followup_queue (status, priority, created_at desc);

create table if not exists public.luxury_presence_suppression_signals (
  id uuid primary key default gen_random_uuid(),
  external_lead_id text,
  lead_email text,
  activity_type text not null,
  suppressed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique (external_lead_id, activity_type),
  unique (lead_email, activity_type)
);
alter table public.luxury_presence_suppression_signals enable row level security;

create table if not exists public.luxury_presence_agents (
  external_agent_id text primary key,
  name text,
  email text,
  phone text,
  image_url text,
  brokerage text,
  raw_payload jsonb not null default '{}'::jsonb,
  synced_at timestamptz not null default now()
);
alter table public.luxury_presence_agents enable row level security;
