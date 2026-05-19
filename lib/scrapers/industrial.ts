import type { RawAuctionItem, RawAuctionImage } from './types';
import { fetchPageAs$, logScrape, checkZeroResults, scoreLot, fetchDetailPage, extractDescription, extractImages, extractSpecs } from './resilience';
import type { CheerioAPI } from 'cheerio';
import { SELECTORS } from './selectors';

const BASE_URL = 'https://www.industrial-auctions.com';

import { geocodeLocation } from '@/lib/engine/geocode';

const COUNTRY_MAP: Record<string, { country: string; countryCode: string }> = {
  'de': { country: 'Alemania', countryCode: 'DE' },
  'nl': { country: 'Países Bajos', countryCode: 'NL' },
  'uk': { country: 'Reino Unido', countryCode: 'UK' },
  'fr': { country: 'Francia', countryCode: 'FR' },
  'pl': { country: 'Polonia', countryCode: 'PL' },
  'lv': { country: 'Letonia', countryCode: 'LV' },
  'se': { country: 'Suecia', countryCode: 'SE' },
  'at': { country: 'Austria', countryCode: 'AT' },
  'cz': { country: 'Chequia', countryCode: 'CZ' },
  'es': { country: 'España', countryCode: 'ES' },
};

function extractCountryCode(locationText: string): string {
  const lower = locationText.toLowerCase();
  for (const [code, data] of Object.entries(COUNTRY_MAP)) {
    if (lower.includes(code.toUpperCase()) || lower.includes(data.country.toLowerCase())) {
      return data.countryCode;
    }
  }
  if (lower.includes('deutschland') || lower.includes('germany')) return 'DE';
  if (lower.includes('nederland') || lower.includes('netherlands')) return 'NL';
  if (lower.includes('österreich') || lower.includes('austria')) return 'AT';
  if (lower.includes('polen') || lower.includes('poland')) return 'PL';
  if (lower.includes('spain') || lower.includes('españa')) return 'ES';
  if (lower.includes('france')) return 'FR';
  if (lower.includes('italy') || lower.includes('italia')) return 'IT';
  if (lower.includes('united kingdom') || lower.includes('great britain')) return 'UK';
  return 'NL'; // default
}

function parseIndustrialAuctions($: CheerioAPI): RawAuctionItem[] {
  const items: RawAuctionItem[] = [];
  const sels = SELECTORS.industrial;

  let cards = $(sels.primary.listing);
  if (cards.length === 0) {
    cards = $(sels.fallback.listing);
  }

  cards.each((_, el) => {
    const card = $(el);

    let linkEl = card.find(sels.primary.link).first();
    if (linkEl.length === 0) linkEl = card.find(sels.fallback.link).first();
    const href = linkEl.attr('href') || (card.is('a') ? card.attr('href') : '') || '';
    if (!href || !href.includes('/auctions/')) return;

    let titleEl = card.find(sels.primary.title).first();
    if (titleEl.length === 0) titleEl = card.find(sels.fallback.title).first();
    const title = titleEl.text().trim();
    if (!title || title.length < 5) return;

    // Pick first non-flag/SVG image in the card
    let imgUrl = '';
    let imgAlt = title;
    const allImgs = card.find('img');
    for (let i = 0; i < allImgs.length; i++) {
      const el = allImgs.eq(i);
      const src = el.attr('src') || el.attr('data-src') || el.attr('data-lazy-src') || '';
      if (src && !src.includes('/flag-') && !src.endsWith('.svg') && !src.includes('/icon')) {
        imgUrl = src;
        imgAlt = el.attr('alt') || title;
        break;
      }
    }

    // Extract price
    let price: number | null = null;
    const priceMatch = card.text().match(/([\d.,]+)\s*(€|EUR)/i);
    if (priceMatch) {
      price = parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.'));
    }

    // Extract end date
    let endDateEl = card.find(sels.primary.endDate).first();
    if (endDateEl.length === 0) endDateEl = card.find(sels.fallback.endDate).first();
    const endDateText = endDateEl.attr('datetime') || endDateEl.text().trim();
    const endDate = endDateText ? new Date(endDateText) : new Date(Date.now() + 14 * 86400000);
    if (isNaN(endDate.getTime())) endDate.setTime(Date.now() + 14 * 86400000);

    // Extract location
    let locationEl = card.find(sels.primary.location).first();
    if (locationEl.length === 0) locationEl = card.find(sels.fallback.location).first();
    const locationText = locationEl.text().trim();

    const sourceUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;
    const lotIdMatch = href.match(/\/auctions\/(\d+)/);
    const lotId = lotIdMatch ? `IND-${lotIdMatch[1]}` : `IND-${Date.now()}-${items.length}`;

    const countryCode = extractCountryCode(locationText);
    const city = locationText.split(',')[0]?.trim() || '';

    const images: RawAuctionImage[] = [];
    if (imgUrl) {
      images.push({ url: imgUrl.startsWith('http') ? imgUrl : `${BASE_URL}${imgUrl}`, alt: imgAlt, isPrimary: true, sortOrder: 0 });
    }

    items.push({
      platformId: 'industrial-auctions',
      lotId,
      title: title.slice(0, 200),
      description: title,
      category: 'Industrial',
      sourceUrl,
      currentBid: price,
      currency: priceMatch ? (priceMatch[2] || 'EUR') : 'EUR',
      estimatedResale: price ? price * 1.5 : undefined,
      buyerPremiumPercent: 15,
      hasReserve: false,
      startingBid: price ? price * 0.5 : null,
      city,
      country: COUNTRY_MAP[countryCode.toLowerCase()]?.country || countryCode,
      countryCode,
      lat: undefined, // will be geocoded later
      lng: undefined,
      auctionEnd: endDate.toISOString(),
      inspectionAvailable: true,
      condition: 'unknown',
      images,
      detailScraped: false,
    });
  });

  return items;
}

