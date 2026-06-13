import type { SelectHTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({
  children,
  className,
  error,
  id,
  label,
  ...props
}: SelectProps) {
  return (
    <label className="block space-y-2" htmlFor={id}>
      {label ? (
        <span className="text-sm font-medium text-slate-700">{label}</span>
      ) : null}
      <select
        className={cn(
          'min-h-11 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
          error ? 'border-red-400' : 'border-slate-200',
          className,
        )}
        id={id}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="text-sm text-red-600">{error}</span> : null}
    </label>
  );
}
