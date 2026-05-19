import { calculatePricing } from '@/lib/engine/pricing';

describe('calculatePricing', () => {
  it('calculates costs with current bid', () => {
    const costs = calculatePricing({
      currentBid: 10000,
      startingBid: null,
      estimatedResale: 50000,
      buyerPremiumPercent: 16,
      hasReserve: false,
      reservePrice: null,
      currency: 'EUR',
    });
    expect(costs.bid).toBe(10000);
    expect(costs.buyerPremium).toBe(1600);
    expect(costs.taxes).toBe(2436); // 21% of 11600
    expect(costs.fixedFees).toBe(500);
    expect(costs.total).toBe(14536);
  });

  it('falls back to starting bid if no current bid', () => {
    const costs = calculatePricing({
      currentBid: null,
      startingBid: 5000,
      estimatedResale: null,
      buyerPremiumPercent: 16,
      hasReserve: true,
      reservePrice: 4000,
      currency: 'EUR',
    });
    expect(costs.bid).toBe(5000);
  });

  it('estimates bid from resale if no bids at all', () => {
    const costs = calculatePricing({
      currentBid: null,
      startingBid: null,
      estimatedResale: 40000,
      buyerPremiumPercent: 16,
      hasReserve: false,
      reservePrice: null,
      currency: 'EUR',
    });
    expect(costs.bid).toBe(14000); // 40000 * 0.35
  });
});
