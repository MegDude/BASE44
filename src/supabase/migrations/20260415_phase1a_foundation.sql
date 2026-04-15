-- Downtown Perks Phase 1A Foundation Schema
-- Core tables for unified map system

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ── PARTNERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('retail', 'hospitality', 'dining', 'wellness', 'entertainment', 'real_estate')),
  description TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_category ON partners(category);

-- ── VENUES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('restaurant', 'bar', 'fitness', 'wellness', 'beauty', 'retail', 'entertainment', 'coworking', 'hotel')),
  subcategory TEXT,
  description TEXT,
  address TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  image_url TEXT,
  perk_description TEXT,
  perk_value TEXT,
  hours TEXT,
  website TEXT,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'coming_soon', 'inactive')),
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_venues_status ON venues(status);
CREATE INDEX idx_venues_category ON venues(category);
CREATE INDEX idx_venues_location ON venues USING GIST (location);
CREATE INDEX idx_venues_is_featured ON venues(is_featured);

-- ── BUILDINGS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  image_url TEXT,
  unit_count INTEGER,
  developer TEXT,
  description TEXT,
  amenities TEXT[],
  is_partner BOOLEAN DEFAULT FALSE,
  real_estate_contact TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pilot', 'prospect')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_buildings_status ON buildings(status);
CREATE INDEX idx_buildings_location ON buildings USING GIST (location);
CREATE INDEX idx_buildings_is_partner ON buildings(is_partner);

-- ── EVENTS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('fitness', 'wellness', 'social', 'dining', 'nightlife', 'arts', 'networking', 'class', 'run_club', 'yoga')),
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  venue_name TEXT,
  address TEXT,
  location GEOGRAPHY(POINT, 4326),
  latitude FLOAT,
  longitude FLOAT,
  image_url TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  is_members_only BOOLEAN DEFAULT TRUE,
  capacity INTEGER,
  rsvp_count INTEGER DEFAULT 0,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'past', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_venue_id ON events(venue_id);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_location ON events USING GIST (location);

-- ── PERKS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS perks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  venue_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('discount', 'free_item', 'priority_access', 'members_rate', 'experience', 'class_pass')),
  value TEXT NOT NULL,
  terms TEXT,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  is_featured BOOLEAN DEFAULT FALSE,
  redemption_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_perks_status ON perks(status);
CREATE INDEX idx_perks_category ON perks(category);
CREATE INDEX idx_perks_venue_id ON perks(venue_id);
CREATE INDEX idx_perks_is_featured ON perks(is_featured);

-- ── CAMPAIGNS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('launch', 'seasonal', 'event', 'promotion', 'resident')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT TRUE,
  districts TEXT[],
  participating_venues UUID[],
  participating_buildings UUID[],
  associated_events UUID[],
  objective TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_partner_id ON campaigns(partner_id);
CREATE INDEX idx_campaigns_type ON campaigns(type);

-- ── SAVES ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('venue', 'event', 'perk', 'campaign')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_saves_user_email ON saves(user_email);
CREATE INDEX idx_saves_entity_id ON saves(entity_id);
CREATE INDEX idx_saves_entity_type ON saves(entity_type);
CREATE UNIQUE INDEX idx_saves_unique ON saves(user_email, entity_id, entity_type);

