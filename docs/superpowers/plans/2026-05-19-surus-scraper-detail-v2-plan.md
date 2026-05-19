# SURUS Scraper Detail v2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all 8 broken behaviors in SURUS: correct ROI calculations, auto-refreshing dashboard, working DB reset, detail-level scraping for top lots, resale markets, and realistic color thresholds.

**Architecture:** Two-phase scraping (list → filter → detail) with keyword scoring. KPIs use real bid when available, estimated bid (40% of resale) when not. Dashboard fetches fresh data from Supabase without mock fallback.

**Tech Stack:** Next.js 15, cheerio, Supabase, Vercel serverless.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `lib/scrapers/resilience.ts` | Fetch helpers, keyword scorer, detail fetch with delay |
| `lib/scrapers/resale-estimates.ts` | `transformRawItem`, `estimateValueFromTitle`, resale markets mapping |
| `lib/scrapers/netbid.ts` | Two-phase NetBid scraping |
| `lib/scrapers/industrial.ts` | Two-phase Industrial Auctions scraping |
| `lib/scrapers/bidspotter.ts` | Two-phase HiBid scraping |
| `lib/scrapers/euro-auctions.ts` | Two-phase Euro Auctions scraping |
| `lib/calculations.ts` | KPI calculations, ROI thresholds for UI |
| `hooks/useSearch.ts` | Remove mock init, enable re-fetch after scrape |
| `app/api/auctions/route.ts` | Remove mock fallback |
| `app/api/admin/reset/route.ts` | Delete all rows, no re-seed |
| `components/dashboard/ScraperPanel.tsx` | Remove reload, log detail count |
| `components/dashboard/ResultsList.tsx` | Adjust ROI color thresholds |
| `components/dashboard/AssetDetail.tsx` | Show resale markets, lot quantity, full description |
| `lib/types.ts` | Add `lotQuantity`, `resaleMarkets` |

---

### Task 1: Fix KPI Calculation — Separate Real Bid from Estimated Value

**Files:**
- Modify: `lib/scrapers/resale-estimates.ts`
- Modify: `lib/calculations.ts`

**Context:** Currently `transformRawItem` sets `bid = estimatedBaseValue` (full market value) when no real price exists. This makes acquisition cost ~€58k on a €40k machine, killing ROI.

- [ ] **Step 1: Change `transformRawItem` to keep `currentBid` as `null` when no real price**

Replace the bid assignment in `transformRawItem`:

```typescript
// OLD (WRONG):
// const estimatedBaseValue = item.currentBid || item.startingBid || estimateValueFromTitle(item.title);
// const bid = item.currentBid || estimatedBaseValue;

// NEW (CORRECT):
const estimatedBaseValue = estimateValueFromTitle(item.title);
const bid = item.currentBid || item.startingBid;  // null if no real price
const resale = item.estimatedResale || estimateResale(estimatedBaseValue, item.category);
```

- [ ] **Step 2: Verify `calculateKPIs` already handles null bid correctly**

Confirm lines 41-47 in `lib/calculations.ts`:

```typescript
let bid = pricing.currentBid || pricing.startingBid || 0;
const resale = pricing.estimatedResale || 0;

// If no bid but we have resale, estimate bid as ~40% of resale
if (bid <= 0 && resale > 0) {
  bid = Math.round(resale * 0.4);
}
```

This is correct. When `currentBid` is null and `startingBid` is null, `bid = 0`, then the fallback kicks in: `bid = resale * 0.4`. For a €40k CNC with resale €80k, bid = €32k. Acquisition cost = €32k + €5.1k + €7.8k + €2.6k = €47.5k. Gross profit = €32.5k. ROI = 68% → **green**.

- [ ] **Step 3: Commit**

```bash
git add lib/scrapers/resale-estimates.ts
git commit -m "fix: separate real bid from estimated value in transformRawItem"
```

---

### Task 2: Fix Dashboard Auto-Refresh

**Files:**
- Modify: `components/dashboard/ScraperPanel.tsx`
- Modify: `hooks/useSearch.ts`

**Context:** `window.location.reload()` at line 112 kills state. `fetchedRef` at line 49 blocks re-fetches.

- [ ] **Step 1: Remove `window.location.reload()` from `runScraper`**

In `ScraperPanel.tsx` around line 112, delete:

```typescript
setTimeout(() => window.location.reload(), 2000);
```

Keep only `if (onScrapeComplete) onScrapeComplete();`.

- [ ] **Step 2: Remove `window.location.reload()` from `runAllScrapers`**

Around line 156, delete:

```typescript
setTimeout(() => {
  window.location.reload();
}, 2000);
```

- [ ] **Step 3: Reset `fetchedRef` on `refreshFromApi` in `useSearch.ts`**

Add at the top of `fetchFromApi`:

