import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: '/pricing',
  },
  description:
    'Compare Kodeye plans for AI code audit, secure code review, scanner reports, and GitHub-connected security workflows.',
  openGraph: {
    description:
      'Compare Kodeye plans for AI code audit, secure code review, scanner reports, and GitHub-connected security workflows.',
    title: 'Pricing | Kodeye',
    url: '/pricing',
  },
  title: 'Pricing',
};

export default function PricingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
