// lib/engine/kpi.ts
import { KPIs, AcquisitionCosts, ResaleEstimate, CategoryProfile } from './types';

export function calculateKPIs(
  costs: AcquisitionCosts,
  resale: ResaleEstimate,
  profile: CategoryProfile,
): KPIs {
  const totalCost = costs.total + costs.transport + costs.refurbishment;
  const grossProfit = resale.value - totalCost;
  const roi = totalCost > 0 ? (grossProfit / totalCost) * 100 : 0;
  const netProfitMargin = resale.value > 0 ? (grossProfit / resale.value) * 100 : 0;
  const arbitrageScore = totalCost > 0 ? resale.value / totalCost : 0;

  // Correct Payback: totalCost / (grossProfit / holdingMonths)
  const paybackMonths = grossProfit > 0
    ? Math.ceil(totalCost / (grossProfit / profile.holdingMonths))
    : 999;

  // Correct TIR: annualized compound return over holding period
  // Always calculate if there's profit, regardless of payback vs holding period
  let tir = 0;
  if (grossProfit > 0 && totalCost > 0) {
    // Use actual holding period or payback, whichever is longer
    const effectiveMonths = Math.max(profile.holdingMonths, paybackMonths, 1);
    tir = ((Math.pow(resale.value / totalCost, 12 / effectiveMonths) - 1)) * 100;
    // Cap at 200% — anything higher is meaningless for business decisions
    tir = Math.min(tir, 200);
  }

  return {
    roi: Math.round(roi * 10) / 10,
    netProfitMargin: Math.round(netProfitMargin * 10) / 10,
    paybackMonths: Math.min(paybackMonths, 999),
    tir: Math.round(tir * 10) / 10,
    arbitrageScore: Math.round(arbitrageScore * 100) / 100,
    isGanga: arbitrageScore >= 1.8,
    grossProfit: Math.round(grossProfit),
    totalAcquisitionCost: Math.round(totalCost),
  };
}
