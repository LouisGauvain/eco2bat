'use client';

import { useEffect, useState } from 'react';

import { getSettings } from '@/lib/settings';

/**
 * Bandeau d'information piloté depuis le back-office.
 *
 * Le site étant statique, le texte est lu depuis Firestore après affichage de
 * la page — la lecture de `settings` est publique. Il ne rend rien tant qu'il
 * n'est pas activé, ce qui est l'état normal : aucun décalage visuel n'apparaît
 * dans ce cas.
 */
export function Banner() {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getSettings()
      .then((settings) => {
        if (!active) return;
        if (settings.bannerEnabled && settings.bannerText) {
          setText(settings.bannerText);
        }
      })
      // Un bandeau indisponible ne doit jamais empêcher le site de s'afficher.
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  if (!text) return null;

  return (
    <div className="bg-ink-800 px-4 py-2.5 text-center text-sm text-ink-100">
      {text}
    </div>
  );
}
