'use client';

import { useCallback, useEffect, useState } from 'react';

import { CONTENT_UPDATED_EVENT, lastContentChange } from '@/lib/content-store';
import { getPublishStatus, isRunning, publishSite, type PublishRun } from '@/lib/publish';

/**
 * Bouton « Publier » de l'en-tête du back-office.
 *
 * Il dit trois choses : s'il reste des modifications à mettre en ligne, si une
 * publication est en cours, et si la dernière a échoué. L'état vient de GitHub
 * (dernière exécution du workflow) comparé à la date de dernière écriture de
 * contenu.
 */

/** Intervalle de relecture pendant une publication. */
const POLL_MS = 10_000;
/**
 * Délai entre le clic et l'apparition de l'exécution chez GitHub : pendant ce
 * temps, la publication est considérée comme en cours même si GitHub ne la
 * montre pas encore.
 */
const PENDING_MS = 60_000;

type State =
  | { kind: 'loading' }
  | { kind: 'unavailable' }
  | { kind: 'ready'; run: PublishRun | null; changedAt: number | null };

export function PublishControl() {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [requestedAt, setRequestedAt] = useState<number | null>(null);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const [run, changedAt] = await Promise.all([getPublishStatus(), lastContentChange()]);
      setState({ kind: 'ready', run, changedAt });
    } catch (cause) {
      console.error('[publication] état indisponible', cause);
      setState({ kind: 'unavailable' });
    }
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(CONTENT_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(CONTENT_UPDATED_EVENT, refresh);
  }, [refresh]);

  const run = state.kind === 'ready' ? state.run : null;
  const waitingForGithub =
    requestedAt !== null && Date.now() - requestedAt < PENDING_MS && (!run || run.createdAt < requestedAt - 5_000);
  const publishing = waitingForGithub || isRunning(run);

  useEffect(() => {
    if (!publishing) return;
    const timer = window.setInterval(refresh, POLL_MS);
    return () => window.clearInterval(timer);
  }, [publishing, refresh]);

  async function onPublish() {
    setError('');
    setRequestedAt(Date.now());
    try {
      await publishSite();
      await refresh();
    } catch (cause) {
      console.error('[publication] échec', cause);
      setRequestedAt(null);
      setError('La publication n’a pas pu être lancée.');
    }
  }

  if (state.kind === 'loading') return null;

  if (state.kind === 'unavailable') {
    return <span className="text-xs text-ink-400">Publication indisponible</span>;
  }

  const pendingChanges =
    state.changedAt !== null && (!run || state.changedAt > run.createdAt);
  const failed = !publishing && run?.status === 'completed' && run.conclusion !== 'success';

  let label: React.ReactNode;
  if (publishing) label = 'Publication en cours… (2 à 3 min)';
  else if (failed) {
    label = (
      <a href={run.url} target="_blank" rel="noreferrer" className="text-red-700 underline underline-offset-4">
        Dernière publication échouée
      </a>
    );
  } else if (pendingChanges) label = <span className="text-amber-700">Modifications non publiées</span>;
  else label = <span className="text-leaf-700">Site à jour</span>;

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="hidden text-xs sm:inline" role="status">
        {error ? <span className="text-red-700">{error}</span> : label}
      </span>
      <button
        type="button"
        onClick={onPublish}
        disabled={publishing}
        className="rounded-md bg-leaf-600 px-4 py-1.5 font-semibold text-white hover:bg-leaf-700 disabled:bg-ink-300"
      >
        {publishing ? 'Publication…' : 'Publier'}
      </button>
    </div>
  );
}
