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

export const PRESTATIONS = [
  { value: 'audit-energetique', label: 'Audit énergétique (rénovation)' },
  { value: 'audit-vente', label: 'Audit obligatoire avant vente' },
  { value: 'dpe', label: 'DPE' },
  { value: 'infiltrometrie', label: "Test d'infiltrométrie" },
  { value: 'coproprietes', label: 'Copropriété (DTG, audit)' },
  { value: 'formation', label: 'Formation artisans' },
  { value: 'autre', label: 'Je ne sais pas encore' },
] as const;

export const PROPERTY_TYPES = [
  { value: 'maison', label: 'Maison individuelle' },
  { value: 'appartement', label: 'Appartement' },
  { value: 'immeuble', label: 'Immeuble / copropriété' },
  { value: 'tertiaire', label: 'Local tertiaire' },
  { value: 'neuf', label: 'Construction neuve' },
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
