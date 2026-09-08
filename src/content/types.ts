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

/**
 * Alignement horizontal, pour le texte d'une section comme pour une image.
 * `left` est la valeur par défaut partout : elle n'est écrite que lorsqu'on
 * s'en écarte.
 */
export type Align = 'left' | 'center' | 'right';

/**
 * Largeur d'une image. Trois paliers plutôt qu'une valeur libre : une page
 * écrite dans six mois garde ainsi les mêmes proportions que les autres, et
 * aucune image ne peut déborder sur petit écran.
 */
export type ImageSize = 'small' | 'medium' | 'full';

/**
 * Carte de texte : surtitre en capitales vertes, titre, corps. C'est l'unité
 * de base des pages de mission, posée seule ou côte à côte (bloc `panels`).
 */
export interface Panel {
  eyebrow?: string;
  title?: string;
  body: Rich[];
}

export type Block =
  /** Texte courant, sans carte : pages légales, notes de bas de page. */
  | {
      type: 'section';
      id?: string;
      eyebrow?: string;
      title?: string;
      lead?: string;
      body: Rich[];
      align?: Align;
    }
  /**
   * Deux ou trois cartes côte à côte, chacune avec son surtitre : « Les bons
   * moments » / « La bonne méthode ». Sur mobile elles s'empilent.
   */
  | { type: 'panels'; panels: Panel[] }
  /**
   * Étapes numérotées dans une grande carte. Des étapes réduites à leur
   * intitulé s'alignent en grille ; dès qu'une étape porte une description,
   * elles se lisent en liste.
   */
  | {
      type: 'steps';
      eyebrow?: string;
      title?: string;
      lead?: string;
      steps: { title: string; text: string }[];
    }
  /**
   * Grille de cartes numérotées (missions, expertises). `numbered: false`
   * retire les numéros — pour une liste de références, où l'ordre ne dit rien.
   */
  | {
      type: 'cards';
      id?: string;
      eyebrow?: string;
      title?: string;
      lead?: string;
      numbered?: boolean;
      cards: { title: string; text: string; href?: string }[];
    }
  | { type: 'faq'; eyebrow?: string; title?: string; items: { q: string; a: string }[] }
  /**
   * Phrase mise en exergue dans une carte centrée. Une par page au maximum :
   * l'effet tient à sa rareté. Sur l'accueil, la citation négaWatt vit dans le
   * hero (`hero.quote`) et non dans un bloc.
   */
  | { type: 'quote'; text: string; source?: string }
  /**
   * Photo de chantier ou schéma. `alt` décrit l'image pour qui ne la voit pas
   * — lecteur d'écran, connexion coupée, moteur de recherche — et n'est donc
   * pas facultatif. `width` et `height` sont ceux du fichier d'origine : ils
   * réservent la place de l'image avant son chargement, pour que le texte ne
   * saute pas quand elle arrive.
   *
   * `align` n'a d'effet qu'en dessous de la pleine largeur, et seulement sur
   * grand écran : sur mobile, l'image occupe toujours la colonne entière.
   */
  | {
      type: 'image';
      url: string;
      alt: string;
      caption?: string;
      width?: number;
      height?: number;
      size?: ImageSize;
      align?: Align;
    }
  /**
   * Références : les familles de clients (`groups`, petites cartes) puis les
   * logos, dans une seule grande carte. `caption` est le petit intitulé posé
   * au-dessus des logos ; `alt` porte le nom de l'organisme.
   */
  | {
      type: 'logos';
      eyebrow?: string;
      title?: string;
      lead?: string;
      groups?: { title: string; text: string }[];
      caption?: string;
      logos: { url: string; alt: string }[];
      /**
       * Partenaires, sous l'intitulé « Partenaires » : logo (`url`) ou, à
       * défaut, le nom en texte ; `href` renvoie vers leur site.
       */
      partners?: { url?: string; alt: string; href?: string }[];
      /** Ligne discrète en bas de carte : « Partenaires : … ». */
      footnote?: string;
    }
  /** Encadré : pastille (le titre) et texte, dans une carte. */
  | {
      type: 'callout';
      tone: 'info' | 'warning';
      title?: string;
      text: string;
    }
  | {
      type: 'cta';
      eyebrow?: string;
      title: string;
      text?: string;
      primary: { label: string; href: string };
      secondary?: { label: string; href: string };
    }
  /**
   * Liens sortants vers les sources officielles (France Rénov', Ademe,
   * ministère, agences de l'eau). `group` range un lien sous une rubrique :
   * chaque rubrique devient une carte, les liens sans rubrique en forment une.
   */
  | {
      type: 'links';
      eyebrow?: string;
      title?: string;
      lead?: string;
      links: { label: string; href: string; text?: string; group?: string }[];
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
    /**
     * Requêtes visées par la page, issues de la liste fournie par le client.
     * Elles ne sont pas émises en balise keywords — les moteurs l'ignorent :
     * leur usage est éditorial, chacune doit apparaître dans le titre, la
     * description ou le texte de la page. Une dizaine au maximum.
     */
    keywords?: string[];
  };
  hero?: {
    /** Surtitre au-dessus du H1 : « Nos missions », « Contact ». */
    eyebrow?: string;
    /** Accroche affichée sous le H1. */
    lead: string;
    /**
     * Paragraphes de présentation, sous l'accroche et dans la même colonne
     * qu'elle. Réservé à un texte court : au-delà de trois paragraphes, une
     * section de contenu se lit mieux.
     */
    body?: string[];
    primary?: { label: string; href: string };
    secondary?: { label: string; href: string };
    /**
     * Ligne discrète sous les boutons — la baseline « Conviction, écoute,
     * expérience ». Les termes séparés par une virgule s'affichent avec un
     * point entre eux.
     */
    tagline?: string;
    /**
     * Illustration placée à côté du titre, et non sous lui : le visiteur voit
     * le texte et le schéma d'un seul coup d'œil, sans faire défiler. Sur
     * mobile elle passe sous les boutons. Comme pour le bloc `image`, `alt`
     * n'est pas facultatif.
     */
    image?: {
      url: string;
      alt: string;
      caption?: string;
      width?: number;
      height?: number;
    };
    /**
     * Citation posée à côté de l'illustration, dans la même carte : sur
     * l'accueil, la phrase négaWatt à côté de son schéma.
     */
    quote?: { text: string; source?: string };
    /** Chiffres clés sous la citation : « 2008 — Année de création ». */
    stats?: { value: string; label: string }[];
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
