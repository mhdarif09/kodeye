'use client';

import { ChevronDown, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { services } from '../app/services/service-data';

const navItems = [
  { href: '/#product', label: 'Product' },
  { href: '/#reviews', label: 'AI Reviews' },
  { href: '/#services', label: 'Services' },
  { href: '/#customers', label: 'Customers' },
  { href: '/#pricing', label: 'Pricing' },
];

export function MarketingNav() {
  const pathname = usePathname();
  const isServicesActive = pathname.startsWith('/services');

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
              Services <ChevronDown className="h-4 w-4" />
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
        <div className="flex items-center gap-2">
          <Link
            className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white sm:inline-flex"
            href="/contact-sales"
          >
            Contact sales
          </Link>
          <Link
            className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            href="/register"
          >
            Try Kodeye
          </Link>
        </div>
      </div>
    </nav>
  );
}
