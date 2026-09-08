'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

import { getSettings } from '@/lib/settings';

/** Mémoire locale du dernier bandeau connu. */
const CACHE_KEY = 'eco2bat:banner';

/** `useLayoutEffect` n'existe pas au pré-rendu : `useEffect` le remplace alors. */
const useBeforePaint = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function readCache(): string | null {
  try {
    return window.localStorage.getItem(CACHE_KEY);
  } catch {
    // Navigation privée ou stockage refusé : on s'en passe.
    return null;
  }
}

function writeCache(text: string | null) {
  try {
    if (text) window.localStorage.setItem(CACHE_KEY, text);
    else window.localStorage.removeItem(CACHE_KEY);
  } catch {
    // Idem : le cache est un confort, pas une dépendance.
  }
}

/**
 * Bandeau d'information piloté depuis le back-office.
 *
 * Le site étant statique, le texte est lu depuis Firestore après affichage de
 * la page. Comme le bandeau pousse tout le contenu vers le bas, son arrivée
 * tardive décalerait la page sous les yeux du visiteur (CLS) : le texte connu
 * de la visite précédente est donc réaffiché depuis `localStorage` avant la
 * première peinture, et sa hauteur est fixée (`min-h`) pour qu'un texte plus
 * long que le précédent ne décale rien non plus. Firestore confirme ou corrige
 * ensuite. Une première visite sans bandeau — l'état normal — ne réserve
 * aucune place.
 */
export function Banner() {
  const [text, setText] = useState<string | null>(null);

  useBeforePaint(() => {
    setText(readCache());
  }, []);

  useEffect(() => {
    let active = true;

    getSettings()
      .then((settings) => {
        const next =
          settings.bannerEnabled && settings.bannerText ? settings.bannerText : null;
        writeCache(next);
        if (active) setText(next);
      })
      // Un bandeau indisponible ne doit jamais empêcher le site de s'afficher.
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  if (!text) return null;

  return (
    <div className="flex min-h-10 items-center justify-center bg-ink-800 px-4 py-2.5 text-center text-sm text-ink-100">
      {text}
    </div>
  );
}
