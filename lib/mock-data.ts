import { Asset, PlatformInfo, SmartPreset } from './types';
import { calculateKPIs } from './calculations';

// --- Platforms ---

export const PLATFORMS: PlatformInfo[] = [
  { id: 'surplex', name: 'Surplex', country: 'DE', trustScore: 9, active: true },
  { id: 'troostwijk', name: 'Troostwijk Auctions', country: 'NL', trustScore: 9, active: true },
  { id: 'netbid', name: 'NetBid', country: 'DE', trustScore: 7, active: true },
  { id: 'goindustry', name: 'GoIndustry DoveBid', country: 'UK', trustScore: 8, active: true },
  { id: 'macon', name: 'Macon Auctions', country: 'IT', trustScore: 7, active: true },
  { id: 'hilmann', name: 'Hilmann Binder', country: 'DE', trustScore: 6, active: true },
  { id: 'irsauction', name: 'IRS Auctions', country: 'DE', trustScore: 8, active: true },
  { id: 'scaauction', name: 'SCA Auctions', country: 'US', trustScore: 8, active: false },
  { id: 'industrial-auctions', name: 'Industrial Auctions', country: 'NL', trustScore: 7, active: true },
  { id: 'hibid', name: 'BidSpotter', country: 'US', trustScore: 6, active: true },
  { id: 'euro-auctions', name: 'Euro Auctions', country: 'UK', trustScore: 7, active: true },
];

// --- Raw asset definitions (KPIs calculated below) ---

const DAY = 86400000;

function futureDate(daysFromNow: number): string {
  return new Date(Date.now() + daysFromNow * DAY).toISOString();
}

