import type { Metadata } from 'next';

import { AdminGate } from '@/components/admin/AdminGate';
import { CompanyForm } from '@/components/admin/CompanyForm';

export const metadata: Metadata = {
  title: 'Informations de l’entreprise — administration ECO2BAT',
  robots: { index: false, follow: false },
};

export default function CompanyPage() {
  return (
    <AdminGate title="Informations de l’entreprise">
      <p className="max-w-2xl text-sm leading-relaxed text-ink-600">
        Nom, adresse, téléphone et e-mail sont affichés dans l’en-tête, le pied
        de page et la page Contact. Les moteurs de recherche comparent ces
        informations à celles de votre fiche Google : gardez-les identiques
        partout. Les données structurées lues par Google, elles, sont figées
        dans les pages déployées et suivront au prochain déploiement du site.
      </p>
      <div className="mt-6">
        <CompanyForm />
      </div>
    </AdminGate>
  );
}
