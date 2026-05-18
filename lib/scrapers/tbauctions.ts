import type { RawAuctionItem, RawAuctionImage } from './types';
import { fetchWithRetry, getNextHeaders, fetchPageAs$, logScrape, checkZeroResults } from './resilience';

const GRAPHQL_ENDPOINT = 'https://storefront.tbauctions.com/storefront/graphql';

const AUCTIONS_QUERY = `
query AllAuctions($request: AllAuctionsInput!, $platform: Platform!) {
  allAuctionsV2(request: $request, platform: $platform) {
    totalSize
    hasNext
    pageNumber
    results {
      id
      name
      urlSlug
      platform
      lotCount
      biddingStatus
      minEndDate
      maxEndDate
      images { url alt order }
    }
  }
}`;

const AUCTION_LOTS_QUERY = `
query AuctionLots($request: AuctionWithLotsInputV3!, $platform: Platform!) {
  auctionWithLotsV5(request: $request, platform: $platform) {
    auction { id name urlSlug platform lotCount minEndDate maxEndDate }
    lots {
      hasNext
      totalSize
      results {
        id
        title
        urlSlug
        platform
        currentBidAmount { cents currency }
        bidsCount
        biddingStatus
        image { url alt }
        location { city countryCode }
      }
    }
  }
}`;

function buildLotUrl(platform: string, urlSlug: string): string {
  const domains: Record<string, string> = {
    SPX: 'https://www.surplex.com/es/l/',
    TWK: 'https://www.troostwijkauctions.com/es/l/',
    BVA: 'https://www.bva-auctions.com/es/l/',
  };
  return `${domains[platform] || 'https://www.surplex.com/es/l/'}${urlSlug}`;
}

function buildAuctionUrl(platform: string, urlSlug: string): string {
  const domains: Record<string, string> = {
    SPX: 'https://www.surplex.com/es/a/',
    TWK: 'https://www.troostwijkauctions.com/es/a/',
    BVA: 'https://www.bva-auctions.com/es/a/',
  };
  return `${domains[platform] || 'https://www.surplex.com/es/a/'}${urlSlug}`;
}

function mapPlatformId(platformCode: string): string {
  const map: Record<string, string> = {
    SPX: 'surplex', TWK: 'troostwijk', BVA: 'bva',
  };
  return map[platformCode] || platformCode.toLowerCase();
}

const COUNTRY_NAMES: Record<string, string> = {
  es: 'España', de: 'Alemania', nl: 'Países Bajos', fr: 'Francia',
  it: 'Italia', uk: 'Reino Unido', us: 'EE.UU.', cz: 'Chequia',
  pl: 'Polonia', be: 'Bélgica', ch: 'Suiza', at: 'Austria',
  se: 'Suecia', fi: 'Finlandia', dk: 'Dinamarca', pt: 'Portugal',
};

const COUNTRY_COORDS: Record<string, [number, number]> = {
  DE: [51.1, 10.4], NL: [52.3, 4.9], FR: [46.6, 2.2],
  IT: [41.9, 12.5], UK: [51.5, -0.1], ES: [40.4, -3.7],
  US: [39.8, -98.5], CZ: [49.8, 15.5], PL: [51.9, 19.1],
  BE: [50.8, 4.3], CH: [46.8, 8.2], AT: [47.7, 13.3],
};

