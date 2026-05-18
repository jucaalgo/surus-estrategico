import type { RawAuctionItem } from './types';

const GRAPHQL_ENDPOINT = 'https://storefront.tbauctions.com/storefront/graphql';

interface GraphQLResponse {
  data?: Record<string, unknown>;
  errors?: Array<{ message: string; path?: string }>;
}

// ── Real TBAuctions GraphQL schema (introspected 2026-05-18) ──

// Get auction listings
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

// Get lots within an auction
const AUCTION_LOTS_QUERY = `
query AuctionLots($request: AuctionWithLotsInputV3!, $platform: Platform!) {
  auctionWithLotsV5(request: $request, platform: $platform) {
    auction {
      id
      name
      urlSlug
      platform
      lotCount
      minEndDate
      maxEndDate
    }
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

async function graphqlRequest(query: string, variables: Record<string, unknown> = {}): Promise<GraphQLResponse> {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'SURUS-Bot/1.0',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`GraphQL request failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

function buildLotUrl(platform: string, urlSlug: string): string {
  const domains: Record<string, string> = {
    SPX: 'https://www.surplex.com/es/l/',
    TWK: 'https://www.troostwijkauctions.com/es/l/',
    BVA: 'https://www.bva-auctions.com/es/l/',
    VAVATO: 'https://www.vavato.com/es/l/',
    AUK: 'https://www.auctionuk.com/es/l/',
    EPIC: 'https://www.epic-auctions.com/es/l/',
  };
  return `${domains[platform] || 'https://www.surplex.com/es/l/'}${urlSlug}`;
}

function buildAuctionUrl(platform: string, urlSlug: string): string {
  const domains: Record<string, string> = {
    SPX: 'https://www.surplex.com/es/a/',
    TWK: 'https://www.troostwijkauctions.com/es/a/',
    BVA: 'https://www.bva-auctions.com/es/a/',
    VAVATO: 'https://www.vavato.com/es/a/',
    AUK: 'https://www.auctionuk.com/es/a/',
    EPIC: 'https://www.epic-auctions.com/es/a/',
  };
  return `${domains[platform] || 'https://www.surplex.com/es/a/'}${urlSlug}`;
}

function mapPlatformId(platformCode: string): string {
  const map: Record<string, string> = {
    SPX: 'surplex',
    TWK: 'troostwijk',
    BVA: 'bva',
    VAVATO: 'vavato',
    AUK: 'auctionuk',
    EPIC: 'epic',
  };
  return map[platformCode] || platformCode.toLowerCase();
}

// Country code mapping
const COUNTRY_NAMES: Record<string, string> = {
  es: 'España', de: 'Alemania', nl: 'Países Bajos', fr: 'Francia',
  it: 'Italia', uk: 'Reino Unido', us: 'EE.UU.', cz: 'Chequia',
  pl: 'Polonia', be: 'Bélgica', ch: 'Suiza', at: 'Austria',
  se: 'Suecia', fi: 'Finlandia', dk: 'Dinamarca', pt: 'Portugal',
  ro: 'Rumanía', hu: 'Hungría', tr: 'Turquía',
};

export interface TBAuctionsOptions {
  platforms?: string[];
  maxPages?: number;
}

export async function scrapeTBAuctions(options: TBAuctionsOptions = {}): Promise<RawAuctionItem[]> {
  const platforms = options.platforms || ['SPX', 'TWK'];
  const maxPages = options.maxPages || 3;
  const allItems: RawAuctionItem[] = [];

  for (const platform of platforms) {
    try {
      console.log(`[TBAuctions] Scraping platform ${platform}...`);

      // Step 1: Get auction listings
      const auctionsData = await graphqlRequest(AUCTIONS_QUERY, {
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
      });

      const auctionsResult = (auctionsData.data as any)?.allAuctionsV2;
      const auctions = auctionsResult?.results || [];
      if (auctions.length === 0) {
        console.log(`[TBAuctions] No auctions found for platform ${platform}`);
        continue;
      }

      console.log(`[TBAuctions] Found ${auctionsResult.totalSize} auctions for ${platform}, fetching lots for ${Math.min(auctions.length, maxPages * 5)}...`);

      // Step 2: For each auction, get its lots
      let auctionsProcessed = 0;
      for (const auction of auctions) {
        if (auctionsProcessed >= maxPages * 5) break;
        auctionsProcessed++;

        try {
          const displayId = auction.urlSlug?.split('-').slice(-1)[0] || auction.id;
          const lotsData = await graphqlRequest(AUCTION_LOTS_QUERY, {
            request: {
              displayId,
              locale: 'es',
              pageNumber: 1,
              pageSize: 20,
              rangeFacetInputs: [],
              sortBy: 'END_DATE_ASC',
              valueFacetInputs: [],
            },
            platform,
          });

          const lotsResult = (lotsData.data as any)?.auctionWithLotsV5;
          const lots = lotsResult?.lots?.results || [];
          const auctionInfo = lotsResult?.auction || auction;

          if (lots.length === 0) {
            // Create item from auction-level data
            allItems.push(auctionToItem(auctionInfo || auction, platform));
            continue;
          }

          // Step 3: Convert lots to items
          for (const lot of lots) {
            allItems.push(lotToItem(lot, auctionInfo || auction, platform));
          }
        } catch (err) {
          // Individual auction error — create item from listing data
          allItems.push(auctionToItem(auction, platform));
        }
      }

      console.log(`[TBAuctions] Collected ${allItems.length} items for platform ${platform}`);
    } catch (err) {
      console.error(`[TBAuctions] Error scraping platform ${platform}:`, err);
    }
  }

  return allItems;
}

function lotToItem(lot: any, auction: any, platform: string): RawAuctionItem {
  const currentBidCents = lot.currentBidAmount?.cents || 0;
  const currency = lot.currentBidAmount?.currency || 'EUR';
  const endDate = lot.endDate || auction.maxEndDate || auction.minEndDate;
  const endDateStr = endDate ? new Date(endDate * 1000).toISOString() : new Date(Date.now() + 7 * 86400000).toISOString();

  const images = [];
  if (lot.image?.url) {
    images.push({ url: lot.image.url, alt: lot.image.alt || lot.title, isPrimary: true, sortOrder: 0 });
  } else if (auction.images?.[0]?.url) {
    images.push({ url: auction.images[0].url, alt: lot.title || auction.name, isPrimary: true, sortOrder: 0 });
  }

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
    country: COUNTRY_NAMES[lot.location?.countryCode?.toUpperCase()] || COUNTRY_NAMES[auction.location?.countryCode?.toUpperCase()] || '',
    countryCode: lot.location?.countryCode?.toUpperCase() || auction.location?.countryCode?.toUpperCase() || 'DE',
    lat: 48.0,
    lng: 4.0,
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

  const images = (auction.images || []).slice(0, 3).map((img: any, i: number) => ({
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
    lat: 48.0,
    lng: 4.0,
    auctionEnd: endDateStr,
    inspectionAvailable: true,
    condition: 'good',
    images,
  };
}