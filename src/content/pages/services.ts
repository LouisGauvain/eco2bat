import type { Page } from '../types';

/**
 * DPE — page à créer.
 * L'offre DPE maison, immeuble et tertiaire était annoncée dans les
 * métadonnées de l'ancien site mais n'avait aucune page. Prestation
 * facturable, totalement invisible en référencement.
 */
export const dpe: Page = {
  slug: ['dpe'],
  navLabel: 'DPE',
  title: 'DPE — maison, immeuble et tertiaire',
  seo: {
    title: 'DPE maison, immeuble et tertiaire — La Ciotat (13)',
    description:
      "Diagnostic de performance énergétique pour logement individuel, immeuble collectif ou local tertiaire. Bureau d'études indépendant à La Ciotat.",
  },
  hero: {
    lead:
      "Le DPE établit l'étiquette énergétique et climatique d'un bien. Je le réalise pour les maisons, pour les immeubles entiers et pour les locaux tertiaires.",
    primary: { label: 'Demander un devis', href: '/contact/' },
  },
  blocks: [
    {
      type: 'callout',
      tone: 'warning',
      title: 'Page à rédiger et à valider',
      text: "Contenu à créer. À confirmer avec le client : quelles catégories de DPE sont effectivement réalisées en 2026, et sous quelle certification. Vérifier les obligations de certification du diagnostiqueur, distinctes de la qualification bureau d'études.",
    },
    {
      type: 'cards',
      title: 'Trois prestations distinctes',
      cards: [
        {
          title: 'DPE logement',
          text: 'À compléter : maison individuelle ou appartement, cas de la vente et de la location, durée de validité.',
        },
        {
          title: 'DPE immeuble collectif',
          text: 'À compléter : DPE à l’échelle du bâtiment, articulation avec les obligations de copropriété.',
          href: '/coproprietes/',
        },
        {
          title: 'DPE tertiaire',
          text: 'À compléter : bureaux, commerces, bâtiments publics.',
        },
      ],
    },
    {
      type: 'section',
      title: 'DPE ou audit énergétique ?',
      body: [
        "Le DPE constate et classe. L'audit analyse et propose un chemin de travaux. Si votre objectif est de vendre, c'est le DPE — et parfois l'audit réglementaire. Si votre objectif est de rénover, c'est l'audit.",
        'En cas de doute, décrivez-moi votre situation : je vous oriente vers la prestation utile, y compris si ce n’est pas la plus chère.',
      ],
    },
    {
      type: 'cta',
      title: 'Un DPE à faire réaliser ?',
      text: 'Indiquez le type de bien, la surface et la commune.',
      primary: { label: 'Demander un devis', href: '/contact/' },
      secondary: { label: '06 15 14 85 08', href: 'tel:+33615148508' },
    },
  ],
  status: 'todo',
  sitemapPriority: 0.8,
  auditNote:
    'Priorité 2 — Haute. À créer. Prestation annoncée dans les meta de l’ancien site sans page correspondante.',
};

/**
 * Formation artisans — page à créer.
 * L'offre existait, mais noyée en bas de la page Infiltrométrie alors que
 * c'est une prestation à part entière et une source de prescription.
 */
