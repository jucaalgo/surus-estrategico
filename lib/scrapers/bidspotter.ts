import type { RawAuctionItem, RawAuctionImage } from './types';
import { fetchPageAs$, fetchWithRetry, logScrape, checkZeroResults } from './resilience';
import type { CheerioAPI } from 'cheerio';

const BASE_URL = 'https://www.hibid.com';

const COUNTRY_MAP: Record<string, { country: string; countryCode: string; lat: number; lng: number }> = {
  'us': { country: 'Estados Unidos', countryCode: 'US', lat: 39.8283, lng: -98.5795 },
  'ca': { country: 'Canadá', countryCode: 'CA', lat: 56.1304, lng: -106.3468 },
  'gb': { country: 'Reino Unido', countryCode: 'UK', lat: 55.3781, lng: -3.4360 },
  'au': { country: 'Australia', countryCode: 'AU', lat: -25.2744, lng: 133.7751 },
  'de': { country: 'Alemania', countryCode: 'DE', lat: 51.1657, lng: 10.4515 },
  'nl': { country: 'Países Bajos', countryCode: 'NL', lat: 52.1326, lng: 5.2913 },
  'fr': { country: 'Francia', countryCode: 'FR', lat: 46.2276, lng: 2.2137 },
  'es': { country: 'España', countryCode: 'ES', lat: 40.4637, lng: -3.7492 },
};

function extractCountry(locationText: string): { country: string; countryCode: string; lat: number; lng: number } {
  const lower = locationText.toLowerCase();
  for (const [code, data] of Object.entries(COUNTRY_MAP)) {
    if (lower.includes(code.toUpperCase()) || lower.includes(data.country.toLowerCase())) {
      return data;
    }
  }
  // Common patterns
  if (lower.includes('united states') || lower.includes(', tx') || lower.includes(', ca') || lower.includes(', ny') || lower.includes(', fl') || lower.includes(', nj')) return COUNTRY_MAP['us'];
  if (lower.includes('united kingdom') || lower.includes('england') || lower.includes(', uk')) return COUNTRY_MAP['gb'];
  if (lower.includes('canada') || lower.includes(', on') || lower.includes(', bc')) return COUNTRY_MAP['ca'];
  if (lower.includes('australia') || lower.includes(', nsw') || lower.includes(', vic')) return COUNTRY_MAP['au'];
  if (lower.includes('deutschland') || lower.includes('germany')) return COUNTRY_MAP['de'];
  if (lower.includes('nederland') || lower.includes('netherlands')) return COUNTRY_MAP['nl'];
  return COUNTRY_MAP['us']; // HiBid is US-based
}

