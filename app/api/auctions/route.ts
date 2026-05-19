import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import type { Asset, PlatformInfo } from '@/lib/types';
import { PLATFORMS } from '@/lib/mock-data';
import { getResaleMarkets, detectLotQuantity } from '@/lib/scrapers/resale-estimates';

const PLATFORM_MAP: Record<string, PlatformInfo> = Object.fromEntries(
  PLATFORMS.map(p => [p.id, p])
);

// Preset SQL filter definitions
const PRESET_FILTERS: Record<string, (q: any) => any> = {
  gangas: (q) => q.gte('roi', 30).gte('arbitrage_score', 1.8).lte('risk_score', 55),
  liquidaciones: (q) => q.or('title.ilike.%planta%,title.ilike.%línea completa%,title.ilike.%liquidación%,title.ilike.%linea completa%,title.ilike.%liquidacion%'),
  insolvencias: (q) => q.or('title.ilike.%insolvenc%,title.ilike.%bankrupt%,title.ilike.%closing%'),
  'sin-reserva': (q) => q.eq('has_reserve', false),
  alimentaria: (q) => q.or('title.ilike.%food%,title.ilike.%aliment%,title.ilike.%bakery%,title.ilike.%meat%,title.ilike.%dairy%'),
  robotica: (q) => q.or('category.eq.Robótica,title.ilike.%robot%,title.ilike.%kuka%,title.ilike.%fanuc%'),
  cnc: (q) => q.or('category.eq.CNC,title.ilike.%cnc%,title.ilike.%mecanizado%'),
};

