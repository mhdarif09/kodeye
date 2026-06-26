import type { Metadata } from 'next';

import { getPublishedPortfolioProjects } from '../../features/portfolio/server';
import { whatsappUrl } from '../../lib/whatsapp';
import ServicesPageClient from './services-page-client';

export const metadata: Metadata = {
  alternates: {
    canonical: '/services',
  },
  description:
    'Layanan unggulan Kodeye: Website Development, AI Automation, Custom Web Application, WhatsApp AI Chatbot, CRM & API Integration, serta E-Commerce Funneling.',
  openGraph: {
    description:
      'Layanan unggulan Kodeye: Website Development, AI Automation, Custom Web Application, WhatsApp AI Chatbot, CRM & API Integration, serta E-Commerce Funneling.',
    title: 'Services | Kodeye - Digital & AI Agency',
    url: '/services',
  },
  title: 'Services',
};

export default async function ServicesPage() {
  const projects = await getPublishedPortfolioProjects().catch(() => []);
  const whatsappHref = whatsappUrl();

  return <ServicesPageClient projects={projects} whatsappHref={whatsappHref} />;
}
