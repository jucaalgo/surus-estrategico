import * as cheerio from 'cheerio';
import type { RawAuctionImage } from './types';

// ── Rotating browser headers ──

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0',
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export function getNextHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    'User-Agent': getRandomUserAgent(),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,es;q=0.8,de;q=0.7,nl;q=0.6,fr;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Cache-Control': 'max-age=0',
    ...extra,
  };
}

// ── Fetch with retry + exponential backoff ──

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  maxRetries = 3,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const headers = options?.headers
        ? { ...getNextHeaders(), ...(options.headers as Record<string, string>) }
        : getNextHeaders();

      const res = await fetch(url, { ...options, headers });

      if (res.ok) return res;

      // Don't retry 404s
      if (res.status === 404) return res;

      // Retry on 403, 429, 5xx
      if (res.status === 403 || res.status === 429 || res.status >= 500) {
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
          console.warn(`[fetchWithRetry] ${res.status} for ${url}, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})`);
          await sleep(delay);
          continue;
        }
      }

      return res;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`[fetchWithRetry] Network error for ${url}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error(`Max retries (${maxRetries}) exceeded for ${url}`);
}

// ── Load HTML into cheerio ──

export async function fetchPageAs$(url: string, extraHeaders?: Record<string, string>): Promise<cheerio.CheerioAPI> {
  const res = await fetchWithRetry(url, {
    headers: getNextHeaders(extraHeaders),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  return cheerio.load(html);
}

// ── Zero-result detection ──

export interface ZeroResultCheck {
  platform: string;
  itemsFound: number;
  expectedMin: number;
  isWarning: boolean;
  message: string;
}

export function checkZeroResults(platform: string, itemsFound: number, expectedMin = 5): ZeroResultCheck {
  const isWarning = itemsFound === 0 && expectedMin > 0;
  return {
    platform,
    itemsFound,
    expectedMin,
    isWarning,
    message: isWarning
      ? `[WARN] ${platform}: 0 items returned (expected ${expectedMin}+). Possible site structure change.`
      : `[OK] ${platform}: ${itemsFound} items found.`,
  };
}

// ── Keyword-based lot scoring ──

export const KEYWORD_SCORES: Record<string, number> = {
  'planta': 10, 'planta de alimentos': 10, 'envasado': 10, 'envasadora': 10,
  'verpackung': 10, 'abfüllanlage': 10, 'food processing': 10, 'línea completa': 10,
  'kuka': 9, 'abb': 9, 'fanuc': 9, 'robot': 9, 'roboter': 9, 'robotic': 9,
  'brazo robot': 9, 'robot paletizado': 9, 'robot soldadura': 9,
  'laser': 8, 'láser': 8, 'trumpf': 8, 'amada': 8, 'cutting': 8, 'schneid': 8,
  'laser de fibra': 8, 'corte por láser': 8,
  'cnc': 7, 'mecanizado': 7, 'bearbeitung': 7, 'machining': 7,
  'centro mecanizado': 7, 'bearbeitungszentrum': 7, 'centro de mecanizado': 7,
  'torno': 7, 'dreh': 7, 'lathe': 7, 'torno cnc': 7,
  'inyectora': 6, 'injection': 6, 'spritzguss': 6, 'spritzgieß': 6,
  'engel': 6, 'arburg': 6, 'kraussmaffei': 6, 'moldeo': 6,
  'plegadora': 6, 'press brake': 6, 'abkant': 6, 'biegemaschine': 6,
  'prensa': 5, 'presse': 5, 'press': 5, 'prensa hidráulica': 5,
  'milling': 5, 'fräsmaschine': 5, 'fresadora': 5,
  'compresor': 4, 'compressor': 4, 'kompressor': 4, 'druckluft': 4,
  'carretilla': 3, 'forklift': 3, 'stapler': 3, 'gabelstapler': 3,
  'jungheinrich': 3, 'still': 3, 'linde': 3,
  'soldadura': 2, 'welding': 2, 'schweiß': 2, 'schweiss': 2, 'weld': 2,
};

export function scoreLot(title: string): number {
  const lower = title.toLowerCase();
  let score = 0;
  for (const [keyword, value] of Object.entries(KEYWORD_SCORES)) {
    if (lower.includes(keyword.toLowerCase())) score += value;
  }
  return Math.min(score, 30);
}

// ── Detail page fetch with delay ──

export async function fetchDetailPage(url: string): Promise<cheerio.CheerioAPI | null> {
  try {
    await sleep(500);
    const $ = await fetchPageAs$(url);
    return $;
  } catch (err) {
    logScrape('detail', 'warn', `Failed to fetch detail ${url}: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

// ── Detail extraction helpers ──

export function extractDescription($: cheerio.CheerioAPI, fallback: string): string {
  const metaDesc = $('meta[name="description"]').attr('content');
  if (metaDesc && metaDesc.length > 50) return metaDesc.slice(0, 800);

  const paragraphs = $('p, div');
  for (let i = 0; i < paragraphs.length; i++) {
    const text = paragraphs.eq(i).text().trim();
    if (text.length > 100) return text.slice(0, 800);
  }

  return fallback.slice(0, 800);
}

export function extractImages($: cheerio.CheerioAPI, baseUrl: string, title: string, existingImages: RawAuctionImage[]): RawAuctionImage[] {
  const images: RawAuctionImage[] = [];
  $('img').each((i, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src');
    if (!src || src.includes('logo') || src.includes('icon') || src.includes('flag') || src.endsWith('.svg') || src.startsWith('data:')) return;
    const fullUrl = src.startsWith('http') ? src : `${baseUrl}${src}`;
    images.push({
      url: fullUrl,
      alt: $(el).attr('alt') || title,
      isPrimary: i === 0,
      sortOrder: i,
    });
  });
  return images.length > 0 ? images.slice(0, 5) : existingImages;
}

export function extractSpecs($: cheerio.CheerioAPI): Partial<{ year?: number; hours?: number; weightKg?: number; power?: string; make?: string; model?: string }> {
  const specs: any = {};
  const text = $('body').text().toLowerCase();

  // Year
  const yearMatch = text.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) specs.year = parseInt(yearMatch[0], 10);

  // Hours
  const hoursMatch = text.match(/(\d[\d.,]*)\s*(?:betriebsstunden|operating hours|hours|horas|betriebsstd|bh)/i);
  if (hoursMatch) specs.hours = parseInt(hoursMatch[1].replace(/[.,]/g, ''), 10);

  // Weight
  const weightMatch = text.match(/(\d[\d.,]*)\s*(?:kg|kilo)/i);
  if (weightMatch) specs.weightKg = parseInt(weightMatch[1].replace(/[.,]/g, ''), 10);

  // Power
  const powerMatch = text.match(/(\d+)\s*(kw|hp|ps|cv)/i);
  if (powerMatch) specs.power = `${powerMatch[1]} ${powerMatch[2].toUpperCase()}`;

  return specs;
}

// ── Scrape logger ──

export type LogEntry = {
  timestamp: string;
  platform: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
};

const scrapeLogs: LogEntry[] = [];

export function logScrape(platform: string, level: LogEntry['level'], message: string): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    platform,
    level,
    message,
  };
  scrapeLogs.push(entry);
  if (scrapeLogs.length > 200) scrapeLogs.splice(0, scrapeLogs.length - 200);

  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${platform}] ${message}`);
}

export function getScrapeLogs(platform?: string): LogEntry[] {
  if (platform) return scrapeLogs.filter(l => l.platform === platform);
  return [...scrapeLogs];
}