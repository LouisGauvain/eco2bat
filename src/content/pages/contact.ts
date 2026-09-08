import type { Page } from '../types';

/**
 * Contact.
 *
 * Le formulaire s'ouvre aussi en widget depuis n'importe quelle page, mais
 * « contact » reste l'une des adresses les plus demandées et les plus
 * cherchées dans un menu : elle a donc sa page, indexable et partageable.
 *
 * Route dédiée (`src/app/(site)/contact/page.tsx`) parce qu'elle embarque le
 * formulaire et les coordonnées éditables ; le texte qui l'entoure vient d'ici
 * et se modifie depuis le back-office comme celui des autres pages.
 */
export const contact: Page = {
  slug: ['contact'],
  navLabel: 'Contact',
  title: 'Parlons de votre projet',
  seo: {
    title: 'Contact — ECO2BAT, bureau d’études à La Ciotat',
    description:
      "Décrivez votre projet en deux minutes : prestation, bien concerné, commune et échéance. Par téléphone au 06 15 14 85 08. La Ciotat et PACA.",
    keywords: ['Contact ECO2BAT', "Bureau d'études énergie La Ciotat", 'Devis audit énergétique'],
  },
  hero: {
    eyebrow: 'Contact',
    lead:
      "Plus votre demande est précise, plus notre réponse le sera. Le formulaire ci-dessous nous permet de vous répondre par une orientation claire et, le cas échéant, un devis — plutôt que par une demande d'informations complémentaires.",
  },
  blocks: [],
  status: 'draft',
  customRoute: true,
  sitemapPriority: 0.9,
};
