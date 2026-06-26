'use client';

import { ArrowRight, Instagram, MessageCircle, Send, Zap } from 'lucide-react';
import Link from 'next/link';

import { trackMetaEvent } from '../../lib/meta-events';

type Lang = 'id' | 'en';

/* ── CTA Section ─────────────────────────────────────────────── */
interface CtaSectionProps {
  lang: Lang;
  whatsappHref: string;
}

export function CtaSection({ lang, whatsappHref }: CtaSectionProps) {
  return (
    <section className="relative overflow-hidden bg-[#111111] px-4 py-24 sm:px-6 lg:px-8">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-px w-full max-w-xl -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/5 blur-[120px]" />
        <div className="absolute right-0 bottom-0 h-[300px] w-[300px] rounded-full bg-secondary-500/5 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-5xl text-center">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-400">
          {lang === 'id' ? 'Yuk Mulai' : "Let's Start"}
        </p>
        <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          {lang === 'id' ? "Let's Build Something" : "Let's Build Something"}
        </h2>
        <h2 className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl gradient-text">
          {lang === 'id' ? 'Amazing' : 'Amazing'}
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#B0B0B0] sm:text-lg">
          {lang === 'id'
            ? 'Ceritakan kebutuhan bisnis kamu. Kami bantu rancang solusi yang paling tepat — website, AI automation, atau keduanya.'
            : 'Tell us about your business needs. We will help design the best solution — website, AI automation, or both.'}
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href={whatsappHref}
            onClick={() =>
              trackMetaEvent('Contact', {
                customData: { contact_channel: 'whatsapp', content_name: 'Homepage final CTA' },
              })
            }
            className="inline-flex min-h-12 items-center gap-2 rounded-xl btn-primary px-8 py-3 text-sm font-semibold text-white"
          >
            <MessageCircle className="h-4 w-4" />
            {lang === 'id' ? 'Chat WhatsApp Sekarang' : 'Chat on WhatsApp'}
          </a>
          <Link
            href="/contact-sales"
            className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-8 py-3 text-sm font-semibold text-white hover:border-brand-500/40 hover:bg-brand-500/10 transition-all"
          >
            <Send className="h-4 w-4" />
            {lang === 'id' ? 'Kirim Brief' : 'Send Brief'}
          </Link>
        </div>

        <p className="mt-5 text-xs text-[#B0B0B0]">
          {lang === 'id'
            ? 'Konsultasi awal gratis. Tanpa commitment.'
            : 'Free initial consultation. No commitment.'}
        </p>
      </div>
    </section>
  );
}

/* ── Footer ──────────────────────────────────────────────────── */
interface FooterProps {
  lang: Lang;
}

export function Footer({ lang }: FooterProps) {
  const services =
    lang === 'id'
      ? [
          { label: 'Website Development', href: '/services/website-development' },
          { label: 'AI Automation', href: '/services/ai-automation' },
          { label: 'Landing Page', href: '/services/website-development' },
          { label: 'Web App Custom', href: '/services/website-development' },
        ]
      : [
          { label: 'Website Development', href: '/services/website-development' },
          { label: 'AI Automation', href: '/services/ai-automation' },
          { label: 'Landing Page', href: '/services/website-development' },
          { label: 'Custom Web App', href: '/services/website-development' },
        ];

  const company =
    lang === 'id'
      ? [
          { label: 'About Us', href: '#' },
          { label: 'Portfolio', href: '#projects' },
          { label: 'Blog', href: '/blog' },
          { label: 'Privacy Policy', href: '#' },
        ]
      : [
          { label: 'About Us', href: '#' },
          { label: 'Portfolio', href: '#projects' },
          { label: 'Blog', href: '/blog' },
          { label: 'Privacy Policy', href: '#' },
        ];

  return (
    <footer className="border-t border-white/[0.06] bg-[#0A0A0A] px-4 pt-16 pb-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link className="inline-flex items-center gap-2.5 mb-5" href="/">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700">
                <Zap className="h-5 w-5 text-white" fill="white" />
              </div>
              <span className="text-lg font-bold text-white">Kodeye</span>
            </Link>
            <p className="text-sm leading-7 text-[#B0B0B0] max-w-sm">
              {lang === 'id'
                ? 'Kodeye membantu bisnis membangun website profesional dan sistem AI automation yang cepat, rapi, dan siap scale.'
                : 'Kodeye helps businesses build professional websites and AI automation systems that are fast, clean, and ready to scale.'}
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://www.instagram.com/kodeyelabs/"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#B0B0B0] hover:text-white hover:border-brand-500/40 transition-all"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="mailto:kodeye@gmail.com"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#B0B0B0] hover:text-white hover:border-brand-500/40 transition-all"
              >
                <Send className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-white">Services</h3>
            <ul className="space-y-3">
              {services.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 text-sm text-[#B0B0B0] hover:text-white transition-colors group"
                  >
                    <ArrowRight className="h-3.5 w-3.5 text-brand-500/0 group-hover:text-brand-400 transition-all -translate-x-2 group-hover:translate-x-0" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-white">Company</h3>
            <ul className="space-y-3">
              {company.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 text-sm text-[#B0B0B0] hover:text-white transition-colors group"
                  >
                    <ArrowRight className="h-3.5 w-3.5 text-brand-500/0 group-hover:text-brand-400 transition-all -translate-x-2 group-hover:translate-x-0" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col gap-3 border-t border-white/[0.06] pt-6 text-xs text-[#B0B0B0] sm:flex-row sm:items-center sm:justify-between">
          <p>Privacy Policy &nbsp;·&nbsp; Disclaimer</p>
          <p>Copyright © Kodeye All Rights Reserved 2025</p>
        </div>
      </div>
    </footer>
  );
}
