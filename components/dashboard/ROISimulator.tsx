'use client';

import React from 'react';
import type { ROIInputs } from '@/lib/types';
import { calculateROI, formatCurrency, formatPercentAbs } from '@/lib/calculations';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ROISimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: ROIInputs;
  onInputsChange: (inputs: ROIInputs) => void;
  onCalculate: () => void;
  results: ReturnType<typeof calculateROI> | null;
}

export function ROISimulator({
  isOpen,
  onClose,
  inputs,
  onInputsChange,
  onCalculate,
  results,
}: ROISimulatorProps) {
  const handleFieldChange = (field: keyof ROIInputs, value: string) => {
    const num = parseFloat(value) || 0;
    onInputsChange({ ...inputs, [field]: num });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Simulador ROI">
      <div className="space-y-4">
        {/* Inputs */}
        <div className="space-y-3">
          <Input
            label="Inversion (EUR)"
            type="number"
            min="0"
            value={inputs.investment || ''}
            onChange={e => handleFieldChange('investment', e.target.value)}
            placeholder="0"
          />
          <Input
            label="Logistica (EUR)"
            type="number"
            min="0"
            value={inputs.logisticsCost || ''}
            onChange={e => handleFieldChange('logisticsCost', e.target.value)}
            placeholder="0"
          />
          <Input
            label="Reventa estimada (EUR)"
            type="number"
            min="0"
            value={inputs.estimatedResale || ''}
            onChange={e => handleFieldChange('estimatedResale', e.target.value)}
            placeholder="0"
          />
        </div>

        <Button variant="primary" size="md" onClick={onCalculate} className="w-full">
          Calcular ROI
        </Button>

        {/* Results */}
        {results && (
          <div className="rounded-lg border border-[#1e1e38] bg-[#050510] p-4 space-y-2">
            <div className="text-[10px] uppercase text-gray-600 font-mono mb-2">Resultados</div>
            <ResultRow label="Coste Total" value={formatCurrency(results.totalAcquisitionCost)} />
            <ResultRow label="Beneficio Neto" value={formatCurrency(results.grossProfit)} positive={results.grossProfit >= 0} />
            <ResultRow label="Margen" value={formatPercentAbs(results.netProfitMargin)} positive={results.netProfitMargin >= 0} />
            <ResultRow label="ROI" value={formatPercentAbs(results.roi)} positive={results.roi >= 0} />
            <ResultRow label="Payback" value={`${Math.min(results.paybackMonths, 999)} meses`} positive={results.paybackMonths <= 12} />
            <ResultRow label="TIR" value={formatPercentAbs(results.tir)} positive={results.tir >= 0} />
            <div className="pt-2 border-t border-[#1e1e38] flex items-center gap-2">
              <span className="text-xs text-gray-500 font-mono">Riesgo:</span>
              <Badge
                variant={results.riskLevel === 'low' ? 'success' : results.riskLevel === 'medium' ? 'warning' : 'urgent'}
                size="md"
              >
                {results.riskLevel === 'low' ? 'BAJO' : results.riskLevel === 'medium' ? 'MEDIO' : 'ALTO'}
              </Badge>
              <span className="text-xs font-mono text-gray-400">({results.riskScore}/100)</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function ResultRow({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  const color = positive === undefined ? 'text-gray-200' : positive ? 'text-[#00ff88]' : 'text-[#ff1744]';
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500 font-mono">{label}</span>
      <span className={`text-sm font-bold font-mono ${color}`}>{value}</span>
    </div>
  );
}
