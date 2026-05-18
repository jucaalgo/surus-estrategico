# SURUS Scraper Resilience v2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite 3 broken scrapers with resilience (cheerio, retry, rotating headers), add 2 new platforms (BidSpotter, Euro Auctions), and upgrade ScraperPanel UI with parallel execution, real-time logs, health indicators, and history.

**Architecture:** Each scraper uses cheerio for HTML parsing with CSS selectors (primary + fallback). A shared resilience module provides `fetchWithRetry`, rotating browser headers, and zero-result detection. Scrapers run in parallel via `Promise.allSettled`. UI shows real-time progress per platform.

**Tech Stack:** Next.js 15, cheerio (new), Supabase, TypeScript, Tailwind CSS 4

---

## File Structure

```
lib/scrapers/
  types.ts                    ← EXISTING (no changes)
  resilience.ts               ← NEW: fetchWithRetry, rotating headers, zero-result detection
  selectors.ts                ← NEW: CSS selector definitions per platform
  tbauctions.ts               ← REWRITE: GraphQL with browser headers + HTML fallback
  netbid.ts                   ← REWRITE: cheerio, correct URL /en/auctions
  industrial.ts               ← REWRITE: cheerio, correct URL / (homepage)
  bidspotter.ts               ← NEW: BidSpotter scraper
  euro-auctions.ts            ← NEW: Euro Auctions scraper
  resale-estimates.ts         ← EXISTING (no changes)

app/api/scrape/
  all/route.ts                ← NEW: parallel execution endpoint
  tbauctions/route.ts         ← UPDATE: use resilience module
  netbid/route.ts             ← UPDATE: use resilience module
  industrial/route.ts         ← UPDATE: use resilience module
  bidspotter/route.ts         ← NEW
  euro-auctions/route.ts      ← NEW
  status/route.ts             ← UPDATE: include history + health

components/dashboard/
  ScraperPanel.tsx            ← REWRITE: new UI with progress, logs, health, history
```

---

## Task 1: Install cheerio

**Files:** `package.json`

- [ ] **Step 1: Install cheerio dependency**

```bash
cd surus-estrategico && npm install cheerio
```

- [ ] **Step 2: Verify installation**

```bash
cd surus-estrategico && npm ls cheerio
```

Expected: `cheerio@x.x.x`

- [ ] **Step 3: Commit**

```bash
cd surus-estrategico && git add package.json package-lock.json && git commit -m "feat: add cheerio for resilient HTML scraping"
```

---

## Task 2: Create resilience module

**Files:** Create `lib/scrapers/resilience.ts`

- [ ] **Step 1: Create resilience.ts with fetchWithRetry, rotating headers, and zero-result detection**

```typescript
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

      // Don't retry 404s — the page simply doesn't exist
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
  // Keep last 200 entries
  if (scrapeLogs.length > 200) scrapeLogs.splice(0, scrapeLogs.length - 200);

  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${platform}] ${message}`);
}

export function getScrapeLogs(platform?: string): LogEntry[] {
  if (platform) return scrapeLogs.filter(l => l.platform === platform);
  return [...scrapeLogs];
}
```

- [ ] **Step 2: Commit**

```bash
cd surus-estrategico && git add lib/scrapers/resilience.ts && git commit -m "feat: add resilience module with retry, rotating headers, cheerio loader, zero-result detection"
```

---

## Task 3: Create selectors module

**Files:** Create `lib/scrapers/selectors.ts`

- [ ] **Step 1: Create selectors.ts with primary + fallback CSS selectors per platform**

```typescript
export interface PlatformSelectors {
  listing: string;
  title: string;
  link: string;
  image: string;
  price: string;
  endDate: string;
  location: string;
  lotId?: string;
}

