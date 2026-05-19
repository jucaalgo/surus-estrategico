import { analyzeAsset } from '@/lib/engine';
import { AnalysisInput } from '@/lib/engine/types';

const mockInput: AnalysisInput = {
  title: 'Trumpf TruLaser 3030 fiber laser cutting machine',
  category: 'Láser',
  specs: { year: 2018, hours: 4500, condition: 'good', weightKg: 4500, make: 'Trumpf' },
  location: { city: 'Stuttgart', countryCode: 'DE', lat: 48.7758, lng: 9.1829 },
  pricing: { currentBid: 35000, startingBid: null, estimatedResale: null, buyerPremiumPercent: 16, hasReserve: false, reservePrice: null, currency: 'EUR' },
};

describe('analyzeAsset', () => {
  it('detects laser category', () => {
    const result = analyzeAsset(mockInput);
    expect(result.categoryDetected).toBe('Láser');
  });

  it('produces positive ROI for a good laser deal', () => {
    const result = analyzeAsset(mockInput);
    expect(result.kpis.roi).toBeGreaterThan(0);
    expect(result.resale.value).toBeGreaterThan(40000);
  });

  it('produces realistic TIR (capped at 200%)', () => {
    const result = analyzeAsset(mockInput);
    expect(result.kpis.tir).toBeGreaterThanOrEqual(0);
    expect(result.kpis.tir).toBeLessThanOrEqual(200);
  });

  it('produces finite payback when profitable', () => {
    const result = analyzeAsset(mockInput);
    expect(result.kpis.paybackMonths).toBeLessThan(999);
  });

  it('calculates transport with real distance', () => {
    const result = analyzeAsset(mockInput);
    expect(result.costs.transport).toBeGreaterThan(400); // Stuttgart to Madrid is ~1500km
  });

  it('calculates risk with brand discount', () => {
    const result = analyzeAsset(mockInput);
    expect(result.risk.factors.brand).toBe(-5);
    expect(result.risk.score).toBeLessThan(50);
  });
});
