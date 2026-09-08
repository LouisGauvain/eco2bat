import type { Page } from '../types';

/** Audit énergétique — maquette « Audit » du dossier Refonte Eco2bat. */
export const auditEnergetique: Page = {
  slug: ['audit-energetique'],
  navLabel: 'Audit énergétique',
  title: 'Audit énergétique logement',
  seo: {
    title: "Audit énergétique La Ciotat — AER ou volontaire | ECO2BAT",
    description:
      "Audit réglementaire pour vendre une maison classée E, F ou G, ou audit volontaire exigé par MaPrimeRénov', CEE et éco-PTZ. La Ciotat et PACA.",
    keywords: [
      'Audit Énergétique Réglementaire',
      'AER',
      'Audit énergétique volontaire',
      'Audit énergétique logement',
      "MaPrimeRénov'",
      'CEE',
      "Mon Accompagnateur Rénov'",
      'MAR',
    ],
  },
  hero: {
    eyebrow: 'Nos missions',
    lead:
      'Les maisons individuelles et les immeubles en monopropriété classés F ou G — et depuis le 01/01/2025 les logements classés E — ne peuvent plus être vendus sans réaliser au préalable un audit énergétique.',
  },
  blocks: [
    {
      type: 'panels',
      panels: [
        {
          eyebrow: 'Pourquoi un audit ?',
          title: "Trois situations qui appellent un audit énergétique",
          body: [
            {
              list: [
                "Audit énergétique réglementaire (AER) : obligatoire pour la vente d'une maison individuelle ou d'un immeuble en monopropriété classé E, F ou G",
                "Audit énergétique volontaire : exigé par les dispositifs de financement actuels — MaPrimeRénov', CEE, éco-PTZ…",
                'Pertinent pour les propriétaires souhaitant réaliser des travaux de rénovation énergétique',
              ],
            },
          ],
        },
        {
          eyebrow: 'Nos certifications',
          title: "DPE et audit : deux compétences certifiées distinctes",
          body: [
            "Si la même méthode de calcul 3CL est utilisée pour le DPE et pour l'audit énergétique, les intervenants disposent de compétences certifiées différentes. ECO2BAT dispose des certifications DPE et audit énergétique, pour les maisons individuelles, les immeubles collectifs et les bâtiments tertiaires.",
          ],
        },
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'À noter',
      text: "Le montage des demandes de financement concernant une maison individuelle est assuré par un prestataire Mon Accompagnateur Rénov' (MAR) agréé : nous n'assurons pas cette mission.",
    },
    {
      type: 'cards',
      eyebrow: 'Missions liées',
      title: 'Avant ou après l’audit',
      cards: [
        {
          title: 'Diagnostic de Performance Énergétique (DPE)',
          text: "Même méthode de calcul 3CL, mais une autre finalité : le DPE est exigé pour la vente ou la location du bien.",
          href: '/dpe/',
        },
        {
          title: 'Rénovation énergétique',
          text: "L'audit chiffre les scénarios de travaux ; la mission de conseil vous aide à les ordonner et à les mener.",
          href: '/renovation-energetique/',
        },
        {
          title: 'Mesures physiques du bâtiment',
          text: "Thermographie et perméabilité à l'air pour vérifier sur site ce que le calcul suppose.",
          href: '/mesure-physique-du-batiment/',
        },
      ],
    },
    {
      type: 'links',
      eyebrow: 'Sources officielles',
      title: 'Aides et textes de référence',
      links: [
        {
          label: 'Le guide des aides financières',
          href: 'https://librairie.ademe.fr/',
          text: "Guide annuel de l'Ademe : les aides à la rénovation, condition par condition.",
          group: 'Financements',
        },
        {
          label: "Simulateur d'aides France Rénov'",
          href: 'https://france-renov.gouv.fr/aides/simulation',
          text: "Estimation des aides mobilisables selon vos revenus et votre projet.",
          group: 'Financements',
        },
        {
          label: 'Audit énergétique réglementaire',
          href: 'https://rt-re-batiment.developpement-durable.gouv.fr/audit-energetique-r630.html',
          text: "La réglementation de l'audit, sur le portail RT-RE Bâtiment du ministère.",
          group: 'Références',
        },
      ],
    },
    {
      type: 'cta',
      title: 'Faisons le point ensemble',
      text: 'Sur votre situation, et sur votre projet de rénovation.',
      primary: { label: 'Demander un audit', href: '#contact' },
    },
  ],
  status: 'draft',
  sitemapPriority: 0.9,
};
