import type { CurrencyCode } from '../../features/billing/types';
export function CurrencySelector({
  value,
  onChange,
}: {
  value: CurrencyCode;
  onChange: (value: CurrencyCode) => void;
}) {
  return (
    <select
      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"
      onChange={(e) => onChange(e.target.value as CurrencyCode)}
      value={value}
    >
      {['IDR', 'USD', 'EUR', 'SGD'].map((c) => (
        <option key={c}>{c}</option>
      ))}
    </select>
  );
}
