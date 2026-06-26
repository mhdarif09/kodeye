import type { Metadata } from 'next';

import { getPublishedBlogPosts } from '../features/blog/server';
import type { BlogPost } from '../features/blog/types';
import { getPublishedTrustedCompanies } from '../features/partners/server';
import { getPublishedPortfolioProjects } from '../features/portfolio/server';
import { absoluteUrl, defaultSeoDescription } from '../lib/seo';
import { whatsappUrl } from '../lib/whatsapp';
import LandingPageClient, { type LandingBlogPost } from './landing-page-client';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
  description:
    'Kodeye membantu bisnis membangun sistem digital modern melalui AI automation, web development, DevOps, infrastructure, dan code audit.',
  keywords: [
    'jasa AI automation Indonesia',
    'jasa web development Indonesia',
    'jasa DevOps Indonesia',
    'jasa setup server',
    'jasa infrastructure cloud',
    'jasa audit code',
    'code audit Indonesia',
    'agency teknologi Indonesia',
    'tech partner untuk bisnis',
    'software agency Indonesia',
  ],
  openGraph: {
    description:
      'Kodeye membantu bisnis membangun sistem digital modern melalui AI automation, web development, DevOps, infrastructure, dan code audit.',
    siteName: 'Kodeye',
    title: 'Kodeye - AI Automation, Web Development, DevOps & Code Audit',
    type: 'website',
    url: '/',
  },
  title: 'Kodeye - AI Automation, Web Development, DevOps & Code Audit',
};

const whatsappHref = whatsappUrl();

function toSerializableDate(value: unknown): string | null {
  if (!value) return null;

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

function toDisplayDate(value: unknown): string {
  const serializableDate = toSerializableDate(value);

  if (!serializableDate) return '';

  const date = new Date(serializableDate);

  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(date);
}

export default async function HomePage() {
  const [rawPosts, projects, partners] = await Promise.all([
    getPublishedBlogPosts(),
    getPublishedPortfolioProjects(),
    getPublishedTrustedCompanies(),
  ]);

  const posts: LandingBlogPost[] = rawPosts
    .slice(0, 3)
    .map((post: BlogPost) => ({
      id: String(post.id ?? post.slug ?? ''),
      title: post.title ?? '',
      slug: post.slug ?? '',
      excerpt: post.excerpt ?? '',
      createdAt: toSerializableDate(post.createdAt),
      displayDate: toDisplayDate(post.publishedAt ?? post.createdAt),
      updatedAt: toSerializableDate(post.updatedAt),
      publishedAt: toSerializableDate(post.publishedAt),
    }));

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    description: defaultSeoDescription,
    name: 'Kodeye',
    sameAs: ['https://www.instagram.com/kodeyelabs/'],
    url: absoluteUrl('/'),
  };

  return (
    <>
      <script
        id="kodeye-organization-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />

      <LandingPageClient partners={partners} posts={posts} projects={projects} whatsappHref={whatsappHref} />
    </>
  );
}
