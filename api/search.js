// ============================================================
// SURUS SHARK ENGINE — Search + Analysis API
// /api/search?q=kuka
//
// Pipeline:
//   1. Get live exchange rates
//   2. Search data sources (live scrape attempts + pre-scraped cache + mock data)
//   3. Normalize prices to EUR
//   4. Deduplicate cross-platform listings
//   5. Calculate ganga scores
//   6. Rank by best deal
// ============================================================

// ═══════════════════════════════════════════════════════════
// EXCHANGE RATES
// ═══════════════════════════════════════════════════════════

let ratesCache = null;
let ratesCacheTime = 0;

async function getExchangeRates() {
  if (ratesCache && (Date.now() - ratesCacheTime) < 1800000) return ratesCache; // 30min cache

  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=EUR', {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      ratesCache = { ...data.rates, EUR: 1 };
      ratesCacheTime = Date.now();
      return ratesCache;
    }
  } catch (e) { /* fallback */ }

  // Fallback
  return { EUR: 1, USD: 0.88, GBP: 1.16, CHF: 1.02, SEK: 0.086, NOK: 0.083, DKK: 0.134, PLN: 0.23, CZK: 0.040, TRY: 0.027, BRL: 0.16, MXN: 0.048, CAD: 0.65, AUD: 0.58, JPY: 0.0062, CNY: 0.12 };
}

// ═══════════════════════════════════════════════════════════
// PLATFORM SCRAPERS — each tries to fetch real data
// ═══════════════════════════════════════════════════════════

const PLATFORMS = [
  {
    id: 'surplex',
    name: 'Surplex',
    country: 'DE',
    baseUrl: 'https://www.surplex.com',
    // Surplex is Next.js SPA. Try their internal data API.
    fetchResults: async (q) => {
      try {
        const url = `https://www.surplex.com/en/search?fulltext=${encodeURIComponent(q)}`;
        const res = await fetch(url, { headers: { 'Accept': 'text/html', 'User-Agent': 'Mozilla/5.0' } });
        const html = await res.text();
        return parseHtmlResults(html, 'surplex', 'https://www.surplex.com');
      } catch (e) { return []; }
    }
  },
  {
    id: 'netbid',
    name: 'NetBid',
    country: 'DE',
    baseUrl: 'https://www.netbid.com',
    fetchResults: async (q) => {
      try {
        const url = `https://www.netbid.com/en/search/?q=${encodeURIComponent(q)}`;
        const res = await fetch(url, { headers: { 'Accept': 'text/html', 'User-Agent': 'Mozilla/5.0' } });
        const html = await res.text();
        return parseHtmlResults(html, 'netbid', 'https://www.netbid.com');
      } catch (e) { return []; }
    }
  },
  {
    id: 'troostwijk',
    name: 'Troostwijk',
    country: 'NL',
    baseUrl: 'https://www.troostwijk.nl',
    fetchResults: async (q) => {
      try {
        const url = `https://www.troostwijk.nl/en/search?q=${encodeURIComponent(q)}`;
        const res = await fetch(url, { headers: { 'Accept': 'text/html', 'User-Agent': 'Mozilla/5.0' } });
        const html = await res.text();
        return parseHtmlResults(html, 'troostwijk', 'https://www.troostwijk.nl');
      } catch (e) { return []; }
    }
  },
  {
    id: 'goindustry',
    name: 'GoIndustry',
    country: 'UK',
    baseUrl: 'https://www.goindustry.com',
    fetchResults: async (q) => {
      try {
        const url = `https://www.goindustry.com/en/search/?q=${encodeURIComponent(q)}`;
        const res = await fetch(url, { headers: { 'Accept': 'text/html', 'User-Agent': 'Mozilla/5.0' } });
        const html = await res.text();
        return parseHtmlResults(html, 'goindustry', 'https://www.goindustry.com');
      } catch (e) { return []; }
    }
  },
  {
    id: 'maynards',
    name: 'Maynards',
    country: 'DE',
    baseUrl: 'https://www.maynards.com',
    fetchResults: async (q) => {
      try {
        const url = `https://www.maynards.com/en/search/?q=${encodeURIComponent(q)}`;
        const res = await fetch(url, { headers: { 'Accept': 'text/html', 'User-Agent': 'Mozilla/5.0' } });
        const html = await res.text();
        return parseHtmlResults(html, 'maynards', 'https://www.maynards.com');
      } catch (e) { return []; }
    }
  },
  {
    id: 'industrial_auctions',
    name: 'Industrial Auctions',
    country: 'NL',
    baseUrl: 'https://www.industrial-auctions.com',
    fetchResults: async (q) => {
      try {
        const url = `https://www.industrial-auctions.com/en/search/?q=${encodeURIComponent(q)}`;
        const res = await fetch(url, { headers: { 'Accept': 'text/html', 'User-Agent': 'Mozilla/5.0' } });
        const html = await res.text();
        return parseHtmlResults(html, 'industrial_auctions', 'https://www.industrial-auctions.com');
      } catch (e) { return []; }
    }
  },
  {
    id: 'auctelia',
    name: 'Auctelia',
    country: 'FR',
    baseUrl: 'https://www.auctelia.com',
    fetchResults: async (q) => {
      try {
        const url = `https://www.auctelia.com/en/search?q=${encodeURIComponent(q)}`;
        const res = await fetch(url, { headers: { 'Accept': 'text/html', 'User-Agent': 'Mozilla/5.0' } });
        const html = await res.text();
        return parseHtmlResults(html, 'auctelia', 'https://www.auctelia.com');
      } catch (e) { return []; }
    }
  },
  {
    id: 'bidspotter',
    name: 'BidSpotter',
    country: 'UK',
    baseUrl: 'https://www.bidspotter.com',
    fetchResults: async (q) => {
      try {
        const url = `https://www.bidspotter.com/en-us/search?q=${encodeURIComponent(q)}`;
        const res = await fetch(url, { headers: { 'Accept': 'text/html', 'User-Agent': 'Mozilla/5.0' } });
        const html = await res.text();
        return parseHtmlResults(html, 'bidspotter', 'https://www.bidspotter.com');
      } catch (e) { return []; }
    }
  }
];