const RAW_ASSETS: Omit<Asset, 'kpis'>[] = [
  {
    id: 'kuka-kr-210-001',
    title: 'KUKA KR 210 R2700 Ultra — Robot Industrial 6 Ejes',
    description: 'Robot industrial KUKA KR 210 con controlador KRC4, brazo de 2700mm de alcance. Ideal para soldadura, manipulación de piezas pesadas. Incluye cableado, teach pendant. Desinstalación profesional disponible.',
    category: 'Robótica Industrial',
    subcategory: 'Brazos Robot',
    platform: PLATFORMS[0], // Surplex
    pricing: {
      currentBid: 18500,
      currency: 'EUR',
      estimatedResale: 42000,
      buyerPremiumPercent: 16,
      reservePrice: null,
      hasReserve: false,
      startingBid: 5000,
    },
    location: {
      city: 'Stuttgart',
      region: 'Baden-Württemberg',
      country: 'Alemania',
      countryCode: 'DE',
      lat: 48.7758,
      lng: 9.1829,
      siteType: 'Fábrica cerrada',
    },
    timing: { auctionEnd: futureDate(3), timeRemainingMs: 0, inspectionAvailable: true },
    specs: { make: 'KUKA', model: 'KR 210 R2700 Ultra', year: 2016, condition: 'good', hours: 18200, power: '210 kg payload', weight: 1100 },
    sourceUrl: 'https://surplex.com/es/a/kuka-kr-210.html',
    imageUrl: '/assets/placeholder-robot.svg',
    source: 'mock',
  },
  {
    id: 'cnc-dmg-mori-002',
    title: 'DMG MORI NHX 4000 — Centro de Mecanizado Horizontal',
    description: 'Centro de mecanizado horizontal DMG MORI NHX 4000, husillo 12000 rpm, magazine 60 herramientas, mesa 400mm. Mantenimiento anual al día. Disponible inspección en planta activa.',
    category: 'Mecanizado CNC',
    subcategory: 'Centros de Mecanizado',
    platform: PLATFORMS[1], // Troostwijk
    pricing: {
      currentBid: 32000,
      currency: 'EUR',
      estimatedResale: 68000,
      buyerPremiumPercent: 16,
      reservePrice: 28000,
      hasReserve: true,
      startingBid: 15000,
    },
    location: {
      city: 'Eindhoven',
      region: 'North Brabant',
      country: 'Países Bajos',
      countryCode: 'NL',
      lat: 51.4416,
      lng: 5.4697,
      siteType: 'Planta industrial activa',
    },
    timing: { auctionEnd: futureDate(5), timeRemainingMs: 0, inspectionAvailable: true },
    specs: { make: 'DMG MORI', model: 'NHX 4000', year: 2018, condition: 'excellent', hours: 8400, power: '30 kW', weight: 8500 },
    sourceUrl: 'https://troostwijkauctions.com/es/dmg-mori-nhx4000',
    imageUrl: '/assets/placeholder-cnc.svg',
    source: 'mock',
  },
  {
    id: 'injection-krauss-003',
    title: 'KraussMaffei PX 320 — Inyectora de Plástico 320t',
    description: 'Máquina inyectora KraussMaffei PX 320 con cierre 3200kN, unidad de inyección de 2000cm³, control MC6. Procesamiento de PP, PE, ABS. Incluye moldes auxiliares y robot de extracción.',
    category: 'Plástico y Caucho',
    subcategory: 'Inyectoras',
    platform: PLATFORMS[0], // Surplex
    pricing: {
      currentBid: 22000,
      currency: 'EUR',
      estimatedResale: 48000,
      buyerPremiumPercent: 16,
      reservePrice: null,
      hasReserve: false,
      startingBid: 8000,
    },
    location: {
      city: 'Múnich',
      region: 'Baviera',
      country: 'Alemania',
      countryCode: 'DE',
      lat: 48.1351,
      lng: 11.5820,
      siteType: 'Fábrica cerrada',
    },
    timing: { auctionEnd: futureDate(2), timeRemainingMs: 0, inspectionAvailable: true },
    specs: { make: 'KraussMaffei', model: 'PX 320', year: 2014, condition: 'good', hours: 28500, power: '90 kW', weight: 12000 },
    sourceUrl: 'https://surplex.com/es/a/kraussmaffei-px320.html',
    imageUrl: '/assets/placeholder-injection.svg',
    source: 'mock',
  },
  {
    id: 'hydraulic-press-004',
    title: 'Schuler PHS 1600 — Prensa Hidráulica 1600t',
    description: 'Prensa hidráulica Schuler de 1600 toneladas, mesa 2500x1800mm, carrera 800mm. Sistema hidráulico reconstruido en 2022. Ideal para conformado de chapa gruesa y matriceria pesada.',
    category: 'Conformado de Chapa',
    subcategory: 'Prensas Hidráulicas',
    platform: PLATFORMS[5], // Hilmann
    pricing: {
      currentBid: 28000,
      currency: 'EUR',
      estimatedResale: 55000,
      buyerPremiumPercent: 16,
      reservePrice: 22000,
      hasReserve: true,
      startingBid: 10000,
    },
    location: {
      city: 'Leipzig',
      region: 'Sajonia',
      country: 'Alemania',
      countryCode: 'DE',
      lat: 51.3397,
      lng: 12.3731,
      siteType: 'Nave industrial',
    },
    timing: { auctionEnd: futureDate(7), timeRemainingMs: 0, inspectionAvailable: true },
    specs: { make: 'Schuler', model: 'PHS 1600', year: 2009, condition: 'fair', hours: 42000, power: '220 kW', weight: 28000 },
    sourceUrl: 'https://hilmann-binder.de/schuler-phs1600',
    imageUrl: '/assets/placeholder-press.svg',
    source: 'mock',
  },
  {
    id: 'fanuc-robot-005',
    title: 'FANUC R-2000iC/210F — Robot de Soldadura',
    description: 'Robot FANUC R-2000iC con controlador R-30iB Plus, antorcha de soldadura Lincoln Electric integrada. Alcance 2680mm, payload 210kg. Incluye software de soldadura arco pulsado.',
    category: 'Robótica Industrial',
    subcategory: 'Robots de Soldadura',
    platform: PLATFORMS[3], // GoIndustry
    pricing: {
      currentBid: 14000,
      currency: 'GBP',
      estimatedResale: 38000,
      buyerPremiumPercent: 16,
      reservePrice: null,
      hasReserve: false,
      startingBid: 5000,
    },
    location: {
      city: 'Birmingham',
      region: 'West Midlands',
      country: 'Reino Unido',
      countryCode: 'UK',
      lat: 52.4862,
      lng: -1.8904,
      siteType: 'Planta cerrada',
    },
    timing: { auctionEnd: futureDate(4), timeRemainingMs: 0, inspectionAvailable: false },
    specs: { make: 'FANUC', model: 'R-2000iC/210F', year: 2017, condition: 'good', hours: 14500, power: '210 kg payload', weight: 1350 },
    sourceUrl: 'https://goindustry.com/fanuc-r2000ic',
    imageUrl: '/assets/placeholder-fanuc.svg',
    source: 'mock',
  },
  {
    id: 'lathe-mazak-006',
    title: 'MAZAK QT-250 — Torno CNC de Alta Precisión',
    description: 'Torno CNC MAZAK QT-250 con control Mazatrol SmoothX, plato 250mm, paso por husillo 65mm. Mecanizado de alta precisión con tolerancias de 0.005mm. Incluye portaherramientas y contrapunta.',
    category: 'Mecanizado CNC',
    subcategory: 'Tornos CNC',
    platform: PLATFORMS[6], // IRS
    pricing: {
      currentBid: 9500,
      currency: 'EUR',
      estimatedResale: 25000,
      buyerPremiumPercent: 16,
      reservePrice: null,
      hasReserve: false,
      startingBid: 3000,
    },
    location: {
      city: 'Frankfurt',
      region: 'Hesse',
      country: 'Alemania',
      countryCode: 'DE',
      lat: 50.1109,
      lng: 8.6821,
      siteType: 'Taller de mecanizado',
    },
    timing: { auctionEnd: futureDate(1), timeRemainingMs: 0, inspectionAvailable: true },
    specs: { make: 'MAZAK', model: 'QT-250', year: 2012, condition: 'fair', hours: 32000, power: '22 kW', weight: 4500 },
    sourceUrl: 'https://irs-auctions.de/mazak-qt250',
    imageUrl: '/assets/placeholder-lathe.svg',
    source: 'mock',
  },
  {
    id: 'abb-robot-007',
    title: 'ABB IRB 6700-235/2.65 — Robot Industrial de Paletizado',
    description: 'Robot ABB IRB 6700 con controlador OmniCore, payload 235kg, alcance 2650mm. Configuración para paletizado con gripper neumático. Software RobotStudio incluido. Bajo uso: solo 6200 horas.',
    category: 'Robótica Industrial',
    subcategory: 'Robots de Paletizado',
    platform: PLATFORMS[1], // Troostwijk
    pricing: {
      currentBid: 21000,
      currency: 'EUR',
      estimatedResale: 45000,
      buyerPremiumPercent: 16,
      reservePrice: 18000,
      hasReserve: true,
      startingBid: 10000,
    },
    location: {
      city: 'Ámsterdam',
      region: 'Holanda Septentrional',
      country: 'Países Bajos',
      countryCode: 'NL',
      lat: 52.3676,
      lng: 4.9041,
      siteType: 'Centro logístico',
    },
    timing: { auctionEnd: futureDate(6), timeRemainingMs: 0, inspectionAvailable: true },
    specs: { make: 'ABB', model: 'IRB 6700-235/2.65', year: 2019, condition: 'excellent', hours: 6200, power: '235 kg payload', weight: 1600 },
    sourceUrl: 'https://troostwijkauctions.com/es/abb-irb6700',
    imageUrl: '/assets/placeholder-abb.svg',
    source: 'mock',
  },
  {
    id: 'laser-trumpf-008',
    title: 'TRUMPF TruLaser 5030 — Corte Láser Fibra 4kW',
    description: 'Máquina de corte láser TRUMPF TruLaser 5030 con fuente de fibra 4kW, mesa 3000x1500mm. Corte de chapa hasta 25mm acero, 15mm aluminio. Incluye cargador automático de chapa Tower Tower.',
    category: 'Corte Láser',
    subcategory: 'Láser de Fibra',
    platform: PLATFORMS[4], // Macon
    pricing: {
      currentBid: 55000,
      currency: 'EUR',
      estimatedResale: 95000,
      buyerPremiumPercent: 16,
      reservePrice: 48000,
      hasReserve: true,
      startingBid: 30000,
    },
    location: {
      city: 'Bérgamo',
      region: 'Lombardía',
      country: 'Italia',
      countryCode: 'IT',
      lat: 45.6983,
      lng: 9.6760,
      siteType: 'Fábrica metalmecánica',
    },
    timing: { auctionEnd: futureDate(8), timeRemainingMs: 0, inspectionAvailable: true },
    specs: { make: 'TRUMPF', model: 'TruLaser 5030', year: 2017, condition: 'good', hours: 16000, power: '4 kW fibra', weight: 14000 },
    sourceUrl: 'https://macon-auction.com/trumpf-trulaser5030',
    imageUrl: '/assets/placeholder-laser.svg',
    source: 'mock',
  },
  {
    id: 'compressor-atlas-009',
    title: 'Atlas Copco GA 90+ — Compresor de Aire Industrial 90kW',
    description: 'Compresor Atlas Copco GA 90+ con variador de frecuencia, secador integrado, filtro de aire. Presión máxima 10 bar. Caudal 13.5 m³/min. Mantenimiento completo hasta 2025.',
    category: 'Neumática y Compresores',
    subcategory: 'Compresores de Tornillo',
    platform: PLATFORMS[2], // NetBid
    pricing: {
      currentBid: 4800,
      currency: 'EUR',
      estimatedResale: 14000,
      buyerPremiumPercent: 16,
      reservePrice: null,
      hasReserve: false,
      startingBid: 1500,
    },
    location: {
      city: 'Praga',
      region: 'Praga',
      country: 'República Checa',
      countryCode: 'CZ',
      lat: 50.0755,
      lng: 14.4378,
      siteType: 'Planta de producción',
    },
    timing: { auctionEnd: futureDate(2), timeRemainingMs: 0, inspectionAvailable: false },
    specs: { make: 'Atlas Copco', model: 'GA 90+', year: 2015, condition: 'good', hours: 24000, power: '90 kW', weight: 1800 },
    sourceUrl: 'https://netbid.com/atlas-copco-ga90',
    imageUrl: '/assets/placeholder-compressor.svg',
    source: 'mock',
  },
  {
    id: 'forklift-toyota-010',
    title: 'Toyota 8FGU25 — Carretilla Elevadora Gasolina 2.5t',
    description: 'Carretilla elevadora Toyota 8FGU25, capacidad 2500kg, mástil triplex 5500mm. Motor gasolina Toyota 4Y. Neumáticos nuevos 2024. Incluye horquillas laterales y porta-bobinas.',
    category: 'Logística y Almacén',
    subcategory: 'Carretillas Elevadoras',
    platform: PLATFORMS[3], // GoIndustry
    pricing: {
      currentBid: 6200,
      currency: 'GBP',
      estimatedResale: 16500,
      buyerPremiumPercent: 16,
      reservePrice: null,
      hasReserve: false,
      startingBid: 2000,
    },
    location: {
      city: 'Manchester',
      region: 'Gran Mánchester',
      country: 'Reino Unido',
      countryCode: 'UK',
      lat: 53.4808,
      lng: -2.2426,
      siteType: 'Almacén logístico',
    },
    timing: { auctionEnd: futureDate(3), timeRemainingMs: 0, inspectionAvailable: true },
    specs: { make: 'Toyota', model: '8FGU25', year: 2018, condition: 'good', hours: 9800, power: '2.5t capacidad', weight: 3800 },
    sourceUrl: 'https://goindustry.com/toyota-8fgu25',
    imageUrl: '/assets/placeholder-forklift.svg',
    source: 'mock',
  },
];

