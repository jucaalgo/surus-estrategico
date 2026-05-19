// lib/engine/transport.ts

const DEFAULT_BUYER_LAT = 40.4168; // Madrid
const DEFAULT_BUYER_LNG = -3.7038;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function calculateTransport(
  weightKg: number,
  assetLat?: number,
  assetLng?: number,
  transportBase: number = 400,
): number {
  const lat = assetLat ?? 50.0;
  const lng = assetLng ?? 10.0;
  const distanceKm = haversineKm(lat, lng, DEFAULT_BUYER_LAT, DEFAULT_BUYER_LNG);

  const weightCost = Math.round(weightKg * 0.001); // €0.001 per kg
  const distanceCost = Math.round(distanceKm * 0.5); // €0.50 per km
  const tolls = distanceKm > 1000 ? 200 : 0;

  return Math.round(transportBase + weightCost + distanceCost + tolls);
}
