-- ============================================
-- SURUS Complete Setup — Create table + Time Tracking
-- ============================================
-- Project: kvuvzzegszduglogxrwr (SURUS)
-- Run this ENTIRE script in Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Create the table if it doesn't exist (with time tracking columns included)
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
  time_spent_seconds INTEGER DEFAULT NULL,
  last_activity TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add columns if table already existed without them (safe idempotent)
ALTER TABLE surus_page_views ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER DEFAULT NULL;
ALTER TABLE surus_page_views ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ DEFAULT NULL;

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_surus_pv_created_at ON surus_page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_surus_pv_ip ON surus_page_views (ip);
CREATE INDEX IF NOT EXISTS idx_surus_pv_country ON surus_page_views (country);
CREATE INDEX IF NOT EXISTS idx_surus_pv_session_id ON surus_page_views (session_id);
CREATE INDEX IF NOT EXISTS idx_surus_pv_device_type ON surus_page_views (device_type);
CREATE INDEX IF NOT EXISTS idx_surus_pv_time_spent ON surus_page_views (time_spent_seconds);
CREATE INDEX IF NOT EXISTS idx_surus_pv_last_activity ON surus_page_views (last_activity);

-- 4. Enable RLS
ALTER TABLE surus_page_views ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "anon_insert_surus_page_views" ON surus_page_views;
DROP POLICY IF EXISTS "anon_read_surus_page_views" ON surus_page_views;

CREATE POLICY "anon_insert_surus_page_views" ON surus_page_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "anon_read_surus_page_views" ON surus_page_views
  FOR SELECT USING (true);

-- 6. Backfill time_spent_seconds from existing session data
-- For multi-visit sessions: duration = time between first and last visit
-- For single-visit sessions: estimate 30s (typical bounce)
WITH session_durations AS (
  SELECT
    session_id,
    EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at)))::INTEGER AS duration_seconds,
    MAX(created_at) AS last_ts,
    COUNT(*) AS visit_count
  FROM surus_page_views
  WHERE session_id IS NOT NULL
  GROUP BY session_id
)
UPDATE surus_page_views spv
SET
  time_spent_seconds = CASE
    WHEN sd.visit_count > 1 THEN GREATEST(sd.duration_seconds, 5)
    ELSE 30
  END,
  last_activity = sd.last_ts
FROM session_durations sd
WHERE spv.session_id = sd.session_id
  AND spv.time_spent_seconds IS NULL;

-- 7. Comments
COMMENT ON TABLE surus_page_views IS 'Visitor tracking for SURUS strategic investigation site';
COMMENT ON COLUMN surus_page_views.time_spent_seconds IS 'Seconds spent on page (measured client-side or estimated from session gaps)';
COMMENT ON COLUMN surus_page_views.last_activity IS 'Last recorded activity timestamp for this page view';