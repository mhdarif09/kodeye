'use client';

import { Award, Compass, Eye, Github, Linkedin, Target, Users } from 'lucide-react';
import Image from 'next/image';

import { MarketingNav } from '../../components/marketing-nav';
import type { TrustedCompany } from '../../features/partners/types';
import type { TeamMember } from '../../features/team/types';
import { GridDots } from '../landing/hero-section';
import { TestimonialsCtaFooter } from '../landing/testimonials-cta-footer';
import { TrustedPartnersSection } from '../landing/trusted-partners-section';

interface Props {
  members?: TeamMember[];
  partners?: TrustedCompany[];
  whatsappHref: string;
}

const defaultMembers: TeamMember[] = [
  {
    id: '1',
    name: 'M. Arif',
    role: 'Founder & Lead AI Architect',
    description: 'Arsitek utama sistem kecerdasan buatan, arsitektur cloud ekstrim, serta strategi pengembangan perangkat lunak.',
    photoUrl: '/hero-girl.jpg',
    linkedinUrl: 'https://linkedin.com',
    githubUrl: 'https://github.com',
    instagramUrl: null,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: '2',
    name: 'Sarah Jenkins',
    role: 'Lead Cloud & DevOps Engineer',
    description: 'Pakar infrastruktur cloud berketahanan tinggi, keandalan server 99.99%, dan otomasi alur integrasi berkelanjutan.',
    photoUrl: '/hero-girl.jpg',
    linkedinUrl: 'https://linkedin.com',
    githubUrl: 'https://github.com',
    instagramUrl: null,
    sortOrder: 2,
    isActive: true,
  },
  {
    id: '3',
    name: 'Alex Santoso',
    role: 'Lead UI/UX & Web Developer',
    description: 'Spesialis antarmuka pengguna interaktif, animasi mikro berkonversi tinggi, dan performa pemuatan web super kilat.',
    photoUrl: '/hero-girl.jpg',
    linkedinUrl: 'https://linkedin.com',
    githubUrl: 'https://github.com',
    instagramUrl: null,
    sortOrder: 3,
    isActive: true,
  },
];

