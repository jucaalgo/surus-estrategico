import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  // Get last scrape run per platform
  const { data: runs, error } = await supabase
    .from('scrape_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group by platform, keep latest per platform
  const latestByPlatform: Record<string, typeof runs[0]> = {};
  for (const run of runs || []) {
    if (!latestByPlatform[run.platform_id]) {
      latestByPlatform[run.platform_id] = run;
    }
  }

  // Get total active auctions count
  const { count: totalAuctions } = await supabase
    .from('auctions')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  return NextResponse.json({
    platforms: latestByPlatform,
    totalAuctions: totalAuctions || 0,
  });
}