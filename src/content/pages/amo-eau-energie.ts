import type { Page } from '../types';

/** AMO eau & énergie — maquette « AMO » du dossier Refonte Eco2bat. */
export const amoEauEnergie: Page = {
  slug: ['amo-economies-eau-energie'],
  navLabel: 'AMO eau & énergie',
  title: "AMO économies d'eau et d'énergie",
  seo: {
    title: "AMO économies d'eau et d'énergie — COE, CEP | ECO2BAT",
    description:
      "Assistance à maîtrise d'ouvrage pour les collectivités et le tourisme : COE, Conseil en Énergie Partagé, économe de flux. La Ciotat et PACA.",
    keywords: [
      "AMO économies d'eau et d'énergie",
      "Conseil d'Orientation Énergétique",
      'COE',
      'Conseil en Énergie Partagé',
      'CEP',
      'Économe de flux',
      'Diagnostic eau énergie',
    ],
  },
  hero: {
    eyebrow: 'Nos missions',
    lead:
      "Vous êtes maître d'ouvrage d'un patrimoine consommant de l'eau et de l'énergie, et vous souhaitez mener une politique d'économie : mais par où commencer ? Depuis 2008, nous réalisons des Diagnostics Eau / Énergie pour les collectivités et les établissements touristiques.",
  },
  blocks: [
    {
      type: 'steps',
      eyebrow: 'La démarche',
      title: "L'étude se déroule en plusieurs étapes",
      steps: [
        { title: 'Analyser les données de facturation', text: '' },
        {
          title: "Identifier les compteurs d'eau et d'énergie sensibles à l'échelle de votre patrimoine",
          text: '',
        },
        { title: 'Visiter les sites, rencontrer les usagers, caractériser les consommations', text: '' },
        {
          title: 'Préconiser les actions de gestion, de pratiques et d’équipements, quantifier les gains',
          text: '',
        },
        { title: "Vérifier la mise en œuvre et l'efficacité", text: '' },
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Bon à savoir',
      text: "Dans certains cas, nous pouvons proposer un accompagnement rémunéré en partie sur les économies d'énergie.",
    },
    {
      type: 'cards',
      eyebrow: 'Missions liées',
      title: 'Les outils de la mission',
      cards: [
        {
          title: 'Mesures physiques du bâtiment',
          text: "Enregistrement des consommations, thermographie, perméabilité à l'air : caractériser avant de préconiser.",
          href: '/mesure-physique-du-batiment/',
        },
        {
          title: 'Rénovation énergétique',
          text: 'Pour le patrimoine bâti, le même raisonnement : le bâti d’abord, les équipements ensuite.',
          href: '/renovation-energetique/',
        },
      ],
    },
    {
      type: 'links',
      eyebrow: 'Sources officielles',
      title: "Ressources sur l'eau et l'énergie",
      links: [
        {
          label: "J'économise l'eau",
          href: 'https://www.jeconomiseleau.org/',
          text: "Guide des économies d'eau pour les collectivités et les établissements.",
          group: "Économies d'eau",
        },
        {
          label: 'Eaufrance',
          href: 'https://www.eaufrance.fr/',
          text: "Le service public d'information sur l'eau : données et état des ressources.",
          group: "Économies d'eau",
        },
        {
          label: 'VigiEau',
          href: 'https://vigieau.gouv.fr/',
          text: 'Restrictions d’usage de l’eau en vigueur, commune par commune.',
          group: "Économies d'eau",
        },
        {
          label: 'Librairie de l’Ademe',
          href: 'https://librairie.ademe.fr/',
          text: 'Guides et études de référence sur les économies d’eau et d’énergie.',
          group: 'Références',
        },
      ],
    },
    {
      type: 'cta',
      eyebrow: 'Notre philosophie',
      title: '« Faire avec vous, mais pas à votre place »',
      text: 'Pour que la culture des économies soit la vôtre, parlons ensemble de votre patrimoine.',
      primary: { label: 'Parler de votre patrimoine', href: '#contact' },
    },
  ],
  status: 'draft',
  sitemapPriority: 0.8,
};
