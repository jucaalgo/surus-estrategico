// Batch geocode auctions with missing coordinates
// Usage: npx tsx scripts/geocode-batch.ts

import 'dotenv/config';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { geocodeLocation } from '@/lib/engine/geocode';

const SLEEP_MS = 1100; // Nominatim policy: max 1 req/sec

async function main() {
  console.log('[geocode-batch] Fetching auctions without coordinates...');

  const { data: rows, error } = await supabaseAdmin
    .from('auctions')
    .select('id, city, country_code')
    .or('lat.is.null,lng.is.null')
    .eq('is_active', true);

  if (error) {
    console.error('[geocode-batch] Supabase error:', error);
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.log('[geocode-batch] All active auctions have coordinates.');
    return;
  }

  console.log(`[geocode-batch] Geocoding ${rows.length} auctions (rate limit: 1 req/sec)...`);

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const geo = await geocodeLocation(row.city, row.country_code);

      const { error: updErr } = await supabaseAdmin
        .from('auctions')
        .update({ lat: geo.lat, lng: geo.lng })
        .eq('id', row.id);

      if (updErr) {
        console.error(`[geocode-batch] Update failed for ${row.id}:`, updErr.message);
        failed++;
      } else {
        updated++;
        console.log(`[geocode-batch] ${row.city}, ${row.country_code} → [${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)}]`);
      }
    } catch (err) {
      console.error(`[geocode-batch] Geocode failed for "${row.city}, ${row.country_code}":`, err instanceof Error ? err.message : err);
      failed++;
    }

    if (i < rows.length - 1) {
      await new Promise((r) => setTimeout(r, SLEEP_MS));
    }

    if ((i + 1) % 10 === 0) {
      console.log(`[geocode-batch] ${i + 1}/${rows.length} processed (updated: ${updated}, failed: ${failed})...`);
    }
  }

  console.log(`[geocode-batch] Done. Updated: ${updated}, Failed: ${failed}, Total: ${rows.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
