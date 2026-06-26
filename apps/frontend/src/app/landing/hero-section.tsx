'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface HeroSectionProps {
  whatsappHref: string;
}

export function GridDots({ className = 'text-primary' }: { className?: string }) {
  return (
    <span className={`inline-grid grid-cols-3 gap-1 align-middle mx-2 ${className}`}>
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} className="h-1.5 w-1.5 rounded-full bg-current" />
      ))}
    </span>
  );
}

export function HeroSection({ whatsappHref }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-background pt-32 pb-16 lg:pt-40 lg:pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Content */}
          <div className="lg:col-span-7 z-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Turning{' '}
              <span className="relative inline-block px-3 py-1 text-primary">
                {/* Corner brackets simulating Stygar box */}
                <span className="absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2 border-primary" />
                <span className="absolute top-0 right-0 h-3 w-3 border-t-2 border-r-2 border-primary" />
                <span className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-primary" />
                <span className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-primary" />
                Ideas
              </span>{' '}
              Into
              <br />
              Digital Reality
            </h1>

            <p className="mt-6 max-w-xl text-base sm:text-lg leading-8 text-text-secondary">
              Kami spesialis membangun website berkonversi tinggi dan sistem AI automation terintegrasi untuk mempercepat pertumbuhan bisnis digitalmu.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <a
                href={whatsappHref}
                className="rounded-full bg-primary px-8 py-4 text-base font-semibold text-white shadow-glow transition hover:bg-secondary hover:text-black"
              >
                Start a Project
              </a>
              <Link
                href="#projects"
                className="inline-flex items-center gap-2 text-base font-semibold text-white transition hover:text-primary group"
              >
                See Our Work
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right Avatar & Watermark */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            {/* Watermark text behind avatar */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
              <span className="text-[7rem] sm:text-[10rem] font-black text-[#151515] tracking-widest">
                KODEYE
              </span>
            </div>

            {/* 3D Girl Avatar */}
            <div className="relative z-10 w-full max-w-[420px]">
              <Image
                src="/hero-girl.jpg"
                alt="Kodeye AI Character"
                width={450}
                height={550}
                priority
                className="w-full h-auto object-contain drop-shadow-[0_10px_35px_rgba(111,60,255,0.35)] rounded-3xl"
              />
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-20 border-t border-b border-white/10 py-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <GridDots className="hidden lg:inline-grid text-primary" />

            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl font-bold text-white">150+</span>
              <span className="text-xs text-text-secondary uppercase tracking-wider font-medium leading-tight">
                Project<br />Completed
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl font-bold text-white">98%</span>
              <span className="text-xs text-text-secondary uppercase tracking-wider font-medium leading-tight">
                Client<br />Satisfaction
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl font-bold text-white">5+</span>
              <span className="text-xs text-text-secondary uppercase tracking-wider font-medium leading-tight">
                Years of<br />Experience
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl font-bold text-white">24/7</span>
              <span className="text-xs text-text-secondary uppercase tracking-wider font-medium leading-tight">
                Support<br />Available
              </span>
            </div>

            <GridDots className="hidden lg:inline-grid text-primary" />
          </div>
        </div>
      </div>
    </section>
  );
}
