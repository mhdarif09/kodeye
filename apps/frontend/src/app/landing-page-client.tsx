'use client';

import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  GitBranch,
  Globe2,
  Instagram,
  Layers3,
  MessageCircle,
  Quote,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Star,
  Workflow,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { MarketingNav } from '../components/marketing-nav';
import { blogApi } from '../features/blog/api';
import type { BlogPost } from '../features/blog/types';

type Lang = 'id' | 'en';
type IconComponent = typeof Workflow;

export interface LandingBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  createdAt: string | null;
  displayDate: string;
  updatedAt: string | null;
  publishedAt: string | null;
}

interface LandingPageClientProps {
  posts: LandingBlogPost[];
  whatsappHref: string;
}

function toLandingBlogPost(post: BlogPost): LandingBlogPost {
  return {
    createdAt: post.createdAt ?? null,
    displayDate: formatBlogDisplayDate(post.publishedAt ?? post.createdAt),
    excerpt: post.excerpt ?? '',
    id: String(post.id ?? post.slug ?? ''),
    publishedAt: post.publishedAt ?? null,
    slug: post.slug ?? '',
    title: post.title ?? '',
    updatedAt: post.updatedAt ?? null,
  };
}

function formatBlogDisplayDate(value: string | null) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(date);
}

const copy = {
  id: {
    badge: 'Tech partner untuk bisnis modern',
    brief: 'Kirim Brief',
    cta: 'Konsultasi Gratis',
    heroTitle: 'Bangun sistem digital yang rapi, cepat, dan siap scale.',
    heroSubtitle:
      'Kodeye membantu bisnis merancang, membangun, dan merapikan sistem melalui AI automation, web development, DevOps, infrastructure, dan code audit.',
    secondaryCta: 'Lihat Layanan',
    proof: [
      'AI Automation',
      'Web Development',
      'DevOps',
      'Infrastructure',
      'Code Audit',
    ],
    servicesTitle: 'Layanan teknologi yang bisa langsung dipakai bisnis',
    servicesSubtitle:
      'Mulai dari workflow internal sampai production environment, Kodeye membantu membuat sistem yang jelas, aman, dan mudah dikembangkan.',
    highlightTitle: 'Detail layanan',
    highlightSubtitle:
      'Pilih satu layanan, atau gabungkan beberapa kebutuhan dalam satu roadmap delivery yang lebih rapi.',
    productTitle: 'Produk SaaS Kodeye',
    productSubtitle:
      'Selain layanan custom, Kodeye juga memiliki produk SaaS untuk code audit, security checking, code review, dan production readiness.',
    whyTitle: 'Bukan sekadar bikin website',
    whySubtitle:
      'Kami membantu bisnis mengambil keputusan teknis dengan pendekatan engineering-first, bukan hanya tampilan depan.',
    processTitle: 'Cara kerja kami',
    processSubtitle:
      'Proses dibuat singkat, transparan, dan cukup fleksibel untuk project kecil maupun sistem yang lebih kompleks.',
    workTitle: 'Format project yang biasa kami bantu',
    trustTitle: 'Testimoni client',
    trustSubtitle:
      'Section ini disiapkan untuk menampilkan feedback asli dari client, project owner, dan tim teknis setelah mendapat approval.',
    blogTitle: 'Insight terbaru',
    finalTitle: 'Punya proses bisnis atau sistem yang ingin dirapikan?',
    finalSubtitle:
      'Diskusikan kebutuhan AI automation, web development, DevOps, infrastructure, atau code audit bersama Kodeye.',
    readArticle: 'Baca Artikel',
  },
  en: {
    badge: 'Tech partner for modern businesses',
    brief: 'Send Brief',
    cta: 'Free Consultation',
    heroTitle:
      'Build digital systems that are clean, fast, and ready to scale.',
    heroSubtitle:
      'Kodeye helps businesses design, build, and improve systems through AI automation, web development, DevOps, infrastructure, and code audit.',
    secondaryCta: 'View Services',
    proof: [
      'AI Automation',
      'Web Development',
      'DevOps',
      'Infrastructure',
      'Code Audit',
    ],
    servicesTitle: 'Technology services built for real business use',
    servicesSubtitle:
      'From internal workflows to production environments, Kodeye helps create systems that are clear, secure, and easier to grow.',
    highlightTitle: 'Service details',
    highlightSubtitle:
      'Pick one service, or combine multiple needs into one cleaner delivery roadmap.',
    productTitle: 'Kodeye SaaS Product',
    productSubtitle:
      'Besides custom services, Kodeye also has a SaaS product for code audit, security checking, code review, and production readiness.',
    whyTitle: 'More than a website vendor',
    whySubtitle:
      'We help businesses make technical decisions with an engineering-first approach, not just a polished surface.',
    processTitle: 'How we work',
    processSubtitle:
      'A compact, transparent process that works for smaller projects and more complex systems.',
    workTitle: 'Project formats we can help with',
    trustTitle: 'Client testimonials',
    trustSubtitle:
      'This section is prepared for real approved feedback from clients, project owners, and technical teams.',
    blogTitle: 'Latest insights',
    finalTitle: 'Have a business process or system that needs cleanup?',
    finalSubtitle:
      'Discuss AI automation, web development, DevOps, infrastructure, or code audit needs with Kodeye.',
    readArticle: 'Read Article',
  },
};

