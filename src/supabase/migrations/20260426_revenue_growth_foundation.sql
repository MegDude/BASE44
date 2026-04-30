-- Downtown Perks Revenue + Growth Foundation
-- Closed-loop commerce layer built on top of the existing map system.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (
    type IN (
      'impression',
      'save',
      'visit_confirmed',
      'redeem',
      'brand_impression',
      'brand_engagement',
      'brand_conversion',
      'sponsor_impression',
      'partner_created',
      'offer_created',
      'qr_generated',
      'qr_scan'
    )
  ),
  entity_id TEXT,
  entity_type TEXT,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  sponsor_id UUID,
  user_id TEXT,
  session_id TEXT,
  brand_key TEXT,
  source TEXT,
  district TEXT,
  value_cents INTEGER DEFAULT 0,
  metadata_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions(type);
CREATE INDEX IF NOT EXISTS idx_interactions_entity_id ON interactions(entity_id);
CREATE INDEX IF NOT EXISTS idx_interactions_partner_id ON interactions(partner_id);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions(created_at DESC);

CREATE TABLE IF NOT EXISTS demand_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id TEXT NOT NULL,
  ts TIMESTAMPTZ NOT NULL,
  saves INTEGER DEFAULT 0,
  visits INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  redemptions INTEGER DEFAULT 0,
  score NUMERIC DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_demand_snapshots_entity_ts ON demand_snapshots(entity_id, ts DESC);

CREATE TABLE IF NOT EXISTS pricing_recs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id TEXT NOT NULL,
  ts TIMESTAMPTZ NOT NULL,
  recommended_bid_cents INTEGER,
  recommended_budget_cents INTEGER,
  confidence NUMERIC DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_pricing_recs_entity_ts ON pricing_recs(entity_id, ts DESC);

CREATE TABLE IF NOT EXISTS qr_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  entity_id TEXT NOT NULL,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  entry_context TEXT,
  expires_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qr_tokens_entity_id ON qr_tokens(entity_id);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_expires_at ON qr_tokens(expires_at);

CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id TEXT NOT NULL,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offers_entity_id ON offers(entity_id);
CREATE INDEX IF NOT EXISTS idx_offers_active ON offers(active);

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  venue TEXT,
  status TEXT DEFAULT 'new',
  last_contact TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partner_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  entity_id TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('core', 'growth', 'open')),
  district TEXT NOT NULL,
  category TEXT NOT NULL,
  exclusivity BOOLEAN DEFAULT FALSE,
  exclusivity_scope TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  min_spend_cents INTEGER DEFAULT 0,
  rev_share_bps INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_partner_contracts_partner_id ON partner_contracts(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_contracts_scope ON partner_contracts(district, category, status);

CREATE TABLE IF NOT EXISTS sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand_color TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sponsor_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  brand_key TEXT,
  district TEXT,
  category TEXT,
  budget_cents INTEGER NOT NULL,
  cpm_cents INTEGER DEFAULT 500,
  priority_boost NUMERIC DEFAULT 0.2,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_sponsor_campaigns_sponsor_id ON sponsor_campaigns(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_campaigns_status ON sponsor_campaigns(status);

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS entity_id TEXT,
  ADD COLUMN IF NOT EXISTS budget_cents INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bid_cents INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS daily_cap_cents INTEGER DEFAULT 2000;

ALTER TABLE redemptions
  ADD COLUMN IF NOT EXISTS qr_token TEXT,
  ADD COLUMN IF NOT EXISTS value_cents INTEGER DEFAULT 0;
