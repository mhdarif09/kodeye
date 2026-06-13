import { ArrowRight, Boxes, Github, KeyRound, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const capabilities = [
  {
    icon: ShieldCheck,
    title: 'Code Security Audit',
    description: 'Build a clear workflow to identify potential code risks.',
  },
  {
    icon: KeyRound,
    title: 'Secret Leak Detection',
    description: 'Prepare reviews that help catch exposed credentials early.',
  },
  {
    icon: Boxes,
    title: 'Dependency Risk Review',
    description:
      'Keep vulnerable dependency review visible and understandable.',
  },
  {
    icon: Github,
    title: 'GitHub Workflow Ready',
    description:
      'Organize repositories now, then connect GitHub in the next phase.',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white">
      <nav className="border-b border-slate-100">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            className="flex items-center gap-2 text-lg font-bold text-slate-950"
            href="/"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            Kodeye
          </Link>
          <div className="flex items-center gap-2">
            <Link
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              href="/login"
            >
              Sign In
            </Link>
            <Link
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              href="/register"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative">
        <div className="absolute inset-x-0 top-0 -z-0 h-[34rem] bg-[radial-gradient(circle_at_top_right,_#e0e7ff,_transparent_45%),radial-gradient(circle_at_top_left,_#cffafe,_transparent_38%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3 py-1.5 text-sm font-semibold text-brand-700 shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              Clear security review workflows
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
              Audit Your Codebase Before Vulnerabilities Reach Production
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Kodeye helps teams detect risky code patterns, leaked secrets, and
              vulnerable dependencies through a simple security audit workflow.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-brand-700"
                href="/register"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                href="/login"
              >
                Sign In
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-4 shadow-2xl shadow-indigo-200/60 sm:p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  Security workspace
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  A calm place to organize reviews
                </p>
              </div>
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                Ready
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {capabilities.slice(0, 3).map(({ icon: Icon, title }, index) => (
                <div
                  className={
                    index === 0
                      ? 'rounded-2xl bg-brand-600 p-4 text-white sm:col-span-2'
                      : 'rounded-2xl bg-white/5 p-4 text-white'
                  }
                  key={title}
                >
                  <Icon className="h-5 w-5" />
                  <p className="mt-8 text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-xs text-slate-300">
                    {index === 0
                      ? 'Organize your first repository review.'
                      : 'Coming in a focused next phase.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600">
              Simple by design
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              A security workflow your whole team can understand
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map(({ description, icon: Icon, title }) => (
              <div
                className="rounded-2xl border border-slate-200 bg-white p-5"
                key={title}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-bold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
