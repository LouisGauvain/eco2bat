import type { PageDoc } from './schema';
import type { Page, SeedPage } from './types';
import { pathOf } from './types';
import { mainNav } from './site';
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
 * Pages d'origine, dans l'ordre de l'arborescence décrite par le client dans
 * son document « SITE INTERNET ». Elles remplissent la collection Firestore au
 * premier import, et servent de repli tant que celle-ci est vide.
 */
const seeds: SeedPage[] = [
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

/**
 * Identifiant Firestore d'une page d'origine : son slug, l'accueil étant le cas
 * vide. C'est l'identifiant qu'utilisaient les anciennes surcharges, ce qui
 * permet de les retrouver à l'import.
 */
export function seedDocId(slug: string[]): string {
  return slug.length === 0 ? 'home' : slug.join('__');
}

export function seedPages(): Page[] {
  return seeds.map((seed, index) => {
    const nav = mainNav.find((item) => item.href === pathOf(seed));
    return {
      ...seed,
      id: seedDocId(seed.slug),
      order: index,
      showInNav: Boolean(nav),
      navTitle: nav?.title,
    };
  });
}

/** Page lue en base → page rendue. */
export function pageFromDoc(id: string, doc: PageDoc): Page {
  return { ...doc, id, hero: doc.hero ?? undefined };
}

/** Page → document à enregistrer. `hero` absent s'écrit `null` : Firestore refuse `undefined`. */
export function docFromPage(page: Page): PageDoc {
  const { id, ...rest } = page;
  void id; // l'identifiant est celui du document, il n'est pas stocké dedans
  return { ...rest, hero: page.hero ?? null };
}

export function byOrder(a: Page, b: Page): number {
  return a.order - b.order;
}

export function findBySlug(pages: Page[], slug: string[] | undefined): Page | undefined {
  const path = slug && slug.length > 0 ? `/${slug.join('/')}/` : '/';
  return pages.find((page) => pathOf(page) === path);
}

/**
 * Pages rendues par la route générique `[...slug]` : tout sauf l'accueil (qui a
 * sa propre route) et les pages disposant d'une route dédiée.
 */
export function contentRoutePages(pages: Page[]): Page[] {
  return pages.filter((page) => page.slug.length > 0 && !page.customRoute);
}

export function isIndexable(page: Page): boolean {
  return page.status === 'published' && !page.noindex;
}

/** Entrées du menu principal, dans l'ordre choisi dans le back-office. */
export interface NavItem {
  label: string;
  title: string;
  href: string;
}

export function navItems(pages: Page[]): NavItem[] {
  return pages
    .filter((page) => page.showInNav && page.slug.length > 0)
    .sort(byOrder)
    .map((page) => ({
      label: page.navLabel,
      title: page.navTitle || page.title,
      href: pathOf(page),
    }));
}

/** Fil d'Ariane : l'accueil, chaque ancêtre existant, puis la page. */
export function breadcrumbFor(page: Page, pages: Page[]): Page[] {
  const root = findBySlug(pages, []);
  const trail: Page[] = root ? [root] : [];
  for (let depth = 1; depth <= page.slug.length; depth += 1) {
    const ancestor = findBySlug(pages, page.slug.slice(0, depth));
    if (ancestor && ancestor !== root) trail.push(ancestor);
  }
  return trail;
}

export { pathOf };
export type { Page } from './types';
