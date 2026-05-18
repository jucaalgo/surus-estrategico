import { ExchangeRates } from './types';

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
let cachedRates: ExchangeRates | null = null;
let cachedAt = 0;

const FALLBACK_RATES: Record<string, number> = {
  USD: 1.08, GBP: 0.86, CHF: 0.94, JPY: 162.0, SEK: 11.2,
  NOK: 11.4, DKK: 7.46, PLN: 4.32, CZK: 24.8, HUF: 392.0,
  RON: 4.97, BGN: 1.96, HRK: 7.53, TRY: 35.2, MXN: 20.5,
  BRL: 5.85, CNY: 7.82, INR: 90.5, AUD: 1.65, CAD: 1.47,
  NZD: 1.80, KRW: 1460.0, ZAR: 19.8, SGD: 1.42, HKD: 8.42
};

export async function getExchangeRates(): Promise<ExchangeRates> {
  const now = Date.now();
  if (cachedRates && now - cachedAt < CACHE_DURATION) return cachedRates;

  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=EUR');
    if (!res.ok) throw new Error(`Rates API ${res.status}`);
    const data = await res.json();
    cachedRates = { base: 'EUR', rates: data.rates, updated: new Date().toISOString() };
    cachedAt = now;
    return cachedRates;
  } catch {
    return { base: 'EUR', rates: FALLBACK_RATES, updated: new Date().toISOString() };
  }
}

export function convertToEur(amount: number, currency: string, rates: Record<string, number>): number {
  if (currency === 'EUR') return amount;
  const rate = rates[currency];
  if (!rate) return amount; // unknown currency, assume EUR
  return Math.round(amount / rate);
}