import { haversineKm, calculateTransport } from '@/lib/engine/transport';

describe('haversineKm', () => {
  it('calculates Madrid to Berlin ~1870km', () => {
    expect(haversineKm(40.4168, -3.7038, 52.52, 13.405)).toBeGreaterThan(1800);
    expect(haversineKm(40.4168, -3.7038, 52.52, 13.405)).toBeLessThan(1950);
  });

  it('calculates Madrid to Paris ~1050km', () => {
    expect(haversineKm(40.4168, -3.7038, 48.8566, 2.3522)).toBeGreaterThan(1000);
    expect(haversineKm(40.4168, -3.7038, 48.8566, 2.3522)).toBeLessThan(1100);
  });
});

describe('calculateTransport', () => {
  it('includes base + weight + distance', () => {
    const cost = calculateTransport(5000, 52.52, 13.405, 400); // Berlin
    // base 400 + weight 5 + distance ~935 + tolls 200 = ~1540
    expect(cost).toBeGreaterThan(1450);
    expect(cost).toBeLessThan(1600);
  });

  it('adds tolls for >1000km', () => {
    const far = calculateTransport(2000, 52.52, 13.405, 400);
    const near = calculateTransport(2000, 40.4, -3.7, 400);
    expect(far).toBeGreaterThan(near + 150); // far has tolls
  });
});
