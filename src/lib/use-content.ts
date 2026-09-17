'use client';

import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

import {
  CONTENT_UPDATED_EVENT,
  defaultCompany,
  getCompany,
} from './content-store';
import { getClientAuth } from './firebase/client';
import type { Company } from '@/content/schema';

/**
 * Lectures côté navigateur : coordonnées de l'entreprise, modifiables en ligne
 * sans republier, et état de connexion du gérant.
 *
 * Les pages, elles, ne se lisent plus ici : elles sont construites au build
 * (`pages-source.ts`).
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

/**
 * Vrai quand un compte est connecté. Aucune inscription n'étant ouverte, être
 * authentifié vaut « c'est le gérant » — c'est ce qui déclenche l'affichage
 * des outils d'édition sur le site public. La sécurité reste dans les règles
 * Firestore : afficher ou non un bouton ne protège rien.
 */
export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(
    () => onAuthStateChanged(getClientAuth(), (user) => setIsAdmin(user !== null)),
    [],
  );

  return isAdmin;
}
