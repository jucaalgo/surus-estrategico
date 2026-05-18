// ============================================================
// SURUS SHARK ENGINE — Mock Data v3
// 10 industrial assets with full KPIs, logistics, pricing
// ============================================================

const PLATFORMS = [
  { id: 'troostwijk', name: 'Troostwijk', country: 'NL', active: true },
  { id: 'surplex', name: 'Surplex', country: 'DE', active: true },
  { id: 'netbid', name: 'NetBid', country: 'ES', active: true },
  { id: 'goindustry', name: 'GoIndustry', country: 'UK', active: true },
  { id: 'maynards', name: 'Maynards', country: 'DE', active: true },
  { id: 'industrial_auctions', name: 'Industrial Auctions', country: 'NL', active: true },
  { id: 'ritchie_bros', name: 'Ritchie Bros.', country: 'US', active: false },
  { id: 'ironplanet', name: 'IronPlanet', country: 'US', active: false },
  { id: 'hilco', name: 'Hilco Industrial', country: 'UK', active: true },
  { id: 'gordon_brothers', name: 'Gordon Brothers', country: 'US', active: true },
  { id: 'auctelia', name: 'Auctelia', country: 'FR', active: true },
  { id: 'bidspotter', name: 'BidSpotter', country: 'UK', active: true },
  { id: 'apex', name: 'Apex Auctions', country: 'UK', active: true }
];

const AUTOCOMPLETE = [
  { q: 'cnc', s: ['Centro de mecanizado CNC', 'Torno CNC 5 ejes', 'Fresadora CNC', 'Rectificadora CNC', 'Centro de torneado CNC'] },
  { q: 'kuka', s: ['Robot KUKA KR 210 R2700', 'Robot KUKA KR 150', 'Robot KUKA Quantec', 'Robot KUKA KR 16', 'KUKA ArcTech welding'] },
  { q: 'arburg', s: ['Inyectora Arburg Allrounder 520S', 'Arburg 320C Golden Edition', 'Arburg 470A', 'Arburg 370S', 'Arburg Allrounder 420C'] },
  { q: 'inyectora', s: ['Inyectora Arburg Allrounder', 'Inyectora Engel Victory', 'Inyectora KraussMaffei', 'Inyectora Demag', 'Inyectora Haitian'] },
  { q: 'torno', s: ['Torno CNC Haas ST-30', 'Torno CNC Mazak', 'Torno CNC DMG Mori', 'Torno paralelo Pinacho', 'Torno revólver'] },
  { q: 'prensa', s: ['Prensa hidráulica GÜDEL', 'Prensa mecánica Schuler', 'Prensa excéntrica', 'Prensa de matriz progresiva', 'Prensa dobladora'] },
  { q: 'robot', s: ['Robot industrial KUKA', 'Robot Fanuc M-710', 'Robot ABB IRB 6700', 'Robot Yaskawa Motoman', 'Robot soldadura'] },
  { q: 'embotellado', s: ['Línea de embotellado KHS', 'Llenadora', 'Etiquetadora', 'Empaquetadora Multivac', 'Termoformadora Weber'] },
  { q: 'excavadora', s: ['Excavadora Caterpillar 320', 'Excavadora Komatsu PC200', 'Excavadora Hyundai', 'Excavadora Volvo', 'Mini-excavadora'] },
  { q: 'elevador', s: ['Carretilla elevadora Toyota', 'Carretilla Jungheinrich', 'Carretilla Linde', 'Transpaleta eléctrica', 'Apilador'] },
  { q: 'soldadura', s: ['Robot soldadura KUKA', 'Soldadora láser Trumpf', 'Celda soldadura Fanuc', 'Soldadora MIG/MAG', 'Soldadura por puntos'] },
  { q: 'laser', s: ['Cortadora láser Trumpf', 'Grabadora láser', 'Soldadora láser', 'Marcadora láser', 'Corte láser fibra'] }
];

const SMART_PRESETS = [
  {
    id: 'insolvencias',
    icon: '🔴',
    label: 'Insolvencias Inminentes',
    desc: 'Cierre en menos de 48h',
    filters: { timeUrgency: 'closing_48h', distressLevel: 'high', sortByUrgency: true }
  },
  {
    id: 'plantas',
    icon: '🏭',
    label: 'Liquidaciones de Plantas Completas',
    desc: 'Lotes de 10+ activos',
    filters: { saleType: 'plant_liquidation', minItems: 10 }
  },
  {
    id: 'sin_reserva',
    icon: '💰',
    label: 'Activos Sin Precio de Reserva',
    desc: 'Unreserved — Máximo potencial',
    filters: { hasReserve: false }
  },
  {
    id: 'gangas',
    icon: '🎯',
    label: 'Posibles Gangas',
    desc: 'Arbitrage Score > 1.5',
    filters: { minArbitrageScore: 1.5, onlyGangas: true }
  },
  {
    id: 'alimentaria',
    icon: '🥩',
    label: 'Industria Alimentaria',
    desc: 'Acero inoxidable grado alimentario',
    filters: { category: 'food', material: 'stainless_steel' }
  },
  {
    id: 'robotica',
    icon: '🤖',
    label: 'Robótica y Automatización',
    desc: 'Robots, CNC, automatización',
    filters: { category: 'robotics', subcategory: 'heavy_automation' }
  }
];

