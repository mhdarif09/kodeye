'use client';

import { ArrowRight, Instagram, Mail, MessageCircle, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface Props {
  whatsappHref: string;
}

export function TestimonialsCtaFooter({ whatsappHref }: Props) {
  const [waText, setWaText] = useState('');

  const handleWaRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    const text = waText.trim() || 'Halo Kodeye, saya ingin konsultasi mengenai pembuatan website atau AI automation.';
    const encoded = encodeURIComponent(text);
    const baseUrl = whatsappHref.split('?')[0] || 'https://wa.me/6281234567890';
    window.open(`${baseUrl}?text=${encoded}`, '_blank');
  };

  const testimonials = [
    {
      name: 'Daniel Carter',
      time: '2 days ago',
      rating: 5,
      text: 'Kodeye merombak landing page kami dalam waktu singkat. Hasilnya sangat memukau secara visual dan konversi prospek meningkat tajam sejak hari pertama live!',
      role: 'Founder & CEO',
    },
    {
      name: 'Maya Patel',
      time: '1 week ago',
      rating: 5,
      text: 'Sistem AI automation WhatsApp dari Kodeye benar-benar menyelamatkan waktu tim admin kami. Response rate customer naik 300%. Sangat direkomendasikan!',
      role: 'Operations Director',
    },
  ];

  return (
    <div className="bg-background">
      {/* ── Testimonials Section ────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-8">
            Experiences That Inspir<span className="text-primary">e</span>
          </h2>

          {/* Overlapping circular avatars row matching Stygar */}
          <div className="flex justify-center items-center -space-x-3 mb-12">
            {['AP', 'RM', 'DS', 'SK', 'DC', 'MP'].map((initials, i) => (
              <div
                key={i}
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-background bg-surface text-xs font-bold text-white shadow-md"
              >
                {initials}
              </div>
            ))}
          </div>

          {/* 2 Testimonial cards matching Stygar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {testimonials.map((item, index) => (
              <article
                key={index}
                className="rounded-3xl bg-card border border-white/[0.08] p-8 relative overflow-hidden transition hover:border-primary/50"
              >
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {item.name}{' '}
                      <span className="text-xs font-normal text-text-secondary">· {item.time}</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: item.rating }).map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                    <span className="text-xs font-bold text-white ml-1.5">5.0</span>
                  </div>
                </div>

                <p className="text-sm leading-7 text-text-secondary font-normal">&ldquo;{item.text}&rdquo;</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom Dramatic CTA Section matching Stygar ─────── */}
      <section id="contact" className="py-20 px-6 lg:px-12 relative z-20">
        <div className="mx-auto max-w-6xl rounded-[3rem] bg-[#111111] border border-white/10 p-8 sm:p-14 relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
                Let&apos;s Build<br />
                Something<br />
                <span className="text-primary">Amazing</span>
              </h2>

              <p className="text-sm sm:text-base leading-7 text-text-secondary max-w-lg">
                Siap mewujudkan ide digitalmu? Diskusikan kebutuhan pembuatan website atau AI automation bersama tim teknis Kodeye sekarang juga.
              </p>

              {/* WhatsApp Redirect Form */}
              <form onSubmit={handleWaRedirect} className="pt-4 max-w-md">
                <div className="flex items-center rounded-full bg-card border border-white/10 p-1.5 focus-within:border-primary transition">
                  <input
                    type="text"
                    placeholder="Tulis ide atau kebutuhan proyekmu..."
                    value={waText}
                    onChange={(e) => setWaText(e.target.value)}
                    className="bg-transparent px-5 py-3 text-sm text-white placeholder:text-text-secondary focus:outline-none flex-1 w-full"
                  />
                  <button
                    type="submit"
                    className="flex h-11 px-5 items-center justify-center gap-2 rounded-full bg-primary text-white font-semibold shadow-glow hover:bg-secondary hover:text-black transition shrink-0"
                    aria-label="Chat WhatsApp"
                  >
                    <span className="text-xs font-mono hidden sm:inline">Chat WA</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Right 3D Girl Popping out matching Stygar */}
            <div className="lg:col-span-5 flex justify-center relative">
              <div className="w-full max-w-[320px] lg:max-w-[380px] -mb-14 sm:-mb-20">
                <Image
                  src="/hero-girl.jpg"
                  alt="Kodeye AI Character CTA"
                  width={400}
                  height={500}
                  className="w-full h-auto object-contain drop-shadow-[0_0_35px_rgba(111,60,255,0.45)] rounded-3xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer matching Stygar image 3 ──────────────────── */}
      <footer className="bg-background pt-16 pb-12 px-6 lg:px-12 border-t border-dashed border-white/15">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16">
            {/* Brand Left */}
            <div className="md:col-span-5 space-y-6">
              <Link href="/" className="flex items-center gap-3">
                <Image src="/kodeye-logo.png" alt="Logo" width={34} height={34} />
                <span className="text-xl font-bold text-white">Kodeye</span>
              </Link>

              <p className="text-xs leading-6 text-text-secondary max-w-sm">
                Kodeye adalah partner teknologi terpercaya yang berfokus pada pembuatan Website profesional berkonversi tinggi dan automasi sistem berbasis AI.
              </p>

              <div className="space-y-2 text-xs text-text-secondary">
                <p>· kodeye@gmail.com</p>
                <p>· +62 812-3456-7890</p>
                <p>· Jakarta, Indonesia</p>
              </div>

              {/* Social Buttons matching Stygar pill icons */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={whatsappHref}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-white/10 text-white hover:border-primary hover:bg-primary transition"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
                <a
                  href="https://www.instagram.com/kodeyelabs/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-white/10 text-white hover:border-primary hover:bg-primary transition"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="mailto:kodeye@gmail.com"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-white/10 text-white hover:border-primary hover:bg-primary transition"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Services Middle */}
            <div className="md:col-span-4 space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-white border-b border-dashed border-white/10 pb-3 inline-block">
                Services :::
              </h4>
              <ul className="space-y-3 text-xs text-text-secondary">
                <li><Link href="#services" className="hover:text-primary transition">Website Development</Link></li>
                <li><Link href="#services" className="hover:text-primary transition">AI Automation Workflow</Link></li>
                <li><Link href="#services" className="hover:text-primary transition">Landing Page Custom</Link></li>
                <li><Link href="#services" className="hover:text-primary transition">WhatsApp AI Chatbot</Link></li>
                <li><Link href="#services" className="hover:text-primary transition">Web Application Dashboard</Link></li>
              </ul>
            </div>

            {/* Company Right */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-white border-b border-dashed border-white/10 pb-3 inline-block">
                Company :::
              </h4>
              <ul className="space-y-3 text-xs text-text-secondary">
                <li><Link href="/#achievements" className="hover:text-primary transition">About Us</Link></li>
                <li><Link href="/#projects" className="hover:text-primary transition">Portfolio</Link></li>
                <li><Link href="/blog" className="hover:text-primary transition">Blog & Articles</Link></li>
                <li><Link href="#" className="hover:text-primary transition">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary transition">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="border-t border-dashed border-white/15 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-text-secondary gap-4">
            <p>Privacy Policy · Disclaimer</p>
            <p>Copyright © Kodeye All Rights Reserved 2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
