'use client';

import React, { useState, useEffect } from 'react';
import type { Asset } from '@/lib/types';
import { formatTimeRemaining } from '@/lib/calculations';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

interface AssetDetailProps {
  asset: Asset | null;
}

function getPriorityBadge(kpis: Asset['kpis']) {
  if (kpis.isGanga) return <Badge variant="success">GANGA</Badge>;
  if (kpis.riskLevel === 'high') return <Badge variant="urgent">ALTO RIESGO</Badge>;
  return <Badge variant="info">ESTANDAR</Badge>;
}

function getConditionLabel(condition: string): string {
  const map: Record<string, string> = {
    excellent: 'Excelente',
    good: 'Bueno',
    fair: 'Aceptable',
    poor: 'Deficiente',
  };
  return map[condition] || condition;
}

export function AssetDetail({ asset }: AssetDetailProps) {
  const [timeLeft, setTimeLeft] = useState<string>('--');

  useEffect(() => {
    if (!asset) return;
    function update() {
      if (!asset) return;
      const remaining = new Date(asset.timing.auctionEnd).getTime() - Date.now();
      setTimeLeft(formatTimeRemaining(remaining));
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [asset]);

  if (!asset) {
    return (
      <Card title="Detalle de Activo">
        <div className="flex h-48 items-center justify-center text-sm text-gray-600 font-mono">
          Selecciona un activo para ver detalles
        </div>
      </Card>
    );
  }

  return (
    <Card title="Detalle de Activo">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-start gap-2">
          <h2 className="flex-1 text-base font-semibold text-gray-200 leading-tight">
            {asset.title}
          </h2>
          <Badge variant="info" size="sm">{asset.platform.name}</Badge>
          <Badge variant="neutral" size="sm">{asset.location.countryCode}</Badge>
          {getPriorityBadge(asset.kpis)}
        </div>

        {/* Countdown */}
        <div className="rounded-lg border border-[#1e1e38] bg-[#050510] px-3 py-2 flex items-center gap-2">
          <svg className="h-4 w-4 text-[#ff6e40]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="8" cy="8" r="6" /><path d="M8 4v4l2.5 1.5" />
          </svg>
          <span className="text-xs uppercase text-gray-500 font-mono">Tiempo restante:</span>
          <span className={`text-sm font-bold font-mono ${
            timeLeft === 'Cerrada' ? 'text-[#ff1744]' : 'text-[#ff6e40]'
          }`}>
            {timeLeft}
          </span>
        </div>

        {/* Image placeholder */}
        <div className="rounded-lg border border-[#1e1e38] bg-[#050510] h-40 flex items-center justify-center overflow-hidden">
          {asset.imageUrl ? (
            <img src={asset.imageUrl} alt={asset.title} className="h-full w-full object-cover" />
          ) : (
            <div className="text-center text-gray-600">
              <svg className="mx-auto h-10 w-10 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
              </svg>
              <span className="text-xs font-mono">Sin imagen</span>
            </div>
          )}
        </div>

        {/* Tech specs grid */}
        <div className="grid grid-cols-2 gap-2">
          <SpecRow label="Fabricante" value={asset.specs.make || '--'} />
          <SpecRow label="Modelo" value={asset.specs.model || '--'} />
          <SpecRow label="Ano" value={asset.specs.year?.toString() || '--'} />
          <SpecRow label="Condicion" value={getConditionLabel(asset.specs.condition)} />
          <SpecRow label="Horas" value={asset.specs.hours?.toLocaleString() || '--'} />
          <SpecRow label="Peso" value={asset.specs.weight ? `${asset.specs.weight.toLocaleString()} kg` : '--'} />
        </div>

        {/* Description */}
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-4">
          {asset.description}
        </p>
      </div>
    </Card>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-[#1e1e38] bg-[#050510] px-2 py-1.5">
      <div className="text-[10px] uppercase text-gray-600 font-mono">{label}</div>
      <div className="text-xs text-gray-300 font-mono truncate">{value}</div>
    </div>
  );
}