const services: Record<
  Lang,
  {
    title: string;
    description: string;
    href: string;
    icon: IconComponent;
    points: string[];
  }[]
> = {
  id: [
    {
      description:
        'Otomatiskan workflow bisnis, admin, follow-up, laporan, integrasi tools, chatbot, dan AI assistant.',
      href: '/services/ai-automation',
      icon: Workflow,
      points: [
        'Otomasi admin dan laporan',
        'Chatbot dan support automation',
        'Integrasi tools dan API',
      ],
      title: 'AI Automation',
    },
    {
      description:
        'Bangun website, landing page, dashboard, web app, dan sistem internal yang modern dan responsive.',
      href: '/services/website-development',
      icon: Globe2,
      points: ['Website bisnis', 'Web app custom', 'Dashboard internal'],
      title: 'Web Development',
    },
    {
      description:
        'Setup deployment, CI/CD, container, monitoring, dan workflow production agar sistem lebih stabil.',
      href: '/services/devops-infrastructure',
      icon: GitBranch,
      points: ['CI/CD setup', 'Docker deployment', 'Monitoring'],
      title: 'DevOps',
    },
    {
      description:
        'Setup server, cloud, domain, SSL, database, backup, dan environment production yang aman.',
      href: '/services/devops-infrastructure',
      icon: ServerCog,
      points: ['VPS/cloud setup', 'SSL dan domain', 'Backup dan database'],
      title: 'Infrastructure',
    },
    {
      description:
        'Audit struktur kode, security issue, performance, maintainability, dan kesiapan project sebelum production.',
      href: '/services/engineering-consulting',
      icon: FileSearch,
      points: [
        'Code quality review',
        'Security checking',
        'Production readiness',
      ],
      title: 'Code Audit',
    },
  ],
  en: [
    {
      description:
        'Automate business workflows, admin work, follow-ups, reports, tool integrations, chatbots, and AI assistants.',
      href: '/services/ai-automation',
      icon: Workflow,
      points: [
        'Admin and report automation',
        'Chatbot and support automation',
        'Tools and API integration',
      ],
      title: 'AI Automation',
    },
    {
      description:
        'Build modern responsive websites, landing pages, dashboards, web apps, and internal systems.',
      href: '/services/website-development',
      icon: Globe2,
      points: ['Business websites', 'Custom web apps', 'Internal dashboards'],
      title: 'Web Development',
    },
    {
      description:
        'Set up deployments, CI/CD, containers, monitoring, and production workflows for more stable systems.',
      href: '/services/devops-infrastructure',
      icon: GitBranch,
      points: ['CI/CD setup', 'Docker deployment', 'Monitoring'],
      title: 'DevOps',
    },
    {
      description:
        'Set up servers, cloud, domains, SSL, databases, backups, and secure production environments.',
      href: '/services/devops-infrastructure',
      icon: ServerCog,
      points: ['VPS/cloud setup', 'SSL and domains', 'Backups and databases'],
      title: 'Infrastructure',
    },
    {
      description:
        'Audit code structure, security issues, performance, maintainability, and production readiness.',
      href: '/services/engineering-consulting',
      icon: FileSearch,
      points: [
        'Code quality review',
        'Security checking',
        'Production readiness',
      ],
      title: 'Code Audit',
    },
  ],
};

