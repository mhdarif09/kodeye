import { Suspense } from 'react';
import type { Metadata } from 'next';

import { GlobalLoadingScreen } from '../../components/layout/global-loading-screen';
import { ContactSalesForm } from './contact-sales-form';

export const metadata: Metadata = {
  alternates: {
    canonical: '/contact-sales',
  },
  description:
    'Contact Kodeye sales to scope AI code audits, secure code review workflows, engineering automation, DevOps, or website development.',
  openGraph: {
    description:
      'Contact Kodeye sales to scope AI code audits, secure code review workflows, engineering automation, DevOps, or website development.',
    title: 'Contact Sales | Kodeye',
    url: '/contact-sales',
  },
  title: 'Contact Sales',
};

export default function ContactSalesPage() {
  return (
    <Suspense
      fallback={<GlobalLoadingScreen message="Loading contact form..." />}
    >
      <ContactSalesForm />
    </Suspense>
  );
}
