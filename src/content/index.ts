import type { Page } from './types';
import { pathOf } from './types';
import { home } from './pages/home';
import { renovationEnergetique } from './pages/renovation-energetique';
import { dpe } from './pages/dpe';
import { auditEnergetique } from './pages/audit-energetique';
import { mesurePhysique } from './pages/mesure-physique';
import { controlesRt2012 } from './pages/controles-rt2012';
import { amoEauEnergie } from './pages/amo-eau-energie';
import { contact } from './pages/contact';
import { mentionsLegales, politiqueConfidentialite } from './pages/legal';

/**
 * Registre des pages du site, dans l'ordre de l'arborescence décrite par le
 * client dans son document « SITE INTERNET ». Ajouter une page ici suffit à la
 * rendre, à la référencer dans le sitemap et à lui donner ses métadonnées.
 */
export const pages: Page[] = [
  home,
  renovationEnergetique,
  dpe,
  auditEnergetique,
  mesurePhysique,
  controlesRt2012,
  amoEauEnergie,
  contact,
  mentionsLegales,
  politiqueConfidentialite,
];

/** Index par chemin canonique, construit une fois au chargement du module. */
const byPath = new Map(pages.map((page) => [pathOf(page), page]));

function getPageByPath(path: string): Page | undefined {
  const normalized = path.endsWith('/') ? path : `${path}/`;
  return byPath.get(normalized);
}

export function getPageBySlug(slug: string[] | undefined): Page | undefined {
  return getPageByPath(slug && slug.length > 0 ? `/${slug.join('/')}/` : '/');
}

/**
 * Pages rendues par la route générique `[...slug]` : tout sauf l'accueil (qui a
 * sa propre route) et les pages disposant d'une route dédiée.
 */
export function contentRoutePages(): Page[] {
  return pages.filter((page) => page.slug.length > 0 && !page.customRoute);
}

/**
 * Pages à publier dans le sitemap. Une page encore en rédaction (`todo`) est
 * exclue et rendue en `noindex`.
 */
export function indexablePages(): Page[] {
  return pages.filter((page) => page.status !== 'todo');
}

export function isIndexable(page: Page): boolean {
  return page.status !== 'todo';
}

/** Fil d'Ariane : chaque ancêtre présent dans le registre, puis la page. */
export function breadcrumbFor(page: Page): Page[] {
  const trail: Page[] = [home];
  for (let depth = 1; depth <= page.slug.length; depth += 1) {
    const ancestor = getPageBySlug(page.slug.slice(0, depth));
    if (ancestor && ancestor !== home) trail.push(ancestor);
  }
  return trail;
}

export { pathOf };
export type { Page } from './types';
