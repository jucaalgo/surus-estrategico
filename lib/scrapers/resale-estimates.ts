import { calculateKPIs } from '@/lib/calculations';
import type { RawAuctionItem, RawAuctionImage } from './types';

const RESALE_MULTIPLIERS: Record<string, number> = {
  'Robótica Industrial': 2.2,
  'Mecanizado CNC': 2.0,
  'Plástico y Caucho': 1.9,
  'Conformado de Chapa': 2.1,
  'Corte Láser': 1.8,
  'Neumática y Compresores': 2.5,
  'Logística y Almacén': 2.3,
  'Brazos Robot': 2.2,
  'Robots de Soldadura': 2.0,
  'Robots de Paletizado': 2.3,
  'Centros de Mecanizado': 2.0,
  'Tornos CNC': 1.9,
  'Inyectoras': 1.9,
  'Prensas Hidráulicas': 2.1,
  'Láser de Fibra': 1.8,
  'Compresores de Tornillo': 2.5,
  'Carretillas Elevadoras': 2.3,
};

const CONDITION_MAP: Record<string, 'excellent' | 'good' | 'fair' | 'poor'> = {
  'new': 'excellent',
  'as new': 'excellent',
  'neuwertig': 'excellent',
  'very good': 'excellent',
  'excellent': 'excellent',
  'gebraucht': 'good',
  'used': 'good',
  'good': 'good',
  'fair': 'fair',
  'heavily used': 'fair',
  'stark gebraucht': 'fair',
  'poor': 'poor',
  'defective': 'poor',
  'defekt': 'poor',
  'for parts': 'poor',
};

const COUNTRY_COORDS: Record<string, [number, number]> = {
  ES: [40.4, -3.7], DE: [51.1, 10.4], NL: [52.3, 4.9], FR: [46.6, 2.2],
  IT: [41.9, 12.5], UK: [51.5, -0.1], US: [39.8, -98.5], CZ: [49.8, 15.5],
  PL: [51.9, 19.1], BE: [50.8, 4.3], CH: [46.8, 8.2], AT: [47.7, 13.3],
  SE: [60.1, 18.6], FI: [61.9, 25.7], DK: [55.7, 9.6], PT: [39.6, -8.2],
};

export function estimateResale(bid: number, category: string): number {
  const multiplier = RESALE_MULTIPLIERS[category] || 2.0;
  return Math.round(bid * multiplier);
}

export function mapCondition(raw: string | null | undefined): 'excellent' | 'good' | 'fair' | 'poor' {
  if (!raw) return 'good';
  return CONDITION_MAP[raw.toLowerCase()] || 'good';
}

export function getCountryCoords(code: string | null | undefined): [number, number] {
  if (!code) return [48.0, 4.0];
  return COUNTRY_COORDS[code.toUpperCase()] || [48.0, 4.0];
}

export interface TransformedAuction {
  platform_id: string;
  lot_id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string | null;
  source_url: string;
  source: string;
  current_bid: number | null;
  currency: string;
  estimated_resale: number | null;
  buyer_premium_pct: number;
  reserve_price: number | null;
  has_reserve: boolean;
  starting_bid: number | null;
  city: string;
  region: string | null;
  country: string;
  country_code: string;
  lat: number;
  lng: number;
  site_type: string | null;
  auction_end: string;
  inspection_available: boolean;
  make: string | null;
  model: string | null;
  year: number | null;
  condition: string;
  hours: number | null;
  power: string | null;
  weight_kg: number | null;
  total_acquisition_cost: number;
  buyer_premium: number;
  taxes: number;
  transport: number;
  refurbishment: number;
  estimated_resale_value: number;
  gross_profit: number;
  roi: number;
  net_profit_margin: number;
  payback_months: number;
  tir: number;
  arbitrage_score: number;
  is_ganga: boolean;
  risk_score: number;
  risk_level: string;
  images: RawAuctionImage[];
  extra_specs: Record<string, string> | null;
}

export function transformRawItem(item: RawAuctionItem): TransformedAuction {
  const bid = item.currentBid || 0;
  const resale = item.estimatedResale || (bid > 0 ? estimateResale(bid, item.category) : 0);
  const coords = item.lat && item.lng ? [item.lat, item.lng] as [number, number] : getCountryCoords(item.countryCode);

  const pricing = {
    currentBid: bid,
    currency: item.currency || 'EUR',
    estimatedResale: resale,
    buyerPremiumPercent: item.buyerPremiumPercent || 16,
    reservePrice: item.reservePrice || null,
    hasReserve: item.hasReserve,
    startingBid: item.startingBid || null,
  };

  const specs = {
    make: item.make,
    model: item.model,
    year: item.year,
    condition: mapCondition(item.condition),
    hours: item.hours,
    power: item.power,
    weight: item.weightKg || 2000,
  };

  const kpis = calculateKPIs(pricing, specs, item.countryCode);

  return {
    platform_id: item.platformId,
    lot_id: item.lotId,
    title: item.title,
    description: item.description,
    category: item.category,
    subcategory: item.subcategory || null,
    source_url: item.sourceUrl,
    source: 'scraped',
    current_bid: bid || null,
    currency: item.currency || 'EUR',
    estimated_resale: resale || null,
    buyer_premium_pct: item.buyerPremiumPercent || 16,
    reserve_price: item.reservePrice || null,
    has_reserve: item.hasReserve,
    starting_bid: item.startingBid || null,
    city: item.city || item.country,
    region: item.region || null,
    country: item.country,
    country_code: item.countryCode,
    lat: coords[0],
    lng: coords[1],
    site_type: item.siteType || null,
    auction_end: item.auctionEnd,
    inspection_available: item.inspectionAvailable,
    make: specs.make || null,
    model: specs.model || null,
    year: specs.year || null,
    condition: specs.condition,
    hours: specs.hours || null,
    power: specs.power || null,
    weight_kg: specs.weight,
    total_acquisition_cost: kpis.totalAcquisitionCost,
    buyer_premium: kpis.buyerPremium,
    taxes: kpis.taxes,
    transport: kpis.transport,
    refurbishment: kpis.refurbishment,
    estimated_resale_value: kpis.estimatedResaleValue,
    gross_profit: kpis.grossProfit,
    roi: kpis.roi,
    net_profit_margin: kpis.netProfitMargin,
    payback_months: kpis.paybackMonths,
    tir: kpis.tir,
    arbitrage_score: kpis.arbitrageScore,
    is_ganga: kpis.isGanga,
    risk_score: kpis.riskScore,
    risk_level: kpis.riskLevel,
    images: item.images || [],
    extra_specs: item.extraSpecs || null,
  };
}

// Re-export for convenience
export type { RawAuctionImage } from './types';