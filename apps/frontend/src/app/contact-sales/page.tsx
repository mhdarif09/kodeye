import { Suspense } from 'react';

import { GlobalLoadingScreen } from '../../components/layout/global-loading-screen';
import { ContactSalesForm } from './contact-sales-form';

export default function ContactSalesPage() {
  return (
    <Suspense
      fallback={<GlobalLoadingScreen message="Loading contact form..." />}
    >
      <ContactSalesForm />
    </Suspense>
  );
}
