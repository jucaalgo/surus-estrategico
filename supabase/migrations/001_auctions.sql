-- Surus Estratégico: Auction Intelligence Schema
-- Migration 001: Core auction tables

-- ============================================
-- Table: auctions
-- Primary asset data, maps 1:1 to Asset TypeScript type
-- ============================================

CREATE TABLE auctions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_id   TEXT NOT NULL,
  lot_id        TEXT NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  category      TEXT,
  subcategory   TEXT,
  source_url    TEXT,
  source        TEXT NOT NULL DEFAULT 'scraped' CHECK (source IN ('scraped', 'mock', 'gemini')),

  -- Pricing
  current_bid       NUMERIC,
  currency          TEXT DEFAULT 'EUR',
  estimated_resale  NUMERIC,
  buyer_premium_pct NUMERIC DEFAULT 16,
  reserve_price     NUMERIC,
  has_reserve       BOOLEAN DEFAULT false,
  starting_bid      NUMERIC,

  -- Location
  city          TEXT,
  region        TEXT,
  country       TEXT,
  country_code  TEXT,
  lat           NUMERIC,
  lng           NUMERIC,
  site_type     TEXT,

  -- Timing
  auction_end          TIMESTAMPTZ,
  inspection_available BOOLEAN DEFAULT false,

  -- Specs
  make          TEXT,
  model         TEXT,
  year          INTEGER,
  condition     TEXT CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
  hours         INTEGER,
  power         TEXT,
  weight_kg     INTEGER,

  -- Calculated KPIs (denormalized for fast reads)
  total_acquisition_cost NUMERIC,
  buyer_premium          NUMERIC,
  taxes                  NUMERIC,
  transport             NUMERIC,
  refurbishment          NUMERIC,
  estimated_resale_value NUMERIC,
  gross_profit           NUMERIC,
  roi                    NUMERIC,
  net_profit_margin      NUMERIC,
  payback_months         INTEGER,
  tir                    NUMERIC,
  arbitrage_score        NUMERIC,
  is_ganga               BOOLEAN DEFAULT false,
  risk_score             INTEGER DEFAULT 0,
  risk_level             TEXT CHECK (risk_level IN ('low', 'medium', 'high')),

  -- Metadata
  scraped_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  is_active     BOOLEAN DEFAULT true,

  UNIQUE(platform_id, lot_id)
);

-- Indexes for common queries
CREATE INDEX idx_auctions_active ON auctions (is_active, auction_end DESC) WHERE is_active = true;
CREATE INDEX idx_auctions_platform ON auctions (platform_id);
CREATE INDEX idx_auctions_category ON auctions (category);
CREATE INDEX idx_auctions_country ON auctions (country_code);
CREATE INDEX idx_auctions_ganga ON auctions (is_ganga) WHERE is_ganga = true;
CREATE INDEX idx_auctions_scraped_at ON auctions (scraped_at DESC);
CREATE INDEX idx_auctions_search ON auctions USING gin(to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(category, '') || ' ' || coalesce(make, '') || ' ' || coalesce(model, '')));

-- ============================================
-- Table: auction_images
-- ============================================

CREATE TABLE auction_images (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id  UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  proxy_url   TEXT,
  alt_text    TEXT,
  sort_order  INTEGER DEFAULT 0,
  is_primary  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auction_images_auction ON auction_images(auction_id, sort_order);

-- ============================================
-- Table: auction_specs
-- Flexible key-value specs not in main table
-- ============================================

CREATE TABLE auction_specs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id  UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  key         TEXT NOT NULL,
  value       TEXT NOT NULL,
  unit        TEXT
);

CREATE INDEX idx_auction_specs_auction ON auction_specs(auction_id);

-- ============================================
-- Table: scrape_runs
-- Audit trail for scraper executions
-- ============================================

CREATE TABLE scrape_runs (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_id     TEXT NOT NULL,
  status          TEXT CHECK (status IN ('running', 'success', 'partial', 'failed')) DEFAULT 'running',
  items_found     INTEGER DEFAULT 0,
  items_upserted  INTEGER DEFAULT 0,
  items_deactivated INTEGER DEFAULT 0,
  error_message   TEXT,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  finished_at     TIMESTAMPTZ,
  duration_ms     INTEGER
);

CREATE INDEX idx_scrape_runs_platform ON scrape_runs(platform_id, started_at DESC);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_runs ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "anon_read_auctions" ON auctions FOR SELECT USING (true);
CREATE POLICY "anon_read_images" ON auction_images FOR SELECT USING (true);
CREATE POLICY "anon_read_specs" ON auction_specs FOR SELECT USING (true);
CREATE POLICY "anon_read_scrape_runs" ON scrape_runs FOR SELECT USING (true);

-- Service role has full access (uses SUPABASE_SERVICE_ROLE_KEY in API routes)
-- No INSERT/UPDATE policies for anon — all writes through authenticated API routes