function parseDateRange(dateText: string): Date {
  // Format: "Fecha (o fechas) 5/5/2026 - 18/5/2026" or "5/5/2026 - 18/5/2026"
  const match = dateText.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s*-\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (match) {
    const endDate = new Date(parseInt(match[6]), parseInt(match[5]) - 1, parseInt(match[4]));
    if (!isNaN(endDate.getTime())) return endDate;
  }
  // Try single date
  const singleMatch = dateText.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (singleMatch) {
    const d = new Date(parseInt(singleMatch[3]), parseInt(singleMatch[2]) - 1, parseInt(singleMatch[1]));
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(Date.now() + 14 * 86400000);
}

function parseHibidAuctions($: CheerioAPI): RawAuctionItem[] {
  const items: RawAuctionItem[] = [];

  // HiBid auction cards — multiple selector strategies
  const cardSelectors = [
    'a[href*="/catalog/"]',
    '[class*="auction-card"]',
    '[class*="auction-item"]',
  ];

  let cards = $();
  for (const sel of cardSelectors) {
    cards = $(sel);
    if (cards.length > 0) break;
  }

  const seenIds = new Set<string>();

  cards.each((_, el) => {
    const card = $(el);
    const href = card.attr('href') || card.find('a[href*="/catalog/"]').first().attr('href') || '';
    if (!href || !href.includes('/catalog/')) return;

    // Extract lot ID from URL: /catalog/{id}/{slug}
    const idMatch = href.match(/\/catalog\/(\d+)\//);
    if (!idMatch) return;
    const lotId = `HIB-${idMatch[1]}`;
    if (seenIds.has(lotId)) return;
    seenIds.add(lotId);

    // Title — look in heading tags or the link text itself
    const title = card.find('h1, h2, h3, h4').first().text().trim() || card.text().trim().slice(0, 200);
    if (!title || title.length < 5) return;

    // Image
    const imgEl = card.find('img').first();
    const imgUrl = imgEl.attr('src') || imgEl.attr('data-src') || '';
    const imgAlt = imgEl.attr('alt') || title;

    // Source URL
    const sourceUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;

    // Date — look for date text patterns
    const dateText = card.text();
    const endDate = parseDateRange(dateText);

    // Location — look for address patterns
    const locationText = card.find('p, [class*="location"], [class*="address"]').text();
    // Try to extract from strong tags containing location info
    const strongText = card.find('strong').text();
    const fullLocationText = locationText || strongText || '';

    // Price — HiBid doesn't show prices in listings, check for bid amounts
    let price: number | null = null;
    const priceMatch = card.text().match(/\$([\d,]+(?:\.\d{2})?)/);
    if (priceMatch) {
      price = parseFloat(priceMatch[1].replace(/,/g, ''));
    }

    const countryData = extractCountry(fullLocationText);
    const cityMatch = fullLocationText.match(/([A-Z][a-zA-Z\s]+),\s*([A-Z]{2})\s+\d{5}/);
    const city = cityMatch ? cityMatch[1].trim() : fullLocationText.split(',')[0]?.trim() || '';

    const images: RawAuctionImage[] = [];
    if (imgUrl && !imgUrl.includes('data:')) {
      images.push({
        url: imgUrl.startsWith('http') ? imgUrl : `${BASE_URL}${imgUrl}`,
        alt: imgAlt,
        isPrimary: true,
        sortOrder: 0,
      });
    }

    items.push({
      platformId: 'hibid',
      lotId,
      title: title.slice(0, 200),
      description: title,
      category: 'Industrial',
      sourceUrl,
      currentBid: price,
      currency: 'USD',
      estimatedResale: price ? price * 2 : undefined,
      buyerPremiumPercent: 15,
      hasReserve: false,
      startingBid: price ? price * 0.5 : null,
      city,
      country: countryData.country,
      countryCode: countryData.countryCode,
      lat: countryData.lat,
      lng: countryData.lng,
      auctionEnd: endDate.toISOString(),
      inspectionAvailable: false,
      condition: 'good',
      images,
    });
  });

  return items;
}

export interface BidSpotterScrapeOptions {
  maxPages?: number;
  category?: string;
}

export async function scrapeBidSpotter(options: BidSpotterScrapeOptions = {}): Promise<RawAuctionItem[]> {
  const { maxPages = 3 } = options;
  const items: RawAuctionItem[] = [];

  logScrape('bidspotter', 'info', 'Fetching HiBid auction listings...');

  const $ = await fetchPageAs$(`${BASE_URL}/auctions/`);
  const pageItems = parseHibidAuctions($);
  items.push(...pageItems);
  logScrape('bidspotter', 'success', `Found ${pageItems.length} auctions on page 1`);

  for (let page = 2; page <= maxPages && pageItems.length > 0; page++) {
    try {
      const $next = await fetchPageAs$(`${BASE_URL}/auctions/?page=${page}`);
      const nextPageItems = parseHibidAuctions($next);
      if (nextPageItems.length === 0) break;
      items.push(...nextPageItems);
      logScrape('bidspotter', 'info', `Found ${nextPageItems.length} auctions on page ${page}`);
    } catch {
      break;
    }
  }

  const check = checkZeroResults('bidspotter', items.length, 3);
  if (check.isWarning) logScrape('bidspotter', 'warn', check.message);

  return items;
}