import type { Metadata } from 'next';

import '../styles/globals.css';
import {
  absoluteUrl,
  defaultSeoDescription,
  siteName,
  siteUrl,
} from '../lib/seo';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
  applicationName: siteName,
  authors: [{ name: 'Kodeye' }],
  category: 'Technology',
  title: {
    default: 'Kodeye - AI Secure Code Review Platform',
    template: '%s | Kodeye',
  },
  creator: 'Kodeye',
  description: defaultSeoDescription,
  keywords: [
    'AI code review',
    'secure code review',
    'code audit',
    'Semgrep',
    'CodeQL',
    'Gitleaks',
    'Trivy',
    'DevSecOps',
    'AI engineering automation',
  ],
  metadataBase: new URL(siteUrl),
  openGraph: {
    description: defaultSeoDescription,
    locale: 'en_US',
    siteName,
    title: 'Kodeye - AI Secure Code Review Platform',
    type: 'website',
    url: absoluteUrl('/'),
  },
  publisher: 'Kodeye',
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    index: true,
  },
  twitter: {
    card: 'summary_large_image',
    description: defaultSeoDescription,
    title: 'Kodeye - AI Secure Code Review Platform',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
