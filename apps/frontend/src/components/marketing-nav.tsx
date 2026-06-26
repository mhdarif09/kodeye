'use client';

import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type MarketingLang = 'id' | 'en';

interface MarketingNavProps {
  lang?: MarketingLang;
  onLangChange?: (lang: MarketingLang) => void;
  whatsappHref?: string;
}

export function MarketingNav({ whatsappHref = '#' }: MarketingNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: '/', active: isHome },
    { label: 'Services', href: '/services', active: Boolean(pathname?.startsWith('/services')) },
    { label: 'Portfolio', href: '/portfolio', active: Boolean(pathname?.startsWith('/portfolio')) },
    { label: 'About', href: '/about', active: Boolean(pathname?.startsWith('/about')) },
    { label: 'Blog', href: isHome ? '#blog' : '/blog', active: Boolean(pathname?.startsWith('/blog')) },
    { label: 'Contact', href: isHome ? '#contact' : '/#contact', active: false },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/[0.06]' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/kodeye-logo.png"
            alt="Kodeye Logo"
            width={38}
            height={38}
            className="object-contain"
          />
          <span className="text-2xl font-bold tracking-tight text-white">Kodeye</span>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`text-sm tracking-wide transition-colors ${
                item.active
                  ? 'text-primary font-semibold border-b-2 border-primary pb-1.5'
                  : 'text-text-secondary hover:text-white font-medium'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Button */}
        <div className="hidden md:flex items-center">
          <a
            href={whatsappHref}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-secondary hover:text-black"
          >
            Get in Touch
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-text-secondary hover:text-white p-2"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#111111] px-6 py-6 space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`block text-base ${
                item.active ? 'text-primary font-bold' : 'text-text-secondary font-medium'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2">
            <a
              href={whatsappHref}
              onClick={() => setMobileOpen(false)}
              className="block text-center rounded-full bg-primary py-3 text-sm font-semibold text-white"
            >
              Get in Touch
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
