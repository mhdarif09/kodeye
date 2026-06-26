import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: '#f7f5ef',
    description:
      'AI automation, web development, DevOps, infrastructure, and code audit by Kodeye.',
    display: 'standalone',
    icons: [],
    name: 'Kodeye',
    short_name: 'Kodeye',
    start_url: '/',
    theme_color: '#4f46e5',
  };
}
