// Batch recalculate KPIs for all active auctions using the new engine
// Usage: npx tsx scripts/recalculate-kpis.ts

import 'dotenv/config';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { analyzeAsset } from '@/lib/engine';
import { mapCondition } from '@/lib/scrapers/resale-estimates';

async function main() {
  console.log('[recalculate-kpis] Fetching active auctions...');

  const { data: rows, error } = await supabaseAdmin
    .from('auctions')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('[recalculate-kpis] Supabase error:', error);
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.log('[recalculate-kpis] No active auctions found.');
    return;
  }

  console.log(`[recalculate-kpis] Processing ${rows.length} auctions...`);

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const result = analyzeAsset({
        title: row.title || '',
        category: row.category || 'Industrial',
        specs: {
          year: row.year ?? undefined,
          hours: row.hours ?? undefined,
          weightKg: row.weight_kg ?? undefined,
          power: row.power ?? undefined,
          make: row.make ?? undefined,
          model: row.model ?? undefined,
          condition: mapCondition(row.condition),
        },
        location: {
          city: row.city || '',
          countryCode: row.country_code || 'DE',
          lat: row.lat ?? undefined,
          lng: row.lng ?? undefined,
        },
        pricing: {
          currentBid: row.current_bid ?? null,
          startingBid: row.starting_bid ?? null,
          estimatedResale: row.estimated_resale ?? null,
          buyerPremiumPercent: row.buyer_premium_pct || 16,
          hasReserve: row.has_reserve || false,
          reservePrice: row.reserve_price ?? null,
          currency: row.currency || 'EUR',
        },
        lotQuantity: 1,
      });

      const { error: updErr } = await supabaseAdmin
        .from('auctions')
        .update({
          total_acquisition_cost: result.kpis.totalAcquisitionCost,
          buyer_premium: result.costs.buyerPremium,
          taxes: result.costs.taxes,
          transport: result.costs.transport,
          refurbishment: result.costs.refurbishment,
          estimated_resale_value: result.resale.value,
          gross_profit: result.kpis.grossProfit,
          roi: result.kpis.roi,
          net_profit_margin: result.kpis.netProfitMargin,
          payback_months: result.kpis.paybackMonths,
          tir: result.kpis.tir,
          arbitrage_score: result.kpis.arbitrageScore,
          is_ganga: result.kpis.isGanga,
          risk_score: result.risk.score,
          risk_level: result.risk.level,
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id);

      if (updErr) {
        console.error(`[recalculate-kpis] Update failed for ${row.id}:`, updErr.message);
        failed++;
      } else {
        updated++;
      }

      if ((i + 1) % 50 === 0) {
        console.log(`[recalculate-kpis] ${i + 1}/${rows.length} processed...`);
      }
    } catch (err) {
      console.error(`[recalculate-kpis] Exception for ${row.id}:`, err instanceof Error ? err.message : err);
      failed++;
    }
  }

  console.log(`[recalculate-kpis] Done. Updated: ${updated}, Failed: ${failed}, Total: ${rows.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
