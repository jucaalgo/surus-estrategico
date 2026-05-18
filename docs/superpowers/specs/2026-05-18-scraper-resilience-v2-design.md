# SURUS Scraper Resilience v2 — Design Spec

**Date:** 2026-05-18  
**Status:** Approved  
**Scope:** Rewrite all 3 broken scrapers + add 2 new platforms + upgrade ScraperPanel UI

---

## Problem Statement

All 3 scrapers return 0 results:
- **TBAuctions** (Surplex/Troostwijk/BVA): GraphQL API returns 403 Forbidden
- **NetBid**: URL `/en/auctions/search` returns 404; site restructured
- **Industrial Auctions**: URL `/en/auctions?page=` returns 404; site restructured

Additionally:
- Dashboard has no images (missing `images` field in API response)
- "Ir a la Puja" button is disabled (no functional `sourceUrl`)
- Scrapers run sequentially via individual buttons (no parallel execution)
- HTML parsing uses regex — extremely fragile to site changes

---

## Architecture

### 3-Layer Resilience

```
Layer 1: API endpoint (if available, with browser headers)
   → On 403/error, fall to Layer 2
Layer 2: HTML scraping with cheerio + CSS selectors
   → Primary + fallback selectors
   → If 0 items returned, mark as "possible structure change"
Layer 3: Seed data (emergency only)
   → Keep existing mock data as fallback
```

### Platform Strategies

| Platform | Layer 1 | Layer 2 | Selectors |
|----------|---------|---------|-----------|
| TBAuctions | GraphQL with browser headers | cheerio on surplex.com/troostwijkauctions.com | Primary: GraphQL query; Fallback: CSS selectors on listing pages |
| NetBid | N/A | cheerio on `/en/auctions` | Primary: `li a[href^="/en/auctions/"]`; Fallback: listing card selectors |
| Industrial Auctions | N/A | cheerio on `/` (homepage) | Primary: `a[href^="/auctions/"]`; Fallback: listing card selectors |
| BidSpotter (NEW) | N/A | cheerio on listing pages | Primary: CSS selectors on search results; Fallback: alternate selectors |
| Euro Auctions (NEW) | N/A | cheerio on listing pages | Primary: CSS selectors on auction listings; Fallback: alternate selectors |

---

## Resilience Features

### 1. Retry with Exponential Backoff

```typescript
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, { ...options, headers: getNextHeaders() });
      if (res.ok) return res;
      if (res.status === 403 && attempt < maxRetries) {
        await sleep(Math.pow(2, attempt) * 1000 + Math.random() * 1000);
        continue;
      }
      return res;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await sleep(Math.pow(2, attempt) * 1000);
    }
  }
  throw new Error('Max retries exceeded');
}
```

### 2. Rotating Browser Headers

```typescript
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0',
];

function getNextHeaders(): Record<string, string> {
  return {
    'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,es;q=0.8,de;q=0.7,nl;q=0.6',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Cache-Control': 'max-age=0',
  };
}
```

### 3. CSS Selectors with Fallback

Each scraper defines primary and fallback selectors:

```typescript
interface ScraperSelectors {
  primary: {
    listing: string;    // cheerio selector for auction cards
    title: string;     // selector for title text
    price: string;     // selector for price
    link: string;      // selector for URL
    image: string;     // selector for image src
    endDate: string;   // selector for end date
    location: string;  // selector for location
  };
  fallback: { ... same structure ... };
}
```

### 4. Zero-Result Detection

If a scraper that normally returns 10+ items returns 0:
- Log `[WARN] {platform}: 0 items returned (expected 10+). Possible site structure change.`
- Set scrape run status to `warning` in DB
- Don't deactivate existing items (preserve stale data over no data)

---

## New Platforms

### BidSpotter (Hibid)

- URL: `https://www.bidspotter.co.uk` or `https://www.hibid.com`
- Focus: UK/US industrial auctions
- Scraping: HTML listing pages with cheerio
- Data: lot title, current bid, end date, images, location

### Euro Auctions (Machinery Auctions)

- URL: `https://www.euroauctions.com`
- Focus: European industrial machinery auctions
- Scraping: HTML listing pages with cheerio
- Data: lot title, current bid, end date, images, location

