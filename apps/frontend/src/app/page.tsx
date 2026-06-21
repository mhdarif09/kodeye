import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileSearch,
  MessageSquareCode,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';

import { MarketingNav } from '../components/marketing-nav';
import { absoluteUrl, defaultSeoDescription } from '../lib/seo';
import { services } from './services/service-data';

const stats = [
  {
    label: 'Install GitHub App and start from selected repositories',
    value: '2-click',
  },
  {
    label: 'Audit code, secrets, dependencies, and workflow readiness',
    value: '4 layers',
  },
  {
    label: 'Built for teams that need clarity before production',
    value: 'Pre-merge',
  },
];

const reviewHighlights = [
  {
    icon: MessageSquareCode,
    title: 'PR-style comments',
    description:
      'Kodeye explains risky changes where engineers already make decisions: around code, context, and impact.',
  },
  {
    icon: FileSearch,
    title: 'Codebase audit signals',
    description:
      'Security patterns, secret leaks, dependency risk, and repository metadata are summarized into reviewable findings.',
  },
  {
    icon: Bot,
    title: 'AI-assisted follow-up',
    description:
      'Move from finding to next action with concise explanations, remediation guidance, and engineering context.',
  },
];

const testimonials = [
  {
    quote:
      'Kodeye changed our code review ritual from reactive cleanup into a clear weekly engineering signal.',
    name: 'Nadia Putri',
    role: 'Head of Product Engineering',
    tag: 'SaaS',
  },
  {
    quote:
      'The automation work paid off quickly. We replaced messy handoffs with a workflow the team actually trusts.',
    name: 'Raka Mahendra',
    role: 'Operations Lead',
    tag: 'Ops',
  },
  {
    quote:
      'It felt like having a senior engineering partner who could audit, explain, and help us ship the fix.',
    name: 'Maya Santoso',
    role: 'Founder',
    tag: 'Startup',
  },
];

const featuredTestimonial = testimonials[0]!;

const pricingPlans = [
  {
    cta: 'Start free',
    description:
      'For founders and small teams trying the audit workflow before scaling.',
    features: [
      '1 repository',
      '5 scans/month',
      'HTML/JSON reports',
      'Manual scans',
    ],
    href: '/register',
    name: 'Free',
    price: 'Free',
  },
  {
    cta: 'Choose Pro',
    description:
      'For solo builders and focused teams that need GitHub-connected audits.',
    features: [
      '10 repositories',
      '100 scans/month',
      'PDF reports',
      'GitHub auto scan',
    ],
    href: '/dashboard/billing',
    name: 'Pro Monthly',
    price: 'Rp99.000',
  },
  {
    cta: 'Choose Team',
    description:
      'For product teams that need broader repository coverage and scan volume.',
    features: [
      '50 repositories',
      '500 scans/month',
      'PDF reports',
      'GitHub auto scan',
    ],
    highlighted: true,
    href: '/dashboard/billing',
    name: 'Team Monthly',
    price: 'Rp299.000',
  },
  {
    cta: 'Contact sales team',
    description:
      'For teams that want audit platform access plus engineering and automation delivery.',
    features: [
      'Up to 1000 repositories',
      '10000 scans/month',
      'PDF reports',
      'Manual approval',
    ],
    href: '/contact-sales',
    name: 'Enterprise Custom',
    price: 'Custom',
  },
];

const trustedSignals = [
  'Private repository workflows',
  'Selected GitHub access',
  'Zero personal access tokens',
  'Actionable audit reports',
  'Engineering handover',
  'Automation-first delivery',
];

