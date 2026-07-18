alter table public.analytics_signals
  add column if not exists timestamp timestamptz not null default now(),
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists source_type text,
  add column if not exists action_type text,
  add column if not exists value numeric not null default 1,
  add column if not exists session_token text,
  add column if not exists user_email text,
  add column if not exists district text,
  add column if not exists campaign_id uuid,
  add column if not exists partner_id uuid,
  add column if not exists venue_id uuid,
  add column if not exists event_id uuid,
  add column if not exists building_id uuid,
  add column if not exists entity_id uuid,
  add column if not exists entity_type text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.analytics_signals
  drop constraint if exists analytics_signals_source_type_check,
  drop constraint if exists analytics_signals_action_type_check;

alter table public.analytics_signals
  alter column source_type set not null,
  alter column action_type set not null;

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

notify pgrst, 'reload schema';
