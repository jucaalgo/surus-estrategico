export interface RawAuctionImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface RawAuctionItem {
  platformId: string;       // 'surplex', 'troostwijk', 'netbid', etc.
  lotId: string;            // Platform's native ID
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  sourceUrl: string;

  // Pricing
  currentBid: number | null;
  currency: string;
  estimatedResale?: number;
  buyerPremiumPercent: number;
  reservePrice?: number | null;
  hasReserve: boolean;
  startingBid?: number | null;

  // Location
  city: string;
  region?: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  siteType?: string;

  // Timing
  auctionEnd: string;       // ISO date string
  inspectionAvailable: boolean;

  // Specs
  make?: string;
  model?: string;
  year?: number;
  condition: string;
  hours?: number;
  power?: string;
  weightKg?: number;

  // Images
  images: RawAuctionImage[];

  // Extra specs (key-value pairs)
  extraSpecs?: Record<string, string>;
}

export interface ScrapeResult {
  platformId: string;
  itemsFound: number;
  itemsUpserted: number;
  itemsDeactivated: number;
  durationMs: number;
  error?: string;
}