'use client';

import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useState } from 'react';

type Lang = 'id' | 'en';

interface TestimonialsSectionProps {
  lang: Lang;
}

const testimonials = {
  id: [
    {
      name: 'Andi Pratama',
      role: 'CEO, StartupHub',
      avatar: 'AP',
      rating: 5,
      text: 'Kodeye bikin website company profile kami dalam 2 minggu. Hasilnya premium banget, persis kayak yang kami mau. Tim-nya responsif dan proses-nya transparan dari awal.',
      project: 'Company Website',
    },
    {
      name: 'Rina Marlina',
      role: 'Founder, BizFlow',
      avatar: 'RM',
      rating: 5,
      text: 'Automasi WhatsApp follow-up yang Kodeye bangun untuk kami berhasil ningkatin response rate customer sampai 3x lipat. Luar biasa efektif!',
      project: 'AI Automation',
    },
    {
      name: 'David Setiawan',
      role: 'CTO, TechVenture',
      avatar: 'DS',
      rating: 5,
      text: 'Web app internal kami sekarang jauh lebih rapi dan cepat. Kodeye ngerti kebutuhan teknis kami dan deliver tepat waktu tanpa banyak revisi.',
      project: 'Web App Development',
    },
  ],
  en: [
    {
      name: 'Andi Pratama',
      role: 'CEO, StartupHub',
      avatar: 'AP',
      rating: 5,
      text: 'Kodeye built our company profile website in just 2 weeks. The result is super premium, exactly what we wanted. The team is responsive and the process was transparent from the start.',
      project: 'Company Website',
    },
    {
      name: 'Rina Marlina',
      role: 'Founder, BizFlow',
      avatar: 'RM',
      rating: 5,
      text: 'The WhatsApp follow-up automation Kodeye built for us successfully increased our customer response rate by 3x. Incredibly effective!',
      project: 'AI Automation',
    },
    {
      name: 'David Setiawan',
      role: 'CTO, TechVenture',
      avatar: 'DS',
      rating: 5,
      text: 'Our internal web app is now much cleaner and faster. Kodeye understood our technical needs and delivered on time with minimal revisions.',
      project: 'Web App Development',
    },
  ],
};

export function TestimonialsSection({ lang }: TestimonialsSectionProps) {
  const items = testimonials[lang];
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () => setActiveIndex((i) => (i === 0 ? items.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === items.length - 1 ? 0 : i + 1));

  const active = items[activeIndex]!;
  const nextItem = items[(activeIndex + 1) % items.length]!;

  return (
    <section id="testimonials" className="relative bg-[#0A0A0A] px-4 py-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-px w-full max-w-xl -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute left-1/2 bottom-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-[80px]" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-400">
            {lang === 'id' ? 'Testimoni' : 'Testimonials'}
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {lang === 'id' ? 'Experiences That Inspire' : 'Experiences That Inspire'}
            <span className="text-brand-500"> ✦</span>
          </h2>
        </div>

        {/* Avatar row */}
        <div className="mb-10 flex justify-center gap-3">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all ${
                i === activeIndex
                  ? 'bg-brand-500 text-white shadow-glow scale-110'
                  : 'bg-[#161616] border border-white/10 text-[#B0B0B0] hover:border-brand-500/40'
              }`}
            >
              {item.avatar}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Main card */}
          <article className="relative overflow-hidden rounded-2xl border border-brand-500/20 bg-[#161616] p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-500/8 blur-3xl" />

            <div className="relative flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
                  {active.avatar}
                </div>
                <div>
                  <p className="font-semibold text-white">{active.name}</p>
                  <p className="text-xs text-[#B0B0B0]">{active.role}</p>
                </div>
              </div>
              <span className="text-xs font-medium text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded-full px-3 py-1">
                {active.project}
              </span>
            </div>

            <div className="flex gap-1 mb-5">
              {Array.from({ length: active.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-brand-400 text-brand-400" />
              ))}
              <span className="ml-2 text-xs font-medium text-[#B0B0B0]">{active.rating}.0</span>
            </div>

            <p className="relative text-lg leading-8 text-white font-medium">
              &ldquo;{active.text}&rdquo;
            </p>

            {/* Nav buttons */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={prev}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#B0B0B0] hover:text-white hover:border-brand-500/40 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={next}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white hover:bg-brand-400 transition-all shadow-glow"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </article>

          {/* Preview next card */}
          <article
            className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#161616] p-8 opacity-70 cursor-pointer hover:opacity-100 transition-opacity"
            onClick={next}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#111111] border border-white/10 text-sm font-bold text-[#B0B0B0]">
                {nextItem.avatar}
              </div>
              <div>
                <p className="font-semibold text-white">{nextItem.name}</p>
                <p className="text-xs text-[#B0B0B0]">{nextItem.role}</p>
              </div>
            </div>

            <div className="flex gap-1 mb-5">
              {Array.from({ length: nextItem.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-brand-400/50 text-brand-400/50" />
              ))}
            </div>

            <p className="text-base leading-7 text-[#B0B0B0] line-clamp-4">
              &ldquo;{nextItem.text}&rdquo;
            </p>
          </article>
        </div>

        {/* Dots indicator */}
        <div className="mt-8 flex justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`rounded-full transition-all ${
                i === activeIndex ? 'w-6 h-2 bg-brand-500' : 'w-2 h-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
