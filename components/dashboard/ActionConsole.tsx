'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

interface ActionConsoleProps {
  onSimulatorOpen: () => void;
  onWatchlistAdd: () => void;
  onBid: () => void;
  hasSelectedAsset: boolean;
  isInWatchlist: boolean;
}

export function ActionConsole({
  onSimulatorOpen,
  onWatchlistAdd,
  onBid,
  hasSelectedAsset,
  isInWatchlist,
}: ActionConsoleProps) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-[#1e1e38] bg-[#050510]/95 backdrop-blur-sm px-4 py-3">
      <div className="mx-auto max-w-[1600px] flex items-center justify-end gap-3">
        <Button
          variant="secondary"
          size="md"
          onClick={onSimulatorOpen}
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 14L5 10M10 2L14 6M3 8h4v4" />
          </svg>
          Simulador ROI
        </Button>

        <Button
          variant={isInWatchlist ? 'ghost' : 'primary'}
          size="md"
          onClick={onWatchlistAdd}
          disabled={!hasSelectedAsset}
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 1l2 5h5l-4 3 1.5 5L8 11 3.5 14 5 9 1 6h5z" />
          </svg>
          {isInWatchlist ? 'En Watchlist' : 'Guardar Watchlist'}
        </Button>

        <Button
          variant="danger"
          size="md"
          onClick={onBid}
          disabled={!hasSelectedAsset}
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 2h12v8H2z" /><path d="M6 10v4M10 10v4M4 14h8" />
          </svg>
          Ir a la Puja
        </Button>
      </div>
    </div>
  );
}
