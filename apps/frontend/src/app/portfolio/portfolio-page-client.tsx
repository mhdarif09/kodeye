'use client';

import { ArrowUpRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';

import { MarketingNav } from '../../components/marketing-nav';
import type { PortfolioProject } from '../../features/portfolio/types';
import { GridDots } from '../landing/hero-section';
import { TestimonialsCtaFooter } from '../landing/testimonials-cta-footer';

interface Props {
  projects?: PortfolioProject[];
  whatsappHref: string;
}

const defaultPortfolioItems: PortfolioProject[] = [
  {
    id: '1',
    title: 'Berkshire Hathaway System',
    subtitle: 'Corporate AI Workflow Automation',
    category: 'AI Automation',
    imageUrl: '/projects/ai-automation.png',
    projectUrl: 'https://kodeye.id',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: '2',
    title: 'Dretigal Gold Store',
    subtitle: 'High-Converting E-Commerce Web',
    category: 'Web Development',
    imageUrl: '/projects/landing-web.png',
    projectUrl: 'https://kodeye.id',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: '3',
    title: 'Thas Fimek Cont SaaS',
    subtitle: 'Internal Analytics Dashboard App',
    category: 'SaaS App',
    imageUrl: '/projects/web-dashboard.png',
    projectUrl: 'https://kodeye.id',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: '4',
    title: 'Startalatyiou Portal',
    subtitle: 'Company Profile & Landing Funnel',
    category: 'Web Development',
    imageUrl: '/projects/chatbot-app.png',
    projectUrl: 'https://kodeye.id',
    sortOrder: 4,
    isActive: true,
  },
  {
    id: '5',
    title: 'Elevate UI/UX Studio',
    subtitle: 'Design System & Frontend Engine',
    category: 'Web Development',
    imageUrl: '/projects/landing-web.png',
    projectUrl: 'https://kodeye.id',
    sortOrder: 5,
    isActive: true,
  },
  {
    id: '6',
    title: 'Kodeye AI Bot Assistant',
    subtitle: '24/7 WhatsApp Customer Support',
    category: 'AI Automation',
    imageUrl: '/projects/ai-automation.png',
    projectUrl: 'https://kodeye.id',
    sortOrder: 6,
    isActive: true,
  },
];

export default function PortfolioPageClient({ projects, whatsappHref }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('All Project');

  const allProjects = useMemo(() => {
    return projects && projects.length > 0 ? projects : defaultPortfolioItems;
  }, [projects]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    allProjects.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return ['All Project', ...Array.from(cats)];
  }, [allProjects]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All Project') return allProjects;
    return allProjects.filter((p) => p.category?.toLowerCase() === activeCategory.toLowerCase());
  }, [allProjects, activeCategory]);

  const stats = [
    { num: '150+', label: 'Project Completed' },
    { num: '98%', label: 'Client Satisfaction' },
    { num: '5+', label: 'Years of Experience' },
    { num: '24/7', label: 'Support Available' },
  ];

  return (
    <main className="min-h-screen bg-background text-white selection:bg-primary/30 selection:text-white overflow-hidden">
      <MarketingNav whatsappHref={whatsappHref} />

      {/* ── 1. Hero Watermark Banner ────────────────────────────── */}
      <section className="relative pt-36 pb-20 px-6 lg:px-12 overflow-hidden text-center flex items-center justify-center min-h-[460px]">
        {/* Giant Background Watermark Text matching Stygar */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <span className="text-[13vw] md:text-[12rem] font-black uppercase tracking-widest text-white/[0.04] scale-y-125 font-mono">
            Portfolio
          </span>
        </div>

        {/* Foreground Title */}
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold uppercase tracking-wider text-primary mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Kodeye Works Showcase
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            A Glimpse Into Our <span className="relative inline-block px-3 py-1 border-2 border-primary text-primary rounded-xl shadow-glow bg-primary/5">Creative</span> World
          </h1>
          <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto leading-7 font-normal">
            Jelajahi berbagai studi kasus transformasi digital klien kami melalui perombakan tata letak UI/UX modern dan otomatisasi sistem kecerdasan buatan.
          </p>
        </div>
      </section>

      {/* ── 2. Innovation on Display Showcase Box ───────────────── */}
      <section className="py-20 px-6 lg:px-12 bg-background relative z-10">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-white/[0.06] pb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center">
                Innovation on Display <GridDots className="text-primary ml-3 animate-pulse" />
              </h2>
            </div>

            {/* Filter Tabs matching Stygar pill row */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                      isActive
                        ? 'bg-primary text-white shadow-glow scale-105'
                        : 'bg-card border border-white/10 text-text-secondary hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project Grid (2 columns x 3 rows matching Stygar mockup) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[400px]">
            {filteredProjects.map((item) => (
              <a
                key={item.id}
                href={item.projectUrl || '#'}
                target={item.projectUrl?.startsWith('http') ? '_blank' : '_self'}
                rel="noreferrer"
                className="group relative block overflow-hidden rounded-3xl bg-card border border-white/[0.06] transition-all duration-500 hover:border-primary/60 hover:-translate-y-1.5 shadow-soft"
              >
                {/* Thumbnail Image */}
                <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-[#141414]">
                  <Image
                    src={item.imageUrl || '/projects/landing-web.png'}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/20 to-transparent" />
                </div>

                {/* Glass Bottom Overlay */}
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-1">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-text-secondary mt-0.5">{item.subtitle}</p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-transform duration-300 group-hover:scale-110 group-hover:bg-secondary group-hover:text-black shadow-md">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                </div>
              </a>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="py-20 text-center rounded-3xl border border-dashed border-white/10 bg-card/40 text-text-secondary">
              Tidak ada proyek dalam kategori &ldquo;{activeCategory}&rdquo;.
            </div>
          )}
        </div>
      </section>

      {/* ── 3. Stats Strip matching Stygar ──────────────────────── */}
      <section className="py-16 px-6 lg:px-12 bg-background border-y border-white/[0.05]">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-8">
          <GridDots className="hidden lg:block text-primary scale-125 shrink-0" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 w-full flex-1 justify-items-center text-center sm:text-left">
            {stats.map((st, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                  {st.num}
                </span>
                <span className="text-xs text-text-secondary font-medium leading-4 max-w-[100px]">
                  {st.label}
                </span>
              </div>
            ))}
          </div>

          <GridDots className="hidden lg:block text-primary scale-125 shrink-0" />
        </div>
      </section>

      {/* ── 4 & 5. Testimonials, CTA & Footer ───────────────────── */}
      <TestimonialsCtaFooter whatsappHref={whatsappHref} />
    </main>
  );
}
