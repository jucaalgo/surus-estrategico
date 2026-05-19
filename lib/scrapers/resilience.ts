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

// Known brand names for make extraction
const KNOWN_BRANDS = [
  'trumpf', 'amada', 'bystronic', 'mazak', 'dmg', 'mori', 'hermle', 'deckel maho',
  'kuka', 'abb', 'fanuc', 'motoman', 'yaskawa', 'kawasaki', 'staubli',
  'engel', 'arburg', 'kraussmaffei', 'battenfeld', 'demag',
  'jungheinrich', 'linde', 'still', 'toyota', 'hyster', 'clark',
  'haas', 'okuma', 'doosan', 'hyundai', 'samsung',
  'siemens', 'bosch', ' Festo', 'parker',
  'heidelberg', 'kba', 'manroland',
  'homag', 'biesse', 'scm', 'weinig',
  'gildemeister', 'emag', 'schuler',
  ' atlas copco', 'kaeser', 'ingersoll rand',
  'gea', 'alfa laval', 'tetra pak',
];

function extractMakeFromText(text: string): string | undefined {
  const lower = text.toLowerCase();
  for (const brand of KNOWN_BRANDS) {
    // Use word boundary matching for single-word brands
    const pattern = brand.includes(' ')
      ? brand.toLowerCase()
      : `\\b${brand.toLowerCase()}\\b`;
    const regex = new RegExp(pattern, 'i');
    if (regex.test(lower)) {
      return brand
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
  }
  return undefined;
}

function extractModelFromText(text: string, make?: string): string | undefined {
  // Common model patterns: "Model: X123", "Type Y-200", "Series Z"
  const patterns = [
    /(?:model|type|typ|serie|series|maschinentype)[:\s]+([A-Z0-9][A-Z0-9\-\/\.]*)/i,
    /(?:model|type|typ|serie|series)[:\s]+([A-Z][a-z]+\s*\d+)/i,
    /\b([A-Z]{1,3}[\-\s]?\d{3,}[A-Z0-9]*)\b/, // e.g. "TMX-1250", "CTX 400"
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const model = match[1].trim();
      // Don't return the make as model
      if (make && model.toLowerCase() === make.toLowerCase()) continue;
      if (model.length >= 3) return model;
    }
  }
  return undefined;
}

function extractFromSpecTables($: cheerio.CheerioAPI): Record<string, string> {
  const data: Record<string, string> = {};

  // Try common spec table structures
  const selectors = [
    'table tr', '.specs tr', '.specifications tr', '.technical-data tr',
    'dl dt, dl dd', '.spec-list li', '.auction-specs tr',
  ];

  for (const sel of selectors) {
    $(sel).each((_, el) => {
      const text = $(el).text().toLowerCase();
      const fullText = $(el).text();

      // Year
      if (text.includes('year') || text.includes('baujahr') || text.includes('año') || text.includes('jahrgang')) {
        const yearMatch = fullText.match(/(19|20)\d{2}/);
        if (yearMatch && !data.year) data.year = yearMatch[0];
      }
      // Hours
      if (text.includes('hours') || text.includes('betriebsstunden') || text.includes('horas') || text.includes('bh') || text.includes('h/h')) {
        const hoursMatch = fullText.match(/(\d[\d.,\s]*)\s*(?:hours|stunden|horas|bh)/i);
        if (hoursMatch && !data.hours) data.hours = hoursMatch[1].replace(/[.,\s]/g, '');
      }
      // Weight
      if (text.includes('weight') || text.includes('gewicht') || text.includes('peso') || text.includes('masse')) {
        const weightMatch = fullText.match(/(\d[\d.,\s]*)\s*(?:kg|kilo|t\b)/i);
        if (weightMatch && !data.weight) data.weight = weightMatch[1].replace(/[.,\s]/g, '');
      }
      // Power
      if (text.includes('power') || text.includes('leistung') || text.includes('potencia') || text.includes('kw')) {
        const powerMatch = fullText.match(/(\d+[\d.,]*)\s*(kw|hp|ps|cv)/i);
        if (powerMatch && !data.power) data.power = `${powerMatch[1]} ${powerMatch[2].toUpperCase()}`;
      }
      // Make / Manufacturer
      if (text.includes('manufacturer') || text.includes('hersteller') || text.includes('fabricante') || text.includes('make') || text.includes('marke') || text.includes('brand')) {
        const makeMatch = fullText.match(/[:\s]+([A-Za-z][A-Za-z0-9\s\-]{1,30})/);
        if (makeMatch && !data.make) data.make = makeMatch[1].trim();
      }
      // Model
      if (text.includes('model') || text.includes('modell') || text.includes('modelo') || text.includes('type') || text.includes('typ')) {
        const modelMatch = fullText.match(/[:\s]+([A-Z0-9][A-Z0-9\-\/\.\s]{1,25})/i);
        if (modelMatch && !data.model) data.model = modelMatch[1].trim();
      }
    });
  }

  return data;
}

export function extractSpecs($: cheerio.CheerioAPI): Partial<{ year?: number; hours?: number; weightKg?: number; power?: string; make?: string; model?: string }> {
  const specs: any = {};
  const bodyText = $('body').text();
  const lowerText = bodyText.toLowerCase();

  // 1. Try structured spec tables first
  const tableData = extractFromSpecTables($);
  if (tableData.year) specs.year = parseInt(tableData.year, 10);
  if (tableData.hours) specs.hours = parseInt(tableData.hours, 10);
  if (tableData.weight) specs.weightKg = parseInt(tableData.weight, 10);
  if (tableData.power) specs.power = tableData.power;
  if (tableData.make) specs.make = tableData.make;
  if (tableData.model) specs.model = tableData.model;

  // 2. Fallback: regex on full body text
  if (!specs.year) {
    const yearMatch = lowerText.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) specs.year = parseInt(yearMatch[0], 10);
  }

  if (!specs.hours) {
    const hoursMatch = lowerText.match(/(\d[\d.,]*)\s*(?:betriebsstunden|operating hours|hours|horas|betriebsstd|bh|h\/h)/i);
    if (hoursMatch) specs.hours = parseInt(hoursMatch[1].replace(/[.,]/g, ''), 10);
  }

  if (!specs.weightKg) {
    const weightMatch = lowerText.match(/(\d[\d.,]*)\s*(?:kg|kilo)\b/i);
    if (weightMatch) specs.weightKg = parseInt(weightMatch[1].replace(/[.,]/g, ''), 10);
  }

  if (!specs.power) {
    const powerMatch = lowerText.match(/(\d+[\d.,]*)\s*(kw|hp|ps|cv)\b/i);
    if (powerMatch) specs.power = `${powerMatch[1]} ${powerMatch[2].toUpperCase()}`;
  }

  // 3. Make extraction from full text (with known brands)
  if (!specs.make) {
    const make = extractMakeFromText(bodyText);
    if (make) specs.make = make;
  }

  // 4. Model extraction (only if we have a make or standalone)
  if (!specs.model) {
    const model = extractModelFromText(bodyText, specs.make);
    if (model) specs.model = model;
  }

  // Validate year is reasonable (1980-2026)
  if (specs.year && (specs.year < 1980 || specs.year > 2026)) {
    delete specs.year;
  }

  // Validate hours is reasonable (< 1,000,000)
  if (specs.hours && (specs.hours < 0 || specs.hours > 1000000)) {
    delete specs.hours;
  }

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