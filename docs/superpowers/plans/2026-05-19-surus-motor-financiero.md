# SURUS v2.0 Phase 1 — Motor Financiero Real

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-contained financial engine (`lib/engine/`) that replaces the fake KPI calculations with real, testable, category-aware formulas.

**Architecture:** Pure TypeScript functions with no React/Next.js dependencies. Each module has a single responsibility. All business logic is unit-testable. The engine is consumed by scrapers (to write KPIs into DB) and by the dashboard (to recalculate on demand).

**Tech Stack:** TypeScript, Jest (via `npx jest` or `npm test` after adding to package.json), no external libraries.

---

## File Structure

```
lib/engine/
  ├── types.ts          # Shared interfaces
  ├── categories.ts     # Category profiles (refurb range, holding months, transport base)
  ├── pricing.ts        # Bid + buyer premium + taxes + fixed fees
  ├── resale.ts         # Resale estimate from title/specs/category
  ├── transport.ts      # Haversine distance + weight-based cost
  ├── refurbishment.ts  # Condition + category + hours/year adjustments
  ├── kpi.ts            # ROI, correct TIR, correct Payback, arbitrage, isGanga
  ├── risk.ts           # Weighted 0-100 score based on real specs
  ├── geocode.ts        # Nominatim client + fallback dispersal
  └── index.ts          # Single `analyzeAsset()` entry point + re-export all

__tests__/lib/engine/
  ├── kpi.test.ts
  ├── transport.test.ts
  ├── risk.test.ts
  └── resale.test.ts
```

---

### Task 1: Project Setup — Add Jest

**Files:**
- Modify: `surus-estrategico/package.json`
- Modify: `surus-estrategico/tsconfig.json` (if needed for jest types)

**Why:** There are zero tests in the project. We need tests before writing engine code.

- [ ] **Step 1: Install Jest + ts-jest**

Run:
```bash
cd surus-estrategico && npm install --save-dev jest ts-jest @types/jest
```

- [ ] **Step 2: Add test script to package.json**

Modify `surus-estrategico/package.json` — add `"test": "jest"` inside `"scripts"`:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "jest"
}
```

- [ ] **Step 3: Create jest.config.js**

Create: `surus-estrategico/jest.config.js`

```javascript
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
};
```

- [ ] **Step 4: Verify Jest works**

Run: `cd surus-estrategico && npx jest --version`
Expected output: a version number (e.g., `29.x.x`)

- [ ] **Step 5: Commit**

```bash
cd surus-estrategico && git add package.json jest.config.js package-lock.json && git commit -m "chore: add jest + ts-jest for unit testing"
```

---

### Task 2: Engine Types

**Files:**
- Create: `surus-estrategico/lib/engine/types.ts`

**Why:** All engine modules depend on these interfaces. Define them first.

- [ ] **Step 1: Write the types file**

```typescript
// lib/engine/types.ts

export type Condition = 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';

export interface AssetSpecs {
  year?: number;
  hours?: number;
  weightKg?: number;
  power?: string;
  make?: string;
  model?: string;
  condition: Condition;
}

export interface AssetLocation {
  city?: string;
  countryCode: string;
  lat?: number;
  lng?: number;
}

export interface PricingInputs {
  currentBid: number | null;
  startingBid: number | null;
  estimatedResale: number | null;
  buyerPremiumPercent: number;
  hasReserve: boolean;
  reservePrice: number | null;
  currency: string;
}

export interface CategoryProfile {
  name: string;
  keywords: string[];
  refurbishmentMin: number;
  refurbishmentMax: number;
  holdingMonths: number;
  transportBase: number;
  defaultWeightKg: number;
  liquidityPenalty: number; // 0-25, higher = harder to sell
  resaleRangeMin: number;
  resaleRangeMax: number;
}

export interface AcquisitionCosts {
  bid: number;
  buyerPremium: number;
  taxes: number;
  transport: number;
  refurbishment: number;
  fixedFees: number;
  total: number;
}

export interface ResaleEstimate {
  value: number;
  confidence: 'real' | 'estimated' | 'unknown';
  method: string;
}

export interface KPIs {
  roi: number;
  netProfitMargin: number;
  paybackMonths: number;
  tir: number;
  arbitrageScore: number;
  isGanga: boolean;
  grossProfit: number;
  totalAcquisitionCost: number;
}

export interface RiskProfile {
  score: number;
  level: 'low' | 'medium' | 'high' | 'very-high';
  factors: Record<string, number>;
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
  source: 'nominatim' | 'fallback';
}

export interface AnalysisInput {
  title: string;
  category?: string;
  specs: AssetSpecs;
  location: AssetLocation;
  pricing: PricingInputs;
  lotQuantity?: number;
}

export interface AnalysisResult {
  costs: AcquisitionCosts;
  resale: ResaleEstimate;
  kpis: KPIs;
  risk: RiskProfile;
  categoryDetected: string;
}
```

- [ ] **Step 2: Verify file compiles**

Run: `cd surus-estrategico && npx tsc --noEmit lib/engine/types.ts`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd surus-estrategico && git add lib/engine/types.ts && git commit -m "feat(engine): add core types for financial engine"
```

---

### Task 3: Category Profiles

**Files:**
- Create: `surus-estrategico/lib/engine/categories.ts`

**Why:** All cost calculations (refurbishment, transport, holding, resale, risk) depend on category profiles.

- [ ] **Step 1: Write category profiles**

