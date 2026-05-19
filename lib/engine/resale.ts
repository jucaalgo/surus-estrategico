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
