create table if not exists public.analytics_signals (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz not null default now(),
  created_at timestamptz not null default now(),
  source_type text not null,
  action_type text not null,
  value numeric not null default 1,
  session_token text,
  user_email text,
  district text,
  campaign_id uuid,
  partner_id uuid,
  venue_id uuid,
  event_id uuid,
  building_id uuid,
  entity_id uuid,
  entity_type text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists analytics_signals_timestamp_idx
  on public.analytics_signals (timestamp desc);
create index if not exists analytics_signals_created_at_idx
  on public.analytics_signals (created_at desc);
create index if not exists analytics_signals_source_action_idx
  on public.analytics_signals (source_type, action_type);
create index if not exists analytics_signals_campaign_id_idx
  on public.analytics_signals (campaign_id)
  where campaign_id is not null;
create index if not exists analytics_signals_venue_id_idx
  on public.analytics_signals (venue_id)
  where venue_id is not null;
create index if not exists analytics_signals_event_id_idx
  on public.analytics_signals (event_id)
  where event_id is not null;
create index if not exists analytics_signals_building_id_idx
  on public.analytics_signals (building_id)
  where building_id is not null;
create index if not exists analytics_signals_session_token_idx
  on public.analytics_signals (session_token)
  where session_token is not null;

alter table public.analytics_signals enable row level security;

revoke all on table public.analytics_signals from public, anon, authenticated;
grant select, insert on table public.analytics_signals to service_role;

comment on table public.analytics_signals is
  'Server-owned analytics event sink for map, resident card, route, campaign, and redemption activity.';

notify pgrst, 'reload schema';