```typescript
// lib/engine/categories.ts
import { CategoryProfile } from './types';

export const CATEGORY_PROFILES: CategoryProfile[] = [
  {
    name: 'Robótica',
    keywords: ['robot', 'roboter', 'robotic', 'brazo robot', 'robot paletizado', 'robot soldadura', 'kuka', 'abb', 'fanuc', 'kawasaki', 'motoman'],
    refurbishmentMin: 1000,
    refurbishmentMax: 3000,
    holdingMonths: 3,
    transportBase: 300,
    defaultWeightKg: 500,
    liquidityPenalty: 8,
    resaleRangeMin: 15000,
    resaleRangeMax: 80000,
  },
  {
    name: 'CNC / Mecanizado',
    keywords: ['cnc', 'mecanizado', 'bearbeitung', 'machining', 'centro mecanizado', 'bearbeitungszentrum', 'torno', 'dreh', 'lathe', 'torno cnc', 'fräsmaschine', 'fresadora', 'milling'],
    refurbishmentMin: 2000,
    refurbishmentMax: 8000,
    holdingMonths: 4,
    transportBase: 400,
    defaultWeightKg: 3000,
    liquidityPenalty: 5,
    resaleRangeMin: 25000,
    resaleRangeMax: 150000,
  },
  {
    name: 'Prensas / Plegadoras',
    keywords: ['prensa', 'presse', 'press', 'prensa hidráulica', 'plegadora', 'press brake', 'abkant', 'biegemaschine'],
    refurbishmentMin: 5000,
    refurbishmentMax: 20000,
    holdingMonths: 6,
    transportBase: 600,
    defaultWeightKg: 8000,
    liquidityPenalty: 12,
    resaleRangeMin: 20000,
    resaleRangeMax: 120000,
  },
  {
    name: 'Láser',
    keywords: ['laser', 'láser', 'trumpf', 'amada', 'cutting', 'schneid', 'laser de fibra', 'corte por láser', 'bystronic', 'mazak'],
    refurbishmentMin: 3000,
    refurbishmentMax: 10000,
    holdingMonths: 4,
    transportBase: 400,
    defaultWeightKg: 4000,
    liquidityPenalty: 10,
    resaleRangeMin: 40000,
    resaleRangeMax: 250000,
  },
  {
    name: 'Líneas completas / Plantas',
    keywords: ['planta', 'planta de alimentos', 'línea completa', 'linea completa', 'envasado', 'envasadora', 'verpackung', 'abfüllanlage', 'food processing', 'processing line', 'turnkey'],
    refurbishmentMin: 10000,
    refurbishmentMax: 50000,
    holdingMonths: 12,
    transportBase: 1500,
    defaultWeightKg: 15000,
    liquidityPenalty: 20,
    resaleRangeMin: 50000,
    resaleRangeMax: 500000,
  },
  {
    name: 'Inyección',
    keywords: ['inyectora', 'injection', 'spritzguss', 'spritzgieß', 'engel', 'arburg', 'kraussmaffei', 'moldeo', 'molding'],
    refurbishmentMin: 5000,
    refurbishmentMax: 15000,
    holdingMonths: 6,
    transportBase: 600,
    defaultWeightKg: 5000,
    liquidityPenalty: 6,
    resaleRangeMin: 30000,
    resaleRangeMax: 200000,
  },
  {
    name: 'Compresores',
    keywords: ['compresor', 'compressor', 'kompressor', 'druckluft'],
    refurbishmentMin: 500,
    refurbishmentMax: 2000,
    holdingMonths: 3,
    transportBase: 200,
    defaultWeightKg: 800,
    liquidityPenalty: 4,
    resaleRangeMin: 3000,
    resaleRangeMax: 25000,
  },
  {
    name: 'Carretillas',
    keywords: ['carretilla', 'forklift', 'stapler', 'gabelstapler', 'jungheinrich', 'still', 'linde', 'toyota', ' hyster'],
    refurbishmentMin: 1000,
    refurbishmentMax: 5000,
    holdingMonths: 3,
    transportBase: 250,
    defaultWeightKg: 2500,
    liquidityPenalty: 3,
    resaleRangeMin: 5000,
    resaleRangeMax: 40000,
  },
  {
    name: 'Soldadura',
    keywords: ['soldadura', 'welding', 'schweiß', 'schweiss', 'weld', 'schweißen'],
    refurbishmentMin: 500,
    refurbishmentMax: 3000,
    holdingMonths: 3,
    transportBase: 200,
    defaultWeightKg: 600,
    liquidityPenalty: 7,
    resaleRangeMin: 3000,
    resaleRangeMax: 20000,
  },
  {
    name: 'Alimentaria',
    keywords: ['food', 'aliment', 'bakery', 'meat', 'dairy', 'beverage', 'packaging', 'confección', 'filling', 'packing'],
    refurbishmentMin: 3000,
    refurbishmentMax: 15000,
    holdingMonths: 4,
    transportBase: 350,
    defaultWeightKg: 2000,
    liquidityPenalty: 8,
    resaleRangeMin: 15000,
    resaleRangeMax: 120000,
  },
  {
    name: 'Default',
    keywords: [],
    refurbishmentMin: 2000,
    refurbishmentMax: 10000,
    holdingMonths: 6,
    transportBase: 400,
    defaultWeightKg: 2000,
    liquidityPenalty: 10,
    resaleRangeMin: 25000,
    resaleRangeMax: 50000,
  },
];

export function detectCategory(title: string, existingCategory?: string): CategoryProfile {
  const lower = title.toLowerCase();

  // Check existing category first if provided
  if (existingCategory) {
    const match = CATEGORY_PROFILES.find(p =>
      p.name.toLowerCase() === existingCategory.toLowerCase()
    );
    if (match) return match;
  }

  // Match by keyword in title
  for (const profile of CATEGORY_PROFILES) {
    if (profile.keywords.some(k => lower.includes(k.toLowerCase()))) {
      return profile;
    }
  }

  return CATEGORY_PROFILES.find(p => p.name === 'Default')!;
}

export function getCategoryProfile(name: string): CategoryProfile {
  return CATEGORY_PROFILES.find(p => p.name.toLowerCase() === name.toLowerCase())
    || CATEGORY_PROFILES.find(p => p.name === 'Default')!;
}
```

- [ ] **Step 2: Write the test**

Create: `surus-estrategico/__tests__/lib/engine/categories.test.ts`

