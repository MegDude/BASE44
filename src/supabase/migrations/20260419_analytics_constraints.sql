-- Analytics integrity and deduplication constraints

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'entity_type_enum') THEN
    CREATE TYPE entity_type_enum AS ENUM ('venue', 'event', 'perk');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visit_source_enum') THEN
    CREATE TYPE visit_source_enum AS ENUM ('map', 'search', 'direct');
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.map_impressions') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1
       FROM pg_constraint
       WHERE conname = 'valid_entity_type'
         AND conrelid = 'public.map_impressions'::regclass
     ) THEN
    ALTER TABLE public.map_impressions
      ADD CONSTRAINT valid_entity_type
      CHECK (entity_type::text = ANY (enum_range(NULL::entity_type_enum)::text[]));
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.map_impressions') IS NOT NULL
     AND to_regclass('public.idx_impressions_session') IS NULL THEN
    CREATE INDEX idx_impressions_session ON public.map_impressions(session_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.map_impressions') IS NOT NULL
     AND to_regclass('public.uniq_impression') IS NULL THEN
    CREATE UNIQUE INDEX uniq_impression
      ON public.map_impressions(session_id, entity_id, entity_type);
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.saved_items') IS NOT NULL
     AND to_regclass('public.uniq_saved_item') IS NULL THEN
    CREATE UNIQUE INDEX uniq_saved_item
      ON public.saved_items(profile_id, entity_id, entity_type);
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.redemptions') IS NOT NULL
     AND to_regclass('public.uniq_redemption') IS NULL
     AND EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'redemptions'
         AND column_name = 'perk_card_id'
     )
     AND EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'redemptions'
         AND column_name = 'venue_offer_id'
     ) THEN
    CREATE UNIQUE INDEX uniq_redemption
      ON public.redemptions(perk_card_id, venue_offer_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.visits') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1
       FROM pg_constraint
       WHERE conname = 'valid_source'
         AND conrelid = 'public.visits'::regclass
     )
     AND EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'visits'
         AND column_name = 'source'
     ) THEN
    ALTER TABLE public.visits
      ADD CONSTRAINT valid_source
      CHECK (source IS NULL OR source::text = ANY (enum_range(NULL::visit_source_enum)::text[]));
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.visits') IS NOT NULL
     AND to_regclass('public.idx_visits_profile') IS NULL THEN
    CREATE INDEX idx_visits_profile ON public.visits(profile_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.search_logs') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1
       FROM pg_constraint
       WHERE conname = 'query_length'
         AND conrelid = 'public.search_logs'::regclass
     )
     AND EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'search_logs'
         AND column_name = 'query'
     ) THEN
    ALTER TABLE public.search_logs
      ADD CONSTRAINT query_length
      CHECK (char_length(btrim(query)) <= 120);
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.search_logs') IS NOT NULL
     AND to_regclass('public.idx_search_session') IS NULL THEN
    CREATE INDEX idx_search_session ON public.search_logs(session_id);
  END IF;
END
$$;
