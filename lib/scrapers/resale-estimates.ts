import { analyzeAsset } from '@/lib/engine';
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

const RESALE_MARKETS: Record<string, string[]> = {
  'Robótica Industrial': ['Exapro', 'RobotWorx', 'DirectIndustry', 'Automotive resale networks'],
  'Mecanizado CNC': ['Exapro', 'Machinio', 'Kitmondo', 'Metalworking auctions'],
  'Plástico y Caucho': ['Exapro', 'PlastiWin', 'Kitmondo', 'EU plastic machinery dealers'],
  'Conformado de Chapa': ['Exapro', 'Machinio', 'Amada outlets'],
  'Corte Láser': ['Exapro', 'Machinio', 'Laserax reseller network'],
  'Neumática y Compresores': ['Exapro', 'Kaeser outlet', 'Atlas Copco used'],
  'Logística y Almacén': ['Mascus', 'MachineryZone', 'ForkliftZone', 'Linde used'],
  'default': ['Exapro', 'Machinio', 'eBay Industrial', 'Local equipment dealers'],
};

export function getResaleMarkets(category: string): string[] {
  return RESALE_MARKETS[category] || RESALE_MARKETS['default'];
}

export function detectLotQuantity(title: string): number {
  const patterns = [
    /(\d+)\s*x\s+/i,
    /lote\s+de\s+(\d+)/i,
    /lote\s+(\d+)/i,
    /(\d+)\s+unidades/i,
    /(\d+)\s+maschinen/i,
    /(\d+)\s+machines/i,
    /(\d+)\s+stk/i,
    /(\d+)\s+stück/i,
  ];
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) return parseInt(match[1], 10);
  }
  return 1;
}

export function estimateResale(bid: number, category: string): number {
  const multiplier = RESALE_MULTIPLIERS[category] || 2.0;
  return Math.round(bid * multiplier);
}

// Estimate base value from equipment keywords in title (when no price is shown)
const EQUIPMENT_VALUE_RANGES: { keywords: string[]; min: number; max: number }[] = [
  { keywords: ['cnc', 'mecanizado', 'machining', 'bearbeitung', 'centro mecanizado', 'bearbeitungszentrum'], min: 40000, max: 120000 },
  { keywords: ['torno', 'dreh', 'lathe', 'drehmaschine'], min: 25000, max: 80000 },
  { keywords: ['kuka', 'abb', 'fanuc', 'robot', 'roboter'], min: 15000, max: 60000 },
  { keywords: ['plegadora', 'biege', 'press brake', 'abkant', 'biegemaschine'], min: 25000, max: 90000 },
  { keywords: ['laser', 'láser', 'schneid', 'cutting', 'trumpf', 'amada'], min: 35000, max: 100000 },
  { keywords: ['compresor', 'compressor', 'druckluft', 'kompressor'], min: 3000, max: 25000 },
  { keywords: ['carretilla', 'forklift', 'stapler', 'gabelstapler', 'jungheinrich', 'still'], min: 3000, max: 15000 },
  { keywords: ['inyectora', 'injection', 'spritzguss', 'spritzgieß', 'engel', 'arburg'], min: 20000, max: 80000 },
  { keywords: ['prensa', 'presse', 'press', 'hydraulik'], min: 15000, max: 60000 },
  { keywords: ['soldadura', 'welding', 'schweiß', 'schweiss', 'weld'], min: 5000, max: 25000 },
  { keywords: ['milling', 'fräsmaschine', 'fräser', 'fresadora'], min: 20000, max: 70000 },
  { keywords: ['grinding', 'schleif', 'schleifmaschine', 'rectificadora'], min: 15000, max: 50000 },
  { keywords: ['saw', 'säge', 'sierra'], min: 8000, max: 35000 },
  { keywords: ['drilling', 'bohr', 'bohrmaschine', 'taladro'], min: 8000, max: 30000 },
];

