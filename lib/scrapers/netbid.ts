import type { RawAuctionItem, RawAuctionImage } from './types';

interface NetBidScrapeOptions {
  maxPages?: number;
}

// NetBid / Auctelia scraper using public search pages
export async function scrapeNetBid(options: NetBidScrapeOptions = {}): Promise<RawAuctionItem[]> {
  const { maxPages = 3 } = options;
  const items: RawAuctionItem[] = [];

  // NetBid uses server-rendered HTML for auction listings
  // We fetch the search page and parse the HTML
  const baseUrl = 'https://www.netbid.com';

  try {
    for (let page = 1; page <= maxPages; page++) {
      const itemsBeforePage = items.length;
      const url = `${baseUrl}/en/auctions/search?q=&page=${page}&sort=end_date_asc`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'SURUS-Scraper/1.0',
          'Accept': 'text/html,application/xhtml+xml',
        },
      });

      if (!res.ok) {
        console.error(`[NetBid] Page ${page} returned ${res.status}`);
        break;
      }

      const html = await res.text();

      // Parse auction cards from HTML
      const lotRegex = /<article[^>]*class="[^"]*auction-card[^"]*"[^>]*>([\s\S]*?)<\/article>/gi;
      const linkRegex = /href="\/en\/auction\/([^"]+)"/;
      const titleRegex = /<h[23][^>]*>([^<]+)<\/h[23]>/;
      const priceRegex = /class="[^"]*price[^"]*"[^>]*>[^0-9]*([\d.,]+)\s*([A-Z]{3})/;
      const imgRegex = /<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"/;
      const endRegex = /data-end-date="([^"]+)"/;

      let match;
      while ((match = lotRegex.exec(html)) !== null) {
        const card = match[1];

        const linkMatch = card.match(linkRegex);
        const titleMatch = card.match(titleRegex);
        const priceMatch = card.match(priceRegex);
        const imgMatch = card.match(imgRegex);
        const endMatch = card.match(endRegex);

        if (!linkMatch || !titleMatch) continue;

        const lotId = linkMatch[1];
        const title = titleMatch[1].trim();
        const currentBid = priceMatch ? parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.')) : null;
        const currency = priceMatch ? priceMatch[2] : 'EUR';
        const imageUrl = imgMatch ? imgMatch[1] : undefined;
        const imageAlt = imgMatch ? imgMatch[2] : title;
        const auctionEnd = endMatch ? new Date(endMatch[1]).toISOString() : new Date(Date.now() + 7 * 86400000).toISOString();

        const images: RawAuctionImage[] = [];
        if (imageUrl) {
          images.push({ url: imageUrl, alt: imageAlt, isPrimary: true });
        }

        items.push({
          platformId: 'netbid',
          lotId: `NET-${lotId}`,
          title,
          description: title,
          category: 'Industrial',
          sourceUrl: `${baseUrl}/en/auction/${lotId}`,
          currentBid: currentBid || 0,
          currency,
          estimatedResale: (currentBid || 0) * 2,
          buyerPremiumPercent: 14,
          hasReserve: false,
          startingBid: currentBid ? currentBid * 0.5 : 0,
          city: '',
          country: 'Germany',
          countryCode: 'DE',
          lat: 51.1657,
          lng: 10.4515,
          auctionEnd,
          inspectionAvailable: false,
          condition: 'good',
          images,
        });
      }

      // Track how many items THIS page produced
      const pageItems = items.length - itemsBeforePage;
      if (pageItems === 0) {
        console.log(`[NetBid] Page ${page} returned 0 items, stopping pagination`);
        break;
      }
    }
  } catch (error) {
    console.error('[NetBid] Scrape error:', error);
  }

  return items;
}