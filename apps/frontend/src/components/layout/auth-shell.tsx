import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

export function AuthShell({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[0.9fr_1.1fr]">
      <section className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <Link
            className="inline-flex items-center gap-2 font-bold text-slate-950"
            href="/"
          >
            <ShieldCheck className="h-7 w-7 text-brand-600" />
            Kodeye
          </Link>
          <h1 className="mt-10 text-3xl font-bold tracking-tight text-slate-950">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-end">
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute bottom-20 left-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative max-w-lg">
          <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">
            Kodeye workspace
          </p>
          <h2 className="mt-4 text-4xl font-bold leading-tight">
            Turn codebase security setup into a clear, approachable workflow.
          </h2>
          <p className="mt-5 leading-7 text-slate-300">
            Start with organizations and repository metadata. GitHub integration
            and automated scans arrive in a later phase.
          </p>
        </div>
      </section>
    </main>
  );
}
