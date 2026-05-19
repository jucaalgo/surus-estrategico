import { calculateRisk } from '@/lib/engine/risk';
import { CategoryProfile } from '@/lib/engine/types';

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

describe('calculateRisk', () => {
  it('low risk for new, low-hours, excellent, no reserve, premium brand', () => {
    const r = calculateRisk(
      'Trumpf CNC machining center',
      { year: 2022, hours: 2000, condition: 'excellent', weightKg: 3000 },
      mockProfile,
      false,
      true,
    );
    expect(r.score).toBeLessThanOrEqual(30);
    expect(r.level).toBe('low');
  });

  it('high risk for old, high-hours, poor, with reserve', () => {
    const r = calculateRisk(
      'Old press brake',
      { year: 1985, hours: 25000, condition: 'poor', weightKg: 8000 },
      mockProfile,
      true,
      true,
    );
    expect(r.score).toBeGreaterThan(55);
  });

  it('premium brand reduces score by 5', () => {
    const withBrand = calculateRisk(
      'Trumpf laser',
      { condition: 'good', weightKg: 4000 },
      mockProfile,
      false,
      true,
    );
    const withoutBrand = calculateRisk(
      'Generic laser',
      { condition: 'good', weightKg: 4000 },
      mockProfile,
      false,
      true,
    );
    expect(withBrand.score).toBe(withoutBrand.score - 5);
  });

  it('unknown reserve adds 3 points', () => {
    const known = calculateRisk('CNC', { condition: 'good', weightKg: 3000 }, mockProfile, false, true);
    const unknown = calculateRisk('CNC', { condition: 'good', weightKg: 3000 }, mockProfile, false, false);
    expect(unknown.score).toBe(known.score + 3);
  });

  it('0 hours = 0 risk points (unknown is low risk)', () => {
    const r = calculateRisk('CNC', { condition: 'good', weightKg: 3000 }, mockProfile, false, true);
    expect(r.factors.hours).toBe(0);
  });
});
