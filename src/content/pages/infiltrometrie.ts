import type { Page } from '../types';

/**
 * Infiltrométrie — conservée et enrichie.
 * L'explication du principe (fausse porte, ventilateur, dépression équivalente
 * à un vent de force 4/5) était la meilleure vulgarisation du site : elle est
 * reprise telle quelle. Deux changements : la page absorbe l'ancienne
 * sous-page « Rénovation », trop courte et redondante, et l'offre de formation
 * artisans en sort pour devenir une page à part entière.
 */
export const infiltrometrie: Page = {
  slug: ['infiltrometrie'],
  navLabel: 'Infiltrométrie',
  title: "Test d'infiltrométrie et mesure de perméabilité à l'air",
  seo: {
    title: "Test d'infiltrométrie (porte soufflante) — La Ciotat et Var",
    description:
      "Mesure de l'étanchéité à l'air par porte soufflante, en construction neuve RE2020 comme en rénovation. Localisation des fuites à la caméra infrarouge.",
  },
  hero: {
    lead:
      "Une maison peut être parfaitement isolée et rester inconfortable : l'air passe par les défauts de mise en œuvre, pas par l'isolant. Le test d'infiltrométrie mesure ces fuites et, surtout, les localise.",
    primary: { label: 'Demander un devis', href: '/contact/' },
    secondary: { label: 'Construction neuve (RE2020)', href: '/infiltrometrie/construction-neuve/' },
  },
  blocks: [
    {
      type: 'section',
      title: 'Le principe de la mesure',
      body: [
        "On remplace une porte extérieure par une fausse porte étanche équipée d'un ventilateur calibré. Le ventilateur met le bâtiment en dépression et l'on mesure le débit d'air nécessaire pour maintenir cette dépression.",
        "La dépression appliquée correspond à peu près à ce que subirait la façade sous un vent de force 4 à 5, soit environ 35 km/h. Tout l'air qui entre alors dans le logement passe par des défauts d'étanchéité.",
        "Le résultat s'exprime par un indicateur de fuite rapporté à la surface de l'enveloppe. C'est ce chiffre qui est comparé au seuil réglementaire en construction neuve.",
      ],
    },
    {
      type: 'section',
      title: 'Le chiffre ne suffit pas : il faut trouver les fuites',
      body: [
        "Un rapport qui se contente d'annoncer une valeur ne sert à rien si le seuil n'est pas atteint. Pendant la mise en dépression, je parcours le bâtiment pour identifier les points de fuite : jonctions murs-plancher, passages de gaines, trappes, menuiseries, coffres de volets roulants.",
        'La caméra infrarouge complète la recherche en rendant visibles les entrées d’air froid, ce que l’œil et la main ne détectent pas toujours.',
        'Vous repartez avec une liste de points à reprendre, localisés et photographiés, et non avec une simple note.',
      ],
    },
    {
      type: 'cards',
      title: 'Deux usages, deux cadres',
      cards: [
        {
          title: 'Construction neuve — RE2020',
          text: "La mesure est obligatoire à la réception. L'accompagnement en amont évite d'avoir à corriger dans l'urgence une maison déjà finie.",
          href: '/infiltrometrie/construction-neuve/',
        },
        {
          title: 'Rénovation',
          text: "Aucune obligation, mais un outil de projet : la mesure et la caméra infrarouge disent où l'enveloppe perd réellement, avant de décider des travaux.",
        },
      ],
    },
    {
      type: 'section',
      id: 'renovation',
      title: "Ce que la mesure apporte en rénovation",
      body: [
        "En rénovation, l'infiltrométrie n'est pas une formalité : c'est un outil de diagnostic. Elle transforme une intuition — « il y a des courants d'air » — en points précis à traiter.",
        "Associée à la thermographie, elle distingue deux problèmes qu'on confond souvent : un défaut d'isolation, qui se voit en surface froide continue, et une fuite d'air, qui se voit en traînée. Les travaux à engager ne sont pas les mêmes.",
        "C'est aussi une mesure de contrôle : refaire un test après travaux vérifie que ce qui a été payé a été effectivement obtenu.",
      ],
    },
    {
      type: 'cta',
      title: 'Besoin d’un test ?',
      text: 'Précisez la surface, la commune et l’échéance : je vous propose une date et un devis.',
      primary: { label: 'Demander un devis', href: '/contact/' },
      secondary: { label: '06 15 14 85 08', href: 'tel:+33615148508' },
    },
  ],
  status: 'draft',
  sitemapPriority: 0.9,
  auditNote:
    'Priorité 2 — Haute. Slug conservé. Absorbe /infiltrometrie/renovation/. La liste de villes en bas de page a été supprimée (bourrage de mots-clés).',
};