export default function AboutPageClient({ members, partners, whatsappHref }: Props) {
  const displayTeam = members && members.length > 0 ? members : defaultMembers;
  const stats = [
    { num: '5+', label: 'Tahun Berjalan' },
    { num: '150+', label: 'Klien Selesai' },
    { num: '98%', label: 'Klien Puas' },
    { num: '24/7', label: 'Dukungan AI' },
  ];

  const journeyHistory = [
    {
      year: '2021',
      title: 'Awal Berdiri (Foundation)',
      desc: 'Kodeye resmi didirikan dengan visi membantu pelaku bisnis lokal membangun website profesional berkinerja tinggi.',
    },
    {
      year: '2023',
      title: 'Ekspansi AI Automation',
      desc: 'Mengintegrasikan teknologi Machine Learning dan WhatsApp AI Chatbot untuk otomatisasi layanan pelanggan 24 jam.',
    },
    {
      year: '2025',
      title: '150+ Proyek Digital Sukses',
      desc: 'Berhasil menyelesaikan lebih dari 150 sistem perusahaan besar, e-commerce, hingga SaaS dashboard berskala nasional.',
    },
    {
      year: '2026',
      title: 'Pusat Inovasi AI Terpadu',
      desc: 'Menjadi agensi teknologi terdepan dengan sistem manajemen portofolio dinamis dan standar keamanan audit kelas dunia.',
    },
  ];

  return (
    <main className="min-h-screen bg-background text-white selection:bg-primary/30 selection:text-white overflow-hidden">
      <MarketingNav whatsappHref={whatsappHref} />

      {/* ── 1. Hero Watermark Banner ────────────────────────────── */}
      <section className="relative pt-36 pb-20 px-6 lg:px-12 overflow-hidden text-center flex items-center justify-center min-h-[460px]">
        {/* Giant Background Watermark Text matching Stygar */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <span className="text-[12vw] md:text-[11rem] font-black uppercase tracking-widest text-white/[0.04] scale-y-125 font-mono">
            About Us
          </span>
        </div>

        {/* Foreground Title */}
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold uppercase tracking-wider text-primary mb-2">
            <Compass className="h-3.5 w-3.5" />
            Kodeye Company Profile
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Architecting Modern <span className="relative inline-block px-3 py-1 border-2 border-primary text-primary rounded-xl shadow-glow bg-primary/5">Digital</span> Systems
          </h1>
          <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto leading-7 font-normal">
            Mengenal lebih dekat perjalanan panjang Kodeye dalam mendedikasikan teknologi, arsitektur kode mengagumkan, dan kecerdasan buatan demi kesuksesan bisnis Anda.
          </p>
        </div>
      </section>

      {/* ── 2. Vision & Mission Section ─────────────────────────── */}
      <section className="py-20 px-6 lg:px-12 bg-background relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Visi Card */}
            <div className="group rounded-3xl bg-card border border-white/[0.08] p-10 flex flex-col justify-between transition-all duration-500 hover:border-primary/60 hover:-translate-y-1.5 shadow-soft relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/15 transition duration-500" />
              
              <div className="relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/30 text-primary mb-8 shadow-glow">
                  <Eye className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-extrabold text-white mb-4 flex items-center gap-3">
                  Visi Kami <span className="text-xs font-normal font-mono px-3 py-1 rounded-full bg-white/5 text-text-secondary">::: Vision</span>
                </h2>
                <p className="text-sm leading-8 text-text-secondary">
                  Menjadi agensi teknologi dan mitra automasi AI terdepan di Asia Tenggara yang menghadirkan ekosistem digital kelas dunia, memberdayakan bisnis lokal untuk bersaing secara mendunia tanpa batas teknis.
                </p>
              </div>
            </div>

            {/* Misi Card */}
            <div className="group rounded-3xl bg-gradient-to-br from-[#1c1c1c] via-[#121212] to-[#1a0a0a] border border-white/[0.08] p-10 flex flex-col justify-between transition-all duration-500 hover:border-primary hover:-translate-y-1.5 shadow-soft relative overflow-hidden">
              <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 group-hover:opacity-100 transition" />
              
              <div className="relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white mb-8 shadow-glow">
                  <Target className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-extrabold text-white mb-4 flex items-center gap-3">
                  Misi Kami <span className="text-xs font-normal font-mono px-3 py-1 rounded-full bg-white/5 text-white/60">::: Mission</span>
                </h2>
                <ul className="space-y-4 text-sm leading-7 text-text-secondary">
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">01.</span>
                    <span>Membangun website berkecepatan pemuatan ekstrim dan berkonversi prospek tinggi.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">02.</span>
                    <span>Mengotomatisasi operasional admin dan layanan pelanggan klien melalui AI 24 jam non-stop.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">03.</span>
                    <span>Menerapkan standar audit keamanan kode ketat guna menjamin ketahanan sistem 100%.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Stats Strip matching Stygar ──────────────────────── */}
      <section className="py-16 px-6 lg:px-12 bg-background border-y border-white/[0.05]">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-8">
          <GridDots className="hidden lg:block text-primary scale-125 shrink-0" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 w-full flex-1 justify-items-center text-center sm:text-left">
            {stats.map((st, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-4xl sm:text-5xl font-black font-mono text-primary tracking-tight">
                  {st.num}
                </span>
                <span className="text-xs text-white font-semibold leading-4 max-w-[110px]">
                  {st.label}
                </span>
              </div>
            ))}
          </div>

          <GridDots className="hidden lg:block text-primary scale-125 shrink-0" />
        </div>
      </section>

      {/* ── 4. Our Journey Timeline ─────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center justify-center sm:justify-start">
                Our Journey <GridDots className="text-primary ml-3" />
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-text-secondary">
                Rekam jejak pertumbuhan nyata Kodeye melintasi berbagai fase inovasi teknologi digital.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
              <Award className="h-4 w-4" /> 100% Milestone Reached
            </div>
          </div>

          {/* Dotted connected steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Top dashed line connector for large screens */}
            <div className="hidden lg:block absolute top-10 left-20 right-20 h-0.5 border-t-2 border-dashed border-white/15 z-0" />

            {journeyHistory.map((item, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-start space-y-4 rounded-3xl bg-card border border-white/[0.06] p-7 transition-all duration-300 hover:border-primary/50 hover:-translate-y-1">
                <div className="flex h-12 px-4 items-center justify-center rounded-xl border border-primary bg-primary/10 text-base font-black font-mono text-primary shadow-glow">
                  {item.year}
                </div>
                <h3 className="text-lg font-bold text-white pt-2">{item.title}</h3>
                <p className="text-xs leading-6 text-text-secondary font-normal">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Our Members (3 Orang Saje) ───────────────────────── */}
      <section className="py-24 px-6 lg:px-12 bg-[#0c0c0c] border-t border-white/[0.05]">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-text-secondary mb-3">
              <Users className="h-3.5 w-3.5 text-primary" /> Core Experts
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white flex items-center justify-center">
              Our Member <GridDots className="text-primary ml-3 animate-pulse" />
            </h2>
            <p className="mt-4 max-w-lg mx-auto text-sm leading-6 text-text-secondary">
              Tiga pilar otak engineer dan arsitek utama di balik seluruh ketangguhan sistem digital Kodeye.
            </p>
          </div>

          {/* Exactly 3 Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayTeam.map((member, i) => {
              const initials = member.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={member.id || i}
                  className="group relative rounded-3xl bg-card border border-white/[0.08] p-8 text-center flex flex-col items-center justify-between transition-all duration-500 hover:border-primary/70 hover:-translate-y-2 shadow-xl"
                >
                  <div>
                    {/* Avatar Circular Box */}
                    <div className="relative mx-auto mb-6 h-28 w-28 overflow-hidden rounded-full bg-gradient-to-tr from-[#181818] via-[#242424] to-primary p-1 shadow-glow transition-transform duration-500 group-hover:scale-105">
                      {member.photoUrl ? (
                        <div className="relative h-full w-full overflow-hidden rounded-full bg-[#111111]">
                          <Image src={member.photoUrl} alt={member.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#111111] text-2xl font-black tracking-widest text-white font-mono">
                          {initials}
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1 z-10 h-5 w-5 rounded-full bg-primary border-2 border-[#111111]" />
                    </div>

                    <h3 className="text-xl font-extrabold text-white">{member.name}</h3>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mt-1.5 mb-4">
                      {member.role}
                    </p>
                    <p className="text-xs leading-6 text-text-secondary max-w-xs mx-auto">
                      {member.description}
                    </p>
                  </div>

                  {/* Social links simulation */}
                  <div className="mt-8 pt-6 border-t border-white/[0.06] w-full flex items-center justify-center gap-4 text-text-secondary">
                    {member.linkedinUrl ? (
                      <a href={member.linkedinUrl} target="_blank" rel="noreferrer" className="p-2 rounded-full hover:bg-white/10 hover:text-white transition" aria-label="LinkedIn">
                        <Linkedin className="h-4 w-4" />
                      </a>
                    ) : null}
                    {member.githubUrl ? (
                      <a href={member.githubUrl} target="_blank" rel="noreferrer" className="p-2 rounded-full hover:bg-white/10 hover:text-white transition" aria-label="Github">
                        <Github className="h-4 w-4" />
                      </a>
                    ) : null}
                    <span className="text-[10px] font-mono text-primary px-2 py-0.5 rounded bg-primary/10">Verified</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5.5. Trusted Companies ──────────────────────────────── */}
      <TrustedPartnersSection companies={partners} />

      {/* ── 6. Testimonials, CTA & Footer ───────────────────────── */}
      <TestimonialsCtaFooter whatsappHref={whatsappHref} />
    </main>
  );
}
