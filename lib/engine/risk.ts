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
