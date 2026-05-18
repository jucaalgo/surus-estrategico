import { NextRequest, NextResponse } from 'next/server';
import { scrapeBidSpotter } from '@/lib/scrapers/bidspotter';
import { transformRawItem } from '@/lib/scrapers/resale-estimates';
import { upsertAuctions, deactivateStale, createScrapeRun, completeScrapeRun, failScrapeRun } from '@/lib/supabase/upsert-auctions';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const body = await request.json().catch(() => ({}));
  const maxPages = body.maxPages || 3;

  let runId: string | null = null;

  try {
    runId = await createScrapeRun('bidspotter');

    const rawItems = await scrapeBidSpotter({ maxPages });
    const transformed = rawItems.map(transformRawItem);
    const upsertedCount = await upsertAuctions(transformed);

    const activeLotIds = rawItems.map(item => item.lotId);
    const deactivatedCount = await deactivateStale('bidspotter', activeLotIds);

    const durationMs = Date.now() - startTime;
    await completeScrapeRun(runId, rawItems.length, upsertedCount, deactivatedCount, durationMs);

    return NextResponse.json({
      success: true,
      platform: 'bidspotter',
      itemsFound: rawItems.length,
      itemsUpserted: upsertedCount,
      itemsDeactivated: deactivatedCount,
      durationMs,
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error);
    console.error('[scrape/bidspotter] Caught error:', error);
    if (runId) await failScrapeRun(runId, errorMessage);

    return NextResponse.json({
      success: false,
      platform: 'bidspotter',
      error: errorMessage,
      durationMs,
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    platform: 'bidspotter',
    status: 'ready',
    source: 'hibid.com',
    message: 'Send POST to trigger scrape',
  });
}