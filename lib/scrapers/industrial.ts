import type { RawAuctionItem, RawAuctionImage } from './types';
import { fetchPageAs$, logScrape, checkZeroResults } from './resilience';
import type { CheerioAPI } from 'cheerio';
import { SELECTORS } from './selectors';

const BASE_URL = 'https://www.industrial-auctions.com';

const COUNTRY_MAP: Record<string, { country: string; countryCode: string; lat: number; lng: number }> = {
  'de': { country: 'Alemania', countryCode: 'DE', lat: 51.1657, lng: 10.4515 },
  'nl': { country: 'Países Bajos', countryCode: 'NL', lat: 52.1326, lng: 5.2913 },
  'uk': { country: 'Reino Unido', countryCode: 'UK', lat: 55.3781, lng: -3.4360 },
  'fr': { country: 'Francia', countryCode: 'FR', lat: 46.2276, lng: 2.2137 },
  'pl': { country: 'Polonia', countryCode: 'PL', lat: 51.9194, lng: 19.1451 },
  'lv': { country: 'Letonia', countryCode: 'LV', lat: 56.8796, lng: 24.6032 },
  'se': { country: 'Suecia', countryCode: 'SE', lat: 60.1282, lng: 18.6435 },
  'at': { country: 'Austria', countryCode: 'AT', lat: 47.5162, lng: 14.5501 },
  'cz': { country: 'Chequia', countryCode: 'CZ', lat: 49.8175, lng: 15.4730 },
  'es': { country: 'España', countryCode: 'ES', lat: 40.4637, lng: -3.7492 },
};

function extractCountry(locationText: string): { country: string; countryCode: string; lat: number; lng: number } {
  const lower = locationText.toLowerCase();
  for (const [code, data] of Object.entries(COUNTRY_MAP)) {
    if (lower.includes(code.toUpperCase()) || lower.includes(data.country.toLowerCase())) {
      return data;
    }
  }
  if (lower.includes('deutschland') || lower.includes('germany')) return COUNTRY_MAP['de'];
  if (lower.includes('nederland') || lower.includes('netherlands')) return COUNTRY_MAP['nl'];
  if (lower.includes('österreich') || lower.includes('austria')) return COUNTRY_MAP['at'];
  if (lower.includes('polen') || lower.includes('poland')) return COUNTRY_MAP['pl'];
  return COUNTRY_MAP['nl']; // default — Industrial Auctions is NL-based
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

    let imgEl = card.find(sels.primary.image).first();
    if (imgEl.length === 0) imgEl = card.find(sels.fallback.image).first();
    const imgUrl = imgEl.attr('src') || imgEl.attr('data-src') || '';
    const imgAlt = imgEl.attr('alt') || title;

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

    const countryData = extractCountry(locationText);

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
      estimatedResale: price ? price * 2 : undefined,
      buyerPremiumPercent: 15,
      hasReserve: false,
      startingBid: price ? price * 0.5 : null,
      city: locationText.split(',')[0]?.trim() || '',
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

  const check = checkZeroResults('industrial', items.length, 3);
  if (check.isWarning) logScrape('industrial', 'warn', check.message);

  return items;
}