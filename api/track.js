// SURUS Intel — Visitor Tracking Serverless Function v2
// Receives visitor data + time-on-page, enriches with geo-IP, stores in Supabase
// Handles: initial visit, heartbeat updates, exit beacons

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kvuvzzegszduglogxrwr.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const TABLE = 'surus_page_views';

const ALLOWED_ORIGINS = [
  'https://surus-estrategico.vercel.app',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];

async function enrichWithGeo(ip) {
  if (!ip || ip === 'unknown' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return {};
  }
  try {
    const resp = await fetch(`https://ipapi.co/${ip}/json/`, { signal: AbortSignal.timeout(5000) });
    if (!resp.ok) return {};
    const data = await resp.json();
    return {
      city: data.city || null,
      country: data.country_name || null,
      country_code: data.country_code || null,
      region: data.region || null,
      isp: data.org || null,
      org: data.org || null,
      timezone: data.timezone || null,
      lat: data.latitude ? String(data.latitude) : null,
      lon: data.longitude ? String(data.longitude) : null
    };
  } catch {
    return {};
  }
}

function parseUserAgent(ua) {
  let browser = 'Unknown';
  let os = 'Unknown';

  if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Opera') || ua.includes('OPR/')) browser = 'Opera';

  if (ua.includes('Windows NT 10')) os = 'Windows 10/11';
  else if (ua.includes('Windows NT')) os = 'Windows';
  else if (ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return { browser, os };
}

function getDeviceType(ua) {
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'mobile';
  return 'desktop';
}

module.exports = async function handler(req, res) {
  // CORS
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin) || origin.includes('surus-estrategico')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://surus-estrategico.vercel.app');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Health check
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      service: 'surus-intel-tracker',
      version: '2.0',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const forwarded = req.headers['x-forwarded-for'] || '';
      const ip = forwarded.split(',')[0]?.trim() || req.socket?.remoteAddress || body.ip || 'unknown';
      const userAgent = req.headers['user-agent'] || body.user_agent || 'unknown';
      const { browser, os } = parseUserAgent(userAgent);
      const deviceType = body.device_type || getDeviceType(userAgent);

      // Enrich with geo data (server-side, more reliable)
      const geo = await enrichWithGeo(ip);

      const isExit = body.is_exit || false;
      const sessionId = body.session_id || null;

      // For exit beacons and heartbeats: update existing record instead of creating new
      if (isExit && sessionId) {
        // Update the most recent record for this session with exit data
        const updateResp = await fetch(
          `${SUPABASE_URL}/rest/v1/${TABLE}?session_id=eq.${sessionId}&order=created_at.desc&limit=1`,
          {
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
            }
          }
        );

        if (updateResp.ok) {
          const existing = await updateResp.json();
          if (existing.length > 0) {
            const existingRecord = existing[0];
            // Keep the max time_spent_seconds between existing and new
            const newTimeSpent = body.time_spent_seconds || 0;
            const existingTimeSpent = existingRecord.time_spent_seconds || 0;
            const maxTimeSpent = Math.max(existingTimeSpent, newTimeSpent);

            await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${existingRecord.id}`, {
              method: 'PATCH',
              headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({
                time_spent_seconds: maxTimeSpent,
                last_activity: body.last_activity || new Date().toISOString()
              })
            });

            return res.status(200).json({ status: 'ok', action: 'exit_updated', time_spent: maxTimeSpent });
          }
        }
      }

      // Heartbeat: update time_spent on the latest record for this session
      if (!isExit && sessionId && body.time_spent_seconds) {
        const latestResp = await fetch(
          `${SUPABASE_URL}/rest/v1/${TABLE}?session_id=eq.${sessionId}&order=created_at.desc&limit=1`,
          {
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
            }
          }
        );

        if (latestResp.ok) {
          const latest = await latestResp.json();
          if (latest.length > 0) {
            const existingTimeSpent = latest[0].time_spent_seconds || 0;
            const newTimeSpent = body.time_spent_seconds || 0;

            // Only update if new time is greater (avoid stale heartbeats overwriting newer data)
            if (newTimeSpent > existingTimeSpent) {
              await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${latest[0].id}`, {
                method: 'PATCH',
                headers: {
                  'apikey': SUPABASE_SERVICE_KEY,
                  'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                  'Content-Type': 'application/json',
                  'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                  time_spent_seconds: newTimeSpent,
                  last_activity: body.last_activity || new Date().toISOString()
                })
              });

              return res.status(200).json({ status: 'ok', action: 'heartbeat_updated', time_spent: newTimeSpent });
            }

            return res.status(200).json({ status: 'ok', action: 'heartbeat_skipped' });
          }
        }
      }

      // New visit: create a new record
      const record = {
        ip,
        city: body.city || geo.city || null,
        country: body.country || geo.country || null,
        country_code: body.country_code || geo.country_code || null,
        region: body.region || geo.region || null,
        isp: body.isp || geo.isp || null,
        org: body.org || geo.org || null,
        timezone: body.timezone || geo.timezone || null,
        lat: body.lat || geo.lat || null,
        lon: body.lon || geo.lon || null,
        user_agent: userAgent,
        device_type: deviceType,
        browser: body.browser || browser,
        os: body.os || os,
        referrer: body.referrer || req.headers.referer || null,
        page: body.page || '/',
        session_id: sessionId,
        visit_count: body.visit_count || 1,
        first_visit: body.first_visit || null,
        time_spent_seconds: body.time_spent_seconds || null,
        last_activity: body.last_activity || new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      const insertResp = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(record)
      });

      if (!insertResp.ok) {
        const errText = await insertResp.text();
        console.error('Insert error:', insertResp.status, errText);

        if (insertResp.status === 404 || errText.includes('Could not find')) {
          return res.status(200).json({
            status: 'table_missing',
            message: 'Table surus_page_views needs to be created. Run the migration SQL.',
            sql: 'Run supabase-migration-surus.sql in Supabase Dashboard > SQL Editor'
          });
        }

        return res.status(200).json({ status: 'error', message: 'Insert failed' });
      }

      return res.status(200).json({ status: 'ok', action: 'new_visit', recorded: true });
    } catch (err) {
      console.error('Track error:', err.message);
      return res.status(200).json({ status: 'error', message: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};