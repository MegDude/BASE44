ALTER TABLE buildings ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS unit_count_source TEXT;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS management_company TEXT;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS ownership_group TEXT;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 3;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS source_urls JSONB DEFAULT '[]'::jsonb;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_buildings_slug ON buildings(slug);

CREATE TABLE IF NOT EXISTS building_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  contact_type TEXT,
  role_title TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  source_url TEXT,
  confidence_score DOUBLE PRECISION DEFAULT 0,
  verification_status TEXT DEFAULT 'needs_verification',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_building_contacts_identity
  ON building_contacts(building_id, role_title, email);

CREATE TABLE IF NOT EXISTS building_enrichment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  source TEXT,
  action TEXT,
  result TEXT,
  confidence_score DOUBLE PRECISION DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

