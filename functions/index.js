import { defineSecret } from 'firebase-functions/params';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

/**
 * Publication du site depuis le back-office.
 *
 * Le site est un export statique : mettre en ligne une modification, c'est
 * relancer le build. Le workflow GitHub `publish.yml` s'en charge ; il faut un
 * jeton GitHub pour le déclencher, et ce jeton ne peut pas vivre dans le
 * navigateur. Ces deux fonctions sont donc le seul code serveur du projet :
 * elles vérifient que l'appelant est connecté, puis parlent à GitHub.
 *
 * Jeton : fine-grained token limité au dépôt, permission « Actions » en
 * lecture et écriture, enregistré avec
 *   firebase functions:secrets:set GITHUB_TOKEN
 */

const GITHUB_TOKEN = defineSecret('GITHUB_TOKEN');

const REPO = 'LouisGauvain/eco2bat';
const WORKFLOW = 'publish.yml';
const BRANCH = 'main';

const options = {
  region: 'europe-west1',
  secrets: [GITHUB_TOKEN],
  // Un seul gérant : inutile de laisser la fonction se multiplier.
  maxInstances: 1,
};

function requireAuth(request) {
  // Aucune inscription n'est ouverte : être connecté vaut « c'est le gérant »,
  // exactement comme dans `firestore.rules`.
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Connexion requise pour publier le site.');
  }
}

async function github(path, init = {}) {
  const response = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${GITHUB_TOKEN.value()}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });

  if (!response.ok) {
    console.error('[publish] GitHub a refusé la requête', response.status, await response.text());
    throw new HttpsError('internal', 'GitHub a refusé la demande de publication.');
  }
  return response;
}

export const publishSite = onCall(options, async (request) => {
  requireAuth(request);

  await github(`/actions/workflows/${WORKFLOW}/dispatches`, {
    method: 'POST',
    body: JSON.stringify({ ref: BRANCH }),
  });

  console.info('[publish] publication demandée par', request.auth.token.email ?? request.auth.uid);
  return { ok: true };
});

export const publishStatus = onCall(options, async (request) => {
  requireAuth(request);

  const response = await github(`/actions/workflows/${WORKFLOW}/runs?per_page=1&branch=${BRANCH}`);
  const { workflow_runs: runs = [] } = await response.json();
  const run = runs[0];

  return {
    run: run
      ? {
          status: run.status,
          conclusion: run.conclusion,
          createdAt: Date.parse(run.created_at),
          url: run.html_url,
        }
      : null,
  };
});
