import type { Page } from '../types';

/** Contrôles RT2012 — maquette « RT2012 » du dossier Refonte Eco2bat. */
export const controlesRt2012: Page = {
  slug: ['controles-rt2012'],
  navLabel: 'RT2012',
  title: 'Contrôles RT2012 fin de chantier',
  seo: {
    title: "Contrôles RT2012 / RE2020 fin de chantier | ECO2BAT",
    description:
      "Essai porte soufflante, vérification des performances et attestation de conformité fin de chantier RT2012 ou RE2020, DPE neuf. La Ciotat, PACA.",
    keywords: [
      'RT2012',
      'RE2020',
      'Contrôles RT2012 fin de chantier',
      'Essai porte soufflante',
      'Infiltrométrie',
      "Essai de perméabilité à l'air",
      'Attestation conformité fin de chantier',
      'DPE neuf',
    ],
  },
  hero: {
    eyebrow: 'Nos missions',
    lead:
      "En fin de chantier d'une construction neuve de maison individuelle, le maître d'ouvrage doit procéder à plusieurs contrôles. Le référentiel est l'étude thermique réalisée au moment du permis de construire.",
  },
  blocks: [
    {
      type: 'panels',
      panels: [
        {
          eyebrow: 'Il convient de vérifier',
          title: 'Deux vérifications à mener en fin de chantier',
          body: [
            {
              list: [
                "Le niveau de perméabilité à l'air de la maison, par un essai porte soufflante (infiltrométrie)",
                'La cohérence des performances des isolants et des équipements avec ce qui était prévu',
              ],
            },
          ],
        },
        {
          eyebrow: 'Le livrable',
          title: "L'attestation exigée pour la déclaration d'achèvement",
          body: [
            "Le contrôle réalisé permet de rédiger « l'attestation du respect de la réglementation thermique à l'achèvement des travaux », demandée par la mairie pour réaliser la déclaration d'achèvement des travaux.",
          ],
        },
      ],
    },
    {
      type: 'cards',
      eyebrow: 'Missions liées',
      title: 'Autour du contrôle de fin de chantier',
      cards: [
        {
          title: 'Mesures physiques du bâtiment',
          text: "L'essai porte soufflante et la caméra infrarouge, hors obligation réglementaire, sur un bâti existant.",
          href: '/mesure-physique-du-batiment/',
        },
        {
          title: 'Diagnostic de Performance Énergétique (DPE)',
          text: 'Le DPE neuf, établi à la livraison du logement.',
          href: '/dpe/',
        },
      ],
    },
    {
      type: 'links',
      eyebrow: 'Sources officielles',
      title: 'Les textes de la réglementation thermique',
      links: [
        {
          label: 'Réglementation thermique 2012',
          href: 'https://rt-re-batiment.developpement-durable.gouv.fr/rt2012-r269.html',
          text: 'Textes, méthode de calcul et exigences, sur le portail RT-RE Bâtiment du ministère.',
          group: 'Textes de référence',
        },
        {
          label: 'Attestations RT2012',
          href: 'https://rt-re-batiment.developpement-durable.gouv.fr/attestations-rt2012-r93.html',
          text: "Les attestations exigées au permis de construire et à l'achèvement des travaux.",
          group: 'Textes de référence',
        },
        {
          label: 'RE2020',
          href: 'https://rt-re-batiment.developpement-durable.gouv.fr/re2020-r320.html',
          text: 'La réglementation environnementale qui a succédé à la RT2012 dans le neuf.',
          group: 'Textes de référence',
        },
      ],
    },
    {
      type: 'cta',
      title: 'Anticipons les points délicats dès le début du chantier',
      text: 'Maison individuelle, maisons groupées ou collectif : ECO2BAT vous accompagne.',
      primary: { label: 'Nous contacter', href: '#contact' },
    },
  ],
  status: 'draft',
  sitemapPriority: 0.8,
};
