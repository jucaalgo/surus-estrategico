'use client';

import { useSearch } from '@/hooks/useSearch';
import { useAssets } from '@/hooks/useAssets';
import { useROISimulator } from '@/hooks/useROISimulator';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { StatusBar } from '@/components/dashboard/StatusBar';
import { TacticalMap } from '@/components/dashboard/TacticalMap';
import { AssetDetail } from '@/components/dashboard/AssetDetail';
import { KPIGrid } from '@/components/dashboard/KPIGrid';
import { RiskMeter } from '@/components/dashboard/RiskMeter';
import { ExitStrategies } from '@/components/dashboard/ExitStrategies';
import { ResultsList } from '@/components/dashboard/ResultsList';
import { ActionConsole } from '@/components/dashboard/ActionConsole';
import { ROISimulator } from '@/components/dashboard/ROISimulator';
import { ScraperPanel } from '@/components/dashboard/ScraperPanel';
import type { Asset, SmartPreset } from '@/lib/types';

export default function DashboardPage() {
  const search = useSearch();
  const assets = useAssets();
  const simulator = useROISimulator();

  const handleSelectAsset = (asset: Asset) => {
    assets.selectAsset(asset);
  };

  const handleMapAssetClick = (asset: Asset) => {
    assets.selectAsset(asset);
  };

  const handlePreset = (preset: SmartPreset) => {
    search.applyPreset(preset.id);
  };

  const selected = assets.selectedAsset;

  return (
    <div className="min-h-screen bg-[#050510]">
      {/* Header */}
      <header className="border-b border-[#1e1e38] px-4 py-3">
        <div className="mx-auto max-w-[1600px] flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[#00ccff] font-bold text-xl tracking-wider font-mono">SURUS</span>
            <span className="text-gray-600 text-xs hidden sm:inline font-mono">Inteligencia de Subastas</span>
          </div>
          <div className="flex-1">
            <SearchBar
              onSearch={search.search}
              onPreset={handlePreset}
              isSearching={search.isSearching}
            />
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <FilterBar
        activeCountries={search.activeCountries}
        activePlatforms={search.activePlatforms}
        onCountryFilter={search.toggleCountry}
        onPlatformFilter={search.togglePlatform}
        onClear={search.clearFilters}
      />

      {/* Status Bar */}
      <StatusBar
        platformsScanned={search.platformsScanned}
        totalResults={search.totalResults}
        gangas={search.results.filter(a => a.kpis.isGanga).length}
        elapsed={search.elapsed}
        error={search.error}
      />

      {/* Main Content */}
      <main className="mx-auto max-w-[1600px] px-4 py-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            <TacticalMap
              assets={search.results}
              selectedAsset={selected}
              onAssetClick={handleMapAssetClick}
            />
            <AssetDetail asset={selected} />
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <KPIGrid kpis={selected?.kpis} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RiskMeter score={selected?.kpis.riskScore} level={selected?.kpis.riskLevel} />
              <ExitStrategies asset={selected} />
            </div>
            <ResultsList
              assets={search.results}
              selectedAsset={selected}
              onSelect={handleSelectAsset}
              sortBy={search.sortBy}
              onSortChange={search.setSortBy}
            />
          </div>
        </div>
      </main>

      {/* Action Console */}
      <ActionConsole
        onSimulatorOpen={() => simulator.open(selected ?? undefined)}
        onWatchlistAdd={() => selected && assets.addToWatchlist(selected)}
        onBid={() => selected?.sourceUrl && window.open(selected.sourceUrl, '_blank')}
        hasSelectedAsset={!!selected}
        isInWatchlist={selected ? assets.isInWatchlist(selected.id) : false}
      />

      {/* ROI Simulator Modal */}
      <ROISimulator
        isOpen={simulator.isOpen}
        onClose={simulator.close}
        inputs={simulator.inputs}
        onInputsChange={simulator.setInputs}
        onCalculate={simulator.calculate}
        results={simulator.results}
      />

      {/* Scraper Control Panel */}
      <ScraperPanel onScrapeComplete={search.refreshFromApi} />
    </div>
  );
}