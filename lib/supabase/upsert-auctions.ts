import { supabaseAdmin } from './admin';
import type { TransformedAuction } from '@/lib/scrapers/resale-estimates';
import type { RawAuctionImage } from '@/lib/scrapers/types';

export async function upsertAuctions(items: TransformedAuction[]): Promise<number> {
  if (items.length === 0) return 0;

  // Deduplicate by platform_id + lot_id — keep first occurrence
  const seen = new Set<string>();
  const deduped = items.filter(item => {
    const key = `${item.platform_id}:${item.lot_id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // 1. Upsert main auction records
  const baseRows = deduped.map(({ images: _, extra_specs: __, resale_markets: ___, lot_quantity: ____, detail_scraped, data_quality_score, price_confidence, ...row }) => ({
    ...row,
    is_active: true,
  }));

  let data: any[] | null = null;
  let error: any = null;

  // Try upsert with all columns (including new ones from migration 002)
  const extendedRows = baseRows.map((r, i) => ({
    ...r,
    detail_scraped: deduped[i].detail_scraped,
    data_quality_score: deduped[i].data_quality_score,
    price_confidence: deduped[i].price_confidence,
  }));

  const result = await supabaseAdmin
    .from('auctions')
    .upsert(extendedRows, { onConflict: 'platform_id,lot_id' })
    .select('id, platform_id, lot_id');

  data = result.data;
  error = result.error;

  // Defensive fallback: if new columns don't exist in DB (migration 002 not applied),
  // retry without them and log a clear warning.
  if (error && error.code === 'PGRST204' && error.message?.includes('data_quality_score')) {
    console.warn('[upsertAuctions] DB missing migration 002 columns (data_quality_score, detail_scraped, price_confidence). Retrying without them. Please apply supabase/migrations/002_data_quality.sql');
    const fallback = await supabaseAdmin
      .from('auctions')
      .upsert(baseRows, { onConflict: 'platform_id,lot_id' })
      .select('id, platform_id, lot_id');
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    console.error('[upsertAuctions] Error upserting auctions:', error);
    throw error;
  }

  if (!data || data.length === 0) return 0;

  // 2. Build a map of (platform_id, lot_id) -> db_id for image upserts
  const idMap = new Map<string, string>();
  for (const row of data) {
    idMap.set(`${row.platform_id}:${row.lot_id}`, row.id);
  }

  // 3. Upsert images
  const imageRows: { auction_id: string; url: string; proxy_url: string | null; alt_text: string | null; sort_order: number; is_primary: boolean }[] = [];

  for (const item of deduped) {
    const dbId = idMap.get(`${item.platform_id}:${item.lot_id}`);
    if (!dbId || !item.images || item.images.length === 0) continue;

    for (const img of item.images) {
      imageRows.push({
        auction_id: dbId,
        url: img.url,
        proxy_url: null, // Will be generated on read
        alt_text: img.alt || null,
        sort_order: img.sortOrder ?? 0,
        is_primary: img.isPrimary ?? false,
      });
    }
  }

  if (imageRows.length > 0) {
    // Delete existing images for these auctions first
    const auctionIds = data.map(r => r.id);
    await supabaseAdmin
      .from('auction_images')
      .delete()
      .in('auction_id', auctionIds);

    const { error: imgError } = await supabaseAdmin
      .from('auction_images')
      .insert(imageRows);

    if (imgError) {
      console.error('[upsertAuctions] Error upserting images:', imgError);
      // Don't throw — images are non-critical
    }
  }

  // 4. Upsert extra specs
  const specRows: { auction_id: string; key: string; value: string; unit: string | null }[] = [];

  for (const item of deduped) {
    if (!item.extra_specs) continue;
    const dbId = idMap.get(`${item.platform_id}:${item.lot_id}`);
    if (!dbId) continue;

    for (const [key, value] of Object.entries(item.extra_specs)) {
      specRows.push({ auction_id: dbId, key, value, unit: null });
    }
  }

  if (specRows.length > 0) {
    const auctionIds = data.map(r => r.id);
    await supabaseAdmin
      .from('auction_specs')
      .delete()
      .in('auction_id', auctionIds);

    const { error: specError } = await supabaseAdmin
      .from('auction_specs')
      .insert(specRows);

    if (specError) {
      console.error('[upsertAuctions] Error upserting specs:', specError);
    }
  }

  return data.length;
}

export async function deactivateStale(platformId: string, activeLotIds: string[]): Promise<number> {
  // If no active lot IDs, deactivate all for this platform
  if (activeLotIds.length === 0) {
    const { data: staleAuctions, error } = await supabaseAdmin
      .from('auctions')
      .update({ is_active: false })
      .eq('platform_id', platformId)
      .eq('is_active', true)
      .select('id');

    if (error) {
      console.error('[deactivateStale] Error:', error);
      return 0;
    }
    return staleAuctions?.length || 0;
  }

  // Deactivate auctions not in the active list
  const { data: staleAuctions, error } = await supabaseAdmin
    .from('auctions')
    .update({ is_active: false })
    .eq('platform_id', platformId)
    .eq('is_active', true)
    .not('lot_id', 'in', activeLotIds)
    .select('id');

  if (error) {
    console.error('[deactivateStale] Error:', error);
    return 0;
  }

  return staleAuctions?.length || 0;
}

export async function createScrapeRun(platformId: string): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from('scrape_runs')
    .insert({ platform_id: platformId, status: 'running' })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function completeScrapeRun(
  runId: string,
  itemsFound: number,
  itemsUpserted: number,
  itemsDeactivated: number,
  durationMs: number
) {
  await supabaseAdmin
    .from('scrape_runs')
    .update({
      status: 'success',
      items_found: itemsFound,
      items_upserted: itemsUpserted,
      items_deactivated: itemsDeactivated,
      duration_ms: durationMs,
      finished_at: new Date().toISOString(),
    })
    .eq('id', runId);
}

export async function failScrapeRun(runId: string, errorMessage: string) {
  await supabaseAdmin
    .from('scrape_runs')
    .update({
      status: 'failed',
      error_message: errorMessage,
      finished_at: new Date().toISOString(),
    })
    .eq('id', runId);
}