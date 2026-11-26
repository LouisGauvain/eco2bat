'use client';

import { useEffect, useState } from 'react';

import { CONTENT_UPDATED_EVENT, defaultCompany, getCompany } from './public-store';
import type { Company } from '@/content/schema';

/**
 * Coordonnées de l'entreprise, lues dans le navigateur : elles se modifient en
 * ligne sans republier. Les pages, elles, sont construites au build
 * (`pages-source.ts`).
 *
 * Ce module est chargé par tout le site public : il passe par `public-store`
 * (Firestore « lite ») et ne doit importer ni `firebase/auth` ni le SDK complet.
 */

/** Incrémenté à chaque sauvegarde, pour relancer les lectures en cours de page. */
function useContentVersion(): number {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const onUpdate = () => setVersion((value) => value + 1);
    window.addEventListener(CONTENT_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(CONTENT_UPDATED_EVENT, onUpdate);
  }, []);

  return version;
}

export function useCompany(): Company {
  const [company, setCompany] = useState<Company>(defaultCompany);
  const version = useContentVersion();

  useEffect(() => {
    let active = true;
    getCompany().then((loaded) => {
      if (active) setCompany(loaded);
    });
    return () => {
      active = false;
    };
  }, [version]);

  return company;
}