function lotToItem(lot: any, auction: any, platform: string): RawAuctionItem {
  const currentBidCents = lot.currentBidAmount?.cents || 0;
  const currency = lot.currentBidAmount?.currency || 'EUR';
  const endDate = lot.endDate || auction.maxEndDate || auction.minEndDate;
  const endDateStr = endDate ? new Date(endDate * 1000).toISOString() : new Date(Date.now() + 7 * 86400000).toISOString();

  const images: RawAuctionImage[] = [];
  if (lot.image?.url) {
    images.push({ url: lot.image.url, alt: lot.image.alt || lot.title, isPrimary: true, sortOrder: 0 });
  } else if (auction.images?.[0]?.url) {
    images.push({ url: auction.images[0].url, alt: lot.title || auction.name, isPrimary: true, sortOrder: 0 });
  }

  const cc = (lot.location?.countryCode || auction.location?.countryCode || 'DE').toUpperCase();
  const coords = COUNTRY_COORDS[cc] || [48.0, 4.0];

  return {
    platformId: mapPlatformId(platform),
    lotId: lot.id,
    title: lot.title || auction.name,
    description: lot.title || auction.name,
    category: 'Industrial',
    sourceUrl: lot.urlSlug ? buildLotUrl(platform, lot.urlSlug) : buildAuctionUrl(platform, auction.urlSlug),
    currentBid: currentBidCents > 0 ? currentBidCents / 100 : null,
    currency,
    estimatedResale: currentBidCents > 0 ? (currentBidCents / 100) * 2 : undefined,
    buyerPremiumPercent: 16,
    reservePrice: null,
    hasReserve: false,
    startingBid: null,
    city: lot.location?.city || auction.location?.city || '',
    region: undefined,
    country: COUNTRY_NAMES[cc.toLowerCase()] || '',
    countryCode: cc,
    lat: coords[0],
    lng: coords[1],
    siteType: undefined,
    auctionEnd: endDateStr,
    inspectionAvailable: true,
    condition: 'good',
    images,
  };
}

function auctionToItem(auction: any, platform: string): RawAuctionItem {
  const endDate = auction.maxEndDate || auction.minEndDate;
  const endDateStr = endDate ? new Date(endDate * 1000).toISOString() : new Date(Date.now() + 7 * 86400000).toISOString();

  const images: RawAuctionImage[] = (auction.images || []).slice(0, 3).map((img: any, i: number) => ({
    url: img.url,
    alt: img.alt || auction.name,
    isPrimary: i === 0,
    sortOrder: i,
  }));

  return {
    platformId: mapPlatformId(platform),
    lotId: auction.id,
    title: auction.name,
    description: auction.name,
    category: 'Industrial',
    sourceUrl: buildAuctionUrl(platform, auction.urlSlug),
    currentBid: null,
    currency: 'EUR',
    buyerPremiumPercent: 16,
    hasReserve: false,
    city: '',
    country: '',
    countryCode: 'DE',
    lat: 48.0, lng: 4.0,
    auctionEnd: endDateStr,
    inspectionAvailable: true,
    condition: 'good',
    images,
  };
}

async function tryGraphQL(platform: string): Promise<RawAuctionItem[]> {
  logScrape('tbauctions', 'info', `Trying GraphQL for ${platform}...`);

  const originMap: Record<string, string> = {
    SPX: 'https://www.surplex.com',
    TWK: 'https://www.troostwijkauctions.com',
    BVA: 'https://www.bva-auctions.com',
  };

  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getNextHeaders(),
      'Origin': originMap[platform] || 'https://www.surplex.com',
      'Referer': `${originMap[platform] || 'https://www.surplex.com'}/`,
    },
    body: JSON.stringify({
      query: AUCTIONS_QUERY,
      variables: {
        request: {
          pageNumber: 1,
          pageSize: 100,
          locale: 'es',
          biddingStatuses: ['BIDDING_OPEN'],
          hideZeroLotAuctions: true,
          facets: [],
          rangeFacets: [],
          sortBy: 'END_DATE_ASC',
        },
        platform,
      },
    }),
  });

  if (!res.ok) {
    logScrape('tbauctions', 'warn', `GraphQL returned ${res.status} for ${platform}`);
    return [];
  }

  const data = await res.json();
  const auctionsResult = data?.data?.allAuctionsV2;
  const auctions = auctionsResult?.results || [];

  if (auctions.length === 0) {
    logScrape('tbauctions', 'warn', `No auctions in GraphQL for ${platform}`);
    return [];
  }

  logScrape('tbauctions', 'success', `GraphQL found ${auctionsResult.totalSize} auctions for ${platform}`);

  const allItems: RawAuctionItem[] = [];
  for (const auction of auctions.slice(0, 25)) {
    try {
      const displayId = auction.urlSlug?.split('-').slice(-1)[0] || auction.id;
      const lotsRes = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getNextHeaders(),
          'Origin': originMap[platform] || 'https://www.surplex.com',
          'Referer': `${originMap[platform] || 'https://www.surplex.com'}/`,
        },
        body: JSON.stringify({
          query: AUCTION_LOTS_QUERY,
          variables: {
            request: { displayId, locale: 'es', pageNumber: 1, pageSize: 20, rangeFacetInputs: [], sortBy: 'END_DATE_ASC', valueFacetInputs: [] },
            platform,
          },
        }),
      });

      if (!lotsRes.ok) continue;

      const lotsData = await lotsRes.json();
      const lotsResult = lotsData?.data?.auctionWithLotsV5;
      const lots = lotsResult?.lots?.results || [];
      const auctionInfo = lotsResult?.auction || auction;

      if (lots.length === 0) {
        allItems.push(auctionToItem(auctionInfo, platform));
      } else {
        for (const lot of lots) {
          allItems.push(lotToItem(lot, auctionInfo, platform));
        }
      }
    } catch {
      allItems.push(auctionToItem(auction, platform));
    }
  }

  return allItems;
}

