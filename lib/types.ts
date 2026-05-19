export interface PlatformInfo {
  id: string;
  name: string;
  country: string;
  trustScore: number; // 0-10
  active: boolean;
}

export interface PricingInfo {
  currentBid: number | null;
  currency: string;
  estimatedResale: number | null;
  buyerPremiumPercent: number;
  reservePrice: number | null;
  hasReserve: boolean;
  startingBid: number | null;
  lotQuantity?: number;
}

export interface LocationInfo {
  city: string;
  region?: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  siteType?: string;
}

export interface TimingInfo {
  auctionEnd: string; // ISO date
  timeRemainingMs: number;
  inspectionAvailable: boolean;
}

export interface SpecInfo {
  make?: string;
  model?: string;
  year?: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  hours?: number;
  power?: string;
  weight?: number; // kg
}

export interface CalculatedKPIs {
  totalAcquisitionCost: number;
  buyerPremium: number;
  taxes: number;
  transport: number;
  refurbishment: number;
  estimatedResaleValue: number;
  grossProfit: number;
  roi: number; // percentage
  netProfitMargin: number; // percentage
  paybackMonths: number;
  tir: number; // annual IRR percentage
  arbitrageScore: number;
  isGanga: boolean;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
}

export interface Asset {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  platform: PlatformInfo;
  pricing: PricingInfo;
  location: LocationInfo;
  timing: TimingInfo;
  specs: SpecInfo;
  kpis: CalculatedKPIs;
  sourceUrl?: string;
  imageUrl?: string;
  images?: { url: string; alt: string; isPrimary: boolean }[];
  source: 'mock' | 'scraped' | 'gemini';
  resaleMarkets?: string[];
  lotQuantity?: number;
  detailScraped?: boolean;
  dataQuality?: number;
  priceConfidence?: 'real' | 'estimated' | 'unknown';
}

export interface SearchResult {
  query: string;
  total: number;
  elapsed: number;
  assets: Asset[];
  platforms: number;
  source: string;
}

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  updated: string;
}

export interface SmartPreset {
  id: string;
  label: string;
  icon: string;
  filter: (asset: Asset) => boolean;
}

export interface ROIInputs {
  investment: number;
  logisticsCost: number;
  estimatedResale: number;
}