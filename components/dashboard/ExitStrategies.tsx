import React from 'react';
import type { Asset } from '@/lib/types';
import { formatPercentAbs, formatCurrency } from '@/lib/calculations';

interface ExitStrategiesProps {
  asset: Asset | null;
}

interface ExitRoute {
  name: string;
  icon: string;
  margin: number;
  timeline: string;
  description: string;
}

function getExitRoutes(asset: Asset | null): ExitRoute[] {
  if (!asset) {
    return [
      { name: 'Resale Directa', icon: 'DIR', margin: 0, timeline: '--', description: 'Venta directa al comprador final' },
      { name: 'Broker Industrial', icon: 'BRK', margin: 0, timeline: '--', description: 'Via intermediario especializado' },
      { name: 'Subasta Nacional', icon: 'SNC', margin: 0, timeline: '--', description: 'Reventa en plataforma nacional' },
    ];
  }

  const baseMargin = asset.kpis.netProfitMargin;
  return [
    {
      name: 'Resale Directa',
      icon: 'DIR',
      margin: baseMargin,
      timeline: '2-4 sem',
      description: 'Venta directa al comprador final',
    },
    {
      name: 'Broker Industrial',
      icon: 'BRK',
      margin: baseMargin - 8,
      timeline: '1-2 sem',
      description: 'Via intermediario especializado',
    },
    {
      name: 'Subasta Nacional',
      icon: 'SNC',
      margin: baseMargin - 15,
      timeline: '4-8 sem',
      description: 'Reventa en plataforma nacional',
    },
  ];
}

export function ExitStrategies({ asset }: ExitStrategiesProps) {
  const routes = getExitRoutes(asset);

  return (
    <div className="rounded-lg border border-[#1e1e38] bg-[#0a0a1a] p-4">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">
        Estrategias de Salida
      </h3>
      <div className="space-y-2">
        {routes.map(route => {
          const marginColor = route.margin >= 30
            ? 'text-[#00ff88]'
            : route.margin >= 15
              ? 'text-[#ffeb3b]'
              : 'text-[#ff6e40]';

          return (
            <div
              key={route.name}
              className="rounded-lg border border-[#1e1e38] bg-[#050510] p-3"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#00ccff] font-mono">[{route.icon}]</span>
                  <span className="text-xs font-medium text-gray-300">{route.name}</span>
                </div>
                <span className={`text-sm font-bold font-mono ${marginColor}`}>
                  {asset ? formatPercentAbs(route.margin) : '--'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-600 font-mono">{route.description}</span>
                <span className="text-[10px] text-gray-500 font-mono">{route.timeline}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