export const SELECTORS: Record<string, { primary: PlatformSelectors; fallback: PlatformSelectors }> = {
  netbid: {
    primary: {
      listing: 'ul[data-testid="auction-list"] > li, ul.space-y-4 > li',
      title: 'h3, h2, [class*="title"]',
      link: 'a[href^="/en/auctions/"]',
      image: 'img[src]',
      price: '[class*="price"], [class*="bid"]',
      endDate: 'time, [class*="date"], [class*="end"]',
      location: 'p, [class*="location"]',
    },
    fallback: {
      listing: 'li:has(a[href*="/auctions/"])',
      title: 'h3, h2, a[href*="/auctions/"]',
      link: 'a[href*="/auctions/"]',
      image: 'img',
      price: 'span, div',
      endDate: 'time, span',
      location: 'p, span',
    },
  },
  industrial: {
    primary: {
      listing: '[class*="auction"], [class*="lot"], div:has(> a[href^="/auctions/"])',
      title: 'h3, h2, a[href^="/auctions/"]',
      link: 'a[href^="/auctions/"]',
      image: 'img[src]',
      price: '[class*="price"], [class*="bid"]',
      endDate: 'time, [class*="date"], [class*="end"]',
      location: '[class*="location"], p',
    },
    fallback: {
      listing: 'a[href*="/auctions/"]',
      title: 'a[href*="/auctions/"]',
      link: 'a[href*="/auctions/"]',
      image: 'img',
      price: 'span, div',
      endDate: 'time, span',
      location: 'span, p',
    },
  },
  bidspotter: {
    primary: {
      listing: '[class*="auction-card"], [class*="lot-item"], [class*="search-result"]',
      title: '[class*="title"], h3, h2',
      link: 'a[href*="/catalog/"]',
      image: 'img[src]',
      price: '[class*="price"], [class*="bid"], [class*="current"]',
      endDate: 'time, [class*="date"], [class*="end"], [class*="closing"]',
      location: '[class*="location"], [class*="address"]',
    },
    fallback: {
      listing: 'li:has(a[href*="/catalog/"]), div:has(a[href*="/catalog/"])',
      title: 'a[href*="/catalog/"], h3',
      link: 'a[href*="/catalog/"]',
      image: 'img',
      price: 'span, div',
      endDate: 'time, span',
      location: 'span, p',
    },
  },
  euroAuctions: {
    primary: {
      listing: '[class*="auction"], [class*="lot"], div:has(> a[href*="/auction/"])',
      title: 'h3, h2, a[href*="/auction/"]',
      link: 'a[href*="/auction/"]',
      image: 'img[src]',
      price: '[class*="price"], [class*="bid"]',
      endDate: 'time, [class*="date"], [class*="end"]',
      location: '[class*="location"], p',
    },
    fallback: {
      listing: 'a[href*="/auction/"]',
      title: 'a[href*="/auction/"]',
      link: 'a[href*="/auction/"]',
      image: 'img',
      price: 'span, div',
      endDate: 'time, span',
      location: 'span, p',
    },
  },
};
```

- [ ] **Step 2: Commit**

```bash
cd surus-estrategico && git add lib/scrapers/selectors.ts && git commit -m "feat: add CSS selector definitions per platform (primary + fallback)"
```

---

## Task 4: Rewrite TBAuctions scraper

**Files:** Rewrite `lib/scrapers/tbauctions.ts`

- [ ] **Step 1: Rewrite tbauctions.ts with browser headers + HTML fallback**

The TBAuctions scraper will:
1. Try GraphQL API with browser-like headers (Origin, Referer)
2. If GraphQL fails (403/429/5xx), fall back to HTML scraping of Surplex and Troostwijk listing pages
3. Use cheerio for HTML fallback

```typescript
import type { RawAuctionItem, RawAuctionImage } from './types';
import { fetchWithRetry, getNextHeaders, logScrape, checkZeroResults } from './resilience';
import * as cheerio from 'cheerio';

const GRAPHQL_ENDPOINT = 'https://storefront.tbauctions.com/storefront/graphql';

const AUCTIONS_QUERY = `
query AllAuctions($request: AllAuctionsInput!, $platform: Platform!) {
  allAuctionsV2(request: $request, platform: $platform) {
    totalSize
    hasNext
    pageNumber
    results {
      id
      name
      urlSlug
      platform
      lotCount
      biddingStatus
      minEndDate
      maxEndDate
      images { url alt order }
    }
  }
}`;

const AUCTION_LOTS_QUERY = `
query AuctionLots($request: AuctionWithLotsInputV3!, $platform: Platform!) {
  auctionWithLotsV5(request: $request, platform: $platform) {
    auction { id name urlSlug platform lotCount minEndDate maxEndDate }
    lots {
      hasNext
      totalSize
      results {
        id
        title
        urlSlug
        platform
        currentBidAmount { cents currency }
        bidsCount
        biddingStatus
        image { url alt }
        location { city countryCode }
      }
    }
  }
}`;

function buildLotUrl(platform: string, urlSlug: string): string {
  const domains: Record<string, string> = {
    SPX: 'https://www.surplex.com/es/l/',
    TWK: 'https://www.troostwijkauctions.com/es/l/',
    BVA: 'https://www.bva-auctions.com/es/l/',
    VAVATO: 'https://www.vavato.com/es/l/',
    AUK: 'https://www.auctionuk.com/es/l/',
    EPIC: 'https://www.epic-auctions.com/es/l/',
  };
  return `${domains[platform] || 'https://www.surplex.com/es/l/'}${urlSlug}`;
}

function buildAuctionUrl(platform: string, urlSlug: string): string {
  const domains: Record<string, string> = {
    SPX: 'https://www.surplex.com/es/a/',
    TWK: 'https://www.troostwijkauctions.com/es/a/',
    BVA: 'https://www.bva-auctions.com/es/a/',
    VAVATO: 'https://www.vavato.com/es/a/',
    AUK: 'https://www.auctionuk.com/es/a/',
    EPIC: 'https://www.epic-auctions.com/es/a/',
  };
  return `${domains[platform] || 'https://www.surplex.com/es/a/'}${urlSlug}`;
}

function mapPlatformId(platformCode: string): string {
  const map: Record<string, string> = {
    SPX: 'surplex', TWK: 'troostwijk', BVA: 'bva', VAVATO: 'vavato', AUK: 'auctionuk', EPIC: 'epic',
  };
  return map[platformCode] || platformCode.toLowerCase();
}

const COUNTRY_NAMES: Record<string, string> = {
  es: 'España', de: 'Alemania', nl: 'Países Bajos', fr: 'Francia',
  it: 'Italia', uk: 'Reino Unido', us: 'EE.UU.', cz: 'Chequia',
  pl: 'Polonia', be: 'Bélgica', ch: 'Suiza', at: 'Austria',
  se: 'Suecia', fi: 'Finlandia', dk: 'Dinamarca', pt: 'Portugal',
  ro: 'Rumanía', hu: 'Hungría', tr: 'Turquía',
};

