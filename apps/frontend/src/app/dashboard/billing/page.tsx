'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CurrencySelector } from '../../../components/billing/currency-selector';
import { Alert } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { billingApi } from '../../../features/billing/api';
import type {
  CurrencyCode,
  Plan,
  Subscription,
} from '../../../features/billing/types';
import { organizationsApi } from '../../../features/organizations/api';
import { formatMoney } from '../../../lib/money';
import { getErrorMessage } from '../../../lib/utils';

export default function BillingPage() {
  const [organizationId, setOrganizationId] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('IDR');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    void organizationsApi
      .list()
      .then((items) => setOrganizationId(items[0]?.id ?? ''));
  }, []);
  useEffect(() => {
    void billingApi.plans(currency).then(setPlans);
  }, [currency]);
  useEffect(() => {
    if (organizationId)
      void billingApi
        .current(organizationId)
        .then(setSubscription)
        .catch((e) => setError(getErrorMessage(e)));
  }, [organizationId]);
  async function checkout(provider: 'midtrans' | 'paypal', planCode: string) {
    try {
      const payment = await billingApi.checkout(provider, {
        currencyCode: currency,
        organizationId,
        planCode,
      });
      if (payment.checkoutUrl) window.location.assign(payment.checkoutUrl);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-indigo-600">Billing</p>
          <h1 className="mt-2 text-3xl font-bold">Plans and subscription</h1>
        </div>
        <CurrencySelector onChange={setCurrency} value={currency} />
      </div>
      <Alert className="mt-5">
        Subscription updates only after payment confirmation from the provider.
      </Alert>
      {error ? (
        <Alert className="mt-4" tone="error">
          {error}
        </Alert>
      ) : null}
      {subscription ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card>
            <p className="text-sm text-slate-500">Current plan</p>
            <h2 className="mt-2 text-xl font-bold">{subscription.plan.name}</h2>
            <p className="mt-2">{subscription.status}</p>
          </Card>
          <Card>
            <p className="font-semibold">Usage</p>
            <p className="mt-2 text-sm">
              {subscription.usage.repositories} /{' '}
              {subscription.plan.maxRepositories} repositories
            </p>
            <p className="mt-1 text-sm">
              {subscription.usage.scansThisMonth} /{' '}
              {subscription.plan.maxScansPerMonth} scans this month
            </p>
          </Card>
        </div>
      ) : null}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {plans
          .filter((p) => !p.isEnterprise && p.code !== 'free')
          .map((plan) => (
            <Card key={plan.id}>
              <h3 className="font-bold">{plan.name}</h3>
              <p className="mt-2 text-2xl font-bold text-indigo-600">
                {formatMoney(plan.amount, plan.currencyCode)}
              </p>
              {plan.isEstimated ? (
                <p className="mt-2 text-xs text-amber-700">
                  Estimated rate. Final amount locks at checkout.
                </p>
              ) : null}
              <div className="mt-5 flex gap-2">
                {plan.providerAvailability.midtrans ? (
                  <Button onClick={() => void checkout('midtrans', plan.code)}>
                    Midtrans
                  </Button>
                ) : null}
                {plan.providerAvailability.paypal ? (
                  <Button onClick={() => void checkout('paypal', plan.code)}>
                    PayPal
                  </Button>
                ) : null}
              </div>
            </Card>
          ))}
      </div>
      <Link
        className="mt-8 inline-block font-semibold text-indigo-600"
        href="/dashboard/billing/invoices"
      >
        View invoice history
      </Link>
    </div>
  );
}