export const formationArtisans: Page = {
  slug: ['formation-artisans'],
  navLabel: 'Formation artisans',
  title: "Formation à l'étanchéité à l'air sur chantier",
  seo: {
    title: "Formation étanchéité à l'air pour artisans — sur chantier (13, 83)",
    description:
      "Formation courte et concrète à l'étanchéité à l'air, sur votre chantier, avec porte soufflante et caméra infrarouge. Pour équipes de construction et de rénovation.",
  },
  hero: {
    lead:
      "L'étanchéité à l'air ne se joue pas dans un bureau : elle se joue sur quelques gestes, à quelques endroits précis, que personne n'a jamais montrés aux compagnons. Je viens les montrer, sur votre chantier.",
    primary: { label: 'Organiser une session', href: '/contact/' },
  },
  blocks: [
    {
      type: 'section',
      title: 'Le principe',
      body: [
        "Une demi-journée sur un chantier en cours, avec les équipes qui y travaillent. On met le bâtiment en dépression et chacun va toucher les fuites de sa propre main.",
        "C'est cette démonstration physique qui change les pratiques : un compagnon qui a senti l'air passer par un passage de gaine ne le laisse plus jamais ouvert.",
      ],
    },
    {
      type: 'section',
      title: 'Ce que l’on couvre',
      body: [
        {
          list: [
            "Où se situent réellement les fuites, corps d'état par corps d'état",
            'Les produits et les gestes qui tiennent dans le temps, et ceux qui décollent au bout de deux ans',
            'La chronologie du chantier : qui doit faire quoi, et dans quel ordre',
            'La lecture d’un rapport d’infiltrométrie',
          ],
        },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'À valider avec le client',
      text: 'Format exact, durée, tarif, effectif maximum, et statut de la formation : action de formation déclarée avec possibilité de prise en charge, ou prestation de conseil ? La réponse change la rédaction et les mentions obligatoires de cette page.',
    },
    {
      type: 'cta',
      title: 'Former vos équipes',
      text: 'Décrivez votre activité et le nombre de personnes à former : je vous propose un format et un tarif.',
      primary: { label: 'Me contacter', href: '/contact/' },
      secondary: { label: '06 15 14 85 08', href: 'tel:+33615148508' },
    },
  ],
  status: 'todo',
  sitemapPriority: 0.7,
  auditNote:
    'À créer. Extraite de la page Infiltrométrie où elle était invisible. Source de prescription auprès des artisans.',
};

/**
 * Copropriétés — page à créer.
 * DTG et audit de copropriété étaient annoncés dans les métadonnées sans page
 * correspondante, alors que la qualification OPQIBI copropriété existe déjà.
 */
export const coproprietes: Page = {
  slug: ['coproprietes'],
  navLabel: 'Copropriétés',
  title: 'Copropriétés — DTG et audit énergétique',
  seo: {
    title: 'DTG et audit énergétique de copropriété — La Ciotat, Marseille',
    description:
      "Diagnostic technique global et audit énergétique de copropriété : état du bâti, plan pluriannuel de travaux, accompagnement du conseil syndical en assemblée générale.",
  },
  hero: {
    lead:
      "En copropriété, la difficulté n'est pas technique : elle est décisionnelle. Un rapport n'a de valeur que s'il permet à une assemblée générale de voter des travaux en connaissance de cause.",
    primary: { label: 'Demander un devis', href: '/contact/' },
  },
  blocks: [
    {
      type: 'callout',
      tone: 'warning',
      title: 'Page à rédiger et à valider',
      text: "Contenu à créer. À vérifier : obligations applicables aux copropriétés (DTG, PPT, DPE collectif) et leur calendrier, ainsi que la qualification OPQIBI détenue et son périmètre exact.",
    },
    {
      type: 'cards',
      title: 'Prestations',
      cards: [
        {
          title: 'Diagnostic technique global (DTG)',
          text: "À compléter : état apparent des parties communes et des équipements, situation au regard des obligations, évaluation sommaire des travaux et de leur coût.",
        },
        {
          title: 'Audit énergétique de copropriété',
          text: 'À compléter : analyse des consommations, scénarios de rénovation, aides mobilisables à l’échelle du syndicat.',
        },
        {
          title: 'Assistance au conseil syndical',
          text: 'À compléter : aide à la rédaction du cahier des charges, analyse des devis, présentation en assemblée générale.',
        },
      ],
    },
    {
      type: 'section',
      title: 'Ma façon de travailler avec un conseil syndical',
      body: [
        "Je présente les résultats en assemblée générale quand c'est utile. Un rapport de cent pages remis au syndic ne fait voter personne ; vingt minutes d'explication en séance, si.",
        "Je ne recommande jamais d'entreprise de travaux et je n'ai aucun lien avec les entreprises consultées. C'est la condition pour que mon analyse des devis ait la moindre valeur devant l'assemblée.",
      ],
    },
    {
      type: 'cta',
      title: 'Syndic ou conseil syndical ?',
      text: 'Indiquez le nombre de lots, l’année de construction et l’échéance de votre AG.',
      primary: { label: 'Demander un devis', href: '/contact/' },
      secondary: { label: '06 15 14 85 08', href: 'tel:+33615148508' },
    },
  ],
  status: 'todo',
  sitemapPriority: 0.8,
  auditNote:
    'Priorité 2 — Haute. À créer. Cible syndics et conseils syndicaux. La certification OPQIBI copropriété existe déjà.',
};

/**
 * Diagnostic logement — réécriture de l'ancienne page /particuliers/.
 * Page non modifiée depuis 2013 mais qualifiée de « mine d'or » par l'audit :
 * c'est la seule qui décrivait l'offre réelle. Ses sept prestations servent de
 * sommaire vers les pages de service. Le slug est aligné sur le libellé de menu.
 */
export const diagnosticLogement: Page = {
  slug: ['diagnostic-logement'],
  navLabel: 'Diagnostic logement',
  title: 'Diagnostic logement pour les particuliers',
  seo: {
    title: 'Diagnostic logement pour particuliers — La Ciotat et alentours',
    description:
      "Inconfort, factures élevées, projet d'achat ou de rénovation : diagnostic sur mesure de votre logement par un ingénieur indépendant. La Ciotat, Bouches-du-Rhône et Var.",
  },
  hero: {
    lead:
      "Vous n'avez pas forcément besoin d'une prestation réglementaire. Souvent, vous avez besoin qu'on vienne regarder votre logement et qu'on vous dise ce qui se passe.",
    primary: { label: 'Décrire ma situation', href: '/contact/' },
  },
  blocks: [
    {
      type: 'section',
      title: 'Vous voulez…',
      body: [
        {
          list: [
            'comprendre pourquoi vous avez froid alors que le chauffage tourne',
            'savoir si le bien que vous visitez est un gouffre ou une bonne affaire',
            'arbitrer entre isoler, changer les fenêtres ou changer la chaudière',
            'vérifier qu’un devis d’artisan correspond à un besoin réel',
            'régler un problème d’humidité, de condensation ou de moisissures',
          ],
        },
      ],
    },
    {
      type: 'steps',
      title: 'Ma démarche',
      steps: [
        {
          title: 'Écouter',
          text: 'Ce que vous constatez, depuis quand, dans quelles pièces. Le diagnostic commence par votre récit.',
        },
        {
          title: 'Observer',
          text: 'Visite complète du logement : bâti, équipements, ventilation, usages.',
        },
        {
          title: 'Mesurer',
          text: 'Selon le cas : thermographie infrarouge, infiltrométrie, enregistrement de température et d’humidité sur plusieurs jours.',
        },
        {
          title: 'Expliquer',
          text: 'Un compte rendu écrit et un échange. Vous devez comprendre le pourquoi, pas seulement lire une conclusion.',
        },
        {
          title: 'Prioriser',
          text: 'Ce qu’il faut faire d’abord, ce qui peut attendre, et ce qui ne sert à rien. Cette dernière liste est souvent la plus utile.',
        },
      ],
    },
    {
      type: 'cards',
      title: 'Prestations pour les particuliers',
      lead: 'Chaque situation ne demande pas la même intervention.',
      cards: [
        {
          title: 'Audit énergétique',
          text: 'Pour préparer une rénovation d’ampleur et mobiliser les aides.',
          href: '/audit-energetique/',
        },
        {
          title: 'Audit avant vente',
          text: 'Obligation réglementaire pour les logements les plus énergivores.',
          href: '/audit-energetique/vente/',
        },
        {
          title: 'DPE',
          text: 'Étiquette énergie et climat pour une vente ou une location.',
          href: '/dpe/',
        },
        {
          title: 'Infiltrométrie et thermographie',
          text: 'Pour localiser précisément les fuites d’air et les défauts d’isolation.',
          href: '/infiltrometrie/',
        },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'À valider avec le client',
      text: "L'ancienne page listait sept prestations sur mesure (dont assistance à maîtrise d'ouvrage et accompagnement de projet). Confirmer lesquelles sont encore proposées en 2026 avant de compléter cette page.",
    },
    {
      type: 'cta',
      title: 'Décrivez-moi votre logement',
      text: 'Un premier échange téléphonique suffit souvent à savoir de quoi vous avez besoin. Il est gratuit.',
      primary: { label: 'Me contacter', href: '/contact/' },
      secondary: { label: '06 15 14 85 08', href: 'tel:+33615148508' },
    },
  ],
  status: 'draft',
  sitemapPriority: 0.8,
  auditNote:
    'Priorité 2 — Haute. Réécriture de /particuliers/ (301 en place). Contenu de 2013 : offre à revalider.',
};
