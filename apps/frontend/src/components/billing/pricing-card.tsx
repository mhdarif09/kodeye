import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

import type { Plan } from '../../features/billing/types';
import { formatMoney } from '../../lib/money';

export function PricingCard({ plan }: { plan: Plan }) {
  const highlighted =
    plan.code.toLowerCase().includes('team') ||
    plan.name.toLowerCase().includes('team');
  const features = [
    `${plan.maxRepositories} repositories`,
    `${plan.maxScansPerMonth} scans/month`,
    plan.enablePdfReport ? 'PDF reports' : 'HTML/JSON reports',
    plan.enableGithubAutoScan ? 'GitHub auto scan' : 'Manual scans',
    plan.enableRecurring ? 'Recurring billing' : 'Manual renewal',
  ];

  return (
    <article
      className={
        highlighted
          ? 'relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white shadow-soft'
          : 'relative flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'
      }
    >
      {highlighted ? (
        <span className="absolute right-5 top-5 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
          Popular
        </span>
      ) : null}
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{plan.name}</h2>
        <p
          className={
            highlighted
              ? 'mt-3 text-sm leading-6 text-slate-300'
              : 'mt-3 text-sm leading-6 text-slate-500'
          }
        >
          {plan.description ||
            'Code audit plan for teams that need clearer production signals.'}
        </p>
      </div>
      <div className="mt-6">
        <p className="text-4xl font-semibold tracking-tight">
          {plan.requiresManualApproval
            ? 'Custom'
            : formatMoney(plan.amount, plan.currencyCode)}
        </p>
        <p
          className={
            highlighted
              ? 'mt-2 text-sm text-slate-400'
              : 'mt-2 text-sm text-slate-500'
          }
        >
          {plan.interval.toLowerCase()} billing
        </p>
      </div>
      <ul className="mt-6 grid gap-3 text-sm">
        {features.map((feature) => (
          <li className="flex gap-3" key={feature}>
            <CheckCircle2
              className={
                highlighted
                  ? 'mt-0.5 h-4 w-4 shrink-0 text-brand-100'
                  : 'mt-0.5 h-4 w-4 shrink-0 text-brand-600'
              }
            />
            <span className={highlighted ? 'text-slate-200' : 'text-slate-700'}>
              {feature}
            </span>
          </li>
        ))}
      </ul>
      {plan.isEstimated ? (
        <p
          className={
            highlighted
              ? 'mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs leading-5 text-slate-300'
              : 'mt-5 rounded-2xl bg-amber-50 p-3 text-xs leading-5 text-amber-800'
          }
        >
          Estimated using latest available exchange rate. Final amount is locked
          at checkout.
        </p>
      ) : null}
      <Link
        className={
          highlighted
            ? 'mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-100'
            : 'mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800'
        }
        href={plan.isEnterprise ? '/contact-sales' : '/dashboard/billing'}
      >
        {plan.isEnterprise ? 'Contact sales' : 'Choose plan'}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
