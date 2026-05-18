import type { RawAuctionItem, RawAuctionImage } from './types';
import { fetchPageAs$, logScrape, checkZeroResults } from './resilience';
import type { CheerioAPI } from 'cheerio';
import { SELECTORS } from './selectors';

const BASE_URL = 'https://www.netbid.com';

const COUNTRY_MAP: Record<string, { country: string; countryCode: string; lat: number; lng: number }> = {
  'de': { country: 'Alemania', countryCode: 'DE', lat: 51.1657, lng: 10.4515 },
  'nl': { country: 'Países Bajos', countryCode: 'NL', lat: 52.1326, lng: 5.2913 },
  'at': { country: 'Austria', countryCode: 'AT', lat: 47.5162, lng: 14.5501 },
  'pl': { country: 'Polonia', countryCode: 'PL', lat: 51.9194, lng: 19.1451 },
  'fr': { country: 'Francia', countryCode: 'FR', lat: 46.2276, lng: 2.2137 },
  'cz': { country: 'Chequia', countryCode: 'CZ', lat: 49.8175, lng: 15.4730 },
  'sk': { country: 'Eslovaquia', countryCode: 'SK', lat: 48.6690, lng: 19.6990 },
  'uk': { country: 'Reino Unido', countryCode: 'UK', lat: 55.3781, lng: -3.4360 },
  'it': { country: 'Italia', countryCode: 'IT', lat: 41.8719, lng: 12.5674 },
  'es': { country: 'España', countryCode: 'ES', lat: 40.4637, lng: -3.7492 },
  'be': { country: 'Bélgica', countryCode: 'BE', lat: 50.5039, lng: 4.4699 },
  'ch': { country: 'Suiza', countryCode: 'CH', lat: 46.8182, lng: 8.2275 },
  'se': { country: 'Suecia', countryCode: 'SE', lat: 60.1282, lng: 18.6435 },
};

function extractCountry(locationText: string): { country: string; countryCode: string; lat: number; lng: number } {
  const lower = locationText.toLowerCase();
  for (const [code, data] of Object.entries(COUNTRY_MAP)) {
    if (lower.includes(code.toUpperCase()) || lower.includes(data.country.toLowerCase())) {
      return data;
    }
  }
  // Check for common country name patterns
  if (lower.includes('deutschland') || lower.includes('germany')) return COUNTRY_MAP['de'];
  if (lower.includes('nederland') || lower.includes('netherlands')) return COUNTRY_MAP['nl'];
  if (lower.includes('österreich') || lower.includes('austria')) return COUNTRY_MAP['at'];
  if (lower.includes('polen') || lower.includes('poland')) return COUNTRY_MAP['pl'];
  if (lower.includes('frankreich') || lower.includes('france')) return COUNTRY_MAP['fr'];
  return COUNTRY_MAP['de']; // default
}

function parseNetBidAuctions($: CheerioAPI): RawAuctionItem[] {
  const items: RawAuctionItem[] = [];
  const sels = SELECTORS.netbid;

  let cards = $(sels.primary.listing);
  if (cards.length === 0) {
    cards = $(sels.fallback.listing);
  }

  cards.each((_, el) => {
    const card = $(el);

    let linkEl = card.find(sels.primary.link).first();
    if (linkEl.length === 0) linkEl = card.find(sels.fallback.link).first();
    const href = linkEl.attr('href') || card.closest('a').attr('href') || '';
    if (!href || !href.includes('/auctions/')) return;

    let titleEl = card.find(sels.primary.title).first();
    if (titleEl.length === 0) titleEl = card.find(sels.fallback.title).first();
    const title = titleEl.text().trim();
    if (!title || title.length < 5) return;

    let imgEl = card.find(sels.primary.image).first();
    if (imgEl.length === 0) imgEl = card.find(sels.fallback.image).first();
    const imgUrl = imgEl.attr('src') || imgEl.attr('data-src') || '';
    const imgAlt = imgEl.attr('alt') || title;

    // Extract price
    let price: number | null = null;
    const priceText = card.text();
    const priceMatch = priceText.match(/([\d.,]+)\s*(€|EUR|EUR)/i);
    if (priceMatch) {
      price = parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.'));
    }

    // Extract end date
    let endDateEl = card.find(sels.primary.endDate).first();
    if (endDateEl.length === 0) endDateEl = card.find(sels.fallback.endDate).first();
    const endDateStr = endDateEl.attr('datetime') || endDateEl.text().trim();
    const endDate = endDateStr ? new Date(endDateStr) : new Date(Date.now() + 14 * 86400000);
    if (isNaN(endDate.getTime())) endDate.setTime(Date.now() + 14 * 86400000);

    // Extract location
    let locationEl = card.find(sels.primary.location).first();
    if (locationEl.length === 0) locationEl = card.find(sels.fallback.location).first();
    const locationText = locationEl.text().trim();

    const sourceUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;
    const lotIdMatch = href.match(/\/auctions\/(\d+)/);
    const lotId = lotIdMatch ? `NET-${lotIdMatch[1]}` : `NET-${Date.now()}-${items.length}`;

    const countryData = extractCountry(locationText);

    const images: RawAuctionImage[] = [];
    if (imgUrl) {
      images.push({ url: imgUrl.startsWith('http') ? imgUrl : `${BASE_URL}${imgUrl}`, alt: imgAlt, isPrimary: true, sortOrder: 0 });
    }

    items.push({
      platformId: 'netbid',
      lotId,
      title: title.slice(0, 200),
      description: title,
      category: 'Industrial',
      sourceUrl,
      currentBid: price,
      currency: 'EUR',
      estimatedResale: price ? price * 2 : undefined,
      buyerPremiumPercent: 14,
      hasReserve: false,
      startingBid: price ? price * 0.5 : null,
      city: locationText.split(',')[0]?.trim() || '',
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

export interface NetBidScrapeOptions {
  maxPages?: number;
}

export async function scrapeNetBid(options: NetBidScrapeOptions = {}): Promise<RawAuctionItem[]> {
  const { maxPages = 3 } = options;
  const items: RawAuctionItem[] = [];

  logScrape('netbid', 'info', 'Fetching NetBid auction listings...');
  const $ = await fetchPageAs$(`${BASE_URL}/en/auctions`);
  const pageItems = parseNetBidAuctions($);
  items.push(...pageItems);
  logScrape('netbid', 'success', `Found ${pageItems.length} auctions on page 1`);

  for (let page = 2; page <= maxPages && pageItems.length > 0; page++) {
    try {
      const $next = await fetchPageAs$(`${BASE_URL}/en/auctions?page=${page}`);
      const nextPageItems = parseNetBidAuctions($next);
      if (nextPageItems.length === 0) break;
      items.push(...nextPageItems);
      logScrape('netbid', 'info', `Found ${nextPageItems.length} auctions on page ${page}`);
    } catch {
      break;
    }
  }

  const check = checkZeroResults('netbid', items.length, 3);
  if (check.isWarning) logScrape('netbid', 'warn', check.message);

  return items;
}