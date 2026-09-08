import { z } from 'zod';


/**
 * Demandes entrantes — définitions partagées.
 *
 * Types, constantes et schéma de validation, sans aucun accès Firestore :
 * ce module est importé par le formulaire public comme par le back-office.
 * Les lectures et écritures vivent dans `leads-client.ts`.
 *
 * Les valeurs listées ici (prestations, types de bien, échéances, statuts)
 * sont reprises telles quelles dans `firestore.rules` : toute modification
 * doit être répercutée dans les règles, sinon l'écriture sera refusée.
 *
 * Le formulaire est qualifiant : type de prestation, type de bien, commune et
 * échéance. C'est ce qui permet de répondre par une orientation et un devis
 * plutôt que par une demande d'informations complémentaires.
 */

/**
 * Une entrée par mission du site, dans le même ordre que le menu : le visiteur
 * doit retrouver dans le formulaire le nom de la page d'où il vient.
 * Les demandes déposées avant la refonte portent d'anciennes valeurs, absentes
 * de cette liste : `labelOf` les affiche telles quelles dans le back-office.
 */
export const PRESTATIONS = [
  { value: 'renovation', label: 'Rénovation énergétique (conseil)', path: '/renovation-energetique/' },
  { value: 'dpe', label: 'DPE', path: '/dpe/' },
  { value: 'audit-energetique', label: 'Audit énergétique logement', path: '/audit-energetique/' },
  { value: 'mesure-physique', label: 'Mesure physique du bâtiment', path: '/mesure-physique-du-batiment/' },
  { value: 'controle-rt2012', label: 'Contrôle RT2012 fin de chantier', path: '/controles-rt2012/' },
  { value: 'amo-eau-energie', label: 'AMO économies d’eau et d’énergie', path: '/amo-economies-eau-energie/' },
  { value: 'autre', label: 'Je ne sais pas encore' },
] as const;

/**
 * Prestation à présélectionner d'après la page d'où le visiteur ouvre le
 * formulaire : depuis la page DPE, son besoin est déjà connu. `path` suit les
 * routes de `mainNav` — les deux doivent rester alignés. Hors page de mission
 * (accueil, mentions légales…), aucune valeur n'est devinée : le champ reste
 * sur « Choisissez… », qui est obligatoire.
 */
export function prestationForPath(pathname: string | null | undefined): string {
  if (!pathname) return '';
  const route = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return PRESTATIONS.find((item) => 'path' in item && item.path === route)?.value ?? '';
}

export const PROPERTY_TYPES = [
  { value: 'maison', label: 'Maison individuelle' },
  { value: 'appartement', label: 'Appartement' },
  { value: 'immeuble', label: 'Immeuble / copropriété' },
  { value: 'tertiaire', label: 'Local tertiaire' },
  { value: 'neuf', label: 'Construction neuve' },
  { value: 'patrimoine', label: 'Patrimoine de plusieurs bâtiments' },
] as const;

export const DEADLINES = [
  { value: 'urgent', label: 'Sous 15 jours' },
  { value: 'mois', label: 'Dans le mois' },
  { value: 'trimestre', label: 'Dans les trois mois' },
  { value: 'renseignement', label: 'Je me renseigne' },
] as const;

export const LEAD_STATUSES = [
  { value: 'nouveau', label: 'Nouveau' },
  { value: 'contacte', label: 'Contacté' },
  { value: 'devis', label: 'Devis envoyé' },
  { value: 'gagne', label: 'Mission signée' },
  { value: 'perdu', label: 'Sans suite' },
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number]['value'];

const values = <T extends readonly { value: string }[]>(list: T) =>
  list.map((item) => item.value) as [string, ...string[]];

/** Schéma partagé : valide côté serveur ce que le formulaire prétend envoyer. */
export const leadSchema = z.object({
  name: z.string().trim().min(2, 'Merci d’indiquer votre nom.').max(120),
  email: z.string().trim().email('Adresse e-mail invalide.').max(180),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[0-9+\s().-]{6,}$/, 'Numéro de téléphone invalide.')
    .optional()
    .or(z.literal('')),
  prestation: z.enum(values(PRESTATIONS)),
  propertyType: z.enum(values(PROPERTY_TYPES)),
  city: z.string().trim().min(2, 'Merci d’indiquer la commune.').max(120),
  deadline: z.enum(values(DEADLINES)),
  message: z.string().trim().max(4000).optional().or(z.literal('')),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Merci d’accepter le traitement de vos données.' }),
  }),
  /** Accord explicite pour conserver l'e-mail et envoyer les actualités. */
  newsletter: z.boolean().default(false),
});

export type LeadInput = z.infer<typeof leadSchema>;

export interface Lead extends Omit<LeadInput, 'consent'> {
  id: string;
  status: LeadStatus;
  /** Note interne saisie depuis le back-office. */
  note?: string;
  createdAt: string;
  updatedAt?: string;
  /** Conservé pour la preuve du consentement RGPD. */
  consentAt: string;
}

/** Libellé lisible d'une valeur codée, pour l'affichage du back-office. */
export function labelOf(
  list: readonly { value: string; label: string }[],
  value: string,
): string {
  return list.find((item) => item.value === value)?.label ?? value;
}
