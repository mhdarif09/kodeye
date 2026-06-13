import { LoaderCircle } from 'lucide-react';

import { cn } from '../../lib/utils';

export function Spinner({ className }: { className?: string }) {
  return (
    <LoaderCircle
      aria-label="Loading"
      className={cn('h-5 w-5 animate-spin text-brand-600', className)}
    />
  );
}
