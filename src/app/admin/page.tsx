import type { Metadata } from 'next';

import { AdminGate } from '@/components/admin/AdminGate';
import { LeadList } from '@/components/admin/LeadList';

export const metadata: Metadata = {
  title: 'Demandes reçues — administration ECO2BAT',
  robots: { index: false, follow: false },
};

export default function LeadsPage() {
  return (
    <AdminGate title="Demandes reçues">
      <LeadList />
    </AdminGate>
  );
}