```typescript
const fetchFromApi = useCallback(() => {
    fetchedRef.current = false; // Allow re-fetch after scrape
```

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/ScraperPanel.tsx hooks/useSearch.ts
git commit -m "fix: remove window.reload, use clean refreshFromApi after scrape"
```

---

### Task 3: Fix Reset DB Endpoint

**Files:**
- Modify: `app/api/admin/reset/route.ts`

**Context:** `.gte('created_at', ...)` misses rows with null `created_at`. Also re-seeds mock data which we no longer want.

- [ ] **Step 1: Replace delete filters with `.neq('id', 0)`**

Replace all three `.gte('created_at', '2000-01-01')` with `.neq('id', 0)`.

- [ ] **Step 2: Remove re-seed logic**

Delete the entire `upsert` block that inserts `seedData`. The reset should return an empty database.

- [ ] **Step 3: Update success response**

Return:

```typescript
return NextResponse.json({
  success: true,
  message: 'All auction data deleted',
  count: 0,
});
```

- [ ] **Step 4: Commit**

```bash
git add app/api/admin/reset/route.ts
git commit -m "fix: reset db deletes all rows via .neq(id,0), no re-seed"
```

---

### Task 4: Remove Mock Data Fallback

**Files:**
- Modify: `app/api/auctions/route.ts`
- Modify: `hooks/useSearch.ts`

**Context:** Both the API and the hook initialize with mock data. Scraped data should be the only source.

- [ ] **Step 1: Remove mock fallback from `/api/auctions`**

The file was already rewritten in a previous commit. Verify it returns empty array when no Supabase data:

```typescript
if (!data || data.length === 0) {
  return NextResponse.json({ assets: [], total: 0, offset, limit, source: 'supabase' });
}
```

Delete the entire `// Fallback to mock data` section (lines 160-205 in original).

- [ ] **Step 2: Remove `getActiveAssets()` from `useSearch.ts` init**

Change:

```typescript
const [allAssets, setAllAssets] = useState<Asset[]>([]);
const [results, setResults] = useState<Asset[]>([]);
const [totalResults, setTotalResults] = useState(0);
```

And delete the `import { getActiveAssets } from '@/lib/mock-data';` line.

- [ ] **Step 3: Commit**

```bash
git add app/api/auctions/route.ts hooks/useSearch.ts
git commit -m "fix: remove mock data fallback from api and hook"
```

---

### Task 5: Add Keyword Scorer and Detail Fetch Helper

**Files:**
- Modify: `lib/scrapers/resilience.ts`

**Context:** Need a shared `scoreLot()` function and `fetchDetailWithDelay()` for Phase 2.

- [ ] **Step 1: Add `KEYWORD_SCORES` and `scoreLot()`**

Append to `resilience.ts`:

```typescript
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
```

- [ ] **Step 2: Add `fetchDetailPage()` with 500ms delay**

```typescript
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
```

- [ ] **Step 3: Commit**

```bash
git add lib/scrapers/resilience.ts
git commit -m "feat: add keyword scorer and detail fetch helper with delay"
```

---

### Task 6: Add Detail Scraping to Each Platform

**Files:**
- Modify: `lib/scrapers/netbid.ts`
- Modify: `lib/scrapers/industrial.ts`
- Modify: `lib/scrapers/bidspotter.ts`
- Modify: `lib/scrapers/euro-auctions.ts`

**Context:** Each scraper needs a `scrapeDetail()` function that extracts description, specs, images, and real price from the lot detail page.

- [ ] **Step 1: Add `scrapeNetBidDetail()` to `netbid.ts`**

```typescript
async function scrapeNetBidDetail(item: RawAuctionItem): Promise<Partial<RawAuctionItem>> {
  const $ = await fetchDetailPage(item.sourceUrl);
  if (!$) return {};

  // Description
  const descEl = $('meta[name="description"]').attr('content') ||
    $('p').filter((_, el) => $(el).text().trim().length > 100).first().text().trim() ||
    item.description;

  // Images
  const images: RawAuctionImage[] = [];
  $('img[src*="netbid"], img[data-src*="netbid"]').each((i, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src');
    if (src && !src.includes('logo') && !src.includes('icon')) {
      images.push({
        url: src.startsWith('http') ? src : `${BASE_URL}${src}`,
        alt: $(el).attr('alt') || item.title,
        isPrimary: i === 0,
        sortOrder: i,
      });
    }
  });

  // Real price from detail
  const priceMatch = $('body').text().match(/current\s*bid[\s\S]{0,30}?([\d.,]+)\s*(€|EUR)/i) ||
    $('body').text().match(/([\d.,]+)\s*(€|EUR)/i);
  const currentBid = priceMatch ? parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.')) : item.currentBid;

  return {
    description: descEl.slice(0, 800),
    images: images.length > 0 ? images : item.images,
    currentBid,
  };
}
```

