'use client';

import { useCallback, useEffect, useState } from 'react';

import { siteUrl } from '@/content/site';
import { CONTENT_UPDATED_EVENT, lastContentChange } from '@/lib/content-store';
import { getPublishStatus, isRunning, publishSite, type PublishRun, type PublishStep } from '@/lib/publish';

/**
 * Bouton « Publier » de l'en-tête du back-office.
 *
 * Il dit s'il reste des modifications à mettre en ligne, et ouvre au clic un
 * panneau qui suit la publication étape par étape — les étapes réelles du
 * workflow GitHub, regroupées et traduites pour le gérant. En cas d'échec, le
 * panneau dit quelle étape a échoué et ce que cela signifie.
 */

/** Intervalle de relecture pendant une publication. */
const POLL_MS = 5_000;
/**
 * Délai entre le clic et l'apparition de l'exécution chez GitHub : pendant ce
 * temps, la publication est considérée comme en cours même si GitHub ne la
 * montre pas encore.
 */
const PENDING_MS = 60_000;

type StepKey = 'request' | WorkflowStepKey;
/** Étapes qui correspondent à des étapes du workflow GitHub. */
type WorkflowStepKey = 'prepare' | 'build' | 'redirects' | 'deploy';
type StepState = 'pending' | 'running' | 'done' | 'failed' | 'skipped';

/**
 * Étapes affichées. Les noms repris de `publish.yml` servent à ranger les
 * étapes GitHub : tout ce qui précède le build relève de la préparation, tout
 * ce qui suit le déploiement (nettoyage) est ignoré.
 */
const STEPS: { key: StepKey; title: string; detail: string; failure: string; workflowName?: string }[] = [
  {
    key: 'request',
    title: 'Demande envoyée',
    detail: 'GitHub reçoit la demande et réserve un serveur.',
    failure: 'La demande n’a pas pu être envoyée. Vérifiez votre connexion et réessayez.',
  },
  {
    key: 'prepare',
    title: 'Préparation',
    detail: 'Récupération du code du site et installation des outils.',
    failure: 'Incident technique côté GitHub. Relancez la publication ; si cela se reproduit, prévenez votre développeur.',
  },
  {
    key: 'build',
    title: 'Construction des pages',
    detail: 'Lecture des pages enregistrées et fabrication du site.',
    failure:
      'Une page enregistrée contient probablement une erreur (champ obligatoire vide, lien ou image invalide). Le site en ligne n’a pas changé.',
    workflowName: 'Build',
  },
  {
    key: 'redirects',
    title: 'Redirections',
    detail: 'Les anciennes adresses des pages renommées ou supprimées renvoient vers les nouvelles.',
    failure: 'Les redirections n’ont pas pu être lues. Le site en ligne n’a pas changé : relancez la publication.',
    workflowName: 'Redirections',
  },
  {
    key: 'deploy',
    title: 'Mise en ligne',
    detail: 'Envoi du nouveau site sur l’hébergement.',
    failure: 'L’hébergement a refusé la mise en ligne. Le site en ligne n’a pas changé : prévenez votre développeur.',
    workflowName: 'Déploiement',
  },
];

type State =
  | { kind: 'loading' }
  | { kind: 'unavailable' }
  | { kind: 'ready'; run: PublishRun | null; changedAt: number | null };

