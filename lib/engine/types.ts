// lib/engine/types.ts

export type Condition = 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';

export interface AssetSpecs {
  year?: number;
  hours?: number;
  weightKg?: number;
  power?: string;
  make?: string;
  model?: string;
  condition: Condition;
}

export interface AssetLocation {
  city?: string;
  countryCode: string;
  lat?: number;
  lng?: number;
}

export interface PricingInputs {
  currentBid: number | null;
  startingBid: number | null;
  estimatedResale: number | null;
  buyerPremiumPercent: number;
  hasReserve: boolean;
  reservePrice: number | null;
  currency: string;
}

export interface CategoryProfile {
  name: string;
  keywords: string[];
  refurbishmentMin: number;
  refurbishmentMax: number;
  holdingMonths: number;
  transportBase: number;
  defaultWeightKg: number;
  liquidityPenalty: number; // 0-25, higher = harder to sell
  resaleRangeMin: number;
  resaleRangeMax: number;
}

export interface AcquisitionCosts {
  bid: number;
  buyerPremium: number;
  taxes: number;
  transport: number;
  refurbishment: number;
  fixedFees: number;
  total: number;
}

export interface ResaleEstimate {
  value: number;
  confidence: 'real' | 'estimated' | 'unknown';
  method: string;
}

export interface KPIs {
  roi: number;
  netProfitMargin: number;
  paybackMonths: number;
  tir: number;
  arbitrageScore: number;
  isGanga: boolean;
  grossProfit: number;
  totalAcquisitionCost: number;
}

export interface RiskProfile {
  score: number;
  level: 'low' | 'medium' | 'high' | 'very-high';
  factors: Record<string, number>;
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
  source: 'nominatim' | 'fallback';
}

export interface AnalysisInput {
  title: string;
  category?: string;
  specs: AssetSpecs;
  location: AssetLocation;
  pricing: PricingInputs;
  lotQuantity?: number;
}

export interface AnalysisResult {
  costs: AcquisitionCosts;
  resale: ResaleEstimate;
  kpis: KPIs;
  risk: RiskProfile;
  categoryDetected: string;
}
