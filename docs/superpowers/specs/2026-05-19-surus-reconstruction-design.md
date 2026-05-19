# SURUS v2.0 — Reconstrucción Arquitectónica

> Fecha: 2026-05-19
> Estado: Aprobado por usuario
> Objetivo: Eliminar datos sintéticos y producir análisis de inversión real sobre subastas industriales.

---

## 1. Problemas Confirmados (Auditoría)

| # | Problema | Causa Raíz | Impacto |
|---|----------|-----------|---------|
| 1 | **KPIs 100% fabricados** | `currentBid` no se extrae → se inventa `resale = bid * 2` o heurística por título (default €15k). Costes hardcoded (transporte €800+1.2/km, refurbishment €5k, IVA 21%). | ROI/TIR/Payback son números sin base de mercado. |
| 2 | **TIR matemáticamente absurda** | Fórmula: `(1+ROI/100)^(12/payback)-1`. No es TIR. Produce 400%+ para assets normales. | Métrica de inversión completamente inválida. |
| 3 | **Payback circular** | `payback = totalCost / (grossProfit/12)` = `1200/ROI`. No mide recuperación. | Métrica redundante con ROI. |
| 4 | **Mapa con coordenadas falsas** | Todos los scrapers usan `COUNTRY_MAP` con 1 coordenada por país. 80 subastas de DE están en el mismo punto. | Mapa táctico muestra 3 pines para 115 subastas. |
| 5 | **Presets destruyen resultados** | Presets son client-side solo sobre 200 items en memoria. Si el match no está entre los 200 → vacío. | Usuario filtra y pierde todo. |
| 6 | **Descripciones perdidas** | Solo top 15 por keyword score reciben detail scraping. 85-95% tienen `description = title`. | Panel de detalle no muestra información útil. |
| 7 | **Scraping bloqueante expira** | `/api/scrape/all` bloquea hasta que 5 plataformas terminan. Vercel Hobby mata a 10s. | Scrapeos fallan silenciosamente, DB queda stale. |
| 8 | **Peso siempre 2.000 kg** | Ningún scraper extrae peso. Default `weightKg: 2000`. | Transporte y costes de manipulación siempre iguales. |
| 9 | **Condición siempre "good"** | Todos los scrapers hardcodean `condition: 'good'`. Refurbishment siempre €5.000. | Sin diferenciación de calidad real. |
| 10 | **Subastas caducadas visibles** | API no filtra `auction_end > now()`. | Resultados incluyen subastas ya cerradas. |
| 11 | **Risk score arbitrario** | Base 20 + suma de bonus fijos. Sin base estadística. | 50.000h y 5.000h tienen mismo riesgo si ambas son "good". |
| 12 | **Solo 1 imagen por activo** | Detail page extrae hasta 5 pero API solo devuelve primaria. | Galería de imágenes no existe. |

---

## 2. Arquitectura Nueva

### 2.1 Motor Financiero Real (`lib/engine/`)

Nuevo motor aislado. Cada módulo tiene una única responsabilidad y puede testearse independientemente.

```
lib/engine/
  ├── types.ts           # Interfaces: AcquisitionCosts, ResaleEstimate, KPIs, RiskProfile
  ├── pricing.ts         # Costes de adquisición: puja + premium + impuestos
  ├── resale.ts          # Estimación de valor de reventa por categoría + specs
  ├── transport.ts       # Coste de transporte por peso REAL + distancia REAL (km)
  ├── refurbishment.ts   # Coste de reparación por condición REAL + categoría
  ├── kpi.ts             # ROI, TIR (fórmula correcta), Payback (fórmula correcta)
  ├── risk.ts            # Risk score basado en horas, año, marca, liquidez
  └── geocode.ts         # Geocodificación de ciudad → lat/lng (Nominatim)
```

#### 2.1.1 Fórmulas Corregidas

