import { estimateResale } from '@/lib/engine/resale';

describe('estimateResale', () => {
  it('estimates CNC machining center', () => {
    const r = estimateResale('DMG MORI DMC 1035 V', { year: 2018, hours: 3000, condition: 'good', weightKg: 3500 });
    expect(r.value).toBeGreaterThan(40000);
    expect(r.confidence).toBe('estimated');
  });

  it('applies premium brand bonus', () => {
    const withBrand = estimateResale('Trumpf TruLaser 3030', { condition: 'good', weightKg: 4000 });
    const withoutBrand = estimateResale('Generic laser cutter', { condition: 'good', weightKg: 4000 });
    expect(withBrand.value).toBeGreaterThan(withoutBrand.value);
  });

  it('applies year bonus for new equipment', () => {
    const newEq = estimateResale('CNC lathe', { year: 2023, condition: 'good', weightKg: 3000 });
    const oldEq = estimateResale('CNC lathe', { year: 2005, condition: 'good', weightKg: 3000 });
    expect(newEq.value).toBeGreaterThan(oldEq.value);
  });

  it('applies hours penalty', () => {
    const lowHours = estimateResale('CNC lathe', { hours: 2000, condition: 'good', weightKg: 3000 });
    const highHours = estimateResale('CNC lathe', { hours: 12000, condition: 'good', weightKg: 3000 });
    expect(highHours.value).toBeLessThan(lowHours.value);
  });

  it('applies lot discount', () => {
    const single = estimateResale('CNC lathe', { condition: 'good', weightKg: 3000 }, undefined, null, 1);
    const multi = estimateResale('CNC lathe', { condition: 'good', weightKg: 3000 }, undefined, null, 5);
    expect(multi.value).toBeLessThan(single.value);
  });

  it('uses real price when available and higher', () => {
    const r = estimateResale('CNC lathe', { condition: 'good', weightKg: 3000 }, undefined, 100000);
    expect(r.value).toBe(150000); // 100000 * 1.5
    expect(r.confidence).toBe('real');
  });
});
