import { calculateRefurbishment } from '@/lib/engine/refurbishment';
import { getCategoryProfile } from '@/lib/engine/categories';

describe('calculateRefurbishment', () => {
  const cnc = getCategoryProfile('CNC / Mecanizado');

  it('excellent CNC = 20% of range', () => {
    const cost = calculateRefurbishment(
      { condition: 'excellent', year: 2020, hours: 1000, weightKg: 3000 },
      cnc,
    );
    expect(cost).toBeGreaterThanOrEqual(3000);
    expect(cost).toBeLessThanOrEqual(4000);
  });

  it('poor CNC = 100% of range with penalties', () => {
    const cost = calculateRefurbishment(
      { condition: 'poor', year: 1995, hours: 15000, weightKg: 3000 },
      cnc,
    );
    expect(cost).toBeGreaterThan(10000); // 8000 * 1.2 * 1.3 = 12480
  });

  it('hours > 10000 adds 20%', () => {
    const lowHours = calculateRefurbishment({ condition: 'good', year: 2015, hours: 5000, weightKg: 3000 }, cnc);
    const highHours = calculateRefurbishment({ condition: 'good', year: 2015, hours: 12000, weightKg: 3000 }, cnc);
    expect(highHours).toBeGreaterThan(lowHours);
  });
});
