import type { Metadata } from 'next';

import { getPublishedPortfolioProjects } from '../../features/portfolio/server';
import { whatsappUrl } from '../../lib/whatsapp';
import PortfolioPageClient from './portfolio-page-client';

export const metadata: Metadata = {
  alternates: {
    canonical: '/portfolio',
  },
  description:
    'Portofolio karya terbaik Kodeye: Website Development, AI Automation Workflow, Landing Page Custom, WhatsApp AI Chatbot, dan Custom Web Application.',
  openGraph: {
    description:
      'Portofolio karya terbaik Kodeye: Website Development, AI Automation Workflow, Landing Page Custom, WhatsApp AI Chatbot, dan Custom Web Application.',
    title: 'Portfolio | Kodeye - Digital & AI Agency',
    url: '/portfolio',
  },
  title: 'Portfolio',
};

export default async function PortfolioPage() {
  const projects = await getPublishedPortfolioProjects().catch(() => []);
  const whatsappHref = whatsappUrl();

  return <PortfolioPageClient projects={projects} whatsappHref={whatsappHref} />;
}
