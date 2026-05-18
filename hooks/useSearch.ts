'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Asset } from '@/lib/types';
import { getActiveAssets } from '@/lib/mock-data';

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
  const [allAssets, setAllAssets] = useState<Asset[]>(getActiveAssets());
  const [results, setResults] = useState<Asset[]>(getActiveAssets());
  const [isSearching, setIsSearching] = useState(false);
  const [totalResults, setTotalResults] = useState(getActiveAssets().length);
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
      filtered = filtered.filter(a => platforms.includes(a.platform.name) || platforms.includes(a.platform.id));
    }
    const sortFn = SORT_FUNCTIONS[sort] || SORT_FUNCTIONS.auction_end;
    return [...filtered].sort(sortFn);
  }, []);

  // Fetch from /api/auctions on mount (Supabase primary, mock fallback)
  const fetchFromApi = useCallback(() => {
    const params = new URLSearchParams({ limit: '200', sort: sortBy });
    fetch(`/api/auctions?${params}`)
      .then(res => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .then((data: { assets: Asset[]; total: number; source: string }) => {
        if (data.assets && data.assets.length > 0) {
          const sorted = sortAndFilter(data.assets, activeCountries, activePlatforms, sortBy);
          setAllAssets(data.assets);
          setResults(sorted);
          setTotalResults(data.total || data.assets.length);
          setPlatformsScanned(new Set(data.assets.map(a => a.platform.id)).size);
        }
      })
      .catch(() => {
        // Fallback to mock data (already loaded as initial state)
      });
  }, [sortBy, activeCountries, activePlatforms, sortAndFilter]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchFromApi();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const search = useCallback((query: string) => {
    if (query.length < 2) {
      const sorted = sortAndFilter(allAssets, activeCountries, activePlatforms, sortBy);
      setResults(sorted);
      setTotalResults(sorted.length);
      setError(null);
      return;
    }

    setIsSearching(true);
    setError(null);
    const startTime = Date.now();

    // Local filter first for instant feedback
    const q = query.toLowerCase();
    const localResults = sortAndFilter(allAssets, activeCountries, activePlatforms, sortBy).filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.location.city.toLowerCase().includes(q) ||
      a.location.country.toLowerCase().includes(q) ||
      (a.specs.make && a.specs.make.toLowerCase().includes(q))
    );
    setResults(localResults);
    setTotalResults(localResults.length);

    // Then try /api/auctions for server-side search (supports Supabase textSearch)
    if (query.length >= 3) {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const params = new URLSearchParams({ q: query, limit: '100', sort: sortBy });
      if (activeCountries.length) params.set('countries', activeCountries.join(','));
      if (activePlatforms.length) params.set('platforms', activePlatforms.join(','));

      fetch(`/api/auctions?${params}`, { signal: controller.signal })
        .then(res => {
          if (!res.ok) throw new Error(`${res.status}`);
          return res.json();
        })
        .then((data: { assets: Asset[]; total: number }) => {
          if (data.assets && data.assets.length > 0) {
            const sorted = sortAndFilter(data.assets, activeCountries, activePlatforms, sortBy);
            setResults(sorted);
            setTotalResults(data.total || data.assets.length);
            setPlatformsScanned(new Set(data.assets.map(a => a.platform.id)).size);
          }
        })
        .catch((err) => {
          if ((err as Error).name === 'AbortError') return;
          // Keep local results, just clear the error
        })
        .finally(() => {
          setIsSearching(false);
          setElapsed(Date.now() - startTime);
        });
    } else {
      setIsSearching(false);
      setElapsed(Date.now() - startTime);
    }
  }, [activeCountries, activePlatforms, sortBy, allAssets, sortAndFilter]);

  const toggleCountry = useCallback((code: string) => {
    setActiveCountries(prev => {
      const next = prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code];
      const sorted = sortAndFilter(allAssets, next, activePlatforms, sortBy);
      setResults(sorted);
      setTotalResults(sorted.length);
      return next;
    });
  }, [activePlatforms, allAssets, sortBy, sortAndFilter]);

  const togglePlatform = useCallback((id: string) => {
    setActivePlatforms(prev => {
      const next = prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id];
      const sorted = sortAndFilter(allAssets, activeCountries, next, sortBy);
      setResults(sorted);
      setTotalResults(sorted.length);
      return next;
    });
  }, [activeCountries, allAssets, sortBy, sortAndFilter]);

  const applyPreset = useCallback((presetId: string) => {
    const presets: Record<string, (a: Asset) => boolean> = {
      insolvencias: a => a.timing.timeRemainingMs < 48 * 3600000,
      liquidaciones: a => a.description.toLowerCase().includes('planta') || a.description.toLowerCase().includes('liquidación'),
      'sin-reserva': a => !a.pricing.hasReserve,
      gangas: a => a.kpis.isGanga,
      alimentaria: a => a.description.toLowerCase().includes('alimentaria') || (a.subcategory?.toLowerCase().includes('stainless') ?? false),
      robotica: a => a.category === 'Robótica' || a.title.toLowerCase().includes('robot') || a.title.toLowerCase().includes('kuka'),
    };
    const filter = presets[presetId];
    if (filter) {
      const filtered = allAssets.filter(filter);
      const sorted = sortAndFilter(filtered, activeCountries, activePlatforms, sortBy);
      setResults(sorted);
      setTotalResults(sorted.length);
    }
  }, [allAssets, activeCountries, activePlatforms, sortBy, sortAndFilter]);

  const clearFilters = useCallback(() => {
    setActiveCountries([]);
    setActivePlatforms([]);
    const sorted = sortAndFilter(allAssets, [], [], sortBy);
    setResults(sorted);
    setTotalResults(sorted.length);
  }, [allAssets, sortBy, sortAndFilter]);

  const setSortBy = useCallback((sort: SortOption) => {
    setSortByState(sort);
    const sorted = sortAndFilter(allAssets, activeCountries, activePlatforms, sort);
    setResults(sorted);
    setTotalResults(sorted.length);
  }, [allAssets, activeCountries, activePlatforms, sortAndFilter]);

  return {
    results, allAssets, isSearching, totalResults, platformsScanned, elapsed, error,
    search, toggleCountry, togglePlatform, applyPreset, clearFilters, setSortBy, sortBy,
    refreshFromApi: fetchFromApi,
    activeCountries, activePlatforms,
  };
}