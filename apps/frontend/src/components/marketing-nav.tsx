'use client';

import { ChevronDown, MessageCircle, Send, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { services } from '../app/services/service-data';
import { trackMetaEvent } from '../lib/meta-events';
import { whatsappUrl } from '../lib/whatsapp';

type MarketingLang = 'id' | 'en';

interface MarketingNavProps {
  lang?: MarketingLang;
  onLangChange?: (lang: MarketingLang) => void;
  whatsappHref?: string;
}

export function MarketingNav({
  lang,
  onLangChange,
  whatsappHref = whatsappUrl(),
}: MarketingNavProps) {
  const pathname = usePathname();
  const isServicesActive = pathname.startsWith('/services');
  const navItems = [
    { href: '/#work', label: 'Work' },
    { href: '/#product', label: lang === 'en' ? 'Product' : 'Produk' },
    { href: '/#process', label: lang === 'en' ? 'Process' : 'Proses' },
    { href: '/blog', label: 'Blog' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-[#f7f5ef]/90 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-2 text-lg font-bold" href="/">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          Kodeye
        </Link>
        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <Link
              className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
          <div className="group relative">
            <Link
              className={
                isServicesActive
                  ? 'inline-flex items-center gap-1 text-sm font-semibold text-slate-950 transition'
                  : 'inline-flex items-center gap-1 text-sm font-semibold text-slate-600 transition hover:text-slate-950'
              }
              href="/services"
            >
              {lang === 'en' ? 'Services' : 'Layanan'}{' '}
              <ChevronDown className="h-4 w-4" />
            </Link>
            <div className="invisible absolute left-1/2 top-full z-50 mt-4 w-[28rem] -translate-x-1/2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10">
                <Link
                  className="block rounded-lg px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-50"
                  href="/services"
                >
                  All Services
                </Link>
                <div className="mt-1 grid gap-1">
                  {services.map((service) => (
                    <Link
                      className={
                        pathname === service.href
                          ? 'rounded-lg bg-slate-950 px-4 py-3 text-white transition'
                          : 'rounded-lg px-4 py-3 transition hover:bg-slate-50'
                      }
                      href={service.href}
                      key={service.slug}
                    >
                      <span
                        className={
                          pathname === service.href
                            ? 'block text-sm font-semibold text-white'
                            : 'block text-sm font-semibold text-slate-950'
                        }
                      >
                        {service.title}
                      </span>
                      <span
                        className={
                          pathname === service.href
                            ? 'mt-1 line-clamp-2 block text-xs leading-5 text-slate-300'
                            : 'mt-1 line-clamp-2 block text-xs leading-5 text-slate-500'
                        }
                      >
                        {service.description}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 sm:min-h-11 sm:px-4"
            href="/contact-sales"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">
              {lang === 'en' ? 'Send Brief' : 'Kirim Brief'}
            </span>
            <span className="sm:hidden">
              {lang === 'en' ? 'Brief' : 'Brief'}
            </span>
          </Link>
          {lang && onLangChange ? (
            <label className="sr-only" htmlFor="marketing-language">
              Language
            </label>
          ) : null}
          {lang && onLangChange ? (
            <select
              className="hidden min-h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase text-slate-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:inline-flex sm:min-h-11"
              id="marketing-language"
              onChange={(event) =>
                onLangChange(event.target.value as MarketingLang)
              }
              value={lang}
            >
              <option value="id">ID</option>
              <option value="en">EN</option>
            </select>
          ) : null}
          <a
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-slate-800 sm:min-h-11 sm:px-4"
            href={whatsappHref}
            onClick={() =>
              trackMetaEvent('Contact', {
                customData: {
                  contact_channel: 'whatsapp',
                  content_name: 'Marketing navbar consultation',
                },
              })
            }
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">
              {lang === 'en' ? 'Consult' : 'Konsultasi'}
            </span>
            <span className="sm:hidden">WA</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