function lotToItem(lot: any, auction: any, platform: string): RawAuctionItem {
  const currentBidCents = lot.currentBidAmount?.cents || 0;
  const currency = lot.currentBidAmount?.currency || 'EUR';
  const endDate = lot.endDate || auction.maxEndDate || auction.minEndDate;
  const endDateStr = endDate ? new Date(endDate * 1000).toISOString() : new Date(Date.now() + 7 * 86400000).toISOString();

  const images: RawAuctionImage[] = [];
  if (lot.image?.url) {
    images.push({ url: lot.image.url, alt: lot.image.alt || lot.title, isPrimary: true, sortOrder: 0 });
  } else if (auction.images?.[0]?.url) {
    images.push({ url: auction.images[0].url, alt: lot.title || auction.name, isPrimary: true, sortOrder: 0 });
  }

  return {
    platformId: mapPlatformId(platform),
    lotId: lot.id,
    title: lot.title || auction.name,
    description: lot.title || auction.name,
    category: 'Industrial',
    sourceUrl: lot.urlSlug ? buildLotUrl(platform, lot.urlSlug) : buildAuctionUrl(platform, auction.urlSlug),
    currentBid: currentBidCents > 0 ? currentBidCents / 100 : null,
    currency,
    estimatedResale: currentBidCents > 0 ? (currentBidCents / 100) * 2 : undefined,
    buyerPremiumPercent: 16,
    reservePrice: null,
    hasReserve: false,
    startingBid: null,
    city: lot.location?.city || auction.location?.city || '',
    region: undefined,
    country: COUNTRY_NAMES[lot.location?.countryCode?.toUpperCase()] || COUNTRY_NAMES[auction.location?.countryCode?.toUpperCase()] || '',
    countryCode: lot.location?.countryCode?.toUpperCase() || auction.location?.countryCode?.toUpperCase() || 'DE',
    lat: 48.0, lng: 4.0,
    siteType: undefined,
    auctionEnd: endDateStr,
    inspectionAvailable: true,
    condition: 'good',
    images,
  };
}

function auctionToItem(auction: any, platform: string): RawAuctionItem {
  const endDate = auction.maxEndDate || auction.minEndDate;
  const endDateStr = endDate ? new Date(endDate * 1000).toISOString() : new Date(Date.now() + 7 * 86400000).toISOString();

  const images: RawAuctionImage[] = (auction.images || []).slice(0, 3).map((img: any, i: number) => ({
    url: img.url,
    alt: img.alt || auction.name,
    isPrimary: i === 0,
    sortOrder: i,
  }));

  return {
    platformId: mapPlatformId(platform),
    lotId: auction.id,
    title: auction.name,
    description: auction.name,
    category: 'Industrial',
    sourceUrl: buildAuctionUrl(platform, auction.urlSlug),
    currentBid: null,
    currency: 'EUR',
    buyerPremiumPercent: 16,
    hasReserve: false,
    city: '',
    country: '',
    countryCode: 'DE',
    lat: 48.0, lng: 4.0,
    auctionEnd: endDateStr,
    inspectionAvailable: true,
    condition: 'good',
    images,
  };
}

async function tryGraphQL(platform: string): Promise<RawAuctionItem[]> {
  logScrape('tbauctions', 'info', `Trying GraphQL for ${platform}...`);

  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getNextHeaders(),
      'Origin': platform === 'SPX' ? 'https://www.surplex.com' : 'https://www.troostwijkauctions.com',
      'Referer': platform === 'SPX' ? 'https://www.surplex.com/' : 'https://www.troostwijkauctions.com/',
    },
    body: JSON.stringify({
      query: AUCTIONS_QUERY,
      variables: {
        request: {
          pageNumber: 1,
          pageSize: 100,
          locale: 'es',
          biddingStatuses: ['BIDDING_OPEN'],
          hideZeroLotAuctions: true,
          facets: [],
          rangeFacets: [],
          sortBy: 'END_DATE_ASC',
        },
        platform,
      },
    }),
  });

  if (!res.ok) {
    logScrape('tbauctions', 'warn', `GraphQL returned ${res.status} for ${platform}`);
    return [];
  }

  const data = await res.json();
  const auctionsResult = data?.data?.allAuctionsV2;
  const auctions = auctionsResult?.results || [];

  if (auctions.length === 0) {
    logScrape('tbauctions', 'warn', `No auctions in GraphQL for ${platform}`);
    return [];
  }

  logScrape('tbauctions', 'success', `GraphQL found ${auctionsResult.totalSize} auctions for ${platform}`);

  const allItems: RawAuctionItem[] = [];
  for (const auction of auctions.slice(0, 25)) {
    try {
      const displayId = auction.urlSlug?.split('-').slice(-1)[0] || auction.id;
      const lotsRes = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getNextHeaders(),
          'Origin': platform === 'SPX' ? 'https://www.surplex.com' : 'https://www.troostwijkauctions.com',
          'Referer': platform === 'SPX' ? 'https://www.surplex.com/' : 'https://www.troostwijkauctions.com/',
        },
        body: JSON.stringify({
          query: AUCTION_LOTS_QUERY,
          variables: {
            request: { displayId, locale: 'es', pageNumber: 1, pageSize: 20, rangeFacetInputs: [], sortBy: 'END_DATE_ASC', valueFacetInputs: [] },
            platform,
          },
        }),
      });

      if (!lotsRes.ok) continue;

      const lotsData = await lotsRes.json();
      const lotsResult = lotsData?.data?.auctionWithLotsV5;
      const lots = lotsResult?.lots?.results || [];
      const auctionInfo = lotsResult?.auction || auction;

      if (lots.length === 0) {
        allItems.push(auctionToItem(auctionInfo, platform));
      } else {
        for (const lot of lots) {
          allItems.push(lotToItem(lot, auctionInfo, platform));
        }
      }
    } catch {
      allItems.push(auctionToItem(auction, platform));
    }
  }

  return allItems;
}

