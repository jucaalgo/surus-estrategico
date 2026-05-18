import type { RawAuctionItem, RawAuctionImage } from './types';
import { fetchPageAs$, logScrape, checkZeroResults } from './resilience';
import type { CheerioAPI } from 'cheerio';

const BASE_URL = 'https://www.euroauctions.com';

const COUNTRY_MAP: Record<string, { country: string; countryCode: string; lat: number; lng: number }> = {
  'uk': { country: 'Reino Unido', countryCode: 'UK', lat: 55.3781, lng: -3.4360 },
  'ie': { country: 'Irlanda', countryCode: 'IE', lat: 53.1424, lng: -7.6921 },
  'de': { country: 'Alemania', countryCode: 'DE', lat: 51.1657, lng: 10.4515 },
  'nl': { country: 'Países Bajos', countryCode: 'NL', lat: 52.1326, lng: 5.2913 },
  'fr': { country: 'Francia', countryCode: 'FR', lat: 46.2276, lng: 2.2137 },
  'es': { country: 'España', countryCode: 'ES', lat: 40.4637, lng: -3.7492 },
  'it': { country: 'Italia', countryCode: 'IT', lat: 41.8719, lng: 12.5674 },
  'ae': { country: 'Emiratos Árabes', countryCode: 'AE', lat: 23.4241, lng: 53.8478 },
  'au': { country: 'Australia', countryCode: 'AU', lat: -25.2744, lng: 133.7751 },
};

function extractCountry(locationText: string): { country: string; countryCode: string; lat: number; lng: number } {
  const lower = locationText.toLowerCase();
  for (const [code, data] of Object.entries(COUNTRY_MAP)) {
    if (lower.includes(code.toUpperCase()) || lower.includes(data.country.toLowerCase())) {
      return data;
    }
  }
  if (lower.includes('united kingdom') || lower.includes('england') || lower.includes('scotland') || lower.includes('wales')) return COUNTRY_MAP['uk'];
  if (lower.includes('ireland') || lower.includes('éire')) return COUNTRY_MAP['ie'];
  if (lower.includes('deutschland') || lower.includes('germany')) return COUNTRY_MAP['de'];
  if (lower.includes('nederland') || lower.includes('netherlands')) return COUNTRY_MAP['nl'];
  if (lower.includes('dubai') || lower.includes('emirates') || lower.includes('uae')) return COUNTRY_MAP['ae'];
  return COUNTRY_MAP['uk']; // Euro Auctions is UK-based
}

function parseEuroAuctions($: CheerioAPI): RawAuctionItem[] {
  const items: RawAuctionItem[] = [];
  const seenIds = new Set<string>();

  // Multiple selector strategies for Euro Auctions
  const cardSelectors = [
    'a[href*="/auction/"]',
    'a[href*="/auctions/"]',
    '[class*="auction-card"]',
    '[class*="auction-item"]',
    '[class*="lot-"]',
    '.card',
  ];

  let cards = $();
  for (const sel of cardSelectors) {
    cards = $(sel);
    if (cards.length > 0) break;
  }

  cards.each((_, el) => {
    const card = $(el);

    // Get the link
    const href = card.attr('href') || card.find('a[href*="/auction/"], a[href*="/auctions/"]').first().attr('href') || '';
    if (!href) return;

    // Extract lot ID
    const idMatch = href.match(/\/auction[s]?\/(\d+)/) || href.match(/\/auction[s]?\/([a-zA-Z0-9-]+)/);
    if (!idMatch) return;
    const lotId = `EUR-${idMatch[1]}`;
    if (seenIds.has(lotId)) return;
    seenIds.add(lotId);

    // Title
    const title = card.find('h2, h3, h4, [class*="title"]').first().text().trim() || card.text().trim().slice(0, 200);
    if (!title || title.length < 5) return;

    // Image
    const imgEl = card.find('img').first();
    const imgUrl = imgEl.attr('src') || imgEl.attr('data-src') || '';
    const imgAlt = imgEl.attr('alt') || title;

    // Source URL
    const sourceUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;

    // Price — Euro Auctions shows prices in GBP/USD/EUR
    let price: number | null = null;
    const priceMatch = card.text().match(/([\d,]+(?:\.\d{2})?)\s*(€|EUR|£|GBP|\$|USD)/i);
    if (priceMatch) {
      price = parseFloat(priceMatch[1].replace(/,/g, ''));
    }

    // Date
    const dateText = card.find('time, [class*="date"], [class*="end"]').text().trim();
    const endDate = dateText ? new Date(dateText) : new Date(Date.now() + 14 * 86400000);
    if (isNaN(endDate.getTime())) endDate.setTime(Date.now() + 14 * 86400000);

    // Location
    const locationText = card.find('[class*="location"], [class*="address"], p').text().trim();
    const countryData = extractCountry(locationText);
    const city = locationText.split(',')[0]?.trim() || '';

    // Currency detection based on price symbol
    let currency = 'GBP';
    if (priceMatch) {
      const symbol = priceMatch[2].toUpperCase();
      if (symbol === '€' || symbol === 'EUR') currency = 'EUR';
      else if (symbol === '$' || symbol === 'USD') currency = 'USD';
      else if (symbol === '£' || symbol === 'GBP') currency = 'GBP';
    }

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
      platformId: 'euro-auctions',
      lotId,
      title: title.slice(0, 200),
      description: title,
      category: 'Industrial',
      sourceUrl,
      currentBid: price,
      currency,
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
      inspectionAvailable: true,
      condition: 'good',
      images,
    });
  });

  return items;
}

export interface EuroAuctionsScrapeOptions {
  maxPages?: number;
}

export async function scrapeEuroAuctions(options: EuroAuctionsScrapeOptions = {}): Promise<RawAuctionItem[]> {
  const items: RawAuctionItem[] = [];

  // Euro Auctions has multiple regional sites
  const urls = [
    `${BASE_URL}/auctions`,
    `${BASE_URL}/en/auctions`,
    `${BASE_URL}/auctions/upcoming`,
  ];

  for (const url of urls) {
    try {
      logScrape('euro-auctions', 'info', `Fetching Euro Auctions from ${url}...`);
      const $ = await fetchPageAs$(url);
      const pageItems = parseEuroAuctions($);

      if (pageItems.length > 0) {
        items.push(...pageItems);
        logScrape('euro-auctions', 'success', `Found ${pageItems.length} auctions from ${url}`);
        break; // Found results, no need to try other URLs
      }
    } catch {
      // Try next URL
      continue;
    }
  }

  const check = checkZeroResults('euro-auctions', items.length, 3);
  if (check.isWarning) logScrape('euro-auctions', 'warn', check.message);

  return items;
}