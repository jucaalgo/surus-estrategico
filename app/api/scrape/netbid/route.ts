import { NextRequest, NextResponse } from 'next/server';
import { scrapeNetBid } from '@/lib/scrapers/netbid';
import { transformRawItem } from '@/lib/scrapers/resale-estimates';
import { upsertAuctions, deactivateStale, createScrapeRun, completeScrapeRun, failScrapeRun } from '@/lib/supabase/upsert-auctions';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let runId: string | null = null;

  try {
    runId = await createScrapeRun('netbid');

    const rawItems = await scrapeNetBid({ maxPages: 3 });
    const transformed = rawItems.map(transformRawItem);
    const upsertedCount = await upsertAuctions(transformed);

    const activeLotIds = rawItems.map(item => item.lotId);
    const deactivatedCount = await deactivateStale('netbid', activeLotIds);

    const durationMs = Date.now() - startTime;
    await completeScrapeRun(runId, rawItems.length, upsertedCount, deactivatedCount, durationMs);

    return NextResponse.json({
      success: true,
      platform: 'netbid',
      itemsFound: rawItems.length,
      itemsUpserted: upsertedCount,
      itemsDeactivated: deactivatedCount,
      durationMs,
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error);
    console.error('[scrape/netbid] Caught error:', error);
    if (runId) await failScrapeRun(runId, errorMessage);

    return NextResponse.json({
      success: false,
      platform: 'netbid',
      error: errorMessage,
      durationMs,
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    platform: 'netbid',
    status: 'ready',
    message: 'Send POST to trigger scrape',
  });
}