async function tryHTMLFallback(platform: string): Promise<RawAuctionItem[]> {
  logScrape('tbauctions', 'info', `Trying HTML fallback for ${platform}...`);

  const urls: Record<string, string> = {
    SPX: 'https://www.surplex.com/es/a/',
    TWK: 'https://www.troostwijkauctions.com/es/a/',
  };

  const url = urls[platform];
  if (!url) return [];

  try {
    const $ = await fetchPageAs$(url);
    const items: RawAuctionItem[] = [];

    $('a[href*="/l/"], a[href*="/a/"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const title = $(el).find('h2, h3, h4').first().text().trim() || $(el).text().trim().slice(0, 200);
      if (!title || title.length < 5) return;

      const imgEl = $(el).find('img').first();
      const imgUrl = imgEl.attr('src') || imgEl.attr('data-src') || '';
      const fullUrl = href.startsWith('http') ? href : `https://www.surplex.com${href}`;

      const cc = platform === 'SPX' ? 'DE' : 'NL';
      const coords = COUNTRY_COORDS[cc] || [48.0, 4.0];

      items.push({
        platformId: mapPlatformId(platform),
        lotId: `tba-${platform}-${items.length}`,
        title: title.slice(0, 200),
        description: title,
        category: 'Industrial',
        sourceUrl: fullUrl,
        currentBid: null,
        currency: 'EUR',
        buyerPremiumPercent: 16,
        hasReserve: false,
        city: '',
        country: COUNTRY_NAMES[cc.toLowerCase()] || '',
        countryCode: cc,
        lat: coords[0],
        lng: coords[1],
        auctionEnd: new Date(Date.now() + 14 * 86400000).toISOString(),
        inspectionAvailable: true,
        condition: 'good',
        images: imgUrl ? [{ url: imgUrl.startsWith('http') ? imgUrl : `https://www.surplex.com${imgUrl}`, alt: title, isPrimary: true, sortOrder: 0 }] : [],
      });
    });

    logScrape('tbauctions', 'success', `HTML fallback found ${items.length} items for ${platform}`);
    return items;
  } catch (err) {
    logScrape('tbauctions', 'error', `HTML fallback failed for ${platform}: ${err instanceof Error ? err.message : String(err)}`);
    return [];
  }
}

export interface TBAuctionsOptions {
  platforms?: string[];
  maxPages?: number;
}

export async function scrapeTBAuctions(options: TBAuctionsOptions = {}): Promise<RawAuctionItem[]> {
  const platforms = options.platforms || ['SPX', 'TWK'];
  const allItems: RawAuctionItem[] = [];

  for (const platform of platforms) {
    logScrape('tbauctions', 'info', `Scraping platform ${platform}...`);
    try {
      let items = await tryGraphQL(platform);
      if (items.length === 0) {
        items = await tryHTMLFallback(platform);
      }
      const check = checkZeroResults(`tbauctions-${platform}`, items.length, 3);
      if (check.isWarning) logScrape('tbauctions', 'warn', check.message);
      allItems.push(...items);
      logScrape('tbauctions', 'success', `Collected ${items.length} items for ${platform}`);
    } catch (err) {
      logScrape('tbauctions', 'error', `Error scraping ${platform}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return allItems;
}