// ═══════════════════════════════════════════════════════════
// NOISE FILTER — rejects boilerplate / non-listing text
// ═══════════════════════════════════════════════════════════

const NOISE_PATTERNS = [
  /exchange\s*rates?\s*are\s*updated/i, /transport\s*and\s*logistics/i,
  /follow\s*us/i, /stay\s*informed/i, /join\s*our\s*mailing/i,
  /sorry.*page.*(?:not|could\s*not)\s*be\s*found/i, /page\s*not\s*found/i,
  /newsletter/i, /subscribe/i, /cookie\s*(?:policy|consent|settings)/i,
  /privacy\s*(?:policy|notice)/i, /terms\s*(?:of|and)\s*(?:use|service|conditions)/i,
  /all\s*rights?\s*reserved/i, /copyright\s*©?\s*\d{4}/i,
  /search\s*results?\s*for/i, /your\s*(?:search|query)/i,
  /no\s*results?\s*found/i, /we\s*(?:couldn't|could\s*not)\s*find/i,
  /accept\s*(?:all\s*)?cookies/i, /manage\s*(?:cookie\s*)?preferences/i,
  /sign\s*(?:in|up|out)/i, /log\s*(?:in|out)/i, /create\s*(?:an?\s*)?account/i,
  /shopping\s*cart/i, /check\s*out/i, /free\s*shipping/i,
  /language\s*selector/i, /select\s*(?:your\s*)?(?:language|country|region)/i
];

const INDUSTRIAL_KEYWORDS = [
  'robot','cnc','machine','press','motor','pump','line','plant','turbine',
  'generator','press','machining','milling','lathe','drill','grinder',
  'welding','laser','cutter','injection','molding','extruder',
  'conveyor','crane','forklift','compressor','boiler','tank',
  'mixer','centrifuge','separator','filter','dryer','oven','furnace',
  'packaging','filling','labeling','sealing','wrapping',
  'solar','panel','transformer','switchgear','valve','actuator',
  'kuka','fanuc','abb','siemens','dmg','mori','mazak','haas',
  'trumpf','amada','bystronic','arburg','engel','demag','krauss',
  'tetra','pak','sidel','khs','krones','bosch','rexroth'
];

function isNoise(title) {
  if (!title || title.length < 10 || title.length > 250) return true;
  for (const p of NOISE_PATTERNS) {
    if (p.test(title)) return true;
  }
  // Must contain some industrial signal
  const lower = title.toLowerCase();
  const hasKeyword = INDUSTRIAL_KEYWORDS.some(kw => lower.includes(kw));
  const hasNumber = /\d/.test(title);
  const hasPrice = /[€$£]/.test(title);
  if (!hasKeyword && !hasNumber && !hasPrice) return true;
  return false;
}

// ═══════════════════════════════════════════════════════════
// PRE-SCRAPED DATA LOADER
// ═══════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

function loadScrapedData(query) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'dashboard', 'scraped-data.json');
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.results) return [];

    const q = query.toLowerCase();
    const matches = [];

    for (const [platformId, items] of Object.entries(data.results)) {
      for (const item of items) {
        if (!item.title) continue;
        if (item.title.toLowerCase().includes(q)) {
          matches.push({
            title: item.title,
            url: item.url || null,
            platform: platformId,
            price: {
              amount: item.price || null,
              currency: item.currency || 'EUR'
            },
            location: { country: item.country || null },
            timeRemaining: null,
            _source: 'playwright-scraper'
          });
        }
      }
    }
    return matches;
  } catch (e) {
    console.log('[SHARK] No pre-scraped data available');
    return [];
  }
}

