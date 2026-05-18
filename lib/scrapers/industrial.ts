import type { RawAuctionItem, RawAuctionImage } from './types';

interface IndustrialScrapeOptions {
  maxPages?: number;
}

// Industrial Auctions scraper
export async function scrapeIndustrial(options: IndustrialScrapeOptions = {}): Promise<RawAuctionItem[]> {
  const { maxPages = 3 } = options;
  const items: RawAuctionItem[] = [];

  const baseUrl = 'https://www.industrial-auctions.com';

  try {
    for (let page = 1; page <= maxPages; page++) {
      const itemsBeforePage = items.length;
      const url = `${baseUrl}/en/auctions?page=${page}&sort=ending_soon`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'SURUS-Scraper/1.0',
          'Accept': 'text/html,application/xhtml+xml',
        },
      });

      if (!res.ok) {
        console.error(`[Industrial] Page ${page} returned ${res.status}`);
        break;
      }

      const html = await res.text();

      // Parse auction listings from HTML
      // Industrial Auctions uses a table/card layout for lots
      const lotRegex = /<div[^>]*class="[^"]*lot-item[^"]*"[^>]*data-lot-id="([^"]+)"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;
      const titleRegex = /<a[^>]*class="[^"]*lot-title[^"]*"[^>]*>([^<]+)<\/a>/;
      const linkRegex = /href="([^"]*\/lot\/[^"]+)"/;
      const priceRegex = /class="[^"]*(?:current-bid|bid)[^"]*"[^>]*>[^0-9]*([\d.,]+)\s*([A-Z]{3})?/;
      const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/;
      const endRegex = /(?:data-end|class="[^"]*end[^"]*")[^>]*>([^<]+)</;

      let match;
      while ((match = lotRegex.exec(html)) !== null) {
        const lotId = match[1] || `IND-${Date.now()}-${items.length}`;
        const card = match[2];

        const titleMatch = card.match(titleRegex);
        const linkMatch = card.match(linkRegex);
        const priceMatch = card.match(priceRegex);
        const imgMatch = card.match(imgRegex);
        const endMatch = card.match(endRegex);

        const title = titleMatch ? titleMatch[1].trim() : `Industrial Lot ${lotId}`;
        const currentBid = priceMatch ? parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.')) : null;
        const currency = priceMatch && priceMatch[2] ? priceMatch[2] : 'EUR';
        const imageUrl = imgMatch ? imgMatch[1] : undefined;
        const sourceUrl = linkMatch ? `${baseUrl}${linkMatch[1]}` : `${baseUrl}/lot/${lotId}`;
        const auctionEnd = endMatch ? new Date(endMatch[1].trim()).toISOString() : new Date(Date.now() + 7 * 86400000).toISOString();

        const images: RawAuctionImage[] = [];
        if (imageUrl) {
          images.push({ url: imageUrl, alt: title, isPrimary: true });
        }

        items.push({
          platformId: 'industrial-auctions',
          lotId,
          title,
          description: title,
          category: 'Industrial',
          sourceUrl,
          currentBid: currentBid || 0,
          currency,
          estimatedResale: (currentBid || 0) * 2,
          buyerPremiumPercent: 15,
          hasReserve: false,
          startingBid: currentBid ? currentBid * 0.5 : 0,
          city: '',
          country: 'Germany',
          countryCode: 'DE',
          lat: 51.1657,
          lng: 10.4515,
          auctionEnd,
          inspectionAvailable: true,
          condition: 'good',
          images,
        });
      }

      // Track how many items THIS page produced
      const pageItems = items.length - itemsBeforePage;
      if (pageItems === 0) {
        console.log(`[Industrial] Page ${page} returned 0 items, stopping pagination`);
        break;
      }
    }
  } catch (error) {
    console.error('[Industrial] Scrape error:', error);
  }

  return items;
}