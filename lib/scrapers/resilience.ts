import * as cheerio from 'cheerio';

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