```typescript
import { detectCategory, getCategoryProfile } from '@/lib/engine/categories';

describe('detectCategory', () => {
  it('detects robotics from KUKA', () => {
    const p = detectCategory('KUKA KR 210 R2700 robot industrial');
    expect(p.name).toBe('Robótica');
  });

  it('detects CNC from machining center', () => {
    const p = detectCategory('DMG MORI DMC 1035 V CNC machining center');
    expect(p.name).toBe('CNC / Mecanizado');
  });

  it('detects laser from Trumpf', () => {
    const p = detectCategory('Trumpf TruLaser 3030 fiber laser');
    expect(p.name).toBe('Láser');
  });

  it('detects food line', () => {
    const p = detectCategory('Complete food processing line for bakery');
    expect(p.name).toBe('Líneas completas / Plantas');
  });

  it('falls back to Default for unknown', () => {
    const p = detectCategory('Random industrial equipment XYZ-99');
    expect(p.name).toBe('Default');
  });

  it('respects existing category if valid', () => {
    const p = detectCategory('Something vague', 'Láser');
    expect(p.name).toBe('Láser');
  });
});

describe('getCategoryProfile', () => {
  it('returns profile by name', () => {
    const p = getCategoryProfile('CNC / Mecanizado');
    expect(p.holdingMonths).toBe(4);
    expect(p.transportBase).toBe(400);
  });
});
```

- [ ] **Step 3: Run test — verify pass**

Run: `cd surus-estrategico && npx jest __tests__/lib/engine/categories.test.ts`
Expected: all 6 tests pass

- [ ] **Step 4: Commit**

```bash
cd surus-estrategico && git add lib/engine/categories.ts __tests__/lib/engine/categories.test.ts && git commit -m "feat(engine): category profiles with keyword detection + tests"
```

---

### Task 4: Pricing Module

**Files:**
- Create: `surus-estrategico/lib/engine/pricing.ts`

**Why:** Calculates acquisition costs: bid, buyer premium, taxes, fixed fees. Replaces the hardcoded `calculateBuyerPremium` and `calculateTaxes` from `lib/calculations.ts`.

- [ ] **Step 1: Write the pricing module**

```typescript
// lib/engine/pricing.ts
import { PricingInputs, AcquisitionCosts } from './types';

export function calculatePricing(p: PricingInputs): AcquisitionCosts {
  // Determine effective bid
  let bid = p.currentBid || p.startingBid || 0;

  // If still no bid, estimate from resale (last resort)
  if (bid <= 0 && p.estimatedResale && p.estimatedResale > 0) {
    bid = Math.round(p.estimatedResale * 0.35);
  }

  const buyerPremium = Math.round(bid * (p.buyerPremiumPercent / 100));
  const taxes = p.currency === 'EUR' ? Math.round((bid + buyerPremium) * 0.21) : 0;
  const fixedFees = 500; // legal/admin

  return {
    bid,
    buyerPremium,
    taxes,
    transport: 0, // filled by transport module
    refurbishment: 0, // filled by refurbishment module
    fixedFees,
    total: bid + buyerPremium + taxes + fixedFees,
  };
}
```

- [ ] **Step 2: Write test**

Create: `surus-estrategico/__tests__/lib/engine/pricing.test.ts`

```typescript
import { calculatePricing } from '@/lib/engine/pricing';

describe('calculatePricing', () => {
  it('calculates costs with current bid', () => {
    const costs = calculatePricing({
      currentBid: 10000,
      startingBid: null,
      estimatedResale: 50000,
      buyerPremiumPercent: 16,
      hasReserve: false,
      reservePrice: null,
      currency: 'EUR',
    });
    expect(costs.bid).toBe(10000);
    expect(costs.buyerPremium).toBe(1600);
    expect(costs.taxes).toBe(2436); // 21% of 11600
    expect(costs.fixedFees).toBe(500);
    expect(costs.total).toBe(14536);
  });

  it('falls back to starting bid if no current bid', () => {
    const costs = calculatePricing({
      currentBid: null,
      startingBid: 5000,
      estimatedResale: null,
      buyerPremiumPercent: 16,
      hasReserve: true,
      reservePrice: 4000,
      currency: 'EUR',
    });
    expect(costs.bid).toBe(5000);
  });

  it('estimates bid from resale if no bids at all', () => {
    const costs = calculatePricing({
      currentBid: null,
      startingBid: null,
      estimatedResale: 40000,
      buyerPremiumPercent: 16,
      hasReserve: false,
      reservePrice: null,
      currency: 'EUR',
    });
    expect(costs.bid).toBe(14000); // 40000 * 0.35
  });
});
```

- [ ] **Step 3: Run test**

Run: `cd surus-estrategico && npx jest __tests__/lib/engine/pricing.test.ts`
Expected: 3 tests pass

- [ ] **Step 4: Commit**

```bash
cd surus-estrategico && git add lib/engine/pricing.ts __tests__/lib/engine/pricing.test.ts && git commit -m "feat(engine): pricing module with bid/premium/taxes + tests"
```

---

### Task 5: Resale Estimation Module

**Files:**
- Create: `surus-estrategico/lib/engine/resale.ts`
- Modify: `surus-estrategico/lib/engine/categories.ts` (already done, no changes needed)

**Why:** Replaces `estimateValueFromTitle` which used deterministic title-length modulo. New system uses category ranges + year/hours/brand/lot adjustments.

- [ ] **Step 1: Write the resale module**

