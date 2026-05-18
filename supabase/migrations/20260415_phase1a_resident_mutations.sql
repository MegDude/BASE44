create table if not exists public.resident_saved_items (
  resident_id text not null,
  entity_id text not null,
  entity_type text not null,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (resident_id, entity_id)
);

create table if not exists public.resident_rsvps (
  resident_id text not null,
  entity_id text not null,
  entity_type text not null default 'event',
  status text not null default 'going',
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (resident_id, entity_id)
);

create table if not exists public.resident_perk_redemptions (
  id uuid primary key default gen_random_uuid(),
  resident_id text not null,
  entity_id text not null,
  entity_type text not null,
  venue_id text,
  title text,
  redemption_code text not null,
  status text not null default 'issued',
  created_at timestamptz not null default now()
);
