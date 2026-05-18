'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/30 hover:bg-[#00ff88]/25 focus:ring-[#00ff88]/50',
  secondary:
    'bg-[#00ccff]/15 text-[#00ccff] border border-[#00ccff]/30 hover:bg-[#00ccff]/25 focus:ring-[#00ccff]/50',
  danger:
    'bg-[#ff1744]/15 text-[#ff1744] border border-[#ff1744]/30 hover:bg-[#ff1744]/25 focus:ring-[#ff1744]/50',
  ghost:
    'bg-transparent text-gray-400 border border-transparent hover:bg-[#1e1e38] hover:text-gray-200 focus:ring-gray-500/50',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0
        disabled:opacity-40 disabled:cursor-not-allowed
        font-mono uppercase tracking-wide
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
