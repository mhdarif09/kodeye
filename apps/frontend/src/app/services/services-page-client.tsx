'use client';

import { CheckCircle2, Code2, Cpu, Sparkles } from 'lucide-react';

import { MarketingNav } from '../../components/marketing-nav';
import type { PortfolioProject } from '../../features/portfolio/types';
import { GridDots } from '../landing/hero-section';
import { ProjectsSection } from '../landing/projects-section';
import { TestimonialsCtaFooter } from '../landing/testimonials-cta-footer';

interface Props {
  projects?: PortfolioProject[];
  whatsappHref: string;
}

export default function ServicesPageClient({ projects, whatsappHref }: Props) {
  const journeySteps = [
    {
      step: '1',
      title: 'Discover & Consult',
      desc: 'Kami mendiskusikan visi bisnis, menganalisis rasa sakit operasional, serta merancang arsitektur digital yang pas.',
    },
    {
      step: '2',
      title: 'Plan & Wireframe',
      desc: 'Membuat alur UX dan prototipe desain berkonversi tinggi sebelum baris kode pertama ditulis.',
    },
    {
      step: '3',
      title: 'Develop & Automate',
      desc: 'Eksekusi pemrograman website berkecepatan tinggi dan perakitan alur kerja otomatis AI 24/7.',
    },
    {
      step: '4',
      title: 'Launch & Scale',
      desc: 'Pengujian ketat menyeluruh, perilisan ke cloud server, serta pemantauan performa secara berkelanjutan.',
    },
  ];

  const achievementsList = [
    { num: '1', title: 'Best Digital Partner', subtitle: 'Pilihan utama automasi bisnis' },
    { num: '2', title: 'Innovation Design', subtitle: 'Tampilan UI modern kelas dunia' },
    { num: '3', title: 'Client Satisfaction Leader', subtitle: 'Tingkat kepuasan & hasil konversi 100%' },
    { num: '4', title: 'Growth Company of the Year', subtitle: 'Membantu bisnis melesat cepat' },
  ];

  return (
    <main className="min-h-screen bg-background text-white selection:bg-primary/30 selection:text-white overflow-hidden">
      <MarketingNav whatsappHref={whatsappHref} />

      {/* ── 1. Hero Title Watermark Banner ──────────────────────── */}
      <section className="relative pt-36 pb-20 px-6 lg:px-12 overflow-hidden text-center flex items-center justify-center min-h-[480px]">
        {/* Giant Background Watermark Text matching Stygar */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <span className="text-[14vw] md:text-[13rem] font-black uppercase tracking-widest text-white/[0.04] scale-y-125 font-mono">
            Services
          </span>
        </div>

        {/* Foreground Title */}
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold uppercase tracking-wider text-primary mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Kodeye Dedicated Services
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Turning Your <span className="text-primary underline decoration-primary/40 underline-offset-8">Vision</span> Into Reality
          </h1>
          <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto leading-7 font-normal">
            Solusi pengembangan sistem digital komprehensif mulai dari Website Development berkonversi tinggi hingga AI Automation operasional bisnis.
          </p>
        </div>
      </section>

      {/* ── 2. Creative Design Solutions ────────────────────────── */}
      <section className="py-20 px-6 lg:px-12 bg-background relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center">
              Creative Design Solution <GridDots className="text-primary ml-3 animate-pulse" />
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-text-secondary">
              Layanan teknis terfokus yang dirancang presisi untuk menyelesaikan masalah operasional dan meningkatkan pertumbuhan keuntungan bisnismu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Card 1: Web Development */}
            <div className="group rounded-3xl bg-card border border-white/[0.06] p-8 flex flex-col justify-between transition-all hover:border-primary/50 hover:-translate-y-1 shadow-soft">
              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#181818] border border-white/10 text-text-secondary group-hover:text-primary transition mb-8">
                  <Code2 className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Web Development</h3>
                <p className="text-xs leading-6 text-text-secondary">
                  Pembuatan website perusahaan, landing page promosi, hingga toko online lengkap dengan sistem pembayaran otomatis berkecepatan tinggi.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-white/[0.05] text-xs font-semibold text-primary flex items-center gap-2">
                <span>Pelajari spesifikasi</span> →
              </div>
            </div>

            {/* Card 2: Strategy / AI Automation (Center Card matching Stygar Red Wave) */}
            <div className="group rounded-3xl bg-gradient-to-br from-[#1b1b1b] via-[#141414] to-primary p-8 flex flex-col justify-between transition-all hover:-translate-y-1.5 shadow-2xl relative overflow-hidden border border-primary/40">
              <div className="relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-glow mb-8">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-6">AI Strategy & Automation</h3>
                <ul className="space-y-3 text-xs leading-6 text-white/90">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-primary fill-white shrink-0" />
                    <span>WhatsApp AI Customer Service 24/7</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-primary fill-white shrink-0" />
                    <span>Workflow & Rekap Laporan Otomatis</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-primary fill-white shrink-0" />
                    <span>CRM & Sinkronisasi Multi-API</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-primary fill-white shrink-0" />
                    <span>Kecerdasan Bisnis Tanpa Campur Tangan</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10 text-xs font-bold text-white relative z-10 flex items-center justify-between">
                <span>Layanan Unggulan Terlaris</span> ★
              </div>
            </div>

            {/* Card 3: Custom Web Application & DevOps */}
            <div className="group rounded-3xl bg-card border border-white/[0.06] p-8 flex flex-col justify-between transition-all hover:border-primary/50 hover:-translate-y-1 shadow-soft">
              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#181818] border border-white/10 text-text-secondary group-hover:text-primary transition mb-8">
                  <Cpu className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">SaaS App & Cloud DevOps</h3>
                <p className="text-xs leading-6 text-text-secondary">
                  Arsitektur aplikasi berbasis web kustom (SaaS), setup server cloud berkecepatan tinggi, optimasi database, dan audit keamanan menyeluruh.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-white/[0.05] text-xs font-semibold text-primary flex items-center gap-2">
                <span>Pelajari spesifikasi</span> →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Our Projects Grid ────────────────────────────────── */}
      <ProjectsSection projects={projects} />

      {/* ── 4. Our Journey Timeline matching Stygar ─────────────── */}
      <section className="py-24 px-6 lg:px-12 bg-background border-t border-white/[0.04]">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center">
              Our Journey <GridDots className="text-primary ml-3" />
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-text-secondary">
              Metodologi sistematis 4 langkah pasti dari pemetaan masalah hingga aplikasi live berskala besar.
            </p>
          </div>

          {/* Dotted path connected steps matching Stygar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Top dashed line connector for large screens */}
            <div className="hidden lg:block absolute top-10 left-20 right-20 h-0.5 border-t-2 border-dashed border-white/15 z-0" />

            {journeySteps.map((item, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-start space-y-4 rounded-2xl bg-[#111111]/80 border border-white/5 p-6 backdrop-blur-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/50 bg-primary/10 text-lg font-black font-mono text-primary shadow-glow">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-white pt-2">{item.title}</h3>
                <p className="text-xs leading-6 text-text-secondary font-normal">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Our Achievements Giant Numbers matching Stygar ───── */}
      <section className="py-20 px-6 lg:px-12 bg-background">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Title & Giant Red Numbers */}
          <div className="lg:col-span-6 space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center">
              Our Achievements <GridDots className="text-primary ml-3" />
            </h2>

            <div className="flex items-center gap-10 sm:gap-16">
              <div className="flex items-center">
                <span className="text-7xl sm:text-9xl font-black text-primary font-mono tracking-tighter">
                  20
                </span>
                <GridDots className="text-primary ml-2 scale-125" />
              </div>
              <div className="flex items-center">
                <span className="text-7xl sm:text-9xl font-black text-primary font-mono tracking-tighter">
                  25
                </span>
                <GridDots className="text-primary ml-2 scale-125" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary leading-6 max-w-md">
              Dedikasi penuh menghasilkan pencapaian nyata dalam percepatan performa digital klien di seluruh nusantara.
            </p>
          </div>

          {/* Right Achievements Vertical Boxes */}
          <div className="lg:col-span-6 space-y-4">
            {achievementsList.map((ach, i) => (
              <div
                key={i}
                className="flex items-center gap-5 rounded-2xl bg-card border border-white/[0.06] p-5 transition hover:border-primary/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 font-mono text-sm font-bold text-primary">
                  {ach.num}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{ach.title}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">{ach.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Testimonials, CTA & Footer ───────────────────────── */}
      <TestimonialsCtaFooter whatsappHref={whatsappHref} />
    </main>
  );
}
