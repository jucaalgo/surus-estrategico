'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Asset } from '@/lib/types';
export type SortOption = 'auction_end' | 'roi' | 'arbitrage_score' | 'current_bid' | 'risk_score';

interface UseSearchReturn {
  results: Asset[];
  allAssets: Asset[];
  isSearching: boolean;
  totalResults: number;
  platformsScanned: number;
  elapsed: number;
  error: string | null;
  search: (query: string) => void;
  toggleCountry: (code: string) => void;
  togglePlatform: (id: string) => void;
  applyPreset: (presetId: string) => void;
  clearFilters: () => void;
  setSortBy: (sort: SortOption) => void;
  sortBy: SortOption;
  refreshFromApi: () => void;
  activeCountries: string[];
  activePlatforms: string[];
}

const SORT_FUNCTIONS: Record<SortOption, (a: Asset, b: Asset) => number> = {
  auction_end: (a, b) => (a.timing.auctionEnd || '').localeCompare(b.timing.auctionEnd || ''),
  roi: (a, b) => b.kpis.roi - a.kpis.roi,
  arbitrage_score: (a, b) => b.kpis.arbitrageScore - a.kpis.arbitrageScore,
  current_bid: (a, b) => (a.pricing.currentBid || a.pricing.startingBid || 0) - (b.pricing.currentBid || b.pricing.startingBid || 0),
  risk_score: (a, b) => b.kpis.riskScore - a.kpis.riskScore,
};

export function useSearch(): UseSearchReturn {
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [results, setResults] = useState<Asset[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [platformsScanned, setPlatformsScanned] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeCountries, setActiveCountries] = useState<string[]>([]);
  const [activePlatforms, setActivePlatforms] = useState<string[]>([]);
  const [sortBy, setSortByState] = useState<SortOption>('auction_end');
  const abortRef = useRef<AbortController | null>(null);
  const fetchedRef = useRef(false);

  const sortAndFilter = useCallback((assets: Asset[], countries: string[], platforms: string[], sort: SortOption) => {
    let filtered = assets;
    if (countries.length > 0) {
      filtered = filtered.filter(a => countries.includes(a.location.countryCode));
    }
    if (platforms.length > 0) {
      filtered = filtered.filter(a => platforms.includes(a.platform.id));
    }
    const sortFn = SORT_FUNCTIONS[sort] || SORT_FUNCTIONS.auction_end;
    return [...filtered].sort(sortFn);
  }, []);

  // Core fetch function — always hits the API with explicit params
  const fetchFiltered = useCallback((countries: string[], platforms: string[], sort: SortOption, query?: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsSearching(true);
    setError(null);
    const startTime = Date.now();

    const params = new URLSearchParams({ limit: '200', sort });
    if (query) params.set('q', query);
    if (countries.length) params.set('countries', countries.join(','));
    if (platforms.length) params.set('platforms', platforms.join(','));

    fetch(`/api/auctions?${params}`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .then((data: { assets: Asset[]; total: number }) => {
        setAllAssets(data.assets);
        const sorted = sortAndFilter(data.assets, countries, platforms, sort);
        setResults(sorted);
        setTotalResults(data.total ?? data.assets.length);
        setPlatformsScanned(new Set(data.assets.map(a => a.platform.id)).size);
      })
      .catch((err) => {
        if ((err as Error).name === 'AbortError') return;
        setError((err as Error).message);
      })
      .finally(() => {
        setIsSearching(false);
        setElapsed(Date.now() - startTime);
      });
  }, [sortAndFilter]);

  // Initial fetch on mount
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchFiltered([], [], 'auction_end');
  }, [fetchFiltered]);

  const search = useCallback((query: string) => {
    if (query.length === 0) {
      fetchFiltered(activeCountries, activePlatforms, sortBy);
      setError(null);
      return;
    }
    fetchFiltered(activeCountries, activePlatforms, sortBy, query);
  }, [activeCountries, activePlatforms, sortBy, fetchFiltered]);

  const toggleCountry = useCallback((code: string) => {
    setActiveCountries(prev => {
      const next = prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code];
      fetchFiltered(next, activePlatforms, sortBy);
      return next;
    });
  }, [activePlatforms, sortBy, fetchFiltered]);

  const togglePlatform = useCallback((id: string) => {
    setActivePlatforms(prev => {
      const next = prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id];
      fetchFiltered(activeCountries, next, sortBy);
      return next;
    });
  }, [activeCountries, sortBy, fetchFiltered]);

  const applyPreset = useCallback((presetId: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsSearching(true);
    setError(null);
    const startTime = Date.now();

    const params = new URLSearchParams({ limit: '200', sort: sortBy, preset: presetId });
    if (activeCountries.length) params.set('countries', activeCountries.join(','));
    if (activePlatforms.length) params.set('platforms', activePlatforms.join(','));

    fetch(`/api/auctions?${params}`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .then((data: { assets: Asset[]; total: number }) => {
        setAllAssets(data.assets);
        setResults(data.assets);
        setTotalResults(data.total ?? data.assets.length);
        setPlatformsScanned(new Set(data.assets.map(a => a.platform.id)).size);
      })
      .catch((err) => {
        if ((err as Error).name === 'AbortError') return;
        setError((err as Error).message);
      })
      .finally(() => {
        setIsSearching(false);
        setElapsed(Date.now() - startTime);
      });
  }, [activeCountries, activePlatforms, sortBy]);

  const clearFilters = useCallback(() => {
    setActiveCountries([]);
    setActivePlatforms([]);
    fetchFiltered([], [], sortBy);
  }, [sortBy, fetchFiltered]);

  const setSortBy = useCallback((sort: SortOption) => {
    setSortByState(sort);
    fetchFiltered(activeCountries, activePlatforms, sort);
  }, [activeCountries, activePlatforms, fetchFiltered]);

  const refreshFromApi = useCallback(() => {
    fetchFiltered(activeCountries, activePlatforms, sortBy);
  }, [activeCountries, activePlatforms, sortBy, fetchFiltered]);

  return {
    results, allAssets, isSearching, totalResults, platformsScanned, elapsed, error,
    search, toggleCountry, togglePlatform, applyPreset, clearFilters, setSortBy, sortBy,
    refreshFromApi,
    activeCountries, activePlatforms,
  };
}
