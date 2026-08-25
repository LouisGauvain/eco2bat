/**
 * Informations d'entreprise (NAP), reprises de la page Contact de l'ancien
 * site et de la page « Moyens ». Source unique : ces valeurs alimentent
 * l'en-tête, le pied de page, les mentions légales et les données structurées
 * schema.org. Ne pas les dupliquer ailleurs dans le code.
 */
export const site = {
  name: 'ECO2BAT',
  legalName: 'ECO2BAT',
  tagline: "Bureau d'études indépendant en performance énergétique du bâtiment",
  /** Voix éditoriale unifiée au « je » : c'est un BE unipersonnel, et c'est un différenciateur. */
  owner: {
    name: 'Pierre-Yves VENAILLE',
    role: 'Ingénieur Arts et Métiers, gérant',
  },
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
   * Périmètre géographique — ARBITRAGE CLIENT REQUIS (audit, ligne
   * « Positionnement géographique »). Valeur provisoire : rayon autour de
   * La Ciotat. À confirmer avant mise en ligne.
   */
  serviceArea: ['Bouches-du-Rhône', 'Var'],
  /** À compléter avec les numéros et dates de validité réels. */
  certifications: [
    { label: 'RGE Études', detail: 'Audit énergétique' },
    { label: 'OPQIBI', detail: 'Qualification bureau d’études' },
  ],
  /** Délai de réponse annoncé sur la page Contact. À valider avec le client. */
  responseTime: '48 heures ouvrées',
} as const;

/** Menu principal. L'ordre suit l'arborescence cible de l'audit. */
export const mainNav: { label: string; href: string }[] = [
  { label: 'Audit énergétique', href: '/audit-energetique/' },
  { label: 'DPE', href: '/dpe/' },
  { label: 'Infiltrométrie', href: '/infiltrometrie/' },
  { label: 'Copropriétés', href: '/coproprietes/' },
  { label: 'Formation artisans', href: '/formation-artisans/' },
  { label: 'À propos', href: '/a-propos/' },
];

export const legalNav: { label: string; href: string }[] = [
  { label: 'Mentions légales', href: '/mentions-legales/' },
  { label: 'Politique de confidentialité', href: '/politique-de-confidentialite/' },
];

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://eco2bat.fr'
).replace(/\/$/, '');
