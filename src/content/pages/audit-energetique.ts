import type { Page } from '../types';

/**
 * Audit énergétique — réécriture.
 * C'était la meilleure page de l'ancien site : la trame Quand / Objectifs /
 * Comment fonctionne, et le ton « si j'avais su » est efficace. On la conserve.
 * Ce qui doit changer : tout le volet aides financières était périmé (barèmes
 * et parcours MaPrimeRénov'), et le lien vers faire.gouv.fr est mort — le
 * service s'appelle France Rénov'. La page est par ailleurs scindée en deux :
 * l'audit incitatif reste ici, l'audit réglementaire avant vente part sur une
 * page dédiée à fort volume de recherche.
 */
export const auditEnergetique: Page = {
  slug: ['audit-energetique'],
  navLabel: 'Audit énergétique',
  title: 'Audit énergétique de maison et de rénovation globale',
  seo: {
    title: 'Audit énergétique maison — La Ciotat et Bouches-du-Rhône',
    description:
      "Audit énergétique complet avant rénovation : état du bâti, scénarios de travaux chiffrés et priorisés, aides mobilisables. Bureau d'études RGE à La Ciotat.",
  },
  hero: {
    lead:
      "Bien souvent, on me dit après coup : « si j'avais su, j'aurais fait les choses dans l'autre sens. » L'audit énergétique sert exactement à cela — savoir avant, et dépenser dans le bon ordre.",
    primary: { label: 'Demander un devis', href: '/contact/' },
  },
  blocks: [
    {
      type: 'section',
      title: 'Quand faire un audit énergétique',
      body: [
        "Un audit se justifie dès qu'une décision engage plusieurs dizaines de milliers d'euros ou plusieurs années d'usage :",
        {
          list: [
            "Vous envisagez une rénovation globale et vous voulez l'étaler dans le temps sans faire d'erreur d'ordre",
            "On vous propose de changer la chaudière ou d'installer une pompe à chaleur, et vous voulez vérifier que c'est le bon investissement",
            'Vous venez d’acheter et vous découvrez des factures ou un inconfort que vous n’attendiez pas',
            'Vous devez vendre un logement classé F ou G et un audit réglementaire vous est demandé',
          ],
        },
        "Dans ce dernier cas, la prestation est encadrée et différente : elle est décrite sur la page consacrée à l'audit avant vente.",
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Le bâti avant les équipements',
      text: "C'est le principe que je défends depuis toujours : isoler et traiter l'étanchéité à l'air avant de dimensionner un système de chauffage. Une pompe à chaleur posée sur une enveloppe percée est surdimensionnée, plus chère à l'achat et décevante à l'usage.",
    },
    {
      type: 'steps',
      title: 'Comment je procède',
      steps: [
        {
          title: 'Relevé sur site',
          text: "Métré, composition des parois, menuiseries, ponts thermiques, systèmes de chauffage, d'eau chaude et de ventilation. Thermographie infrarouge si la saison le permet.",
        },
        {
          title: 'Analyse des usages',
          text: "Factures réelles, températures de consigne, occupation. Un audit qui ignore la façon dont vous vivez le logement produit des économies théoriques.",
        },
        {
          title: 'Modélisation et scénarios',
          text: 'Au moins deux scénarios de travaux, chiffrés, avec le gain énergétique attendu, le confort d’été et l’impact sur l’étiquette.',
        },
        {
          title: 'Restitution',
          text: 'Un rendez-vous pour parcourir le rapport ensemble. Vous devez pouvoir expliquer vos arbitrages à un artisan après ce rendez-vous.',
        },
      ],
    },
    {
      type: 'section',
      id: 'aides',
      title: 'Les aides financières',
      lead:
        'Le paysage des aides change presque chaque année. Les montants ci-dessous sont indicatifs et doivent être vérifiés au moment de votre projet.',
      body: [
        "Le point d'entrée officiel est France Rénov', service public de la rénovation de l'habitat, qui a remplacé l'ancien service FAIRE. Il oriente vers les aides nationales et locales et vous met en relation avec un conseiller.",
        {
          list: [
            "MaPrimeRénov' — aide nationale à la rénovation, avec un parcours par gestes et un parcours accompagné pour les rénovations d'ampleur",
            'Certificats d’économie d’énergie (CEE) — versés par les fournisseurs d’énergie, cumulables sous conditions',
            'Éco-prêt à taux zéro — pour financer le reste à charge',
            'Aides locales — commune, métropole, département : à vérifier au cas par cas',
          ],
        },
        "Pour les rénovations d'ampleur, un accompagnement par un opérateur agréé est requis, et l'audit énergétique en est la pièce d'entrée.",
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'À vérifier avant mise en ligne',
      text: "Cette section doit être relue à la date de publication : barèmes, plafonds de ressources, conditions de cumul et intitulés des dispositifs évoluent. Prévoir une relecture annuelle.",
    },
    {
      type: 'faq',
      title: 'Questions fréquentes',
      items: [
        {
          q: 'Quelle différence entre un DPE et un audit énergétique ?',
          a: "Le DPE établit une étiquette à partir d'une méthode conventionnelle. L'audit va beaucoup plus loin : il analyse le bâtiment réel, propose des scénarios de travaux chiffrés et les hiérarchise. Le DPE constate, l'audit conseille.",
        },
        {
          q: 'Combien de temps dure la visite ?',
          a: "Comptez une demi-journée sur site pour une maison individuelle, davantage si le bâtiment est complexe ou si un test d'infiltrométrie est réalisé dans la foulée.",
        },
        {
          q: 'Le rapport est-il accepté pour les aides ?',
          a: "Oui, dès lors que la prestation relève d'un audit réglementé et que le bureau d'études dispose de la qualification requise. Je vous confirme le cadre applicable avant le devis.",
        },
      ],
    },
    {
      type: 'cta',
      title: 'Un projet de rénovation ?',
      text: 'Dites-moi où vous en êtes : je vous indique si un audit est utile à ce stade, ou s’il vaut mieux attendre.',
      primary: { label: 'Demander un devis', href: '/contact/' },
      secondary: { label: '06 15 14 85 08', href: 'tel:+33615148508' },
    },
  ],
  status: 'draft',
  sitemapPriority: 0.9,
  auditNote:
    "Priorité 1 — Critique. Slug conservé pour préserver l'antériorité SEO. Volet aides à réactualiser à la date de publication.",
};

/**
 * Audit obligatoire avant vente — page à créer.
 * Cible la demande réglementaire (passoires F/G, puis E) : c'est le plus fort
 * volume de recherche du secteur, et l'ancien site ne le captait pas du tout.
 */
export const auditVente: Page = {
  slug: ['audit-energetique', 'vente'],
  navLabel: 'Audit avant vente',
  title: 'Audit énergétique obligatoire avant vente',
  seo: {
    title: 'Audit énergétique obligatoire avant vente — La Ciotat (13)',
    description:
      "Vous vendez une maison classée F, G ou E ? L'audit énergétique réglementaire est obligatoire dès la mise en vente. Intervention rapide dans les Bouches-du-Rhône.",
  },
  hero: {
    lead:
      "Depuis l'extension progressive de l'obligation aux logements les plus énergivores, l'audit énergétique réglementaire doit être remis à l'acquéreur dès la première visite. Sans lui, la vente se bloque chez le notaire.",
    primary: { label: 'Demander un devis', href: '/contact/' },
  },
  blocks: [
    {
      type: 'callout',
      tone: 'warning',
      title: 'Page à rédiger et à valider',
      text: "Contenu à créer. Vérifier à la date de rédaction : classes concernées et calendrier d'entrée en vigueur, logements exclus (monopropriété / copropriété), durée de validité du rapport, contenu réglementaire imposé et qualification exigée du prestataire.",
    },
    {
      type: 'section',
      title: 'Qui est concerné',
      body: [
        'À compléter : classes de DPE visées, type de logement, calendrier applicable.',
      ],
    },
    {
      type: 'section',
      title: 'Ce que contient le rapport',
      body: [
        "À compléter : état des lieux, au moins deux scénarios de travaux permettant d'atteindre les classes cibles, estimation des coûts et des économies, mention des aides.",
      ],
    },
    {
      type: 'section',
      title: 'Délai et déroulé',
      body: [
        'À compléter : délai de prise de rendez-vous, durée de la visite, délai de remise du rapport.',
      ],
    },
    {
      type: 'cta',
      title: 'Vous mettez un bien en vente ?',
      text: 'Indiquez-moi la commune, la surface et la classe DPE actuelle : je vous envoie un devis et une date.',
      primary: { label: 'Demander un devis', href: '/contact/' },
      secondary: { label: '06 15 14 85 08', href: 'tel:+33615148508' },
    },
  ],
  status: 'todo',
  sitemapPriority: 0.9,
  auditNote:
    'À créer. Fort volume de recherche — page à traiter en priorité une fois le cadre réglementaire vérifié.',
};
