import type { RawAuctionItem } from './types';

const GRAPHQL_ENDPOINT = 'https://storefront.tbauctions.com/storefront/graphql';

interface GraphQLResponse {
  data?: Record<string, unknown>;
  errors?: Array<{ message: string }>;
}

interface AuctionFacet {
  id: string;
  title: string;
  slug: string;
  platform: { id: string; name: string };
  auctionType: { id: string; name: string };
  location: { city: string; region: string; country: { code: string; name: string }; lat: number; lng: number } | null;
  auctionEndDate: string;
  images: Array<{ key: string; uuid: string }>;
  lotCount: number;
  isOnline: boolean;
  inspectionAvailable: boolean;
  category: { id: string; name: string; slug: string } | null;
  site: { name: string; type: string } | null;
  lots?: Array<{
    id: string;
    title: string;
    slug: string;
    currentBid: { amount: number; currency: string } | null;
    startingBid: { amount: number; currency: string } | null;
    estimatedPrice: { amount: number; currency: string } | null;
    reservePrice: { amount: number; currency: string } | null;
    hasReserve: boolean;
    bidCount: number;
    imageUrl: string | null;
    make: { name: string } | null;
    model: { name: string } | null;
    year: number | null;
    condition: { id: string; name: string } | null;
    description: string | null;
  }>;
}

interface LotDetail {
  id: string;
  title: string;
  description: string;
  slug: string;
  make: { name: string } | null;
  model: { name: string } | null;
  year: number | null;
  condition: { id: string; name: string } | null;
  hours: number | null;
  weight: { value: number; unit: string } | null;
  power: { value: number; unit: string } | null;
  currentBid: { amount: number; currency: string } | null;
  buyerPremium: { percentage: number } | null;
  estimatedResale: { amount: number; currency: string } | null;
  images: Array<{ key: string; uuid: string; alt: string }>;
  auction: { id: string; endDate: string; site: { name: string; type: string } } | null;
  location: { city: string; region: string; country: { code: string; name: string }; lat: number; lng: number; siteType: string } | null;
  specs: Array<{ key: string; value: string; unit: string }>;
}

// Get auction listings with lot summary data
const AUCTIONS_WITH_LOTS_QUERY = `
query AllAuctionFacets($page: Int, $limit: Int, $platform: [String]) {
  allAuctionFacets(page: $page, limit: $limit, platform: $platform) {
    pagination { totalResults page totalPages }
    results {
      id
      title
      slug
      platform { id name }
      auctionType { id name }
      location { city region country { code name } lat lng }
      auctionEndDate
      images { key uuid }
      lotCount
      isOnline
      inspectionAvailable
      category { id name slug }
      site { name type }
    }
  }
}`;

// Get real-time bid data for lots
const LOT_DATA_QUERY = `
query VolatileLotDataByIds($ids: [ID!]!) {
  volatileLotDataByIds(ids: $ids) {
    lotId
    currentBid { amount currency }
    startingBid { amount currency }
    reservePrice { amount currency }
    hasReserve
    bidCount
  }
}`;

// Get detailed lot info
const LOT_DETAIL_QUERY = `
query LotDetail($id: ID!) {
  lot(id: $id) {
    id
    title
    description
    slug
    make { name }
    model { name }
    year
    condition { id name }
    hours
    weight { value unit }
    power { value unit }
    currentBid { amount currency }
    buyerPremium { percentage }
    estimatedResale { amount currency }
    images { key uuid alt }
    auction { id endDate site { name type } }
    location { city region country { code name } lat lng siteType }
    specs { key value unit }
  }
}`;

// Get lots within an auction
const AUCTION_LOTS_QUERY = `
query AuctionLots($auctionId: ID!, $page: Int, $limit: Int) {
  auction(id: $auctionId) {
    id
    lots(page: $page, limit: $limit) {
      results {
        id
        title
        slug
        currentBid { amount currency }
        startingBid { amount currency }
        estimatedPrice { amount currency }
        reservePrice { amount currency }
        hasReserve
        bidCount
        imageUrl
        make { name }
        model { name }
        year
        condition { id name }
        description
      }
      pagination { totalResults page totalPages }
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

function buildImageUrl(uuid: string, width = 768, height = 576): string {
  return `https://media.tbauctions.com/image-media/${uuid}/file?imageSize=${width}x${height}&imageFormat=webp`;
}

