import type { ButtonHTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export function Button({
  className,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        {
          'bg-brand-600 text-white shadow-sm hover:bg-brand-700':
            variant === 'primary',
          'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50':
            variant === 'secondary',
          'text-slate-600 hover:bg-slate-100 hover:text-slate-950':
            variant === 'ghost',
          'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
        },
        className,
      )}
      type={type}
      {...props}
    />
  );
}
