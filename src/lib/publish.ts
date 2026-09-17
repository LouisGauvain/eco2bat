'use client';

import { httpsCallable } from 'firebase/functions';

import { getClientFunctions } from './firebase/client';

/**
 * Mise en ligne du contenu du back-office.
 *
 * « Publier » appelle la fonction Cloud `publishSite`, qui déclenche le
 * workflow GitHub `publish.yml` : build (qui lit Firestore), redirections,
 * déploiement sur Firebase Hosting. Compter deux à trois minutes.
 */

export interface PublishRun {
  /** `queued`, `in_progress` ou `completed` (vocabulaire GitHub). */
  status: string;
  /** `success`, `failure`, `cancelled`… une fois terminé. */
  conclusion: string | null;
  createdAt: number;
  /** Dernier changement d'état : la fin, une fois terminé. */
  updatedAt?: number;
  url: string;
  /** Étapes du workflow, dans l'ordre (absentes avant déploiement de la fonction). */
  steps?: PublishStep[];
}

export interface PublishStep {
  /** Nom de l'étape dans `publish.yml`. */
  name: string;
  status: string;
  conclusion: string | null;
}

export async function publishSite(): Promise<void> {
  await httpsCallable(getClientFunctions(), 'publishSite')();
}

/** Dernière publication lancée, ou `null` s'il n'y en a jamais eu. */
export async function getPublishStatus(): Promise<PublishRun | null> {
  const result = await httpsCallable<void, { run: PublishRun | null }>(
    getClientFunctions(),
    'publishStatus',
  )();
  return result.data.run;
}

export function isRunning(run: PublishRun | null): boolean {
  return run !== null && run.status !== 'completed';
}
