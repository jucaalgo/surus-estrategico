// SURUS Intel — Stats API Serverless Function v2
// Reads visitor data + time metrics from Supabase for the secret admin panel

const SUPABASE_URL = 'https://kvuvzzegszduglogxrwr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2dXZ6emVnc3pkdWdsb2d4cndyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI2NzU0MywiZXhwIjoyMDg1ODQzNTQzfQ.LYKjIYF38kLo20bODYyrHTrL0XL8w2R37M6VpBLlqTA';

function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://surus-estrategico.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { period, country, device, sort, order, limit, offset } = req.query;

    // Build query params
    const params = new URLSearchParams();
    params.set('select', '*');
    params.set('order', `${sort || 'created_at'}.${order || 'desc'}`);
    params.set('limit', limit || '200');
    params.set('offset', offset || '0');

    // Date filter
    if (period === 'today') {
      const today = new Date().toISOString().split('T')[0];
      params.set('created_at', `gte.${today}T00:00:00`);
    } else if (period === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      params.set('created_at', `gte.${weekAgo}`);
    } else if (period === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      params.set('created_at', `gte.${monthAgo}`);
    }

    // Country filter
    if (country) params.set('country', `eq.${country}`);
    if (device) params.set('device_type', `eq.${device}`);

    // Fetch visits
    const visitsResp = await fetch(`${SUPABASE_URL}/rest/v1/surus_page_views?${params}`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });

    if (!visitsResp.ok) {
      const errText = await visitsResp.text();
      return res.status(200).json({ visits: [], summary: {}, error: errText });
    }

    const visits = await visitsResp.json();

    // Get total count
    const countResp = await fetch(
      `${SUPABASE_URL}/rest/v1/surus_page_views?select=id&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'count=exact'
        }
      }
    );
    const totalCount = parseInt(countResp.headers.get('content-range')?.split('/')[1] || '0');

    // Compute summary stats
    const uniqueIPs = new Set(visits.map(v => v.ip)).size;
    const uniqueCountries = [...new Set(visits.map(v => v.country).filter(Boolean))];
    const deviceCounts = {};
    const countryCounts = {};
    const browserCounts = {};

    // Time metrics
    const timeSpents = visits.map(v => v.time_spent_seconds).filter(t => t && t > 0);
    const avgTime = timeSpents.length > 0 ? Math.round(timeSpents.reduce((a, b) => a + b, 0) / timeSpents.length) : 0;
    const maxTime = timeSpents.length > 0 ? Math.max(...timeSpents) : 0;
    const totalTime = timeSpents.reduce((a, b) => a + b, 0);

    // Time distribution buckets
    const timeBuckets = { '0-10s': 0, '10-30s': 0, '30s-1m': 0, '1-3m': 0, '3-5m': 0, '5-10m': 0, '10m+': 0 };
    timeSpents.forEach(t => {
      if (t <= 10) timeBuckets['0-10s']++;
      else if (t <= 30) timeBuckets['10-30s']++;
      else if (t <= 60) timeBuckets['30s-1m']++;
      else if (t <= 180) timeBuckets['1-3m']++;
      else if (t <= 300) timeBuckets['3-5m']++;
      else if (t <= 600) timeBuckets['5-10m']++;
      else timeBuckets['10m+']++;
    });

    // Sessions with time data
    const uniqueSessions = new Set(visits.map(v => v.session_id).filter(Boolean)).size;
    const sessionsWithTime = new Set(
      visits.filter(v => v.time_spent_seconds && v.time_spent_seconds > 0).map(v => v.session_id)
    ).size;

    // Per-session aggregated time (max time_spent per session)
    const sessionTimes = {};
    visits.forEach(v => {
      if (v.session_id && v.time_spent_seconds) {
        const existing = sessionTimes[v.session_id] || 0;
        sessionTimes[v.session_id] = Math.max(existing, v.time_spent_seconds);
      }
    });
    const sessionTimeValues = Object.values(sessionTimes);
    const avgSessionTime = sessionTimeValues.length > 0
      ? Math.round(sessionTimeValues.reduce((a, b) => a + b, 0) / sessionTimeValues.length)
      : 0;

    visits.forEach(v => {
      deviceCounts[v.device_type || 'unknown'] = (deviceCounts[v.device_type || 'unknown'] || 0) + 1;
      countryCounts[v.country || 'Unknown'] = (countryCounts[v.country || 'Unknown'] || 0) + 1;
      browserCounts[v.browser || 'Unknown'] = (browserCounts[v.browser || 'Unknown'] || 0) + 1;
    });

    // Enrich visits with formatted time
    const enrichedVisits = visits.map(v => ({
      ...v,
      time_spent_formatted: v.time_spent_seconds ? formatDuration(v.time_spent_seconds) : '-',
      time_spent_seconds: v.time_spent_seconds || null
    }));

    const summary = {
      total: totalCount,
      shown: visits.length,
      uniqueIPs,
      uniqueCountries: uniqueCountries.length,
      deviceCounts,
      countryCounts: Object.fromEntries(
        Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)
      ),
      browserCounts: Object.fromEntries(
        Object.entries(browserCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)
      ),
      timeMetrics: {
        avgTime,
        avgTimeFormatted: formatDuration(avgTime),
        avgSessionTime,
        avgSessionTimeFormatted: formatDuration(avgSessionTime),
        maxTime,
        maxTimeFormatted: formatDuration(maxTime),
        totalTime,
        totalTimeFormatted: formatDuration(Math.round(totalTime)),
        timeBuckets,
        sessionsWithTime,
        uniqueSessions,
        timeCoverage: uniqueSessions > 0 ? Math.round((sessionsWithTime / uniqueSessions) * 100) : 0
      }
    };

    return res.status(200).json({ visits: enrichedVisits, summary });
  } catch (err) {
    console.error('Stats error:', err.message);
    return res.status(200).json({ visits: [], summary: {}, error: err.message });
  }
};