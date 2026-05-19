'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { SmartPreset } from '@/lib/types';

const STORAGE_KEY = 'surus-search-history';

const smartPresets: SmartPreset[] = [
  { id: 'insolvencias', label: 'Insolvencias Inminentes (Cierre < 48h)', icon: 'URG', filter: () => true },
  { id: 'liquidaciones', label: 'Liquidaciones de Plantas Completas', icon: 'PLT', filter: () => true },
  { id: 'sin-reserva', label: 'Activos Sin Precio de Reserva', icon: 'NRV', filter: () => true },
  { id: 'gangas', label: 'Lotes con Alta Desviacion de Mercado', icon: 'GNG', filter: () => true },
  { id: 'alimentaria', label: 'Industria Alimentaria (Acero Inoxidable)', icon: 'FOO', filter: () => true },
  { id: 'robotica', label: 'Robotica y Automatizacion Pesada', icon: 'RBT', filter: () => true },
];

interface SearchBarProps {
  onSearch: (query: string) => void;
  onPreset: (preset: SmartPreset) => void;
  isSearching: boolean;
}

export function SearchBar({ onSearch, onPreset, isSearching }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowAutocomplete(false);
        setShowPresets(false);
        setShowHistory(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    onSearch(query.trim());
    const updated = [query.trim(), ...history.filter(h => h !== query.trim())].slice(0, 10);
    setHistory(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
    setShowAutocomplete(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleHistorySelect = (item: string) => {
    setQuery(item);
    onSearch(item);
    setShowHistory(false);
  };

  const [activePreset, setActivePreset] = useState<SmartPreset | null>(null);

  const handlePresetSelect = (preset: SmartPreset) => {
    setActivePreset(preset);
    onPreset(preset);
    setShowPresets(false);
  };

  const clearPreset = () => {
    setActivePreset(null);
    setQuery('');
    onSearch('');
  };

  const autocompleteItems = query.length > 0
    ? smartPresets.filter(p => p.label.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  return (
    <div className="flex items-center gap-2" ref={wrapperRef}>
      <div className="relative flex-1">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="7" cy="7" r="5" /><path d="M11 11l3.5 3.5" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setShowAutocomplete(e.target.value.length > 0); setShowPresets(false); setShowHistory(false); }}
            onFocus={() => { if (query.length > 0) setShowAutocomplete(true); }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar activos, categorias, plataformas..."
            className="w-full rounded-lg border border-[#1e1e38] bg-[#0a0a1a] py-2 pl-9 pr-3 text-sm text-gray-200 placeholder-gray-600 font-mono focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/20"
          />
          {isSearching && (
            <svg className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#00ff88]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </div>
        {showAutocomplete && autocompleteItems.length > 0 && (
          <div className="absolute z-30 mt-1 w-full rounded-lg border border-[#1e1e38] bg-[#0a0a1a] py-1 shadow-xl">
            {autocompleteItems.map(item => (
              <button key={item.id} onClick={() => handlePresetSelect(item)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-300 hover:bg-[#1e1e38] font-mono">
                <span className="text-[10px] font-bold text-[#00ccff]">[{item.icon}]</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {activePreset && (
        <div className="flex items-center gap-1.5 rounded-lg border border-[#00ccff]/30 bg-[#00ccff]/10 px-2.5 py-1.5">
          <span className="text-[10px] font-bold text-[#00ccff] font-mono">[{activePreset.icon}]</span>
          <span className="text-[10px] text-gray-300 font-mono truncate max-w-[120px]">{activePreset.label}</span>
          <button onClick={clearPreset} className="text-gray-500 hover:text-white text-xs leading-none ml-1">×</button>
        </div>
      )}

      <div className="relative">
        <button onClick={() => { setShowPresets(!showPresets); setShowHistory(false); }} className="rounded-lg border border-[#1e1e38] bg-[#0a0a1a] px-3 py-2 text-xs font-mono uppercase text-gray-400 hover:bg-[#1e1e38] hover:text-gray-200 transition-colors" title="Presets estrategicos">
          PRESETS
        </button>
        {showPresets && (
          <div className="absolute right-0 z-30 mt-1 w-72 rounded-lg border border-[#1e1e38] bg-[#0a0a1a] py-1 shadow-xl">
            {smartPresets.map(preset => (
              <button key={preset.id} onClick={() => handlePresetSelect(preset)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-300 hover:bg-[#1e1e38] font-mono">
                <span className="text-[10px] font-bold text-[#00ccff]">[{preset.icon}]</span>
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <button onClick={() => { setShowHistory(!showHistory); setShowPresets(false); }} className="rounded-lg border border-[#1e1e38] bg-[#0a0a1a] px-3 py-2 text-xs font-mono uppercase text-gray-400 hover:bg-[#1e1e38] hover:text-gray-200 transition-colors" title="Historial de busquedas">
          HIST
        </button>
        {showHistory && history.length > 0 && (
          <div className="absolute right-0 z-30 mt-1 w-64 rounded-lg border border-[#1e1e38] bg-[#0a0a1a] py-1 shadow-xl">
            <div className="px-3 py-1 text-[10px] uppercase text-gray-600 font-mono">Ultimas busquedas</div>
            {history.map((item, idx) => (
              <button key={idx} onClick={() => handleHistorySelect(item)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-300 hover:bg-[#1e1e38] font-mono truncate">
                <span className="text-[10px] text-gray-600">{idx + 1}.</span>
                <span className="truncate">{item}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button onClick={handleSearch} disabled={!query.trim() || isSearching} className="rounded-lg border border-[#00ff88]/30 bg-[#00ff88]/15 px-4 py-2 text-xs font-bold font-mono uppercase tracking-wide text-[#00ff88] hover:bg-[#00ff88]/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
        {isSearching ? 'BUSCANDO...' : 'BUSCAR'}
      </button>
    </div>
  );
}
