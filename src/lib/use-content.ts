'use client';

import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

import {
  CONTENT_UPDATED_EVENT,
  defaultCompany,
  getCompany,
  getPageContent,
  mergePage,
} from './content-store';
import { getClientAuth } from './firebase/client';
import type { Company } from '@/content/schema';
import type { Page } from '@/content/types';

/**
 * Lecture du contenu surchargé, côté navigateur.
 *
 * Le premier rendu est toujours celui du dépôt : c'est lui qui se trouve dans
 * le HTML statique, donc dans l'index des moteurs. La surcharge Firestore
 * arrive après, et ne remplace le contenu que si elle est valide.
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

export function usePageContent(page: Page): Page {
  const [merged, setMerged] = useState<Page>(page);
  const version = useContentVersion();

  useEffect(() => {
    let active = true;
    setMerged(page);

    getPageContent(page.slug).then((content) => {
      if (!active || !content) return;
      setMerged(mergePage(page, content));
    });

    return () => {
      active = false;
    };
  }, [page, version]);

  // Le <title> et la meta-description sont figés dans le HTML statique : on les
  // aligne sur la surcharge pour que l'onglet et les partages correspondent à
  // ce que le visiteur lit. L'index, lui, attend le prochain déploiement.
  useEffect(() => {
    document.title = merged.seo.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', merged.seo.description);
  }, [merged]);

  return merged;
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
