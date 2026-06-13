import type { TextareaHTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ className, id, label, ...props }: TextareaProps) {
  return (
    <label className="block space-y-2" htmlFor={id}>
      {label ? (
        <span className="text-sm font-medium text-slate-700">{label}</span>
      ) : null}
      <textarea
        className={cn(
          'min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
          className,
        )}
        id={id}
        {...props}
      />
    </label>
  );
}
