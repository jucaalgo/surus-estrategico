'use client';

import React, { useEffect, useState } from 'react';

interface StatusBarProps {
  platformsScanned: number;
  totalResults: number;
  gangas: number;
  elapsed: number;
  error: string | null;
}

function AnimatedCounter({ target, label, color }: { target: number; label: string; color: string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (target === 0) { setCurrent(0); return; }
    const duration = 600;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target]);

  return (
    <div className="flex flex-col items-center">
      <span className={`text-lg font-mono font-bold ${color}`}>{current}</span>
      <span className="text-[10px] uppercase text-gray-600 font-mono">{label}</span>
    </div>
  );
}

export function StatusBar({ platformsScanned, totalResults, gangas, elapsed, error }: StatusBarProps) {
  return (
    <div className="border-b border-[#1e1e38] px-4 py-2">
      <div className="mx-auto max-w-[1600px] flex items-center justify-between">
        <div className="flex items-center gap-8">
          <AnimatedCounter target={platformsScanned} label="Plataformas" color="text-[#00ccff]" />
          <AnimatedCounter target={totalResults} label="Candidatos" color="text-[#00ccff]" />
          <AnimatedCounter target={gangas} label="Gangas" color="text-[#00ff88]" />
          <div className="flex flex-col items-center">
            <span className="text-lg font-mono font-bold text-gray-400">
              {elapsed > 0 ? `${(elapsed / 1000).toFixed(1)}s` : '--'}
            </span>
            <span className="text-[10px] uppercase text-gray-600 font-mono">Tiempo</span>
          </div>
        </div>

        {error && (
          <div className="rounded border border-[#ff1744]/30 bg-[#ff1744]/10 px-3 py-1 text-xs text-[#ff1744] font-mono">
            ERROR: {error}
          </div>
        )}
      </div>
    </div>
  );
}
