create table if not exists survey_responses (
  id text primary key,
  survey_id text not null,
  resident_id text not null,
  building_id text,
  unit_id text,
  partner_id text,
  perk_id text,
  redemption_id text,
  map_entity_id text,
  district text,
  category text,
  answers jsonb not null default '{}'::jsonb,
  score numeric,
  sentiment text,
  completed_at timestamptz not null default now(),
  exported_to_google_sheets boolean not null default false,
  google_sheet_row_id text,
  notification_sent boolean not null default false,
  source_flow text not null check (source_flow in ('resident-survey', 'perk-redemption', 'event-feedback', 'building-feedback'))
);

create table if not exists survey_export_logs (
  id text primary key,
  survey_response_id text not null references survey_responses(id) on delete cascade,
  destination text not null default 'google-sheets' check (destination in ('google-sheets')),
  status text not null default 'pending' check (status in ('pending', 'success', 'failed')),
  attempted_at timestamptz not null default now(),
  completed_at timestamptz,
  error_message text,
  sheet_id text,
  row_number integer
);

create table if not exists management_notifications (
  id text primary key,
  type text not null check (type in ('survey-completed', 'redemption-survey-completed')),
  resident_id text not null,
  building_id text,
  survey_response_id text not null references survey_responses(id) on delete cascade,
  redemption_id text,
  partner_id text,
  perk_id text,
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  channel text not null check (channel in ('email', 'slack', 'in-app')),
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create unique index if not exists survey_export_logs_response_destination_idx
  on survey_export_logs (survey_response_id, destination);

create index if not exists survey_responses_context_idx
  on survey_responses (building_id, partner_id, perk_id, map_entity_id, district, category, completed_at desc);

create index if not exists management_notifications_response_idx
  on management_notifications (survey_response_id, status, created_at desc);
