-- Aggregate-only partner audience contract. No personal contact data is exposed to the workspace.
create table if not exists public.partner_audience_lead_events (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  source text not null,
  action_type text not null,
  entity_id text,
  campaign_id uuid,
  status text not null default 'new' check (status in ('new', 'qualified', 'contacted', 'converted', 'closed', 'archived')),
  source_context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists partner_audience_lead_events_partner_created_idx
  on public.partner_audience_lead_events (partner_id, created_at desc);

alter table public.partner_audience_lead_events enable row level security;
revoke all on public.partner_audience_lead_events from public, anon, authenticated;
grant select, insert, update on public.partner_audience_lead_events to service_role;
notify pgrst, 'reload schema';
