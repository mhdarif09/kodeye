'use client';

import { GridDots } from './hero-section';

export function JourneyAchievementsSection() {
  const journeySteps = [
    {
      step: '1',
      title: 'Discovery & Consultation',
      desc: 'Berdiskusi mendalam untuk memetakan masalah bisnis dan menentukan scope fitur website / AI yang dibutuhkan.',
    },
    {
      step: '2',
      title: 'Roadmap & Architecture',
      desc: 'Merancang arsitektur sistem, alur kerja automasi, dan wireframe tampilan website secara terstruktur.',
    },
    {
      step: '3',
      title: 'Agile Development',
      desc: 'Proses development intensif dan cepat dengan update transparan yang bisa kamu pantau setiap minggunya.',
    },
    {
      step: '4',
      title: 'Launch & Scale',
      desc: 'Testing menyeluruh, deployment ke server production yang aman, handover kode, serta support garansi.',
    },
  ];

  const awards = [
    { num: '1', title: 'Best AI Automation Partner — TechAwards' },
    { num: '2', title: 'High-Conversion Web Development Agency' },
    { num: '3', title: 'Client Satisfaction Leader 2025' },
    { num: '4', title: 'Fastest Delivery Tech Team of the Year' },
  ];

  return (
    <div className="bg-background">
      {/* ── Our Journey Section ─────────────────────────────── */}
      <section className="py-20 px-6 lg:px-12 border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center">
              Our Journey <GridDots className="text-primary ml-3" />
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-text-secondary">
              Empat langkah mudah dari ide awal hingga sistem digitalmu berjalan live dan mengghasilkan profit.
            </p>
          </div>

          {/* Winding timeline simulation matching Stygar */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {journeySteps.map((item, index) => (
              <div
                key={item.step}
                className={`relative flex flex-col justify-start rounded-3xl bg-card p-8 border border-white/[0.05] transition hover:border-primary/50 ${
                  index % 2 === 1 ? 'lg:translate-y-6' : ''
                }`}
              >
                {/* Number Box simulation matching Stygar red box */}
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-primary bg-primary/10 text-xl font-bold text-primary">
                    {item.step}
                  </div>
                  {/* Dashed connector line indicator */}
                  {index < 3 && (
                    <div className="hidden lg:block absolute right-0 top-14 w-8 border-t border-dashed border-primary/40 translate-x-4" />
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-xs leading-6 text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Achievements Section ────────────────────────── */}
      <section id="achievements" className="py-24 px-6 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Header & Big Numbers */}
            <div className="lg:col-span-6 space-y-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center">
                  Our Achievements <GridDots className="text-primary ml-3" />
                </h2>
                <p className="mt-4 text-sm leading-6 text-text-secondary max-w-md">
                  Kami membuktikan dedikasi kami melalui kualitas output nyata dan kepuasan pelanggan di setiap project.
                </p>
              </div>

              {/* Giant Stacked Numbers matching Stygar image 2 */}
              <div className="space-y-6 select-none">
                <div className="flex items-center gap-6">
                  <span className="text-[6rem] sm:text-[8rem] font-black leading-none text-primary tracking-tighter">
                    20
                  </span>
                  <GridDots className="text-primary text-2xl" />
                  <span className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                    Years Combined<br />Team Experience
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  <GridDots className="text-secondary text-2xl" />
                  <span className="text-[6rem] sm:text-[8rem] font-black leading-none text-secondary tracking-tighter">
                    25
                  </span>
                  <span className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                    Web & AI Projects<br />Delivered in 2025
                  </span>
                </div>
              </div>
            </div>

            {/* Right List matching Stygar numbered list */}
            <div className="lg:col-span-6 space-y-4">
              {awards.map((item) => (
                <div
                  key={item.num}
                  className="flex items-center gap-6 rounded-2xl bg-card border border-white/[0.06] px-6 py-5 transition hover:border-primary/50 hover:translate-x-2"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-sm font-bold text-primary">
                    {item.num}
                  </div>
                  <span className="text-base font-semibold text-white tracking-wide">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
