'use client';

type Lang = 'id' | 'en';

interface JourneySectionProps {
  lang: Lang;
}

const data = {
  id: {
    eyebrow: 'Cara Kerja Kami',
    title: 'Our Journey',
    steps: [
      {
        number: '01',
        title: 'Discovery',
        description: 'Memahami kebutuhan, masalah, target bisnis, dan kondisi sistem yang sudah ada saat ini.',
      },
      {
        number: '02',
        title: 'Planning',
        description: 'Menyusun solusi teknis, scope project, prioritas fitur, dan roadmap delivery yang jelas.',
      },
      {
        number: '03',
        title: 'Build',
        description: 'Membangun website atau sistem AI automation sesuai scope yang sudah disepakati bersama.',
      },
      {
        number: '04',
        title: 'Launch',
        description: 'Testing, deployment ke production, dokumentasi, handover, dan support pasca-launch.',
      },
    ],
  },
  en: {
    eyebrow: 'How We Work',
    title: 'Our Journey',
    steps: [
      {
        number: '01',
        title: 'Discovery',
        description: 'Understand your needs, goals, business challenges, and the existing system conditions.',
      },
      {
        number: '02',
        title: 'Planning',
        description: 'Define technical solutions, project scope, feature priorities, and a clear delivery roadmap.',
      },
      {
        number: '03',
        title: 'Build',
        description: 'Build the website or AI automation system according to the agreed-upon scope.',
      },
      {
        number: '04',
        title: 'Launch',
        description: 'Testing, production deployment, documentation, handover, and post-launch support.',
      },
    ],
  },
};

export function JourneySection({ lang }: JourneySectionProps) {
  const t = data[lang];

  return (
    <section id="process" className="relative bg-[#0A0A0A] px-4 py-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-px w-full max-w-xl -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-400">{t.eyebrow}</p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {t.title}
            <span className="text-brand-500"> ✦</span>
          </h2>
        </div>

        {/* Steps — top row 2, bottom row 2 with connector lines */}
        <div className="relative">
          {/* Top row */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.steps.map((step, i) => (
              <div key={step.number} className="relative">
                {/* Connector line (desktop) */}
                {i < t.steps.length - 1 && (
                  <div className="absolute right-0 top-7 hidden h-px w-1/2 translate-x-full bg-gradient-to-r from-brand-500/50 to-brand-500/10 lg:block" />
                )}

                <article className="group relative rounded-2xl border border-white/[0.06] bg-[#161616] p-6 card-hover h-full">
                  {/* Number badge */}
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-500/10 text-lg font-bold text-brand-400">
                    {step.number}
                  </div>

                  {/* Glow on hover */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(111,60,255,0.08) 0%, transparent 70%)' }} />

                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#B0B0B0]">{step.description}</p>
                </article>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <div className="mt-10 rounded-2xl border border-brand-500/15 bg-brand-500/[0.06] px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400">
            <span className="text-lg">⚡</span>
          </div>
          <p className="text-sm leading-7 text-[#B0B0B0]">
            {lang === 'id'
              ? 'Proses kami transparan dan fleksibel — cocok untuk project kecil maupun sistem yang kompleks. Konsultasi awal gratis tanpa komitmen.'
              : 'Our process is transparent and flexible — suitable for small projects and complex systems alike. Initial consultation is free with no commitment.'}
          </p>
        </div>
      </div>
    </section>
  );
}
