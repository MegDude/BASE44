-- Extend the canonical governance_* model with a resident Civic Inbox,
-- atomic response capture, normalized source provenance, and realtime delivery.
-- This migration intentionally does not create parallel civic action or organization records.

alter table public.governance_consultations add column if not exists action_type text not null default 'survey'
  check (action_type in ('quick_question','survey','consultation'));
alter table public.governance_consultations add column if not exists geography jsonb not null default '{}'::jsonb;
alter table public.governance_consultations add column if not exists audience_rules jsonb not null default '{}'::jsonb;
alter table public.governance_consultations add column if not exists source_ids uuid[] not null default '{}';

create table if not exists public.resident_civic_inbox (
  id uuid primary key default gen_random_uuid(),
  resident_profile_id uuid not null references public.resident_profiles(id) on delete cascade,
  consultation_id uuid not null references public.governance_consultations(id) on delete cascade,
  delivered_at timestamptz not null default now(),
  opened_at timestamptz,
  acted_at timestamptz,
  dismissed_at timestamptz,
  delivery_channels text[] not null default array['in_app']::text[],
  unique (resident_profile_id, consultation_id)
);

create table if not exists public.civic_action_followups (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.governance_consultations(id) on delete cascade,
  organization_id uuid not null references public.partner_organizations(id) on delete cascade,
  title text not null check (char_length(title) between 5 and 140),
  summary text not null check (char_length(summary) between 12 and 1200),
  publication_status text not null default 'draft' check (publication_status in ('draft','review','published','archived')),
  published_at timestamptz,
  created_by_partner_user_id uuid references public.partner_users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.partner_intelligence_sources add column if not exists authority text;
alter table public.partner_intelligence_sources add column if not exists external_record_type text;
alter table public.partner_intelligence_records add column if not exists external_record_id text;
alter table public.partner_intelligence_records add column if not exists raw_payload jsonb not null default '{}'::jsonb;
alter table public.partner_intelligence_records add column if not exists normalized_payload jsonb not null default '{}'::jsonb;
alter table public.partner_intelligence_records add column if not exists retrieved_at timestamptz not null default now();
alter table public.partner_intelligence_records add column if not exists effective_at timestamptz;
alter table public.partner_intelligence_records add column if not exists geography jsonb not null default '{}'::jsonb;
alter table public.partner_intelligence_records add column if not exists review_status text not null default 'unreviewed';
alter table public.partner_intelligence_records add column if not exists affected_building_ids uuid[] not null default '{}';
alter table public.partner_intelligence_records add column if not exists affected_listing_ids uuid[] not null default '{}';
alter table public.partner_intelligence_records add column if not exists expires_at timestamptz;

create table if not exists public.civic_signals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.partner_organizations(id) on delete cascade,
  source_record_id uuid references public.partner_intelligence_records(id) on delete set null,
  signal_type text not null,
  summary text not null,
  geography jsonb not null default '{}'::jsonb,
  confidence numeric(5,4) check (confidence between 0 and 1),
  review_status text not null default 'unreviewed' check (review_status in ('unreviewed','verified','rejected','expired')),
  effective_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists governance_response_resident_unique_idx
  on public.governance_consultation_responses(consultation_id,resident_profile_id);
create unique index if not exists governance_response_idempotency_unique_idx
  on public.governance_consultation_responses(idempotency_key);
create index if not exists resident_civic_inbox_resident_time_idx
  on public.resident_civic_inbox(resident_profile_id,delivered_at desc);
create index if not exists resident_civic_inbox_consultation_idx
  on public.resident_civic_inbox(consultation_id,acted_at);
create index if not exists civic_signal_org_time_idx on public.civic_signals(organization_id,created_at desc);

create or replace function public.submit_resident_civic_response(
  p_resident_profile_id uuid,
  p_consultation_id uuid,
  p_answers jsonb,
  p_idempotency_key text,
  p_source_route text default null
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_consultation public.governance_consultations%rowtype;
  v_response public.governance_consultation_responses%rowtype;
begin
  select * into v_consultation
  from public.governance_consultations
  where id=p_consultation_id
    and publication_status='published'
    and (opens_at is null or opens_at<=now())
    and (closes_at is null or closes_at>=now())
  for update;
  if v_consultation.id is null then raise exception 'civic_action_unavailable'; end if;

  select * into v_response
  from public.governance_consultation_responses
  where idempotency_key=p_idempotency_key
     or (consultation_id=p_consultation_id and resident_profile_id=p_resident_profile_id)
  limit 1;
  if v_response.id is not null then
    return jsonb_build_object('response_id',v_response.id,'consultation_id',p_consultation_id,'duplicate',true);
  end if;

  insert into public.governance_consultation_responses(consultation_id,resident_profile_id,answers,idempotency_key)
  values(p_consultation_id,p_resident_profile_id,coalesce(p_answers,'{}'::jsonb),p_idempotency_key)
  returning * into v_response;

  update public.resident_civic_inbox
  set opened_at=coalesce(opened_at,now()),acted_at=now()
  where resident_profile_id=p_resident_profile_id and consultation_id=p_consultation_id;

  insert into public.user_activity_events(resident_profile_id,entity_type,entity_id,event_type,idempotency_key,source_surface,source_route,metadata)
  values(p_resident_profile_id,'governance_consultation',p_consultation_id::text,'civic_survey_completed',p_idempotency_key||':event','resident_civic',p_source_route,jsonb_build_object('responseId',v_response.id));

  return jsonb_build_object('response_id',v_response.id,'consultation_id',p_consultation_id,'duplicate',false);
end;
$$;

alter table public.resident_civic_inbox enable row level security;
alter table public.civic_action_followups enable row level security;
alter table public.civic_signals enable row level security;

create policy resident_reads_own_civic_inbox on public.resident_civic_inbox for select to authenticated
  using (resident_profile_id in (select id from public.resident_profiles where auth_user_id=(select auth.uid())));
create policy civic_members_read_inbox_results on public.resident_civic_inbox for select to authenticated
  using (consultation_id in (
    select gc.id from public.governance_consultations gc
    join public.partner_organizations po on po.id=gc.organization_id
    join public.partner_users pu on pu.partner_id=po.legacy_partner_id
    where pu.auth_user_id=(select auth.uid()) and pu.active=true
  ));
create policy public_reads_published_civic_followups on public.civic_action_followups for select to anon,authenticated
  using (publication_status='published' and published_at is not null);
create policy civic_members_read_signals on public.civic_signals for select to authenticated
  using (organization_id in (
    select po.id from public.partner_organizations po
    join public.partner_users pu on pu.partner_id=po.legacy_partner_id
    where pu.auth_user_id=(select auth.uid()) and pu.active=true
  ));

revoke all on public.resident_civic_inbox,public.civic_action_followups,public.civic_signals from anon,authenticated;
grant select on public.civic_action_followups to anon,authenticated;
grant select on public.resident_civic_inbox,public.civic_signals to authenticated;
grant all on public.resident_civic_inbox,public.civic_action_followups,public.civic_signals to service_role;
revoke all on function public.submit_resident_civic_response(uuid,uuid,jsonb,text,text) from public,anon,authenticated;
grant execute on function public.submit_resident_civic_response(uuid,uuid,jsonb,text,text) to service_role;

do $$ begin
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='resident_civic_inbox') then
    alter publication supabase_realtime add table public.resident_civic_inbox;
  end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='governance_consultation_responses') then
    alter publication supabase_realtime add table public.governance_consultation_responses;
  end if;
end $$;
