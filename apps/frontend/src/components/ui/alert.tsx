import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import type { HTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'info' | 'success' | 'error';
}

export function Alert({
  children,
  className,
  tone = 'info',
  ...props
}: AlertProps) {
  const Icon =
    tone === 'success' ? CircleCheck : tone === 'error' ? CircleAlert : Info;
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm',
        {
          'border-cyan-200 bg-cyan-50 text-cyan-900': tone === 'info',
          'border-emerald-200 bg-emerald-50 text-emerald-900':
            tone === 'success',
          'border-red-200 bg-red-50 text-red-800': tone === 'error',
        },
        className,
      )}
      role={tone === 'error' ? 'alert' : 'status'}
      {...props}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