| Métrica | Fórmula Actual (Rota) | Fórmula Nueva |
|---------|----------------------|---------------|
| **TIR** | `(1+ROI/100)^(12/payback)-1` | Anualización simple: `((resale / totalCost)^(12/meses_holding) - 1) * 100`. Si payback > holding, TIR = 0. |
| **Payback** | `totalCost / (grossProfit/12)` = `1200/ROI` | `totalCost / (grossProfit / meses_holding)`. Con `meses_holding` configurable por categoría (default 6 meses para equipos standard, 12 para líneas completas). |
| **ROI** | `grossProfit / totalCost` | Se mantiene: `(resale - totalCost) / totalCost * 100`. |
| **Margen Neto** | `grossProfit / resale` | Se mantiene. |
| **Arbitraje Score** | `resale / totalCost` | Se mantiene. Umbral "Ganga" sube a `>= 1.8` para reflejar costes reales. |

#### 2.1.2 Costes Configurables por Categoría

Nueva tabla `category_cost_profiles` (o constantes en `lib/engine/categories.ts`):

| Categoría | Refurbishment Range | Meses Holding | Transporte Base |
|-----------|---------------------|---------------|-----------------|
| Robótica | €1.000 – €3.000 | 3 | €300 |
| CNC / Mecanizado | €2.000 – €8.000 | 4 | €400 |
| Prensas / Plegadoras | €5.000 – €20.000 | 6 | €600 |
| Láser | €3.000 – €10.000 | 4 | €400 |
| Líneas completas / Plantas | €10.000 – €50.000 | 12 | €1.500 |
| Inyección | €5.000 – €15.000 | 6 | €600 |
| Compresores | €500 – €2.000 | 3 | €200 |
| Carretillas | €1.000 – €5.000 | 3 | €250 |
| Soldadura | €500 – €3.000 | 3 | €200 |
| Default ( Industrial ) | €2.000 – €10.000 | 6 | €400 |

**Refurbishment se calcula dentro del rango según:**
- Condición: excellent → 20% del rango, good → 50%, fair → 80%, poor → 100%.
- Horas: > 10.000h → +20% adicional.
- Año: < 2000 → +30% adicional.

#### 2.1.3 Transporte Realista

```
transport = base_category + (weight_kg * 0.001 €/kg) + (distance_km * 0.50 €/km)
```

- `weight_kg`: Real si existe, estimado por categoría si no.
- `distance_km`: Distancia Haversine entre coordenadas del activo y coordenadas del comprador (default: centro de España `40.4, -3.7`).
- Si `distance_km > 1000`, añadir €200 por peaje/permisos.

#### 2.1.4 Risk Score Basado en Datos

Nuevo sistema de 0-100:

| Factor | Peso | Cálculo |
|--------|------|---------|
| Edad del equipo | 25% | `(2026 - year) * 2` puntos por década. Max 25. |
| Horas de uso | 25% | `min(hours / 1000, 25)`. 0 horas = 0 puntos (desconocido = bajo riesgo). |
| Liquidez de mercado | 20% | Por categoría: CNC=5, Robot=8, Láser=10, Prensa=12, Línea completa=20, Default=10. |
| Condición | 15% | excellent=0, good=5, fair=12, poor=20. |
| Reserva de precio | 10% | Sin reserva = 0, Con reserva = +5, Reserva desconocida = +3. |
| Marca reconocida | 5% | Marca en whitelist (Trumpf, Amada, KUKA, etc.) = -5 puntos (reduce riesgo). |

**Risk Level:**
- 0-30: Bajo
- 31-55: Medio
- 56-75: Alto
- 76-100: Muy Alto

#### 2.1.5 Estimación de Reventa Realista

Reemplazar `estimateValueFromTitle` por sistema de rangos por categoría con ajustes:

1. Detectar categoría del título (keywords ampliados: añadir food processing, packaging, bakery, meat, dairy, etc.)
2. Rango base por categoría (tabla hardcoded pero con rangos realistas para Europa occidental 2024-2026).
3. Ajustes:
   - Año: +5% por cada año por debajo de 10 años, -5% por cada año por encima de 15.
   - Horas: -2% por cada 1.000h por encima de 5.000h.
   - Marca premium: +10-20%.
   - Lote múltiple: Aplicar descuento del 30% (no multiplicar aditivamente).
4. Si no hay match de categoría: usar default €25.000-€50.000 (no €15.000 fijo).

**Crítico:** El scraper DEBE intentar extraer el precio real de la página de detalle. Si el precio real existe, `estimatedResale = max(precio_real * 1.5, estimación_por_categoría)`. El 1.5x refleja markup realista del comprador profesional.

---

### 2.2 Geocodificación Real