```typescript
// lib/engine/resale.ts
import { AssetSpecs, ResaleEstimate, CategoryProfile } from './types';
import { detectCategory } from './categories';

const PREMIUM_BRANDS = [
  'trumpf', 'amada', 'bystronic', 'mazak', 'dmg', 'mori', 'hermle',
  'kuka', 'abb', 'fanuc', 'motoman', 'yaskawa',
  'engel', 'arburg', 'kraussmaffei',
  'jungheinrich', 'linde', 'still', 'toyota',
];

function hasPremiumBrand(title: string): boolean {
  const lower = title.toLowerCase();
  return PREMIUM_BRANDS.some(b => lower.includes(b));
}

export function estimateResale(
  title: string,
  specs: AssetSpecs,
  existingCategory?: string,
  realPrice?: number | null,
  lotQuantity: number = 1,
): ResaleEstimate {
  // If real price exists, use max(realPrice * 1.5, category estimate)
  const category = detectCategory(title, existingCategory);
  let baseValue = category.resaleRangeMin + (category.resaleRangeMax - category.resaleRangeMin) * 0.5;

  // Year adjustment: +5% per year under 10, -5% per year over 15
  if (specs.year) {
    const age = 2026 - specs.year;
    if (age < 10) {
      baseValue *= 1 + (10 - age) * 0.05;
    } else if (age > 15) {
      baseValue *= 1 - (age - 15) * 0.05;
    }
  }

  // Hours adjustment: -2% per 1000h over 5000h
  if (specs.hours && specs.hours > 5000) {
    const penalty = Math.floor((specs.hours - 5000) / 1000) * 0.02;
    baseValue *= Math.max(0.5, 1 - penalty);
  }

  // Premium brand: +15%
  if (hasPremiumBrand(title)) {
    baseValue *= 1.15;
  }

  // Lot quantity discount: 30% off for multi-lot (not additive)
  if (lotQuantity > 1) {
    baseValue *= 0.7;
  }

  baseValue = Math.round(baseValue);

  // Real price override
  if (realPrice && realPrice > 0) {
    const fromReal = Math.round(realPrice * 1.5);
    if (fromReal > baseValue) {
      return {
        value: fromReal,
        confidence: 'real',
        method: `real_price*1.5 (${realPrice})`,
      };
    }
  }

  return {
    value: baseValue,
    confidence: 'estimated',
    method: `category:${category.name}`,
  };
}
```

- [ ] **Step 2: Write test**

Create: `surus-estrategico/__tests__/lib/engine/resale.test.ts`

```typescript
import { estimateResale } from '@/lib/engine/resale';

describe('estimateResale', () => {
  it('estimates CNC machining center', () => {
    const r = estimateResale('DMG MORI DMC 1035 V', { year: 2018, hours: 3000, condition: 'good', weightKg: 3500 });
    expect(r.value).toBeGreaterThan(40000);
    expect(r.confidence).toBe('estimated');
  });

  it('applies premium brand bonus', () => {
    const withBrand = estimateResale('Trumpf TruLaser 3030', { condition: 'good', weightKg: 4000 });
    const withoutBrand = estimateResale('Generic laser cutter', { condition: 'good', weightKg: 4000 });
    expect(withBrand.value).toBeGreaterThan(withoutBrand.value);
  });

  it('applies year bonus for new equipment', () => {
    const newEq = estimateResale('CNC lathe', { year: 2023, condition: 'good', weightKg: 3000 });
    const oldEq = estimateResale('CNC lathe', { year: 2005, condition: 'good', weightKg: 3000 });
    expect(newEq.value).toBeGreaterThan(oldEq.value);
  });

  it('applies hours penalty', () => {
    const lowHours = estimateResale('CNC lathe', { hours: 2000, condition: 'good', weightKg: 3000 });
    const highHours = estimateResale('CNC lathe', { hours: 12000, condition: 'good', weightKg: 3000 });
    expect(highHours.value).toBeLessThan(lowHours.value);
  });

  it('applies lot discount', () => {
    const single = estimateResale('CNC lathe', { condition: 'good', weightKg: 3000 }, undefined, null, 1);
    const multi = estimateResale('CNC lathe', { condition: 'good', weightKg: 3000 }, undefined, null, 5);
    expect(multi.value).toBeLessThan(single.value);
  });

  it('uses real price when available and higher', () => {
    const r = estimateResale('CNC lathe', { condition: 'good', weightKg: 3000 }, undefined, 50000);
    expect(r.value).toBe(75000); // 50000 * 1.5
    expect(r.confidence).toBe('real');
  });
});
```

- [ ] **Step 3: Run test**

Run: `cd surus-estrategico && npx jest __tests__/lib/engine/resale.test.ts`
Expected: 6 tests pass

- [ ] **Step 4: Commit**

```bash
cd surus-estrategico && git add lib/engine/resale.ts __tests__/lib/engine/resale.test.ts && git commit -m "feat(engine): resale estimation by category with real adjustments + tests"
```

---

### Task 6: Transport Module

**Files:**
- Create: `surus-estrategico/lib/engine/transport.ts`

**Why:** Replaces the hardcoded distance map per country with real Haversine distance from asset to buyer (default Spain center).

- [ ] **Step 1: Write the transport module**

```typescript
// lib/engine/transport.ts

const DEFAULT_BUYER_LAT = 40.4168; // Madrid
const DEFAULT_BUYER_LNG = -3.7038;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function calculateTransport(
  weightKg: number,
  assetLat?: number,
  assetLng?: number,
  transportBase: number = 400,
): number {
  const lat = assetLat ?? 50.0;
  const lng = assetLng ?? 10.0;
  const distanceKm = haversineKm(lat, lng, DEFAULT_BUYER_LAT, DEFAULT_BUYER_LNG);

  const weightCost = Math.round(weightKg * 0.001); // €0.001 per kg
  const distanceCost = Math.round(distanceKm * 0.5); // €0.50 per km
  const tolls = distanceKm > 1000 ? 200 : 0;

  return Math.round(transportBase + weightCost + distanceCost + tolls);
}
```

- [ ] **Step 2: Write test**

Create: `surus-estrategico/__tests__/lib/engine/transport.test.ts`

```typescript
import { haversineKm, calculateTransport } from '@/lib/engine/transport';

describe('haversineKm', () => {
  it('calculates Madrid to Berlin ~2300km', () => {
    expect(haversineKm(40.4168, -3.7038, 52.52, 13.405)).toBeGreaterThan(2200);
    expect(haversineKm(40.4168, -3.7038, 52.52, 13.405)).toBeLessThan(2500);
  });

  it('calculates Madrid to Paris ~1050km', () => {
    expect(haversineKm(40.4168, -3.7038, 48.8566, 2.3522)).toBeGreaterThan(1000);
    expect(haversineKm(40.4168, -3.7038, 48.8566, 2.3522)).toBeLessThan(1100);
  });
});

describe('calculateTransport', () => {
  it('includes base + weight + distance', () => {
    const cost = calculateTransport(5000, 52.52, 13.405, 400); // Berlin
    // base 400 + weight 5 + distance ~1150 + tolls 200 = ~1755
    expect(cost).toBeGreaterThan(1600);
    expect(cost).toBeLessThan(1900);
  });

  it('adds tolls for >1000km', () => {
    const far = calculateTransport(2000, 52.52, 13.405, 400);
    const near = calculateTransport(2000, 40.4, -3.7, 400);
    expect(far).toBeGreaterThan(near + 150); // far has tolls
  });
});
```

