import type { Page } from '../types';

/**
 * Accueil — refonte totale.
 * L'ancienne page n'exposait aucune prestation, aucun CTA et aucune preuve de
 * crédibilité : elle ouvrait sur un schéma négaWatt et l'étymologie du nom.
 * Objectif de la nouvelle page : qualifier le visiteur en cinq secondes
 * (qui / quoi / où) puis l'orienter vers la bonne prestation.
 */
export const home: Page = {
  slug: [],
  navLabel: 'Accueil',
  title: "Bureau d'études en performance énergétique du bâtiment",
  seo: {
    title: 'ECO2BAT — Audit énergétique et infiltrométrie à La Ciotat (13)',
    description:
      "Bureau d'études indépendant à La Ciotat : audit énergétique réglementaire et incitatif, DPE, test d'infiltrométrie, DTG copropriété. Ingénieur Arts et Métiers, RGE.",
  },
  hero: {
    lead:
      "Je suis Pierre-Yves Venaille, ingénieur Arts et Métiers. Depuis La Ciotat, j'accompagne particuliers, copropriétés et constructeurs sur la performance énergétique de leurs bâtiments : mesure, diagnostic et conseil, sans vendre ni poser aucun travaux.",
    primary: { label: 'Demander un devis', href: '/contact/' },
    secondary: { label: 'Découvrir la démarche', href: '/a-propos/' },
  },
  blocks: [
    {
      type: 'cards',
      title: 'Mes prestations',
      lead: 'Quatre entrées selon votre situation.',
      cards: [
        {
          title: 'Audit énergétique',
          text: "Audit réglementaire avant vente d'une passoire thermique, ou audit incitatif pour préparer une rénovation globale et mobiliser les aides.",
          href: '/audit-energetique/',
        },
        {
          title: 'DPE',
          text: 'Diagnostic de performance énergétique pour une maison, un immeuble entier ou un local tertiaire.',
          href: '/dpe/',
        },
        {
          title: 'Infiltrométrie',
          text: "Mesure de la perméabilité à l'air, en construction neuve pour la RE2020 comme en rénovation, caméra infrarouge à l'appui.",
          href: '/infiltrometrie/',
        },
        {
          title: 'Copropriétés',
          text: "DTG, audit énergétique de copropriété et accompagnement du conseil syndical dans la définition d'un plan de travaux.",
          href: '/coproprietes/',
        },
      ],
    },
    {
      type: 'section',
      title: 'Un bureau d’études indépendant, pas un réseau',
      body: [
        "Vous avez en face de vous la personne qui viendra sur site, qui fera les mesures et qui rédigera le rapport. Pas de sous-traitance, pas de commercial intermédiaire.",
        "Je ne vends pas de travaux et je ne perçois aucune commission d'installateur. Mon seul produit est le diagnostic : il n'a de valeur que s'il est honnête.",
        {
          list: [
            'Ingénieur Arts et Métiers, bureau d’études créé en Provence',
            'Qualifications RGE Études et OPQIBI',
            'Matériel de mesure en propre : caméra thermique, porte soufflante, enregistreurs',
          ],
        },
      ],
    },
    {
      type: 'steps',
      title: 'Comment se passe une intervention',
      steps: [
        {
          title: 'Premier échange',
          text: "Vous m'exposez votre situation par téléphone ou via le formulaire. Je vous dis franchement si une prestation est utile, et laquelle.",
        },
        {
          title: 'Devis et rendez-vous',
          text: 'Vous recevez un devis détaillé. Une fois validé, nous fixons la date de visite selon vos contraintes.',
        },
        {
          title: 'Visite et mesures',
          text: "Relevé du bâti, des équipements et des usages. Selon la prestation : thermographie, test d'infiltrométrie, mesures d'ambiance.",
        },
        {
          title: 'Rapport et restitution',
          text: 'Vous recevez le rapport, puis nous le parcourons ensemble. Vous repartez avec un ordre de priorité des travaux, pas avec un catalogue.',
        },
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Zone d’intervention',
      text: "Basé à La Ciotat, j'interviens principalement dans les Bouches-du-Rhône et le Var. Pour un projet plus éloigné, contactez-moi : je vous dirai si le déplacement a du sens.",
    },
    {
      type: 'cta',
      title: 'Parlons de votre projet',
      text: "Décrivez votre bien et votre échéance : je vous réponds sous 48 heures ouvrées avec une orientation claire et, s'il y a lieu, un devis.",
      primary: { label: 'Demander un devis', href: '/contact/' },
      secondary: { label: '06 15 14 85 08', href: 'tel:+33615148508' },
    },
  ],
  status: 'draft',
  sitemapPriority: 1,
  auditNote:
    'Priorité 1 — Critique. Refonte totale. Valider avec le client la liste des prestations encore actives en 2026 et le périmètre géographique.',
};