---

## Parallel Execution

### New API Endpoint: `/api/scrape/all`

```typescript
export async function POST() {
  const results = await Promise.allSettled([
    scrapeTBAuctions({ platforms: ['SPX', 'TWK', 'BVA'], maxPages: 5 }),
    scrapeNetBid({ maxPages: 3 }),
    scrapeIndustrial({ maxPages: 3 }),
    scrapeBidSpotter({ maxPages: 3 }),
    scrapeEuroAuctions({ maxPages: 3 }),
  ]);
  // ... process results, upsert to DB
}
```

- Runs all 5 scrapers in parallel
- Each reports independently (success/warning/error)
- Frontend shows real-time progress per platform

---

## ScraperPanel UI Upgrades

### 1. "Scrapear Todo" Button with Progress

- New button at top: `[🔄 Scrapear Todo]`
- Shows progress bar per platform
- Each platform reports: items found, items saved, duration

### 2. Real-Time Log (Terminal-Style)

- Collapsible log panel showing each step
- Color-coded: green for success, yellow for warning, red for error
- Auto-scroll to bottom
- Example:
  ```
  [TBAuctions] Fetching surplex.com... ✓ 200 OK
  [TBAuctions] Parsing 42 lots... ✓
  [TBAuctions] Upserting to DB... ✓ 42 saved (3.2s)
  ```

### 3. Health Indicators per Platform

- 🟢 Last scrape OK, shows timestamp and item count
- 🟡 Last scrape returned 0 items (possible structure change)
- 🔴 Last scrape failed with error
- ⚪ Never executed

### 4. Execution History

- Last 10 runs per platform stored in DB
- Shows: timestamp, items found, items saved, duration, status
- Accessible via expandable panel per platform

---

## Images & Links

### Image Extraction

- **TBAuctions**: GraphQL `images { url alt order }` — already partially implemented
- **NetBid**: `<img>` inside `<figure>` within each auction `<li>`
- **Industrial Auctions**: `<img>` inside auction card divs
- **BidSpotter**: `<img>` in lot cards
- **Euro Auctions**: `<img>` in lot cards

Images stored in `images` array field with `url`, `alt`, `isPrimary`, `sortOrder`.

### Source URLs

- Each item must have a valid `sourceUrl` pointing to the original lot/auction page
- Used for "Ir a la Puja" button in the dashboard
- Format: absolute URL (e.g., `https://www.surplex.com/es/l/robot-kuka-kr-210.html`)

---

## File Structure

```
lib/scrapers/
  types.ts              ← Existing (review/update)
  resilience.ts          ← NEW: fetchWithRetry, rotating headers, zero-result detection
  selectors.ts           ← NEW: CSS selector definitions per platform (primary + fallback)
  tbauctions.ts          ← REWRITE: API with browser headers + HTML fallback
  netbid.ts              ← REWRITE: cheerio, correct URL, deep lot scraping
  industrial.ts          ← REWRITE: cheerio, correct URL, deep lot scraping
  bidspotter.ts          ← NEW: BidSpotter scraper
  euro-auctions.ts       ← NEW: Euro Auctions scraper
  resale-estimates.ts    ← Existing (review)

app/api/scrape/
  all/route.ts           ← NEW: parallel execution endpoint
  tbauctions/route.ts    ← Update
  netbid/route.ts         ← Update
  industrial/route.ts    ← Update
  bidspotter/route.ts    ← NEW
  euro-auctions/route.ts ← NEW
  status/route.ts        ← Update: include health indicators + history

components/dashboard/
  ScraperPanel.tsx       ← REWRITE: new UI with progress, logs, health, history
```

---

## Dependencies

```
cheerio — Robust HTML parsing with CSS selectors (~1MB)
```

No other new dependencies. All scraping uses `fetch()` (built-in) + `cheerio`.

---

## Out of Scope (YAGNI)

- Playwright/headless browser (too heavy for Vercel, not needed)
- Webhooks (platforms don't offer them)
- HTML caching (data changes constantly)
- Email notifications (logging is sufficient for now)
- Cron/auto-scheduling (can be added later)