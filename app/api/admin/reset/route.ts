import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST() {
  try {
    // Delete all data from related tables first
    const { error: specsError } = await supabaseAdmin
      .from('auction_specs')
      .delete()
      .not('id', 'is', null);
    if (specsError) console.error('[reset] Error deleting specs:', specsError);

    const { error: imagesError } = await supabaseAdmin
      .from('auction_images')
      .delete()
      .not('id', 'is', null);
    if (imagesError) console.error('[reset] Error deleting images:', imagesError);

    const { error: auctionsError } = await supabaseAdmin
      .from('auctions')
      .delete()
      .not('id', 'is', null);
    if (auctionsError) {
      console.error('[reset] Error deleting auctions:', auctionsError);
      return NextResponse.json({ success: false, error: auctionsError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'All auction data deleted',
      count: 0,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[reset] Error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