- [ ] **Step 3: Run test**

Run: `cd surus-estrategico && npx jest __tests__/lib/engine/transport.test.ts`
Expected: 4 tests pass

- [ ] **Step 4: Commit**

```bash
cd surus-estrategico && git add lib/engine/transport.ts __tests__/lib/engine/transport.test.ts && git commit -m "feat(engine): transport with haversine distance + weight + tolls + tests"
```

---

### Task 7: Refurbishment Module

**Files:**
- Create: `surus-estrategico/lib/engine/refurbishment.ts`

**Why:** Replaces the flat €2k/€5k/€12k/€25k by condition with category-aware ranges + hours/year adjustments.

- [ ] **Step 1: Write the refurbishment module**

```typescript
// lib/engine/refurbishment.ts
import { AssetSpecs, Condition, CategoryProfile } from './types';

const CONDITION_MULTIPLIER: Record<Condition, number> = {
  excellent: 0.20,
  good: 0.50,
  fair: 0.80,
  poor: 1.00,
  unknown: 0.65,
};

export function calculateRefurbishment(
  specs: AssetSpecs,
  profile: CategoryProfile,
): number {
  const range = profile.refurbishmentMax - profile.refurbishmentMin;
  const base = profile.refurbishmentMin + range * CONDITION_MULTIPLIER[specs.condition];

  let adjusted = base;

  // Hours penalty: >10,000h = +20%
  if (specs.hours && specs.hours > 10000) {
    adjusted *= 1.20;
  }

  // Year penalty: <2000 = +30%
  if (specs.year && specs.year < 2000) {
    adjusted *= 1.30;
  }

  return Math.round(adjusted);
}
```

- [ ] **Step 2: Write test**

Create: `surus-estrategico/__tests__/lib/engine/refurbishment.test.ts`

```typescript
import { calculateRefurbishment } from '@/lib/engine/refurbishment';
import { getCategoryProfile } from '@/lib/engine/categories';

describe('calculateRefurbishment', () => {
  const cnc = getCategoryProfile('CNC / Mecanizado');

  it('excellent CNC = 20% of range', () => {
    const cost = calculateRefurbishment(
      { condition: 'excellent', year: 2020, hours: 1000, weightKg: 3000 },
      cnc,
    );
    expect(cost).toBe(3400); // 2000 + 6000*0.2 = 3200, rounded
    expect(cost).toBeGreaterThanOrEqual(3000);
    expect(cost).toBeLessThanOrEqual(4000);
  });

  it('poor CNC = 100% of range', () => {
    const cost = calculateRefurbishment(
      { condition: 'poor', year: 1995, hours: 15000, weightKg: 3000 },
      cnc,
    );
    expect(cost).toBeGreaterThan(10000); // 8000 * 1.2 * 1.3 = 12480
  });

  it('hours > 10000 adds 20%', () => {
    const lowHours = calculateRefurbishment({ condition: 'good', year: 2015, hours: 5000, weightKg: 3000 }, cnc);
    const highHours = calculateRefurbishment({ condition: 'good', year: 2015, hours: 12000, weightKg: 3000 }, cnc);
    expect(highHours).toBeGreaterThan(lowHours);
  });
});
```

- [ ] **Step 3: Run test**

Run: `cd surus-estrategico && npx jest __tests__/lib/engine/refurbishment.test.ts`
Expected: 3 tests pass

- [ ] **Step 4: Commit**

```bash
cd surus-estrategico && git add lib/engine/refurbishment.ts __tests__/lib/engine/refurbishment.test.ts && git commit -m "feat(engine): refurbishment by category + condition + hours/year + tests"
```

---

### Task 8: KPI Module (Correct Formulas)

**Files:**
- Create: `surus-estrategico/lib/engine/kpi.ts`

**Why:** Replaces the mathematically broken TIR `(1+ROI/100)^(12/payback)-1` and circular Payback `totalCost/(grossProfit/12)` with correct formulas. This is the heart of the engine.

- [ ] **Step 1: Write the KPI module**

```typescript
// lib/engine/kpi.ts
import { KPIs, AcquisitionCosts, ResaleEstimate, CategoryProfile } from './types';

export function calculateKPIs(
  costs: AcquisitionCosts,
  resale: ResaleEstimate,
  profile: CategoryProfile,
): KPIs {
  const totalCost = costs.total + costs.transport + costs.refurbishment;
  const grossProfit = resale.value - totalCost;
  const roi = totalCost > 0 ? (grossProfit / totalCost) * 100 : 0;
  const netProfitMargin = resale.value > 0 ? (grossProfit / resale.value) * 100 : 0;
  const arbitrageScore = totalCost > 0 ? resale.value / totalCost : 0;

  // Correct Payback: totalCost / (grossProfit / holdingMonths)
  const paybackMonths = grossProfit > 0
    ? Math.ceil(totalCost / (grossProfit / profile.holdingMonths))
    : 999;

  // Correct TIR: annualized compound return over holding period
  // If payback > holding, we won't recover in holding period → TIR = 0
  let tir = 0;
  if (grossProfit > 0 && paybackMonths <= profile.holdingMonths) {
    tir = ((Math.pow(resale.value / totalCost, 12 / profile.holdingMonths) - 1)) * 100;
  }

  return {
    roi: Math.round(roi * 10) / 10,
    netProfitMargin: Math.round(netProfitMargin * 10) / 10,
    paybackMonths: Math.min(paybackMonths, 999),
    tir: Math.round(tir * 10) / 10,
    arbitrageScore: Math.round(arbitrageScore * 100) / 100,
    isGanga: arbitrageScore >= 1.8,
    grossProfit: Math.round(grossProfit),
    totalAcquisitionCost: Math.round(totalCost),
  };
}
```

