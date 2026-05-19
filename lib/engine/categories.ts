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
