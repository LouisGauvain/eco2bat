'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import { hasAdminHint } from '@/lib/public-store';

/**
 * Les outils d'édition embarquent Firebase Auth, le SDK Firestore complet et
 * l'éditeur de pages : plusieurs centaines de Ko de JavaScript qu'aucun
 * visiteur n'utilise. Ils ne sont téléchargés que sur un navigateur où le
 * gérant s'est déjà connecté au back-office — le reste du public reçoit une
 * page légère, ce qui compte pour les Core Web Vitals et donc le classement.
 */
const EditOverlay = dynamic(
  () => import('./EditOverlay').then((module) => module.EditOverlay),
  { ssr: false },
);

export function EditOverlayLoader() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => setEnabled(hasAdminHint()), []);

  return enabled ? <EditOverlay /> : null;
}
