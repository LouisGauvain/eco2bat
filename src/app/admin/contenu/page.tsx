import type { Metadata } from 'next';

import { AdminGate } from '@/components/admin/AdminGate';
import { ContentManager } from '@/components/admin/ContentManager';

export const metadata: Metadata = {
  title: 'Contenu des pages — administration ECO2BAT',
  robots: { index: false, follow: false },
};

export default function ContentPage() {
  return (
    <AdminGate title="Contenu des pages">
      <p className="max-w-2xl text-sm leading-relaxed text-ink-600">
        Créez, modifiez et organisez les pages du site. Ce que vous enregistrez
        est visible dans l’aperçu ; le site en ligne est mis à jour quand vous
        cliquez sur « Publier », en haut à droite (deux à trois minutes).
      </p>
      <div className="mt-6">
        <ContentManager />
      </div>
    </AdminGate>
  );
}
