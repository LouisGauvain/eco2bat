import { getApps, initializeApp } from 'firebase/app';
import {
  collection,
  connectFirestoreEmulator,
  getDocs,
  getFirestore,
  type Firestore,
} from 'firebase/firestore/lite';

import { byOrder, findBySlug, pageFromDoc, seedPages, type Page } from '@/content';
import { pageDocSchema } from '@/content/schema';

/**
 * Pages du site, lues au build.
 *
 * C'est ici que le contenu du back-office devient du HTML statique : routes,
 * métadonnées, menu et sitemap sont tous construits à partir de cette lecture.
 * La collection `pages` étant lisible par tous (voir `firestore.rules`), le SDK
 * « lite » suffit, sans compte de service.
 *
 * Un document invalide arrête le build : mieux vaut une publication refusée,
 * visible dans le back-office, qu'une page à trous ou disparue en ligne.
 */

const APP_NAME = 'build';

let db: Firestore | undefined;

function getBuildDb(): Firestore {
  if (db) return db;

  const app =
    getApps().find((candidate) => candidate.name === APP_NAME) ??
    initializeApp(
      {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      },
      APP_NAME,
    );

  db = getFirestore(app);
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  }
  return db;
}

async function load(): Promise<Page[]> {
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    // En intégration continue, publier les pages d'origine à la place du
    // contenu du back-office écraserait silencieusement le travail du client.
    if (process.env.CI) {
      throw new Error('[pages] NEXT_PUBLIC_FIREBASE_PROJECT_ID manquant : impossible de lire les pages.');
    }
    return seedPages();
  }

  const snapshot = await getDocs(collection(getBuildDb(), 'pages'));
  const pages: Page[] = [];

  for (const document of snapshot.docs) {
    const data = document.data();
    // Ancienne surcharge de texte, antérieure à l'import : sans slug, elle ne
    // décrit pas une page.
    if (!('slug' in data)) continue;

    const parsed = pageDocSchema.safeParse(data);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw new Error(
        `[pages] page « ${document.id} » invalide — ${issue?.path.join('.')} : ${issue?.message}`,
      );
    }
    pages.push(pageFromDoc(document.id, parsed.data));
  }

  // Collection pas encore importée depuis le back-office.
  if (pages.length === 0) return seedPages();

  return pages.sort(byOrder);
}

let cache: Promise<Page[]> | undefined;

/** Toutes les pages, brouillons compris. */
function allPages(): Promise<Page[]> {
  // En développement, chaque requête relit la base : une page enregistrée dans
  // le back-office se voit en rechargeant, sans redémarrer `next dev`.
  if (process.env.NODE_ENV === 'development') return load();
  cache ??= load();
  return cache;
}

/** Pages mises en ligne : les brouillons n'ont ni URL, ni menu, ni sitemap. */
export async function publishedPages(): Promise<Page[]> {
  return (await allPages()).filter((page) => page.status === 'published');
}

export async function publishedPage(slug: string[] | undefined): Promise<Page | undefined> {
  return findBySlug(await publishedPages(), slug);
}
