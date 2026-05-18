'use client';

import { useState, useCallback } from 'react';
import type { Asset, CalculatedKPIs, ROIInputs } from '@/lib/types';
import { calculateROI } from '@/lib/calculations';

interface UseROISimulatorReturn {
  isOpen: boolean;
  open: (asset?: Asset) => void;
  close: () => void;
  inputs: ROIInputs;
  setInputs: (inputs: ROIInputs) => void;
  results: CalculatedKPIs | null;
  calculate: () => void;
}

const defaultInputs: ROIInputs = {
  investment: 50000,
  logisticsCost: 3000,
  estimatedResale: 85000
};

export function useROISimulator(): UseROISimulatorReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [inputs, setInputs] = useState<ROIInputs>(defaultInputs);
  const [results, setResults] = useState<CalculatedKPIs | null>(null);

  const open = useCallback((asset?: Asset) => {
    if (asset) {
      const bid = asset.pricing.currentBid || 0;
      const resale = asset.pricing.estimatedResale || 0;
      const newInputs: ROIInputs = {
        investment: bid,
        logisticsCost: asset.kpis.transport || 3000,
        estimatedResale: resale,
      };
      setInputs(newInputs);
      setResults(calculateROI(newInputs));
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const calculate = useCallback(() => {
    setResults(calculateROI(inputs));
  }, [inputs]);

  return { isOpen, open, close, inputs, setInputs, results, calculate };
}