function buildLotUrl(platform: string, slug: string, lotId: string): string {
  const domains: Record<string, string> = {
    SPX: 'https://www.surplex.com/es/l/',
    TWK: 'https://www.troostwijkauctions.com/es/l/',
    MAY: 'https://www.maynards.com/es/l/',
  };
  return `${domains[platform] || 'https://www.surplex.com/es/l/'}${slug}-${lotId}`;
}

function mapPlatformId(platformCode: string): string {
  const map: Record<string, string> = {
    SPX: 'surplex',
    TWK: 'troostwijk',
    MAY: 'maynards',
  };
  return map[platformCode] || platformCode.toLowerCase();
}

export interface TBAuctionsOptions {
  platforms?: string[];
  maxPages?: number;
}

export async function scrapeTBAuctions(options: TBAuctionsOptions = {}): Promise<RawAuctionItem[]> {
  const platforms = options.platforms || ['SPX', 'TWK', 'MAY'];
  const maxPages = options.maxPages || 5;

  const allItems: RawAuctionItem[] = [];

  for (const platform of platforms) {
    try {
      // Step 1: Get auction listings
      const auctionsData = await graphqlRequest(AUCTIONS_WITH_LOTS_QUERY, {
        page: 1,
        limit: 100,
        platform: [platform],
      });

      const results = (auctionsData.data?.allAuctionFacets as any)?.results as AuctionFacet[] || [];
      if (results.length === 0) continue;

      console.log(`[TBAuctions] Found ${results.length} auctions for platform ${platform}`);

      // Step 2: For each auction, get its lots
      for (const auction of results) {
        try {
          // Try to get lots within this auction
          const lotsData = await graphqlRequest(AUCTION_LOTS_QUERY, {
            auctionId: auction.id,
            page: 1,
            limit: 50,
          });

          const lots = (lotsData.data?.auction as any)?.lots?.results as any[] || [];

          if (lots.length === 0) {
            // No lots found — create item from auction facet data
            allItems.push(auctionFacetToItem(auction, platform));
            continue;
          }

          // Step 3: For each lot, try to get detailed info (but limit to avoid too many requests)
          for (const lot of lots.slice(0, 10)) {
            try {
              const detailData = await graphqlRequest(LOT_DETAIL_QUERY, { id: lot.id });
              const lotDetail = detailData.data?.lot as LotDetail | null;

              if (lotDetail) {
                allItems.push(lotDetailToItem(lotDetail, auction, platform));
              } else {
                // Use what we have from the lot summary
                allItems.push(lotSummaryToItem(lot, auction, platform));
              }
            } catch (err) {
              // Individual lot error — use summary data
              allItems.push(lotSummaryToItem(lot, auction, platform));
            }
          }
        } catch (err) {
          // Could not get lots for this auction — fallback to auction facet
          console.error(`[TBAuctions] Error fetching lots for auction ${auction.id}:`, err);
          allItems.push(auctionFacetToItem(auction, platform));
        }
      }

      console.log(`[TBAuctions] Collected ${allItems.length} items for platform ${platform}`);
    } catch (err) {
      console.error(`[TBAuctions] Error scraping platform ${platform}:`, err);
    }
  }

  return allItems;
}

function lotDetailToItem(lot: LotDetail, auction: AuctionFacet, platform: string): RawAuctionItem {
  const lotUrl = lot.slug
    ? buildLotUrl(platform, lot.slug, lot.id)
    : `https://www.surplex.com/es/a/${auction.slug}`;

  const images = (lot.images || []).map((img, i) => ({
    url: buildImageUrl(img.uuid),
    alt: img.alt || lot.title,
    isPrimary: i === 0,
    sortOrder: i,
  }));

  const extraSpecs: Record<string, string> = {};
  if (lot.specs) {
    for (const spec of lot.specs) {
      extraSpecs[spec.key] = spec.value + (spec.unit ? ` ${spec.unit}` : '');
    }
  }

  return {
    platformId: mapPlatformId(platform),
    lotId: lot.id,
    title: lot.title || auction.title,
    description: lot.description || '',
    category: auction.category?.name || 'Industrial',
    subcategory: auction.category?.slug,
    sourceUrl: lotUrl,
    currentBid: lot.currentBid?.amount || null,
    currency: lot.currentBid?.currency || 'EUR',
    estimatedResale: lot.estimatedResale?.amount || undefined,
    buyerPremiumPercent: lot.buyerPremium?.percentage || 16,
    reservePrice: null,
    hasReserve: false,
    startingBid: null,
    city: lot.location?.city || auction.location?.city || '',
    region: lot.location?.region || auction.location?.region,
    country: lot.location?.country?.name || auction.location?.country?.name || '',
    countryCode: lot.location?.country?.code || auction.location?.country?.code || 'DE',
    lat: lot.location?.lat || auction.location?.lat || 48.0,
    lng: lot.location?.lng || auction.location?.lng || 4.0,
    siteType: lot.location?.siteType || auction.site?.type,
    auctionEnd: lot.auction?.endDate || auction.auctionEndDate || new Date(Date.now() + 7 * 86400000).toISOString(),
    inspectionAvailable: auction.inspectionAvailable ?? true,
    make: lot.make?.name,
    model: lot.model?.name,
    year: lot.year || undefined,
    condition: lot.condition?.name || 'good',
    hours: lot.hours || undefined,
    power: lot.power ? `${lot.power.value} ${lot.power.unit}` : undefined,
    weightKg: lot.weight?.value || undefined,
    images,
    extraSpecs: Object.keys(extraSpecs).length > 0 ? extraSpecs : undefined,
  };
}

