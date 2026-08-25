import type { Page } from '../types';
import { site } from '../site';

/**
 * Pages légales — à créer.
 * L'ancien site n'avait ni mentions légales, ni politique de confidentialité,
 * ni information RGPD : obligation LCEN et RGPD non remplie, risque direct
 * pour le client. Ces deux pages sont bloquantes pour la mise en ligne.
 *
 * Les textes ci-dessous sont une trame de travail, pas un document validé.
 * Les champs entre crochets doivent être renseignés avec les informations
 * réelles avant publication.
 */

const address = `${site.address.street}, ${site.address.postalCode} ${site.address.city}`;

export const mentionsLegales: Page = {
  slug: ['mentions-legales'],
  navLabel: 'Mentions légales',
  title: 'Mentions légales',
  seo: {
    title: 'Mentions légales — ECO2BAT',
    description:
      'Éditeur, hébergeur et informations légales du site eco2bat.fr.',
  },
  blocks: [
    {
      type: 'callout',
      tone: 'warning',
      title: 'Trame à compléter avant mise en ligne',
      text: "Renseigner les champs entre crochets à partir de l'extrait Kbis ou de l'avis de situation SIRENE, et faire relire l'ensemble par le client. Cette page conditionne la conformité LCEN du site.",
    },
    {
      type: 'section',
      title: 'Éditeur du site',
      body: [
        {
          list: [
            `Dénomination : ${site.legalName}`,
            `Forme juridique : [à compléter]`,
            `Siège social : ${address}`,
            `SIRET : [à compléter] — RCS [ville] [numéro]`,
            `Numéro de TVA intracommunautaire : [à compléter]`,
            `Capital social : [à compléter, le cas échéant]`,
            `Directeur de la publication : ${site.owner.name}`,
            `Téléphone : ${site.contact.phone}`,
            `Courriel : ${site.contact.email}`,
          ],
        },
      ],
    },
    {
      type: 'section',
      title: 'Assurance professionnelle',
      body: [
        'Responsabilité civile professionnelle souscrite auprès de [assureur], police n° [numéro]. Couverture géographique : [à compléter].',
      ],
    },
    {
      type: 'section',
      title: 'Hébergement',
      body: [
        "Le site est hébergé par Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlande, dans le cadre du service Firebase App Hosting de Google Cloud Platform.",
      ],
    },
    {
      type: 'section',
      title: 'Propriété intellectuelle',
      body: [
        "L'ensemble des contenus de ce site — textes, photographies, schémas, rapports d'exemple — est protégé par le droit d'auteur. Toute reproduction, même partielle, est soumise à autorisation écrite préalable.",
      ],
    },
    {
      type: 'section',
      title: 'Signalement',
      body: [
        `Pour signaler un contenu illicite ou une erreur sur ce site, écrivez à ${site.contact.email}.`,
      ],
    },
  ],
  status: 'todo',
  sitemapPriority: 0.1,
  auditNote:
    'Priorité 1 — Critique. Obligation LCEN non remplie sur l’ancien site. Bloquant pour la mise en ligne.',
};

export const politiqueConfidentialite: Page = {
  slug: ['politique-de-confidentialite'],
  navLabel: 'Politique de confidentialité',
  title: 'Politique de confidentialité',
  seo: {
    title: 'Politique de confidentialité — ECO2BAT',
    description:
      'Données personnelles collectées sur eco2bat.fr, finalités, durées de conservation et exercice de vos droits.',
  },
  blocks: [
    {
      type: 'callout',
      tone: 'warning',
      title: 'Trame à compléter et à faire valider',
      text: "Ce texte décrit le traitement réellement mis en œuvre par le site (formulaire de contact stocké dans Firebase). Il doit être relu et validé par le client, et mis à jour si un outil de mesure d'audience est ajouté.",
    },
    {
      type: 'section',
      title: 'Responsable de traitement',
      body: [
        `${site.legalName}, ${address}. Contact : ${site.contact.email} — ${site.contact.phone}.`,
      ],
    },
    {
      type: 'section',
      title: 'Données collectées et finalités',
      body: [
        'Le site ne collecte de données que lorsque vous remplissez volontairement le formulaire de contact.',
        {
          list: [
            'Identité et coordonnées (nom, courriel, téléphone) — pour vous répondre',
            'Description de votre projet (type de prestation, type de bien, commune, échéance) — pour qualifier la demande et établir un devis',
            'Date de la demande — pour le suivi commercial',
          ],
        },
        "La base légale est votre consentement, matérialisé par l'envoi du formulaire, ainsi que l'exécution de mesures précontractuelles prises à votre demande.",
      ],
    },
    {
      type: 'section',
      title: 'Destinataires et sous-traitants',
      body: [
        "Vos données ne sont ni vendues, ni transmises à des fins commerciales. Elles sont accessibles au seul gérant du bureau d'études.",
        "Elles sont hébergées par Google Cloud Platform (Firebase) au sein de l'Union européenne. Google Ireland Limited agit en qualité de sous-traitant.",
      ],
    },
    {
      type: 'section',
      title: 'Durée de conservation',
      body: [
        {
          list: [
            'Demande sans suite : 12 mois à compter du dernier échange',
            'Demande ayant donné lieu à un devis ou une mission : durée de la relation commerciale, puis archivage selon les obligations comptables et de garantie applicables',
          ],
        },
      ],
    },
    {
      type: 'section',
      title: 'Vos droits',
      body: [
        `Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité. Pour l'exercer, écrivez à ${site.contact.email} en justifiant de votre identité. Une réponse vous sera apportée dans un délai d'un mois.`,
        "Si la réponse ne vous satisfait pas, vous pouvez saisir la CNIL : 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07 — cnil.fr.",
      ],
    },
    {
      type: 'section',
      title: 'Cookies et mesure d’audience',
      body: [
        "En l'état, ce site ne dépose aucun cookie de mesure d'audience ni de publicité. Seuls des cookies strictement nécessaires au fonctionnement peuvent être utilisés ; ils ne requièrent pas de consentement.",
        "Si une solution de mesure d'audience est ajoutée par la suite, cette page devra être mise à jour et un bandeau de consentement mis en place.",
      ],
    },
  ],
  status: 'todo',
  sitemapPriority: 0.1,
  auditNote:
    'Priorité 1 — Critique. Obligation RGPD non remplie sur l’ancien site. Bloquant pour la mise en ligne.',
};
