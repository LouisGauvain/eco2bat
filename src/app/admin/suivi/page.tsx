import type { Metadata } from 'next';

import { AdminGate } from '@/components/admin/AdminGate';
import { TrackingForm } from '@/components/admin/TrackingForm';

export const metadata: Metadata = {
  title: 'Suivi — administration ECO2BAT',
  robots: { index: false, follow: false },
};

export default function TrackingPage() {
  return (
    <AdminGate title="Suivi et mesure d’audience">
      <p className="max-w-2xl text-sm leading-relaxed text-ink-600">
        Renseignez les identifiants de vos outils : le site les charge lui-même, dans le respect du
        consentement cookies. Les changements sont appliqués à la prochaine publication.
      </p>
      <div className="mt-6">
        <TrackingForm />
      </div>
    </AdminGate>
  );
}
