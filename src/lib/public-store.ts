'use client';

import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore/lite';

import type { Company } from '@/content/schema';
import { site } from '@/content/site';
import type { LeadInput, LeadStatus } from './leads';

/**
 * Accès à Firestore depuis le site public.
 *
 * Un visiteur ne fait que trois choses : lire les coordonnées de l'entreprise,
 * lire le bandeau, déposer une demande de contact. Le SDK « lite » suffit — ni
 * Auth, ni écoute en temps réel, ni cache hors ligne — et pèse une fraction du
 * SDK complet. Ce module ne doit donc rien importer de `firebase/firestore`,
 * `firebase/auth`, `content-store` ni `zod` : ce serait les renvoyer à chaque
 * visiteur, au détriment de la vitesse d'affichage (et du référencement).
 *
 * Le back-office garde le SDK complet (`firebase/client.ts`) ; les deux
 * cohabitent sur la même app Firebase.
 */

let db: Firestore | undefined;

function getPublicDb(): Firestore {
  if (db) return db;
  const app =
    getApps().length > 0
      ? getApp()
      : initializeApp({
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        });
  db = getFirestore(app);
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  }
  return db;
}

/**
 * Signal de rafraîchissement : après une sauvegarde, les composants déjà
 * affichés (liste des pages, bouton de publication, coordonnées sur le site)
 * relisent la base sans recharger la page.
 */
export const CONTENT_UPDATED_EVENT = 'eco2bat:content-updated';

// ─── Entreprise ──────────────────────────────────────────────────────────────

export const COMPANY_DOC = 'company';

/** Informations d'entreprise du dépôt — valeurs par défaut de l'éditeur. */
export const defaultCompany: Company = {
  name: site.name,
  legalName: site.legalName,
  tagline: site.tagline,
  owner: { ...site.owner },
  contact: { ...site.contact },
  address: { ...site.address },
  serviceArea: [...site.serviceArea],
  responseTime: site.responseTime,
};

export async function getCompany(): Promise<Company> {
  try {
    const snapshot = await getDoc(doc(getPublicDb(), 'settings', COMPANY_DOC));
    if (!snapshot.exists()) return defaultCompany;

    const { updatedAt, ...data } = snapshot.data();
    void updatedAt; // date d'enregistrement, pas une coordonnée
    return sameShape(data, defaultCompany) ? (data as Company) : defaultCompany;
  } catch (error) {
    console.error('[entreprise] lecture impossible', error);
    return defaultCompany;
  }
}

// ─── Réglages (bandeau, délai de réponse) ────────────────────────────────────

/** Validé à l'enregistrement par `settingsSchema` (`settings.ts`). */
export interface Settings {
  /** Bandeau affiché en haut du site — congés, délai exceptionnel, annonce. */
  bannerEnabled: boolean;
  bannerText: string;
  /** Délai de réponse annoncé, s'il diffère de la valeur par défaut. */
  responseTime: string;
}

export const defaultSettings: Settings = {
  bannerEnabled: false,
  bannerText: '',
  responseTime: '',
};

export const SETTINGS_DOC = 'site';

export async function getSettings(): Promise<Settings> {
  try {
    const snapshot = await getDoc(doc(getPublicDb(), 'settings', SETTINGS_DOC));
    if (!snapshot.exists()) return defaultSettings;

    // Un document mal formé ne doit pas casser l'affichage du site public :
    // on retombe silencieusement sur les valeurs par défaut. Les champs en
    // trop (`updatedAt`) sont ignorés.
    const data = snapshot.data();
    return sameShape(data, defaultSettings)
      ? {
          bannerEnabled: data.bannerEnabled,
          bannerText: data.bannerText,
          responseTime: data.responseTime,
        }
      : defaultSettings;
  } catch (error) {
    console.error('[settings] lecture impossible', error);
    return defaultSettings;
  }
}

/**
 * Vrai si `value` a la forme de `reference` : mêmes clés, mêmes types, listes
 * de textes. Les documents lus ici ne sont écrits que par le back-office, qui
 * les valide entièrement avec Zod ; ce contrôle léger suffit à ce que le site
 * n'affiche jamais un document tronqué, sans embarquer Zod chez le visiteur.
 */
function sameShape(value: unknown, reference: unknown): boolean {
  if (Array.isArray(reference)) {
    return Array.isArray(value) && value.every((item) => typeof item === 'string');
  }
  if (reference && typeof reference === 'object') {
    if (!value || typeof value !== 'object') return false;
    return Object.entries(reference).every(([key, expected]) =>
      sameShape((value as Record<string, unknown>)[key], expected),
    );
  }
  return typeof value === typeof reference;
}

// ─── Demandes de contact ─────────────────────────────────────────────────────

/** Dépôt d'une demande depuis le formulaire public. */
export async function createLead(input: LeadInput): Promise<string> {
  // Le consentement n'est pas stocké comme booléen : sa preuve est
  // l'horodatage `consentAt`.
  const { consent, ...data } = input;
  void consent;

  const created = await addDoc(collection(getPublicDb(), 'leads'), {
    ...data,
    phone: data.phone || null,
    message: data.message || null,
    status: 'nouveau' satisfies LeadStatus,
    createdAt: serverTimestamp(),
    consentAt: serverTimestamp(),
  });

  return created.id;
}

// ─── Gérant déjà connecté sur ce navigateur ──────────────────────────────────

/**
 * Indice posé à la connexion au back-office : il permet au site public de ne
 * télécharger les outils d'édition (et Firebase Auth) que chez le gérant. Ce
 * n'est qu'un indice — la session réelle est vérifiée par Firebase Auth une
 * fois les outils chargés, et la sécurité reste dans `firestore.rules`.
 */
const ADMIN_HINT_KEY = 'eco2bat:admin';

export function hasAdminHint(): boolean {
  try {
    return window.localStorage.getItem(ADMIN_HINT_KEY) === '1';
  } catch {
    return false;
  }
}

export function setAdminHint(isAdmin: boolean): void {
  try {
    if (isAdmin) window.localStorage.setItem(ADMIN_HINT_KEY, '1');
    else window.localStorage.removeItem(ADMIN_HINT_KEY);
  } catch {
    // Stockage refusé : les outils d'édition ne s'afficheront simplement pas
    // sur le site public, le back-office reste accessible.
  }
}
