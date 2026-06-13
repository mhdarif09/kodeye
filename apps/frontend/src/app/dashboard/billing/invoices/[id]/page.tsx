'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '../../../../../components/ui/card';
import { billingApi } from '../../../../../features/billing/api';
import type { Invoice } from '../../../../../features/billing/types';
import { formatMoney } from '../../../../../lib/money';
export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const [i, setI] = useState<Invoice | null>(null);
  useEffect(() => {
    void billingApi.invoice(id).then(setI);
  }, [id]);
  if (!i) return <p>Loading invoice...</p>;
  return (
    <div>
      <h1 className="text-3xl font-bold">{i.invoiceNumber}</h1>
      <Card className="mt-6 space-y-3">
        <p>Subtotal: {formatMoney(i.subtotalAmount, i.currencyCode)}</p>
        <p>Discount: {formatMoney(i.discountAmount, i.currencyCode)}</p>
        <p>Tax: {formatMoney(i.taxAmount, i.currencyCode)}</p>
        <p className="text-xl font-bold">
          Total: {formatMoney(i.totalAmount, i.currencyCode)}
        </p>
      </Card>
    </div>
  );
}
