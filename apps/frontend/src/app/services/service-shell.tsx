import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { MarketingNav } from '../../components/marketing-nav';

export function ServicesNav() {
  return <MarketingNav />;
}

export function ServicePageLayout({
  children,
  cta = 'Start a project',
}: {
  children: ReactNode;
  cta?: string;
}) {
  return (
    <main className="min-h-screen bg-[#f7f5ef] text-slate-950">
      <ServicesNav />
      {children}
      <section className="border-t border-slate-200 bg-slate-950 py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">
              Work with Kodeye
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Bring the problem. We will shape the technical path.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
              From codebase audit to deployment, automation, and digital product
              buildout, Kodeye can support the next practical step.
            </p>
          </div>
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-slate-100"
            href="/contact-sales"
          >
            {cta} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

export function CheckItem({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
      {children}
    </div>
  );
}