const workItems = {
  id: [
    [
      'Automation flow',
      'Follow-up customer, laporan, notifikasi, dan integrasi workflow.',
    ],
    [
      'Company website',
      'Website modern untuk trust, layanan, dan lead generation.',
    ],
    [
      'Internal system',
      'Dashboard dan sistem operasional untuk proses tim internal.',
    ],
    [
      'Production setup',
      'Server, SSL, database, deployment, monitoring, dan backup.',
    ],
  ],
  en: [
    [
      'Automation flow',
      'Customer follow-up, reports, notifications, and workflow integrations.',
    ],
    [
      'Company website',
      'Modern website for trust, services, and lead generation.',
    ],
    [
      'Internal system',
      'Dashboards and operational systems for internal teams.',
    ],
    [
      'Production setup',
      'Server, SSL, database, deployment, monitoring, and backup.',
    ],
  ],
};

const trustPoints = {
  id: [
    [
      'Engineering-first',
      'Keputusan teknis dibuat dengan fokus security, maintainability, dan scalability.',
    ],
    [
      'Custom sesuai kebutuhan',
      'Scope dibuat berdasarkan masalah bisnis, bukan template yang dipaksakan.',
    ],
    [
      'Dari ide sampai production',
      'Bisa bantu discovery, build, deployment, handover, dan improvement.',
    ],
    [
      'Services + SaaS experience',
      'Kodeye bukan hanya jasa, kami juga membangun produk software sendiri.',
    ],
  ],
  en: [
    [
      'Engineering-first',
      'Technical decisions focus on security, maintainability, and scalability.',
    ],
    [
      'Custom to the problem',
      'Scope is shaped around business needs, not a forced template.',
    ],
    [
      'Idea to production',
      'We can help with discovery, build, deployment, handover, and improvement.',
    ],
    [
      'Services + SaaS experience',
      'Kodeye is not only a service team, we also build our own software product.',
    ],
  ],
};

const process = {
  id: [
    [
      '01',
      'Discovery',
      'Memahami kebutuhan, masalah, target, dan sistem yang sudah ada.',
    ],
    [
      '02',
      'Planning',
      'Menentukan solusi, scope, prioritas, dan roadmap delivery.',
    ],
    [
      '03',
      'Build',
      'Membangun automation, web, infrastructure, atau audit sesuai kebutuhan.',
    ],
    [
      '04',
      'Launch',
      'Testing, deployment, dokumentasi, handover, dan improvement.',
    ],
  ],
  en: [
    [
      '01',
      'Discovery',
      'Understand needs, problems, goals, and existing systems.',
    ],
    [
      '02',
      'Planning',
      'Define solution, scope, priorities, and delivery roadmap.',
    ],
    [
      '03',
      'Build',
      'Build automation, web, infrastructure, or audit based on needs.',
    ],
    [
      '04',
      'Launch',
      'Testing, deployment, documentation, handover, and improvement.',
    ],
  ],
};

export default function LandingPageClient({
  posts,
  whatsappHref,
}: LandingPageClientProps) {
  const [lang, setLang] = useState<Lang>('id');
  const t = copy[lang];
  const activeServices = services[lang];

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-slate-950">
      <MarketingNav
        lang={lang}
        onLangChange={setLang}
        whatsappHref={whatsappHref}
      />
      <HeroSection lang={lang} t={t} whatsappHref={whatsappHref} />
      <ServicesSection services={activeServices} t={t} />
      <DetailsSection lang={lang} services={activeServices} t={t} />
      <ProductSection lang={lang} t={t} />
      <WorkSection lang={lang} t={t} />
      <WhySection lang={lang} t={t} />
      <ProcessSection lang={lang} t={t} />
      <TrustSection lang={lang} t={t} />
      <BlogSection posts={posts} t={t} />
      <FinalCta lang={lang} t={t} whatsappHref={whatsappHref} />
      <Footer lang={lang} />
    </main>
  );
}

