import React from 'react';

interface CardProps {
  title?: string;
  glow?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, glow = false, children, className = '' }: CardProps) {
  return (
    <div
      className={`
        rounded-lg border bg-[#0a0a1a] p-4
        ${glow ? 'border-[#00ff88]/20 shadow-[0_0_15px_rgba(0,255,136,0.05)]' : 'border-[#1e1e38]'}
        ${className}
      `}
    >
      {title && (
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