export function PublishControl() {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [requestedAt, setRequestedAt] = useState<number | null>(null);
  const [requestFailed, setRequestFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const refresh = useCallback(async () => {
    try {
      const [run, changedAt] = await Promise.all([getPublishStatus(), lastContentChange()]);
      setState({ kind: 'ready', run, changedAt });
    } catch (cause) {
      console.error('[publication] état indisponible', cause);
      setState({ kind: 'unavailable' });
    } finally {
      setNow(Date.now());
    }
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(CONTENT_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(CONTENT_UPDATED_EVENT, refresh);
  }, [refresh]);

  const latest = state.kind === 'ready' ? state.run : null;
  // Juste après le clic, GitHub montre encore la publication précédente.
  const waitingForGithub =
    requestedAt !== null &&
    now - requestedAt < PENDING_MS &&
    (!latest || latest.createdAt < requestedAt - 5_000);
  const run = waitingForGithub ? null : latest;
  const publishing = waitingForGithub || isRunning(run);

  // Relecture de l'état, et chronomètre qui avance chaque seconde.
  useEffect(() => {
    if (!publishing) return;
    const poll = window.setInterval(refresh, POLL_MS);
    const tick = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => {
      window.clearInterval(poll);
      window.clearInterval(tick);
    };
  }, [publishing, refresh]);

  async function onPublish() {
    const at = Date.now();
    setRequestFailed(false);
    setRequestedAt(at);
    setNow(at);
    setOpen(true);
    try {
      await publishSite();
      await refresh();
    } catch (cause) {
      console.error('[publication] échec', cause);
      setRequestedAt(null);
      setRequestFailed(true);
    }
  }

  if (state.kind === 'loading') return null;

  if (state.kind === 'unavailable') {
    return <span className="text-xs text-ink-400">Publication indisponible</span>;
  }

  const pendingChanges = state.changedAt !== null && (!latest || state.changedAt > latest.createdAt);
  const failed = requestFailed || (!publishing && run?.status === 'completed' && run.conclusion !== 'success');

  let label: React.ReactNode;
  if (publishing) label = 'Publication en cours…';
  else if (failed) label = <span className="text-red-700">Dernière publication échouée</span>;
  else if (pendingChanges) label = <span className="text-amber-700">Modifications non publiées</span>;
  else label = <span className="text-leaf-700">Site à jour</span>;

  return (
    <div className="relative flex items-center gap-3 text-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="publication-detail"
        className="hidden text-xs underline decoration-ink-200 underline-offset-4 hover:decoration-ink-500 sm:inline"
      >
        {label}
      </button>
      <button
        type="button"
        onClick={onPublish}
        disabled={publishing}
        className="rounded-md bg-leaf-600 px-4 py-1.5 font-semibold text-white hover:bg-leaf-700 disabled:bg-ink-300"
      >
        {publishing ? 'Publication…' : 'Publier'}
      </button>

      {open && (
        <PublishPanel
          run={run}
          waiting={waitingForGithub}
          requestFailed={requestFailed}
          startedAt={requestedAt && waitingForGithub ? requestedAt : (run?.createdAt ?? null)}
          now={now}
          pendingChanges={pendingChanges && !publishing}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function PublishPanel({
  run,
  waiting,
  requestFailed,
  startedAt,
  now,
  pendingChanges,
  onClose,
}: {
  run: PublishRun | null;
  waiting: boolean;
  requestFailed: boolean;
  startedAt: number | null;
  now: number;
  pendingChanges: boolean;
  onClose: () => void;
}) {
  const states = stepStates(run, waiting, requestFailed);
  const running = waiting || isRunning(run);
  const succeeded = !running && run?.conclusion === 'success';
  const failedStep = STEPS.find((step) => states[step.key] === 'failed');
  const endedAt = running ? now : (run?.updatedAt ?? now);

  let heading: string;
  if (requestFailed) heading = 'La publication n’a pas démarré';
  else if (running) heading = 'Publication en cours';
  else if (succeeded) heading = 'Site en ligne';
  else if (run) heading = 'Publication échouée';
  else heading = 'Aucune publication pour l’instant';

  return (
    <div
      id="publication-detail"
      role="region"
      aria-label="Suivi de la publication"
      className="absolute right-0 top-full z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] rounded-lg border border-ink-200 bg-white p-5 text-left shadow-lg"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink-900">{heading}</p>
          {startedAt !== null && !requestFailed && (
            <p className="mt-0.5 text-xs text-ink-500" aria-live="polite">
              {running
                ? `Depuis ${duration(endedAt - startedAt)} — compter 2 à 3 minutes.`
                : `Lancée à ${time(startedAt)}, durée ${duration(endedAt - startedAt)}.`}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le suivi"
          className="rounded px-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink-700"
        >
          ✕
        </button>
      </div>

      {(run || waiting || requestFailed) && (
        <ol className="mt-4 space-y-3">
          {STEPS.map((step) => {
            const stepState = states[step.key];
            return (
              <li key={step.key} className="flex gap-3">
                <StepIcon state={stepState} />
                <div className="min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      stepState === 'pending' || stepState === 'skipped' ? 'text-ink-400' : 'text-ink-900'
                    }`}
                  >
                    {step.title}
                  </p>
                  {(stepState === 'running' || stepState === 'failed') && (
                    <p className={`mt-0.5 text-xs leading-relaxed ${stepState === 'failed' ? 'text-red-800' : 'text-ink-500'}`}>
                      {stepState === 'failed' ? step.failure : step.detail}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {succeeded && (
        <p className="mt-4 rounded-md bg-leaf-50 p-3 text-xs leading-relaxed text-leaf-900">
          Vos modifications sont en ligne. Si une page affiche encore l’ancienne version, rechargez-la
          (Cmd + Maj + R sur Mac, Ctrl + F5 sur PC).
        </p>
      )}
      {pendingChanges && (
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
          Des modifications ont été enregistrées depuis cette publication : cliquez sur « Publier » pour
          les mettre en ligne.
        </p>
      )}
      {!run && !waiting && !requestFailed && (
        <p className="mt-3 text-xs text-ink-500">Cliquez sur « Publier » pour mettre le site en ligne.</p>
      )}

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-ink-100 pt-3 text-xs">
        {succeeded && (
          <a href={`${siteUrl}/`} target="_blank" rel="noreferrer" className="font-semibold text-leaf-700 underline underline-offset-4">
            Voir le site ↗
          </a>
        )}
        {run && (
          <a
            href={run.url}
            target="_blank"
            rel="noreferrer"
            className={`underline underline-offset-4 ${failedStep ? 'font-semibold text-red-700' : 'text-ink-500'}`}
          >
            Détail technique sur GitHub ↗
          </a>
        )}
      </div>
    </div>
  );
}

function StepIcon({ state }: { state: StepState }) {
  const base = 'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold';
  switch (state) {
    case 'done':
      return (
        <span className={`${base} bg-leaf-600 text-white`} aria-label="terminée">
          ✓
        </span>
      );
    case 'running':
      return (
        <span
          className={`${base} animate-spin border-2 border-leaf-200 border-t-leaf-600`}
          aria-label="en cours"
        />
      );
    case 'failed':
      return (
        <span className={`${base} bg-red-600 text-white`} aria-label="échouée">
          ✕
        </span>
      );
    case 'skipped':
      return (
        <span className={`${base} border border-ink-200 text-ink-300`} aria-label="non lancée">
          –
        </span>
      );
    default:
      return <span className={`${base} border border-ink-200`} aria-label="à venir" />;
  }
}

/** État de chaque étape affichée, d'après les étapes GitHub de l'exécution. */
function stepStates(run: PublishRun | null, waiting: boolean, requestFailed: boolean): Record<StepKey, StepState> {
  const states: Record<StepKey, StepState> = {
    request: 'pending',
    prepare: 'pending',
    build: 'pending',
    redirects: 'pending',
    deploy: 'pending',
  };

  if (requestFailed) return { ...states, request: 'failed', prepare: 'skipped', build: 'skipped', redirects: 'skipped', deploy: 'skipped' };
  if (waiting || !run) return { ...states, request: waiting ? 'running' : 'pending' };

  states.request = 'done';
  const groups = groupSteps(run.steps ?? []);
  const keys: WorkflowStepKey[] = ['prepare', 'build', 'redirects', 'deploy'];

  for (const key of keys) {
    const steps = groups[key];
    if (steps.some((step) => step.conclusion === 'failure' || step.conclusion === 'cancelled')) states[key] = 'failed';
    else if (steps.length > 0 && steps.every((step) => step.status === 'completed')) states[key] = 'done';
    else if (steps.some((step) => step.status !== 'queued' && step.status !== 'pending')) states[key] = 'running';
  }

  if (run.status === 'completed') {
    for (const key of keys) {
      if (states[key] !== 'pending' && states[key] !== 'running') continue;
      // Terminé avec succès : GitHub peut omettre une étape, elle est faite.
      // Terminé en échec : les étapes restantes n'ont pas été lancées.
      states[key] = run.conclusion === 'success' ? 'done' : 'skipped';
    }
    // Échec sans étape en échec (annulation, délai dépassé) : on l'attribue
    // à la première étape non terminée.
    if (run.conclusion !== 'success' && !keys.some((key) => states[key] === 'failed')) {
      const first = keys.find((key) => states[key] === 'skipped');
      if (first) states[first] = 'failed';
    }
  } else if (!keys.some((key) => states[key] === 'running')) {
    // L'état des étapes arrive avec un temps de retard sur celui de
    // l'exécution : la première étape non terminée est celle qui tourne.
    const next = keys.find((key) => states[key] === 'pending');
    if (next) states[next] = 'running';
  }

  return states;
}

/** Range les étapes GitHub dans les étapes affichées. */
function groupSteps(steps: PublishStep[]): Record<WorkflowStepKey, PublishStep[]> {
  const groups: Record<WorkflowStepKey, PublishStep[]> = {
    prepare: [],
    build: [],
    redirects: [],
    deploy: [],
  };
  let current: WorkflowStepKey = 'prepare';

  for (const step of steps) {
    const named = STEPS.find((candidate) => candidate.workflowName && step.name.startsWith(candidate.workflowName));
    if (named) {
      current = named.key as WorkflowStepKey;
      groups[current].push(step);
    } else if (current === 'prepare') {
      groups.prepare.push(step);
    }
    // Au-delà : étapes de nettoyage de GitHub, sans intérêt pour le gérant.
  }
  return groups;
}

function duration(ms: number): string {
  const seconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  return minutes > 0 ? `${minutes} min ${String(seconds % 60).padStart(2, '0')} s` : `${seconds} s`;
}

function time(ms: number): string {
  return new Date(ms).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
