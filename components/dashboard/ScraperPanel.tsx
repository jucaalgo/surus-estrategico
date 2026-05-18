'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

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

interface LogEntry {
  timestamp: string;
  platform: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

interface PlatformResult {
  platformId: string;
  success: boolean;
  itemsFound: number;
  itemsUpserted: number;
  itemsDeactivated: number;
  durationMs: number;
  error?: string;
}

interface AllScrapeResult {
  success: boolean;
  platforms: PlatformResult[];
  summary: {
    totalFound: number;
    totalUpserted: number;
    totalDeactivated: number;
    totalDurationMs: number;
    successfulPlatforms: number;
    failedPlatforms: number;
  };
}

const PLATFORMS = [
  { id: 'tbauctions', name: 'Surplex + Troostwijk + BVA', icon: '🏭', color: '#00ccff' },
  { id: 'netbid', name: 'NetBid / Auctelia', icon: '📋', color: '#ff6b35' },
  { id: 'industrial', name: 'Industrial Auctions', icon: '🔧', color: '#00ff88' },
  { id: 'bidspotter', name: 'HiBid / BidSpotter', icon: '🔨', color: '#ffcc00' },
  { id: 'euro-auctions', name: 'Euro Auctions', icon: '🇪🇺', color: '#ff4488' },
];

function getHealthIndicator(status?: PlatformStatus): { emoji: string; label: string; color: string } {
  if (!status) return { emoji: '⚪', label: 'Sin datos', color: '#666' };
  if (status.error_message) return { emoji: '🔴', label: 'Error', color: '#ff4444' };
  if (status.status === 'completed') return { emoji: '🟢', label: 'OK', color: '#00ff88' };
  if (status.status === 'running') return { emoji: '🟡', label: 'Ejecutando', color: '#ffcc00' };
  return { emoji: '⚪', label: 'Pendiente', color: '#666' };
}

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
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [allLoading, setAllLoading] = useState(false);
  const [allResult, setAllResult] = useState<AllScrapeResult | null>(null);
  const [activeTab, setActiveTab] = useState<'platforms' | 'logs' | 'history'>('platforms');
  const logRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = useCallback((platform: string, level: LogEntry['level'], message: string) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      platform,
      level,
      message,
    };
    setLogs(prev => [...prev.slice(-100), entry]);
  }, []);

  const runScraper = useCallback(async (platformId: string) => {
    setLoading(prev => ({ ...prev, [platformId]: true }));
    setResults(prev => ({ ...prev, [platformId]: { success: false, platform: platformId } }));
    addLog(platformId, 'info', `Iniciando scrapeo...`);

    try {
      const res = await fetch(`/api/scrape/${platformId}`, { method: 'POST' });
      const data = await res.json();
      setResults(prev => ({ ...prev, [platformId]: data }));

      if (data.success) {
        addLog(platformId, 'success', `${data.itemsFound} encontrados, ${data.itemsUpserted} guardados (${((data.durationMs || 0) / 1000).toFixed(1)}s)`);
      } else {
        addLog(platformId, 'error', `Error: ${data.error}`);
      }

      if (data.success && onScrapeComplete) {
        onScrapeComplete();
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Network error';
      setResults(prev => ({
        ...prev,
        [platformId]: { success: false, platform: platformId, error: errMsg },
      }));
      addLog(platformId, 'error', `Error de red: ${errMsg}`);
    } finally {
      setLoading(prev => ({ ...prev, [platformId]: false }));
    }
  }, [onScrapeComplete, addLog]);

  const runAllScrapers = useCallback(async () => {
    setAllLoading(true);
    setAllResult(null);
    addLog('all', 'info', 'Iniciando scrapeo paralelo de todas las plataformas...');

    try {
      const res = await fetch('/api/scrape/all', { method: 'POST' });
      const data: AllScrapeResult = await res.json();
      setAllResult(data);

      if (data.success) {
        addLog('all', 'success', `Completado: ${data.summary.totalFound} encontrados, ${data.summary.totalUpserted} guardados`);
        // Update individual results from the parallel run
        for (const pr of data.platforms) {
          setResults(prev => ({ ...prev, [pr.platformId]: {
            success: pr.success,
            platform: pr.platformId,
            itemsFound: pr.itemsFound,
            itemsUpserted: pr.itemsUpserted,
            itemsDeactivated: pr.itemsDeactivated,
            durationMs: pr.durationMs,
            error: pr.error,
          } }));
        }
      } else {
        addLog('all', 'error', `Parcialmente completado: ${data.summary.successfulPlatforms}/${PLATFORMS.length} plataformas exitosas`);
        for (const pr of data.platforms) {
          setResults(prev => ({ ...prev, [pr.platformId]: {
            success: pr.success,
            platform: pr.platformId,
            itemsFound: pr.itemsFound,
            itemsUpserted: pr.itemsUpserted,
            itemsDeactivated: pr.itemsDeactivated,
            durationMs: pr.durationMs,
            error: pr.error,
          } }));
        }
      }

      if (onScrapeComplete) onScrapeComplete();
      refreshStatus();
    } catch (err) {
      addLog('all', 'error', `Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setAllLoading(false);
    }
  }, [onScrapeComplete, addLog]);

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

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  // Auto-refresh status when panel opens
  useEffect(() => {
    if (showPanel) {
      refreshStatus();
      const interval = setInterval(refreshStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [showPanel, refreshStatus]);

  if (!showPanel) {
    return (
      <button
        onClick={() => { setShowPanel(true); refreshStatus(); }}
        className="fixed bottom-4 left-4 z-50 bg-[#0d0d2b] border border-[#00ccff]/30 text-[#00ccff] px-3 py-2 rounded-lg text-xs font-mono hover:bg-[#00ccff]/10 transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        Scrapers
        {totalAuctions !== null && (
          <span className="bg-[#00ccff]/20 px-1.5 py-0.5 rounded text-[10px]">{totalAuctions}</span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-[480px] max-h-[80vh] bg-[#0a0a1a] border border-[#1e1e38] rounded-xl shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e38] shrink-0">
        <h3 className="text-[#00ccff] font-mono text-sm font-bold">Scraper Control Panel</h3>
        <div className="flex items-center gap-2">
          {totalAuctions !== null && (
            <span className="text-[10px] text-[#00ff88] font-mono bg-[#00ff88]/10 px-2 py-0.5 rounded">
              {totalAuctions} subastas
            </span>
          )}
          <button onClick={() => setShowPanel(false)} className="text-gray-500 hover:text-white text-lg leading-none">&times;</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1e1e38] shrink-0">
        {(['platforms', 'logs', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-[10px] font-mono py-2 text-center transition-colors ${
              activeTab === tab
                ? 'text-[#00ccff] border-b-2 border-[#00ccff] bg-[#00ccff]/5'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab === 'platforms' ? 'Plataformas' : tab === 'logs' ? 'Logs' : 'Historial'}
          </button>
        ))}
      </div>

      {/* Scrape All Button */}
      <div className="px-4 py-2 border-b border-[#1e1e38] shrink-0">
        <button
          onClick={runAllScrapers}
          disabled={allLoading}
          className={`w-full py-2 rounded-lg text-xs font-mono font-bold transition-colors ${
            allLoading
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-[#00ccff]/20 text-[#00ccff] hover:bg-[#00ccff]/30 border border-[#00ccff]/30'
          }`}
        >
          {allLoading ? '⏳ Scrapeando todas las plataformas...' : '🔄 Scrapear Todo (Paralelo)'}
        </button>
        {allResult && (
          <div className="mt-1.5 text-[10px] font-mono text-gray-400">
            {allResult.summary.successfulPlatforms}/{PLATFORMS.length} OK — {allResult.summary.totalFound} encontrados, {allResult.summary.totalUpserted} guardados
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === 'platforms' && (
          <div className="p-3 space-y-2">
            {PLATFORMS.map(platform => {
              const isLoading = loading[platform.id] || (allLoading && !results[platform.id]);
              const result = results[platform.id];
              const status = platformStatus?.[platform.id];
              const health = getHealthIndicator(status);

              return (
                <div key={platform.id} className="bg-[#0d0d2b] rounded-lg p-3 border border-[#1e1e38]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{platform.icon}</span>
                      <span className="text-white text-sm font-mono">{platform.name}</span>
                      <span title={health.label}>{health.emoji}</span>
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
                      {isLoading ? '⏳' : '▶'}
                    </button>
                  </div>

                  {/* Progress bar */}
                  {isLoading && (
                    <div className="w-full h-1 bg-[#1e1e38] rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-[#00ccff] rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                  )}

                  {/* Last run status */}
                  {status && (
                    <div className="text-[10px] text-gray-500 font-mono mb-1">
                      Ultima: {status.started_at ? new Date(status.started_at).toLocaleString('es-ES') : 'N/A'}
                      {status.items_found !== undefined && ` | ${status.items_found} lotes`}
                    </div>
                  )}

                  {/* Current run result */}
                  {result && (
                    <div className={`text-[10px] font-mono p-1.5 rounded ${
                      result.success ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {result.success ? (
                        <>{result.itemsFound} encontrados, {result.itemsUpserted} guardados ({((result.durationMs || 0) / 1000).toFixed(1)}s)</>
                      ) : (
                        <>Error: {result.error?.slice(0, 80)}</>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'logs' && (
          <div ref={logRef} className="p-3 space-y-1 overflow-y-auto max-h-[400px]">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-[10px] font-mono text-center py-4">
                No hay logs. Ejecuta un scraper para ver logs en tiempo real.
              </div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={`text-[10px] font-mono flex gap-2 ${
                  log.level === 'error' ? 'text-red-400' :
                  log.level === 'warn' ? 'text-yellow-400' :
                  log.level === 'success' ? 'text-[#00ff88]' :
                  'text-gray-400'
                }`}>
                  <span className="text-gray-600 shrink-0">{new Date(log.timestamp).toLocaleTimeString('es-ES')}</span>
                  <span className="text-gray-600 shrink-0">[{log.platform}]</span>
                  <span>{log.message}</span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-3 space-y-2">
            {platformStatus ? (
              Object.entries(platformStatus).map(([platformId, status]) => {
                const health = getHealthIndicator(status);
                const platform = PLATFORMS.find(p => p.id === platformId);
                return (
                  <div key={platformId} className="bg-[#0d0d2b] rounded-lg p-2 border border-[#1e1e38]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{health.emoji}</span>
                        <span className="text-white text-xs font-mono">{platform?.name || platformId}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        {status.items_found ?? 0} lotes
                      </div>
                    </div>
                    {status.started_at && (
                      <div className="text-[10px] text-gray-500 font-mono mt-1">
                        {new Date(status.started_at).toLocaleString('es-ES')}
                        {status.finished_at && ` → ${new Date(status.finished_at).toLocaleTimeString('es-ES')}`}
                      </div>
                    )}
                    {status.error_message && (
                      <div className="text-[10px] text-red-400 font-mono mt-0.5 truncate">
                        {status.error_message}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-gray-500 text-[10px] font-mono text-center py-4">
                Cargando historial...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[#1e1e38] flex gap-2 shrink-0">
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