import { NextRequest, NextResponse } from 'next/server';
import { scrapeTBAuctions } from '@/lib/scrapers/tbauctions';
import { transformRawItem } from '@/lib/scrapers/resale-estimates';
import { upsertAuctions, deactivateStale, createScrapeRun, completeScrapeRun, failScrapeRun } from '@/lib/supabase/upsert-auctions';

const PLATFORM_ID_MAP: Record<string, string> = {
  SPX: 'surplex',
  TWK: 'troostwijk',
  BVA: 'bva',
  VAVATO: 'vavato',
  AUK: 'auctionuk',
  EPIC: 'epic',
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const body = await request.json().catch(() => ({}));
  const platforms = body.platforms || ['SPX', 'TWK'];

  let runId: string | null = null;

  try {
    runId = await createScrapeRun('tbauctions');

    // 1. Scrape raw data
    const rawItems = await scrapeTBAuctions({ platforms, maxPages: 5 });

    // 2. Transform and calculate KPIs
    const transformed = rawItems.map(transformRawItem);

    // 3. Upsert to database
    const upsertedCount = await upsertAuctions(transformed);

    // 4. Deactivate stale auctions — per platform_id
    const uniquePlatforms = [...new Set(rawItems.map(item => item.platformId))];
    let totalDeactivated = 0;
    for (const platformId of uniquePlatforms) {
      const platformLotIds = rawItems
        .filter(item => item.platformId === platformId)
        .map(item => item.lotId);
      const deactivatedCount = await deactivateStale(platformId, platformLotIds);
      totalDeactivated += deactivatedCount;
    }

    // 5. Complete scrape run
    const durationMs = Date.now() - startTime;
    await completeScrapeRun(runId, rawItems.length, upsertedCount, totalDeactivated, durationMs);

    return NextResponse.json({
      success: true,
      platform: 'tbauctions',
      itemsFound: rawItems.length,
      itemsUpserted: upsertedCount,
      itemsDeactivated: totalDeactivated,
      durationMs,
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error);

    if (runId) {
      await failScrapeRun(runId, errorMessage);
    }

    console.error('[TBAuctions scraper] Error:', errorMessage);

    return NextResponse.json({
      success: false,
      platform: 'tbauctions',
      error: errorMessage,
      durationMs,
    }, { status: 500 });
  }
}

// GET endpoint for checking status without triggering a scrape
export async function GET() {
  return NextResponse.json({
    platform: 'tbauctions',
    status: 'ready',
    platforms: ['SPX', 'TWK', 'BVA'],
    message: 'Send POST to trigger scrape',
  });
}