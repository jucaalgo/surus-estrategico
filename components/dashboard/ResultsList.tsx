'use client';

import React, { useState } from 'react';
import type { Asset } from '@/lib/types';
import { formatCurrency } from '@/lib/calculations';
import { Badge } from '@/components/ui/Badge';
import type { SortOption } from '@/hooks/useSearch';

const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
  { value: 'auction_end', label: 'Cerrando pronto', icon: '⏰' },
  { value: 'roi', label: 'Mayor ROI', icon: '📈' },
  { value: 'arbitrage_score', label: 'Mayor Arbitraje', icon: '🎯' },
  { value: 'current_bid', label: 'Menor Precio', icon: '💰' },
  { value: 'risk_score', label: 'Menor Riesgo', icon: '⚠️' },
];

interface ResultsListProps {
  assets: Asset[];
  selectedAsset: Asset | null;
  onSelect: (asset: Asset) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

function getROIBadgeVariant(roi: number): 'success' | 'warning' | 'urgent' {
  if (roi >= 40) return 'success';
  if (roi >= 20) return 'warning';
  return 'urgent';
}

function getCountryFlag(code: string): string {
  const flags: Record<string, string> = {
    ES: 'ES', DE: 'DE', NL: 'NL', FR: 'FR', IT: 'IT', UK: 'UK',
  };
  return flags[code] || code;
}

export function ResultsList({ assets, selectedAsset, onSelect, sortBy, onSortChange }: ResultsListProps) {
  const [showCount, setShowCount] = useState(15);

  if (assets.length === 0) {
    return (
      <div className="rounded-lg border border-[#1e1e38] bg-[#0a0a1a] p-4">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">Resultados</h3>
        <div className="flex h-32 items-center justify-center text-sm text-gray-600 font-mono">
          Ejecuta una busqueda para ver resultados
        </div>
      </div>
    );
  }

  const visibleAssets = assets.slice(0, showCount);
  const hasMore = showCount < assets.length;

  return (
    <div className="rounded-lg border border-[#1e1e38] bg-[#0a0a1a] overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#1e1e38] px-4 py-2">
        <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500">Resultados</h3>
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-[#0d0d2b] border border-[#1e1e38] text-gray-400 text-[10px] font-mono rounded px-2 py-1 focus:outline-none focus:border-[#00ccff]/50"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
            ))}
          </select>
          <span className="text-[10px] font-mono text-gray-600">
            {assets.length} resultado{assets.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <div className="max-h-[340px] overflow-y-auto divide-y divide-[#1e1e38]">
        {visibleAssets.map(asset => {
          const isSelected = selectedAsset?.id === asset.id;
          const roiVariant = getROIBadgeVariant(asset.kpis.roi);

          return (
            <button
              key={asset.id}
              onClick={() => onSelect(asset)}
              className={`
                w-full text-left px-4 py-3 transition-colors
                ${isSelected
                  ? 'bg-[#00ccff]/10 border-l-2 border-l-[#00ccff]'
                  : 'bg-transparent hover:bg-[#1e1e38]/50 border-l-2 border-l-transparent'
                }
              `}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-gray-600 font-mono">
                      [{getCountryFlag(asset.location.countryCode)}]
                    </span>
                    <span className="text-[10px] text-gray-600 font-mono">
                      {asset.platform.name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300 font-mono truncate">
                    {asset.title}
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <div className="text-sm font-bold text-gray-200 font-mono">
                    {formatCurrency(asset.pricing.currentBid || asset.pricing.startingBid || 0)}
                  </div>
                  <Badge variant={roiVariant} size="sm">
                    ROI {asset.kpis.roi.toFixed(0)}%
                  </Badge>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {hasMore && (
        <button
          onClick={() => setShowCount(prev => prev + 15)}
          className="w-full py-2 text-xs font-mono text-[#00ccff] hover:text-white border-t border-[#1e1e38] bg-[#0d0d2b] hover:bg-[#1e1e38]/50 transition-colors"
        >
          Cargar mas ({assets.length - showCount} restantes)
        </button>
      )}
    </div>
  );
}