// --- Calculate KPIs for all assets ---

export const ALL_ASSETS: Asset[] = RAW_ASSETS.map((raw) => ({
  ...raw,
  kpis: calculateKPIs(raw.pricing, raw.specs, raw.location.countryCode),
}));

// --- Filtered: only active auctions (timeRemainingMs > 0) ---

export function getActiveAssets(): Asset[] {
  const now = Date.now();
  return ALL_ASSETS.map(a => ({
    ...a,
    timing: {
      ...a.timing,
      timeRemainingMs: Math.max(0, new Date(a.timing.auctionEnd).getTime() - now),
    },
  })).filter(a => a.timing.timeRemainingMs > 0);
}

export const ACTIVE_ASSETS: Asset[] = getActiveAssets();

// --- Smart Presets ---

export const SMART_PRESETS: SmartPreset[] = [
  {
    id: 'ganga',
    label: 'Ganga',
    icon: 'flame',
    filter: (asset: Asset) => asset.kpis.isGanga,
  },
  {
    id: 'low-risk',
    label: 'Bajo Riesgo',
    icon: 'shield',
    filter: (asset: Asset) => asset.kpis.riskLevel === 'low',
  },
  {
    id: 'high-roi',
    label: 'ROI > 30%',
    icon: 'trending-up',
    filter: (asset: Asset) => asset.kpis.roi > 30,
  },
  {
    id: 'closing-soon',
    label: 'Cierra pronto',
    icon: 'clock',
    filter: (asset: Asset) => asset.timing.timeRemainingMs < 3 * DAY,
  },
  {
    id: 'robots',
    label: 'Robótica',
    icon: 'bot',
    filter: (asset: Asset) => asset.category === 'Robótica Industrial',
  },
  {
    id: 'cnc',
    label: 'CNC',
    icon: 'settings',
    filter: (asset: Asset) => asset.category === 'Mecanizado CNC',
  },
  {
    id: 'inspeccion-disponible',
    label: 'Inspección OK',
    icon: 'eye',
    filter: (asset: Asset) => asset.timing.inspectionAvailable,
  },
  {
    id: 'europa-central',
    label: 'Europa Central',
    icon: 'map',
    filter: (asset: Asset) => ['DE', 'NL', 'BE', 'CZ'].includes(asset.location.countryCode),
  },
];

