import { NextRequest, NextResponse } from 'next/server';
import type { Asset, SearchResult } from '@/lib/types';
import { calculateKPIs } from '@/lib/calculations';
import { getExchangeRates } from '@/lib/exchange-rates';
import { ACTIVE_ASSETS, getActiveAssets, PLATFORMS } from '@/lib/mock-data';

const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 30;
const rateLimiter = new Map<string, { count: number; reset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimiter.get(ip);
  if (!entry || now > entry.reset) {
    rateLimiter.set(ip, { count: 1, reset: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

const COUNTRY_COORDS: Record<string, [number, number]> = {
  ES: [40.4, -3.7], DE: [51.1, 10.4], NL: [52.3, 4.9], FR: [46.6, 2.2],
  IT: [41.9, 12.5], UK: [51.5, -0.1], US: [39.8, -98.5], CZ: [49.8, 15.5],
  PL: [51.9, 19.1], BE: [50.8, 4.3], CH: [46.8, 8.2], AT: [47.7, 13.3],
};

const CACHE_TTL = 5 * 60_000;
const searchCache = new Map<string, { result: SearchResult; expires: number }>();

function transformGeminiResult(item: Record<string, unknown>, query: string): Asset | null {
  const title = (item.title as string) || '';
  if (!title || title.length < 5) return null;

  const priceRaw = item.price;
  const priceNum = typeof priceRaw === 'number' ? priceRaw
    : typeof priceRaw === 'object' && priceRaw !== null ? (priceRaw as { amount?: number }).amount || 0
    : 0;
  const currency = (item.currency as string) || 'EUR';
  const platformName = (item.platform as string) || 'unknown';
  const country = (item.country as string) || '';
  const condition = (item.condition as string) || 'good';
  const year = (item.year as number) || undefined;

  const countryCode = Object.entries(COUNTRY_COORDS).find(([code]) =>
    country.toLowerCase().includes(code.toLowerCase())
  )?.[0] || 'ES';

  const coords = COUNTRY_COORDS[countryCode] || [40.4, -3.7];
  const lat = (item.lat as number) || (item.location && typeof item.location === 'object' && 'lat' in (item.location as object) ? (item.location as { lat: number }).lat : coords[0]);
  const lng = (item.lng as number) || (item.location && typeof item.location === 'object' && 'lng' in (item.location as object) ? (item.location as { lng: number }).lng : coords[1]);

  const estimatedResale = priceNum > 0 ? Math.round(priceNum * (1.4 + Math.random() * 0.4)) : 50000;

  const platform = PLATFORMS.find(p =>
    platformName.toLowerCase().includes(p.id) || platformName.toLowerCase().includes(p.name.toLowerCase())
  ) || { id: platformName.replace(/[^a-z0-9_]/g, '_'), name: platformName, country: countryCode, trustScore: 5, active: true };

  const specs = {
    make: title.split(' ')[0] || undefined,
    model: title.split(' ').slice(1, 3).join(' ') || undefined,
    year,
    condition: (['excellent', 'good', 'fair', 'poor'].includes(condition) ? condition : 'good') as 'excellent' | 'good' | 'fair' | 'poor',
    hours: year ? Math.round((new Date().getFullYear() - year) * 2000) : undefined,
    weight: 2000,
  };

  const pricing = {
    currentBid: priceNum || null,
    currency,
    estimatedResale,
    buyerPremiumPercent: 16,
    reservePrice: null,
    hasReserve: false,
    startingBid: priceNum ? Math.round(priceNum * 0.5) : null,
  };

  const endDate = (item.endDate as string) || new Date(Date.now() + 7 * 86400000).toISOString();
  const timeRemainingMs = Math.max(0, new Date(endDate).getTime() - Date.now());

  return {
    id: `${platform.id}-${Math.random().toString(36).substring(2, 8)}`,
    title,
    description: `${title} - ${country}`,
    category: 'Industrial',
    platform,
    pricing,
    location: { city: country, country, countryCode, lat, lng },
    timing: { auctionEnd: endDate, timeRemainingMs, inspectionAvailable: true },
    specs,
    kpis: calculateKPIs(pricing, specs, countryCode),
    sourceUrl: (item.url as string) || undefined,
    source: 'gemini',
  };
}

async function searchWithGemini(query: string, strategy: string): Promise<Asset[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return [];

  const prompts: Record<string, string> = {
    broad: `Search the web for industrial auction listings matching: "${query}". Return a JSON array of objects with: title, price (number in EUR), currency, platform, url, country, year, condition, endDate. Max 10 results.`,
    specific: `Search these industrial auction platforms for "${query}": Surplex, Troostwijk, NetBid, GoIndustry, Maynards, Industrial Auctions, Auctelia, BidSpotter. Return a JSON array of objects with: title, price (number in EUR), currency, platform, url, country, year, condition, endDate. Max 10 results.`,
    platforms: `Search surplex.com, netbid.com, troostwijk.nl, goindustry.com for "${query}". Return a JSON array of objects with: title, price (number in EUR), currency, platform, url, country, year, condition, endDate. Max 8 results.`,
  };

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompts[strategy] || prompts.broad }] }],
          tools: [{ googleSearch: {} }],
          generationConfig: { temperature: 0.3, topP: 0.95, maxOutputTokens: 8192 },
        }),
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) return [];

    // Extract JSON from response
    let jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = jsonStr.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) return [];

    const items = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(items)) return [];

    return items.map((item: Record<string, unknown>) => transformGeminiResult(item, query)).filter((a: Asset | null): a is Asset => a !== null);
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
  }

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // Check cache
  const cached = searchCache.get(query);
  if (cached && Date.now() < cached.expires) {
    return NextResponse.json(cached.result);
  }

  const startTime = Date.now();

  // 1. Local mock filter (instant)
  const q = query.toLowerCase();
  const localResults = getActiveAssets().filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.description.toLowerCase().includes(q) ||
    a.category.toLowerCase().includes(q) ||
    a.location.city.toLowerCase().includes(q) ||
    a.location.country.toLowerCase().includes(q) ||
    (a.specs.make && a.specs.make.toLowerCase().includes(q))
  );

  // 2. Gemini search (if API key available)
  let geminiAssets: Asset[] = [];
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const [broad, specific, platforms] = await Promise.allSettled([
        searchWithGemini(query, 'broad'),
        searchWithGemini(query, 'specific'),
        searchWithGemini(query, 'platforms'),
      ]);

      for (const result of [broad, specific, platforms]) {
        if (result.status === 'fulfilled' && result.value) {
          geminiAssets.push(...result.value);
        }
      }

      // Deduplicate by title
      const seen = new Set<string>();
      geminiAssets = geminiAssets.filter(a => {
        const key = a.title.substring(0, 60).toLowerCase().replace(/\s+/g, ' ');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).slice(0, 20);
    } catch {
      // Gemini failed, continue with local results
    }
  }

  // Merge: Gemini results first, then local (deduplicated)
  const geminiIds = new Set(geminiAssets.map(a => a.id));
  const merged = [...geminiAssets, ...localResults.filter(a => !geminiIds.has(a.id))];

  const result: SearchResult = {
    query,
    total: merged.length,
    elapsed: Date.now() - startTime,
    assets: merged,
    platforms: new Set(merged.map(a => a.platform.id)).size,
    source: apiKey ? 'local+gemini' : 'local-only',
  };

  // Cache
  searchCache.set(query, { result, expires: Date.now() + CACHE_TTL });

  return NextResponse.json(result);
}