'use client';

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch,
  type Timestamp,
  type WriteBatch,
} from 'firebase/firestore';

import { collections, getDb } from './firebase/client';
import { docFromPage, pageFromDoc, pathOf, seedPages, byOrder, type Page } from '@/content';
import { companySchema, pageDocSchema, type Company } from '@/content/schema';
import { site } from '@/content/site';

/**
 * Contenu du site, édité depuis le back-office.
 *
 * Tout ce qui est écrit ici est un brouillon au sens large : le site en ligne
 * est le HTML du dernier build. Un enregistrement se voit dans l'aperçu du
 * back-office ; il part en ligne quand le gérant clique « Publier », qui relance
 * le build (voir `publish.ts`).
 *
 * Lecture publique, écriture réservée à un utilisateur authentifié — voir
 * `firestore.rules`.
 */

// ─── Pages ───────────────────────────────────────────────────────────────────

export interface PageEntry extends Page {
  /** Dernier enregistrement, en millisecondes. */
  updatedAt: number | null;
}

export interface PageList {
  pages: PageEntry[];
  /** Anciennes surcharges de texte, en attente d'import. */
  legacy: number;
}

export async function listPages(): Promise<PageList> {
  const snapshot = await getDocs(collection(getDb(), collections.pages));
  const pages: PageEntry[] = [];
  let legacy = 0;

  for (const document of snapshot.docs) {
    const data = document.data();
    if (!('slug' in data)) {
      legacy += 1;
      continue;
    }
    const parsed = pageDocSchema.safeParse(data);
    if (!parsed.success) {
      console.error(`[contenu] page « ${document.id} » ignorée (document invalide)`, parsed.error);
      continue;
    }
    pages.push({
      ...pageFromDoc(document.id, parsed.data),
      updatedAt: millis(data.updatedAt),
    });
  }

  return { pages: pages.sort(byOrder), legacy };
}

export async function getPage(id: string): Promise<Page | null> {
  const snapshot = await getDoc(doc(getDb(), collections.pages, id));
  if (!snapshot.exists()) return null;
  const parsed = pageDocSchema.safeParse(snapshot.data());
  if (!parsed.success) {
    console.error(`[contenu] page « ${id} » invalide`, parsed.error);
    return null;
  }
  return pageFromDoc(id, parsed.data);
}

/**
 * Enregistre une page déjà validée par `pageDocSchema`.
 *
 * `previous` est la version chargée dans l'éditeur : si l'adresse d'une page en
 * ligne a changé, une redirection 301 est posée de l'ancienne vers la nouvelle,
 * pour ne perdre ni les liens entrants ni le référencement acquis.
 */
export async function savePage(page: Page, previous: Page | null): Promise<void> {
  const { pages } = await listPages();
  const path = pathOf(page);
  const clash = pages.find((other) => other.id !== page.id && pathOf(other) === path);
  if (clash) {
    throw new ContentError(`L’adresse ${path} est déjà utilisée par la page « ${clash.navLabel} ».`);
  }

  const redirects = await listRedirects();
  const batch = writeBatch(getDb());

  if (previous && previous.status === 'published' && pathOf(previous) !== path) {
    addRedirectTo(batch, redirects, pathOf(previous), path);
  }

  // Une page qui (ré)occupe une adresse ne doit plus en être redirigée :
  // Firebase Hosting applique les redirections avant de servir les fichiers.
  for (const redirect of redirects) {
    if (redirect.from === path) batch.delete(doc(getDb(), collections.redirects, redirect.id));
  }

  batch.set(doc(getDb(), collections.pages, page.id), {
    ...stripUndefined(docFromPage(page)),
    updatedAt: serverTimestamp(),
  });
  touch(batch);
  await batch.commit();
  notifyContentUpdated();
}

/** Nouvelle page, en brouillon, placée en fin de liste. */
export async function createPage(title: string, pages: Page[]): Promise<string> {
  const page: Omit<Page, 'id'> = {
    slug: [uniqueSegment([], slugify(title) || 'nouvelle-page', pages)],
    status: 'draft',
    showInNav: false,
    order: nextOrder(pages),
    navLabel: title.slice(0, 60),
    title,
    seo: { title: '', description: '' },
    blocks: [],
  };
  const created = await addDoc(collection(getDb(), collections.pages), {
    ...stripUndefined(docFromPage({ ...page, id: '' })),
    updatedAt: serverTimestamp(),
  });
  await touchNow();
  notifyContentUpdated();
  return created.id;
}

/** Copie en brouillon, hors menu, à une adresse libre. */
export async function duplicatePage(source: Page, pages: Page[]): Promise<string> {
  const base = source.slug.length === 0 ? 'accueil' : (source.slug.at(-1) as string);
  const copy: Page = {
    ...source,
    id: '',
    slug: [...source.slug.slice(0, -1), uniqueSegment(source.slug.slice(0, -1), `${base}-copie`, pages)],
    status: 'draft',
    showInNav: false,
    customRoute: undefined,
    order: nextOrder(pages),
    navLabel: `${source.navLabel} (copie)`.slice(0, 60),
  };
  const created = await addDoc(collection(getDb(), collections.pages), {
    ...stripUndefined(docFromPage(copy)),
    updatedAt: serverTimestamp(),
  });
  await touchNow();
  notifyContentUpdated();
  return created.id;
}

/**
 * Suppression. Une page en ligne laisse derrière elle une adresse connue de
 * Google et peut-être de liens extérieurs : `redirectTo` est le chemin vers
 * lequel la renvoyer.
 */
export async function deletePage(page: Page, redirectTo: string | null): Promise<void> {
  const batch = writeBatch(getDb());
  if (page.status === 'published' && redirectTo) {
    addRedirectTo(batch, await listRedirects(), pathOf(page), redirectTo);
  }
  batch.delete(doc(getDb(), collections.pages, page.id));
  touch(batch);
  await batch.commit();
  notifyContentUpdated();
}

