import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getService, services } from '../service-data';
import { CheckItem, ServicePageLayout } from '../service-shell';

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    alternates: {
      canonical: service.href,
    },
    description: service.description,
    openGraph: {
      description: service.description,
      title: `${service.title} Services | Kodeye`,
      url: service.href,
    },
    title: `${service.title} Services`,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const Icon = service.icon;

  return (
    <ServicePageLayout cta={`Start ${service.title}`}>
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
            <Icon className="h-4 w-4 text-brand-600" />
            Kodeye Services
          </p>
          <div className="mt-6 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
                {service.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                {service.description}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
              <p className="text-sm font-bold uppercase tracking-widest text-brand-600">
                Best for
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {service.audience}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600">
              Outcomes
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              What this service helps you achieve.
            </h2>
          </div>
          <div className="grid gap-3 lg:col-span-2 sm:grid-cols-2">
            {service.outcomes.map((outcome) => (
              <CheckItem key={outcome}>{outcome}</CheckItem>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-brand-600">
                Detailed scope
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                What we can handle inside this service.
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Scope is adjusted to your team, but these are the practical work
                areas we normally cover when delivering {service.title}.
              </p>
            </div>
            <div className="grid gap-4">
              {service.detailedScope.map((scope) => (
                <article
                  className="rounded-xl border border-slate-200 bg-slate-50 p-6"
                  key={scope.title}
                >
                  <h3 className="text-lg font-bold text-slate-950">
                    {scope.title}
                  </h3>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {scope.items.map((item) => (
                      <CheckItem key={item}>{item}</CheckItem>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600">
              Deliverables
            </p>
            <div className="mt-6 grid gap-3">
              {service.deliverables.map((item) => (
                <CheckItem key={item}>{item}</CheckItem>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-950 p-6 text-white">
            <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">
              Process
            </p>
            <div className="mt-6 grid gap-4">
              {service.process.map((item, index) => (
                <div className="flex gap-4" key={item}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-950">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600">
              Engagement models
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Pick the level of help that matches the stage.
            </h2>
            <div className="mt-8 grid gap-4">
              {service.engagementModels.map((model) => (
                <article
                  className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                  key={model.name}
                >
                  <h3 className="font-bold text-slate-950">{model.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {model.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-950 p-6 text-white">
            <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">
              Typical timeline
            </p>
            <div className="mt-6 grid gap-5">
              {service.timeline.map((item) => (
                <div className="border-l border-white/10 pl-5" key={item.phase}>
                  <p className="text-sm font-bold text-white">{item.phase}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600">
              Working style
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              How Kodeye works with your team.
            </h2>
          </div>
          <div className="grid gap-4 lg:col-span-2">
            {service.collaboration.map((item) => (
              <CheckItem key={item}>{item}</CheckItem>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600">
              Why teams ask for this
            </p>
            <div className="mt-6 grid gap-3">
              {service.proofPoints.map((item) => (
                <CheckItem key={item}>{item}</CheckItem>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600">
              Handover
            </p>
            <div className="mt-6 grid gap-3">
              {service.handover.map((item) => (
                <CheckItem key={item}>{item}</CheckItem>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600">
              FAQ
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Common questions before starting.
            </h2>
          </div>
          <div className="grid gap-4">
            {service.faqs.map((faq) => (
              <article
                className="rounded-xl border border-slate-200 bg-white p-6"
                key={faq.question}
              >
                <h3 className="font-bold text-slate-950">{faq.question}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-[#f7f5ef] py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600">
              Ready to scope it?
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Tell us what you want to improve with {service.title}.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
              Share the business goal, current system, timeline, and
              constraints. The sales team will review it inside the admin
              console and follow up with a practical next step.
            </p>
          </div>
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-slate-800"
            href={`/contact-sales?service=${service.slug}`}
          >
            Contact sales <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </ServicePageLayout>
  );
}
