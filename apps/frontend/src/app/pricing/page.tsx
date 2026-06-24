'use client';

import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Github,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { CurrencySelector } from '../../components/billing/currency-selector';
import { PricingCard } from '../../components/billing/pricing-card';
import { MarketingNav } from '../../components/marketing-nav';
import { Alert } from '../../components/ui/alert';
import { billingApi } from '../../features/billing/api';
import type { CurrencyCode, Plan } from '../../features/billing/types';

const saasFeatures = [
  'Repository scan limits yang jelas',
  'Audit security, maintainability, dan readiness',
  'Report HTML/JSON atau PDF sesuai plan',
  'GitHub auto scan untuk workflow yang lebih cepat',
];

const useCases = [
  {
    description:
      'Cek kualitas project sebelum launching, handover, atau production release.',
    icon: FileSearch,
    title: 'Pre-production audit',
  },
  {
    description:
      'Bantu agency atau startup mengecek risiko kode sebelum diteruskan ke client.',
    icon: ShieldCheck,
    title: 'Client-ready review',
  },
  {
    description:
      'Pantau repository aktif dengan scan manual atau GitHub auto scan.',
    icon: Github,
    title: 'Team workflow',
  },
];

const faqs = [
  [
    'Apakah pricing ini untuk layanan custom?',
    'Bukan. Pricing ini untuk produk SaaS Kodeye. Untuk layanan AI automation, web development, DevOps, infrastructure, atau audit custom, gunakan form brief atau konsultasi WhatsApp.',
  ],
  [
    'Apa bedanya Free, Pro, Team, dan Enterprise?',
    'Perbedaannya ada di limit repository, jumlah scan per bulan, report PDF, GitHub auto scan, dan approval manual untuk kebutuhan besar.',
  ],
  [
    'Bisa minta audit custom tanpa subscribe SaaS?',
    'Bisa. Kodeye tetap menyediakan layanan code audit dan production readiness custom di luar paket SaaS.',
  ],
];

export default function PricingPage() {
  const [currency, setCurrency] = useState<CurrencyCode>('IDR');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');

    void billingApi
      .plans(currency)
      .then((nextPlans) => {
        if (!active) return;
        setPlans(nextPlans);
      })
      .catch(() => {
        if (!active) return;
        setError('Unable to load pricing plans right now.');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currency]);

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-slate-950">
      <MarketingNav />

      <section className="border-b border-slate-200 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700">
              <Sparkles className="h-4 w-4" />
              Produk SaaS Kodeye
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">
              Pricing untuk code audit dan production readiness.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Pilih paket SaaS Kodeye untuk scan repository, review kualitas
              kode, security checking, dan laporan kesiapan project sebelum
              production.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-[#f7f5ef] p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500">Currency</p>
                <p className="mt-1 text-lg font-semibold">
                  Lihat harga sesuai mata uang
                </p>
              </div>
              <CurrencySelector onChange={setCurrency} value={currency} />
            </div>
            <div className="mt-5 grid gap-2 text-sm text-slate-600">
              {saasFeatures.slice(0, 3).map((item) => (
                <p className="flex items-center gap-2" key={item}>
                  <CheckCircle2 className="h-4 w-4 text-brand-600" />
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8" id="plans">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-600">Plans</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Pilih sesuai skala repository dan workflow.
              </h2>
            </div>
            <Link
              className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
              href="/contact-sales"
            >
              Butuh custom?
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {error ? (
            <div className="mt-8">
              <Alert tone="error">{error}</Alert>
            </div>
          ) : null}

          {loading ? (
            <div className="mt-10 flex min-h-64 items-center justify-center rounded-3xl border border-slate-200 bg-white">
              <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
            </div>
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {plans.map((plan) => (
                <PricingCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold text-brand-600">Use cases</p>
              <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Cocok untuk developer, startup, agency, dan tim software.
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {useCases.map(({ description, icon: Icon, title }) => (
                <article
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  key={title}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold text-brand-600">FAQ</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Pertanyaan umum pricing SaaS.
            </h2>
          </div>
          <div className="grid gap-3">
            {faqs.map(([question, answer]) => (
              <article
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                key={question}
              >
                <h3 className="text-base font-semibold">{question}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
