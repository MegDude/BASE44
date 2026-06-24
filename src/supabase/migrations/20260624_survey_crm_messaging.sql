create table if not exists resident_messaging_journeys (
  id text primary key,
  resident_id text not null,
  building_id text,
  phone text,
  journey_type text not null check (journey_type in ('resident-onboarding', 'event-reminder', 'passport-progress', 'perk-redemption-follow-up', 'partner-intelligence')),
  status text not null default 'pending' check (status in ('pending', 'active', 'completed', 'failed', 'paused')),
  current_step text,
  survey_response_id text references survey_responses(id) on delete set null,
  redemption_id text,
  campaign_id text,
  event_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists resident_message_events (
  id text primary key,
  journey_id text references resident_messaging_journeys(id) on delete cascade,
  resident_id text,
  channel text not null default 'sms' check (channel in ('sms', 'email', 'in-app')),
  provider text not null default 'twilio',
  provider_message_id text,
  status text not null default 'pending' check (status in ('pending', 'sent', 'delivered', 'failed', 'skipped', 'pending_configuration')),
  body text,
  error_message text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create table if not exists partner_crm_leads (
  id text primary key,
  source text not null default 'survey',
  resident_id text,
  resident_name text,
  resident_email text,
  resident_phone text,
  building_id text,
  partner_id text,
  perk_id text,
  campaign_id text,
  survey_response_id text references survey_responses(id) on delete set null,
  score numeric,
  sentiment text,
  status text not null default 'new' check (status in ('new', 'qualified', 'contacted', 'converted', 'closed', 'archived')),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists survey_ai_summaries (
  id text primary key,
  survey_response_id text references survey_responses(id) on delete cascade,
  resident_id text,
  partner_id text,
  building_id text,
  summary text not null,
  sentiment text,
  recommended_action text,
  model text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists resident_messaging_journeys_context_idx
  on resident_messaging_journeys (resident_id, building_id, journey_type, status, created_at desc);

create index if not exists resident_message_events_journey_idx
  on resident_message_events (journey_id, status, created_at desc);

create index if not exists partner_crm_leads_context_idx
  on partner_crm_leads (partner_id, building_id, status, created_at desc);

create index if not exists survey_ai_summaries_context_idx
  on survey_ai_summaries (survey_response_id, partner_id, building_id, created_at desc);
