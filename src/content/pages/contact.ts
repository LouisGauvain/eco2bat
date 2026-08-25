import type { Page } from '../types';

/**
 * Contact — refonte totale.
 * L'ancienne page se limitait à un bloc d'adresse : aucun formulaire, aucune
 * carte, aucun horaire, aucun délai de réponse annoncé, et l'adresse e-mail en
 * clair (donc aspirée par les robots de spam). Le visiteur intéressé n'avait
 * aucun chemin vers la prise de contact.
 *
 * Cette page a sa propre route (`src/app/contact/page.tsx`) car elle embarque
 * le formulaire qualifiant. Les blocs ci-dessous décrivent le contenu
 * rédactionnel qui l'entoure.
 */
export const contact: Page = {
  slug: ['contact'],
  navLabel: 'Contact',
  title: 'Me contacter',
  seo: {
    title: 'Contact — ECO2BAT, bureau d’études à La Ciotat (13)',
    description:
      "Décrivez votre projet en deux minutes : type de prestation, bien concerné, commune et échéance. Réponse sous 48 heures ouvrées. Téléphone : 06 15 14 85 08.",
  },
  hero: {
    lead:
      "Plus votre demande est précise, plus ma réponse le sera. Le formulaire ci-dessous me permet de vous répondre avec une orientation claire et, le cas échéant, un devis — plutôt qu'avec une demande d'informations complémentaires.",
  },
  blocks: [],
  status: 'draft',
  customRoute: true,
  sitemapPriority: 0.9,
  auditNote:
    'Priorité 1 — Critique. Formulaire qualifiant, téléphone cliquable, carte, délai de réponse annoncé, mention RGPD sous le formulaire.',
};
