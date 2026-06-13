import type { CurrencyCode } from '../features/billing/types';
export function formatMoney(amount: number, currency: CurrencyCode) {
  return new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', {
    currency,
    style: 'currency',
  }).format(amount / (currency === 'IDR' ? 1 : 100));
}
