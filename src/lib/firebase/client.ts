'use client';

import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from 'firebase/firestore';

/**
 * SDK Firebase côté navigateur — le seul point d'accès de l'application.
 *
 * Le site est statique : il n'existe aucun serveur applicatif. Ce sont les
 * règles Firestore (`firestore.rules`) qui décident de ce que chaque visiteur
 * peut lire et écrire.
 */
const options: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // Pas de `storageBucket` : le projet n'utilise pas Firebase Storage, les
  // images sont livrées avec le site depuis `public/`. À rajouter le jour où
  // des fichiers seraient déposés depuis le back-office.
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';

function app() {
  return getApps().length > 0 ? getApp() : initializeApp(options);
}

let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;

export function getClientAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(app());
    if (useEmulators) {
      connectAuthEmulator(authInstance, 'http://127.0.0.1:9099', {
        disableWarnings: true,
      });
    }
  }
  return authInstance;
}

export function getDb(): Firestore {
  if (!dbInstance) {
    dbInstance = getFirestore(app());
    if (useEmulators) connectFirestoreEmulator(dbInstance, '127.0.0.1', 8080);
  }
  return dbInstance;
}

/** Noms de collections centralisés — évite les fautes de frappe silencieuses. */
export const collections = {
  leads: 'leads',
  settings: 'settings',
  pages: 'pages',
} as const;