const MOCK_ASSETS = [
  {
    id: 'kuka-kr210-001',
    sourcePlatform: 'surplex',
    sourceUrl: 'https://www.surplex.com/es/lote/kuka-kr210-robots',
    sourceLotId: 'SUR-2026-0447',
    title: 'KUKA KR 210 — 7 Robots Industriales KRC2',
    description: 'Lote de 7 robots KUKA KR 210 Serie 2000 con controladores KRC2 ed05. Excelente estado de funcionamiento. Retirados de línea de producción activa. Incluye teach pendants, cables de conexión y manuals técnicos. Demanda comprobada en LATAM (México, Brasil, Argentina).',
    category: 'Robótica',
    subcategory: 'Robot industrial 6 ejes',
    specs: {
      make: 'KUKA', model: 'KR 210 R2700', year: 2016, serialNumber: 'K4816-00345-52',
      hours: 12450, power: '22 kW', capacity: '210 kg carga nominal',
      dimensions: 'L 1.200 × A 1.100 × H 2.200 mm', weight: 1250,
      condition: 'good', maintenanceHistory: 'Mantenimiento preventivo KUKA cada 5.000h',
      knownIssues: ['Robot #4 requiere recalibración de ejes']
    },
    images: [
      { url: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="#1a1a3a" width="400" height="300"/><text fill="#00ff88" x="200" y="150" text-anchor="middle" font-size="48">🤖</text><text fill="#6b6b8a" x="200" y="200" text-anchor="middle" font-size="14">KUKA KR 210</text></svg>'), thumbnailUrl: '', alt: 'Robot KUKA vista frontal', isPrimary: true, aiTags: ['Robot KUKA', 'Vista frontal'] }
    ],
    documents: { manualUrl: null, brochureUrl: null, inspectionReportUrl: null, partsCatalogUrl: null, errorLog: null },
    pricing: { currentBid: 42500, currency: 'EUR', estimatedValueFmv: 85000, forcedLiquidationValue: 51000, buyerPremiumPercent: 16, reservePrice: null, hasReserve: false, startingBid: 25000, lastKnownSalePrice: null },
    location: { city: 'Barcelona', region: 'Cataluña', country: 'España', countryCode: 'ES', coordinates: [41.3874, 2.1686], isIndoor: true, siteType: 'factory' },
    timing: { publishedAt: '2026-04-15T00:00:00Z', auctionStart: '2026-05-10T00:00:00Z', auctionEnd: '2026-05-20T12:00:00Z', timeRemainingMs: 173520000, inspectionAvailable: true, inspectionDeadline: '2026-05-18T00:00:00Z', removalDeadline: '2026-06-15T00:00:00Z' },
    parties: { seller: { name: 'Componentes Industriales SA', legalEntity: 'Componentes Industriales SA', reasonForSale: 'Renovación de línea', distressLevel: 'low' }, auctioneer: { name: 'Surplex GmbH', contactName: 'Marco Rossi', email: 'm.rossi@surplex.com', phone: '+49 211 422 737 0' } },
    intelligence: { marketDemand: 'very_high', comparableSales: [], buyerPersonas: [], riskFlags: [], arbitrageScore: 1.17 }
  },
  {
    id: 'aleo-solar-002',
    sourcePlatform: 'netbid', sourceUrl: '', sourceLotId: 'NB-19057-01',
    title: 'Aleo Solar — Línea Completa PERC/TOPCon Fotovoltaica',
    description: 'Línea completa de fabricación de módulos fotovoltaicos PERC y TOPCon por Ecoprogetti. Incluye stringers ATW/Autowell, robots Comau, laminadoras Ecolam 3400, simulador solar, testers EL y flash test. Alineación directa con demanda de clientes SURUS en LATAM.',
    category: 'Energía', subcategory: 'Fabricación fotovoltaica',
    specs: { make: 'Ecoprogetti', model: 'PERC/TOPCon Line 200MW', year: 2020, serialNumber: null, hours: 18000, power: '450 kW línea', capacity: '200 MW anuales', dimensions: 'L 65.000 × A 12.000 × H 3.500 mm', weight: 45000, condition: 'excellent', maintenanceHistory: 'Mantenimiento completo por Ecoprogetti hasta Abril 2025', knownIssues: [] },
    images: [{ url: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="#1a1a3a" width="400" height="300"/><text fill="#ffd740" x="200" y="150" text-anchor="middle" font-size="48">☀️</text><text fill="#6b6b8a" x="200" y="200" text-anchor="middle" font-size="14">Aleo Solar PERC Line</text></svg>'), thumbnailUrl: '', alt: 'Línea PERC completa', isPrimary: true, aiTags: ['Línea PERC', 'Fotovoltaica'] }],
    documents: { manualUrl: null, brochureUrl: null, inspectionReportUrl: null, partsCatalogUrl: null, errorLog: null },
    pricing: { currentBid: 120000, currency: 'EUR', estimatedValueFmv: 220000, forcedLiquidationValue: 132000, buyerPremiumPercent: 18, reservePrice: 100000, hasReserve: true, startingBid: 75000, lastKnownSalePrice: null },
    location: { city: 'Prenzlau', region: 'Brandeburgo', country: 'Alemania', countryCode: 'DE', coordinates: [53.3167, 13.8667], isIndoor: true, siteType: 'factory' },
    timing: { publishedAt: '2026-04-20T00:00:00Z', auctionStart: '2026-05-15T00:00:00Z', auctionEnd: '2026-05-29T14:00:00Z', timeRemainingMs: 946080000, inspectionAvailable: true, inspectionDeadline: '2026-05-22T00:00:00Z', removalDeadline: '2026-08-15T00:00:00Z' },
    parties: { seller: { name: 'Aleo Solar GmbH', legalEntity: 'Aleo Solar GmbH', reasonForSale: 'Cierre de planta', distressLevel: 'high' }, auctioneer: { name: 'NetBid Industrie-Auktionen', contactName: 'Thomas Weber', email: 'weber@netbid.com', phone: '+49 30 555 8710' } },
    intelligence: { marketDemand: 'high', comparableSales: [], buyerPersonas: [], riskFlags: [], arbitrageScore: 1.14 }
  },
  {
    id: 'bsh-esquiroz-003',
    sourcePlatform: 'netbid', sourceUrl: '', sourceLotId: 'NB-19429-01',
    title: 'BSH Esquiroz — Prensas y Línea Electrodomésticos',
    description: 'Cierre completo de planta BSH en Navarra. Prensas ARISA 1600tn, líneas ARRASATE de conformado, grúas JASO 40tn, sistemas de almacenaje automatizado. Equipamiento de alta gama ideal para reventa en LATAM (México, Colombia).',
    category: 'Pesada', subcategory: 'Prensas y conformado',
    specs: { make: 'ARISA/ARRASATE', model: '1600T Press Line', year: 2012, serialNumber: null, hours: 35000, power: '650 kW total', capacity: '1.600 toneladas', dimensions: 'L 18.000 × A 5.500 × H 7.200 mm', weight: 180000, condition: 'fair', maintenanceHistory: 'Registros parciales disponibles desde 2018', knownIssues: ['Prensa #2 requiere overhaul de cilindros hidráulicos', 'Control Siemens S7 necesita upgrade'] },
    images: [{ url: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="#1a1a3a" width="400" height="300"/><text fill="#ff6e40" x="200" y="150" text-anchor="middle" font-size="48">🔨</text><text fill="#6b6b8a" x="200" y="200" text-anchor="middle" font-size="14">ARISA 1600T Press</text></svg>'), thumbnailUrl: '', alt: 'Prensa ARISA 1600T', isPrimary: true, aiTags: ['Prensa industrial', 'ARISA 1600T'] }],
    documents: { manualUrl: null, brochureUrl: null, inspectionReportUrl: null, partsCatalogUrl: null, errorLog: null },
    pricing: { currentBid: 85000, currency: 'EUR', estimatedValueFmv: 145000, forcedLiquidationValue: 87000, buyerPremiumPercent: 18, reservePrice: 75000, hasReserve: true, startingBid: 50000, lastKnownSalePrice: null },
    location: { city: 'Esquiroz', region: 'Navarra', country: 'España', countryCode: 'ES', coordinates: [42.7766, -1.6844], isIndoor: true, siteType: 'factory' },
    timing: { publishedAt: '2026-04-10T00:00:00Z', auctionStart: '2026-05-10T00:00:00Z', auctionEnd: '2026-05-27T16:00:00Z', timeRemainingMs: 789120000, inspectionAvailable: true, inspectionDeadline: '2026-05-20T00:00:00Z', removalDeadline: '2026-09-30T00:00:00Z' },
    parties: { seller: { name: 'BSH Electrodomésticos España', legalEntity: 'BSH Electrodomésticos España S.A.', reasonForSale: 'Cierre de planta', distressLevel: 'high' }, auctioneer: { name: 'NetBid Industrie-Auktionen', contactName: 'Javier López', email: 'j.lopez@netbid.com', phone: '+34 948 123 456' } },
    intelligence: { marketDemand: 'medium', comparableSales: [], buyerPersonas: [], riskFlags: [], arbitrageScore: 1.09 }
  },
  {
    id: 'frieslandcampina-004',
    sourcePlatform: 'troostwijk', sourceUrl: '', sourceLotId: 'TW-88421',
    title: 'FrieslandCampina — Planta Láctea Completa',
    description: 'Línea de evaporación, llenado de botes, empaquetado. Cierre de fábrica de condensación en Leeuwarden. Equipos en acero inoxidable 316, grado alimentario. Incluye: evaporador de triple efecto, llenadora aséptica Tetra Pak, túnel de esterilizado.',
    category: 'Alimentación', subcategory: 'Procesamiento lácteo',
    specs: { make: 'Tetra Pak / APV', model: 'Evaporator + Filler Line', year: 2014, serialNumber: null, hours: 22000, power: '380 kW línea completa', capacity: '50.000 L/día', dimensions: 'L 28.000 × A 8.000 × H 5.200 mm', weight: 35000, condition: 'good', maintenanceHistory: 'Registros completos disponibles. Cumplimiento HACCP verificado.', knownIssues: ['Condensador del evaporador necesita limpieza completa'] },
    images: [{ url: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="#1a1a3a" width="400" height="300"/><text fill="#00ccff" x="200" y="150" text-anchor="middle" font-size="48">🥛</text><text fill="#6b6b8a" x="200" y="200" text-anchor="middle" font-size="14">FrieslandCampina Plant</text></svg>'), thumbnailUrl: '', alt: 'Planta láctea', isPrimary: true, aiTags: ['Planta láctea', 'Acero inoxidable'] }],
    documents: { manualUrl: null, brochureUrl: null, inspectionReportUrl: null, partsCatalogUrl: null, errorLog: null },
    pricing: { currentBid: 62000, currency: 'EUR', estimatedValueFmv: 110000, forcedLiquidationValue: 66000, buyerPremiumPercent: 15, reservePrice: null, hasReserve: false, startingBid: 35000, lastKnownSalePrice: null },
    location: { city: 'Leeuwarden', region: 'Frisia', country: 'Países Bajos', countryCode: 'NL', coordinates: [53.2012, 5.7999], isIndoor: true, siteType: 'factory' },
    timing: { publishedAt: '2026-04-22T00:00:00Z', auctionStart: '2026-05-12T00:00:00Z', auctionEnd: '2026-05-30T11:00:00Z', timeRemainingMs: 1036800000, inspectionAvailable: true, inspectionDeadline: '2026-05-25T00:00:00Z', removalDeadline: '2026-08-01T00:00:00Z' },
    parties: { seller: { name: 'FrieslandCampina', legalEntity: 'FrieslandCampina Nederland B.V.', reasonForSale: 'Consolidación de plantas', distressLevel: 'low' }, auctioneer: { name: 'Troostwijk Auctions', contactName: 'Pieter de Vries', email: 'p.devries@troostwijk.com', phone: '+31 20 666 7788' } },
    intelligence: { marketDemand: 'medium', comparableSales: [], buyerPersonas: [], riskFlags: [], arbitrageScore: 1.08 }
  },
  {
    id: 'ti-group-005',
    sourcePlatform: 'surplex', sourceUrl: '', sourceLotId: 'SUR-2026-0512',
    title: 'TI Group Automotive — 631 Lotes Sin Reserva',
    description: 'Cierre de planta de cables de freno. 631 lotes SIN PRECIO DE RESERVA. Oportunidad máxima de compra por debajo de valor de mercado. Incluye: extrusoras, trenzadoras, cortadoras automáticas, bancos de prueba hidráulica, moldes de inyección.',
    category: 'Automotriz', subcategory: 'Fabricación de componentes',
    specs: { make: 'Varios', model: 'Cable Manufacturing Plant', year: 2015, serialNumber: null, hours: 28000, power: '850 kW total planta', capacity: '12M cables/año', dimensions: 'Planta 8.500 m²', weight: 120000, condition: 'good', maintenanceHistory: 'Programa TPM implementado hasta cierre', knownIssues: ['Extrusora #3 necesita cambio de husillo'] },
    images: [{ url: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="#1a1a3a" width="400" height="300"/><text fill="#00ff88" x="200" y="150" text-anchor="middle" font-size="48">🏭</text><text fill="#6b6b8a" x="200" y="200" text-anchor="middle" font-size="14">TI Group Plant</text></svg>'), thumbnailUrl: '', alt: 'Planta TI Group', isPrimary: true, aiTags: ['Planta industrial', '631 lotes'] }],
    documents: { manualUrl: null, brochureUrl: null, inspectionReportUrl: null, partsCatalogUrl: null, errorLog: null },
    pricing: { currentBid: 58000, currency: 'EUR', estimatedValueFmv: 105000, forcedLiquidationValue: 63000, buyerPremiumPercent: 16, reservePrice: null, hasReserve: false, startingBid: 1, lastKnownSalePrice: null },
    location: { city: 'Nazelles-Négron', region: 'Centre-Val de Loire', country: 'Francia', countryCode: 'FR', coordinates: [47.4315, 0.9445], isIndoor: true, siteType: 'factory' },
    timing: { publishedAt: '2026-04-25T00:00:00Z', auctionStart: '2026-05-18T00:00:00Z', auctionEnd: '2026-06-15T16:00:00Z', timeRemainingMs: 2419200000, inspectionAvailable: true, inspectionDeadline: '2026-06-05T00:00:00Z', removalDeadline: '2026-09-30T00:00:00Z' },
    parties: { seller: { name: 'TI Group Automotive Systems', legalEntity: 'TI Automotive France SAS', reasonForSale: 'Cierre de planta', distressLevel: 'high' }, auctioneer: { name: 'Surplex GmbH', contactName: 'Klaus Mueller', email: 'k.mueller@surplex.com', phone: '+49 211 422 737 0' } },
    intelligence: { marketDemand: 'high', comparableSales: [], buyerPersonas: [], riskFlags: [], arbitrageScore: 1.05 }
  },
  {
    id: 'neapco-006',
    sourcePlatform: 'netbid', sourceUrl: '', sourceLotId: 'NB-18850',
    title: 'Neapco Europe — Centros Mecanizado Automotriz',
    description: 'Insolvencia automotriz en Düren. 20+ centros de mecanizado CNC incluyendo DMG Mori NHX 5000, Grob G350, Heller HF 3500. 500 puestos afectados. Nearshoring México como canal de reventa principal.',
    category: 'Mecanizado', subcategory: 'Centros de mecanizado CNC',
    specs: { make: 'DMG Mori / Grob / Heller', model: 'NHX 5000 / G350 / HF 3500', year: 2019, serialNumber: null, hours: 8500, power: '65 kW por máquina', capacity: 'Mesa 500mm, 60 herramientas ATC', dimensions: 'L 3.500 × A 2.800 × H 2.900 mm c/u', weight: 12000, condition: 'excellent', maintenanceHistory: 'Servicio oficial DMG Mori hasta enero 2026', knownIssues: [] },
    images: [{ url: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="#1a1a3a" width="400" height="300"/><text fill="#00ccff" x="200" y="150" text-anchor="middle" font-size="48">⚙️</text><text fill="#6b6b8a" x="200" y="200" text-anchor="middle" font-size="14">DMG Mori NHX 5000</text></svg>'), thumbnailUrl: '', alt: 'Centro mecanizado DMG', isPrimary: true, aiTags: ['DMG Mori', 'CNC machining'] }],
    documents: { manualUrl: null, brochureUrl: null, inspectionReportUrl: null, partsCatalogUrl: null, errorLog: null },
    pricing: { currentBid: 72000, currency: 'EUR', estimatedValueFmv: 130000, forcedLiquidationValue: 78000, buyerPremiumPercent: 18, reservePrice: 60000, hasReserve: true, startingBid: 45000, lastKnownSalePrice: null },
    location: { city: 'Düren', region: 'NRW', country: 'Alemania', countryCode: 'DE', coordinates: [50.8043, 6.4853], isIndoor: true, siteType: 'factory' },
    timing: { publishedAt: '2026-04-28T00:00:00Z', auctionStart: '2026-05-20T00:00:00Z', auctionEnd: '2026-06-03T14:00:00Z', timeRemainingMs: 1382400000, inspectionAvailable: true, inspectionDeadline: '2026-05-28T00:00:00Z', removalDeadline: '2026-07-31T00:00:00Z' },
    parties: { seller: { name: 'Neapco Europe GmbH', legalEntity: 'Neapco Europe GmbH', reasonForSale: 'Insolvencia', distressLevel: 'high' }, auctioneer: { name: 'NetBid Industrie-Auktionen', contactName: 'Thomas Weber', email: 'weber@netbid.com', phone: '+49 30 555 8710' } },
    intelligence: { marketDemand: 'very_high', comparableSales: [], buyerPersonas: [], riskFlags: [], arbitrageScore: 1.04 }
  },
  {
    id: 'eyrise-007',
    sourcePlatform: 'surplex', sourceUrl: '', sourceLotId: 'SUR-2026-0312',
    title: 'Eyrise / Merck — Fábrica Cristal Inteligente PDLC',
    description: 'Fábrica completa de cristal switchable (PDLC) para smart glass. Subasta cerrada 31 Mar 2026 — dossier de referencia para clientes interesados en producto de nicho con alta rareza en mercado secundario.',
    category: 'Electrónica', subcategory: 'Fabricación smart glass',
    specs: { make: 'Merck / Eyrise', model: 'PDLC Production Line Gen 2', year: 2019, serialNumber: null, hours: 9500, power: '120 kW', capacity: '50.000 m²/año', dimensions: 'L 22.000 × A 6.000 × H 3.200 mm', weight: 18000, condition: 'excellent', maintenanceHistory: 'Protocolos completos Merck disponibles', knownIssues: [] },
    images: [{ url: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="#1a1a3a" width="400" height="300"/><text fill="#b388ff" x="200" y="150" text-anchor="middle" font-size="48">🔮</text><text fill="#6b6b8a" x="200" y="200" text-anchor="middle" font-size="14">Eyrise Smart Glass</text></svg>'), thumbnailUrl: '', alt: 'Fábrica smart glass', isPrimary: true, aiTags: ['Smart glass', 'PDLC production'] }],
    documents: { manualUrl: null, brochureUrl: null, inspectionReportUrl: null, partsCatalogUrl: null, errorLog: null },
    pricing: { currentBid: 0, currency: 'EUR', estimatedValueFmv: 95000, forcedLiquidationValue: 57000, buyerPremiumPercent: 16, reservePrice: null, hasReserve: false, startingBid: 35000, lastKnownSalePrice: 82000 },
    location: { city: 'Veldhoven', region: 'Brabante', country: 'Países Bajos', countryCode: 'NL', coordinates: [51.4167, 5.4000], isIndoor: true, siteType: 'factory' },
    timing: { publishedAt: '2026-02-15T00:00:00Z', auctionStart: '2026-03-20T00:00:00Z', auctionEnd: '2026-03-31T16:00:00Z', timeRemainingMs: -1, inspectionAvailable: false, inspectionDeadline: null, removalDeadline: '2026-05-31T00:00:00Z' },
    parties: { seller: { name: 'Merck KGaA / Eyrise B.V.', legalEntity: 'Merck KGaA', reasonForSale: 'Cese de línea de negocio', distressLevel: 'medium' }, auctioneer: { name: 'Surplex GmbH', contactName: 'Hans Becker', email: 'h.becker@surplex.com', phone: '+49 211 422 737 0' } },
    intelligence: { marketDemand: 'low', comparableSales: [], buyerPersonas: [], riskFlags: [], arbitrageScore: 0 }
  },
  {
    id: 'all-in-foods-008',
    sourcePlatform: 'goindustry', sourceUrl: '', sourceLotId: 'GI-2026-FR-0552',
    title: 'All in Foods / Bel Group — Planta Queso Vegetal',
    description: 'Línea completa de producción de queso vegetal de Bel Group (La Vache qui rit). Cierre estratégico de división plant-based. Equipos en acero inoxidable 316L, incluye: tanques de fermentación, centrífugas Westfalia, llenadora aséptica SIG Combibloc.',
    category: 'Alimentación', subcategory: 'Procesamiento vegetal',
    specs: { make: 'Westfalia / SIG Combibloc', model: 'Plant-Based Line', year: 2018, serialNumber: null, hours: 14000, power: '280 kW', capacity: '8.000 ton/año', dimensions: 'L 18.000 × A 6.500 × H 4.200 mm', weight: 22000, condition: 'excellent', maintenanceHistory: 'Mantenimiento completo. Registros digitales desde 2018.', knownIssues: [] },
    images: [{ url: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="#1a1a3a" width="400" height="300"/><text fill="#00ff88" x="200" y="150" text-anchor="middle" font-size="48">🧀</text><text fill="#6b6b8a" x="200" y="200" text-anchor="middle" font-size="14">Bel Group Plant</text></svg>'), thumbnailUrl: '', alt: 'Planta queso vegetal', isPrimary: true, aiTags: ['Planta alimentaria', 'Acero 316L'] }],
    documents: { manualUrl: null, brochureUrl: null, inspectionReportUrl: null, partsCatalogUrl: null, errorLog: null },
    pricing: { currentBid: 48000, currency: 'EUR', estimatedValueFmv: 95000, forcedLiquidationValue: 57000, buyerPremiumPercent: 17, reservePrice: null, hasReserve: false, startingBid: 25000, lastKnownSalePrice: null },
    location: { city: 'Sablé-sur-Sarthe', region: 'Pays de la Loire', country: 'Francia', countryCode: 'FR', coordinates: [47.8333, -0.3333], isIndoor: true, siteType: 'factory' },
    timing: { publishedAt: '2026-04-30T00:00:00Z', auctionStart: '2026-05-22T00:00:00Z', auctionEnd: '2026-06-10T12:00:00Z', timeRemainingMs: 1987200000, inspectionAvailable: true, inspectionDeadline: '2026-06-02T00:00:00Z', removalDeadline: '2026-08-31T00:00:00Z' },
    parties: { seller: { name: 'Bel Group', legalEntity: 'Bel SA', reasonForSale: 'Cierre estratégico división plant-based', distressLevel: 'low' }, auctioneer: { name: 'GoIndustry DoveBid', contactName: 'Pierre Dubois', email: 'p.dubois@goidustry.com', phone: '+33 1 55 67 89 00' } },
    intelligence: { marketDemand: 'medium', comparableSales: [], buyerPersonas: [], riskFlags: [], arbitrageScore: 1.05 }
  },
  {
    id: 'kuka-robots-009',
    sourcePlatform: 'troostwijk', sourceUrl: '', sourceLotId: 'TW-90215',
    title: 'KUKA KR 210 Quantec — 12 Robots + Celdas Soldadura',
    description: 'Lote de 12 robots KUKA KR 210 Quantec (2020) con celdas de soldadura completas. Incluye posicionadores KUKA DKP 400, mesas de soldadura, sistemas de extracción de humos. Retirados de línea BMW Tier-1.',
    category: 'Robótica', subcategory: 'Robot soldadura industrial',
    specs: { make: 'KUKA', model: 'KR 210 Quantec', year: 2020, serialNumber: 'KQ2020-00891', hours: 5200, power: '28 kW', capacity: '210 kg / 3.100 mm alcance', dimensions: 'L 1.350 × A 1.100 × H 2.350 mm c/u', weight: 1350, condition: 'excellent', maintenanceHistory: 'Servicio KUKA Connect activo. Historial digital completo.', knownIssues: [] },
    images: [{ url: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="#1a1a3a" width="400" height="300"/><text fill="#00ff88" x="200" y="150" text-anchor="middle" font-size="48">🦾</text><text fill="#6b6b8a" x="200" y="200" text-anchor="middle" font-size="14">KUKA Quantec Fleet</text></svg>'), thumbnailUrl: '', alt: 'Flota KUKA Quantec', isPrimary: true, aiTags: ['KUKA Quantec', 'Célula soldadura'] }],
    documents: { manualUrl: null, brochureUrl: null, inspectionReportUrl: null, partsCatalogUrl: null, errorLog: null },
    pricing: { currentBid: 89000, currency: 'EUR', estimatedValueFmv: 195000, forcedLiquidationValue: 117000, buyerPremiumPercent: 15, reservePrice: null, hasReserve: false, startingBid: 50000, lastKnownSalePrice: null },
    location: { city: 'Dingolfing', region: 'Baviera', country: 'Alemania', countryCode: 'DE', coordinates: [48.6333, 12.5000], isIndoor: true, siteType: 'factory' },
    timing: { publishedAt: '2026-05-01T00:00:00Z', auctionStart: '2026-05-25T00:00:00Z', auctionEnd: '2026-06-12T16:00:00Z', timeRemainingMs: 2160000000, inspectionAvailable: true, inspectionDeadline: '2026-06-05T00:00:00Z', removalDeadline: '2026-08-15T00:00:00Z' },
    parties: { seller: { name: 'Automotive Supplier GmbH', legalEntity: 'Automotive Supplier GmbH', reasonForSale: 'Fin de contrato Tier-1', distressLevel: 'low' }, auctioneer: { name: 'Troostwijk Auctions', contactName: 'Pieter de Vries', email: 'p.devries@troostwijk.com', phone: '+31 20 666 7788' } },
    intelligence: { marketDemand: 'very_high', comparableSales: [], buyerPersonas: [], riskFlags: [], arbitrageScore: 1.25 }
  },
  {
    id: 'endesa-010',
    sourcePlatform: 'netbid', sourceUrl: '', sourceLotId: 'NB-19200',
    title: 'Endesa As Pontes — Turbina Gas + Generador Siemens',
    description: 'Desmantelamiento parcial de central térmica. Turbina de gas Siemens SGT5-4000F (292 MW), generador Siemens SGen5-2000H, sistemas auxiliares completos. Equipo con 35.000h de operación. Ideal para proyectos de energía en LATAM y África.',
    category: 'Energía', subcategory: 'Generación eléctrica',
    specs: { make: 'Siemens Energy', model: 'SGT5-4000F', year: 2008, serialNumber: 'SGT5-4000F-0885', hours: 35000, power: '292 MW', capacity: '292 MW eléctricos', dimensions: 'L 11.500 × A 5.200 × H 5.500 mm', weight: 300000, condition: 'good', maintenanceHistory: 'Mantenimiento mayor Siemens cada 25.000h. Último: 2024.', knownIssues: ['Requiere overhaul de álabes en próxima parada programada (2027)'] },
    images: [{ url: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="#1a1a3a" width="400" height="300"/><text fill="#ff6e40" x="200" y="150" text-anchor="middle" font-size="48">⚡</text><text fill="#6b6b8a" x="200" y="200" text-anchor="middle" font-size="14">Siemens SGT5-4000F</text></svg>'), thumbnailUrl: '', alt: 'Turbina Siemens', isPrimary: true, aiTags: ['Turbina gas', 'Siemens Energy'] }],
    documents: { manualUrl: null, brochureUrl: null, inspectionReportUrl: null, partsCatalogUrl: null, errorLog: null },
    pricing: { currentBid: 350000, currency: 'EUR', estimatedValueFmv: 680000, forcedLiquidationValue: 408000, buyerPremiumPercent: 16, reservePrice: 300000, hasReserve: true, startingBid: 200000, lastKnownSalePrice: null },
    location: { city: 'As Pontes', region: 'Galicia', country: 'España', countryCode: 'ES', coordinates: [43.4500, -7.8500], isIndoor: false, siteType: 'yard' },
    timing: { publishedAt: '2026-04-01T00:00:00Z', auctionStart: '2026-05-01T00:00:00Z', auctionEnd: '2026-06-30T12:00:00Z', timeRemainingMs: 3715200000, inspectionAvailable: true, inspectionDeadline: '2026-06-15T00:00:00Z', removalDeadline: '2026-12-31T00:00:00Z' },
    parties: { seller: { name: 'Endesa Generación', legalEntity: 'Endesa Generación S.A.', reasonForSale: 'Cierre de central térmica', distressLevel: 'medium' }, auctioneer: { name: 'NetBid Industrie-Auktionen', contactName: 'Carlos Ruiz', email: 'c.ruiz@netbid.com', phone: '+34 91 456 7890' } },
    intelligence: { marketDemand: 'medium', comparableSales: [], buyerPersonas: [], riskFlags: [], arbitrageScore: 1.02 }
  }
];

// Calculate KPIs for each asset
function calculateKPIs(asset) {
  const p = asset.pricing;
  const premium = p.currentBid * (p.buyerPremiumPercent / 100);
  const taxes = (p.currentBid + premium) * 0.21;
  const transport = Math.round(asset.specs.weight * 0.08); // €/kg rough estimate
  const refurb = asset.specs.condition === 'excellent' ? 2000 : asset.specs.condition === 'good' ? 5000 : asset.specs.condition === 'fair' ? 12000 : 25000;
  const totalAcquisition = Math.round(p.currentBid + premium + taxes + transport + refurb + 500);

  const resale = p.estimatedValueFmv;
  const gross = resale - totalAcquisition;
  const roi = (gross / totalAcquisition) * 100;
  const payback = Math.max(1, Math.round(4 - (roi / 10)));
  const tir = (Math.pow(1 + (roi / 100), 12 / payback) - 1) * 100;
  const score = resale / totalAcquisition;

  return {
    totalAcquisitionCost: totalAcquisition,
    estimatedResaleValue: resale,
    grossProfit: gross,
    roi: Math.round(roi * 100) / 100,
    netProfitMargin: Math.round((gross / resale) * 10000) / 100,
    tir: Math.round(tir * 100) / 100,
    paybackMonths: payback,
    cashOnCash: Math.round(roi * 100) / 100,
    arbitrageScore: Math.round(score * 100) / 100,
    isGanga: score >= 1.5,
    isGoodDeal: totalAcquisition <= resale * 0.7,
    riskLevel: (asset.timing.timeRemainingMs < 0 ? 'closed' : asset.specs.hours > 30000 ? 'high' : asset.pricing.hasReserve ? 'medium' : asset.specs.condition === 'excellent' ? 'low' : 'medium'),
    score: Math.round(Math.min(score / 3, 1) * 100)
  };
}

// Attach KPIs to all assets
MOCK_ASSETS.forEach(a => {
  a.kpis = calculateKPIs(a);
  if (a.timing.timeRemainingMs < 0) {
    a.kpis.riskLevel = 'closed';
    a.kpis.arbitrageScore = 0;
    a.kpis.isGanga = false;
  }
  a.kpis.score = Math.round(
    Math.min(a.kpis.arbitrageScore / 3, 1) * 35 +
    Math.min(Math.max(a.kpis.roi / 100, 0), 1) * 25 +
    (a.kpis.riskLevel === 'low' ? 20 : a.kpis.riskLevel === 'medium' ? 15 : a.kpis.riskLevel === 'closed' ? 0 : 5) +
    (a.intelligence.marketDemand === 'very_high' ? 10 : a.intelligence.marketDemand === 'high' ? 8 : a.intelligence.marketDemand === 'medium' ? 5 : 2) +
    (a.timing.timeRemainingMs > 0 && a.timing.timeRemainingMs < 86400000 ? 10 : a.timing.timeRemainingMs < 259200000 ? 8 : a.timing.timeRemainingMs < 604800000 ? 5 : 2)
  );
});

// Sort by arbitrage score, filter closed to end
const ACTIVE_ASSETS = MOCK_ASSETS.filter(a => a.timing.timeRemainingMs > 0).sort((a, b) => b.kpis.arbitrageScore - a.kpis.arbitrageScore);
const CLOSED_ASSETS = MOCK_ASSETS.filter(a => a.timing.timeRemainingMs <= 0);