/**
 * Construction neuve (RE2020) — refonte totale de l'ancienne page Neuf-RT2012.
 * La page était entièrement obsolète : la RT2012 est remplacée par la RE2020,
 * et la norme abrogée figurait jusque dans le slug, le H2 et les métadonnées.
 * Le découpage en trois temps (conception, chantier, réception) était en
 * revanche pertinent et structure la nouvelle page.
 */
export const infiltrometrieNeuf: Page = {
  slug: ['infiltrometrie', 'construction-neuve'],
  navLabel: 'Construction neuve (RE2020)',
  title: "Infiltrométrie en construction neuve — RE2020",
  seo: {
    title: 'Test infiltrométrie RE2020 construction neuve — Bouches-du-Rhône',
    description:
      "Mesure d'étanchéité à l'air obligatoire à la réception en RE2020. Accompagnement des constructeurs et maîtres d'œuvre : conception, sensibilisation chantier, mesure finale.",
  },
  hero: {
    lead:
      "En construction neuve, la mesure de perméabilité à l'air est une obligation à la réception. La subir en fin de chantier coûte cher ; la préparer coûte peu.",
    primary: { label: 'Demander un devis', href: '/contact/' },
  },
  blocks: [
    {
      type: 'callout',
      tone: 'warning',
      title: 'À vérifier avant mise en ligne',
      text: "Contrôler les références réglementaires RE2020 citées : seuils applicables selon le type de bâtiment, modalités de justification, et cas des maisons individuelles en secteur diffus.",
    },
    {
      type: 'steps',
      title: 'Un accompagnement en trois temps',
      steps: [
        {
          title: 'Ajuster en conception',
          text: "Relecture des plans et des détails d'exécution pour identifier les points singuliers avant qu'ils ne soient construits : jonctions, traversées, seuils, liaisons menuiseries.",
        },
        {
          title: 'Sensibiliser en chantier',
          text: "Intervention courte sur site avec les corps d'état concernés. L'étanchéité à l'air se joue sur des gestes simples que personne n'a jamais expliqués aux compagnons.",
        },
        {
          title: 'Mesurer à la réception',
          text: 'Test final conforme, rapport de mesure exploitable pour la justification réglementaire, et localisation des fuites résiduelles s’il en reste.',
        },
      ],
    },
    {
      type: 'section',
      title: 'Le test intermédiaire, celui qui fait la différence',
      body: [
        "La mesure réglementaire arrive à la réception, quand tout est fini : si le seuil n'est pas atteint, il faut rouvrir des ouvrages terminés.",
        "Un test intermédiaire, réalisé une fois le pare-vapeur posé et avant la pose des doublages, permet de corriger quand tout est encore accessible. C'est le moment où une reprise coûte quelques mètres d'adhésif au lieu d'une dépose de plaques.",
      ],
    },
    {
      type: 'cards',
      title: 'Pack contrôle constructeurs',
      lead: 'Formule destinée aux constructeurs et maîtres d’œuvre suivant plusieurs opérations par an.',
      cards: [
        {
          title: 'Test intermédiaire',
          text: 'Sur l’enveloppe fermée, avant doublages. Correction possible sans casse.',
        },
        {
          title: 'Test de réception',
          text: 'Mesure réglementaire et rapport de justification.',
        },
        {
          title: 'Formation des équipes',
          text: 'Une demi-journée sur chantier avec vos compagnons.',
          href: '/formation-artisans/',
        },
      ],
    },
    {
      type: 'cta',
      title: 'Vous construisez plusieurs logements par an ?',
      text: 'Parlons d’une formule annuelle plutôt que d’une intervention au coup par coup.',
      primary: { label: 'Me contacter', href: '/contact/' },
      secondary: { label: '06 15 14 85 08', href: 'tel:+33615148508' },
    },
  ],
  status: 'todo',
  sitemapPriority: 0.8,
  auditNote:
    'Priorité 1 — Critique. Nouveau slug avec 301 depuis /infiltrometrie/neuf-rt-2012/. Références RE2020 à faire valider.',
};
