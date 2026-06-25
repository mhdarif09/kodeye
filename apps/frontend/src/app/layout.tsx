import type { Metadata } from 'next';
import Script from 'next/script';
import { Suspense } from 'react';

import '../styles/globals.css';
import { MetaRouteEvents } from '../components/meta-route-events';
import {
  absoluteUrl,
  defaultSeoDescription,
  siteName,
  siteUrl,
} from '../lib/seo';

const metaPixelId = process.env.META_PIXEL_ID ?? '1775848800523906';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
  applicationName: siteName,
  authors: [{ name: 'Kodeye' }],
  category: 'Technology',
  title: {
    default: 'Kodeye - AI Automation, Web Development, DevOps & Code Audit',
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
    title: 'Kodeye - AI Automation, Web Development, DevOps & Code Audit',
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
    title: 'Kodeye - AI Automation, Web Development, DevOps & Code Audit',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
        <Suspense fallback={null}>
          <MetaRouteEvents />
        </Suspense>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            height="1"
            src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            style={{ display: 'none' }}
            width="1"
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