async function scrapeIndustrialDetail(item: RawAuctionItem): Promise<Partial<RawAuctionItem>> {
  const $ = await fetchDetailPage(item.sourceUrl);
  if (!$) return {};

  const description = extractDescription($, item.description);
  const images = extractImages($, BASE_URL, item.title, item.images);
  const specs = extractSpecs($);

  const bodyText = $('body').text();
  const priceMatch = bodyText.match(/current\s*bid[:\s\S]{0,40}?([\d.,]+)\s*(€|EUR)/i) ||
    bodyText.match(/(?:bid|price|current)[:\s\S]{0,30}?([\d.,]+)\s*(€|EUR)/i);
  const currentBid = priceMatch
    ? parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.'))
    : item.currentBid;

  return { description, images, currentBid, ...specs };
}

export interface IndustrialScrapeOptions {
  maxPages?: number;
}

export async function scrapeIndustrial(options: IndustrialScrapeOptions = {}): Promise<RawAuctionItem[]> {
  const items: RawAuctionItem[] = [];

  logScrape('industrial', 'info', 'Fetching Industrial Auctions homepage...');
  const $ = await fetchPageAs$(BASE_URL);
  const pageItems = parseIndustrialAuctions($);
  items.push(...pageItems);
  logScrape('industrial', 'success', `Found ${pageItems.length} auctions on homepage`);

  // Geocode all items with rate limiting
  logScrape('industrial', 'info', `Geocoding ${items.length} locations...`);
  let geoCount = 0;
  for (const item of items) {
    try {
      const geo = await geocodeLocation(item.city, item.countryCode);
      item.lat = geo.lat;
      item.lng = geo.lng;
      geoCount++;
    } catch {
      // keep undefined coordinates — fallback will apply later
    }
  }
  logScrape('industrial', 'success', `Geocoded ${geoCount}/${items.length} locations`);

  // Detail scraping for ALL items (limit 50 to avoid timeout)
  const detailLimit = 50;
  logScrape('industrial', 'info', `Fetching details for ${Math.min(items.length, detailLimit)} lots...`);
  let detailCount = 0;
  for (let i = 0; i < Math.min(items.length, detailLimit); i++) {
    const item = items[i];
    const detail = await scrapeIndustrialDetail(item);
    if (Object.keys(detail).length > 0) {
      Object.assign(item, detail);
      item.detailScraped = true;
      detailCount++;
    }
  }
  logScrape('industrial', 'success', `Details extracted: ${detailCount}/${Math.min(items.length, detailLimit)}`);

  const check = checkZeroResults('industrial', items.length, 3);
  if (check.isWarning) logScrape('industrial', 'warn', check.message);

  return items;
}