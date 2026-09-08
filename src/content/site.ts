/**
 * Informations d'entreprise (NAP), reprises de la page Contact de l'ancien
 * site et de la page « Moyens ». Source unique : ces valeurs alimentent
 * l'en-tête, le pied de page, les mentions légales et les données structurées
 * schema.org. Ne pas les dupliquer ailleurs dans le code.
 */
export const site = {
  name: 'ECO2BAT',
  legalName: 'ECO2BAT',
  tagline: "Conseil en économie d'eau et d'énergie dans le bâtiment",
  /**
   * Voix éditoriale au « nous », reprise du document de cadrage rédigé par le
   * client : c'est ainsi qu'il présente son activité et ses missions, et c'est
   * l'usage à suivre pour toute page ajoutée ensuite.
   */
  owner: {
    name: 'Pierre-Yves VENAILLE',
    role: 'Ingénieur Arts et Métiers, gérant',
  },
  /** Année de création, mise en avant sur l'accueil et les pages de mission. */
  since: 2008,
  /** Baseline du document client, reprise sous le logo et sur l'accueil. */
  motto: 'Conviction, écoute, expérience',
  /** Développement du nom, à l'origine de la ligne éditoriale du site. */
  meaning: 'ECOnomie et ECOlogie dans le BATiment',
  /** Titre affiché à côté du logo dans l'en-tête, repris de l'ancien site. */
  headline: 'Économies Eau & Énergie — PACA',
  /** Citation affichée à droite du logo dans l'en-tête. */
  slogan: 'Quand Économies rime avec Écologie…',
  contact: {
    phone: '06 15 14 85 08',
    /** Format E.164 pour les liens tel: et les données structurées. */
    phoneE164: '+33615148508',
    email: 'contact@eco2bat.fr',
  },
  address: {
    street: '297 chemin Notre-Dame de la Garde',
    postalCode: '13600',
    city: 'La Ciotat',
    country: 'FR',
    region: "Provence-Alpes-Côte d'Azur",
  },
  /**
   * Coordonnées du siège (chemin Notre-Dame de la Garde, La Ciotat), relevées
   * sur OpenStreetMap. Elles servent aux données structurées : Google s'en
   * sert pour rattacher l'entreprise à une zone dans les résultats locaux.
   */
  geo: { latitude: 43.16965, longitude: 5.59713 },
  /**
   * Horaires d'ouverture au format schema.org (« Mo-Fr 09:00-18:00 »).
   * Vide tant que le client ne les a pas fixés : annoncer des horaires faux
   * dans les résultats de recherche est pire que ne rien annoncer.
   */
  openingHours: '',
  /** Fourchette de prix, telle qu'affichée dans les résultats locaux. */
  priceRange: 'Sur devis',
  /**
   * Profils officiels de l'entreprise (LinkedIn, annuaires professionnels).
   * À obtenir du client : ils confirment l'identité de l'entreprise auprès
   * des moteurs. Aucun profil connu à ce jour.
   */
  sameAs: [] as string[],
  /**
   * Périmètre géographique — seule zone que le client revendique lui-même
   * (« Économies Eau & Énergie — PACA »). Toute précision par département est
   * un arbitrage à lui demander : ne rien ajouter ici sans son accord.
   */
  serviceArea: ["Provence-Alpes-Côte d'Azur"],
  /**
   * Délai de réponse annoncé sur la page Contact. Vide tant que le client ne
   * l'a pas fixé lui-même : c'est un engagement pris devant le visiteur, et
   * l'encart ne s'affiche pas en son absence. Se renseigne depuis le
   * back-office (Paramètres › Délai de réponse).
   */
  responseTime: '',
} as const;

/**
 * Menu principal, dans l'ordre du document de cadrage du client. `label` est
 * le mot court de la barre de navigation, `title` l'intitulé complet repris
 * dans le pied de page et la page 404.
 */
export const mainNav: { label: string; title: string; href: string }[] = [
  { label: 'Rénovation', title: 'Rénovation énergétique', href: '/renovation-energetique/' },
  { label: 'DPE', title: 'Diagnostic de Performance Énergétique', href: '/dpe/' },
  { label: 'Audit énergétique', title: 'Audit énergétique logement', href: '/audit-energetique/' },
  { label: 'Mesures', title: 'Mesures physiques du bâtiment', href: '/mesure-physique-du-batiment/' },
  { label: 'RT2012', title: 'Contrôles RT2012 fin de chantier', href: '/controles-rt2012/' },
  { label: 'AMO eau & énergie', title: 'AMO économies d’eau et d’énergie', href: '/amo-economies-eau-energie/' },
];

export const legalNav: { label: string; href: string }[] = [
  { label: 'Mentions légales', href: '/mentions-legales/' },
  { label: 'Politique de confidentialité', href: '/politique-de-confidentialite/' },
];

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://eco2bat.fr'
).replace(/\/$/, '');
