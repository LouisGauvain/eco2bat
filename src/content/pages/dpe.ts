import type { Page } from '../types';

/** DPE — maquette « DPE » du dossier Refonte Eco2bat. */
export const dpe: Page = {
  slug: ['dpe'],
  navLabel: 'DPE',
  title: 'Diagnostic de Performance Énergétique (DPE)',
  seo: {
    title: "DPE La Ciotat — Diagnostic de Performance Énergétique",
    description:
      "DPE exigé pour la vente ou la location, et repère pour mesurer une rénovation. Diagnostiqueur certifié à La Ciotat : maison, collectif, tertiaire.",
    keywords: [
      'Diagnostic de Performance Énergétique',
      'DPE',
      'DPE La Ciotat',
      'Diagnostic énergie',
      'DPE immeuble collectif',
      'DPE tertiaire',
      'Rénovation énergétique',
    ],
  },
  hero: {
    eyebrow: 'Nos missions',
    lead:
      "Le DPE de logement est exigé pour la vente ou la mise en location d'un bien. Au-delà de la nécessité réglementaire, ce diagnostic peut être un outil précieux pour mesurer l'efficacité énergétique de telle ou telle action de rénovation.",
    image: {
      url: '/etiquette-dpe.png',
      alt: 'Étiquette énergie du DPE',
      width: 458,
      height: 368,
    },
  },
  blocks: [
    {
      type: 'steps',
      eyebrow: 'Ce que comprend le DPE',
      title: 'Quel que soit le logement étudié, le DPE implique :',
      steps: [
        { title: 'Le recensement des isolations et des équipements thermiques en place', text: '' },
        { title: "La modélisation thermique de l'état existant", text: '' },
        {
          title: "Des propositions de travaux de rénovation et le calcul de l'efficacité sur l'état initial",
          text: '',
        },
        { title: 'Un compte rendu au format PDF', text: '' },
      ],
    },
    {
      type: 'panels',
      panels: [
        {
          eyebrow: 'Immeubles collectifs',
          title: 'Un DPE collectif à actualiser tous les dix ans',
          body: [
            "Selon leur nombre de lots, les immeubles de logements collectifs de plus de 10 ans doivent pouvoir présenter un DPE, et l'actualiser tous les 10 ans. Ces contraintes réglementaires ont pour objectif d'inciter les propriétaires à mener une rénovation énergétique de leurs biens.",
          ],
        },
        {
          eyebrow: 'Bon à savoir',
          title: 'Ce que la méthode 3CL ne dit pas',
          body: [
            "En immeuble collectif, la méthode de calcul (3CL) imposée par le DPE ne permet pas toujours de modéliser le fonctionnement des occupants et des matériels en place : les consommations et dépenses modélisées peuvent être assez éloignées de la situation réelle. Pour le tertiaire, le DPE est basé sur des factures d'énergie — ce n'est pas un outil adapté pour mener un projet de rénovation : préférez l'audit énergétique.",
          ],
        },
      ],
    },
    {
      type: 'cards',
      eyebrow: 'Missions liées',
      title: 'Au-delà du DPE',
      cards: [
        {
          title: 'Audit énergétique logement',
          text: "Obligatoire en plus du DPE pour vendre une maison individuelle ou un immeuble en monopropriété classé E, F ou G.",
          href: '/audit-energetique/',
        },
        {
          title: 'Rénovation énergétique',
          text: "Le DPE mesure l'existant ; le conseil en rénovation ordonne les travaux et leurs opportunités.",
          href: '/renovation-energetique/',
        },
        {
          title: 'Mesures physiques du bâtiment',
          text: "Quand le calcul réglementaire s'éloigne du réel, la mesure sur site tranche.",
          href: '/mesure-physique-du-batiment/',
        },
      ],
    },
    {
      type: 'cta',
      title: 'Nous répondons aux besoins réglementaires qui vous incombent',
      text: 'Comme à vos démarches volontaires de rénovation énergétique.',
      primary: { label: 'Demander un DPE', href: '#contact' },
    },
  ],
  status: 'draft',
  sitemapPriority: 0.9,
};
