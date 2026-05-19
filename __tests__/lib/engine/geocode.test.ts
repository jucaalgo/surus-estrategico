import { geocodeLocation } from '@/lib/engine/geocode';

describe('geocodeLocation', () => {
  it('returns coordinates for DE', async () => {
    const result = await geocodeLocation('', 'DE');
    expect(result.lat).toBeGreaterThan(40);
    expect(result.lat).toBeLessThan(60);
    expect(result.lng).toBeGreaterThan(-10);
    expect(result.lng).toBeLessThan(20);
    expect(result.source).toBeDefined();
  });

  it('returns coordinates for unknown country', async () => {
    const result = await geocodeLocation('Some City', 'XX');
    expect(result.lat).toBeDefined();
    expect(result.lng).toBeDefined();
    expect(result.displayName).toBeDefined();
  });
});
