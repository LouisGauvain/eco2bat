import type { Page } from '../types';

/** Rénovation énergétique — maquette « Renovation » du dossier Refonte Eco2bat. */
export const renovationEnergetique: Page = {
  slug: ['renovation-energetique'],
  navLabel: 'Rénovation',
  title: 'Rénovation énergétique',
  seo: {
    title: "Rénovation énergétique à La Ciotat et en PACA | ECO2BAT",
    description:
      "Conseil en rénovation énergétique : diagnostic, DPE, audit réglementaire ou volontaire, repères sur MaPrimeRénov', CEE et ANAH. La Ciotat, PACA.",
    keywords: [
      'Rénovation énergétique',
      'Diagnostic de Performance Énergétique',
      'DPE',
      'Audit Énergétique Réglementaire',
      'AER',
      'Audit énergétique volontaire',
      'Diagnostic énergie',
      'RT existant',
      "Mon Accompagnateur Rénov'",
      'MAR',
      "Certificats d'Économie d'Énergie",
      'CEE',
      'ANAH',
      'France Rénov',
      "MaPrimeRénov'",
    ],
  },
  hero: {
    eyebrow: 'Nos missions',
    lead:
      "Agir dans l'urgence ne permet pas de réfléchir sereinement. Rénover, c'est prendre le temps de faire un état des lieux de l'existant, recenser les besoins d'améliorations, et les opportunités de travaux.",
  },
  blocks: [
    {
      type: 'panels',
      panels: [
        {
          eyebrow: 'Les bons moments',
          title: 'Plusieurs opportunités incitent à prendre ce temps',
          body: [
            {
              list: [
                "À l'achat du bien",
                "Lors d'un aménagement intérieur",
                "Au moment du ravalement de façades ou de la réfection de l'étanchéité",
                'Quand la chaudière commence à vieillir…',
              ],
            },
          ],
        },
        {
          eyebrow: 'La bonne méthode',
          title: "Le bâti d'abord, les équipements ensuite",
          body: [
            "Une rénovation énergétique aborde en priorité l'amélioration du bâti (isolation, étanchéité à l'air, inertie…), puis l'amélioration des équipements thermiques (production chauffage, production eau chaude, ventilation…). Pour compléter l'inventaire, il est pertinent d'analyser ou mesurer les consommations par usage.",
          ],
        },
      ],
    },
    {
      type: 'cards',
      eyebrow: "Nos formes d'intervention",
      title: 'Nos missions prennent plusieurs formes possibles',
      cards: [
        {
          title: 'Conseil simple',
          text: "Un diagnostic énergie de terrain, sans calcul réglementaire, pour ordonner les priorités.",
          href: '#contact',
        },
        {
          title: 'Diagnostic de Performance Énergétique (DPE)',
          text: 'Exigé pour la vente ou la location, et point de départ pour mesurer une rénovation.',
          href: '/dpe/',
        },
        {
          title: 'Audit énergétique réglementaire (AER) ou volontaire',
          text: "Obligatoire pour vendre une maison individuelle ou un immeuble en monopropriété classé E, F ou G ; volontaire pour préparer des travaux et leurs financements.",
          href: '/audit-energetique/',
        },
        {
          title: 'Mesures physiques du bâtiment',
          text: "Thermographie, perméabilité à l'air, enregistrement des consommations.",
          href: '/mesure-physique-du-batiment/',
        },
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'À noter',
      text: "Le montage des demandes de financement concernant une maison individuelle est assuré par un prestataire Mon Accompagnateur Rénov' (MAR) agréé : nous n'assurons pas cette mission. Nous faisons le point avec vous sur votre situation et votre projet de rénovation.",
    },
    {
      type: 'links',
      eyebrow: 'Sources officielles',
      title: 'Pour aller plus loin',
      links: [
        {
          label: "France Rénov'",
          href: 'https://france-renov.gouv.fr/',
          text: "Service public de la rénovation de l'habitat : conseils et orientation.",
          group: 'Aides aux particuliers',
        },
        {
          label: "MaPrimeRénov'",
          href: 'https://www.maprimerenov.gouv.fr/',
          text: "Aide de l'État pour les travaux de rénovation énergétique, y compris MaPrimeRénov' Copro.",
          group: 'Aides aux particuliers',
        },
        {
          label: 'ANAH',
          href: 'https://www.anah.gouv.fr/',
          text: "Agence nationale de l'habitat, gestionnaire des aides.",
          group: 'Aides aux particuliers',
        },
        {
          label: "Certificats d'Économie d'Énergie (CEE)",
          href: 'https://www.ecologie.gouv.fr/politiques-publiques/dispositif-certificats-deconomies-denergie',
          text: 'Le dispositif expliqué par le ministère de la Transition écologique.',
          group: 'Références',
        },
        {
          label: 'Ademe',
          href: 'https://www.ademe.fr/',
          text: "Agence de la transition écologique : guides et données de référence.",
          group: 'Références',
        },
      ],
    },
    {
      type: 'cta',
      title: 'Parlons ensemble de votre projet',
      text: 'Nous vous conseillerons sur les missions les plus adaptées.',
      primary: { label: 'Nous contacter', href: '#contact' },
    },
  ],
  status: 'draft',
  sitemapPriority: 0.9,
};
