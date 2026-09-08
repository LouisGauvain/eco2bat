import type { Page } from '../types';
import { site } from '../site';

export const home: Page = {
  slug: [],
  navLabel: 'Accueil',
  title: 'ECOnomie et ECOlogie dans le BATiment',
  seo: {
    title: "ECO2BAT — rénovation énergétique, DPE, audit à La Ciotat",
    description:
      "Bureau d'études en économie d'eau et d'énergie depuis 2008 : rénovation, DPE, audit énergétique, contrôles RT2012, AMO. La Ciotat et PACA.",
    keywords: [
      'Rénovation énergétique',
      'DPE',
      'Audit énergétique',
      'RT2012',
      'Infiltrométrie',
      "AMO économies d'eau et d'énergie",
      "Bureau d'études énergie La Ciotat",
    ],
  },
  hero: {
    lead:
      'Les ressources en eau et en énergie diminuent, alors que la population et nos usages augmentent.',
    body: [
      "Pour trouver un équilibre, il faut organiser l'avenir : nous vous accompagnons pour trouver les économies. Depuis 2008, nous apportons des conseils en économie d'eau et d'énergie au travers de missions volontaires ou réglementaires. À partir d'un inventaire de votre patrimoine, et de vos projets, nous proposons des améliorations possibles.",
    ],
    primary: { label: 'Parlons de votre projet', href: '#contact' },
    secondary: { label: 'Nos missions', href: '/renovation-energetique/' },
    tagline: site.motto,
    stats: [
      { value: String(site.since), label: 'Année de création' },
      { value: 'DPE + Audit', label: 'Certifications' },
      { value: '3 typologies', label: 'Maison · collectif · tertiaire' },
    ],
    image: {
      url: '/negawatt.jpg',
      alt: 'Démarche négaWatt : sobriété, efficacité, renouvelables',
      width: 283,
      height: 266,
    },
    quote: {
      text: '« La ressource la plus propre… est celle dont on n’a pas besoin !!! »',
      source: 'Source : Association négaWatt',
    },
  },
  blocks: [
    {
      type: 'cards',
      eyebrow: 'Nos missions',
      title: 'Du conseil simple à la mesure sur site',
      lead: "À partir d'un inventaire de votre patrimoine et de vos projets, nous proposons des améliorations possibles.",
      cards: [
        {
          title: 'Rénovation énergétique',
          text: "État des lieux de l'existant, besoins d'améliorations et opportunités de travaux.",
          href: '/renovation-energetique/',
        },
        {
          title: 'Diagnostic de Performance Énergétique',
          text: "Exigé pour la vente ou la location — et outil précieux pour mesurer l'efficacité d'une rénovation.",
          href: '/dpe/',
        },
        {
          title: 'Audit énergétique logement',
          text: "Obligatoire pour la vente d'une maison individuelle ou d'un immeuble en monopropriété classé E, F ou G, et exigé par les dispositifs de financement.",
          href: '/audit-energetique/',
        },
        {
          title: 'Mesures physiques du bâtiment',
          text: "Caméra infrarouge, perméabilité à l'air, enregistrements de consommations et de température.",
          href: '/mesure-physique-du-batiment/',
        },
        {
          title: 'Contrôles RT2012 fin de chantier',
          text: "Mesure de perméabilité à l'air et attestation de respect de la réglementation thermique.",
          href: '/controles-rt2012/',
        },
        {
          title: "AMO économies d'eau et d'énergie",
          text: 'Diagnostics Eau / Énergie pour les collectivités et les établissements touristiques.',
          href: '/amo-economies-eau-energie/',
        },
      ],
    },
    {
      type: 'logos',
      eyebrow: 'Références',
      title: 'Ils nous font confiance',
      groups: [
        { title: 'Collectivités', text: 'Mairies, Parcs Naturels Régionaux, Parc National, Syndicats Mixtes, EPTB.' },
        { title: 'Copropriétés', text: 'Syndics, Conseils Syndicaux, gestionnaires de patrimoine.' },
        { title: 'Établissements touristiques', text: 'Hôtels, campings, gîtes.' },
        {
          title: 'Particuliers & pros du bâtiment',
          text: "Architectes, artisans, bureaux d'études, notaires, experts judiciaires.",
        },
      ],
      caption: 'Parcs et collectivités accompagnés',
      logos: [
        { url: '/references/pnr-alpilles.png', alt: 'PNR des Alpilles' },
        { url: '/references/pnr-baronnies-provencales.png', alt: 'PNR des Baronnies provençales' },
        { url: '/references/pnr-camargue.jpg', alt: 'PNR de Camargue' },
        { url: '/references/pnr-luberon.jpg', alt: 'PNR du Luberon' },
        { url: '/references/pnr-mont-ventoux.png', alt: 'PNR du Mont-Ventoux' },
        { url: '/references/pnr-narbonnaise.jpg', alt: 'PNR de la Narbonnaise' },
        { url: '/references/pnr-prealpes-azur.png', alt: "PNR des Préalpes d'Azur" },
        { url: '/references/pnr-pyrenees-catalanes.jpg', alt: 'PNR des Pyrénées catalanes' },
        { url: '/references/pnr-queyras.png', alt: 'PNR du Queyras' },
        { url: '/references/pnr-sainte-baume.png', alt: 'PNR de la Sainte-Baume' },
        { url: '/references/pnr-verdon.jpg', alt: 'PNR du Verdon' },
        { url: '/references/parc-national-cevennes.png', alt: 'Parc national des Cévennes' },
        { url: '/references/esprit-parc-national.png', alt: 'Esprit Parc National' },
        { url: '/references/valeurs-parc-naturel-regional.png', alt: 'Valeurs Parc Naturel Régional' },
      ],
      // Logos fournis par le client (Solair) ou récupérés sur les sites des
      // partenaires : accord à confirmer avant mise en ligne. Idem et Indyen
      // n'ont pas de logo : leur nom s'affiche en texte.
      partners: [
        { url: '/partenaires/savenergie.png', alt: 'SAVEnergie', href: 'https://www.savenergie.com/' },
        { alt: 'Idem' },
        { url: '/partenaires/solair.png', alt: 'Solair & Associés', href: 'https://www.entreprise-solair.com/' },
        { alt: 'Indyen' },
        { url: '/partenaires/ekosud.png', alt: 'Ekosud', href: 'https://ekosud.fr/' },
        { url: '/partenaires/apzi-diagnostics.png', alt: 'APZ-i Diagnostics', href: 'https://apzidiagnostics.com/' },
      ],
    },
    {
      type: 'faq',
      eyebrow: 'Questions fréquentes',
      title: 'DPE, audit, financements : on vous éclaire',
      items: [
        {
          q: 'DPE ou audit énergétique : que me faut-il ?',
          a: "Le DPE est exigé pour toute vente ou mise en location. Pour vendre une maison individuelle ou un immeuble en monopropriété classé E, F ou G, un audit énergétique est en plus obligatoire. L'audit est aussi la bonne base pour un projet de travaux : parlons-en ensemble.",
        },
        {
          q: 'Le DPE est-il obligatoire pour mon immeuble collectif ?',
          a: "Selon leur nombre de lots, les immeubles de logements collectifs de plus de 10 ans doivent pouvoir présenter un DPE, et l'actualiser tous les 10 ans.",
        },
        {
          q: "Montez-vous les dossiers MaPrimeRénov' ?",
          a: "Non. Le montage des demandes de financement d'une maison individuelle est assuré par un prestataire Mon Accompagnateur Rénov' (MAR) agréé. Nous réalisons en revanche l'audit énergétique exigé par ces dispositifs (MaPrimeRénov', CEE, éco-PTZ…).",
        },
        {
          q: 'Intervenez-vous sur les bâtiments tertiaires ?',
          a: "Oui. ECO2BAT dispose des certifications DPE et audit énergétique pour les maisons individuelles, les immeubles collectifs et les bâtiments tertiaires. Pour un projet de rénovation tertiaire, préférez l'audit énergétique au DPE.",
        },
      ],
    },
    {
      type: 'cta',
      title: 'Parlons ensemble de votre projet',
      text: 'Nous vous conseillerons sur les missions les plus adaptées à votre situation et à votre patrimoine.',
      primary: { label: 'Nous contacter', href: '#contact' },
    },
  ],
  status: 'draft',
  sitemapPriority: 1,
};
