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