/** Nouvel ordre du menu et de la liste : `ids` dans l'ordre voulu. */
export async function reorderPages(ids: string[]): Promise<void> {
  const batch = writeBatch(getDb());
  ids.forEach((id, index) => {
    batch.update(doc(getDb(), collections.pages, id), { order: index });
  });
  touch(batch);
  await batch.commit();
  notifyContentUpdated();
}

/**
 * Premier remplissage de la collection avec les pages du dépôt. Les textes
 * déjà réécrits depuis l'ancien back-office (documents sans slug, rangés sous
 * le même identifiant) sont repris plutôt qu'écrasés.
 */
export async function importSeedPages(): Promise<void> {
  const batch = writeBatch(getDb());

  for (const seed of seedPages()) {
    const legacy = await getDoc(doc(getDb(), collections.pages, seed.id));
    let page = seed;

    if (legacy.exists() && !('slug' in legacy.data())) {
      const data = legacy.data();
      const merged: Page = {
        ...seed,
        navLabel: data.navLabel ?? seed.navLabel,
        title: data.title ?? seed.title,
        seo: data.seo ?? seed.seo,
        hero: data.hero ?? undefined,
        blocks: data.blocks ?? seed.blocks,
      };
      // Une surcharge mal formée ne doit pas bloquer l'import : la page
      // d'origine prend sa place.
      if (pageDocSchema.safeParse(docFromPage(merged)).success) page = merged;
    }

    batch.set(doc(getDb(), collections.pages, seed.id), {
      ...stripUndefined(docFromPage(page)),
      updatedAt: serverTimestamp(),
    });
  }

  touch(batch);
  await batch.commit();
  notifyContentUpdated();
}

// ─── Redirections ────────────────────────────────────────────────────────────

export interface Redirect {
  id: string;
  /** Ancien chemin, avec slash final : `/infiltrometrie/`. */
  from: string;
  to: string;
  createdAt: number | null;
}

export async function listRedirects(): Promise<Redirect[]> {
  const snapshot = await getDocs(collection(getDb(), collections.redirects));
  return snapshot.docs
    .map((document) => {
      const data = document.data();
      return {
        id: document.id,
        from: String(data.from ?? ''),
        to: String(data.to ?? ''),
        createdAt: millis(data.createdAt),
      };
    })
    .sort((a, b) => a.from.localeCompare(b.from));
}

export async function deleteRedirect(id: string): Promise<void> {
  const batch = writeBatch(getDb());
  batch.delete(doc(getDb(), collections.redirects, id));
  touch(batch);
  await batch.commit();
  notifyContentUpdated();
}

/**
 * Pose `from → to`, et fait pointer directement vers `to` les redirections qui
 * visaient `from` : pas de chaîne de 301 après plusieurs renommages.
 */
function addRedirectTo(
  batch: WriteBatch,
  existing: Redirect[],
  from: string,
  to: string,
) {
  if (from === to) return;
  for (const redirect of existing) {
    const ref = doc(getDb(), collections.redirects, redirect.id);
    if (redirect.from === from) batch.delete(ref);
    else if (redirect.to === from) batch.update(ref, { to });
  }
  batch.set(doc(collection(getDb(), collections.redirects)), {
    from,
    to,
    createdAt: serverTimestamp(),
  });
}

// ─── Date de dernière modification ───────────────────────────────────────────

/**
 * Chaque écriture de contenu date `settings/content` : comparée à la dernière
 * publication, elle dit s'il reste des modifications à mettre en ligne — y
 * compris une suppression, qui ne laisse aucun document derrière elle.
 */
const CONTENT_DOC = 'content';

function touch(batch: WriteBatch) {
  batch.set(doc(getDb(), collections.settings, CONTENT_DOC), { changedAt: serverTimestamp() });
}

async function touchNow() {
  await setDoc(doc(getDb(), collections.settings, CONTENT_DOC), { changedAt: serverTimestamp() });
}

export async function lastContentChange(): Promise<number | null> {
  const snapshot = await getDoc(doc(getDb(), collections.settings, CONTENT_DOC));
  return snapshot.exists() ? millis(snapshot.data().changedAt) : null;
}

// ─── Entreprise ──────────────────────────────────────────────────────────────

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

// ─── Utilitaires ─────────────────────────────────────────────────────────────

/** Erreur à montrer telle quelle à l'utilisateur. */
export class ContentError extends Error {}

/**
 * Signal de rafraîchissement : après une sauvegarde, les composants déjà
 * affichés (liste des pages, bouton de publication, coordonnées sur le site)
 * relisent la base sans recharger la page.
 */
export const CONTENT_UPDATED_EVENT = 'eco2bat:content-updated';

function notifyContentUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CONTENT_UPDATED_EVENT));
  }
}

/** « Audit énergétique à Marseille » → `audit-energetique-a-marseille`. */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');
}

/** Dernier segment d'adresse libre sous `parent`, suffixé -2, -3… si besoin. */
function uniqueSegment(parent: string[], segment: string, pages: Page[]): string {
  const taken = new Set(pages.map((page) => page.slug.join('/')));
  const pathWith = (last: string) => [...parent, last].join('/');
  let candidate = segment;
  for (let n = 2; taken.has(pathWith(candidate)); n += 1) candidate = `${segment}-${n}`;
  return candidate;
}

function nextOrder(pages: Page[]): number {
  return pages.reduce((max, page) => Math.max(max, page.order), -1) + 1;
}

function millis(value: unknown): number | null {
  return value && typeof (value as Timestamp).toMillis === 'function'
    ? (value as Timestamp).toMillis()
    : null;
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
