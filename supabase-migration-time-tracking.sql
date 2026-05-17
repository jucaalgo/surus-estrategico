-- ============================================
-- SURUS Time Tracking Migration
-- ============================================
-- Adds time_spent_seconds and last_activity columns
-- Backfills from existing session data where possible
-- ============================================

-- 1. Add new columns
ALTER TABLE surus_page_views
ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ DEFAULT NULL;

-- 2. Backfill: calculate approximate time from multi-visit sessions
-- For sessions with multiple page views, time_spent = time between first and last visit
-- For single-visit sessions, we set a conservative 30s default (bounce)
WITH session_durations AS (
  SELECT
    session_id,
    EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at)))::INTEGER AS duration_seconds,
    MAX(created_at) AS last_activity_ts,
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
  last_activity = sd.last_activity_ts
FROM session_durations sd
WHERE spv.session_id = sd.session_id
  AND spv.time_spent_seconds IS NULL;

-- 3. Create index for time queries
CREATE INDEX IF NOT EXISTS idx_surus_pv_time_spent ON surus_page_views (time_spent_seconds);
CREATE INDEX IF NOT EXISTS idx_surus_pv_last_activity ON surus_page_views (last_activity);

-- 4. Add comments
COMMENT ON COLUMN surus_page_views.time_spent_seconds IS 'Seconds spent on page (measured client-side or estimated from session gaps)';
COMMENT ON COLUMN surus_page_views.last_activity IS 'Last recorded activity timestamp for this page view';