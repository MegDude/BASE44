-- Downtown Perks Partner Platform Hardening
-- Canonical partner operations layer for workspace, attribution, and analytics

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'partner_type_enum'
  ) THEN
    CREATE TYPE partner_type_enum AS ENUM (
      'property',
      'hotel',
      'venue',
      'bars_restaurants',
      'local_business',
      'brand',
      'civic'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'partner_status_enum'
  ) THEN
    CREATE TYPE partner_status_enum AS ENUM (
      'draft',
      'pending_review',
      'active',
      'paused',
      'archived'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'partner_role_enum'
  ) THEN
    CREATE TYPE partner_role_enum AS ENUM (
      'owner',
      'manager',
      'editor',
      'analyst',
      'viewer'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'source_point_type_enum'
  ) THEN
    CREATE TYPE source_point_type_enum AS ENUM (
      'qr',
      'building',
      'campaign',
      'nav',
      'email',
      'sms',
      'staff_share',
      'lobby_signage',
      'room_card',
      'key_sleeve'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'interaction_event_type_enum'
  ) THEN
    CREATE TYPE interaction_event_type_enum AS ENUM (
      'map_open',
      'pin_select',
      'save',
      'rsvp_start',
      'rsvp_complete',
      'offer_view',
      'unlock_start',
      'unlock_complete',
      'redeem',
      'cta_click',
      'form_submit'
    );
  END IF;
END $$;

ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS partner_type partner_type_enum,
  ADD COLUMN IF NOT EXISTS primary_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS primary_contact_email TEXT,
  ADD COLUMN IF NOT EXISTS primary_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Chicago',
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS workspace_enabled BOOLEAN DEFAULT TRUE;

UPDATE partners
SET partner_type = CASE
  WHEN category = 'real_estate' THEN 'property'::partner_type_enum
  WHEN category = 'hospitality' THEN 'hotel'::partner_type_enum
  WHEN category = 'dining' THEN 'bars_restaurants'::partner_type_enum
  WHEN category = 'retail' THEN 'local_business'::partner_type_enum
  WHEN category = 'entertainment' THEN 'venue'::partner_type_enum
  ELSE 'venue'::partner_type_enum
END
WHERE partner_type IS NULL;

ALTER TABLE partners
  ALTER COLUMN partner_type SET DEFAULT 'venue';

CREATE INDEX IF NOT EXISTS idx_partners_partner_type ON partners(partner_type);
CREATE INDEX IF NOT EXISTS idx_partners_district ON partners(district);

CREATE TABLE IF NOT EXISTS partner_entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('building', 'hotel', 'venue', 'event', 'perk', 'campaign', 'district', 'zone')),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  address TEXT,
  district TEXT,
  status TEXT DEFAULT 'draft',
  image_url TEXT,
  cover_image_url TEXT,
  hours_json JSONB DEFAULT '{}'::jsonb,
  metadata_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_entities_partner_id ON partner_entities(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_entities_entity_type ON partner_entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_partner_entities_district ON partner_entities(district);

ALTER TABLE perks
  ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS entity_id UUID REFERENCES partner_entities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS offer_type TEXT,
  ADD COLUMN IF NOT EXISTS redemption_type TEXT,
  ADD COLUMN IF NOT EXISTS visibility_status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS inventory_limit INTEGER,
  ADD COLUMN IF NOT EXISTS redemption_limit_per_user INTEGER;

CREATE INDEX IF NOT EXISTS idx_perks_partner_id ON perks(partner_id);
CREATE INDEX IF NOT EXISTS idx_perks_entity_id ON perks(entity_id);

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS entity_id UUID REFERENCES partner_entities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS rsvp_enabled BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

CREATE INDEX IF NOT EXISTS idx_events_partner_id ON events(partner_id);
CREATE INDEX IF NOT EXISTS idx_events_entity_id ON events(entity_id);
CREATE INDEX IF NOT EXISTS idx_events_district ON events(district);

CREATE TABLE IF NOT EXISTS source_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  source_type source_point_type_enum NOT NULL,
  source_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  placement_description TEXT,
  building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_source_points_partner_id ON source_points(partner_id);
CREATE INDEX IF NOT EXISTS idx_source_points_source_type ON source_points(source_type);
CREATE INDEX IF NOT EXISTS idx_source_points_building_id ON source_points(building_id);

CREATE TABLE IF NOT EXISTS interaction_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  anonymous_session_key TEXT,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  entity_id UUID REFERENCES partner_entities(id) ON DELETE SET NULL,
  source_point_id UUID REFERENCES source_points(id) ON DELETE SET NULL,
  event_type interaction_event_type_enum NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  district TEXT,
  device_type TEXT,
  session_id TEXT,
  metadata_json JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_interaction_events_partner_id ON interaction_events(partner_id);
CREATE INDEX IF NOT EXISTS idx_interaction_events_source_point_id ON interaction_events(source_point_id);
CREATE INDEX IF NOT EXISTS idx_interaction_events_event_type ON interaction_events(event_type);
CREATE INDEX IF NOT EXISTS idx_interaction_events_occurred_at ON interaction_events(occurred_at DESC);

CREATE TABLE IF NOT EXISTS partner_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role partner_role_enum NOT NULL DEFAULT 'viewer',
  status TEXT NOT NULL DEFAULT 'invited',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partner_id, email)
);

CREATE INDEX IF NOT EXISTS idx_partner_users_partner_id ON partner_users(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_users_role ON partner_users(role);

CREATE TABLE IF NOT EXISTS partner_profiles (
  partner_id UUID PRIMARY KEY REFERENCES partners(id) ON DELETE CASCADE,
  branding_json JSONB DEFAULT '{}'::jsonb,
  notification_settings_json JSONB DEFAULT '{}'::jsonb,
  default_filters_json JSONB DEFAULT '{}'::jsonb,
  publishing_preferences_json JSONB DEFAULT '{}'::jsonb,
  approval_mode TEXT DEFAULT 'manual_review',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lead_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_type partner_type_enum,
  source TEXT,
  building TEXT,
  campaign TEXT,
  placement TEXT,
  page TEXT,
  payload_json JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_submissions_partner_type ON lead_submissions(partner_type);
CREATE INDEX IF NOT EXISTS idx_lead_submissions_created_at ON lead_submissions(created_at DESC);

CREATE TABLE IF NOT EXISTS member_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  source TEXT,
  building TEXT,
  phone TEXT,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE redemptions
  ADD COLUMN IF NOT EXISTS member_card_id UUID REFERENCES member_cards(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS entity_id UUID REFERENCES partner_entities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_point_id UUID REFERENCES source_points(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS metadata_json JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_redemptions_partner_id ON redemptions(partner_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_source_point_id ON redemptions(source_point_id);
