import React from 'react';
import type { CalculatedKPIs } from '@/lib/types';
import { formatCurrency, formatPercentAbs } from '@/lib/calculations';
import { Badge } from '@/components/ui/Badge';

interface KPIGridProps {
  kpis?: CalculatedKPIs;
}

interface KPICellProps {
  label: string;
  value: string;
  positive?: boolean | null;
  isGanga?: boolean;
}

function KPICell({ label, value, positive, isGanga }: KPICellProps) {
  const colorClass =
    positive === null || positive === undefined
      ? 'text-gray-200'
      : positive
        ? 'text-[#00ff88]'
        : 'text-[#ff1744]';

  return (
    <div className="rounded-lg border border-[#1e1e38] bg-[#050510] p-3 relative">
      {isGanga && (
        <div className="absolute top-2 right-2">
          <Badge variant="success" size="sm">GANGA</Badge>
        </div>
      )}
      <div className="text-[10px] uppercase text-gray-600 font-mono mb-1">{label}</div>
      <div className={`text-lg font-bold font-mono ${colorClass} truncate`}>{value}</div>
    </div>
  );
}

export function KPIGrid({ kpis }: KPIGridProps) {
  if (!kpis) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-[#1e1e38] bg-[#050510] p-3 h-[72px] animate-pulse" />
        ))}
      </div>
    );
  }

  const cells: KPICellProps[] = [
    {
      label: 'Inversion',
      value: formatCurrency(kpis.totalAcquisitionCost),
      positive: null,
    },
    {
      label: 'Valor Reventa',
      value: formatCurrency(kpis.estimatedResaleValue),
      positive: kpis.estimatedResaleValue > kpis.totalAcquisitionCost,
    },
    {
      label: 'ROI',
      value: formatPercentAbs(kpis.roi),
      positive: kpis.roi >= 0,
    },
    {
      label: 'Arbitraje Score',
      value: kpis.arbitrageScore.toFixed(1),
      positive: kpis.arbitrageScore >= 1.5,
      isGanga: kpis.isGanga,
    },
    {
      label: 'Margen Neto',
      value: formatPercentAbs(kpis.netProfitMargin),
      positive: kpis.netProfitMargin >= 0,
    },
    {
      label: 'TIR',
      value: formatPercentAbs(kpis.tir),
      positive: kpis.tir >= 0,
    },
    {
      label: 'Payback',
      value: `${kpis.paybackMonths.toFixed(0)} mes${kpis.paybackMonths.toFixed(0) === '1' ? '' : 'es'}`,
      positive: kpis.paybackMonths <= 12,
    },
    {
      label: 'Risk Score',
      value: kpis.riskScore.toString(),
      positive: kpis.riskScore >= 60,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {cells.map(cell => (
        <KPICell key={cell.label} {...cell} />
      ))}
    </div>
  );
}
