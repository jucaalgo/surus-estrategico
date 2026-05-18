// ============================================================
// SURUS LIVE SEARCH — Gemini-powered real-time auction search
// /api/live-search?q=kuka+robot
//
// Uses Gemini 2.5 Flash with Google Search grounding to find
// industrial auction listings across all platforms in real time.
// No GitHub Actions, no Playwright, no scraping — Gemini searches
// the live web and extracts structured results.
// ============================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const PLATFORM_DOMAINS = [
  'surplex.com', 'netbid.com', 'troostwijk.nl', 'goindustry.com',
  'maynards.com', 'industrial-auctions.com', 'auctelia.com', 'bidspotter.com',
  'machinio.com', 'exapro.com', 'trademachines.com', 'asset-trade.de'
];

// ═══════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════

export default async function handler(req, res) {
  const t0 = Date.now();
  const query = (req.query?.q || '').trim();

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!query || query.length < 2) {
    return res.status(200).json({
      query: '', results: [], total: 0, platforms: 0, elapsed: 0,
      error: 'Query too short (min 2 chars)'
    });
  }

  if (!GEMINI_API_KEY) {
    return res.status(200).json({
      query, results: [], total: 0, platforms: 0, elapsed: 0,
      error: 'GEMINI_API_KEY not configured',
      note: 'Add GEMINI_API_KEY to Vercel environment variables to enable live search.'
    });
  }

  try {
    const results = await searchWithGemini(query);
    const elapsed = Date.now() - t0;

    return res.status(200).json({
      query,
      results,
      total: results.length,
      platforms: [...new Set(results.map(r => r.platform))].length,
      elapsed,
      source: 'gemini-web-search',
      note: 'Resultados en tiempo real vía Google Search. Actualizados al momento.'
    });
  } catch (e) {
    console.error('[LIVE-SEARCH] Error:', e.message);
    return res.status(200).json({
      query, results: [], total: 0, platforms: 0,
      elapsed: Date.now() - t0,
      error: e.message
    });
  }
}

// ═══════════════════════════════════════════════════════════
// GEMINI SEARCH
// ═══════════════════════════════════════════════════════════

async function searchWithGemini(query) {
  const platformList = PLATFORM_DOMAINS.map(d => 'site:' + d).join(' OR ');

  const prompt = `Search the web for industrial auction listings matching: "${query}"

Focus on these auction platforms: ${PLATFORM_DOMAINS.join(', ')}

For each listing found, extract the following structured data:
- title: The equipment name/model
- price: numeric price amount (just the number, no currency symbol)
- currency: EUR, USD, GBP, or CHF
- platform: which platform it's listed on (surplex, netbid, troostwijk, goindustry, maynards, industrial_auctions, auctelia, bidspotter, machinio, exapro, or other)
- url: full URL to the listing
- country: country where the item is located (2-letter code: ES, DE, NL, FR, IT, UK, etc.)
- year: manufacturing year if mentioned
- condition: "used", "new", "refurbished", or null
- endDate: auction end date if mentioned (ISO format or description)

Return ONLY a JSON array of listing objects. No markdown, no explanation, no code blocks.
If no listings found, return an empty array [].

IMPORTANT: Return raw JSON only. Do NOT wrap in \`\`\`json or any markdown formatting.`;

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      tools: [{
        googleSearch: {}
      }],
      generationConfig: {
        temperature: 0.1,
        topP: 0.95,
        maxOutputTokens: 4096
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText.substring(0, 200)}`);
  }

  const data = await response.json();

  // Extract text from Gemini response
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!text) return [];

  // Parse JSON from response (handle both raw and code-fenced)
  let cleaned = text.trim();
  // Strip markdown code fences if present
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');

  try {
    const listings = JSON.parse(cleaned);
    if (!Array.isArray(listings)) return [];
    return listings.filter(l => l && l.title && l.title.length > 5).map(l => ({
      title: l.title,
      price: l.price || null,
      currency: l.currency || 'EUR',
      platform: normalizePlatform(l.platform || 'other'),
      url: l.url || null,
      location: { country: l.country || null },
      year: l.year || null,
      condition: l.condition || null,
      endDate: l.endDate || null
    }));
  } catch (e) {
    // Try to extract JSON array from text if direct parse fails
    const arrMatch = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (arrMatch) {
      try {
        const listings = JSON.parse(arrMatch[0]);
        if (!Array.isArray(listings)) return [];
        return listings.filter(l => l && l.title).map(l => ({
          title: l.title,
          price: l.price || null,
          currency: l.currency || 'EUR',
          platform: normalizePlatform(l.platform || 'other'),
          url: l.url || null,
          location: { country: l.country || null },
          year: l.year || null,
          condition: l.condition || null,
          endDate: l.endDate || null
        }));
      } catch {}
    }
    console.error('[LIVE-SEARCH] JSON parse error:', e.message, 'Text:', cleaned.substring(0, 300));
    return [];
  }
}

function normalizePlatform(name) {
  const lower = (name || '').toLowerCase();
  const map = {
    'surplex': 'surplex', 'surplex.com': 'surplex',
    'netbid': 'netbid', 'netbid.com': 'netbid',
    'troostwijk': 'troostwijk', 'troostwijk.nl': 'troostwijk',
    'goindustry': 'goindustry', 'goindustry.com': 'goindustry', 'goindustry dovebid': 'goindustry',
    'maynards': 'maynards', 'maynards.com': 'maynards',
    'industrialauctions': 'industrial_auctions', 'industrial auctions': 'industrial_auctions', 'industrial-auctions': 'industrial_auctions',
    'auctelia': 'auctelia', 'auctelia.com': 'auctelia',
    'bidspotter': 'bidspotter', 'bidspotter.com': 'bidspotter',
    'machinio': 'machinio', 'machinio.com': 'machinio',
    'exapro': 'exapro', 'exapro.com': 'exapro',
    'trademachines': 'trademachines', 'trademachines.com': 'trademachines',
    'asset-trade': 'asset_trade', 'asset-trade.de': 'asset_trade'
  };
  for (const [key, val] of Object.entries(map)) {
    if (lower === key || lower.includes(key)) return val;
  }
  return lower.replace(/[^a-z0-9_]/g, '_').substring(0, 30);
}
