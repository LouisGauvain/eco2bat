/**
 * Modèle de contenu du site public.
 *
 * Les pages sont versionnées dans le dépôt (et non en base) : le référencement
 * est l'enjeu central de la refonte, et c'est cette version-là qui part dans le
 * HTML statique, donc dans l'index des moteurs.
 *
 * Le back-office peut réécrire le texte d'une page (voir
 * `src/lib/content-store.ts`) : la surcharge s'affiche aussitôt pour les
 * visiteurs, et entre dans l'index au déploiement suivant. La structure —
 * slug, existence d'une page, présence dans le menu — reste décrite ici :
 * changer une URL demande d'en poser la redirection.
 */

/** Fragment de texte long : paragraphe, sous-titre ou liste. */
export type Rich =
  | string
  | { h3: string }
  | { list: string[] }
  | { ordered: string[] };

export type Block =
  | { type: 'section'; id?: string; title?: string; lead?: string; body: Rich[] }
  | { type: 'steps'; title?: string; steps: { title: string; text: string }[] }
  | {
      type: 'cards';
      title?: string;
      lead?: string;
      cards: { title: string; text: string; href?: string }[];
    }
  | { type: 'faq'; title?: string; items: { q: string; a: string }[] }
  | {
      type: 'callout';
      tone: 'info' | 'warning';
      title?: string;
      text: string;
    }
  | {
      type: 'cta';
      title: string;
      text?: string;
      primary: { label: string; href: string };
      secondary?: { label: string; href: string };
    };

/**
 * Avancement rédactionnel, repris de l'audit de contenu.
 * `todo` signale une page dont le texte reste à écrire ou à valider avec le
 * client : elle est alors exclue du sitemap et marquée `noindex`.
 */
export type PageStatus = 'todo' | 'draft' | 'ready';

export interface Page {
  /** Segments d'URL, sans slash. `[]` pour l'accueil. */
  slug: string[];
  /** Libellé court utilisé dans les menus et le fil d'Ariane. */
  navLabel: string;
  /** Titre H1 de la page. */
  title: string;
  seo: {
    /** Balise <title>, orientée requête. Max ~60 caractères. */
    title: string;
    /** Meta-description unique à chaque page. ~150 caractères. */
    description: string;
  };
  hero?: {
    /** Accroche affichée sous le H1. */
    lead: string;
    primary?: { label: string; href: string };
    secondary?: { label: string; href: string };
  };
  blocks: Block[];
  status: PageStatus;
  /**
   * `true` quand la page a sa propre route dans `src/app` (parce qu'elle
   * embarque de l'interactif, comme le formulaire de contact). Elle reste
   * décrite ici pour le menu, le sitemap et ses métadonnées, mais n'est pas
   * rendue par la route générique.
   */
  customRoute?: boolean;
  /** Priorité relative dans le sitemap (0 à 1). */
  sitemapPriority?: number;
  /** Note de reprise issue de l'audit — pour l'équipe, jamais affichée. */
  auditNote?: string;
}

/** Chemin absolu d'une page, forme canonique avec slash final. */
export function pathOf(page: Pick<Page, 'slug'>): string {
  return page.slug.length === 0 ? '/' : `/${page.slug.join('/')}/`;
}
