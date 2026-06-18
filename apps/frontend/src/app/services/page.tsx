import { Workflow } from 'lucide-react';
import Link from 'next/link';

import { services } from './service-data';
import { CheckItem, ServicePageLayout } from './service-shell';

export default function ServicesPage() {
  return (
    <ServicePageLayout>
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
            <Workflow className="h-4 w-4 text-brand-600" />
            Kodeye Services
          </p>
          <div className="mt-6 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
              Engineering services for AI-powered operations.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              We help companies audit, automate, build, deploy, and digitalize
              the systems behind their business. Start with a focused project or
              combine services with the Kodeye Audit Platform.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:px-8">
          {services.map(
            ({ description, href, icon: Icon, outcomes, title }) => (
              <article
                className="grid gap-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 md:grid-cols-[0.8fr_1.2fr]"
                key={title}
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950 text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="mt-6 text-2xl font-bold text-slate-950">
                    {title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {description}
                  </p>
                  <Link
                    className="mt-5 inline-flex text-sm font-bold text-brand-600 hover:text-brand-700"
                    href={href}
                  >
                    View service page
                  </Link>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {outcomes.map((outcome) => (
                    <CheckItem key={outcome}>{outcome}</CheckItem>
                  ))}
                </div>
              </article>
            ),
          )}
        </div>
      </section>
    </ServicePageLayout>
  );
}
