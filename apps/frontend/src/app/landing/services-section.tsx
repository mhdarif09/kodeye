'use client';

import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

import { GridDots } from './hero-section';

export function ServicesSection() {
  const items = [
    {
      id: '1',
      category: 'Website Development',
      title: 'High-Converting Landing Page',
      desc: 'Desain website memukau yang dirancang khusus untuk memikat pengunjung dan meningkatkan penjualan.',
      image: '/projects/landing-web.png',
    },
    {
      id: '2',
      category: 'AI Automation',
      title: 'WhatsApp AI Customer Service',
      desc: 'Chatbot cerdas yang merespon prospek 24 jam non-stop dengan bahasa natural layaknya manusia.',
      image: '/projects/chatbot-app.png',
    },
    {
      id: '3',
      category: 'Website Development',
      title: 'Custom Web Application',
      desc: 'Sistem dashboard manajemen internal dan aplikasi berbasis web yang cepat, aman, dan mudah disesuaikan.',
      image: '/projects/web-dashboard.png',
    },
    {
      id: '4',
      category: 'AI Automation',
      title: 'Workflow & Admin Automation',
      desc: 'Otomatisasi input data, rekap laporan harian, dan pengiriman invoice tanpa campur tangan manual.',
      image: '/projects/ai-automation.png',
    },
    {
      id: '5',
      category: 'Website Development',
      title: 'E-Commerce & Funneling',
      desc: 'Toko online lengkap dengan integrasi pembayaran otomatis dan penghitungan ongkos kirim real-time.',
      image: '/projects/landing-web.png',
    },
    {
      id: '6',
      category: 'AI Automation',
      title: 'CRM & API Integration',
      desc: 'Hubungkan seluruh aplikasi operasional bisnis dalam satu alur kerja otomatis yang sinkron dan rapi.',
      image: '/projects/ai-automation.png',
    },
  ];

  return (
    <section id="services" className="bg-background py-20 px-6 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center">
              Featured Services <GridDots className="text-primary ml-3" />
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-text-secondary">
              Layanan unggulan kami di bidang Website Development dan AI Automation untuk mempercepat digitalisasi bisnismu.
            </p>
          </div>

          <div>
            <button className="rounded-full border border-white/20 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:border-primary hover:bg-primary/10 transition">
              Show All
            </button>
          </div>
        </div>

        {/* 3 columns x 2 rows grid matching Stygar Futured Projects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl bg-card border border-white/[0.05] transition-all hover:border-primary/50 hover:-translate-y-1"
            >
              {/* Top Image Thumbnail */}
              <div className="relative h-48 w-full overflow-hidden bg-[#111111] p-3">
                <div className="relative h-full w-full overflow-hidden rounded-2xl">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Bottom Card Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
                    {item.category}
                  </p>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs leading-5 text-text-secondary line-clamp-3">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 flex justify-end">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#111111] text-text-secondary transition-all group-hover:bg-primary group-hover:border-primary group-hover:text-white">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
