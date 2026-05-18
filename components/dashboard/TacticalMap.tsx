'use client';

import React, { useEffect, useRef } from 'react';
import type { Asset } from '@/lib/types';

interface TacticalMapProps {
  assets: Asset[];
  selectedAsset: Asset | null;
  onAssetClick: (asset: Asset) => void;
}

const PROFIT_LEVELS = [
  { minROI: 60, color: '#00ff88', label: 'Ganga', description: 'ROI > 60%' },
  { minROI: 40, color: '#c8e600', label: 'Alta rent.', description: 'ROI 40-60%' },
  { minROI: 20, color: '#ff9800', label: 'Rentable', description: 'ROI 20-40%' },
  { minROI: 1,  color: '#ff1744', label: 'Marginal', description: 'ROI < 20%' },
  { minROI: -Infinity, color: '#666666', label: 'Sin datos', description: 'ROI = 0' },
];

function getMarkerColor(roi: number): string {
  for (const level of PROFIT_LEVELS) {
    if (roi >= level.minROI) return level.color;
  }
  return '#666666';
}

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

        const color = getMarkerColor(asset.kpis.roi);
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