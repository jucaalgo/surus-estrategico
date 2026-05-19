-- Migration 002: Add data quality tracking columns
-- Applied: 2026-05-19

ALTER TABLE auctions
  ADD COLUMN IF NOT EXISTS detail_scraped BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS data_quality_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS price_confidence TEXT DEFAULT 'unknown' CHECK (price_confidence IN ('real', 'estimated', 'unknown'));

-- Index for filtering by data quality
CREATE INDEX IF NOT EXISTS idx_auctions_data_quality ON auctions (data_quality_score DESC) WHERE is_active = true;
