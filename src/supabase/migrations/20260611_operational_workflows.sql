CREATE TABLE IF NOT EXISTS saved_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_items_unique
  ON saved_items(profile_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_profile_id ON saved_items(profile_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_entity_id ON saved_items(entity_id);

CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id TEXT NOT NULL,
  venue_id TEXT NOT NULL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visits_profile_id ON visits(profile_id);
CREATE INDEX IF NOT EXISTS idx_visits_venue_id ON visits(venue_id);

CREATE TABLE IF NOT EXISTS map_impressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_map_impressions_session_id ON map_impressions(session_id);
CREATE INDEX IF NOT EXISTS idx_map_impressions_entity_id ON map_impressions(entity_id);

CREATE TABLE IF NOT EXISTS search_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  query TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_logs_session_id ON search_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_query ON search_logs(query);

CREATE TABLE IF NOT EXISTS listing_interest_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  move_timeline TEXT,
  message TEXT,
  listing JSONB NOT NULL,
  session_id TEXT,
  profile_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_interest_requests_email ON listing_interest_requests(email);
CREATE INDEX IF NOT EXISTS idx_listing_interest_requests_created_at ON listing_interest_requests(created_at);
