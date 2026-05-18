import React from 'react';

interface RiskMeterProps {
  score?: number;
  level?: 'low' | 'medium' | 'high';
}

function getRiskColor(score: number): string {
  if (score >= 65) return '#00ff88';
  if (score >= 40) return '#ffeb3b';
  return '#ff6e40';
}

function getRiskLabel(level: string | undefined): string {
  if (!level) return '--';
  const map: Record<string, string> = {
    low: 'RIESGO BAJO',
    medium: 'RIESGO MEDIO',
    high: 'RIESGO ALTO',
  };
  return map[level] || level;
}

export function RiskMeter({ score, level }: RiskMeterProps) {
  const clampedScore = typeof score === 'number' ? Math.max(0, Math.min(100, score)) : 0;
  const color = typeof score === 'number' ? getRiskColor(clampedScore) : '#1e1e38';
  const deg = (clampedScore / 100) * 360;

  if (score === undefined) {
    return (
      <div className="rounded-lg border border-[#1e1e38] bg-[#0a0a1a] p-4 flex items-center justify-center">
        <div className="text-sm text-gray-600 font-mono">Sin datos</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#1e1e38] bg-[#0a0a1a] p-4 flex flex-col items-center">
      <div className="text-[10px] uppercase text-gray-600 font-mono mb-3">Risk Score</div>

      {/* Conic gradient gauge */}
      <div className="relative h-24 w-24">
        <div
          className="h-24 w-24 rounded-full"
          style={{
            background: `conic-gradient(${color} ${deg}deg, #1e1e38 ${deg}deg)`,
          }}
        />
        {/* Center cutout */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-[#0a0a1a] flex items-center justify-center">
            <span className="text-xl font-bold font-mono" style={{ color }}>
              {clampedScore}
            </span>
          </div>
        </div>
      </div>

      {/* Risk level label */}
      <div
        className="mt-3 text-xs font-bold font-mono uppercase tracking-wider"
        style={{ color }}
      >
        {getRiskLabel(level)}
      </div>
    </div>
  );
}
