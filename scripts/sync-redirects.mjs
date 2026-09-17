/**
 * Ajoute à `firebase.json` les redirections 301 posées depuis le back-office
 * (collection `redirects` : page renommée ou supprimée).
 *
 * Lancé par le workflow de publication, juste avant `firebase deploy`, sur la
 * copie de travail de la CI : le fichier versionné n'est pas modifié. Les
 * redirections du back-office passent avant celles écrites à la main, plus
 * générales (`/category/**`…).
 *
 *   node --env-file-if-exists=.env.local scripts/sync-redirects.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';

import { initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore } from 'firebase/firestore/lite';

const CONFIG = new URL('../firebase.json', import.meta.url);

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const db = getFirestore(app);

const [redirectDocs, pageDocs] = await Promise.all([
  getDocs(collection(db, 'redirects')),
  getDocs(collection(db, 'pages')),
]);

// Une adresse occupée par une page en ligne ne se redirige pas : Hosting
// appliquerait la redirection avant de servir la page.
const livePaths = new Set(
  pageDocs.docs
    .map((document) => document.data())
    .filter((page) => Array.isArray(page.slug) && page.status === 'published')
    .map((page) => (page.slug.length === 0 ? '/' : `/${page.slug.join('/')}/`)),
);

const isPath = (value) => typeof value === 'string' && /^\/[a-z0-9\-/]*$/.test(value);

const generated = redirectDocs.docs
  .map((document) => document.data())
  .filter(({ from, to }) => isPath(from) && isPath(to) && from !== '/' && from !== to)
  .filter(({ from }) => !livePaths.has(from))
  .map(({ from, to }) => ({
    // `/ancienne/` → `/ancienne{,/}` : même forme que les redirections écrites
    // à la main, avec ou sans slash final.
    source: `${from.replace(/\/$/, '')}{,/}`,
    destination: to,
    type: 301,
  }));

const config = JSON.parse(await readFile(CONFIG, 'utf8'));
config.hosting.redirects = [...generated, ...(config.hosting.redirects ?? [])];
await writeFile(CONFIG, `${JSON.stringify(config, null, 2)}\n`);

console.log(`[redirections] ${generated.length} redirection(s) du back-office ajoutée(s).`);
process.exit(0);
