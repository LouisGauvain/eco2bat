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
        Le texte modifié ici s’applique tout de suite sur le site public. Il
        n’entre en revanche dans l’index de Google qu’au prochain déploiement :
        pour une correction qui compte pour le référencement (titre, description),
        prévenez votre développeur afin qu’il republie le site.
      </p>
      <div className="mt-6">
        <ContentManager />
      </div>
    </AdminGate>
  );
}
