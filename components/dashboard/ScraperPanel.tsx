'use client';

import { useState, useCallback } from 'react';

interface ScrapeResult {
  success: boolean;
  platform: string;
  itemsFound?: number;
  itemsUpserted?: number;
  itemsDeactivated?: number;
  durationMs?: number;
  error?: string;
}

interface PlatformStatus {
  platform_id: string;
  status: string;
  items_found?: number;
  items_upserted?: number;
  started_at?: string;
  finished_at?: string;
  error_message?: string;
}

const PLATFORMS = [
  { id: 'tbauctions', name: 'Surplex + Troostwijk + Maynards', icon: '🏭' },
  { id: 'netbid', name: 'NetBid / Auctelia', icon: '📋' },
  { id: 'industrial', name: 'Industrial Auctions', icon: '🔧' },
];

interface ScraperPanelProps {
  onScrapeComplete?: () => void;
}

export function ScraperPanel({ onScrapeComplete }: ScraperPanelProps) {
  const [results, setResults] = useState<Record<string, ScrapeResult>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [platformStatus, setPlatformStatus] = useState<Record<string, PlatformStatus> | null>(null);
  const [totalAuctions, setTotalAuctions] = useState<number | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [resetting, setResetting] = useState(false);

  const runScraper = useCallback(async (platformId: string) => {
    setLoading(prev => ({ ...prev, [platformId]: true }));
    setResults(prev => ({ ...prev, [platformId]: { success: false, platform: platformId } }));

    try {
      const res = await fetch(`/api/scrape/${platformId}`, { method: 'POST' });
      const data = await res.json();
      setResults(prev => ({ ...prev, [platformId]: data }));
      // Auto-refresh after successful scrape
      if (data.success && onScrapeComplete) {
        onScrapeComplete();
      }
    } catch (err) {
      setResults(prev => ({
        ...prev,
        [platformId]: { success: false, platform: platformId, error: err instanceof Error ? err.message : 'Network error' },
      }));
    } finally {
      setLoading(prev => ({ ...prev, [platformId]: false }));
    }
  }, [onScrapeComplete]);

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/scrape/status');
      const data = await res.json();
      setPlatformStatus(data.platforms || {});
      setTotalAuctions(data.totalAuctions || 0);
    } catch {
      // Ignore status fetch errors
    }
  }, []);

  const resetDatabase = useCallback(async () => {
    if (!window.confirm('Se eliminaran todos los datos de subastas y se restauraran los 10 lotes de ejemplo. Continuar?')) return;

    setResetting(true);
    try {
      const res = await fetch('/api/admin/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`Base de datos reseteada: ${data.count} lotes de ejemplo restaurados.`);
        refreshStatus();
        if (onScrapeComplete) onScrapeComplete();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert(`Error de red: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setResetting(false);
    }
  }, [refreshStatus, onScrapeComplete]);

  if (!showPanel) {
    return (
      <button
        onClick={() => { setShowPanel(true); refreshStatus(); }}
        className="fixed bottom-4 left-4 z-50 bg-[#0d0d2b] border border-[#00ccff]/30 text-[#00ccff] px-3 py-2 rounded-lg text-xs font-mono hover:bg-[#00ccff]/10 transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        Scrapers
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-[420px] bg-[#0a0a1a] border border-[#1e1e38] rounded-xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e38]">
        <h3 className="text-[#00ccff] font-mono text-sm font-bold">Scraper Control Panel</h3>
        <button onClick={() => setShowPanel(false)} className="text-gray-500 hover:text-white text-lg leading-none">&times;</button>
      </div>

      {totalAuctions !== null && (
        <div className="px-4 py-2 bg-[#0d0d2b] border-b border-[#1e1e38] flex items-center justify-between">
          <span className="text-gray-400 text-xs font-mono">Subastas activas en BD:</span>
          <span className="text-[#00ff88] text-sm font-mono font-bold">{totalAuctions}</span>
        </div>
      )}

      <div className="p-3 space-y-2">
        {PLATFORMS.map(platform => {
          const isLoading = loading[platform.id];
          const result = results[platform.id];
          const status = platformStatus?.[platform.id];

          return (
            <div key={platform.id} className="bg-[#0d0d2b] rounded-lg p-3 border border-[#1e1e38]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{platform.icon}</span>
                  <span className="text-white text-sm font-mono">{platform.name}</span>
                </div>
                <button
                  onClick={() => runScraper(platform.id)}
                  disabled={isLoading}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors ${
                    isLoading
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-[#00ccff]/20 text-[#00ccff] hover:bg-[#00ccff]/30'
                  }`}
                >
                  {isLoading ? 'Ejecutando...' : 'Ejecutar'}
                </button>
              </div>

              {/* Last run status */}
              {status && (
                <div className="text-[10px] text-gray-500 font-mono mb-1">
                  Ultima ejecucion: {status.started_at ? new Date(status.started_at).toLocaleString('es-ES') : 'N/A'}
                  {status.items_found !== undefined && ` | ${status.items_found} lotes encontrados`}
                </div>
              )}

              {/* Current run result */}
              {result && (
                <div className={`text-[10px] font-mono mt-1 p-1.5 rounded ${
                  result.success ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-red-500/10 text-red-400'
                }`}>
                  {result.success ? (
                    <>{result.itemsFound} encontrados, {result.itemsUpserted} guardados ({((result.durationMs || 0) / 1000).toFixed(1)}s)</>
                  ) : (
                    <>Error: {result.error}</>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-4 py-2 border-t border-[#1e1e38] flex gap-2">
        <button
          onClick={refreshStatus}
          className="flex-1 text-[10px] text-gray-500 hover:text-gray-300 font-mono text-center py-1"
        >
          ↻ Refrescar estado
        </button>
        <button
          onClick={resetDatabase}
          disabled={resetting}
          className={`flex-1 text-[10px] font-mono text-center py-1 rounded border ${
            resetting
              ? 'border-gray-700 text-gray-600 cursor-not-allowed'
              : 'border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300'
          }`}
        >
          {resetting ? 'Reseteando...' : '🔄 Reset BD'}
        </button>
      </div>
    </div>
  );
}