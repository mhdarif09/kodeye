import type { Metadata } from 'next';

import { getPublishedTrustedCompanies } from '../../features/partners/server';
import { getPublishedTeamMembers } from '../../features/team/server';
import { whatsappUrl } from '../../lib/whatsapp';
import AboutPageClient from './about-page-client';

export const metadata: Metadata = {
  alternates: {
    canonical: '/about',
  },
  description:
    'Profil Tentang Kodeye: Visi Misi, Alur Perjalanan (Our Journey), Statistik Pencapaian Klien Puas, serta Tim Anggota Ahli di Bidang AI Automation & Web Development.',
  openGraph: {
    description:
      'Profil Tentang Kodeye: Visi Misi, Alur Perjalanan (Our Journey), Statistik Pencapaian Klien Puas, serta Tim Anggota Ahli di Bidang AI Automation & Web Development.',
    title: 'About Us | Kodeye - Digital & AI Agency',
    url: '/about',
  },
  title: 'About Us',
};

export default async function AboutPage() {
  const [members, partners] = await Promise.all([
    getPublishedTeamMembers(),
    getPublishedTrustedCompanies(),
  ]);
  const whatsappHref = whatsappUrl();

  return <AboutPageClient members={members} partners={partners} whatsappHref={whatsappHref} />;
}