**Flujo:**
1. Scraper extrae texto de ubicación (ej: "Stuttgart, DE").
2. `lib/engine/geocode.ts` normaliza: elimina "on behalf of...", extrae ciudad + país.
3. Llama a Nominatim API: `https://nominatim.openstreetmap.org/search?q=Stuttgart,DE&format=json&limit=1`.
4. Guarda `{lat, lng, display_name}` en DB.
5. Si Nominatim falla: dispersión aleatoria de ±15km alrededor del centro del país (para evitar stacking).

**Rate limiting:** Nominatim requiere max 1 req/segundo. Usar cola con delay de 1.1s entre llamadas.

---

### 2.3 Presets en el Servidor

**Nuevo endpoint:** `GET /api/auctions?preset=<id>&countries=DE,NL&platforms=...`

**Traducción de presets a SQL:**

| Preset | Filtro SQL |
|--------|-----------|
| `gangas` | `roi >= 30 AND arbitrage_score >= 1.8 AND risk_score <= 55` |
| `liquidaciones` | `title ILIKE '%planta%' OR title ILIKE '%línea completa%' OR title ILIKE '%liquidación%'` |
| `insolvencias` | `title ILIKE '%insolvenc%' OR title ILIKE '%bankrupt%' OR title ILIKE '%closing%'` |
| `sin-reserva` | `has_reserve = false` |
| `alimentaria` | `title ILIKE '%food%' OR title ILIKE '%aliment%' OR title ILIKE '%bakery%' OR title ILIKE '%meat%' OR title ILIKE '%dairy%'` |
| `robotica` | `category = 'Robótica' OR title ILIKE '%robot%' OR title ILIKE '%kuka%' OR title ILIKE '%fanuc%'` |
| `cnc` | `category = 'CNC' OR title ILIKE '%cnc%' OR title ILIKE '%mecanizado%'` |

**Eliminar:** Toda lógica client-side de presets en `useSearch.ts`. `applyPreset` solo construye la URL y llama al API.

---

### 2.4 Scraping Asíncrono

**Problema:** Vercel Hobby timeout 10s mata scraping.

**Solución:**

1. **Scrape individual por plataforma:**
   - `POST /api/scrape/:platform` → devuelve inmediatamente `{ jobId, status: 'queued' }`.
   - Usar `waitUntil` (Next.js 15) para que la función edge siga ejecutando después de devolver la respuesta.

2. **Polling de estado:**
   - `GET /api/scrape/status?jobId=xxx` → `{ status: 'queued'|'running'|'completed'|'failed', progress: 0-100, itemsFound, itemsSaved, logs: [...] }`.

3. **Progreso real:**
   - Cada scraper reporta: `itemsProcessed / totalItems`.
   - Frontend muestra barra de progreso real (no falsa 60%).

4. **Auto-refresh al completar:**
   - Al recibir `status: 'completed'`, frontend hace `refreshFromApi()` automáticamente.

5. **Timeout por plataforma:**
   - Cada scraper individual tiene timeout de 15s (edge function).
   - Si timeout: status = 'partial', itemsSaved > 0, logs indican qué plataforma falló.

---

### 2.5 Detail Scraping para TODOS los Activos

**Problema:** Solo top 15 reciben detail page.

**Solución:**

1. **Phase 1 (Listings):** Scrapeo rápido de listado → guardar en DB con `detail_scraped: false`.
2. **Phase 2 (Details):** Procesar en lotes de 10 items cada 2 minutos.
   - Endpoint separado: `POST /api/scrape/details?platform=industrial`.
   - Lee items con `detail_scraped = false` para esa plataforma, limit 10.
   - Scrapea cada detail page con delay de 1s entre requests.
   - Extrae: precio real, descripción completa, specs (año, horas, peso, potencia), imágenes adicionales.
   - Guarda y marca `detail_scraped: true`.
3. **Badge en frontend:**
   - "Análisis completo" (verde) si `detail_scraped = true`.
   - "Análisis parcial" (amarillo) si `detail_scraped = false`.
4. **Recálculo de KPIs tras detail scrape:**
   - Al guardar detail data, re-ejecutar `lib/engine/kpi.ts` con datos actualizados.
   - Guardar nuevos KPIs en DB.

---

### 2.6 Otras Correcciones