// --- Autocomplete keyword map ---

export const AUTOCOMPLETE_KEYWORDS: Record<string, string[]> = {
  'robot': ['KUKA', 'FANUC', 'ABB', 'robot industrial', 'brazo robot', 'soldadura', 'paletizado'],
  'cnc': ['centro de mecanizado', 'torno CNC', 'DMG MORI', 'MAZAK', 'fresadora CNC'],
  'láser': ['láser fibra', 'TRUMPF', 'corte láser', 'corte chapa', 'láser CO2'],
  'prensa': ['prensa hidráulica', 'Schuler', 'conformado', 'prensadora', 'matriceria'],
  'inyectora': ['inyectora plástico', 'KraussMaffei', 'moldeo por inyección', 'plástico'],
  'compresor': ['Atlas Copco', 'aire comprimido', 'compresor tornillo', 'neumática'],
  'carretilla': ['carretilla elevadora', 'Toyota', 'forklift', 'almacén', 'logística'],
  'ganga': ['alta rentabilidad', 'ROI alto', 'oportunidad', 'bajo precio'],
  'alemania': ['DE', 'Stuttgart', 'Múnich', 'Frankfurt', 'Leipzig'],
  'holanda': ['NL', 'Eindhoven', 'Ámsterdam'],
  'italia': ['IT', 'Bérgamo', 'Lombardía'],
  'reino unido': ['UK', 'Birmingham', 'Manchester'],
};

// --- Category list ---

export const CATEGORIES = [
  'Robótica Industrial',
  'Mecanizado CNC',
  'Plástico y Caucho',
  'Conformado de Chapa',
  'Corte Láser',
  'Neumática y Compresores',
  'Logística y Almacén',
] as const;

export type Category = (typeof CATEGORIES)[number];

// --- Country list (active platforms) ---

export const COUNTRIES = [
  { code: 'DE', name: 'Alemania' },
  { code: 'NL', name: 'Países Bajos' },
  { code: 'UK', name: 'Reino Unido' },
  { code: 'IT', name: 'Italia' },
  { code: 'CZ', name: 'República Checa' },
  { code: 'FR', name: 'Francia' },
  { code: 'PL', name: 'Polonia' },
  { code: 'BE', name: 'Bélgica' },
  { code: 'ES', name: 'España' },
] as const;