- [ ] **Step 2: Write test**

Create: `surus-estrategico/__tests__/lib/engine/kpi.test.ts`

```typescript
import { calculateKPIs } from '@/lib/engine/kpi';
import { AcquisitionCosts, ResaleEstimate, CategoryProfile } from '@/lib/engine/types';

const mockProfile: CategoryProfile = {
  name: 'CNC',
  keywords: [],
  refurbishmentMin: 2000,
  refurbishmentMax: 8000,
  holdingMonths: 4,
  transportBase: 400,
  defaultWeightKg: 3000,
  liquidityPenalty: 5,
  resaleRangeMin: 25000,
  resaleRangeMax: 150000,
};

function makeCosts(bid: number): AcquisitionCosts {
  return {
    bid,
    buyerPremium: Math.round(bid * 0.16),
    taxes: Math.round((bid + bid * 0.16) * 0.21),
    transport: 600,
    refurbishment: 5000,
    fixedFees: 500,
    total: bid + Math.round(bid * 0.16) + Math.round((bid + bid * 0.16) * 0.21) + 500,
  };
}

describe('calculateKPIs', () => {
  it('calculates ROI correctly', () => {
    const costs = makeCosts(10000);
    const resale: ResaleEstimate = { value: 50000, confidence: 'estimated', method: 'test' };
    const kpis = calculateKPIs(costs, resale, mockProfile);
    const totalCost = costs.total + costs.transport + costs.refurbishment;
    const expectedRoi = ((50000 - totalCost) / totalCost) * 100;
    expect(kpis.roi).toBeCloseTo(expectedRoi, 1);
  });

  it('marks ganga when arbitrageScore >= 1.8', () => {
    const costs = makeCosts(5000);
    const resale: ResaleEstimate = { value: 50000, confidence: 'estimated', method: 'test' };
    const kpis = calculateKPIs(costs, resale, mockProfile);
    expect(kpis.isGanga).toBe(true);
    expect(kpis.arbitrageScore).toBeGreaterThanOrEqual(1.8);
  });

  it('does NOT mark ganga when arbitrageScore < 1.8', () => {
    const costs = makeCosts(30000);
    const resale: ResaleEstimate = { value: 50000, confidence: 'estimated', method: 'test' };
    const kpis = calculateKPIs(costs, resale, mockProfile);
    expect(kpis.isGanga).toBe(false);
  });

  it('payback is finite when profitable', () => {
    const costs = makeCosts(10000);
    const resale: ResaleEstimate = { value: 50000, confidence: 'estimated', method: 'test' };
    const kpis = calculateKPIs(costs, resale, mockProfile);
    expect(kpis.paybackMonths).toBeLessThan(999);
    expect(kpis.paybackMonths).toBeGreaterThan(0);
  });

  it('payback is 999 when unprofitable', () => {
    const costs = makeCosts(60000);
    const resale: ResaleEstimate = { value: 50000, confidence: 'estimated', method: 'test' };
    const kpis = calculateKPIs(costs, resale, mockProfile);
    expect(kpis.paybackMonths).toBe(999);
  });

  it('TIR is 0 when payback exceeds holding months', () => {
    const costs = makeCosts(50000);
    const resale: ResaleEstimate = { value: 50000, confidence: 'estimated', method: 'test' };
    const kpis = calculateKPIs(costs, resale, mockProfile);
    expect(kpis.tir).toBe(0);
  });

  it('TIR is positive when profitable within holding period', () => {
    const costs = makeCosts(10000);
    const resale: ResaleEstimate = { value: 50000, confidence: 'estimated', method: 'test' };
    const kpis = calculateKPIs(costs, resale, mockProfile);
    expect(kpis.tir).toBeGreaterThan(0);
    expect(kpis.tir).toBeLessThan(500); // sanity: not the absurd 400%+
  });

  it('TIR formula is not the broken old one', () => {
    const costs = makeCosts(10000);
    const resale: ResaleEstimate = { value: 50000, confidence: 'estimated', method: 'test' };
    const kpis = calculateKPIs(costs, resale, mockProfile);
    // Old broken formula would give >400% for these numbers
    expect(kpis.tir).toBeLessThan(200);
  });
});
```

- [ ] **Step 3: Run test**

Run: `cd surus-estrategico && npx jest __tests__/lib/engine/kpi.test.ts`
Expected: 8 tests pass

- [ ] **Step 4: Commit**

```bash
cd surus-estrategico && git add lib/engine/kpi.ts __tests__/lib/engine/kpi.test.ts && git commit -m "feat(engine): correct KPI formulas (ROI, TIR, Payback, arbitrage) + tests"
```

---

### Task 9: Risk Score Module

**Files:**
- Create: `surus-estrategico/lib/engine/risk.ts`

**Why:** Replaces the arbitrary base-20 + fixed bonuses with a weighted 0-100 system based on year, hours, liquidity, condition, reserve, and brand.

- [ ] **Step 1: Write the risk module**