// ═══════════════════════════════════════════════════════════
// HTML PARSER — extracts listings from raw HTML
// ═══════════════════════════════════════════════════════════

function parseHtmlResults(html, platformId, baseUrl) {
  const results = [];
  if (!html || html.length < 500) return results;

  const blocks = [];

  // Pattern 1: <article> tags
  const articleRegex = /<article[^>]*>([\s\S]*?)<\/article>/gi;
  let match;
  while ((match = articleRegex.exec(html)) !== null) {
    blocks.push({ html: match[1], start: match.index });
  }

  // Pattern 2: <a> tags with href that look like listings
  if (blocks.length === 0) {
    const linkRegex = /<a[^>]*href="(\/(?:en|es|de|nl|fr)?\/?(?:lot|auction|item|listing|machine|asset)\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    while ((match = linkRegex.exec(html)) !== null) {
      blocks.push({ html: match[2], start: match.index, href: match[1] });
    }
  }

  // Pattern 3: Generic card divs
  if (blocks.length === 0) {
    const cardRegex = /<(?:div|li)[^>]*class="[^"]*(?:card|item|listing|result|product|lot)[^"]*"[^>]*>([\s\S]*?)<\/(?:div|li)>/gi;
    while ((match = cardRegex.exec(html)) !== null) {
      blocks.push({ html: match[1], start: match.index });
    }
  }

  for (const block of blocks.slice(0, 30)) {
    const text = block.html;

    let title = '';
    const titleMatch = text.match(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i) ||
                      text.match(/<strong[^>]*>([\s\S]*?)<\/strong>/i) ||
                      text.match(/>([^<]{20,150})</);
    if (titleMatch) title = cleanHtml(titleMatch[1]);

    if (isNoise(title)) continue;

    const priceMatch = text.match(/(?:€|EUR|£|GBP|\$|USD|CHF)\s*(\d[\d.,]*)/i) ||
                       text.match(/(\d[\d.,]*)\s*(?:€|EUR|£|GBP|\$|USD|CHF)/i);
    let priceAmount = null, priceCurrency = 'EUR';
    if (priceMatch) {
      priceAmount = parseNumber(priceMatch[1]);
      const ctx = priceMatch[0];
      if (/£|GBP/i.test(ctx)) priceCurrency = 'GBP';
      else if (/\$|USD/i.test(ctx)) priceCurrency = 'USD';
      else if (/CHF/i.test(ctx)) priceCurrency = 'CHF';
    }

    let location = {};
    const locMatch = text.match(/(?:Spain|España|Germany|Deutschland|Netherlands|France|Italia|Italy|Poland|Polonia|Belgium|UK|United Kingdom|Austria|Sweden|Romania|Hungary|Czech|Turkey|Portugal|USA)/i);
    if (locMatch) {
      const countryMap = { 'Spain': 'ES', 'España': 'ES', 'Germany': 'DE', 'Deutschland': 'DE', 'Netherlands': 'NL', 'France': 'FR', 'Italy': 'IT', 'Italia': 'IT', 'Poland': 'PL', 'Polonia': 'PL', 'Belgium': 'BE', 'UK': 'GB', 'United Kingdom': 'GB', 'Austria': 'AT', 'Sweden': 'SE', 'Romania': 'RO', 'Hungary': 'HU', 'Czech': 'CZ', 'Turkey': 'TR', 'Portugal': 'PT', 'USA': 'US' };
      location.country = countryMap[locMatch[0]] || null;
    }

    let timeStr = null;
    const timeMatch = text.match(/(\d+)\s*(?:days?|horas?|hours?|días?|h|d|min)\b/i);
    if (timeMatch) timeStr = timeMatch[0];

    results.push({
      title,
      url: block.href ? (baseUrl + block.href) : null,
      platform: platformId,
      price: { amount: priceAmount, currency: priceCurrency },
      location,
      timeRemaining: timeStr
    });
  }

  return results;
}

