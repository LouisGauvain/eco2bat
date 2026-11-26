'use client';

import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { z } from 'zod';

import { markContentChanged } from './content-store';
import { collections, getDb } from './firebase/client';
import { defaultSettings, getSettings, SETTINGS_DOC, type Settings } from './public-store';
import { emptyTracking, TRACKING_DOC, trackingSchema, type Tracking } from '@/content/tracking';

/**
 * Réglages pilotés depuis le back-office.
 *
 * Volontairement limités : ce qui change au fil de l'eau (une indisponibilité,
 * un délai de réponse) plutôt que la structure éditoriale, qui reste versionnée
 * dans le dépôt. C'est ce partage qui évite qu'une page se retrouve vide après
 * une manipulation.
 *
 * Lecture publique (le bandeau s'affiche sur le site), écriture réservée à un
 * utilisateur authentifié — voir `firestore.rules`.
 */

// Lecture et valeurs par défaut : dans `public-store`, le bandeau du site les
// utilise aussi. La validation complète reste ici, côté back-office.
export { defaultSettings, getSettings, type Settings };

export const settingsSchema = z.object({
  bannerEnabled: z.boolean(),
  bannerText: z.string().trim().max(240),
  responseTime: z.string().trim().max(120),
}) satisfies z.ZodType<Settings>;

export async function saveSettings(settings: Settings): Promise<void> {
  await setDoc(
    doc(getDb(), collections.settings, SETTINGS_DOC),
    { ...settings, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

/** Identifiants de suivi. Pris en compte à la prochaine publication. */
export async function getTracking(): Promise<Tracking> {
  const snapshot = await getDoc(doc(getDb(), collections.settings, TRACKING_DOC));
  if (!snapshot.exists()) return emptyTracking;
  const parsed = trackingSchema.safeParse(snapshot.data());
  return parsed.success ? parsed.data : emptyTracking;
}

export async function saveTracking(tracking: Tracking): Promise<void> {
  await setDoc(doc(getDb(), collections.settings, TRACKING_DOC), { ...tracking, updatedAt: serverTimestamp() });
  // Le site doit être republié : le bouton « Publier » le signale.
  await markContentChanged();
}