| Problema | Solución |
|----------|----------|
| Subastas caducadas | API filtra `auction_end > now()` por defecto. Checkbox "Incluir cerradas" opcional. |
| Solo 1 imagen | API devuelve array `images: []` con hasta 5 URLs. Frontend muestra carrusel. |
| Condition siempre "good" | Scraper intenta detectar de detail page. Fallback: "unknown" (no asumir good). |
| Peso siempre 2000kg | Estimación por categoría si no hay dato real: Robot=500kg, CNC=3000kg, Prensa=8000kg, Línea=15000kg. |
| Buyer Premium hardcoded | Scraper extrae % real de detail page si disponible. Fallback por plataforma (configurable). |
| Descripción = título | Detail page siempre intenta extraer meta description o primer párrafo largo. |

---

## 3. Migración de Datos

1. **Nuevas columnas en `auctions`:**
   - `detail_scraped: boolean (default false)`
   - `data_quality_score: int (0-100)` — % de campos reales vs default
   - `price_confidence: enum ('real', 'estimated', 'unknown')`
   - `geocoded_at: timestamp`

2. **Recálculo batch:**
   - Script `scripts/recalculate-kpis.ts` que lee todos los activos, re-ejecuta motor nuevo, y actualiza DB.
   - Ejecutar una vez tras despliegue.

3. **Geocodificación batch:**
   - Script `scripts/geocode-batch.ts` que procesa items sin `geocoded_at`.
   - Respetar rate limit de Nominatim.

---

## 4. API Changes

### `GET /api/auctions`

**Nuevos query params:**
- `preset`: string — traducido a filtros SQL
- `includeClosed`: boolean — default false, si true no filtra `auction_end`
- `dataQuality`: number — min `data_quality_score` (ej: 50 para excluir items con pocos datos reales)

**Response changes:**
- `assets[].images`: array de `{ url, alt, isPrimary }` (antes solo `imageUrl` string)
- `assets[].kpis`: nuevos campos con fórmulas correctas
- `assets[].dataQuality`: score de 0-100
- `assets[].detailScraped`: boolean
- `assets[].priceConfidence`: enum

### `POST /api/scrape/:platform`

**Response:**
```json
{
  "jobId": "uuid",
  "status": "queued",
  "estimatedDuration": "30-60s"
}
```

### `GET /api/scrape/status?jobId=uuid`

**Response:**
```json
{
  "jobId": "uuid",
  "status": "running",
  "progress": 45,
  "itemsFound": 78,
  "itemsSaved": 35,
  "platform": "industrial",
  "logs": [...],
  "startedAt": "2026-05-19T10:00:00Z",
  "estimatedCompletion": "2026-05-19T10:00:45Z"
}
```

---

## 5. Frontend Changes

### Nuevos Componentes
- `ImageCarousel.tsx` — Carrusel de imágenes en AssetDetail (reemplaza img único)
- `DataQualityBadge.tsx` — Muestra score y badge "Análisis completo/partial"
- `ProgressBar.tsx` — Barra de progreso real en ScraperPanel
- `CategoryCostEditor.tsx` — (Admin) Editor de perfiles de coste por categoría

### Componentes Modificados
- `TacticalMap.tsx` — Usar coordenadas reales, añadir clustering si >50 pins en viewport
- `KPIGrid.tsx` — Nuevos KPIs con tooltips explicativos
- `AssetDetail.tsx` — Mostrar specs reales, carrusel de imágenes, badge de calidad
- `ResultsList.tsx` — Badge "Análisis completo", mostrar precio real vs estimado
- `FilterBar.tsx` — Presets disparan fetch al API, no filtro local
- `useSearch.ts` — Eliminar `applyPreset` local, usar `fetchFiltered` con param `preset`
- `ScraperPanel.tsx` — Polling de progreso real, scrape por plataforma individual

---

## 6. Testing Strategy

1. **Unit tests para `lib/engine/`:**
   - `kpi.test.ts` — Verificar fórmulas con inputs conocidos
   - `transport.test.ts` — Verificar cálculo con peso/distancia conocidos
   - `risk.test.ts` — Verificar score con specs conocidos
   - `resale.test.ts` — Verificar estimación por categoría