```typescript
// lib/engine/risk.ts
import { AssetSpecs, Condition, CategoryProfile, RiskProfile } from './types';

const PREMIUM_BRANDS = [
  'trumpf', 'amada', 'bystronic', 'mazak', 'dmg', 'mori', 'hermle',
  'kuka', 'abb', 'fanuc', 'motoman', 'yaskawa',
  'engel', 'arburg', 'kraussmaffei',
  'jungheinrich', 'linde', 'still', 'toyota',
];

function hasPremiumBrand(title: string): boolean {
  const lower = title.toLowerCase();
  return PREMIUM_BRANDS.some(b => lower.includes(b));
}

const CONDITION_SCORE: Record<Condition, number> = {
  excellent: 0,
  good: 5,
  fair: 12,
  poor: 20,
  unknown: 8,
};

export function calculateRisk(
  title: string,
  specs: AssetSpecs,
  profile: CategoryProfile,
  hasReserve: boolean,
  reserveKnown: boolean,
): RiskProfile {
  // 1. Age (25%): 2 points per decade, max 25
  let ageScore = 0;
  if (specs.year) {
    const decades = Math.floor((2026 - specs.year) / 10);
    ageScore = Math.min(decades * 2, 25);
  }

  // 2. Hours (25%): min(hours/1000, 25). 0 hours = 0 (unknown = low risk)
  let hoursScore = 0;
  if (specs.hours && specs.hours > 0) {
    hoursScore = Math.min(specs.hours / 1000, 25);
  }

  // 3. Liquidity (20%): from category profile
  const liquidityScore = profile.liquidityPenalty;

  // 4. Condition (15%)
  const conditionScore = CONDITION_SCORE[specs.condition];

  // 5. Reserve (10%)
  let reserveScore = 0;
  if (!reserveKnown) {
    reserveScore = 3;
  } else if (hasReserve) {
    reserveScore = 5;
  }

  // 6. Brand (5%): premium brand reduces risk
  const brandScore = hasPremiumBrand(title) ? -5 : 0;

  const total = ageScore + hoursScore + liquidityScore + conditionScore + reserveScore + brandScore;
  const clamped = Math.max(0, Math.min(100, total));

  let level: RiskProfile['level'];
  if (clamped <= 30) level = 'low';
  else if (clamped <= 55) level = 'medium';
  else if (clamped <= 75) level = 'high';
  else level = 'very-high';

  return {
    score: Math.round(clamped),
    level,
    factors: {
      age: ageScore,
      hours: hoursScore,
      liquidity: liquidityScore,
      condition: conditionScore,
      reserve: reserveScore,
      brand: brandScore,
    },
  };
}
```

- [ ] **Step 2: Write test**

Create: `surus-estrategico/__tests__/lib/engine/risk.test.ts`

```typescript
import { calculateRisk } from '@/lib/engine/risk';
import { CategoryProfile } from '@/lib/engine/types';

const mockProfile: CategoryProfile = {
  name: 'CNC',
  keywords: [],
  refurbishmentMin: 2000,
  refurbishmentMax: 8000,
  holdingMonths: 4,
  transportBase: 400,
  defaultWeightKg: 3000,
  liquidityPenalty: 5,
  resaleRangeMin: 25000,
  resaleRangeMax: 150000,
};

describe('calculateRisk', () => {
  it('low risk for new, low-hours, excellent, no reserve, premium brand', () => {
    const r = calculateRisk(
      'Trumpf CNC machining center',
      { year: 2022, hours: 2000, condition: 'excellent', weightKg: 3000 },
      mockProfile,
      false,
      true,
    );
    expect(r.score).toBeLessThanOrEqual(30);
    expect(r.level).toBe('low');
  });

  it('high risk for old, high-hours, poor, with reserve', () => {
    const r = calculateRisk(
      'Old press brake',
      { year: 1985, hours: 25000, condition: 'poor', weightKg: 8000 },
      mockProfile,
      true,
      true,
    );
    expect(r.score).toBeGreaterThan(55);
  });

  it('premium brand reduces score by 5', () => {
    const withBrand = calculateRisk(
      'Trumpf laser',
      { condition: 'good', weightKg: 4000 },
      mockProfile,
      false,
      true,
    );
    const withoutBrand = calculateRisk(
      'Generic laser',
      { condition: 'good', weightKg: 4000 },
      mockProfile,
      false,
      true,
    );
    expect(withBrand.score).toBe(withoutBrand.score - 5);
  });

  it('unknown reserve adds 3 points', () => {
    const known = calculateRisk('CNC', { condition: 'good', weightKg: 3000 }, mockProfile, false, true);
    const unknown = calculateRisk('CNC', { condition: 'good', weightKg: 3000 }, mockProfile, false, false);
    expect(unknown.score).toBe(known.score + 3);
  });

  it('0 hours = 0 risk points (unknown is low risk)', () => {
    const r = calculateRisk('CNC', { condition: 'good', weightKg: 3000 }, mockProfile, false, true);
    expect(r.factors.hours).toBe(0);
  });
});
```

- [ ] **Step 3: Run test**

Run: `cd surus-estrategico && npx jest __tests__/lib/engine/risk.test.ts`
Expected: 5 tests pass

- [ ] **Step 4: Commit**

```bash
cd surus-estrategico && git add lib/engine/risk.ts __tests__/lib/engine/risk.test.ts && git commit -m "feat(engine): weighted risk score (0-100) based on real specs + tests"
```

---

### Task 10: Geocoding Module

**Files:**
- Create: `surus-estrategico/lib/engine/geocode.ts`

**Why:** Replaces the fake `COUNTRY_MAP` centroids with Nominatim real geocoding + fallback dispersal.

- [ ] **Step 1: Write the geocode module**

```typescript
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
```

- [ ] **Step 2: Write test**

Create: `surus-estrategico/__tests__/lib/engine/geocode.test.ts`

```typescript
import { geocodeLocation } from '@/lib/engine/geocode';

describe('geocodeLocation', () => {
  it('returns fallback for empty location', async () => {
    const result = await geocodeLocation('', 'DE');
    expect(result.source).toBe('fallback');
    expect(result.lat).toBeGreaterThan(40);
    expect(result.lat).toBeLessThan(60);
  });

  it('returns fallback for unknown country', async () => {
    const result = await geocodeLocation('Some City', 'XX');
    expect(result.source).toBe('fallback');
  });
});
```

- [ ] **Step 3: Run test**

Run: `cd surus-estrategico && npx jest __tests__/lib/engine/geocode.test.ts`
Expected: 2 tests pass (they test fallback, not live Nominatim)

- [ ] **Step 4: Commit**

```bash
cd surus-estrategico && git add lib/engine/geocode.ts __tests__/lib/engine/geocode.test.ts && git commit -m "feat(engine): Nominatim geocoding with fallback dispersal + rate limit + tests"
```

---

### Task 11: Engine Entry Point (`index.ts`)

**Files:**
- Create: `surus-estrategico/lib/engine/index.ts`

**Why:** Single import for consumers. The scrapers and dashboard will call `analyzeAsset()` instead of `calculateKPIs()` directly.

- [ ] **Step 1: Write the entry point**

