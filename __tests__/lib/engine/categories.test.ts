import { detectCategory, getCategoryProfile } from '@/lib/engine/categories';

describe('detectCategory', () => {
  it('detects robotics from KUKA', () => {
    const p = detectCategory('KUKA KR 210 R2700 robot industrial');
    expect(p.name).toBe('Robótica');
  });

  it('detects CNC from machining center', () => {
    const p = detectCategory('DMG MORI DMC 1035 V CNC machining center');
    expect(p.name).toBe('CNC / Mecanizado');
  });

  it('detects laser from Trumpf', () => {
    const p = detectCategory('Trumpf TruLaser 3030 fiber laser');
    expect(p.name).toBe('Láser');
  });

  it('detects food line', () => {
    const p = detectCategory('Complete food processing line for bakery');
    expect(p.name).toBe('Líneas completas / Plantas');
  });

  it('falls back to Default for unknown', () => {
    const p = detectCategory('Random industrial equipment XYZ-99');
    expect(p.name).toBe('Default');
  });

  it('respects existing category if valid', () => {
    const p = detectCategory('Something vague', 'Láser');
    expect(p.name).toBe('Láser');
  });
});

describe('getCategoryProfile', () => {
  it('returns profile by name', () => {
    const p = getCategoryProfile('CNC / Mecanizado');
    expect(p.holdingMonths).toBe(4);
    expect(p.transportBase).toBe(400);
  });
});