function HeroSection({
  lang,
  t,
  whatsappHref,
}: {
  lang: Lang;
  t: (typeof copy)[Lang];
  whatsappHref: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-[#f7f5ef]">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-100 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-sm">
            <Sparkles className="h-4 w-4" />
            {t.badge}
          </div>
          <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            {t.heroTitle}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            {t.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-slate-800"
              href={whatsappHref}
            >
              <MessageCircle className="h-4 w-4" />
              {t.cta}
            </a>
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:border-slate-400"
              href="#services"
            >
              {t.secondaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {t.proof.map((item) => (
              <span
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:pt-8">
          <SystemPreview lang={lang} />
        </div>
      </div>
    </section>
  );
}

function SystemPreview({ lang }: { lang: Lang }) {
  const rows =
    lang === 'id'
      ? [
          ['Lead masuk', 'CRM + WhatsApp', 'Auto follow-up'],
          ['Deploy', 'CI/CD pipeline', 'Monitoring'],
          ['Audit kode', 'Security check', 'Ready to ship'],
        ]
      : [
          ['New lead', 'CRM + WhatsApp', 'Auto follow-up'],
          ['Deploy', 'CI/CD pipeline', 'Monitoring'],
          ['Code audit', 'Security check', 'Ready to ship'],
        ];

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-3 shadow-soft">
      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-5 text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-300" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xs font-semibold text-slate-400">
            Kodeye system map
          </p>
        </div>
        <div className="mt-5 grid gap-3">
          {rows.map(([from, middle, to]) => (
            <div
              className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center"
              key={from}
            >
              <span className="font-semibold">{from}</span>
              <ArrowRight className="hidden h-4 w-4 text-brand-100 sm:block" />
              <span className="rounded-lg bg-white/10 px-3 py-2 text-slate-200">
                {middle}
              </span>
              <ArrowRight className="hidden h-4 w-4 text-brand-100 sm:block" />
              <span className="font-semibold text-brand-100">{to}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ['5', 'services'],
            ['1', 'roadmap'],
            ['0', 'guesswork'],
          ].map(([value, label]) => (
            <div
              className="rounded-xl border border-white/10 bg-white/[0.04] p-4"
              key={label}
            >
              <p className="text-3xl font-semibold">{value}</p>
              <p className="mt-1 text-xs text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ServicesSection({
  services: activeServices,
  t,
}: {
  services: (typeof services)[Lang];
  t: (typeof copy)[Lang];
}) {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8" id="services">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Services"
          title={t.servicesTitle}
          subtitle={t.servicesSubtitle}
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {activeServices.map(({ description, href, icon: Icon, title }) => (
            <Link
              className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-brand-100 hover:shadow-soft"
              href={href}
              key={title}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {description}
              </p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                Detail
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function DetailsSection({
  lang,
  services: activeServices,
  t,
}: {
  lang: Lang;
  services: (typeof services)[Lang];
  t: (typeof copy)[Lang];
}) {
  const featuredService = activeServices[0];
  const FeaturedIcon = featuredService?.icon;
  const secondaryServices = activeServices.slice(1);

  return (
    <section className="bg-[#f7f5ef] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="text-sm font-semibold text-brand-600">
              Delivery scope
            </p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              {t.highlightTitle}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
              {t.highlightSubtitle}
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                ['01', lang === 'id' ? 'Pilih layanan' : 'Pick service'],
                ['02', lang === 'id' ? 'Susun scope' : 'Shape scope'],
                ['03', lang === 'id' ? 'Build rapi' : 'Build cleanly'],
              ].map(([number, label]) => (
                <div
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  key={number}
                >
                  <p className="text-xs font-semibold text-brand-600">
                    {number}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {featuredService ? (
              <article className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-soft sm:p-8">
                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-500/20" />
                <div className="absolute bottom-0 right-0 h-32 w-64 bg-gradient-to-l from-brand-500/10 to-transparent" />
                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-950">
                        {FeaturedIcon ? (
                          <FeaturedIcon className="h-5 w-5" />
                        ) : null}
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-brand-100">
                          01 / Featured scope
                        </p>
                        <h3 className="mt-1 text-2xl font-semibold tracking-tight">
                          {featuredService.title}
                        </h3>
                      </div>
                    </div>
                    <p className="mt-6 text-base leading-8 text-slate-300">
                      {featuredService.description}
                    </p>
                  </div>
                  <Link
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                    href={featuredService.href}
                  >
                    {lang === 'id'
                      ? ctaLabelId(featuredService.title)
                      : ctaLabelEn(featuredService.title)}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
                  {featuredService.points.map((point) => (
                    <div
                      className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm font-medium text-slate-100"
                      key={point}
                    >
                      <CheckCircle2 className="mb-3 h-4 w-4 text-brand-100" />
                      {point}
                    </div>
                  ))}
                </div>
              </article>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              {secondaryServices.map(
                ({ description, href, icon: Icon, points, title }, index) => (
                  <article
                    className="group rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-soft sm:p-6"
                    key={title}
                  >
                    <div className="flex items-start justify-between gap-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            0{index + 2}
                          </p>
                          <h3 className="mt-1 text-xl font-semibold tracking-tight">
                            {title}
                          </h3>
                        </div>
                      </div>
                      <Link
                        aria-label={
                          lang === 'id' ? ctaLabelId(title) : ctaLabelEn(title)
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition group-hover:border-brand-100 group-hover:bg-brand-50 group-hover:text-brand-700"
                        href={href}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                    <p className="mt-5 text-sm leading-7 text-slate-600">
                      {description}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {points.map((point) => (
                        <span
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
                          key={point}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                          {point}
                        </span>
                      ))}
                    </div>
                  </article>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductSection({ lang, t }: { lang: Lang; t: (typeof copy)[Lang] }) {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8" id="product">
      <div className="mx-auto grid max-w-7xl gap-8 rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-soft sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
        <div>
          <p className="text-sm font-semibold text-brand-100">SaaS Product</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {t.productTitle}
          </h2>
        </div>
        <div>
          <p className="text-base leading-8 text-slate-300">
            {t.productSubtitle}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950"
              href="/pricing"
            >
              {lang === 'id' ? 'Lihat Produk' : 'View Product'}
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              href="/register"
            >
              {lang === 'id' ? 'Coba Audit Kode' : 'Try Code Audit'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkSection({ lang, t }: { lang: Lang; t: (typeof copy)[Lang] }) {
  return (
    <section className="bg-white px-4 pb-16 sm:px-6 lg:px-8" id="work">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow="Selected work" title={t.workTitle} />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {workItems[lang].map(([title, description]) => (
            <article
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={title}
            >
              <Layers3 className="h-5 w-5 text-brand-600" />
              <h3 className="mt-5 text-lg font-semibold tracking-tight">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhySection({ lang, t }: { lang: Lang; t: (typeof copy)[Lang] }) {
  return (
    <section className="bg-[#f7f5ef] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <SectionHeader
          eyebrow="Why Kodeye"
          title={t.whyTitle}
          subtitle={t.whySubtitle}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {trustPoints[lang].map(([title, description]) => (
            <article
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={title}
            >
              <CheckCircle2 className="h-5 w-5 text-brand-600" />
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection({ lang, t }: { lang: Lang; t: (typeof copy)[Lang] }) {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8" id="process">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Process"
          title={t.processTitle}
          subtitle={t.processSubtitle}
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-4">
          {process[lang].map(([number, title, description]) => (
            <article
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={number}
            >
              <p className="text-sm font-semibold text-brand-600">{number}</p>
              <h3 className="mt-5 text-xl font-semibold tracking-tight">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustSection({ lang, t }: { lang: Lang; t: (typeof copy)[Lang] }) {
  const items =
    lang === 'id'
      ? [
          [
            'Feedback client',
            'Testimoni asli dari client akan ditampilkan di sini setelah project selesai dan mendapat approval.',
            'Client / Founder',
            'Automation & Web',
            'CF',
          ],
          [
            'Project owner',
            'Ruang ini disiapkan untuk cerita singkat tentang hasil kerja, proses komunikasi, dan impact project.',
            'Business Owner',
            'Dashboard & Infra',
            'PO',
          ],
          [
            'Technical team',
            'Feedback teknis bisa menyorot kualitas kode, deployment, maintainability, dan production readiness.',
            'Engineering Lead',
            'Code Audit',
            'TL',
          ],
        ]
      : [
          [
            'Client feedback',
            'Real client testimonials will be shown here after the project is complete and feedback is approved.',
            'Client / Founder',
            'Automation & Web',
            'CF',
          ],
          [
            'Project owner',
            'This space is prepared for a short story about delivery, communication, and project impact.',
            'Business Owner',
            'Dashboard & Infra',
            'PO',
          ],
          [
            'Technical team',
            'Technical feedback can highlight code quality, deployment, maintainability, and production readiness.',
            'Engineering Lead',
            'Code Audit',
            'TL',
          ],
        ];

  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8" id="trust">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[#f7f5ef] p-4 shadow-soft sm:p-6 lg:p-8">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white to-transparent" />
          <div className="relative grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
            <div className="flex flex-col justify-between rounded-3xl bg-slate-950 p-7 text-white sm:p-8">
              <div>
                <p className="text-sm font-semibold text-brand-100">Trust</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
                  {t.trustTitle}
                </h2>
                <p className="mt-5 text-base leading-8 text-slate-300">
                  {t.trustSubtitle}
                </p>
              </div>
              <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {[
                  ['5', lang === 'id' ? 'service line' : 'service lines'],
                  ['3', lang === 'id' ? 'tipe feedback' : 'feedback types'],
                  ['1', lang === 'id' ? 'delivery flow' : 'delivery flow'],
                ].map(([value, label]) => (
                  <div
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                    key={label}
                  >
                    <p className="text-2xl font-semibold">{value}</p>
                    <p className="mt-1 text-xs text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-rows-[1fr_auto]">
              <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-50" />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                      {items[0]?.[4]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {items[0]?.[0]}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {items[0]?.[2]} / {items[0]?.[3]}
                      </p>
                    </div>
                  </div>
                  <Quote className="h-10 w-10 text-slate-200" />
                </div>
                <div className="relative mt-8 flex gap-1">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star
                      className="h-4 w-4 fill-brand-500 text-brand-500"
                      key={starIndex}
                    />
                  ))}
                </div>
                <p className="relative mt-6 max-w-3xl text-2xl font-medium leading-10 tracking-tight text-slate-900">
                  {items[0]?.[1]}
                </p>
              </article>

              <div className="grid gap-4 md:grid-cols-2">
                {items
                  .slice(1)
                  .map(([title, description, role, project, initials]) => (
                    <article
                      className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                      key={title}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
                          {initials}
                        </div>
                        <Quote className="h-8 w-8 text-slate-200" />
                      </div>
                      <p className="mt-6 text-base font-medium leading-7 text-slate-800">
                        {description}
                      </p>
                      <div className="mt-6 border-t border-slate-100 pt-4">
                        <h3 className="text-sm font-semibold text-slate-950">
                          {title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {role} / {project}
                        </p>
                      </div>
                    </article>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlogSection({
  posts,
  t,
}: {
  posts: LandingBlogPost[];
  t: (typeof copy)[Lang];
}) {
  const fallback = ['AI Automation', 'Web Development', 'Code Audit'];
  const [previewPosts, setPreviewPosts] = useState(posts);

  useEffect(() => {
    setPreviewPosts(posts);
  }, [posts]);

  useEffect(() => {
    if (posts.length > 0) return;

    let active = true;

    void blogApi
      .listPublished()
      .then((nextPosts) => {
        if (!active) return;
        setPreviewPosts(nextPosts.slice(0, 3).map(toLandingBlogPost));
      })
      .catch(() => {
        if (!active) return;
        setPreviewPosts([]);
      });

    return () => {
      active = false;
    };
  }, [posts.length]);

  return (
    <section className="bg-[#f7f5ef] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow="Blog" title={t.blogTitle} />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {previewPosts.length > 0
            ? previewPosts.slice(0, 3).map((post) => (
                <article
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
                  key={post.id}
                >
                  <div className="mb-6 h-1.5 w-16 rounded-full bg-brand-500" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                    Insight
                  </p>
                  <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-tight">
                    {post.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                    {post.excerpt}
                  </p>
                  <p className="mt-4 text-xs font-medium text-slate-400">
                    {post.displayDate}
                  </p>
                  <Link
                    className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-700"
                    href={`/blog/${post.slug}`}
                  >
                    {t.readArticle}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </Link>
                </article>
              ))
            : fallback.map((item) => (
                <article
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
                  key={item}
                >
                  <div className="mb-6 h-1.5 w-16 rounded-full bg-brand-500" />
                  <p className="text-2xl font-semibold tracking-tight">
                    {item}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    Artikel akan tampil setelah publish.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-slate-400">
                    Draft slot
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </article>
              ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta({
  lang,
  t,
  whatsappHref,
}: {
  lang: Lang;
  t: (typeof copy)[Lang];
  whatsappHref: string;
}) {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-soft sm:p-8 lg:p-10">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute -bottom-28 right-0 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_0.62fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-brand-100">
                <Sparkles className="h-4 w-4" />
                {lang === 'id' ? 'Siap diskusi' : 'Ready to discuss'}
              </div>
              <h2 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                {t.finalTitle}
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                {t.finalSubtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {[
                  'AI Automation',
                  'Web Development',
                  'DevOps',
                  'Infrastructure',
                  'Code Audit',
                ].map((item) => (
                  <span
                    className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-slate-300"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur sm:p-6">
              <div className="rounded-2xl bg-white p-5 text-slate-950 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      {lang === 'id' ? 'Langkah berikutnya' : 'Next step'}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                      {lang === 'id'
                        ? 'Mulai dari brief singkat'
                        : 'Start with a short brief'}
                    </h3>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-6 grid gap-3 text-sm text-slate-600">
                  {[
                    lang === 'id' ? 'Scope kebutuhan' : 'Project scope',
                    lang === 'id'
                      ? 'Kondisi sistem sekarang'
                      : 'Current system condition',
                    lang === 'id'
                      ? 'Target output / timeline'
                      : 'Target output / timeline',
                  ].map((item) => (
                    <div className="flex items-center gap-3" key={item}>
                      <CheckCircle2 className="h-4 w-4 text-brand-600" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <a
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    href={whatsappHref}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat WhatsApp
                  </a>
                  <Link
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-300 hover:bg-slate-50"
                    href="/contact-sales"
                  >
                    {t.brief}
                  </Link>
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-slate-400">
                {lang === 'id'
                  ? 'Tanpa hard pitch. Kita petakan jalur teknis paling rapi dulu.'
                  : 'No hard pitch. Just map the cleanest technical path first.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  subtitle,
  title,
}: {
  eyebrow: string;
  subtitle?: string;
  title: string;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
      <div>
        <p className="text-sm font-semibold text-brand-600">{eyebrow}</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h2>
      </div>
      {subtitle ? (
        <p className="max-w-3xl text-base leading-8 text-slate-600 lg:justify-self-end">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_auto]">
        <div>
          <Link
            className="flex items-center gap-2 text-lg font-semibold"
            href="/"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand-700">
              <ShieldCheck className="h-5 w-5" />
            </span>
            Kodeye
          </Link>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
            {lang === 'id'
              ? 'Kodeye membantu bisnis membangun sistem digital modern melalui AI automation, web development, DevOps, infrastructure, code audit, dan produk SaaS.'
              : 'Kodeye helps businesses build modern digital systems through AI automation, web development, DevOps, infrastructure, code audit, and SaaS products.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-300">
          <Link className="hover:text-white" href="#services">
            Services
          </Link>
          <Link className="hover:text-white" href="#work">
            Work
          </Link>
          <Link className="hover:text-white" href="/blog">
            Blog
          </Link>
          <Link className="hover:text-white" href="/login">
            Login
          </Link>
          <Link className="hover:text-white" href="/register">
            Register
          </Link>
        </div>
      </div>
      <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>(c) 2026 Kodeye. kodeye.net</p>
        <a
          className="inline-flex items-center gap-1 hover:text-white"
          href="https://www.instagram.com/kodeyelabs/"
          rel="noreferrer"
          target="_blank"
        >
          <Instagram className="h-4 w-4" />
          @kodeyelabs
        </a>
      </div>
    </footer>
  );
}

function ctaLabelId(title: string) {
  if (title === 'AI Automation') return 'Diskusikan Automation';
  if (title === 'Web Development') return 'Bangun Web / Sistem';
  if (title === 'DevOps') return 'Setup DevOps';
  if (title === 'Infrastructure') return 'Setup Infra';
  return 'Audit Project';
}

function ctaLabelEn(title: string) {
  if (title === 'AI Automation') return 'Discuss Automation';
  if (title === 'Web Development') return 'Build Web / System';
  if (title === 'DevOps') return 'Set Up DevOps';
  if (title === 'Infrastructure') return 'Set Up Infra';
  return 'Audit Project';
}