```typescript
// lib/engine/index.ts
export * from './types';
export * from './categories';
export * from './pricing';
export * from './resale';
export * from './transport';
export * from './refurbishment';
export * from './kpi';
export * from './risk';
export * from './geocode';

import { AnalysisInput, AnalysisResult } from './types';
import { detectCategory } from './categories';
import { calculatePricing } from './pricing';
import { estimateResale } from './resale';
import { calculateTransport } from './transport';
import { calculateRefurbishment } from './refurbishment';
import { calculateKPIs } from './kpi';
import { calculateRisk } from './risk';

export function analyzeAsset(input: AnalysisInput): AnalysisResult {
  const category = detectCategory(input.title, input.category);

  const resale = estimateResale(
    input.title,
    input.specs,
    category.name,
    input.pricing.estimatedResale,
    input.lotQuantity,
  );

  const costs = calculatePricing(input.pricing);
  costs.transport = calculateTransport(
    input.specs.weightKg || category.defaultWeightKg,
    input.location.lat,
    input.location.lng,
    category.transportBase,
  );
  costs.refurbishment = calculateRefurbishment(input.specs, category);
  costs.total = costs.bid + costs.buyerPremium + costs.taxes + costs.transport + costs.refurbishment + costs.fixedFees;

  const kpis = calculateKPIs(costs, resale, category);

  const risk = calculateRisk(
    input.title,
    input.specs,
    category,
    input.pricing.hasReserve,
    input.pricing.reservePrice !== null,
  );

  return {
    costs,
    resale,
    kpis,
    risk,
    categoryDetected: category.name,
  };
}
```

- [ ] **Step 2: Write integration test**

Create: `surus-estrategico/__tests__/lib/engine/index.test.ts`

```typescript
import { analyzeAsset } from '@/lib/engine';
import { AnalysisInput } from '@/lib/engine/types';

const mockInput: AnalysisInput = {
  title: 'Trumpf TruLaser 3030 fiber laser cutting machine',
  category: 'Láser',
  specs: { year: 2018, hours: 4500, condition: 'good', weightKg: 4500, make: 'Trumpf' },
  location: { city: 'Stuttgart', countryCode: 'DE', lat: 48.7758, lng: 9.1829 },
  pricing: { currentBid: 35000, startingBid: null, estimatedResale: null, buyerPremiumPercent: 16, hasReserve: false, reservePrice: null, currency: 'EUR' },
};

describe('analyzeAsset', () => {
  it('detects laser category', () => {
    const result = analyzeAsset(mockInput);
    expect(result.categoryDetected).toBe('Láser');
  });

  it('produces positive ROI for a good laser deal', () => {
    const result = analyzeAsset(mockInput);
    expect(result.kpis.roi).toBeGreaterThan(0);
    expect(result.resale.value).toBeGreaterThan(40000);
  });

  it('produces realistic TIR (not >400%)', () => {
    const result = analyzeAsset(mockInput);
    expect(result.kpis.tir).toBeGreaterThanOrEqual(0);
    expect(result.kpis.tir).toBeLessThan(200);
  });

  it('produces finite payback when profitable', () => {
    const result = analyzeAsset(mockInput);
    expect(result.kpis.paybackMonths).toBeLessThan(999);
  });

  it('calculates transport with real distance', () => {
    const result = analyzeAsset(mockInput);
    expect(result.costs.transport).toBeGreaterThan(400); // Stuttgart to Madrid is ~1500km
  });

  it('calculates risk with brand discount', () => {
    const result = analyzeAsset(mockInput);
    expect(result.risk.factors.brand).toBe(-5);
    expect(result.risk.score).toBeLessThan(50);
  });
});
```

- [ ] **Step 3: Run all engine tests**

Run: `cd surus-estrategico && npx jest __tests__/lib/engine/`
Expected: ALL tests pass (categories 6 + pricing 3 + resale 6 + transport 4 + refurbishment 3 + kpi 8 + risk 5 + geocode 2 + index 6 = **43 tests pass**)

- [ ] **Step 4: Commit**

```bash
cd surus-estrategico && git add lib/engine/index.ts __tests__/lib/engine/index.test.ts && git commit -m "feat(engine): single analyzeAsset() entry point + integration tests"
```

---

## Self-Review Checklist

| Spec Requirement | Task | Status |
|------------------|------|--------|
| Correct TIR formula | Task 8 (kpi.ts) | ✅ |
| Correct Payback formula | Task 8 (kpi.ts) | ✅ |
| ROI unchanged | Task 8 (kpi.ts) | ✅ |
| Arbitrage threshold >= 1.8 for ganga | Task 8 (kpi.ts) | ✅ |
| Category cost profiles | Task 3 (categories.ts) | ✅ |
| Refurbishment by condition + hours + year | Task 7 (refurbishment.ts) | ✅ |
| Transport by weight + Haversine distance + tolls | Task 6 (transport.ts) | ✅ |
| Risk score weighted 0-100 with real factors | Task 9 (risk.ts) | ✅ |
| Resale by category + year/hours/brand/lot adjustments | Task 5 (resale.ts) | ✅ |
| Real price override (price * 1.5) | Task 5 (resale.ts) | ✅ |
| Nominatim geocoding + fallback | Task 10 (geocode.ts) | ✅ |
| Rate limiting 1.1s | Task 10 (geocode.ts) | ✅ |
| Single `analyzeAsset()` entry point | Task 11 (index.ts) | ✅ |
| Unit tests for all modules | Tasks 3-11 | ✅ |

**Placeholder scan:** No "TBD", "TODO", "implement later", or "add error handling" found. Every step has complete code.

**Type consistency check:**
- `Condition` type used consistently across `types.ts`, `refurbishment.ts`, `risk.ts`
- `CategoryProfile` used in `categories.ts`, `refurbishment.ts`, `risk.ts`, `index.ts`
- `AcquisitionCosts` built in `pricing.ts`, then enriched in `index.ts` with transport/refurbishment
- `KPIs` return shape matches spec

**Gaps:** None. All 13 spec requirements for the financial engine are covered.

---

## Execution Handoff

**Plan complete.** Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using `executing-plans`, batch execution with checkpoints.

**Which approach?**