const footerColumns = [
  {
    title: 'Product',
    links: [
      { href: '#product', label: 'Audit Platform' },
      { href: '#reviews', label: 'AI Reviews' },
      { href: '#pricing', label: 'Pricing' },
      { href: '/register', label: 'Get Started' },
    ],
  },
  {
    title: 'Services',
    links: [
      { href: '/services/ai-automation', label: 'AI Automation' },
      {
        href: '/services/engineering-consulting',
        label: 'Engineering Consulting',
      },
      {
        href: '/services/devops-infrastructure',
        label: 'DevOps & Infrastructure',
      },
      {
        href: '/services/website-development',
        label: 'Website Development',
      },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/login', label: 'Login' },
      { href: '#customers', label: 'Customers' },
      { href: '#trust', label: 'Trust' },
      {
        href: '/contact-sales',
        label: 'Contact sales',
      },
    ],
  },
];

export default function HomePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    applicationCategory: 'DeveloperApplication',
    description: defaultSeoDescription,
    name: 'Kodeye',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
    operatingSystem: 'Web',
    url: absoluteUrl('/'),
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f5ef] text-slate-950">
      <Script
        id="kodeye-software-jsonld"
        strategy="beforeInteractive"
        type="application/ld+json"
      >
        {JSON.stringify(structuredData)}
      </Script>
      <MarketingNav />

      <section className="relative border-b border-slate-200 bg-[#f7f5ef]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
              <Sparkles className="h-4 w-4 text-brand-600" />
              AI-powered codebase audit and engineering automation
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-bold tracking-tight text-slate-950 sm:text-7xl">
              Review code faster. Automate what slows the business down.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Kodeye combines an AI codebase audit platform with engineering,
              automation, DevOps, and website delivery services for companies
              that want better software and smoother operations.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-brand-700"
                href="/register"
              >
                Start auditing <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 hover:border-slate-400"
                href="/services"
              >
                Explore services <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  className="border-l border-slate-300 pl-4"
                  key={stat.value}
                >
                  <p className="text-2xl font-bold text-slate-950">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <AuditReviewVisual />
        </div>
      </section>

      <section className="bg-white py-8" id="trust">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-slate-500">
            Trusted for practical engineering workflows across product,
            operations, and infrastructure teams
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {trustedSignals.map((item) => (
              <div
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-center text-xs font-semibold text-slate-600"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="border-y border-slate-200 bg-slate-950 py-16 text-white sm:py-20"
        id="product"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">
                Kodeye Audit Platform
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
                A review layer for teams shipping AI-assisted software.
              </h2>
            </div>
            <p className="max-w-3xl text-sm leading-6 text-slate-300 lg:justify-self-end">
              AI makes teams faster, but speed still needs guardrails. Kodeye
              helps teams inspect repositories, understand risk, and turn audit
              findings into concrete engineering action.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {reviewHighlights.map(({ description, icon: Icon, title }) => (
              <div
                className="rounded-lg border border-white/10 bg-white/5 p-6"
                key={title}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-slate-950">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 font-bold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f5ef] py-16 sm:py-20" id="reviews">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-brand-600">
                AI Reviews
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Reviews that explain the risk, not just the line number.
              </h2>
              <p className="mt-5 text-sm leading-6 text-slate-600">
                Kodeye is built around the idea that audit output should be
                useful to humans: concise, contextual, and connected to the next
                action.
              </p>
              <div className="mt-8 grid gap-3">
                {[
                  'Summarize repository risk in language non-security teams can act on.',
                  'Highlight suspicious code paths, dependencies, and exposed secrets.',
                  'Queue initial audits after GitHub sync and keep scan history visible.',
                ].map((item) => (
                  <p
                    className="flex gap-3 text-sm leading-6 text-slate-700"
                    key={item}
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                    {item}
                  </p>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
              <div className="rounded-lg bg-slate-950 p-5 text-sm text-slate-200">
                <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="font-semibold text-white">audit-summary.ts</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Kodeye AI Review
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                    3 findings
                  </span>
                </div>
                <div className="space-y-3 font-mono text-xs">
                  <p>
                    <span className="text-slate-500">42</span>{' '}
                    <span className="text-red-300">- return token;</span>
                  </p>
                  <p>
                    <span className="text-slate-500">42</span>{' '}
                    <span className="text-emerald-300">
                      + return maskSecret(token);
                    </span>
                  </p>
                  <div className="mt-5 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4 font-sans text-sm leading-6 text-cyan-50">
                    <p className="font-semibold text-white">Kodeye comment</p>
                    <p className="mt-2 text-slate-300">
                      This path may expose a credential-like value in response
                      payloads. Mask the token before returning data to the
                      client and add a regression test for this branch.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="border-y border-slate-200 bg-white py-16 sm:py-20"
        id="services"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-brand-600">
                Services
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Get the hands-on team behind the platform.
              </h2>
            </div>
            <p className="max-w-3xl text-sm leading-6 text-slate-600 lg:justify-self-end">
              Kodeye is not only a scanner. We can help teams design AI
              automation, make engineering decisions, stabilize infrastructure,
              and ship websites or business systems that are ready to operate.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {services.map(({ description, href, icon: Icon, title }) => (
              <Link
                className="group flex min-h-[19rem] flex-col rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-xl hover:shadow-slate-200"
                href={href}
                key={href}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-950">
                  {title}
                </h3>
                <p className="mt-3 line-clamp-5 text-sm leading-6 text-slate-600">
                  {description}
                </p>
                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold text-brand-700">
                  View service{' '}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20" id="customers">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-brand-600">
                Testimonials
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Loved by teams that want signal, not scanner noise.
              </h2>
              <p className="mt-5 text-sm leading-6 text-slate-600">
                Modern engineering teams need fast feedback, clear priorities,
                and help turning findings into shipped improvements.
              </p>
            </div>
            <div>
              <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-200">
                <div className="flex items-center justify-between gap-4">
                  <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-200">
                    Featured
                  </span>
                  <div className="flex -space-x-2">
                    {testimonials.map((item) => (
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-950 bg-white text-xs font-bold text-slate-950"
                        key={item.name}
                      >
                        {item.name
                          .split(' ')
                          .map((part) => part[0])
                          .join('')}
                      </div>
                    ))}
                  </div>
                </div>
                <blockquote className="mt-8 text-2xl font-semibold leading-10 tracking-tight">
                  "{featuredTestimonial.quote}"
                </blockquote>
                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
                  <div>
                    <p className="font-bold">{featuredTestimonial.name}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {featuredTestimonial.role}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-950">
                    {featuredTestimonial.tag}
                  </span>
                </div>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {testimonials.slice(1).map((testimonial) => (
                  <figure
                    className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                    key={testimonial.name}
                  >
                    <blockquote className="text-sm leading-6 text-slate-700">
                      "{testimonial.quote}"
                    </blockquote>
                    <figcaption className="mt-5 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-950">
                          {testimonial.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {testimonial.role}
                        </p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600">
                        {testimonial.tag}
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="border-y border-slate-200 bg-[#f7f5ef] py-16 sm:py-20"
        id="pricing"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-brand-600">
                Pricing
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Start with audit. Scale into automation.
              </h2>
            </div>
            <p className="max-w-3xl text-sm leading-6 text-slate-600 lg:justify-self-end">
              Use the platform when you need repository visibility. Contact the
              sales team when you want a combined audit, automation, DevOps, or
              website delivery plan.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {pricingPlans.map((plan) => (
              <div
                className={
                  plan.highlighted
                    ? 'relative rounded-2xl border border-slate-950 bg-white p-6 shadow-2xl shadow-slate-300'
                    : 'rounded-2xl border border-slate-200 bg-white p-6'
                }
                key={plan.name}
              >
                {plan.highlighted ? (
                  <span className="absolute right-5 top-5 rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
                    Popular
                  </span>
                ) : null}
                <CreditCard className="h-6 w-6 text-brand-600" />
                <h3 className="mt-5 text-xl font-bold text-slate-950">
                  {plan.name}
                </h3>
                <p className="mt-3 text-3xl font-bold text-slate-950">
                  {plan.price}
                </p>
                <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">
                  {plan.description}
                </p>
                <div className="mt-6 grid gap-3">
                  {plan.features.map((feature) => (
                    <p
                      className="flex gap-3 text-sm leading-6 text-slate-700"
                      key={feature}
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                      {feature}
                    </p>
                  ))}
                </div>
                <Link
                  className={
                    plan.highlighted
                      ? 'mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700'
                      : 'mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-950 hover:border-slate-400'
                  }
                  href={plan.href}
                >
                  {plan.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-[#f7f5ef] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 rounded-xl bg-slate-950 p-6 text-white sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">
                Start in the right lane
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                Audit the codebase, then automate the operations around it.
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
                Use the platform for repository insight, or bring Kodeye in for
                AI automation, engineering consulting, DevOps, and website
                development.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-slate-100"
                href="/register"
              >
                Try platform <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/20 px-5 py-3 font-semibold text-white hover:bg-white/10"
                href="/contact-sales"
              >
                Contact sales team
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function AuditReviewVisual() {
  const rows = [
    {
      prefix: '+',
      text: 'await scanRepository(repo.id)',
      tone: 'text-emerald-300',
    },
    { prefix: '-', text: 'return secretToken', tone: 'text-red-300' },
    {
      prefix: '+',
      text: 'return maskSecret(secretToken)',
      tone: 'text-emerald-300',
    },
    {
      prefix: '+',
      text: 'queueInitialAudit(installation)',
      tone: 'text-cyan-300',
    },
  ];

  return (
    <div className="audit-float relative rounded-2xl border border-slate-200 bg-slate-950 p-4 shadow-2xl shadow-slate-300/60 sm:p-5">
      <div className="absolute left-10 right-10 top-28 h-16 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#07111f]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-300" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xs font-semibold text-slate-400">
            Kodeye AI Audit
          </p>
        </div>

        <div className="relative p-5">
          <div className="audit-scan-line pointer-events-none absolute left-0 right-0 top-0 h-16 bg-gradient-to-b from-transparent via-cyan-300/25 to-transparent" />
          <div className="grid gap-3 font-mono text-xs">
            {rows.map((row, index) => (
              <div
                className="grid grid-cols-[2rem_1fr] rounded-lg bg-white/[0.035] px-3 py-2"
                key={row.text}
              >
                <span className="text-slate-500">{index + 18}</span>
                <span className={row.tone}>
                  {row.prefix} {row.text}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ['Secrets', '1 high'],
              ['Dependencies', '2 medium'],
              ['Code quality', '4 notes'],
            ].map(([label, value], index) => (
              <div
                className="rounded-lg border border-white/10 bg-white/[0.04] p-3"
                key={label}
              >
                <p className="text-xs text-slate-400">{label}</p>
                <p className="mt-2 text-sm font-bold text-white">{value}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="audit-pulse h-full rounded-full bg-cyan-300"
                    style={{ animationDelay: `${index * 0.25}s` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-brand-500/20 bg-brand-500/10 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-white">AI review summary</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Mask token output, queue initial audit after install, and
                  review dependency alerts before release.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1.8fr]">
          <div>
            <Link
              className="flex items-center gap-2 text-lg font-bold"
              href="/"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand-700">
                <ShieldCheck className="h-5 w-5" />
              </span>
              Kodeye
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
              AI-powered engineering and automation for codebase audit,
              operational workflows, infrastructure, and digital product
              delivery.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['GitHub App', 'AI Audit', 'Automation', 'DevOps'].map(
                (item) => (
                  <span
                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-300"
                    key={item}
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-bold text-white">{column.title}</h3>
                <div className="mt-4 grid gap-3">
                  {column.links.map((link) => (
                    <Link
                      className="text-sm text-slate-400 hover:text-white"
                      href={link.href}
                      key={link.href}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            (c) 2026 Kodeye. Built for teams that care about software quality.
          </p>
          <div className="flex gap-4">
            <Link className="hover:text-white" href="#trust">
              Trust
            </Link>
            <Link className="hover:text-white" href="/pricing">
              Pricing
            </Link>
            <Link className="hover:text-white" href="/contact-sales">
              Contact sales
            </Link>
            <Link className="hover:text-white" href="/login">
              Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
