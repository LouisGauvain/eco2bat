'use client';

import {
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { collection } from 'firebase/firestore';

import { collections, getDb } from './firebase/client';
import { companySchema, pageContentSchema, type Company, type PageContent } from '@/content/schema';
import type { Page } from '@/content/types';
import { site } from '@/content/site';

/**
 * Surcharge du contenu éditée depuis le back-office.
 *
 * Le site est exporté en statique : le HTML servi à Google reste celui du
 * dernier déploiement. Ce qui est écrit ici s'affiche immédiatement pour les
 * visiteurs, remplacé après hydratation, mais n'entre dans l'index qu'au
 * prochain build. C'est le compromis assumé du back-office : les corrections
 * de texte sont visibles tout de suite, les changements qui comptent pour le
 * référencement demandent un redéploiement.
 *
 * Lecture publique, écriture réservée à un utilisateur authentifié — voir
 * `firestore.rules`.
 */

/** Identifiant Firestore d'une page : le slug, dont l'accueil est le cas vide. */
export function pageDocId(slug: string[]): string {
  return slug.length === 0 ? 'home' : slug.join('__');
}

/** Contenu éditable extrait d'une page du dépôt — point de départ de l'édition. */
export function pageContentOf(page: Page): PageContent {
  return {
    navLabel: page.navLabel,
    title: page.title,
    seo: { ...page.seo },
    hero: page.hero ? { ...page.hero } : null,
    blocks: page.blocks,
  };
}

/** Page du dépôt recouverte par sa surcharge, quand celle-ci existe. */
export function mergePage(page: Page, content: PageContent | null): Page {
  if (!content) return page;
  return {
    ...page,
    navLabel: content.navLabel,
    title: content.title,
    seo: content.seo,
    hero: content.hero ?? undefined,
    blocks: content.blocks,
  };
}

export async function getPageContent(slug: string[]): Promise<PageContent | null> {
  try {
    const snapshot = await getDoc(doc(getDb(), collections.pages, pageDocId(slug)));
    if (!snapshot.exists()) return null;

    const parsed = pageContentSchema.safeParse(snapshot.data());
    // Un document invalide ne doit jamais vider une page : on garde la version
    // du dépôt.
    if (!parsed.success) {
      console.error('[contenu] surcharge ignorée (document invalide)', parsed.error);
      return null;
    }
    return parsed.data;
  } catch (error) {
    console.error('[contenu] lecture impossible', error);
    return null;
  }
}

/** Identifiants des pages ayant une surcharge — pour la liste du back-office. */
export async function getOverriddenPageIds(): Promise<Set<string>> {
  try {
    const snapshot = await getDocs(collection(getDb(), collections.pages));
    return new Set(snapshot.docs.map((entry) => entry.id));
  } catch (error) {
    console.error('[contenu] liste des surcharges impossible', error);
    return new Set();
  }
}

export async function savePageContent(slug: string[], content: PageContent): Promise<void> {
  await setDoc(doc(getDb(), collections.pages, pageDocId(slug)), {
    ...stripUndefined(content),
    updatedAt: serverTimestamp(),
  });
  notifyContentUpdated();
}

/** Retour à la version du dépôt : la surcharge est supprimée, pas vidée. */
export async function resetPageContent(slug: string[]): Promise<void> {
  await deleteDoc(doc(getDb(), collections.pages, pageDocId(slug)));
  notifyContentUpdated();
}

const COMPANY_DOC = 'company';

/** Informations d'entreprise du dépôt — valeurs par défaut de l'éditeur. */
export const defaultCompany: Company = {
  name: site.name,
  legalName: site.legalName,
  tagline: site.tagline,
  owner: { ...site.owner },
  contact: { ...site.contact },
  address: { ...site.address },
  serviceArea: [...site.serviceArea],
  responseTime: site.responseTime,
};

export async function getCompany(): Promise<Company> {
  try {
    const snapshot = await getDoc(doc(getDb(), collections.settings, COMPANY_DOC));
    if (!snapshot.exists()) return defaultCompany;

    const parsed = companySchema.safeParse(snapshot.data());
    return parsed.success ? parsed.data : defaultCompany;
  } catch (error) {
    console.error('[entreprise] lecture impossible', error);
    return defaultCompany;
  }
}

export async function saveCompany(company: Company): Promise<void> {
  await setDoc(doc(getDb(), collections.settings, COMPANY_DOC), {
    ...company,
    updatedAt: serverTimestamp(),
  });
  notifyContentUpdated();
}

/**
 * Signal de rafraîchissement : après une sauvegarde, les composants du site
 * déjà affichés (en-tête, pied de page, page en cours d'édition) rechargent
 * leur contenu sans recharger la page — c'est ce qui rend l'édition en direct
 * lisible pour celui qui écrit.
 */
export const CONTENT_UPDATED_EVENT = 'eco2bat:content-updated';

function notifyContentUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CONTENT_UPDATED_EVENT));
  }
}

/** Firestore refuse `undefined` : les champs optionnels vides sont retirés. */
function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as T;
  }
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      if (item !== undefined) result[key] = stripUndefined(item);
    }
    return result as T;
  }
  return value;
}
