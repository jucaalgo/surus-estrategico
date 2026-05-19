// lib/engine/pricing.ts
import { PricingInputs, AcquisitionCosts } from './types';

export function calculatePricing(p: PricingInputs): AcquisitionCosts {
  // Determine effective bid
  let bid = p.currentBid || p.startingBid || 0;

  // If still no bid, estimate from resale (last resort)
  if (bid <= 0 && p.estimatedResale && p.estimatedResale > 0) {
    bid = Math.round(p.estimatedResale * 0.35);
  }

  const buyerPremium = Math.round(bid * (p.buyerPremiumPercent / 100));
  const taxes = p.currency === 'EUR' ? Math.round((bid + buyerPremium) * 0.21) : 0;
  const fixedFees = 500; // legal/admin

  return {
    bid,
    buyerPremium,
    taxes,
    transport: 0, // filled by transport module
    refurbishment: 0, // filled by refurbishment module
    fixedFees,
    total: bid + buyerPremium + taxes + fixedFees,
  };
}
