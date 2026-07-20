-- Downtown Perks saved activity, short-lived QR redemption, and partner insight ledger.
-- All privileged writes are server-only. Client access is limited by RLS.

create extension if not exists pgcrypto;

-- This project has historical environments where the Phase 1A catalog migration
-- was not applied. Define the two transaction parents without replacing an
-- existing catalog so this migration remains safe in both environments.
create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null default 'hospitality',
  description text,
  image_url text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.perks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  venue_id uuid,
  venue_name text,
  category text,
  value text,
  terms text,
  valid_from timestamptz,
  valid_until timestamptz,
  is_featured boolean not null default false,
  redemption_count integer not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  create type public.dp_activity_event_type as enum (
    'entity_viewed', 'entity_saved', 'entity_unsaved', 'perk_opened',
    'qr_displayed', 'qr_scanned', 'redemption_started',
    'redemption_completed', 'redemption_rejected', 'directions_opened',
    'event_added_to_calendar', 'route_started', 'search_submitted'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.dp_redemption_status as enum (
    'pending', 'validated', 'completed', 'rejected', 'reversed', 'expired'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.dp_discount_type as enum (
    'percentage', 'fixed_amount', 'complimentary_item', 'custom'
  );
exception when duplicate_object then null;
end $$;

alter table public.partners add column if not exists timezone text not null default 'America/Chicago';
alter table public.perks add column if not exists partner_id uuid references public.partners(id) on delete restrict;
alter table public.perks add column if not exists external_id text;
alter table public.perks add column if not exists location_id uuid;
alter table public.perks add column if not exists discount_type public.dp_discount_type;
alter table public.perks add column if not exists discount_value numeric(12,2);
alter table public.perks add column if not exists currency text not null default 'USD';
alter table public.perks add column if not exists complimentary_item text;
alter table public.perks add column if not exists usage_limit_total integer;
alter table public.perks add column if not exists usage_limit_per_resident integer not null default 1;
alter table public.perks add column if not exists redemption_window_seconds integer not null default 300;
alter table public.perks add column if not exists requires_staff_confirmation boolean not null default true;
create unique index if not exists perks_external_id_unique_idx on public.perks (external_id) where external_id is not null;

create table if not exists public.resident_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  building_id uuid,
  first_name text,
  last_name text,
  email text,
  phone text,
  resident_status text not null default 'active',
  consent_personalization boolean not null default true,
  consent_partner_contact boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_users (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'manager', 'staff', 'analyst')),
  location_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (partner_id, auth_user_id)
);

create table if not exists public.resident_saved_entities (
  id uuid primary key default gen_random_uuid(),
  resident_profile_id uuid not null references public.resident_profiles(id) on delete cascade,
  entity_type text not null,
  entity_id text not null,
  saved_at timestamptz not null default now(),
  source_surface text,
  source_context jsonb not null default '{}'::jsonb,
  unique (resident_profile_id, entity_type, entity_id)
);

