create extension if not exists "pgcrypto";
create extension if not exists "vector";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text,
  role text not null default 'resident',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resident_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  building_id uuid,
  name text,
  email text,
  phone text,
  membership_status text not null default 'pending',
  source text not null default 'supabase',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  joined_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  organization_id uuid,
  company_name text not null,
  partner_type text not null,
  subscription_plan text,
  active boolean not null default true,
  source text not null default 'supabase',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.building_registry (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  domain text,
  address text,
  district text,
  lat numeric,
  lng numeric,
  source text not null default 'supabase',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resident_directory (
  id uuid primary key default gen_random_uuid(),
  building_id uuid references public.building_registry(id),
  email text,
  phone text,
  unit text,
  status text not null default 'active',
  source text not null default 'property_import',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.verification_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  building_id uuid references public.building_registry(id),
  provider text not null default 'twilio_verify',
  status text not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partner_profiles(id),
  slug text unique not null,
  name text not null,
  description text,
  address text,
  district text,
  lat numeric,
  lng numeric,
  website text,
  phone text,
  image_url text,
  logo_url text,
  partner_status text,
  source text not null default 'supabase',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hotels (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partner_profiles(id),
  name text not null,
  description text,
  address text,
  district text,
  lat numeric,
  lng numeric,
  website text,
  image_url text,
  logo_url text,
  partner_status text,
  source text not null default 'supabase',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partner_profiles(id),
  name text not null,
  category text,
  description text,
  address text,
  district text,
  lat numeric,
  lng numeric,
  website text,
  image_url text,
  logo_url text,
  partner_status text,
  source text not null default 'supabase',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partner_profiles(id),
  name text not null,
  description text,
  website text,
  image_url text,
  logo_url text,
  source text not null default 'supabase',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.civic_entities (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partner_profiles(id),
  name text not null,
  description text,
  address text,
  district text,
  lat numeric,
  lng numeric,
  website text,
  image_url text,
  logo_url text,
  source text not null default 'supabase',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.perks (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partner_profiles(id),
  entity_id uuid,
  entity_type text not null,
  title text not null,
  description text,
  offer_text text,
  start_date timestamptz,
  end_date timestamptz,
  active boolean not null default true,
  redemption_type text not null default 'show_card',
  source text not null default 'supabase',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partner_profiles(id),
  entity_id uuid,
  entity_type text,
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
  source text not null default 'supabase',
  status text not null default 'scheduled',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_feeds (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_occurrences (
  id uuid primary key default gen_random_uuid(),
  event_feed_id uuid references public.event_feeds(id),
  title text not null,
  start_time timestamptz,
  end_time timestamptz,
  timezone text,
  venue_name text,
  address text,
  lat numeric,
  lng numeric,
  source text not null,
  source_url text,
  image_url text,
  category text,
  price_label text,
  status text not null default 'scheduled',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_signals (
  id uuid primary key default gen_random_uuid(),
  event_id uuid,
  signal_type text not null,
  score numeric default 0,
  source text not null default 'event_ingestion',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partner_profiles(id),
  organization_id uuid,
  title text not null,
  campaign_type text not null,
  tier text not null default 'standard',
  status text not null default 'scheduled',
  start_date timestamptz,
  end_date timestamptz,
  budget numeric,
  impressions integer not null default 0,
  views integer not null default 0,
  saves integer not null default 0,
  clicks integer not null default 0,
  redemptions integer not null default 0,
  source text not null default 'supabase',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.entity_relationships (
  id uuid primary key default gen_random_uuid(),
  source_entity_id uuid,
  source_entity_type text,
  target_entity_id uuid,
  target_entity_type text,
  relationship_type text not null,
  source text not null default 'supabase',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_entities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  resident_id uuid references public.resident_profiles(id),
  entity_id uuid not null,
  entity_type text not null,
  source text not null default 'map',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resident_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  resident_id uuid references public.resident_profiles(id),
  entity_id uuid,
  entity_type text,
  activity_type text not null,
  points integer not null default 0,
  source text not null default 'map',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  resident_id uuid references public.resident_profiles(id),
  event_id uuid references public.events(id),
  status text not null default 'interested',
  source text not null default 'map',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.perk_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  resident_id uuid references public.resident_profiles(id),
  perk_id uuid references public.perks(id),
  source text not null default 'map',
  status text not null default 'redeemed',
  metadata jsonb not null default '{}'::jsonb,
  redeemed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_impressions (id uuid primary key default gen_random_uuid(), campaign_id uuid references public.campaigns(id), partner_id uuid references public.partner_profiles(id), entity_id uuid, user_id uuid references public.users(id), source text default 'map', status text default 'active', metadata jsonb default '{}'::jsonb, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists public.campaign_clicks (id uuid primary key default gen_random_uuid(), campaign_id uuid references public.campaigns(id), partner_id uuid references public.partner_profiles(id), entity_id uuid, user_id uuid references public.users(id), source text default 'map', status text default 'active', metadata jsonb default '{}'::jsonb, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists public.campaign_directions (id uuid primary key default gen_random_uuid(), campaign_id uuid references public.campaigns(id), partner_id uuid references public.partner_profiles(id), entity_id uuid, user_id uuid references public.users(id), source text default 'map', status text default 'active', metadata jsonb default '{}'::jsonb, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists public.campaign_rsvps (id uuid primary key default gen_random_uuid(), campaign_id uuid references public.campaigns(id), partner_id uuid references public.partner_profiles(id), entity_id uuid, user_id uuid references public.users(id), source text default 'map', status text default 'active', metadata jsonb default '{}'::jsonb, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists public.campaign_redemptions (id uuid primary key default gen_random_uuid(), campaign_id uuid references public.campaigns(id), partner_id uuid references public.partner_profiles(id), entity_id uuid, user_id uuid references public.users(id), source text default 'map', status text default 'active', metadata jsonb default '{}'::jsonb, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists public.campaign_conversions (id uuid primary key default gen_random_uuid(), campaign_id uuid references public.campaigns(id), partner_id uuid references public.partner_profiles(id), entity_id uuid, user_id uuid references public.users(id), conversion_type text, source text default 'map', status text default 'active', metadata jsonb default '{}'::jsonb, created_at timestamptz default now(), updated_at timestamptz default now());

create table if not exists public.pulse_signals (
  id uuid primary key default gen_random_uuid(),
  district text,
  signal_type text not null,
  signal_label text not null,
  score numeric default 0,
  source text not null default 'pulse_engine',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_sessions (id uuid primary key default gen_random_uuid(), user_id uuid references public.users(id), partner_id uuid references public.partner_profiles(id), organization_id uuid, mode text, source text default 'ask_map', status text default 'active', metadata jsonb default '{}'::jsonb, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists public.agent_conversations (id uuid primary key default gen_random_uuid(), agent_session_id uuid references public.agent_sessions(id), user_id uuid references public.users(id), partner_id uuid references public.partner_profiles(id), organization_id uuid, query text, mode text, intent text, selected_entities jsonb default '[]'::jsonb, recommendations jsonb default '[]'::jsonb, source text default 'ask_map', status text default 'active', metadata jsonb default '{}'::jsonb, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists public.agent_memory (id uuid primary key default gen_random_uuid(), user_id uuid references public.users(id), partner_id uuid references public.partner_profiles(id), organization_id uuid, memory_key text, memory_value jsonb default '{}'::jsonb, source text default 'ask_map', status text default 'active', metadata jsonb default '{}'::jsonb, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists public.agent_feedback (id uuid primary key default gen_random_uuid(), agent_conversation_id uuid references public.agent_conversations(id), user_id uuid references public.users(id), feedback_type text, source text default 'ask_map', status text default 'active', metadata jsonb default '{}'::jsonb, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists public.agent_outcomes (id uuid primary key default gen_random_uuid(), agent_conversation_id uuid references public.agent_conversations(id), user_id uuid references public.users(id), conversion_event text, source text default 'ask_map', status text default 'active', metadata jsonb default '{}'::jsonb, created_at timestamptz default now(), updated_at timestamptz default now());

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  partner_id uuid references public.partner_profiles(id),
  organization_id uuid,
  notification_type text not null,
  channel text not null,
  recipient text,
  subject text,
  body text,
  source text not null default 'notification_service',
  status text not null default 'queued',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.users(id),
  action text not null,
  target_type text,
  target_id uuid,
  source text not null default 'platform',
  status text not null default 'recorded',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace view public.map_entities as
select id, 'property'::text as entity_type, name as title, description, lat, lng, image_url, district, partner_status, status, metadata from public.properties
union all select id, 'hotel'::text, name, description, lat, lng, image_url, district, partner_status, status, metadata from public.hotels
union all select id, 'venue'::text, name, description, lat, lng, image_url, district, partner_status, status, metadata from public.venues
union all select id, 'brand'::text, name, description, null::numeric, null::numeric, image_url, null::text, null::text, status, metadata from public.brands
union all select id, 'civic'::text, name, description, lat, lng, image_url, district, null::text, status, metadata from public.civic_entities
union all select id, 'event'::text, title, description, lat, lng, image_url, district, null::text, status, metadata from public.events;

create table if not exists public.search_index (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null,
  entity_type text not null,
  title text not null,
  search_document tsvector,
  embedding vector(1536),
  source text not null default 'search_index',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_context (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid,
  entity_type text,
  summary text,
  tags text[],
  districts text[],
  embedding vector(1536),
  source text not null default 'ai_context',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resident_activity_user_idx on public.resident_activity(user_id);
create index if not exists saved_entities_user_idx on public.saved_entities(user_id);
create index if not exists campaigns_partner_idx on public.campaigns(partner_id);
create index if not exists agent_conversations_partner_idx on public.agent_conversations(partner_id);
create index if not exists pulse_signals_district_idx on public.pulse_signals(district);
create index if not exists search_index_entity_idx on public.search_index(entity_id, entity_type);

alter table public.resident_profiles enable row level security;
alter table public.partner_profiles enable row level security;
alter table public.saved_entities enable row level security;
alter table public.resident_activity enable row level security;
alter table public.campaigns enable row level security;
alter table public.agent_conversations enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "resident_profiles_self" on public.resident_profiles;
drop policy if exists "saved_entities_self" on public.saved_entities;
drop policy if exists "resident_activity_self" on public.resident_activity;
drop policy if exists "partner_profiles_self" on public.partner_profiles;
drop policy if exists "notifications_self" on public.notifications;

create policy "resident_profiles_self" on public.resident_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "saved_entities_self" on public.saved_entities for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "resident_activity_self" on public.resident_activity for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "partner_profiles_self" on public.partner_profiles for select using (auth.uid() = user_id);
create policy "notifications_self" on public.notifications for select using (auth.uid() = user_id);

alter publication supabase_realtime add table public.campaigns;
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.perks;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.pulse_signals;
