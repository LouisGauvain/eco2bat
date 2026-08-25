import type { Page } from '../types';
import { site } from '../site';

/**
 * À propos — réécriture de l'ancienne page « Moyens ».
 * Le titre ne voulait rien dire pour un visiteur et le slug (/moyens-2/) était
 * un résidu technique. C'était pourtant la seule page qui établissait une
 * crédibilité : gérant identifié, formation d'ingénieur, matériel en propre.
 * Elle devient la page de confiance du site.
 */
export const aPropos: Page = {
  slug: ['a-propos'],
  navLabel: 'À propos',
  title: 'Le bureau d’études',
  seo: {
    title: 'ECO2BAT — bureau d’études indépendant à La Ciotat',
    description:
      "Pierre-Yves Venaille, ingénieur Arts et Métiers : parcours, indépendance, qualifications RGE et OPQIBI, matériel de mesure. Bureau d'études unipersonnel à La Ciotat.",
  },
  hero: {
    lead:
      "ECO2BAT est un bureau d'études unipersonnel. C'est une contrainte assumée : je ne prends que les missions que je peux mener moi-même, du premier appel au rapport final.",
  },
  blocks: [
    {
      type: 'section',
      title: 'Qui je suis',
      body: [
        `${site.owner.name}, ${site.owner.role.toLowerCase()}. J'ai créé ECO2BAT pour exercer un métier simple : mesurer, comprendre et expliquer le comportement énergétique des bâtiments.`,
        "Le nom vient de trois mots : économie, écologie, bâtiment. Les deux premiers ne s'opposent pas dans mon métier — un bâtiment sobre est un bâtiment moins cher à vivre.",
        {
          h3: 'Ce que je ne fais pas',
        },
        "Je ne vends aucun équipement, je ne pose aucun travaux et je ne perçois aucune commission d'installateur. Cette indépendance est la seule chose qui donne du poids à mes conclusions.",
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'À compléter avec le client',
      text: "Année de création du bureau d'études, parcours professionnel avant ECO2BAT, numéros et dates de validité des qualifications RGE et OPQIBI, photo du gérant, assurance responsabilité civile professionnelle (assureur et numéro de police).",
    },
    {
      type: 'section',
      title: 'Qualifications',
      body: [
        'À compléter : intitulés exacts, organismes certificateurs, numéros et validité.',
        {
          list: site.certifications.map((c) => `${c.label} — ${c.detail}`),
        },
      ],
    },
    {
      type: 'section',
      title: 'Le matériel',
      lead:
        'Tout le matériel de mesure m’appartient : aucune intervention n’est sous-traitée.',
      body: [
        {
          list: [
            'Caméra thermique infrarouge — localisation des défauts d’isolation et des fuites d’air',
            'Porte soufflante — mesure de la perméabilité à l’air de l’enveloppe',
            'Enregistreurs de température et d’humidité — suivi sur plusieurs jours des ambiances intérieures',
            'Instruments de mesure de débit et d’ambiance',
          ],
        },
        "L'inventaire détaillé de l'ancienne page (modèles et références) est à réactualiser : une partie du matériel listé date de la création du bureau d'études.",
      ],
    },
    {
      type: 'section',
      title: 'Zone d’intervention',
      body: [
        `Basé à ${site.address.city}, j'interviens principalement dans les ${site.serviceArea.join(' et le ')}.`,
        'Au-delà, le déplacement doit avoir un sens économique pour vous : je vous le dis franchement lors du premier échange.',
      ],
    },
    {
      type: 'cta',
      title: 'Une question sur une mission ?',
      text: 'Le premier échange est gratuit et sans engagement.',
      primary: { label: 'Me contacter', href: '/contact/' },
      secondary: { label: site.contact.phone, href: `tel:${site.contact.phoneE164}` },
    },
  ],
  status: 'draft',
  sitemapPriority: 0.6,
  auditNote:
    'Priorité 2 — Haute. Réécriture de /moyens-2/ (301 en place). Seule page de crédibilité du site : à compléter en priorité avec les éléments réels.',
};
