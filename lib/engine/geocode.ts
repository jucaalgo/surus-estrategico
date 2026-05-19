// lib/engine/geocode.ts
import { GeocodeResult } from './types';

const COUNTRY_CENTERS: Record<string, { lat: number; lng: number }> = {
  ES: { lat: 40.4168, lng: -3.7038 },
  DE: { lat: 51.1657, lng: 10.4515 },
  NL: { lat: 52.1326, lng: 5.2913 },
  FR: { lat: 46.2276, lng: 2.2137 },
  IT: { lat: 41.8719, lng: 12.5674 },
  UK: { lat: 55.3781, lng: -3.4360 },
  BE: { lat: 50.8503, lng: 4.3517 },
  CZ: { lat: 49.8175, lng: 15.4730 },
  PL: { lat: 51.9194, lng: 19.1451 },
  AT: { lat: 47.5162, lng: 14.5501 },
  CH: { lat: 46.8182, lng: 8.2275 },
};

function normalizeLocation(raw: string, countryCode: string): string {
  let cleaned = raw
    .replace(/on behalf of.*$/i, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\d{4,}/g, '') // remove long numbers (postcodes)
    .trim();

  if (cleaned.length < 2) {
    cleaned = countryCode;
  }

  return `${cleaned},${countryCode}`;
}

function randomOffsetKm(centerLat: number, centerLng: number, maxKm: number = 15): { lat: number; lng: number } {
  // Approx: 1 deg lat ≈ 111km, 1 deg lng ≈ 111km * cos(lat)
  const r = maxKm * Math.sqrt(Math.random());
  const theta = Math.random() * 2 * Math.PI;
  const latOffset = (r * Math.cos(theta)) / 111;
  const lngOffset = (r * Math.sin(theta)) / (111 * Math.cos(centerLat * Math.PI / 180));
  return {
    lat: centerLat + latOffset,
    lng: centerLng + lngOffset,
  };
}

export async function geocodeLocation(
  rawLocation: string,
  countryCode: string,
): Promise<GeocodeResult> {
  const query = normalizeLocation(rawLocation, countryCode);

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SURUS-Auction-Intelligence/2.0 (contact@surus.app)' },
    });

    if (!res.ok) throw new Error(`Nominatim ${res.status}`);

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const place = data[0];
      return {
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon),
        displayName: place.display_name,
        source: 'nominatim',
      };
    }
  } catch {
    // Fall through to fallback
  }

  // Fallback: random dispersal around country center
  const center = COUNTRY_CENTERS[countryCode] || { lat: 50.0, lng: 10.0 };
  const offset = randomOffsetKm(center.lat, center.lng, 15);

  return {
    lat: offset.lat,
    lng: offset.lng,
    displayName: `${countryCode} (fallback)`,
    source: 'fallback',
  };
}

// Rate-limited queue: 1.1s between calls
let lastGeocodeTime = 0;

export async function geocodeWithRateLimit(
  rawLocation: string,
  countryCode: string,
): Promise<GeocodeResult> {
  const now = Date.now();
  const wait = 1100 - (now - lastGeocodeTime);
  if (wait > 0) {
    await new Promise(r => setTimeout(r, wait));
  }
  lastGeocodeTime = Date.now();
  return geocodeLocation(rawLocation, countryCode);
}