create table if not exists public.user_activity_events (
  id uuid primary key default gen_random_uuid(),
  resident_profile_id uuid references public.resident_profiles(id) on delete set null,
  auth_user_id uuid references auth.users(id) on delete set null,
  partner_id uuid references public.partners(id) on delete set null,
  entity_type text,
  entity_id text,
  perk_id uuid references public.perks(id) on delete set null,
  event_type public.dp_activity_event_type not null,
  session_id uuid,
  source_surface text,
  source_route text,
  district text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table if not exists public.resident_qr_sessions (
  id uuid primary key default gen_random_uuid(),
  resident_profile_id uuid not null references public.resident_profiles(id) on delete cascade,
  perk_id uuid references public.perks(id) on delete cascade,
  token_hash text not null unique,
  purpose text not null check (purpose in ('resident_pass', 'perk_redemption', 'check_in')),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.perk_redemptions (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  perk_id uuid not null references public.perks(id) on delete restrict,
  partner_id uuid not null references public.partners(id) on delete restrict,
  location_id uuid,
  resident_profile_id uuid not null references public.resident_profiles(id) on delete restrict,
  qr_session_id uuid references public.resident_qr_sessions(id) on delete restrict,
  scanned_by_partner_user_id uuid references public.partner_users(id) on delete set null,
  status public.dp_redemption_status not null default 'pending',
  discount_type public.dp_discount_type not null,
  discount_value numeric(12,2),
  currency text,
  complimentary_item text,
  original_amount numeric(12,2),
  discount_amount numeric(12,2),
  final_amount numeric(12,2),
  validation_code text,
  rejection_reason text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  reversed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.resident_preference_features (
  resident_profile_id uuid primary key references public.resident_profiles(id) on delete cascade,
  category_scores jsonb not null default '{}'::jsonb,
  district_scores jsonb not null default '{}'::jsonb,
  time_of_day_scores jsonb not null default '{}'::jsonb,
  price_preference jsonb not null default '{}'::jsonb,
  interaction_counts jsonb not null default '{}'::jsonb,
  last_processed_event_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_audit_events (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete restrict,
  partner_user_id uuid references public.partner_users(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  before_state jsonb,
  after_state jsonb,
  ip_hash text,
  user_agent text,
  occurred_at timestamptz not null default now()
);

create index if not exists resident_saved_entities_resident_idx on public.resident_saved_entities (resident_profile_id, saved_at desc);
create index if not exists activity_resident_time_idx on public.user_activity_events (resident_profile_id, occurred_at desc);
create index if not exists activity_partner_time_idx on public.user_activity_events (partner_id, occurred_at desc);
create index if not exists activity_perk_time_idx on public.user_activity_events (perk_id, occurred_at desc);
create index if not exists qr_sessions_active_token_idx on public.resident_qr_sessions (token_hash, expires_at) where consumed_at is null and revoked_at is null;
create index if not exists redemption_partner_time_idx on public.perk_redemptions (partner_id, started_at desc);
create index if not exists redemption_resident_time_idx on public.perk_redemptions (resident_profile_id, started_at desc);
create index if not exists redemption_perk_time_idx on public.perk_redemptions (perk_id, started_at desc);
create index if not exists redemption_partner_status_idx on public.perk_redemptions (partner_id, status, started_at desc);

create or replace function public.set_resident_saved_entity(
  p_resident_profile_id uuid,
  p_entity_type text,
  p_entity_id text,
  p_saved boolean,
  p_source_surface text default null,
  p_source_context jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_event_type public.dp_activity_event_type;
  v_saved_count integer;
  v_now timestamptz := now();
begin
  if p_saved then
    insert into public.resident_saved_entities (
      resident_profile_id, entity_type, entity_id, source_surface, source_context
    ) values (
      p_resident_profile_id, p_entity_type, p_entity_id, p_source_surface, coalesce(p_source_context, '{}'::jsonb)
    ) on conflict (resident_profile_id, entity_type, entity_id) do update set
      saved_at = excluded.saved_at,
      source_surface = excluded.source_surface,
      source_context = excluded.source_context;
    v_event_type := 'entity_saved';
  else
    delete from public.resident_saved_entities
    where resident_profile_id = p_resident_profile_id
      and entity_type = p_entity_type
      and entity_id = p_entity_id;
    v_event_type := 'entity_unsaved';
  end if;

  insert into public.user_activity_events (
    resident_profile_id, auth_user_id, entity_type, entity_id,
    event_type, source_surface, metadata, occurred_at
  )
  select p_resident_profile_id, rp.auth_user_id, p_entity_type, p_entity_id,
    v_event_type, p_source_surface,
    jsonb_build_object('sourceContext', coalesce(p_source_context, '{}'::jsonb)), v_now
  from public.resident_profiles rp where rp.id = p_resident_profile_id;

  select count(*) into v_saved_count from public.resident_saved_entities
  where resident_profile_id = p_resident_profile_id;

  return jsonb_build_object('saved_count', v_saved_count, 'occurred_at', v_now);
end;
$$;

create or replace function public.validate_partner_redemption(
  p_partner_user_id uuid,
  p_token_hash text,
  p_location_id uuid,
  p_idempotency_key text
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_partner_user public.partner_users%rowtype;
  v_qr public.resident_qr_sessions%rowtype;
  v_perk public.perks%rowtype;
  v_existing public.perk_redemptions%rowtype;
  v_usage_count integer;
  v_total_usage_count integer;
  v_redemption_id uuid;
  v_window_seconds integer;
begin
  select * into v_partner_user from public.partner_users where id = p_partner_user_id;
  if v_partner_user.id is null then raise exception 'PARTNER_USER_NOT_FOUND'; end if;

  select * into v_existing from public.perk_redemptions where idempotency_key = p_idempotency_key;
  if v_existing.id is not null then
    return jsonb_build_object('redemption_id', v_existing.id, 'status', v_existing.status, 'idempotent_replay', true);
  end if;

  select * into v_qr from public.resident_qr_sessions
  where token_hash = p_token_hash and revoked_at is null and consumed_at is null and expires_at > now()
  for update;
  if v_qr.id is null then raise exception 'QR_INVALID_OR_EXPIRED'; end if;
  if v_qr.perk_id is null then raise exception 'PERK_REQUIRED'; end if;

  select * into v_perk from public.perks
  where id = v_qr.perk_id
    and partner_id = v_partner_user.partner_id
    and status = 'active'
    and (valid_from is null or valid_from <= now())
    and (valid_until is null or valid_until >= now());
  if v_perk.id is null then raise exception 'PERK_NOT_APPLICABLE'; end if;
  if p_location_id is not null and v_perk.location_id is not null and p_location_id <> v_perk.location_id then
    raise exception 'PERK_NOT_APPLICABLE';
  end if;

  select count(*) into v_usage_count from public.perk_redemptions
  where perk_id = v_perk.id and resident_profile_id = v_qr.resident_profile_id and status = 'completed';
  if v_perk.usage_limit_per_resident is not null and v_usage_count >= v_perk.usage_limit_per_resident then
    raise exception 'USAGE_LIMIT_REACHED';
  end if;
  select count(*) into v_total_usage_count from public.perk_redemptions
  where perk_id = v_perk.id and status = 'completed';
  if v_perk.usage_limit_total is not null and v_total_usage_count >= v_perk.usage_limit_total then
    raise exception 'PERK_LIMIT_REACHED';
  end if;

  v_window_seconds := greatest(60, least(900, coalesce(v_perk.redemption_window_seconds, 300)));
  insert into public.perk_redemptions (
    idempotency_key, perk_id, partner_id, location_id, resident_profile_id,
    qr_session_id, scanned_by_partner_user_id, status, discount_type,
    discount_value, currency, complimentary_item, validation_code, metadata
  ) values (
    p_idempotency_key, v_perk.id, v_perk.partner_id, p_location_id,
    v_qr.resident_profile_id, v_qr.id, p_partner_user_id, 'validated',
    coalesce(v_perk.discount_type, 'custom'::public.dp_discount_type),
    v_perk.discount_value, v_perk.currency, v_perk.complimentary_item,
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
    jsonb_build_object('validatedExpiresAt', now() + make_interval(secs => v_window_seconds))
  ) returning id into v_redemption_id;

  insert into public.user_activity_events (
    resident_profile_id, partner_id, perk_id, entity_type, entity_id,
    event_type, source_surface, metadata
  ) values (
    v_qr.resident_profile_id, v_perk.partner_id, v_perk.id, 'perk', v_perk.id::text,
    'qr_scanned', 'partner_scanner',
    jsonb_build_object('redemptionId', v_redemption_id, 'locationId', p_location_id)
  );

  insert into public.partner_audit_events (
    partner_id, partner_user_id, action, resource_type, resource_id, after_state
  ) values (
    v_perk.partner_id, p_partner_user_id, 'redemption_validated', 'perk_redemption',
    v_redemption_id, jsonb_build_object('status', 'validated')
  );

  return jsonb_build_object(
    'redemption_id', v_redemption_id, 'status', 'validated', 'perk_id', v_perk.id,
    'resident_profile_id', v_qr.resident_profile_id,
    'discount_type', coalesce(v_perk.discount_type, 'custom'::public.dp_discount_type),
    'discount_value', v_perk.discount_value, 'currency', v_perk.currency,
    'complimentary_item', v_perk.complimentary_item,
    'expires_at', now() + make_interval(secs => v_window_seconds)
  );
end;
$$;

create or replace function public.complete_partner_redemption(
  p_partner_user_id uuid,
  p_redemption_id uuid,
  p_idempotency_key text,
  p_original_amount numeric default null
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_partner_user public.partner_users%rowtype;
  v_redemption public.perk_redemptions%rowtype;
  v_discount numeric(12,2);
  v_final numeric(12,2);
begin
  select * into v_partner_user from public.partner_users where id = p_partner_user_id;
  if v_partner_user.id is null then raise exception 'PARTNER_USER_NOT_FOUND'; end if;

  select * into v_redemption from public.perk_redemptions
  where id = p_redemption_id and partner_id = v_partner_user.partner_id for update;
  if v_redemption.id is null then raise exception 'REDEMPTION_NOT_FOUND'; end if;
  if v_redemption.status = 'completed' then
    return jsonb_build_object('redemption_id', v_redemption.id, 'status', 'completed', 'idempotent_replay', true,
      'original_amount', v_redemption.original_amount, 'discount_amount', v_redemption.discount_amount, 'final_amount', v_redemption.final_amount);
  end if;
  if v_redemption.status <> 'validated' then raise exception 'REDEMPTION_NOT_VALIDATED'; end if;
  if nullif(v_redemption.metadata->>'validatedExpiresAt', '')::timestamptz <= now() then
    raise exception 'REDEMPTION_EXPIRED';
  end if;
  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 8 then raise exception 'IDEMPOTENCY_KEY_REQUIRED'; end if;

  if v_redemption.discount_type = 'percentage' then
    if p_original_amount is null or p_original_amount < 0 then raise exception 'ORIGINAL_AMOUNT_REQUIRED'; end if;
    v_discount := round(p_original_amount * least(100, greatest(0, coalesce(v_redemption.discount_value, 0))) / 100, 2);
    v_final := round(greatest(0, p_original_amount - v_discount), 2);
  elsif v_redemption.discount_type = 'fixed_amount' then
    if p_original_amount is null or p_original_amount < 0 then raise exception 'ORIGINAL_AMOUNT_REQUIRED'; end if;
    v_discount := least(p_original_amount, greatest(0, coalesce(v_redemption.discount_value, 0)));
    v_final := round(greatest(0, p_original_amount - v_discount), 2);
  else
    v_discount := null;
    v_final := p_original_amount;
  end if;

  update public.perk_redemptions set
    status = 'completed', original_amount = p_original_amount,
    discount_amount = v_discount, final_amount = v_final,
    completed_at = now(), metadata = metadata || jsonb_build_object('completionIdempotencyKey', p_idempotency_key)
  where id = v_redemption.id;

  update public.resident_qr_sessions set consumed_at = now()
  where id = v_redemption.qr_session_id and consumed_at is null;

  insert into public.user_activity_events (
    resident_profile_id, partner_id, perk_id, entity_type, entity_id,
    event_type, source_surface, metadata
  ) values (
    v_redemption.resident_profile_id, v_redemption.partner_id, v_redemption.perk_id,
    'perk', v_redemption.perk_id::text, 'redemption_completed', 'partner_scanner',
    jsonb_build_object('redemptionId', v_redemption.id, 'discountAmount', v_discount, 'finalAmount', v_final)
  );

  insert into public.partner_audit_events (
    partner_id, partner_user_id, action, resource_type, resource_id, before_state, after_state
  ) values (
    v_redemption.partner_id, p_partner_user_id, 'redemption_completed', 'perk_redemption',
    v_redemption.id, jsonb_build_object('status', 'validated'), jsonb_build_object('status', 'completed')
  );

  return jsonb_build_object('redemption_id', v_redemption.id, 'status', 'completed',
    'original_amount', p_original_amount, 'discount_amount', v_discount, 'final_amount', v_final);
end;
$$;

create or replace function public.reject_partner_redemption(
  p_partner_user_id uuid,
  p_redemption_id uuid,
  p_reason text
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_partner_user public.partner_users%rowtype;
  v_redemption public.perk_redemptions%rowtype;
begin
  select * into v_partner_user from public.partner_users where id = p_partner_user_id;
  if v_partner_user.id is null then raise exception 'PARTNER_USER_NOT_FOUND'; end if;
  select * into v_redemption from public.perk_redemptions
  where id = p_redemption_id and partner_id = v_partner_user.partner_id for update;
  if v_redemption.id is null then raise exception 'REDEMPTION_NOT_FOUND'; end if;
  if v_redemption.status = 'rejected' then
    return jsonb_build_object('redemption_id', v_redemption.id, 'status', 'rejected', 'idempotent_replay', true);
  end if;
  if v_redemption.status <> 'validated' then raise exception 'REDEMPTION_NOT_VALIDATED'; end if;

  update public.perk_redemptions set status = 'rejected', rejection_reason = left(coalesce(nullif(trim(p_reason), ''), 'Not completed by staff'), 240)
  where id = v_redemption.id;
  update public.resident_qr_sessions set consumed_at = now()
  where id = v_redemption.qr_session_id and consumed_at is null;
  insert into public.user_activity_events (
    resident_profile_id, partner_id, perk_id, entity_type, entity_id,
    event_type, source_surface, metadata
  ) values (
    v_redemption.resident_profile_id, v_redemption.partner_id, v_redemption.perk_id,
    'perk', v_redemption.perk_id::text, 'redemption_rejected', 'partner_scanner',
    jsonb_build_object('redemptionId', v_redemption.id)
  );
  insert into public.partner_audit_events (
    partner_id, partner_user_id, action, resource_type, resource_id, before_state, after_state
  ) values (
    v_redemption.partner_id, p_partner_user_id, 'redemption_rejected', 'perk_redemption',
    v_redemption.id, jsonb_build_object('status', 'validated'), jsonb_build_object('status', 'rejected')
  );
  return jsonb_build_object('redemption_id', v_redemption.id, 'status', 'rejected');
end;
$$;

alter table public.resident_profiles enable row level security;
alter table public.partners enable row level security;
alter table public.perks enable row level security;
alter table public.partner_users enable row level security;
alter table public.resident_saved_entities enable row level security;
alter table public.user_activity_events enable row level security;
alter table public.resident_qr_sessions enable row level security;
alter table public.perk_redemptions enable row level security;
alter table public.resident_preference_features enable row level security;
alter table public.partner_audit_events enable row level security;

drop policy if exists public_reads_active_partners on public.partners;
create policy public_reads_active_partners on public.partners for select to anon, authenticated
using (status = 'active');
drop policy if exists public_reads_active_perks on public.perks;
create policy public_reads_active_perks on public.perks for select to anon, authenticated
using (status = 'active' and (valid_from is null or valid_from <= now()) and (valid_until is null or valid_until >= now()));

drop policy if exists resident_reads_own_profile on public.resident_profiles;
create policy resident_reads_own_profile on public.resident_profiles for select to authenticated
using ((select auth.uid()) = auth_user_id);
drop policy if exists resident_updates_own_profile on public.resident_profiles;
create policy resident_updates_own_profile on public.resident_profiles for update to authenticated
using ((select auth.uid()) = auth_user_id) with check ((select auth.uid()) = auth_user_id);

drop policy if exists partner_reads_own_membership on public.partner_users;
create policy partner_reads_own_membership on public.partner_users for select to authenticated
using ((select auth.uid()) = auth_user_id);

drop policy if exists resident_reads_own_saved on public.resident_saved_entities;
create policy resident_reads_own_saved on public.resident_saved_entities for select to authenticated
using (resident_profile_id in (select rp.id from public.resident_profiles rp where rp.auth_user_id = (select auth.uid())));

drop policy if exists resident_reads_own_activity on public.user_activity_events;
create policy resident_reads_own_activity on public.user_activity_events for select to authenticated
using (resident_profile_id in (select rp.id from public.resident_profiles rp where rp.auth_user_id = (select auth.uid())));

drop policy if exists resident_reads_own_qr_sessions on public.resident_qr_sessions;
create policy resident_reads_own_qr_sessions on public.resident_qr_sessions for select to authenticated
using (resident_profile_id in (select rp.id from public.resident_profiles rp where rp.auth_user_id = (select auth.uid())));

drop policy if exists resident_reads_own_redemptions on public.perk_redemptions;
create policy resident_reads_own_redemptions on public.perk_redemptions for select to authenticated
using (resident_profile_id in (select rp.id from public.resident_profiles rp where rp.auth_user_id = (select auth.uid())));
drop policy if exists partner_reads_own_redemptions on public.perk_redemptions;
create policy partner_reads_own_redemptions on public.perk_redemptions for select to authenticated
using (partner_id in (select pu.partner_id from public.partner_users pu where pu.auth_user_id = (select auth.uid())));

drop policy if exists resident_reads_own_preferences on public.resident_preference_features;
create policy resident_reads_own_preferences on public.resident_preference_features for select to authenticated
using (resident_profile_id in (select rp.id from public.resident_profiles rp where rp.auth_user_id = (select auth.uid())));

drop policy if exists partner_reads_own_audit on public.partner_audit_events;
create policy partner_reads_own_audit on public.partner_audit_events for select to authenticated
using (partner_id in (select pu.partner_id from public.partner_users pu where pu.auth_user_id = (select auth.uid())));

revoke all on public.resident_profiles, public.partner_users, public.resident_saved_entities,
  public.user_activity_events, public.resident_qr_sessions, public.perk_redemptions,
  public.resident_preference_features, public.partner_audit_events from anon;
revoke all on public.partners, public.perks from anon, authenticated;
grant select on public.partners, public.perks to anon, authenticated;
grant select, update on public.resident_profiles to authenticated;
grant select on public.partner_users, public.resident_saved_entities, public.user_activity_events,
  public.resident_qr_sessions, public.perk_redemptions, public.resident_preference_features,
  public.partner_audit_events to authenticated;
grant all on public.resident_profiles, public.partner_users, public.resident_saved_entities,
  public.user_activity_events, public.resident_qr_sessions, public.perk_redemptions,
  public.resident_preference_features, public.partner_audit_events to service_role;
grant all on public.partners, public.perks to service_role;
revoke all on function public.set_resident_saved_entity(uuid, text, text, boolean, text, jsonb) from public, anon, authenticated;
revoke all on function public.validate_partner_redemption(uuid, text, uuid, text) from public, anon, authenticated;
revoke all on function public.complete_partner_redemption(uuid, uuid, text, numeric) from public, anon, authenticated;
revoke all on function public.reject_partner_redemption(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.set_resident_saved_entity(uuid, text, text, boolean, text, jsonb) to service_role;
grant execute on function public.validate_partner_redemption(uuid, text, uuid, text) to service_role;
grant execute on function public.complete_partner_redemption(uuid, uuid, text, numeric) to service_role;
grant execute on function public.reject_partner_redemption(uuid, uuid, text) to service_role;

create materialized view if not exists public.partner_redemption_daily as
select partner_id, date_trunc('day', started_at) as activity_day,
  count(*) filter (where status = 'completed') as completed_redemptions,
  count(*) filter (where status = 'rejected') as rejected_redemptions,
  count(distinct resident_profile_id) filter (where status = 'completed') as unique_residents,
  coalesce(sum(discount_amount) filter (where status = 'completed'), 0) as discount_value,
  coalesce(sum(original_amount) filter (where status = 'completed'), 0) as original_value,
  coalesce(sum(final_amount) filter (where status = 'completed'), 0) as final_value
from public.perk_redemptions group by partner_id, date_trunc('day', started_at)
with no data;
create unique index if not exists partner_redemption_daily_unique_idx on public.partner_redemption_daily (partner_id, activity_day);
revoke all on public.partner_redemption_daily from public, anon, authenticated;
grant select on public.partner_redemption_daily to service_role;

create materialized view if not exists public.partner_audience_insights as
with completed as (
  select r.partner_id, r.resident_profile_id, rp.building_id,
    extract(dow from r.completed_at)::int as day_of_week,
    extract(hour from r.completed_at)::int as hour_of_day,
    count(*) over (partition by r.partner_id, r.resident_profile_id) as resident_redemption_count
  from public.perk_redemptions r join public.resident_profiles rp on rp.id = r.resident_profile_id
  where r.status = 'completed'
)
select partner_id, day_of_week, hour_of_day, count(*) as redemptions,
  count(distinct resident_profile_id) as unique_residents,
  count(*) filter (where resident_redemption_count > 1) as repeat_redemptions
from completed group by partner_id, day_of_week, hour_of_day
having count(distinct resident_profile_id) >= 10
with no data;
create unique index if not exists partner_audience_insights_unique_idx on public.partner_audience_insights (partner_id, day_of_week, hour_of_day);
revoke all on public.partner_audience_insights from public, anon, authenticated;
grant select on public.partner_audience_insights to service_role;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'resident_saved_entities'
  ) then alter publication supabase_realtime add table public.resident_saved_entities; end if;
  if not exists (
    select 1 from pg_publication_tables where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'perk_redemptions'
  ) then alter publication supabase_realtime add table public.perk_redemptions; end if;
end $$;
