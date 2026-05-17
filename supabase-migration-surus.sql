-- ============================================
-- SURUS Page Views Tracking Table
-- ============================================
-- Project: kvuvzzegszduglogxrwr (MVK Reforms / SURUS)
-- Purpose: Store visitor tracking data for surus-estrategico site
-- ============================================

-- Create the table
CREATE TABLE IF NOT EXISTS surus_page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip TEXT NOT NULL DEFAULT 'unknown',
  city TEXT DEFAULT NULL,
  country TEXT DEFAULT NULL,
  country_code TEXT DEFAULT NULL,
  region TEXT DEFAULT NULL,
  isp TEXT DEFAULT NULL,
  org TEXT DEFAULT NULL,
  timezone TEXT DEFAULT NULL,
  lat NUMERIC DEFAULT NULL,
  lon NUMERIC DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  device_type TEXT DEFAULT NULL,
  browser TEXT DEFAULT NULL,
  os TEXT DEFAULT NULL,
  referrer TEXT DEFAULT NULL,
  page TEXT DEFAULT '/',
  session_id UUID DEFAULT NULL,
  visit_count INTEGER DEFAULT 1,
  first_visit TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_surus_pv_created_at ON surus_page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_surus_pv_ip ON surus_page_views (ip);
CREATE INDEX IF NOT EXISTS idx_surus_pv_country ON surus_page_views (country);
CREATE INDEX IF NOT EXISTS idx_surus_pv_session_id ON surus_page_views (session_id);
CREATE INDEX IF NOT EXISTS idx_surus_pv_device_type ON surus_page_views (device_type);

-- Enable RLS
ALTER TABLE surus_page_views ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (tracker needs to insert without auth)
DROP POLICY IF EXISTS "anon_insert_surus_page_views" ON surus_page_views;
CREATE POLICY "anon_insert_surus_page_views" ON surus_page_views
  FOR INSERT WITH CHECK (true);

-- Allow anonymous reads (stats API needs to read)
DROP POLICY IF EXISTS "anon_read_surus_page_views" ON surus_page_views;
CREATE POLICY "anon_read_surus_page_views" ON surus_page_views
  FOR SELECT USING (true);

-- Add comment
COMMENT ON TABLE surus_page_views IS 'Visitor tracking for SURUS strategic investigation site';
