'use client';

import Image from 'next/image';

import type { TrustedCompany } from '../../features/partners/types';

interface Props {
  companies?: TrustedCompany[];
}

const defaultPartners = [
  { id: '1', name: 'Telkomsel Indonesia', logoUrl: '/kodeye-logo.png', websiteUrl: 'https://kodeye.id' },
  { id: '2', name: 'Bank BCA Digital', logoUrl: '/kodeye-logo.png', websiteUrl: 'https://kodeye.id' },
  { id: '3', name: 'Tokopedia Tech', logoUrl: '/kodeye-logo.png', websiteUrl: 'https://kodeye.id' },
  { id: '4', name: 'Gojek Engineering', logoUrl: '/kodeye-logo.png', websiteUrl: 'https://kodeye.id' },
  { id: '5', name: 'Pertamina Digital', logoUrl: '/kodeye-logo.png', websiteUrl: 'https://kodeye.id' },
];

export function TrustedPartnersSection({ companies }: Props) {
  const displayList = companies && companies.length > 0 ? companies : defaultPartners;

  return (
    <section className="py-12 px-6 lg:px-12 bg-[#0e0e0e] border-y border-white/[0.05]">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-xs font-mono font-semibold uppercase tracking-widest text-text-secondary mb-8">
          ::: Dipercaya Oleh Perusahaan &amp; Brand Terkemuka :::
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-75">
          {displayList.map((item, index) => (
            <a
              key={item.id || index}
              href={item.websiteUrl || '#'}
              target={item.websiteUrl ? '_blank' : '_self'}
              rel="noreferrer"
              className="flex items-center gap-3 transition duration-300 hover:opacity-100 hover:scale-105 grayscale hover:grayscale-0 group"
            >
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-white/10 p-1">
                <Image src={item.logoUrl || '/kodeye-logo.png'} alt={item.name} fill className="object-contain p-1" />
              </div>
              <span className="text-sm font-bold tracking-wide text-white group-hover:text-primary transition-colors">
                {item.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