function lotSummaryToItem(lot: any, auction: AuctionFacet, platform: string): RawAuctionItem {
  const lotUrl = lot.slug
    ? buildLotUrl(platform, lot.slug, lot.id)
    : `https://www.surplex.com/es/a/${auction.slug}`;

  const images: Array<{ url: string; alt?: string; isPrimary: boolean; sortOrder: number }> = [];
  if (lot.imageUrl) {
    images.push({ url: lot.imageUrl, alt: lot.title, isPrimary: true, sortOrder: 0 });
  } else if (auction.images?.[0]) {
    images.push({ url: buildImageUrl(auction.images[0].uuid), alt: lot.title, isPrimary: true, sortOrder: 0 });
  }

  return {
    platformId: mapPlatformId(platform),
    lotId: lot.id,
    title: lot.title || auction.title,
    description: lot.description || '',
    category: auction.category?.name || 'Industrial',
    subcategory: auction.category?.slug,
    sourceUrl: lotUrl,
    currentBid: lot.currentBid?.amount || null,
    currency: lot.currentBid?.currency || 'EUR',
    estimatedResale: lot.estimatedPrice?.amount || undefined,
    buyerPremiumPercent: 16,
    reservePrice: lot.reservePrice?.amount || null,
    hasReserve: lot.hasReserve || false,
    startingBid: lot.startingBid?.amount || null,
    city: auction.location?.city || '',
    region: auction.location?.region,
    country: auction.location?.country?.name || '',
    countryCode: auction.location?.country?.code || 'DE',
    lat: auction.location?.lat || 48.0,
    lng: auction.location?.lng || 4.0,
    siteType: auction.site?.type,
    auctionEnd: auction.auctionEndDate || new Date(Date.now() + 7 * 86400000).toISOString(),
    inspectionAvailable: auction.inspectionAvailable ?? true,
    make: lot.make?.name,
    model: lot.model?.name,
    year: lot.year || undefined,
    condition: lot.condition?.name || 'good',
    images,
  };
}

function auctionFacetToItem(auction: AuctionFacet, platform: string): RawAuctionItem {
  const images = (auction.images || []).map((img, i) => ({
    url: buildImageUrl(img.uuid),
    alt: auction.title,
    isPrimary: i === 0,
    sortOrder: i,
  }));

  return {
    platformId: mapPlatformId(platform),
    lotId: auction.id,
    title: auction.title,
    description: '',
    category: auction.category?.name || 'Industrial',
    subcategory: auction.category?.slug,
    sourceUrl: buildLotUrl(platform, auction.slug, auction.id),
    currentBid: null,
    currency: 'EUR',
    buyerPremiumPercent: 16,
    hasReserve: false,
    city: auction.location?.city || '',
    region: auction.location?.region,
    country: auction.location?.country?.name || '',
    countryCode: auction.location?.country?.code || 'DE',
    lat: auction.location?.lat || 48.0,
    lng: auction.location?.lng || 4.0,
    siteType: auction.site?.type,
    auctionEnd: auction.auctionEndDate || new Date(Date.now() + 7 * 86400000).toISOString(),
    inspectionAvailable: auction.inspectionAvailable ?? true,
    condition: 'good',
    images,
  };
}