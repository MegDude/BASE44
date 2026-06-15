create table if not exists public.luxury_presence_webhook_events (
  id uuid primary key default gen_random_uuid(),
  external_event_id text unique,
  event_type text not null,
  activity_type text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  status text not null default 'received',
  raw_payload jsonb not null,
  error_message text
);

create table if not exists public.lead_activity_events (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'luxury_presence',
  external_lead_id text,
  external_agent_id text,
  external_listing_id text,
  activity_type text not null,
  activity_category text not null,
  lead_email text,
  lead_name text,
  listing_title text,
  listing_address text,
  listing_url text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.luxury_presence_agents (
  id uuid primary key default gen_random_uuid(),
  external_agent_id text unique not null,
  name text,
  email text,
  phone text,
  image_url text,
  brokerage text,
  raw_payload jsonb not null default '{}'::jsonb,
  synced_at timestamptz not null default now()
);

create table if not exists public.luxury_presence_followup_queue (
  id uuid primary key default gen_random_uuid(),
  external_lead_id text,
  external_agent_id text,
  external_listing_id text,
  activity_type text not null,
  priority integer not null default 0,
  reason text not null,
  metadata jsonb not null default '{}'::jsonb,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.luxury_presence_suppression_signals (
  id uuid primary key default gen_random_uuid(),
  external_lead_id text,
  lead_email text,
  activity_type text not null,
  suppressed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists luxury_presence_suppression_unique_lead_activity
  on public.luxury_presence_suppression_signals (external_lead_id, activity_type);

create unique index if not exists luxury_presence_suppression_unique_email_activity
  on public.luxury_presence_suppression_signals (lead_email, activity_type);

create table if not exists public.luxury_presence_listing_intelligence (
  id uuid primary key default gen_random_uuid(),
  external_listing_id text unique not null,
  listing_title text,
  listing_address text,
  listing_url text,
  views_last_7_days integer not null default 0,
  favorites_last_7_days integer not null default 0,
  inquiries_last_7_days integer not null default 0,
  demand_score integer not null default 0,
  seller_intent_score integer not null default 0,
  last_activity_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists lp_webhook_events_status_idx on public.luxury_presence_webhook_events (status, received_at desc);
create index if not exists lead_activity_events_source_idx on public.lead_activity_events (source, created_at desc);
create index if not exists lead_activity_events_listing_idx on public.lead_activity_events (external_listing_id, created_at desc);
create index if not exists lead_activity_events_agent_idx on public.lead_activity_events (external_agent_id, created_at desc);
create index if not exists lp_followup_queue_priority_idx on public.luxury_presence_followup_queue (completed, priority desc, created_at desc);
create index if not exists lp_listing_intelligence_score_idx on public.luxury_presence_listing_intelligence (demand_score desc, updated_at desc);

alter table public.luxury_presence_webhook_events enable row level security;
alter table public.lead_activity_events enable row level security;
alter table public.luxury_presence_agents enable row level security;
alter table public.luxury_presence_followup_queue enable row level security;
alter table public.luxury_presence_suppression_signals enable row level security;
alter table public.luxury_presence_listing_intelligence enable row level security;

drop policy if exists "lp webhook events: admin select" on public.luxury_presence_webhook_events;
create policy "lp webhook events: admin select" on public.luxury_presence_webhook_events
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'superadmin')
    )
  );

drop policy if exists "lead activity events: admin select" on public.lead_activity_events;
create policy "lead activity events: admin select" on public.lead_activity_events
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'superadmin')
    )
  );

drop policy if exists "lp agents: admin select" on public.luxury_presence_agents;
create policy "lp agents: admin select" on public.luxury_presence_agents
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'superadmin')
    )
  );

drop policy if exists "lp followup queue: admin select" on public.luxury_presence_followup_queue;
create policy "lp followup queue: admin select" on public.luxury_presence_followup_queue
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'superadmin')
    )
  );

drop policy if exists "lp suppression signals: admin select" on public.luxury_presence_suppression_signals;
create policy "lp suppression signals: admin select" on public.luxury_presence_suppression_signals
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'superadmin')
    )
  );

drop policy if exists "lp listing intelligence: admin select" on public.luxury_presence_listing_intelligence;
create policy "lp listing intelligence: admin select" on public.luxury_presence_listing_intelligence
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'superadmin')
    )
  );
