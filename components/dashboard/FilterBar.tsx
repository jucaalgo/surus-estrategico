'use client';

import React from 'react';

const COUNTRIES = [
  { code: 'ES', label: 'ES' },
  { code: 'DE', label: 'DE' },
  { code: 'NL', label: 'NL' },
  { code: 'FR', label: 'FR' },
  { code: 'IT', label: 'IT' },
  { code: 'UK', label: 'UK' },
];

const PLATFORMS = ['Surplex', 'Troostwijk', 'NetBid', 'Industrial Auctions', 'Maynards', 'BidSpotter'];

interface FilterBarProps {
  activeCountries: string[];
  activePlatforms: string[];
  onCountryFilter: (country: string) => void;
  onPlatformFilter: (platform: string) => void;
  onClear: () => void;
}

export function FilterBar({
  activeCountries,
  activePlatforms,
  onCountryFilter,
  onPlatformFilter,
  onClear,
}: FilterBarProps) {
  const hasFilters = activeCountries.length > 0 || activePlatforms.length > 0;

  return (
    <div className="border-b border-[#1e1e38] px-4 py-2">
      <div className="mx-auto max-w-[1600px] flex flex-wrap items-center gap-3">
        {/* Country pills */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] uppercase text-gray-600 font-mono mr-1">Pais:</span>
          {COUNTRIES.map(c => {
            const isActive = activeCountries.includes(c.code);
            return (
              <button
                key={c.code}
                onClick={() => onCountryFilter(c.code)}
                className={`
                  rounded px-2 py-0.5 text-xs font-mono font-bold transition-colors border
                  ${isActive
                    ? 'bg-[#00ccff]/15 text-[#00ccff] border-[#00ccff]/30'
                    : 'bg-[#0a0a1a] text-gray-500 border-[#1e1e38] hover:border-gray-600 hover:text-gray-400'
                  }
                `}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <div className="h-4 w-px bg-[#1e1e38]" />

        {/* Platform pills */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] uppercase text-gray-600 font-mono mr-1">Plataforma:</span>
          {PLATFORMS.map(p => {
            const isActive = activePlatforms.includes(p);
            return (
              <button
                key={p}
                onClick={() => onPlatformFilter(p)}
                className={`
                  rounded px-2 py-0.5 text-xs font-mono transition-colors border
                  ${isActive
                    ? 'bg-[#00ccff]/15 text-[#00ccff] border-[#00ccff]/30'
                    : 'bg-[#0a0a1a] text-gray-500 border-[#1e1e38] hover:border-gray-600 hover:text-gray-400'
                  }
                `}
              >
                {p}
              </button>
            );
          })}
        </div>

        <div className="h-4 w-px bg-[#1e1e38]" />

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={onClear}
            className="rounded-lg border border-[#1e1e38] bg-[#0a0a1a] px-3 py-1 text-xs font-mono uppercase text-gray-500 hover:text-[#ff1744] hover:border-[#ff1744]/30 transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
