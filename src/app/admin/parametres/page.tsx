import type { Metadata } from 'next';

import { AdminGate } from '@/components/admin/AdminGate';
import { SettingsForm } from '@/components/admin/SettingsForm';

export const metadata: Metadata = {
  title: 'Paramètres — administration ECO2BAT',
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return (
    <AdminGate title="Paramètres du site">
      <p className="max-w-2xl text-sm leading-relaxed text-ink-600">
        Ces réglages s’appliquent immédiatement sur le site public. Le texte
        des pages se modifie dans « Contenu », les coordonnées du bureau
        d’études dans « Entreprise ».
      </p>
      <div className="mt-6">
        <SettingsForm />
      </div>
    </AdminGate>
  );
}
