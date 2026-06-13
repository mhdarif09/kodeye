'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '../../../../components/ui/card';
import { billingApi } from '../../../../features/billing/api';
import type { Invoice } from '../../../../features/billing/types';
import { organizationsApi } from '../../../../features/organizations/api';
import { formatMoney } from '../../../../lib/money';
export default function Invoices() {
  const [items, setItems] = useState<Invoice[]>([]);
  useEffect(() => {
    void organizationsApi
      .list()
      .then((o) => o[0] && billingApi.invoices(o[0].id).then(setItems));
  }, []);
  return (
    <div>
      <h1 className="text-3xl font-bold">Invoices</h1>
      <div className="mt-6">
        {items.map((i) => (
          <Link href={`/dashboard/billing/invoices/${i.id}`} key={i.id}>
            <Card className="mb-3 flex justify-between">
              <span>{i.invoiceNumber}</span>
              <b>{formatMoney(i.totalAmount, i.currencyCode)}</b>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