async function tryHTMLFallback(platform: string): Promise<RawAuctionItem[]> {
  logScrape('tbauctions', 'info', `Trying HTML fallback for ${platform}...`);

  const urls: Record<string, string> = {
    SPX: 'https://www.surplex.com/es/a/',
    TWK: 'https://www.troostwijkauctions.com/es/a/',
  };

  const url = urls[platform];
  if (!url) return [];

  try {
    const $ = await fetchPageAs$(url);
    const items: RawAuctionItem[] = [];

    $('a[href*="/l/"], a[href*="/a/"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const title = $(el).find('h2, h3, h4').first().text().trim() || $(el).text().trim().slice(0, 100);
      if (!title || title.length < 5) return;

      const imgEl = $(el).find('img').first();
      const imgUrl = imgEl.attr('src') || imgEl.attr('data-src') || '';
      const fullUrl = href.startsWith('http') ? href : `https://www.surplex.com${href}`;

      items.push({
        platformId: mapPlatformId(platform),
        lotId: `tba-${platform}-${items.length}`,
        title: title.slice(0, 200),
        description: title,
        category: 'Industrial',
        sourceUrl: fullUrl,
        currentBid: null,
        currency: 'EUR',
        buyerPremiumPercent: 16,
        hasReserve: false,
        city: '',
        country: COUNTRY_NAMES[platform === 'SPX' ? 'de' : 'nl'] || '',
        countryCode: platform === 'SPX' ? 'DE' : 'NL',
        lat: platform === 'SPX' ? 51.1 : 52.3,
        lng: platform === 'SPX' ? 10.4 : 4.9,
        auctionEnd: new Date(Date.now() + 14 * 86400000).toISOString(),
        inspectionAvailable: true,
        condition: 'good',
        images: imgUrl ? [{ url: imgUrl, alt: title, isPrimary: true, sortOrder: 0 }] : [],
      });
    });

    logScrape('tbauctions', 'success', `HTML fallback found ${items.length} items for ${platform}`);
    return items;
  } catch (err) {
    logScrape('tbauctions', 'error', `HTML fallback failed for ${platform}: ${err instanceof Error ? err.message : String(err)}`);
    return [];
  }
}

export interface TBAuctionsOptions {
  platforms?: string[];
  maxPages?: number;
}

