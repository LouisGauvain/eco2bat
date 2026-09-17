import type { Metadata } from 'next';
import { Suspense } from 'react';

import { PagePreview } from '@/components/admin/PagePreview';

export const metadata: Metadata = {
  title: 'Aperçu — administration ECO2BAT',
  robots: { index: false, follow: false },
};

export default function PreviewPage() {
  // `useSearchParams` impose une frontière Suspense dans un export statique.
  return (
    <Suspense>
      <PagePreview />
    </Suspense>
  );
}
