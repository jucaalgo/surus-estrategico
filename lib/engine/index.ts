// lib/engine/index.ts
export * from './types';
export * from './categories';
export * from './pricing';
export * from './resale';
export * from './transport';
export * from './refurbishment';
export * from './kpi';
export * from './risk';
export * from './geocode';

import { AnalysisInput, AnalysisResult } from './types';
import { detectCategory } from './categories';
import { calculatePricing } from './pricing';
import { estimateResale } from './resale';
import { calculateTransport } from './transport';
import { calculateRefurbishment } from './refurbishment';
import { calculateKPIs } from './kpi';
import { calculateRisk } from './risk';

export function analyzeAsset(input: AnalysisInput): AnalysisResult {
  const category = detectCategory(input.title, input.category);

  const resale = estimateResale(
    input.title,
    input.specs,
    category.name,
    input.pricing.estimatedResale,
    input.lotQuantity,
  );

  const costs = calculatePricing(input.pricing);
  costs.transport = calculateTransport(
    input.specs.weightKg || category.defaultWeightKg,
    input.location.lat,
    input.location.lng,
    category.transportBase,
  );
  costs.refurbishment = calculateRefurbishment(input.specs, category);
  costs.total = costs.bid + costs.buyerPremium + costs.taxes + costs.transport + costs.refurbishment + costs.fixedFees;

  const kpis = calculateKPIs(costs, resale, category);

  const risk = calculateRisk(
    input.title,
    input.specs,
    category,
    input.pricing.hasReserve,
    input.pricing.reservePrice !== null,
  );

  return {
    costs,
    resale,
    kpis,
    risk,
    categoryDetected: category.name,
  };
}
