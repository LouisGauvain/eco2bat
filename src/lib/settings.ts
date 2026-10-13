'use client';

import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { z } from 'zod';

import { markContentChanged } from './content-store';
import { collections, getDb } from './firebase/client';
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

export const settingsSchema = z.object({
  /** Bandeau affiché en haut du site — congés, délai exceptionnel, annonce. */
  bannerEnabled: z.boolean(),
  bannerText: z.string().trim().max(240),
  /** Délai de réponse annoncé, s'il diffère de la valeur par défaut. */
  responseTime: z.string().trim().max(120),
});

export type Settings = z.infer<typeof settingsSchema>;

export const defaultSettings: Settings = {
  bannerEnabled: false,
  bannerText: '',
  responseTime: '',
};

const DOC = 'site';

export async function getSettings(): Promise<Settings> {
  try {
    const snapshot = await getDoc(doc(getDb(), collections.settings, DOC));
    if (!snapshot.exists()) return defaultSettings;

    const parsed = settingsSchema.safeParse(snapshot.data());
    // Un document mal formé ne doit pas casser l'affichage du site public :
    // on retombe silencieusement sur les valeurs par défaut.
    return parsed.success ? parsed.data : defaultSettings;
  } catch (error) {
    console.error('[settings] lecture impossible', error);
    return defaultSettings;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await setDoc(
    doc(getDb(), collections.settings, DOC),
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