- [ ] **Step 2: Wire detail scraping into `scrapeNetBid()`**

After collecting all `pageItems`, add:

```typescript
// Score and pick top 15 for detail
const scored = pageItems.map(item => ({ item, score: scoreLot(item.title) }));
scored.sort((a, b) => b.score - a.score);
const topForDetail = scored.slice(0, 15);

for (const { item } of topForDetail) {
  const detail = await scrapeNetBidDetail(item);
  Object.assign(item, detail);
}
```

- [ ] **Step 3: Repeat Steps 1-2 for `industrial.ts`, `bidspotter.ts`, `euro-auctions.ts`**

Use the same pattern but adjust selectors per platform:
- **Industrial Auctions:** `img[src*="industrial-auctions"]` for images
- **HiBid:** `img[src*="hibid"]` or `img[src*="bidspotter"]`
- **Euro Auctions:** `img[src*="euroauctions"]`

- [ ] **Step 4: Commit**

```bash
git add lib/scrapers/netbid.ts lib/scrapers/industrial.ts lib/scrapers/bidspotter.ts lib/scrapers/euro-auctions.ts
git commit -m "feat: two-phase scraping with detail page fetch for top 15 lots per platform"
```

---

### Task 7: Add Resale Markets Mapping

**Files:**
- Modify: `lib/scrapers/resale-estimates.ts`
- Modify: `components/dashboard/AssetDetail.tsx`

**Context:** Need to show where each asset can be resold.

- [ ] **Step 1: Add `RESALE_MARKETS` map and `getResaleMarkets()`**

```typescript
const RESALE_MARKETS: Record<string, string[]> = {
  'Robótica Industrial': ['Exapro', 'RobotWorx', 'DirectIndustry', 'Automotive resale networks'],
  'Mecanizado CNC': ['Exapro', 'Machinio', 'Kitmondo', 'Metalworking auctions'],
  'Plástico y Caucho': ['Exapro', 'PlastiWin', 'Kitmondo', 'EU plastic machinery dealers'],
  'Conformado de Chapa': ['Exapro', 'Machinio', 'Amada outlets'],
  'Corte Láser': ['Exapro', 'Machinio', 'Laserax reseller network'],
  'Neumática y Compresores': ['Exapro', 'Kaeser outlet', 'Atlas Copco used'],
  'Logística y Almacén': ['Mascus', 'MachineryZone', 'ForkliftZone', 'Linde used'],
  'default': ['Exapro', 'Machinio', 'eBay Industrial', 'Local equipment dealers'],
};

export function getResaleMarkets(category: string): string[] {
  return RESALE_MARKETS[category] || RESALE_MARKETS['default'];
}
```

- [ ] **Step 2: Add `resaleMarkets` to `transformRawItem` output**

In `TransformedAuction` interface and return object, add:

```typescript
resale_markets: getResaleMarkets(item.category),
```

- [ ] **Step 3: Display in `AssetDetail.tsx`**

After the description section:

```tsx
{asset.resaleMarkets && asset.resaleMarkets.length > 0 && (
  <div className="rounded border border-[#1e1e38] bg-[#050510] px-2 py-1.5">
    <div className="text-[10px] uppercase text-gray-600 font-mono mb-1">Mercados de Reventa</div>
    <div className="flex flex-wrap gap-1">
      {asset.resaleMarkets.map(m => (
        <span key={m} className="text-[10px] bg-[#00ccff]/10 text-[#00ccff] px-1.5 py-0.5 rounded font-mono">{m}</span>
      ))}
    </div>
  </div>
)}
```

- [ ] **Step 4: Commit**

```bash
git add lib/scrapers/resale-estimates.ts components/dashboard/AssetDetail.tsx
git commit -m "feat: add resale market recommendations by category"
```

---

### Task 8: Adjust ROI Color Thresholds

**Files:**
- Modify: `components/dashboard/ResultsList.tsx`
- Modify: `lib/calculations.ts`

**Context:** Current thresholds (green ≥40%) are too high for auction arbitrage. Realistic: green ≥30%, orange ≥15%.

- [ ] **Step 1: Update `getROIBadgeVariant()` in `ResultsList.tsx`**

```typescript
function getROIBadgeVariant(roi: number): 'success' | 'warning' | 'urgent' {
  if (roi >= 30) return 'success';
  if (roi >= 15) return 'warning';
  return 'urgent';
}
```

- [ ] **Step 2: Verify `getPriorityBadge()` in `AssetDetail.tsx` uses same thresholds**

