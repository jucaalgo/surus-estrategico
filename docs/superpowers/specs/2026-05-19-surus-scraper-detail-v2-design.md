# SURUS Scraper Detail v2 — Complete Correction Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:writing-plans then superpowers:executing-plans or superpowers:subagent-driven-development.

**Goal:** Fix all broken behaviors in SURUS auction intelligence platform so scrapers return complete, accurate data with correct ROI calculations, auto-refreshing dashboard, working DB reset, and detail-level scraping for top lots.

**Architecture:** Two-phase scraping: Phase 1 (list) gets all auction cards quickly; Phase 2 (detail) filters top 15 lots per platform by keyword-value score + estimated ROI, then scrapes each detail page for description, specs, images, and real price. KPI calculations use real bid when available, estimated bid (40% of resale) when not.

**Tech Stack:** Next.js 15, cheerio, Supabase, Vercel serverless (Hobby plan = 10s timeout constraint).

---

## Corrections Overview

| # | Problem | Root Cause | Fix |
|---|---------|-----------|-----|
| 1 | ROI always red / negative | `bid` set to `estimatedBaseValue` (full market value) instead of null when no real price exists, making acquisition cost artificially high | Separate `currentBid` (real, nullable) from `estimatedBaseValue`; let `calculateKPIs` estimate bid = resale × 0.4 |
| 2 | Dashboard doesn't auto-refresh after scrape | `window.location.reload()` kills state; `fetchedRef` blocks re-fetch | Remove reload; call `refreshFromApi()` directly; reset `fetchedRef` on scrape complete |
| 3 | Reset DB doesn't delete | `.gte('created_at', ...)` misses rows with null `created_at`; also re-seeds mock data | Use `.neq('id', 0)` to delete ALL rows; remove re-seed step |
| 4 | Mock data shows by default | `getActiveAssets()` fallback in API and hook initial state | Remove fallback from `/api/auctions`; initialize `useSearch` with `[]` |
| 5 | No images, descriptions, specs | Scrapers only parse listing cards, never enter detail pages | Implement two-phase scraping with detail page fetch for top 15 lots |
| 6 | No resale market recommendations | Feature not implemented | Add `resaleMarkets` field mapped from category keywords |
| 7 | ROI thresholds unrealistic | Green ≥40% is too high for auction arbitrage | Green ≥30%, Orange ≥15%, Red <15% |
| 8 | "Lote de cosas" not handled | One DB row = one item, but lots contain N items | Add `lotQuantity` field; adjust `estimatedResale` and KPIs for quantity |

---

## Phase 1: List Scraping (Fast)

Same as current: parse listing page cards for each platform. Extract:
- `lotId`, `title`, `sourceUrl`, `currentBid` (if shown), `currency`, `auctionEnd`, `city`, `countryCode`, `imageUrl`
- `description` = `title` (placeholder until Phase 2)

No changes to list scraping logic except extracting more fields where available.

---

## Phase 2: Filter + Detail Scraping (Smart)

### 2.1 Keyword-Value Scoring

Each lot gets a **value score** based on keywords in the title:

```typescript
const KEYWORD_SCORES: Record<string, number> = {
  // Puntuación priorizada por demanda de mercado y margen de reventa
  // 10 = máxima prioridad (plantas completas, envasado — alto valor, compradores institucionales)
  'planta': 10, 'planta de alimentos': 10, 'envasado': 10, 'envasadora': 10,
  'verpackung': 10, 'abfüllanlage': 10, 'food processing': 10, 'línea completa': 10,
  
  // 9 = robots industriales (alto valor residual, demanda constante)
  'kuka': 9, 'abb': 9, 'fanuc': 9, 'robot': 9, 'roboter': 9, 'robotic': 9,
  'brazo robot': 9, 'robot paletizado': 9, 'robot soldadura': 9,
  
  // 8 = corte láser (alta demanda, buen margen)
  'laser': 8, 'láser': 8, 'trumpf': 8, 'amada': 8, 'cutting': 8, 'schneid': 8,
  'laser de fibra': 8, 'corte por láser': 8,
  
  // 7 = mecanizado CNC (demanda estable)
  'cnc': 7, 'mecanizado': 7, 'bearbeitung': 7, 'machining': 7,
  'centro mecanizado': 7, 'bearbeitungszentrum': 7, 'centro de mecanizado': 7,
  'torno': 7, 'dreh': 7, 'lathe': 7, 'torno cnc': 7,
  
  // 6 = inyectoras y plástico (buen margen, mercado activo)
  'inyectora': 6, 'injection': 6, 'spritzguss': 6, 'spritzgieß': 6,
  'engel': 6, 'arburg': 6, 'kraussmaffei': 6, 'moldeo': 6,
  'plegadora': 6, 'press brake': 6, 'abkant': 6, 'biegemaschine': 6,
  
  // 5 = prensas y conformado
  'prensa': 5, 'presse': 5, 'press': 5, 'prensa hidráulica': 5,
  'milling': 5, 'fräsmaschine': 5, 'fresadora': 5,
  
  // 4 = compresores y neumática
  'compresor': 4, 'compressor': 4, 'kompressor': 4, 'druckluft': 4,
  
  // 3 = logística
  'carretilla': 3, 'forklift': 3, 'stapler': 3, 'gabelstapler': 3,
  'jungheinrich': 3, 'still': 3, 'linde': 3,
  
  // 2 = soldadura y auxiliares
  'soldadura': 2, 'welding': 2, 'schweiß': 2, 'schweiss': 2, 'weld': 2,
};
```

Score = sum of matched keyword values. Max capped at 30.

### 2.2 Quick ROI Estimation (Pre-filter)

