'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full rounded-lg border bg-[#0a0a1a] px-3 py-2 text-sm text-gray-200
          placeholder-gray-600 font-mono
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${error
            ? 'border-[#ff1744]/50 focus:border-[#ff1744] focus:ring-[#ff1744]/30'
            : 'border-[#1e1e38] focus:border-[#00ff88]/50 focus:ring-[#00ff88]/20'
          }
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-[#ff1744]">{error}</p>
      )}
    </div>
  );
}
