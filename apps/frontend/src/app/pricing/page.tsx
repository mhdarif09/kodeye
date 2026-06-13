'use client';
import { useEffect, useState } from 'react';
import { CurrencySelector } from '../../components/billing/currency-selector';
import { PricingCard } from '../../components/billing/pricing-card';
import { billingApi } from '../../features/billing/api';
import type { CurrencyCode, Plan } from '../../features/billing/types';
export default function PricingPage() {
  const [currency, setCurrency] = useState<CurrencyCode>('IDR');
  const [plans, setPlans] = useState<Plan[]>([]);
  useEffect(() => {
    void billingApi.plans(currency).then(setPlans);
  }, [currency]);
  return (
    <main className="mx-auto max-w-6xl px-5 py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-semibold text-indigo-600">Kodeye Pricing</p>
          <h1 className="mt-2 text-4xl font-bold">
            Security plans with clear limits
          </h1>
        </div>
        <CurrencySelector onChange={setCurrency} value={currency} />
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((p) => (
          <PricingCard key={p.id} plan={p} />
        ))}
      </div>
    </main>
  );
}
