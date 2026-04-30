create table if not exists public.shared_map_items (
  id uuid primary key default gen_random_uuid(),
  entity_id text not null,
  entity_type text not null,
  title text not null,
  subtitle text,
  description text,
  district text,
  category text,
  latitude double precision not null,
  longitude double precision not null,
  status text default 'active',
  image text,
  icon text,
  source_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shared_map_items_entity_idx
  on public.shared_map_items (entity_type, entity_id);

create index if not exists shared_map_items_filters_idx
  on public.shared_map_items (district, category, status);

create table if not exists public.resident_interactions (
  id uuid primary key default gen_random_uuid(),
  resident_id text not null,
  entity_id text,
  entity_type text,
  action text not null,
  query text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists resident_interactions_resident_idx
  on public.resident_interactions (resident_id, created_at desc);
