import type { MetadataRoute } from 'next';

import { getPublishedBlogPosts } from '../features/blog/server';
import { services } from './services/service-data';
import { absoluteUrl } from '../lib/seo';

const publicRoutes = ['/', '/services', '/portfolio', '/about', '/blog'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const posts = await getPublishedBlogPosts().catch(() => []);
  return [
    ...publicRoutes.map((route) => ({
      changeFrequency:
        route === '/' ? ('weekly' as const) : ('monthly' as const),
      lastModified: now,
      priority: route === '/' ? 1 : 0.8,
      url: absoluteUrl(route),
    })),
    ...services.map((service) => ({
      changeFrequency: 'monthly' as const,
      lastModified: now,
      priority: 0.75,
      url: absoluteUrl(service.href),
    })),
    ...posts.map((post) => ({
      changeFrequency: 'monthly' as const,
      lastModified: new Date(post.updatedAt),
      priority: 0.7,
      url: absoluteUrl(`/blog/${post.slug}`),
    })),
  ];
}
