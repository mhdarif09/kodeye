import Link from 'next/link';
import type { Plan } from '../../features/billing/types';
import { formatMoney } from '../../lib/money';
import { Card } from '../ui/card';
export function PricingCard({ plan }: { plan: Plan }) {
  return (
    <Card className="flex h-full flex-col">
      <h2 className="text-xl font-bold">{plan.name}</h2>
      <p className="mt-3 text-3xl font-bold text-indigo-600">
        {plan.requiresManualApproval
          ? 'Custom'
          : formatMoney(plan.amount, plan.currencyCode)}
      </p>
      <p className="mt-2 text-sm text-slate-500">
        {plan.interval.toLowerCase()} billing
      </p>
      <ul className="mt-5 space-y-2 text-sm">
        <li>{plan.maxRepositories} repositories</li>
        <li>{plan.maxScansPerMonth} scans/month</li>
        <li>{plan.enablePdfReport ? 'PDF reports' : 'HTML/JSON reports'}</li>
        <li>
          {plan.enableGithubAutoScan ? 'GitHub auto scan' : 'Manual scans'}
        </li>
      </ul>
      {plan.isEstimated ? (
        <p className="mt-4 text-xs text-amber-700">
          Estimated using latest available exchange rate. Final amount is locked
          at checkout.
        </p>
      ) : null}
      <Link
        className="mt-6 rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white"
        href={
          plan.isEnterprise
            ? '/dashboard/billing?enterprise=true'
            : '/dashboard/billing'
        }
      >
        {plan.isEnterprise ? 'Contact sales' : 'Choose plan'}
      </Link>
    </Card>
  );
}