-- ── REDEMPTIONS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  perk_id UUID REFERENCES perks(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  redemption_code TEXT,
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_redemptions_user_email ON redemptions(user_email);
CREATE INDEX idx_redemptions_perk_id ON redemptions(perk_id);
CREATE INDEX idx_redemptions_status ON redemptions(status);
CREATE INDEX idx_redemptions_redeemed_at ON redemptions(redeemed_at);

-- ── ANALYTICS SIGNALS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  source_type TEXT NOT NULL CHECK (source_type IN ('building_qr', 'map_discovery', 'event_marker', 'sms', 'resident_card', 'direct_link')),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  district TEXT,
  action_type TEXT NOT NULL CHECK (action_type IN ('impression', 'open', 'scan', 'save', 'rsvp', 'unlock', 'opt_in', 'visit_intent', 'visit', 'redemption', 'booking', 'repeat_visit')),
  value INTEGER DEFAULT 1,
  session_token TEXT,
  user_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_signals_timestamp ON analytics_signals(timestamp);
CREATE INDEX idx_analytics_signals_source_type ON analytics_signals(source_type);
CREATE INDEX idx_analytics_signals_action_type ON analytics_signals(action_type);
CREATE INDEX idx_analytics_signals_campaign_id ON analytics_signals(campaign_id);
CREATE INDEX idx_analytics_signals_venue_id ON analytics_signals(venue_id);
CREATE INDEX idx_analytics_signals_user_email ON analytics_signals(user_email);

-- ── SEARCH INTERACTIONS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS search_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT,
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  selected_result_id TEXT,
  result_entity_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_search_interactions_query ON search_interactions(query);
CREATE INDEX idx_search_interactions_user_email ON search_interactions(user_email);
CREATE INDEX idx_search_interactions_created_at ON search_interactions(created_at);

-- ── RSVP ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  party_size INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rsvps_user_email ON rsvps(user_email);
CREATE INDEX idx_rsvps_event_id ON rsvps(event_id);
CREATE INDEX idx_rsvps_status ON rsvps(status);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────
ALTER TABLE saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own saves
CREATE POLICY save_own_saves ON saves FOR SELECT
  USING (user_email = current_user_email());

CREATE POLICY save_insert_own_saves ON saves FOR INSERT
  WITH CHECK (user_email = current_user_email());

-- Users can only see/modify their own redemptions
CREATE POLICY redemption_own_redemptions ON redemptions FOR SELECT
  USING (user_email = current_user_email());

CREATE POLICY redemption_insert_own_redemptions ON redemptions FOR INSERT
  WITH CHECK (user_email = current_user_email());

-- Users can only see/modify their own RSVPs
CREATE POLICY rsvp_own_rsvps ON rsvps FOR SELECT
  USING (user_email = current_user_email());

CREATE POLICY rsvp_insert_own_rsvps ON rsvps FOR INSERT
  WITH CHECK (user_email = current_user_email());

-- ── VIEWS ────────────────────────────────────────────────────
CREATE OR REPLACE VIEW venue_metrics AS
SELECT
  v.id AS venue_id,
  v.name AS venue_name,
  COUNT(DISTINCT CASE WHEN a.action_type = 'scan' THEN a.id END) AS scans,
  COUNT(DISTINCT CASE WHEN a.action_type = 'visit' THEN a.id END) AS visits,
  COUNT(DISTINCT CASE WHEN a.action_type = 'redemption' THEN a.id END) AS redemptions,
  COUNT(DISTINCT CASE WHEN a.action_type = 'save' THEN a.id END) AS saves,
  ROUND(
    COUNT(DISTINCT CASE WHEN a.action_type = 'visit' THEN a.id END)::FLOAT /
    NULLIF(COUNT(DISTINCT CASE WHEN a.action_type = 'scan' THEN a.id END), 0) * 100,
    2
  ) AS scan_to_visit_rate
FROM venues v
LEFT JOIN analytics_signals a ON v.id = a.venue_id
GROUP BY v.id, v.name;

CREATE OR REPLACE VIEW campaign_metrics AS
SELECT
  c.id AS campaign_id,
  c.name AS campaign_name,
  p.id AS partner_id,
  p.name AS partner_name,
  COUNT(DISTINCT CASE WHEN a.action_type = 'scan' THEN a.id END) AS scans,
  COUNT(DISTINCT CASE WHEN a.action_type = 'visit' THEN a.id END) AS visits,
  COUNT(DISTINCT CASE WHEN a.action_type = 'redemption' THEN a.id END) AS redemptions,
  COUNT(DISTINCT CASE WHEN a.action_type = 'save' THEN a.id END) AS saves,
  COUNT(DISTINCT a.user_email) AS unique_users
FROM campaigns c
LEFT JOIN partners p ON c.partner_id = p.id
LEFT JOIN analytics_signals a ON c.id = a.campaign_id
GROUP BY c.id, c.name, p.id, p.name;