function dbRowToAsset(row: any): Asset {
  const platformInfo: PlatformInfo = PLATFORM_MAP[row.platform_id] || {
    id: row.platform_id,
    name: row.platform_id.charAt(0).toUpperCase() + row.platform_id.slice(1),
    country: row.country_code || 'DE',
    trustScore: 7,
    active: true,
  };

  const timeRemainingMs = row.auction_end
    ? Math.max(0, new Date(row.auction_end).getTime() - Date.now())
    : 0;

  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    category: row.category || 'Industrial',
    subcategory: row.subcategory || undefined,
    platform: platformInfo,
    pricing: {
      currentBid: row.current_bid,
      currency: row.currency || 'EUR',
      estimatedResale: row.estimated_resale_value,
      buyerPremiumPercent: row.buyer_premium_pct || 16,
      reservePrice: row.reserve_price,
      hasReserve: row.has_reserve || false,
      startingBid: row.starting_bid,
    },
    location: {
      city: row.city || '',
      region: row.region || undefined,
      country: row.country || '',
      countryCode: row.country_code || 'DE',
      lat: row.lat || 48.0,
      lng: row.lng || 4.0,
      siteType: row.site_type || undefined,
    },
    timing: {
      auctionEnd: row.auction_end || new Date(Date.now() + 7 * 86400000).toISOString(),
      timeRemainingMs,
      inspectionAvailable: row.inspection_available ?? true,
    },
    specs: {
      make: row.make || undefined,
      model: row.model || undefined,
      year: row.year || undefined,
      condition: (row.condition || 'good') as 'excellent' | 'good' | 'fair' | 'poor',
      hours: row.hours || undefined,
      power: row.power || undefined,
      weight: row.weight_kg || undefined,
    },
    kpis: {
      totalAcquisitionCost: row.total_acquisition_cost || 0,
      buyerPremium: row.buyer_premium || 0,
      taxes: row.taxes || 0,
      transport: row.transport || 0,
      refurbishment: row.refurbishment || 0,
      estimatedResaleValue: row.estimated_resale_value || 0,
      grossProfit: row.gross_profit || 0,
      roi: row.roi || 0,
      netProfitMargin: row.net_profit_margin || 0,
      paybackMonths: row.payback_months || 999,
      tir: row.tir || 0,
      arbitrageScore: row.arbitrage_score || 0,
      isGanga: row.is_ganga || false,
      riskScore: row.risk_score || 0,
      riskLevel: row.risk_level || 'medium',
    },
    sourceUrl: row.source_url || undefined,
    imageUrl: undefined,
    images: [],
    source: (row.source || 'scraped') as 'scraped' | 'mock' | 'gemini',
    resaleMarkets: getResaleMarkets(row.category || 'Industrial'),
    lotQuantity: detectLotQuantity(row.title || ''),
    detailScraped: row.detail_scraped || false,
    dataQuality: row.data_quality_score || 0,
    priceConfidence: row.price_confidence || 'unknown',
  };
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = params.get('q')?.trim() || '';
  const platforms = params.get('platforms')?.split(',').filter(Boolean) || [];
  const countries = params.get('countries')?.split(',').filter(Boolean) || [];
  const category = params.get('category') || '';
  const isGanga = params.get('ganga') === 'true';
  const sortBy = params.get('sort') || 'auction_end';
  const limit = Math.min(parseInt(params.get('limit') || '50', 10) || 50, 200);
  const offset = parseInt(params.get('offset') || '0', 10) || 0;
  const preset = params.get('preset') || '';
  const includeClosed = params.get('includeClosed') === 'true';
  const dataQuality = parseInt(params.get('dataQuality') || '0', 10) || 0;

  let dbQuery = supabase
    .from('auctions')
    .select('*, auction_images(url, proxy_url, alt_text, is_primary, sort_order)', { count: 'exact' })
    .eq('is_active', true);

  // Filter expired auctions by default
  if (!includeClosed) {
    dbQuery = dbQuery.gt('auction_end', new Date().toISOString());
  }

  if (query) {
    dbQuery = dbQuery.ilike('title', `%${query}%`);
  }
  if (platforms.length) {
    dbQuery = dbQuery.in('platform_id', platforms);
  }
  if (countries.length) {
    dbQuery = dbQuery.in('country_code', countries);
  }
  if (category) {
    dbQuery = dbQuery.eq('category', category);
  }
  if (isGanga) {
    dbQuery = dbQuery.eq('is_ganga', true);
  }
  if (preset && PRESET_FILTERS[preset]) {
    dbQuery = PRESET_FILTERS[preset](dbQuery);
  }
  if (dataQuality > 0) {
    dbQuery = dbQuery.gte('data_quality_score', dataQuality);
  }

  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    auction_end: { column: 'auction_end', ascending: true },
    roi: { column: 'roi', ascending: false },
    risk_score: { column: 'risk_score', ascending: false },
    current_bid: { column: 'current_bid', ascending: true },
    arbitrage_score: { column: 'arbitrage_score', ascending: false },
  };
  const sort = sortMap[sortBy] || sortMap.auction_end;
  dbQuery = dbQuery.order(sort.column, { ascending: sort.ascending });
  dbQuery = dbQuery.range(offset, offset + limit - 1);

  const { data, error, count } = await dbQuery;

  if (error) {
    console.error('[/api/auctions] Supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ assets: [], total: 0, offset, limit, source: 'supabase' });
  }

  const assets = data.map((row: any) => {
    const asset = dbRowToAsset(row);
    const images = row.auction_images || [];
    const primaryImage = images.find((img: any) => img.is_primary) || images[0];
    if (primaryImage) {
      asset.imageUrl = `/api/images/proxy?url=${encodeURIComponent(primaryImage.url)}`;
    }
    // Build images array for carousel
    asset.images = images.slice(0, 5).map((img: any) => ({
      url: `/api/images/proxy?url=${encodeURIComponent(img.url)}`,
      alt: img.alt_text || asset.title,
      isPrimary: img.is_primary,
    }));
    return asset;
  });

  return NextResponse.json({
    assets,
    total: count || assets.length,
    offset,
    limit,
    source: 'supabase',
  });
}