function cleanHtml(str) {
  return str.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

function parseNumber(str) {
  if (!str) return null;
  const cleaned = str.replace(/[.,](?=\d{3}(\D|$))/g, '').replace(',', '.');
  return parseFloat(cleaned) || null;
}

// ═══════════════════════════════════════════════════════════
// ANALYSIS ENGINE
// ═══════════════════════════════════════════════════════════

function normalizeAndRank(rawResults, rates) {
  // Convert all prices to EUR
  const normalized = rawResults
    .filter(r => r.title && r.title.length > 10)
    .map(r => ({
      id: r.platform + '--' + hashStr(r.title),
      title: r.title,
      url: r.url,
      platform: { id: r.platform, name: getPlatformName(r.platform) },
      price: {
        amount: r.price?.amount || null,
        currency: r.price?.currency || 'EUR',
        amountEur: r.price?.amount
          ? convertToEur(r.price.amount, r.price.currency || 'EUR', rates)
          : null
      },
      location: r.location || {},
      timeRemaining: r.timeRemaining || null,
      source: r._source || 'scrape'
    }));

  // Deduplicate by similar titles
  const deduped = deduplicate(normalized);

  // Calculate ganga score
  deduped.forEach(item => {
    item.gangaScore = scoreItem(item);
    item.isCrossListed = (item.crossPlatformListings || []).length > 1;
  });

  // Rank: with price first (by score), without price last
  const withPrice = deduped.filter(r => r.price.amountEur).sort((a, b) => b.gangaScore - a.gangaScore);
  const withoutPrice = deduped.filter(r => !r.price.amountEur).sort((a, b) => b.gangaScore - a.gangaScore);

  return [...withPrice, ...withoutPrice];
}

function deduplicate(items) {
  const groups = [];
  for (const item of items) {
    let found = false;
    for (const group of groups) {
      if (group[0].platform.id !== item.platform.id &&
          titleSimilarity(group[0].title, item.title) > 0.65) {
        group.push(item);
        found = true;
        break;
      }
    }
    if (!found) groups.push([item]);
  }

  return groups.map(group => {
    const main = group[0];
    return {
      ...main,
      crossPlatformListings: group.map(g => ({
        platform: g.platform, url: g.url, price: g.price
      })),
      crossPlatformCount: group.length
    };
  });
}

function titleSimilarity(a, b) {
  const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const wa = new Set(norm(a).split(' ').filter(w => w.length > 2));
  const wb = norm(b).split(' ').filter(w => w.length > 2);
  if (wa.size === 0 || wb.length === 0) return 0;
  let matches = 0;
  for (const w of wb) {
    if (wa.has(w)) matches++;
    else { for (const x of wa) { if (x.includes(w) || w.includes(x)) { matches += 0.5; break; } } }
  }
  return matches / Math.max(wb.length, 1);
}

function scoreItem(item) {
  let s = 0;
  if (item.price.amountEur) s += 35;
  s += Math.min((item.crossPlatformCount || 1) * 8, 24);
  if (item.location?.country) s += 10;
  if (item.timeRemaining) s += 8;
  const trust = { surplex: 8, netbid: 7, troostwijk: 7, goindustry: 7, maynards: 5, industrial_auctions: 5, auctelia: 4, bidspotter: 5 };
  s += trust[item.platform.id] || 3;
  if (item.title.length > 40) s += 5;
  if (item.title.length > 70) s += 3;
  return Math.min(s, 100);
}

function getPlatformName(id) {
  const map = { surplex: 'Surplex', netbid: 'NetBid', troostwijk: 'Troostwijk', goindustry: 'GoIndustry', maynards: 'Maynards', industrial_auctions: 'Industrial Auctions', auctelia: 'Auctelia', bidspotter: 'BidSpotter' };
  return map[id] || id;
}

function convertToEur(amount, currency, rates) {
  if (currency === 'EUR') return amount;
  const rate = rates[currency];
  if (!rate) return amount; // unknown currency, assume EUR
  return Math.round(amount / rate);
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < Math.min(s.length, 80); i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h).toString(36);
}

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
      query: '', totalResults: 0, analyzed: 0, ranked: [],
      platformsScanned: PLATFORMS.length, elapsed: 0,
      error: 'Query too short (min 2 chars)'
    });
  }

  // 1. Get live exchange rates
  const rates = await getExchangeRates();

  // 2. Load pre-scraped data (from GitHub Action Playwright scraper)
  const preScraped = loadScrapedData(query);
  if (preScraped.length > 0) {
    console.log(`[SHARK] Pre-scraped: ${preScraped.length} matches for "${query}"`);
  }

  // 3. Scrape all platforms in parallel (live fetch attempts)
  const scrapeResults = await Promise.all(
    PLATFORMS.map(async p => {
      try {
        const results = await p.fetchResults(query);
        return { platform: p.id, name: p.name, count: results.length, results };
      } catch (e) {
        return { platform: p.id, name: p.name, count: 0, results: [], error: e.message };
      }
    })
  );

  // 4. Flatten: pre-scraped first (higher quality), then live scrape
  const allRaw = [...preScraped];
  scrapeResults.forEach(p => {
    p.results.forEach(r => { r._source = 'scrape'; allRaw.push(r); });
  });

  const tScrape = Date.now();

  // 5. Normalize + rank
  const ranked = normalizeAndRank(allRaw, rates);

  const elapsed = Date.now() - t0;
  const platformsWithData = scrapeResults.filter(p => p.count > 0);

  console.log(`[SHARK] "${query}" → ${preScraped.length} cached + ${allRaw.length - preScraped.length} live → ${ranked.length} ranked | ${platformsWithData.length}/${PLATFORMS.length} live platforms | ${elapsed}ms`);

  // Build platform breakdown including pre-scraped
  const breakdown = scrapeResults.map(p => ({
    platform: p.platform,
    name: p.name,
    count: p.count,
    error: p.error || null
  }));

  // Add pre-scraped as a virtual source
  if (preScraped.length > 0) {
    breakdown.unshift({
      platform: '_pre_scraped',
      name: 'Playwright Cache',
      count: preScraped.length,
      error: null
    });
  }

  return res.status(200).json({
    query,
    totalRaw: allRaw.length,
    preScrapedCount: preScraped.length,
    analyzed: ranked.length,
    platformsScanned: PLATFORMS.length,
    platformsWithResults: platformsWithData.length,
    platformBreakdown: breakdown,
    ranked: ranked.slice(0, 100),
    crossListedCount: ranked.filter(r => r.isCrossListed).length,
    withPriceCount: ranked.filter(r => r.price.amountEur).length,
    rates: { base: 'EUR', currencies: Object.keys(rates).length },
    elapsed,
    note: (allRaw.length === 0 || ranked.length === 0)
      ? 'No se encontraron resultados. Las plataformas usan JavaScript (SPAs) — usa el Web Scraper (⚡ icono) para resultados con Playwright.'
      : null
  });
}
