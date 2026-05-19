import { calculateKPIs } from '@/lib/engine/kpi';
import { AcquisitionCosts, ResaleEstimate, CategoryProfile } from '@/lib/engine/types';

const mockProfile: CategoryProfile = {
  name: 'CNC',
  keywords: [],
  refurbishmentMin: 2000,
  refurbishmentMax: 8000,
  holdingMonths: 4,
  transportBase: 400,
  defaultWeightKg: 3000,
  liquidityPenalty: 5,
  resaleRangeMin: 25000,
  resaleRangeMax: 150000,
};

function makeCosts(bid: number): AcquisitionCosts {
  return {
    bid,
    buyerPremium: Math.round(bid * 0.16),
    taxes: Math.round((bid + bid * 0.16) * 0.21),
    transport: 600,
    refurbishment: 5000,
    fixedFees: 500,
    total: bid + Math.round(bid * 0.16) + Math.round((bid + bid * 0.16) * 0.21) + 500,
  };
}

describe('calculateKPIs', () => {
  it('calculates ROI correctly', () => {
    const costs = makeCosts(10000);
    const resale: ResaleEstimate = { value: 50000, confidence: 'estimated', method: 'test' };
    const kpis = calculateKPIs(costs, resale, mockProfile);
    const totalCost = costs.total + costs.transport + costs.refurbishment;
    const expectedRoi = ((50000 - totalCost) / totalCost) * 100;
    expect(kpis.roi).toBeCloseTo(expectedRoi, 1);
  });

  it('marks ganga when arbitrageScore >= 1.8', () => {
    const costs = makeCosts(5000);
    const resale: ResaleEstimate = { value: 50000, confidence: 'estimated', method: 'test' };
    const kpis = calculateKPIs(costs, resale, mockProfile);
    expect(kpis.isGanga).toBe(true);
    expect(kpis.arbitrageScore).toBeGreaterThanOrEqual(1.8);
  });

  it('does NOT mark ganga when arbitrageScore < 1.8', () => {
    const costs = makeCosts(30000);
    const resale: ResaleEstimate = { value: 50000, confidence: 'estimated', method: 'test' };
    const kpis = calculateKPIs(costs, resale, mockProfile);
    expect(kpis.isGanga).toBe(false);
  });

  it('payback is finite when profitable', () => {
    const costs = makeCosts(10000);
    const resale: ResaleEstimate = { value: 50000, confidence: 'estimated', method: 'test' };
    const kpis = calculateKPIs(costs, resale, mockProfile);
    expect(kpis.paybackMonths).toBeLessThan(999);
    expect(kpis.paybackMonths).toBeGreaterThan(0);
  });

  it('payback is 999 when unprofitable', () => {
    const costs = makeCosts(60000);
    const resale: ResaleEstimate = { value: 50000, confidence: 'estimated', method: 'test' };
    const kpis = calculateKPIs(costs, resale, mockProfile);
    expect(kpis.paybackMonths).toBe(999);
  });

  it('TIR is 0 when payback exceeds holding months', () => {
    const costs = makeCosts(50000);
    const resale: ResaleEstimate = { value: 50000, confidence: 'estimated', method: 'test' };
    const kpis = calculateKPIs(costs, resale, mockProfile);
    expect(kpis.tir).toBe(0);
  });

  it('TIR is positive when profitable within holding period', () => {
    const costs = makeCosts(10000);
    const resale: ResaleEstimate = { value: 50000, confidence: 'estimated', method: 'test' };
    const kpis = calculateKPIs(costs, resale, mockProfile);
    expect(kpis.tir).toBeGreaterThan(0);
    expect(kpis.tir).toBeLessThan(500); // sanity: not the absurd 400%+
  });

  it('TIR formula is not the broken old one', () => {
    const costs = makeCosts(10000);
    const resale: ResaleEstimate = { value: 50000, confidence: 'estimated', method: 'test' };
    const kpis = calculateKPIs(costs, resale, mockProfile);
    // Old broken formula would give >400% for these numbers
    expect(kpis.tir).toBeLessThanOrEqual(200);
  });
});