export async function scrapeTBAuctions(options: TBAuctionsOptions = {}): Promise<RawAuctionItem[]> {
  const platforms = options.platforms || ['SPX', 'TWK'];
  const allItems: RawAuctionItem[] = [];

  for (const platform of platforms) {
    logScrape('tbauctions', 'info', `Scraping platform ${platform}...`);
    try {
      // Try GraphQL first
      let items = await tryGraphQL(platform);

      // Fallback to HTML if GraphQL returned nothing
      if (items.length === 0) {
        items = await tryHTMLFallback(platform);
      }

      const check = checkZeroResults(`tbauctions-${platform}`, items.length, 3);
      if (check.isWarning) logScrape('tbauctions', 'warn', check.message);

      allItems.push(...items);
      logScrape('tbauctions', 'success', `Collected ${items.length} items for ${platform}`);
    } catch (err) {
      logScrape('tbauctions', 'error', `Error scraping ${platform}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return allItems;
}
```

- [ ] **Step 2: Commit**

```bash
cd surus-estrategico && git add lib/scrapers/tbauctions.ts && git commit -m "feat: rewrite TBAuctions scraper with GraphQL+browser headers and HTML fallback"
```

---

## Task 5: Rewrite NetBid scraper

**Files:** Rewrite `lib/scrapers/netbid.ts`

- [ ] **Step 1: Rewrite netbid.ts with cheerio and correct URLs**

The NetBid scraper will:
1. Fetch `/en/auctions` (the correct URL)
2. Parse listing cards with cheerio + CSS selectors
3. Follow each auction link to get lots with individual prices
4. Extract images, prices, dates, locations

```typescript
import type { RawAuctionItem, RawAuctionImage } from './types';
import { fetchPageAs$, getNextHeaders, logScrape, checkZeroResults } from './resilience';
import { SELECTORS } from './selectors';

const BASE_URL = 'https://www.netbid.com';

const COUNTRY_MAP: Record<string, { country: string; countryCode: string; lat: number; lng: number }> = {
  'de': { country: 'Alemania', countryCode: 'DE', lat: 51.1657, lng: 10.4515 },
  'nl': { country: 'Países Bajos', countryCode: 'NL', lat: 52.1326, lng: 5.2913 },
  'at': { country: 'Austria', countryCode: 'AT', lat: 47.5162, lng: 14.5501 },
  'pl': { country: 'Polonia', countryCode: 'PL', lat: 51.9194, lng: 19.1451 },
  'fr': { country: 'Francia', countryCode: 'FR', lat: 46.2276, lng: 2.2137 },
  'cz': { country: 'Chequia', countryCode: 'CZ', lat: 49.8175, lng: 15.4730 },
  'sk': { country: 'Eslovaquia', countryCode: 'SK', lat: 48.6690, lng: 19.6990 },
  'uk': { country: 'Reino Unido', countryCode: 'UK', lat: 55.3781, lng: -3.4360 },
  'it': { country: 'Italia', countryCode: 'IT', lat: 41.8719, lng: 12.5674 },
  'es': { country: 'España', countryCode: 'ES', lat: 40.4637, lng: -3.7492 },
  'be': { country: 'Bélgica', countryCode: 'BE', lat: 50.5039, lng: 4.4699 },
  'ch': { country: 'Suiza', countryCode: 'CH', lat: 46.8182, lng: 8.2275 },
  'se': { country: 'Suecia', countryCode: 'SE', lat: 60.1282, lng: 18.6435 },
};

function parseNetBidAuctions($: cheerio.CheerioAPI, html: string): RawAuctionItem[] {
  const items: RawAuctionItem[] = [];
  const sels = SELECTORS.netbid;

  // Try primary selectors, then fallback
  let cards = $(sels.primary.listing);
  if (cards.length === 0) {
    cards = $(sels.fallback.listing);
  }

  cards.each((_, el) => {
    const card = $(el);

    // Extract link
    let linkEl = card.find(sels.primary.link).first();
    if (linkEl.length === 0) linkEl = card.find(sels.fallback.link).first();
    const href = linkEl.attr('href') || '';
    if (!href || !href.includes('/auctions/')) return;

    // Extract title
    let titleEl = card.find(sels.primary.title).first();
    if (titleEl.length === 0) titleEl = card.find(sels.fallback.title).first();
    const title = titleEl.text().trim();
    if (!title || title.length < 5) return;

    // Extract image
    let imgEl = card.find(sels.primary.image).first();
    if (imgEl.length === 0) imgEl = card.find(sels.fallback.image).first();
    const imgUrl = imgEl.attr('src') || imgEl.attr('data-src') || '';
    const imgAlt = imgEl.attr('alt') || title;

    // Extract price (look for currency patterns)
    let price: number | null = null;
    const priceText = card.text();
    const priceMatch = priceText.match(/([\d.,]+)\s*(€|EUR|EUR)/i);
    if (priceMatch) {
      price = parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.'));
    }

    // Extract end date
    let endDateEl = card.find(sels.primary.endDate).first();
    if (endDateEl.length === 0) endDateEl = card.find(sels.fallback.endDate).first();
    let endDateStr = endDateEl.attr('datetime') || endDateEl.text().trim();
    const endDate = endDateStr ? new Date(endDateStr) : new Date(Date.now() + 14 * 86400000);
    if (isNaN(endDate.getTime())) endDate.setTime(Date.now() + 14 * 86400000);

    // Extract location
    let locationEl = card.find(sels.primary.location).first();
    if (locationEl.length === 0) locationEl = card.find(sels.fallback.location).first();
    const locationText = locationEl.text().trim();

    // Build source URL
    const sourceUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;

    // Extract lot ID from URL
    const lotIdMatch = href.match(/\/auctions\/(\d+)/);
    const lotId = lotIdMatch ? `NET-${lotIdMatch[1]}` : `NET-${Date.now()}-${items.length}`;

    // Determine country from location text
    let countryData = COUNTRY_MAP['de'];
    for (const [code, data] of Object.entries(COUNTRY_MAP)) {
      if (locationText.toLowerCase().includes(code.toUpperCase()) || locationText.toLowerCase().includes(data.country.toLowerCase())) {
        countryData = data;
        break;
      }
    }

    const images: RawAuctionImage[] = [];
    if (imgUrl) {
      images.push({ url: imgUrl.startsWith('http') ? imgUrl : `${BASE_URL}${imgUrl}`, alt: imgAlt, isPrimary: true, sortOrder: 0 });
    }

    items.push({
      platformId: 'netbid',
      lotId,
      title: title.slice(0, 200),
      description: title,
      category: 'Industrial',
      sourceUrl,
      currentBid: price,
      currency: 'EUR',
      estimatedResale: price ? price * 2 : undefined,
      buyerPremiumPercent: 14,
      hasReserve: false,
      startingBid: price ? price * 0.5 : null,
      city: locationText.split(',')[0]?.trim() || '',
      country: countryData.country,
      countryCode: countryData.countryCode,
      lat: countryData.lat,
      lng: countryData.lng,
      auctionEnd: endDate.toISOString(),
      inspectionAvailable: false,
      condition: 'good',
      images,
    });
  });

  return items;
}

export interface NetBidScrapeOptions {
  maxPages?: number;
}

export async function scrapeNetBid(options: NetBidScrapeOptions = {}): Promise<RawAuctionItem[]> {
  const { maxPages = 3 } = options;
  const items: RawAuctionItem[] = [];

  try {
    // NetBid homepage shows auction listings
    logScrape('netbid', 'info', 'Fetching NetBid auction listings...');
    const $ = await fetchPageAs$(`${BASE_URL}/en/auctions`);
    const pageItems = parseNetBidAuctions($, '');

    items.push(...pageItems);
    logScrape('netbid', 'success', `Found ${pageItems.length} auctions on page 1`);

    // Try additional pages if available
    for (let page = 2; page <= maxPages && pageItems.length > 0; page++) {
      try {
        const $next = await fetchPageAs$(`${BASE_URL}/en/auctions?page=${page}`);
        const nextPageItems = parseNetBidAuctions($next, '');
        if (nextPageItems.length === 0) break;
        items.push(...nextPageItems);
        logScrape('netbid', 'info', `Found ${nextPageItems.length} auctions on page ${page}`);
      } catch {
        break;
      }
    }

    const check = checkZeroResults('netbid', items.length, 3);
    if (check.isWarning) logScrape('netbid', 'warn', check.message);
  } catch (error) {
    logScrape('netbid', 'error', `Scrape error: ${error instanceof Error ? error.message : String(error)}`);
  }

  return items;
}
```

- [ ] **Step 2: Commit**

```bash
cd surus-estrategico && git add lib/scrapers/netbid.ts && git commit -m "feat: rewrite NetBid scraper with cheerio, correct URL, CSS selectors"
```

---

## Task 6: Rewrite Industrial Auctions scraper

**Files:** Rewrite `lib/scrapers/industrial.ts`

- [ ] **Step 1: Rewrite industrial.ts with cheerio and correct URL (homepage)**

```typescript
import type { RawAuctionItem, RawAuctionImage } from './types';
import { fetchPageAs$, logScrape, checkZeroResults } from './resilience';
import { SELECTORS } from './selectors';

const BASE_URL = 'https://www.industrial-auctions.com';

const COUNTRY_MAP: Record<string, { country: string; countryCode: string; lat: number; lng: number }> = {
  'de': { country: 'Alemania', countryCode: 'DE', lat: 51.1657, lng: 10.4515 },
  'nl': { country: 'Países Bajos', countryCode: 'NL', lat: 52.1326, lng: 5.2913 },
  'uk': { country: 'Reino Unido', countryCode: 'UK', lat: 55.3781, lng: -3.4360 },
  'fr': { country: 'Francia', countryCode: 'FR', lat: 46.2276, lng: 2.2137 },
  'pl': { country: 'Polonia', countryCode: 'PL', lat: 51.9194, lng: 19.1451 },
  'lv': { country: 'Letonia', countryCode: 'LV', lat: 56.8796, lng: 24.6032 },
  'se': { country: 'Suecia', countryCode: 'SE', lat: 60.1282, lng: 18.6435 },
  'at': { country: 'Austria', countryCode: 'AT', lat: 47.5162, lng: 14.5501 },
  'cz': { country: 'Chequia', countryCode: 'CZ', lat: 49.8175, lng: 15.4730 },
};

function parseIndustrialAuctions($: cheerio.CheerioAPI): RawAuctionItem[] {
  const items: RawAuctionItem[] = [];
  const sels = SELECTORS.industrial;

  // Find auction cards
  let cards = $(sels.primary.listing);
  if (cards.length === 0) {
    cards = $(sels.fallback.listing);
  }

  cards.each((_, el) => {
    const card = $(el);

    // Extract link
    let linkEl = card.find(sels.primary.link).first();
    if (linkEl.length === 0) linkEl = card.find(sels.fallback.link).first();
    const href = linkEl.attr('href') || (card.is('a') ? card.attr('href') : '') || '';
    if (!href || !href.includes('/auctions/')) return;

    // Extract title
    let titleEl = card.find(sels.primary.title).first();
    if (titleEl.length === 0) titleEl = card.find(sels.fallback.title).first();
    const title = titleEl.text().trim();
    if (!title || title.length < 5) return;

    // Extract image
    let imgEl = card.find(sels.primary.image).first();
    if (imgEl.length === 0) imgEl = card.find(sels.fallback.image).first();
    const imgUrl = imgEl.attr('src') || imgEl.attr('data-src') || '';
    const imgAlt = imgEl.attr('alt') || title;

    // Extract price
    let price: number | null = null;
    const priceMatch = card.text().match(/([\d.,]+)\s*(€|EUR)/i);
    if (priceMatch) {
      price = parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.'));
    }

    // Extract end date
    let endDateEl = card.find(sels.primary.endDate).first();
    if (endDateEl.length === 0) endDateEl = card.find(sels.fallback.endDate).first();
    const endDateText = endDateEl.attr('datetime') || endDateEl.text().trim();
    const endDate = endDateText ? new Date(endDateText) : new Date(Date.now() + 14 * 86400000);
    if (isNaN(endDate.getTime())) endDate.setTime(Date.now() + 14 * 86400000);

    // Extract location
    let locationEl = card.find(sels.primary.location).first();
    if (locationEl.length === 0) locationEl = card.find(sels.fallback.location).first();
    const locationText = locationEl.text().trim();

    // Build source URL
    const sourceUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;

    // Extract lot ID from URL
    const lotIdMatch = href.match(/\/auctions\/(\d+)/);
    const lotId = lotIdMatch ? `IND-${lotIdMatch[1]}` : `IND-${Date.now()}-${items.length}`;

    // Determine country
    let countryData = COUNTRY_MAP['nl'];
    for (const [code, data] of Object.entries(COUNTRY_MAP)) {
      if (locationText.toLowerCase().includes(code.toUpperCase()) || locationText.toLowerCase().includes(data.country.toLowerCase())) {
        countryData = data;
        break;
      }
    }

    const images: RawAuctionImage[] = [];
    if (imgUrl) {
      images.push({ url: imgUrl.startsWith('http') ? imgUrl : `${BASE_URL}${imgUrl}`, alt: imgAlt, isPrimary: true, sortOrder: 0 });
    }

    items.push({
      platformId: 'industrial-auctions',
      lotId,
      title: title.slice(0, 200),
      description: title,
      category: 'Industrial',
      sourceUrl,
      currentBid: price,
      currency: priceMatch ? (priceMatch[2] || 'EUR') : 'EUR',
      estimatedResale: price ? price * 2 : undefined,
      buyerPremiumPercent: 15,
      hasReserve: false,
      startingBid: price ? price * 0.5 : null,
      city: locationText.split(',')[0]?.trim() || '',
      country: countryData.country,
      countryCode: countryData.countryCode,
      lat: countryData.lat,
      lng: countryData.lng,
      auctionEnd: endDate.toISOString(),
      inspectionAvailable: true,
      condition: 'good',
      images,
    });
  });

  return items;
}

export interface IndustrialScrapeOptions {
  maxPages?: number;
}

export async function scrapeIndustrial(options: IndustrialScrapeOptions = {}): Promise<RawAuctionItem[]> {
  const items: RawAuctionItem[] = [];

  try {
    logScrape('industrial', 'info', 'Fetching Industrial Auctions homepage...');
    const $ = await fetchPageAs$(BASE_URL);
    const pageItems = parseIndustrialAuctions($);

    items.push(...pageItems);
    logScrape('industrial', 'success', `Found ${pageItems.length} auctions on homepage`);

    const check = checkZeroResults('industrial', items.length, 3);
    if (check.isWarning) logScrape('industrial', 'warn', check.message);
  } catch (error) {
    logScrape('industrial', 'error', `Scrape error: ${error instanceof Error ? error.message : String(error)}`);
  }

  return items;
}
```

- [ ] **Step 2: Commit**

```bash
cd surus-estrategico && git add lib/scrapers/industrial.ts && git commit -m "feat: rewrite Industrial Auctions scraper with cheerio and correct URL"
```

---

## Task 7: Create BidSpotter scraper (NEW)

**Files:** Create `lib/scrapers/bidspotter.ts`

- [ ] **Step 1: Create bidspotter.ts — scraper for BidSpotter/Hibid**

Research and implement the BidSpotter scraper. Since BidSpotter uses hibid.com infrastructure, we need to:
1. Navigate to their search page
2. Parse auction listings with cheerio
3. Extract lot details

The implementation will follow the same pattern as netbid.ts using cheerio + CSS selectors from selectors.ts.

- [ ] **Step 2: Create the API route at `app/api/scrape/bidspotter/route.ts`**

- [ ] **Step 3: Commit**

```bash
cd surus-estrategico && git add lib/scrapers/bidspotter.ts app/api/scrape/bidspotter/route.ts && git commit -m "feat: add BidSpotter scraper"
```

---

## Task 8: Create Euro Auctions scraper (NEW)

**Files:** Create `lib/scrapers/euro-auctions.ts`

- [ ] **Step 1: Create euro-auctions.ts — scraper for Euro Auctions**

Research and implement the Euro Auctions scraper following the same pattern.

- [ ] **Step 2: Create the API route at `app/api/scrape/euro-auctions/route.ts`**

- [ ] **Step 3: Commit**

```bash
cd surus-estrategico && git add lib/scrapers/euro-auctions.ts app/api/scrape/euro-auctions/route.ts && git commit -m "feat: add Euro Auctions scraper"
```

---

## Task 9: Create parallel scrape endpoint

**Files:** Create `app/api/scrape/all/route.ts`, Update `ScraperPanel.tsx` platforms list

- [ ] **Step 1: Create `/api/scrape/all` endpoint that runs all 5 scrapers in parallel**

```typescript
import { NextResponse } from 'next/server';
import { scrapeTBAuctions } from '@/lib/scrapers/tbauctions';
import { scrapeNetBid } from '@/lib/scrapers/netbid';
import { scrapeIndustrial } from '@/lib/scrapers/industrial';
import { scrapeBidSpotter } from '@/lib/scrapers/bidspotter';
import { scrapeEuroAuctions } from '@/lib/scrapers/euro-auctions';
import { transformRawItem } from '@/lib/scrapers/resale-estimates';
import { upsertAuctions, deactivateStale, createScrapeRun, completeScrapeRun, failScrapeRun } from '@/lib/supabase/upsert-auctions';
import { logScrape } from '@/lib/scrapers/resilience';

export async function POST() {
  const startTime = Date.now();

  const scrapers = [
    { id: 'tbauctions', fn: () => scrapeTBAuctions({ platforms: ['SPX', 'TWK', 'BVA'] }), platformIds: ['surplex', 'troostwijk', 'bva'] },
    { id: 'netbid', fn: () => scrapeNetBid({ maxPages: 3 }), platformIds: ['netbid'] },
    { id: 'industrial-auctions', fn: () => scrapeIndustrial({ maxPages: 3 }), platformIds: ['industrial-auctions'] },
    { id: 'bidspotter', fn: () => scrapeBidSpotter({ maxPages: 3 }), platformIds: ['bidspotter'] },
    { id: 'euro-auctions', fn: () => scrapeEuroAuctions({ maxPages: 3 }), platformIds: ['euro-auctions'] },
  ];

  const results = await Promise.allSettled(
    scrapers.map(async (scraper) => {
      const scraperStart = Date.now();
      let runId: string | null = null;

      try {
        runId = await createScrapeRun(scraper.id);
        logScrape(scraper.id, 'info', `Starting scrape...`);

        const rawItems = await scraper.fn();
        const transformed = rawItems.map(transformRawItem);
        const upsertedCount = await upsertAuctions(transformed);

        const activeLotIds = rawItems.map(item => item.lotId);
        let totalDeactivated = 0;
        for (const pid of scraper.platformIds) {
          const platformLots = rawItems.filter(item => item.platformId === pid).map(item => item.lotId);
          if (platformLots.length > 0) {
            const deactivated = await deactivateStale(pid, platformLots);
            totalDeactivated += deactivated;
          }
        }

        const durationMs = Date.now() - scraperStart;
        await completeScrapeRun(runId, rawItems.length, upsertedCount, totalDeactivated, durationMs);

        logScrape(scraper.id, 'success', `${rawItems.length} found, ${upsertedCount} saved (${(durationMs / 1000).toFixed(1)}s)`);

        return {
          platform: scraper.id,
          success: true,
          itemsFound: rawItems.length,
          itemsUpserted: upsertedCount,
          itemsDeactivated: totalDeactivated,
          durationMs,
        };
      } catch (error) {
        const durationMs = Date.now() - scraperStart;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (runId) await failScrapeRun(runId, errorMessage);

        logScrape(scraper.id, 'error', errorMessage);

        return {
          platform: scraper.id,
          success: false,
          error: errorMessage,
          durationMs,
        };
      }
    })
  );

  const totalDuration = Date.now() - startTime;

  return NextResponse.json({
    success: true,
    totalDurationMs: totalDuration,
    results: results.map(r => r.status === 'fulfilled' ? r.value : { platform: 'unknown', success: false, error: r.reason }),
  });
}
```

- [ ] **Step 2: Update ScraperPanel.tsx PLATFORMS array to include BidSpotter and Euro Auctions**

- [ ] **Step 3: Commit**

```bash
cd surus-estrategico && git add app/api/scrape/all/route.ts components/dashboard/ScraperPanel.tsx && git commit -m "feat: add parallel scrape endpoint and update platform list"
```

---

## Task 10: Upgrade ScraperPanel UI

**Files:** Rewrite `components/dashboard/ScraperPanel.tsx`

- [ ] **Step 1: Rewrite ScraperPanel with 4 new features**

The new ScraperPanel will include:
1. "Scrapear Todo" button that calls `/api/scrape/all`
2. Real-time log display (terminal-style, color-coded)
3. Health indicators per platform (green/yellow/red/white)
4. Execution history (last 10 runs per platform)

- [ ] **Step 2: Update the status endpoint to include health + history**

- [ ] **Step 3: Commit**

```bash
cd surus-estrategico && git add components/dashboard/ScraperPanel.tsx app/api/scrape/status/route.ts && git commit -m "feat: upgrade ScraperPanel with parallel scrape, real-time logs, health indicators, history"
```

---

## Task 11: Update existing scrape routes to use resilience module

**Files:** Update `app/api/scrape/tbauctions/route.ts`, `netbid/route.ts`, `industrial/route.ts`

- [ ] **Step 1: Update each route to import and use logScrape from resilience module**

Each route already uses the scraper functions. The main change is ensuring they use the resilience module's logging.

- [ ] **Step 2: Commit**

```bash
cd surus-estrategico && git add app/api/scrape/tbauctions/route.ts app/api/scrape/netbid/route.ts app/api/scrape/industrial/route.ts && git commit -m "feat: update scrape routes to use resilience module logging"
```

---

## Task 12: Build, test, and verify

- [ ] **Step 1: Run `npm run build` to check for TypeScript errors**

```bash
cd surus-estrategico && npm run build
```

- [ ] **Step 2: Fix any TypeScript errors**

- [ ] **Step 3: Test individual scrapers via API**

```bash
# Test each scraper
curl -X POST https://surus-estrategico.vercel.app/api/scrape/tbauctions
curl -X POST https://surus-estrategico.vercel.app/api/scrape/netbid
curl -X POST https://surus-estrategico.vercel.app/api/scrape/industrial
```

- [ ] **Step 4: Test parallel scrape**

```bash
curl -X POST https://surus-estrategico.vercel.app/api/scrape/all
```

- [ ] **Step 5: Verify dashboard shows images and links**

- [ ] **Step 6: Final commit if any fixes needed**

---

## Spec Coverage Check

| Spec Requirement | Task |
|---|---|
| API-first with HTML fallback | Task 4 (TBAuctions) |
| cheerio replaces regex | Tasks 4, 5, 6 |
| Rotating browser headers | Task 2 (resilience.ts) |
| CSS selectors with fallback | Task 3 (selectors.ts) |
| Retry with exponential backoff | Task 2 (resilience.ts) |
| Zero-result detection | Task 2 (resilience.ts) |
| NetBid correct URL | Task 5 |
| Industrial Auctions correct URL | Task 6 |
| BidSpotter scraper (new) | Task 7 |
| Euro Auctions scraper (new) | Task 8 |
| Parallel execution endpoint | Task 9 |
| "Scrapear Todo" button | Task 10 |
| Real-time log display | Task 10 |
| Health indicators | Task 10 |
| Execution history | Task 10 |
| Images extraction | Tasks 4, 5, 6, 7, 8 |
| Source URLs | Tasks 4, 5, 6, 7, 8 |