import { z } from 'zod';

/**
 * Outils de mesure et de suivi, renseignés dans le back-office (Suivi).
 *
 * Seuls les identifiants sont saisis, jamais de code : le site sait lui-même
 * charger chaque outil, et seulement après le consentement du visiteur
 * (`components/layout/Tracking.tsx`). Pris en compte à la publication.
 */
export const trackingSchema = z.object({
  /** Google Tag Manager — `GTM-XXXXXXX`. */
  gtmId: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^(GTM-[A-Z0-9]+)?$/, 'Identifiant Google Tag Manager invalide (format GTM-XXXXXXX).'),
  /** Google Analytics 4 — `G-XXXXXXXXXX`. */
  ga4Id: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^(G-[A-Z0-9]+)?$/, 'Identifiant Google Analytics invalide (format G-XXXXXXXXXX).'),
  /** Pixel Meta (Facebook, Instagram) — suite de chiffres. */
  metaPixelId: z
    .string()
    .trim()
    .regex(/^(\d{5,20})?$/, 'Identifiant du pixel Meta invalide (uniquement des chiffres).'),
  /** Code de validation Google Search Console (balise meta). */
  googleVerification: z
    .string()
    .trim()
    .max(100)
    .regex(/^[\w-]*$/, 'Code Search Console invalide : copiez seulement la valeur de content="…".'),
});

export type Tracking = z.infer<typeof trackingSchema>;

export const emptyTracking: Tracking = { gtmId: '', ga4Id: '', metaPixelId: '', googleVerification: '' };

/** Document Firestore : `settings/tracking`. */
export const TRACKING_DOC = 'tracking';
