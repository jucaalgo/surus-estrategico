'use client';

import { useState, useCallback } from 'react';
import type { Asset } from '@/lib/types';

interface UseAssetsReturn {
  selectedAsset: Asset | null;
  selectAsset: (asset: Asset | null) => void;
  watchlist: Asset[];
  addToWatchlist: (asset: Asset) => void;
  removeFromWatchlist: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
}

export function useAssets(): UseAssetsReturn {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [watchlist, setWatchlist] = useState<Asset[]>([]);

  const selectAsset = useCallback((asset: Asset | null) => {
    setSelectedAsset(asset);
  }, []);

  const addToWatchlist = useCallback((asset: Asset) => {
    setWatchlist(prev => {
      if (prev.some(a => a.id === asset.id)) return prev;
      return [...prev, asset];
    });
  }, []);

  const removeFromWatchlist = useCallback((id: string) => {
    setWatchlist(prev => prev.filter(a => a.id !== id));
  }, []);

  const isInWatchlist = useCallback((id: string) => {
    return watchlist.some(a => a.id === id);
  }, [watchlist]);

  return { selectedAsset, selectAsset, watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist };
}