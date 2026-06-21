import type { MetadataRoute } from 'next';

import { absoluteUrl, siteUrl } from '../lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        allow: ['/', '/services', '/pricing', '/contact-sales'],
        disallow: [
          '/api/',
          '/auth/',
          '/dashboard/',
          '/login',
          '/onboarding',
          '/payments/',
          '/register',
        ],
        userAgent: '*',
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: siteUrl.replace(/\/$/, ''),
  };
}
