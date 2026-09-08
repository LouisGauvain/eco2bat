import type { Page } from '../types';

/** Mesure physique — maquette « Mesures » du dossier Refonte Eco2bat. */
export const mesurePhysique: Page = {
  slug: ['mesure-physique-du-batiment'],
  navLabel: 'Mesures',
  title: 'Mesure physique du bâtiment',
  seo: {
    title: "Mesures physiques du bâtiment — thermographie | ECO2BAT",
    description:
      "Caméra infrarouge, perméabilité à l'air, enregistrement des consommations, des températures et de l'humidité. La Ciotat et PACA.",
  },
  hero: {
    eyebrow: 'Nos missions',
    lead:
      "L'instrumentation d'un bâtiment permet de compléter un diagnostic de terrain. Voici les expertises que nous pouvons mener :",
  },
  blocks: [
    {
      type: 'cards',
      cards: [
        {
          title: 'Inspection caméra infrarouge',
          text: "Dans certaines conditions, cela permet d'observer l'homogénéité d'une isolation et les déperditions thermiques.",
        },
        {
          title: "Test de perméabilité à l'air (infiltrométrie)",
          text: "Par essai porte soufflante : identifie le niveau d'étanchéité à l'air du bâti, mais aussi les défauts d'isolation dès que le bâti est soumis au vent.",
        },
        {
          title: 'Enregistrement de consommations électriques',
          text: "Lorsqu'un compteur alimente plusieurs usages, la mesure identifie l'importance de chaque consommateur et relève les éventuels usages permanents.",
        },
        {
          title: "Enregistrement de température et d'humidité",
          text: "Permet en général de vérifier l'efficacité d'une régulation de chauffage.",
        },
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Méthode',
      text: "Avant de mener une campagne de mesure, il est nécessaire de bien définir l'objectif recherché et les conditions d'essais nécessaires.",
    },
    {
      type: 'cards',
      eyebrow: 'Missions liées',
      title: 'À quoi servent ces mesures',
      cards: [
        {
          title: 'Contrôles RT2012 fin de chantier',
          text: "L'essai porte soufflante dans son cadre réglementaire, pour une construction neuve.",
          href: '/controles-rt2012/',
        },
        {
          title: 'Rénovation énergétique',
          text: 'La mesure complète le diagnostic de terrain et fiabilise les priorités de travaux.',
          href: '/renovation-energetique/',
        },
        {
          title: 'Audit énergétique logement',
          text: "L'instrumentation confirme sur site les hypothèses du calcul réglementaire.",
          href: '/audit-energetique/',
        },
      ],
    },
    {
      type: 'cta',
      title: 'Parlons de votre problématique',
      text: 'Après une première visite, nous pourrons vous proposer une mesure physique adaptée, ou complémentaire à nos observations.',
      primary: { label: 'Nous contacter', href: '#contact' },
    },
  ],
  status: 'draft',
  sitemapPriority: 0.8,
};
