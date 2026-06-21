'use client';

import { X } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from './button';

interface ModalProps {
  children: ReactNode;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  wide?: boolean;
}

export function Modal({
  children,
  description,
  isOpen,
  onClose,
  title,
  wide = false,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
    >
      <div
        className={`max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6 ${
          wide ? 'sm:max-w-[min(94vw,1600px)]' : 'sm:max-w-lg'
        }`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            ) : null}
          </div>
          <Button
            aria-label="Close modal"
            className="h-10 min-h-10 w-10 px-0"
            onClick={onClose}
            variant="ghost"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