For lots without real `currentBid`:
- `estimatedBaseValue` = `estimateValueFromTitle(title)` (from existing `resale-estimates.ts`)
- `estimatedResale` = `estimatedBaseValue × multiplier` (from existing `RESALE_MULTIPLIERS`)
- `estimatedBid` = `estimatedResale × 0.4`
- Quick acquisition cost = `estimatedBid × 1.16 (premium) + estimatedBid × 1.16 × 0.21 (VAT) + transport + refurbishment`
- Quick ROI = `(estimatedResale - acquisitionCost) / acquisitionCost × 100`

### 2.3 Ranking Formula

```
rankScore = valueScore × 2 + quickROI
```

Sort descending. Take **top 15 per platform** for detail scraping.

### 2.4 Detail Page Scraping

For each top-15 lot:
1. Fetch `sourceUrl` with `fetchPageAs$`
2. Extract from detail page:
   - **Description:** First `<p>` or `<div>` with >100 chars after title, or meta description
   - **Specs table:** Look for tables, definition lists, or spec grids. Extract year, hours, weight, power, make, model
   - **Images:** All `<img>` tags with `src` or `data-src` containing the lot. Filter out logos/icons (min width 200px or URL pattern)
   - **Real price:** Look for `.current-bid`, `.bid-amount`, `data-bid` — update `currentBid` if found
3. Merge with Phase 1 data

**Rate limiting:** 500ms delay between detail requests per platform to avoid 429/403.

### 2.5 Timeout Guard

Since Vercel Hobby = 10s timeout:
- Phase 1 must complete within 3s (4 parallel platforms)
- Phase 2 gets remaining 6s → max 12 detail pages at 500ms each
- If timeout approaching (>8s elapsed), skip remaining details and return Phase 1 data only
- Log: "Timeout approaching, skipping N remaining detail fetches"

---

## Phase 3: KPI Recalculation

After detail scraping:
1. If real `currentBid` found in detail → use it
2. If no real bid → `bid = estimatedResale × 0.4` (existing fallback in `calculateKPIs`)
3. Recalculate all KPIs with final data
4. `transformRawItem` must NOT set `bid = estimatedBaseValue` — pass `null` for `currentBid` when no real price exists

---

## Database Changes

### New Fields (optional, additive)

```sql
-- Add to auctions table (nullable, safe migration)
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS resale_markets TEXT[];
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS lot_quantity INT DEFAULT 1;
```

### Updated Fields
- `current_bid`: Now legitimately NULL when no price scraped
- `description`: Populated from detail page instead of title copy

---

## UI Changes

### ResultsList.tsx
- Thresholds: Green ≥30%, Orange ≥15%, Red <15%
- Show lot quantity badge if >1: "Lote de N"

### AssetDetail.tsx
- Show `resaleMarkets` as chip list: "Vender en: Exapro, Machinio..."
- Show lot quantity
- Show full description (no longer truncated to title)

### ScraperPanel.tsx
- Remove `window.location.reload()`
- After scrape: call `onScrapeComplete()` → triggers `refreshFromApi()`
- Show detail fetch count: "Detalles extraídos: X/15"

---

## Resale Markets Mapping

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
```

Store as `TEXT[]` in PostgreSQL. Display in AssetDetail.

---

## File Changes Summary

| File | Action |
|------|--------|
| `lib/scrapers/resale-estimates.ts` | Modify: separate bid from estimatedBaseValue; add `resaleMarkets` |
| `lib/scrapers/resilience.ts` | Modify: add `fetchDetailPage()` with delay; add keyword scorer |
| `lib/scrapers/netbid.ts` | Modify: two-phase scrape; add `scrapeNetBidDetail()` |
| `lib/scrapers/industrial.ts` | Modify: two-phase scrape; add `scrapeIndustrialDetail()` |
| `lib/scrapers/bidspotter.ts` | Modify: two-phase scrape; add `scrapeHibidDetail()` |
| `lib/scrapers/euro-auctions.ts` | Modify: two-phase scrape; add `scrapeEuroDetail()` |
| `lib/calculations.ts` | Modify: adjust `calculateKPIs` to handle null bid properly; adjust thresholds |
| `components/dashboard/ResultsList.tsx` | Modify: new ROI thresholds |
| `components/dashboard/AssetDetail.tsx` | Modify: show resale markets, lot quantity, full description |
| `components/dashboard/ScraperPanel.tsx` | Modify: remove reload; add detail count logging |
| `hooks/useSearch.ts` | Modify: remove `getActiveAssets()` init; reset `fetchedRef` on refresh |
| `app/api/auctions/route.ts` | Modify: remove mock fallback |
| `app/api/admin/reset/route.ts` | Modify: use `.neq('id', 0)`; remove re-seed |
| `app/api/scrape/all/route.ts` | Modify: pass timeout guard to scrapers |
| `lib/types.ts` | Modify: add `lotQuantity`, `resaleMarkets` to Asset |

---

## Spec Self-Review

1. **Spec coverage:** All 8 problems from diagnosis have corresponding fixes. ✅
2. **Placeholder scan:** No TBDs, TODOs, or vague requirements. ✅
3. **Type consistency:** `currentBid` stays `number | null`. `lotQuantity` is `number` default 1. `resaleMarkets` is `string[]`. ✅
4. **Vercel constraint respected:** 10s timeout → 3s Phase 1 + 6s Phase 2 max. ✅
5. **No breaking changes:** All DB changes are additive (nullable columns). ✅

---

## Testing Strategy

1. Reset DB → verify empty dashboard
2. Scrape NetBid → verify detail count in panel
3. Check first result: should have description > title, images > 0, specs populated
4. Check ROI: should be >30% for CNC/robot lots (green badge)
5. Check AssetDetail: should show "Vender en: Exapro, ..."
6. Check lot quantity: if title contains "3 ×" or "lote de", badge shows "Lote de 3"