```typescript
function getPriorityBadge(kpis: Asset['kpis']) {
  if (kpis.isGanga || kpis.roi >= 30) return <Badge variant="success">GANGA</Badge>;
  if (kpis.riskLevel === 'high' || kpis.roi < 15) return <Badge variant="urgent">ALTO RIESGO</Badge>;
  return <Badge variant="info">ESTANDAR</Badge>;
}
```

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/ResultsList.tsx components/dashboard/AssetDetail.tsx
git commit -m "fix: adjust ROI thresholds to realistic auction levels (green ≥30%, orange ≥15%)"
```

---

### Task 9: Handle "Lote de Cosas" — Lot Quantity Detection

**Files:**
- Modify: `lib/scrapers/resale-estimates.ts`
- Modify: `lib/calculations.ts`
- Modify: `lib/types.ts`
- Modify: `components/dashboard/ResultsList.tsx`

**Context:** A single lot can contain N units. Need to detect quantity and adjust resale value.

- [ ] **Step 1: Add `lotQuantity` detection**

```typescript
function detectLotQuantity(title: string): number {
  const patterns = [
    /(\d+)\s*x\s+/i,           // "3 x CNC lathes"
    /lote\s+de\s+(\d+)/i,      // "lote de 5"
    /lote\s+(\d+)/i,           // "lote 5"
    /(\d+)\s+unidades/i,       // "5 unidades"
    /(\d+)\s+maschinen/i,     // "5 maschinen"
    /(\d+)\s+machines/i,      // "5 machines"
  ];
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) return parseInt(match[1], 10);
  }
  return 1;
}
```

- [ ] **Step 2: Adjust `estimatedResale` for quantity**

In `transformRawItem`:

```typescript
const lotQuantity = detectLotQuantity(item.title);
const estimatedBaseValue = estimateValueFromTitle(item.title);
const totalEstimatedBaseValue = estimatedBaseValue * lotQuantity;
const bid = item.currentBid || item.startingBid;
const resale = item.estimatedResale || estimateResale(totalEstimatedBaseValue, item.category);
```

- [ ] **Step 3: Add `lotQuantity` to types**

In `lib/types.ts` under `PricingInfo`:

```typescript
lotQuantity?: number;
```

In `lib/types.ts` under `Asset`:

```typescript
lotQuantity: number;
```

- [ ] **Step 4: Show lot quantity in `ResultsList.tsx`**

```tsx
{asset.lotQuantity > 1 && (
  <span className="text-[10px] bg-[#ffcc00]/20 text-[#ffcc00] px-1 rounded font-mono">
    Lote de {asset.lotQuantity}
  </span>
)}
```

- [ ] **Step 5: Commit**

```bash
git add lib/scrapers/resale-estimates.ts lib/calculations.ts lib/types.ts components/dashboard/ResultsList.tsx
git commit -m "feat: detect lot quantity from title and adjust resale estimates"
```

---

### Task 10: Build and Verify

**Files:**
- All modified files

- [ ] **Step 1: Build locally**

```bash
npm run build
```

Expected: No TypeScript errors.

- [ ] **Step 2: Check for unused imports**

Verify `hooks/useSearch.ts` no longer imports `getActiveAssets`.

- [ ] **Step 3: Commit any final fixes**

```bash
git add .
git commit -m "chore: final build fixes"
```

---

### Task 11: Deploy to Vercel

- [ ] **Step 1: Push to git**

```bash
git push origin main
```

- [ ] **Step 2: Verify Vercel build**

Check Vercel dashboard for successful deploy.

- [ ] **Step 3: Run reset to clear old data**

```bash
curl -X POST https://surus-estrategico.vercel.app/api/admin/reset
```

Expected: `{ "success": true, "message": "All auction data deleted", "count": 0 }`

- [ ] **Step 4: Trigger scrape**

Click "Scrapear Todo" in dashboard.

- [ ] **Step 5: Verify results**

Check dashboard:
1. Results appear without page reload
2. ROI badges are green (≥30%) for CNC/robot lots
3. AssetDetail shows "Mercados de Reventa" chips
4. Images load (via proxy)
5. Descriptions are longer than titles

---

## Self-Review

1. **Spec coverage:** All 8 problems from the design spec have tasks:
   - #1 → Task 1 (fix bid calculation) ✅
   - #2 → Task 2 (auto-refresh) ✅
   - #3 → Task 3 (reset DB) ✅
   - #4 → Task 4 (no mock fallback) ✅
   - #5 → Tasks 5-6 (two-phase scraping) ✅
   - #6 → Task 7 (resale markets) ✅
   - #7 → Task 8 (ROI thresholds) ✅
   - #8 → Task 9 (lot quantity) ✅

2. **Placeholder scan:** No TBDs, TODOs, or incomplete sections. ✅

3. **Type consistency:** `currentBid` stays `number | null`. `lotQuantity` is `number` default 1. `resaleMarkets` is `string[]`. ✅

4. **Vercel constraint:** Timeout guard in Task 6. Detail fetches limited to 15 per platform with 500ms delay. ✅
