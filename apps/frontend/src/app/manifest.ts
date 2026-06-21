import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: '#f7f5ef',
    description:
      'AI secure code review, scanner audit, AI fix proposals, and engineering automation.',
    display: 'standalone',
    icons: [],
    name: 'Kodeye',
    short_name: 'Kodeye',
    start_url: '/',
    theme_color: '#4f46e5',
  };
}
