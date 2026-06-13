import type { HTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
}

export function Badge({ className, tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        {
          'bg-slate-100 text-slate-700': tone === 'neutral',
          'bg-indigo-50 text-indigo-700': tone === 'primary',
          'bg-emerald-50 text-emerald-700': tone === 'success',
          'bg-amber-50 text-amber-700': tone === 'warning',
          'bg-red-50 text-red-700': tone === 'danger',
        },
        className,
      )}
      {...props}
    />
  );
}
