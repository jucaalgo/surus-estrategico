import React from 'react';

type BadgeVariant = 'urgent' | 'warning' | 'info' | 'success' | 'neutral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  urgent: 'bg-[#ff1744]/15 text-[#ff1744] border-[#ff1744]/30',
  warning: 'bg-[#ff6e40]/15 text-[#ff6e40] border-[#ff6e40]/30',
  info: 'bg-[#00ccff]/15 text-[#00ccff] border-[#00ccff]/30',
  success: 'bg-[#00ff88]/15 text-[#00ff88] border-[#00ff88]/30',
  neutral: 'bg-[#1e1e38]/50 text-gray-400 border-[#1e1e38]',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
};

export function Badge({
  variant = 'neutral',
  size = 'md',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded border font-mono font-medium uppercase tracking-wide
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
