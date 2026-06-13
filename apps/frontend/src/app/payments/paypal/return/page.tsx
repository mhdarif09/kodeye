'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { billingApi } from '../../../../features/billing/api';
function PaypalReturnContent() {
  const q = useSearchParams();
  const [s, setS] = useState('Confirming PayPal payment...');
  useEffect(() => {
    const token = q.get('token');
    if (token)
      void billingApi
        .capturePaypal(token)
        .then(() => setS('Payment confirmed. Your subscription is active.'))
        .catch(() => setS('Payment could not be confirmed.'));
  }, [q]);
  return (
    <main className="mx-auto max-w-xl px-5 py-20">
      <h1 className="text-2xl font-bold">{s}</h1>
    </main>
  );
}

export default function PaypalReturn() {
  return (
    <Suspense fallback={<main className="p-10">Confirming payment...</main>}>
      <PaypalReturnContent />
    </Suspense>
  );
}
