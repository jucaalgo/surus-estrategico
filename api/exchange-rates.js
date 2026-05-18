// ============================================================
// SURUS — Live Exchange Rates API
// /api/exchange-rates
// Fetches from frankfurter.app (free, no key, updates daily)
// ============================================================

// Fallback rates (May 2026) in case frankfurter is down
const FALLBACK_RATES = {
  EUR: 1, USD: 0.88, GBP: 1.16, CHF: 1.02, SEK: 0.086,
  NOK: 0.083, DKK: 0.134, PLN: 0.23, CZK: 0.040,
  TRY: 0.027, BRL: 0.16, MXN: 0.048, CAD: 0.65,
  AUD: 0.58, JPY: 0.0062, CNY: 0.12
};

let cachedRates = null;
let lastFetch = 0;
const CACHE_TTL = 3600000; // 1 hour

async function fetchLiveRates() {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=EUR', {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error('Frankfurter API error');
    const data = await res.json();
    return { ...data.rates, EUR: 1 };
  } catch (e) {
    console.log('Frankfurter API failed, using fallback rates');
    return FALLBACK_RATES;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Use cache if fresh
  if (cachedRates && (Date.now() - lastFetch) < CACHE_TTL) {
    return res.status(200).json({ rates: cachedRates, cached: true, source: 'cache' });
  }

  const rates = await fetchLiveRates();
  cachedRates = rates;
  lastFetch = Date.now();

  return res.status(200).json({
    rates,
    cached: false,
    source: rates === FALLBACK_RATES ? 'fallback' : 'frankfurter',
    base: 'EUR',
    updated: new Date().toISOString()
  });
}
