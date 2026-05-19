'use client';

import React, { useEffect, useRef } from 'react';
import type { Asset } from '@/lib/types';

interface TacticalMapProps {
  assets: Asset[];
  selectedAsset: Asset | null;
  onAssetClick: (asset: Asset) => void;
}

// Composite scoring: combines ROI, risk, arbitrage, and data quality
function getMarkerColor(asset: Asset): string {
  const { roi, arbitrageScore, riskScore, isGanga } = asset.kpis;
  const hasData = asset.pricing.currentBid != null && asset.pricing.currentBid > 0;
  const goodQuality = (asset.dataQuality ?? 0) >= 30;

  if (!hasData && !goodQuality) return '#666666'; // Grey = no data

  // Ganga = isGanga flag (arbitrage >= 1.8, ROI >= 30, risk <= 55)
  if (isGanga) return '#00ff88'; // Bright green

  // Excellent opportunity: high ROI + low risk
  if (roi >= 40 && riskScore <= 40) return '#c8e600'; // Lime

  // Good opportunity: decent ROI + manageable risk
  if (roi >= 20 && riskScore <= 55) return '#ff9800'; // Orange

  // Risky but potentially profitable
  if (roi >= 15 || arbitrageScore >= 1.2) return '#ff5722'; // Deep orange

  // Poor / high risk
  if (roi < 15 || riskScore > 55) return '#ff1744'; // Red

  return '#666666';
}

const PROFIT_LEVELS = [
  { color: '#00ff88', label: 'Ganga', description: 'ROI >=30, Score >=1.8, Riesgo Bajo' },
  { color: '#c8e600', label: 'Excelente', description: 'ROI >=40, Riesgo <=40' },
  { color: '#ff9800', label: 'Rentable', description: 'ROI >=20, Riesgo <=55' },
  { color: '#ff5722', label: 'Arriesgado', description: 'ROI >=15 o Score >=1.2' },
  { color: '#ff1744', label: 'Marginal', description: 'ROI < 15 o Riesgo > 55' },
  { color: '#666666', label: 'Sin datos', description: 'Sin precio ni calidad' },
];

export function TacticalMap({ assets, selectedAsset, onAssetClick }: TacticalMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = L.map(mapRef.current!, {
        center: [48, 4],
        zoom: 4,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || assets.length === 0) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current!;
      // Clear existing markers
      markersRef.current.forEach(m => map.removeLayer(m));
      markersRef.current = [];

      const bounds: L.LatLngBounds = L.latLngBounds([]);

      assets.forEach(asset => {
        const { lat, lng } = asset.location;
        if (!lat || !lng) return;

        const color = getMarkerColor(asset);
        const isSelected = selectedAsset?.id === asset.id;

        const marker = L.circleMarker([lat, lng], {
          radius: isSelected ? 10 : 7,
          fillColor: color,
          color: isSelected ? '#ffffff' : color,
          weight: isSelected ? 3 : 1,
          opacity: 0.9,
          fillOpacity: 0.6,
        }).addTo(map);

        marker.bindTooltip(
          `<div style="font-family: monospace; font-size: 11px;">
            <div style="font-weight: bold; margin-bottom: 2px;">${asset.title}</div>
            <div>Margin: ${asset.kpis.netProfitMargin.toFixed(1)}%</div>
            <div>ROI: ${asset.kpis.roi.toFixed(1)}%</div>
          </div>`,
          { direction: 'top', offset: [0, -8] }
        );

        marker.on('click', () => onAssetClick(asset));

        bounds.extend([lat, lng]);
        markersRef.current.push(marker);
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    });
  }, [assets, selectedAsset, onAssetClick]);

  const geoCount = assets.filter(a => a.location.lat && a.location.lng).length;

  return (
    <div className="rounded-lg border border-[#1e1e38] bg-[#0a0a1a] overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#1e1e38] px-4 py-2">
        <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500">
          Mapa Tactico
        </h3>
        <span className="text-[10px] font-mono text-[#00ccff]">
          {geoCount} pines georreferenciados
        </span>
      </div>
      <div className="relative">
        <div
          ref={mapRef}
          className="h-[320px] w-full"
          style={{ minHeight: '320px' }}
        />
        {/* Legend */}
        <div className="absolute bottom-3 right-3 bg-[#0a0a1a]/90 border border-[#1e1e38] rounded-lg px-3 py-2 backdrop-blur-sm">
          <div className="text-[9px] uppercase text-gray-500 font-mono mb-1.5 tracking-wider">Rentabilidad</div>
          {PROFIT_LEVELS.map(level => (
            <div key={level.label} className="flex items-center gap-2 mb-0.5">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: level.color }} />
              <span className="text-[10px] font-mono text-gray-400">{level.label}</span>
              <span className="text-[9px] font-mono text-gray-600">{level.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}