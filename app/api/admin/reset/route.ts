import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import seedData from '@/scripts/seed-data.json';

export async function POST() {
  try {
    // 1. Delete all auction data (use a dummy filter to delete all)
    const { error: specsError } = await supabaseAdmin
      .from('auction_specs')
      .delete()
      .gte('created_at', '2000-01-01');
    if (specsError) console.error('[reset] Error deleting specs:', specsError);

    const { error: imagesError } = await supabaseAdmin
      .from('auction_images')
      .delete()
      .gte('created_at', '2000-01-01');
    if (imagesError) console.error('[reset] Error deleting images:', imagesError);

    const { error: auctionsError } = await supabaseAdmin
      .from('auctions')
      .delete()
      .gte('created_at', '2000-01-01');
    if (auctionsError) {
      console.error('[reset] Error deleting auctions:', auctionsError);
      return NextResponse.json({ success: false, error: auctionsError.message }, { status: 500 });
    }

    // 2. Re-seed with mock data (seed-data.json is already flat rows)
    const { data, error: insertError } = await supabaseAdmin
      .from('auctions')
      .upsert(seedData, { onConflict: 'platform_id,lot_id' })
      .select('id, platform_id, lot_id');

    if (insertError) {
      console.error('[reset] Error inserting seed data:', insertError);
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Database reset and reseeded with mock data',
      count: data?.length || 0,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[reset] Error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}