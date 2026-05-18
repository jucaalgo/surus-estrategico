import { NextRequest, NextResponse } from 'next/server';
import { scrapeTBAuctions } from '@/lib/scrapers/tbauctions';
import { scrapeNetBid } from '@/lib/scrapers/netbid';
import { scrapeIndustrial } from '@/lib/scrapers/industrial';
import { scrapeBidSpotter } from '@/lib/scrapers/bidspotter';
import { scrapeEuroAuctions } from '@/lib/scrapers/euro-auctions';
import { transformRawItem } from '@/lib/scrapers/resale-estimates';
import { upsertAuctions, deactivateStale, createScrapeRun, completeScrapeRun, failScrapeRun } from '@/lib/supabase/upsert-auctions';
import { logScrape } from '@/lib/scrapers/resilience';

interface PlatformResult {
  platformId: string;
  success: boolean;
  itemsFound: number;
  itemsUpserted: number;
  itemsDeactivated: number;
  durationMs: number;
  error?: string;
}

async function runPlatformScraper(
  platformId: string,
  scraper: () => Promise<import('@/lib/scrapers/types').RawAuctionItem[]>,
): Promise<PlatformResult> {
  const startTime = Date.now();
  let runId: string | null = null;

  try {
    runId = await createScrapeRun(platformId);

    const rawItems = await scraper();
    const transformed = rawItems.map(transformRawItem);
    const upsertedCount = await upsertAuctions(transformed);

    const activeLotIds = rawItems.map(item => item.lotId);
    const deactivatedCount = await deactivateStale(platformId, activeLotIds);

    const durationMs = Date.now() - startTime;
    await completeScrapeRun(runId, rawItems.length, upsertedCount, deactivatedCount, durationMs);

    return {
      platformId,
      success: true,
      itemsFound: rawItems.length,
      itemsUpserted: upsertedCount,
      itemsDeactivated: deactivatedCount,
      durationMs,
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error);
    if (runId) await failScrapeRun(runId, errorMessage);
    logScrape(platformId, 'error', `Platform scrape failed: ${errorMessage}`);

    return {
      platformId,
      success: false,
      itemsFound: 0,
      itemsUpserted: 0,
      itemsDeactivated: 0,
      durationMs,
      error: errorMessage,
    };
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const platforms: string[] = body.platforms || ['tbauctions', 'netbid', 'industrial', 'bidspotter', 'euro-auctions'];

  logScrape('all', 'info', `Starting parallel scrape for: ${platforms.join(', ')}`);

  const scraperMap: Record<string, () => Promise<import('@/lib/scrapers/types').RawAuctionItem[]>> = {
    'tbauctions': () => scrapeTBAuctions({ platforms: ['SPX', 'TWK'] }),
    'netbid': () => scrapeNetBid({ maxPages: 3 }),
    'industrial': () => scrapeIndustrial({ maxPages: 3 }),
    'bidspotter': () => scrapeBidSpotter({ maxPages: 3 }),
    'euro-auctions': () => scrapeEuroAuctions({ maxPages: 3 }),
  };

  const activeScrapers = platforms.filter(p => scraperMap[p]);

  if (activeScrapers.length === 0) {
    return NextResponse.json({ error: 'No valid platforms specified' }, { status: 400 });
  }

  // Run all scrapers in parallel using Promise.allSettled
  const results = await Promise.allSettled(
    activeScrapers.map(platformId =>
      runPlatformScraper(platformId, scraperMap[platformId])
    )
  );

  const platformResults: PlatformResult[] = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      platformId: activeScrapers[index],
      success: false,
      itemsFound: 0,
      itemsUpserted: 0,
      itemsDeactivated: 0,
      durationMs: 0,
      error: result.reason?.message || 'Unknown error',
    };
  });

  const totalFound = platformResults.reduce((sum, r) => sum + r.itemsFound, 0);
  const totalUpserted = platformResults.reduce((sum, r) => sum + r.itemsUpserted, 0);
  const totalDeactivated = platformResults.reduce((sum, r) => sum + r.itemsDeactivated, 0);
  const totalDuration = platformResults.reduce((sum, r) => sum + r.durationMs, 0);

  logScrape('all', 'success', `Completed: ${totalFound} found, ${totalUpserted} saved across ${activeScrapers.length} platforms`);

  return NextResponse.json({
    success: platformResults.some(r => r.success),
    platforms: platformResults,
    summary: {
      totalFound,
      totalUpserted,
      totalDeactivated,
      totalDurationMs: totalDuration,
      successfulPlatforms: platformResults.filter(r => r.success).length,
      failedPlatforms: platformResults.filter(r => !r.success).length,
    },
  });
}

export async function GET() {
  return NextResponse.json({
    platform: 'all',
    status: 'ready',
    availablePlatforms: ['tbauctions', 'netbid', 'industrial', 'bidspotter', 'euro-auctions'],
    message: 'Send POST with { platforms: [...] } to trigger parallel scrape, or POST {} for all',
  });
}