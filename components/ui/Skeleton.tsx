import React from 'react';

type SkeletonVariant = 'text' | 'card' | 'circle';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string;
  height?: string;
  className?: string;
}

const variantDefaults: Record<SkeletonVariant, { width: string; height: string; extra: string }> = {
  text: { width: 'w-3/4', height: 'h-4', extra: 'rounded' },
  card: { width: 'w-full', height: 'h-32', extra: 'rounded-lg' },
  circle: { width: 'w-10', height: 'h-10', extra: 'rounded-full' },
};

export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
}: SkeletonProps) {
  const defaults = variantDefaults[variant];

  return (
    <div
      className={`
        animate-pulse bg-[#1e1e38]/50
        ${defaults.extra}
        ${width || defaults.width}
        ${height || defaults.height}
        ${className}
      `}
      aria-hidden="true"
    />
  );
}