2. **Integration tests:**
   - `api/auctions.test.ts` — Verificar que presets devuelven resultados correctos
   - `api/scrape.test.ts` — Verificar flujo de job + polling

3. **E2E tests (Playwright):**
   - Scrapeo → verificar que dashboard muestra nuevos items
   - Click en activo → verificar KPIs no son todos idénticos
   - Filtro por país → verificar mapa muestra pins dispersos
   - Preset → verificar no vacía resultados

---

## 7. Despliegue y Rollback

1. **Feature flags:** Usar `NEXT_PUBLIC_SURUS_V2=1` para activar nuevo motor.
2. **Dual run:** Durante 1 semana, calcular KPIs con motor viejo y nuevo, comparar.
3. **Rollback:** Si hay problemas, desactivar flag vuelve a motor viejo.
4. **Recálculo batch:** Ejecutar `recalculate-kpis.ts` y `geocode-batch.ts` en producción tras despliegue.

---

## 8. Métricas de Éxito

| Métrica | Antes | Objetivo |
|---------|-------|----------|
| % activos con KPIs idénticos | ~80% | < 10% |
| % activos con coordenadas únicas | ~5% | > 90% |
| % activos con descripción real | ~15% | > 70% |
| % activos con peso real o estimado por categoría | 0% | > 80% |
| % presets que devuelven resultados vacíos falsos | ~40% | < 5% |
| Tiempo de scraping sin timeout | < 50% | > 95% |
| User trust en KPIs (subjective) | Bajo | Medio-Alto |

---

## 9. Archivos a Crear/Modificar

### Nuevos archivos (lib/engine/)
- `lib/engine/types.ts`
- `lib/engine/pricing.ts`
- `lib/engine/resale.ts`
- `lib/engine/transport.ts`
- `lib/engine/refurbishment.ts`
- `lib/engine/kpi.ts`
- `lib/engine/risk.ts`
- `lib/engine/geocode.ts`
- `lib/engine/categories.ts`

### Nuevos archivos (scripts/)
- `scripts/recalculate-kpis.ts`
- `scripts/geocode-batch.ts`

### Nuevos archivos (tests/)
- `__tests__/lib/engine/kpi.test.ts`
- `__tests__/lib/engine/transport.test.ts`
- `__tests__/lib/engine/risk.test.ts`
- `__tests__/lib/engine/resale.test.ts`

### Archivos modificados
- `app/api/auctions/route.ts`
- `app/api/scrape/[platform]/route.ts` (nuevo)
- `app/api/scrape/status/route.ts` (nuevo)
- `app/api/scrape/all/route.ts` (modificar para async)
- `lib/scrapers/industrial.ts` (detail scraping para todos)
- `lib/scrapers/resilience.ts` (extractSpecs mejorado)
- `lib/scrapers/resale-estimates.ts` (reemplazar por lib/engine/)
- `lib/calculations.ts` (deprecar, migrar a lib/engine/)
- `lib/supabase/upsert-auctions.ts` (nuevas columnas)
- `hooks/useSearch.ts`
- `components/dashboard/TacticalMap.tsx`
- `components/dashboard/AssetDetail.tsx`
- `components/dashboard/ResultsList.tsx`
- `components/dashboard/KPIGrid.tsx`
- `components/dashboard/FilterBar.tsx`
- `components/dashboard/ScraperPanel.tsx`
- `components/dashboard/ExitStrategies.tsx`

---

## 10. Timeline Estimado

| Fase | Duración | Descripción |
|------|----------|-------------|
| 1. Motor financiero | 2-3 días | lib/engine/ completo con tests |
| 2. Geocodificación | 1-2 días | Nominatim + batch script |
| 3. Presets servidor | 1 día | Endpoint + traducción SQL |
| 4. Scraping async | 2 días | Job queue + polling + progreso |
| 5. Detail scraping | 2 días | Phase 2 para todos los items |
| 6. Frontend updates | 2-3 días | Componentes nuevos + modificados |
| 7. Migración batch | 1 día | Recálculo + geocodificación |
| 8. Testing + fix | 2-3 días | E2E, unit, integration |
| **Total** | **14-17 días** | |

---

> **Nota:** Este diseño asume que el usuario quiere mantener Vercel + Supabase. Si en el futuro se requiere infraestructura más robusta (Redis, Bull, microservicios), se abordará como fase 2.