export function estimateValueFromTitle(title: string): number {
  const lower = title.toLowerCase();
  for (const range of EQUIPMENT_VALUE_RANGES) {
    if (range.keywords.some(k => lower.includes(k))) {
      // Pick random-ish value in range (deterministic based on title length)
      const seed = title.length % 10;
      const ratio = 0.5 + (seed / 20); // 0.5 to 1.0
      return Math.round(range.min + (range.max - range.min) * ratio);
    }
  }
  // Default for unknown industrial equipment
  return 15000;
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
  resale_markets: string[];
  lot_quantity: number;
  detail_scraped: boolean;
  data_quality_score: number;
  price_confidence: 'real' | 'estimated' | 'unknown';
}

function computeDataQuality(item: RawAuctionItem): number {
  let score = 30; // Base for having a listing
  if (item.description && item.description.length > 50 && item.description !== item.title) score += 20;
  if (item.make) score += 15;
  if (item.year && item.year > 1980) score += 15;
  if (item.hours !== undefined && item.hours >= 0) score += 10;
  if (item.images && item.images.length > 0) score += 10;
  return Math.min(100, score);
}

export function transformRawItem(item: RawAuctionItem): TransformedAuction {
  const lotQuantity = detectLotQuantity(item.title);
  const dataQualityScore = item.dataQualityScore ?? computeDataQuality(item);
  const priceConfidence: 'real' | 'estimated' | 'unknown' =
    item.currentBid != null && item.currentBid > 0 ? 'real' : item.estimatedResale ? 'estimated' : 'unknown';

  const result = analyzeAsset({
    title: item.title,
    category: item.category,
    specs: {
      year: item.year,
      hours: item.hours,
      weightKg: item.weightKg,
      power: item.power,
      make: item.make,
      model: item.model,
      condition: mapCondition(item.condition),
    },
    location: {
      city: item.city,
      countryCode: item.countryCode,
      lat: item.lat,
      lng: item.lng,
    },
    pricing: {
      currentBid: item.currentBid,
      startingBid: item.startingBid || null,
      estimatedResale: item.estimatedResale || null,
      buyerPremiumPercent: item.buyerPremiumPercent || 16,
      hasReserve: item.hasReserve,
      reservePrice: item.reservePrice || null,
      currency: item.currency || 'EUR',
    },
    lotQuantity,
  });

  const coords = item.lat && item.lng ? [item.lat, item.lng] as [number, number] : getCountryCoords(item.countryCode);

  return {
    platform_id: item.platformId,
    lot_id: item.lotId,
    title: item.title,
    description: item.description,
    category: item.category,
    subcategory: item.subcategory || null,
    source_url: item.sourceUrl,
    source: 'scraped',
    current_bid: item.currentBid || null,
    currency: item.currency || 'EUR',
    estimated_resale: result.resale.value || null,
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
    make: item.make || null,
    model: item.model || null,
    year: item.year || null,
    condition: mapCondition(item.condition),
    hours: item.hours || null,
    power: item.power || null,
    weight_kg: item.weightKg || null,
    total_acquisition_cost: result.kpis.totalAcquisitionCost,
    buyer_premium: result.costs.buyerPremium,
    taxes: result.costs.taxes,
    transport: result.costs.transport,
    refurbishment: result.costs.refurbishment,
    estimated_resale_value: result.resale.value,
    gross_profit: result.kpis.grossProfit,
    roi: result.kpis.roi,
    net_profit_margin: result.kpis.netProfitMargin,
    payback_months: result.kpis.paybackMonths,
    tir: result.kpis.tir,
    arbitrage_score: result.kpis.arbitrageScore,
    is_ganga: result.kpis.isGanga,
    risk_score: result.risk.score,
    risk_level: result.risk.level,
    images: item.images || [],
    extra_specs: item.extraSpecs || null,
    resale_markets: getResaleMarkets(item.category),
    lot_quantity: lotQuantity,
    detail_scraped: item.detailScraped ?? false,
    data_quality_score: dataQualityScore,
    price_confidence: item.priceConfidence || priceConfidence,
  };
}

// Re-export for convenience
export type { RawAuctionImage } from './types';