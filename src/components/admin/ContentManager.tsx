'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { moved } from './fields';
import { PageEditor } from './PageEditor';
import { Toast } from './Toast';
import { pathOf } from '@/content';
import {
  CONTENT_UPDATED_EVENT,
  createPage,
  deletePage,
  deleteRedirect,
  duplicatePage,
  importSeedPages,
  listPages,
  listRedirects,
  reorderPages,
  type PageEntry,
  type Redirect,
} from '@/lib/content-store';

/**
 * Gestion du contenu : la liste des pages à gauche, l'éditeur de la page
 * choisie à droite, les redirections en dessous.
 *
 * Tout se passe dans Firestore : créer, renommer ou supprimer une page ne
 * touche pas au site en ligne tant que le gérant n'a pas publié.
 */
export function ContentManager() {
  const [pages, setPages] = useState<PageEntry[] | null>(null);
  const [legacy, setLegacy] = useState(0);
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    try {
      const [list, redirectList] = await Promise.all([listPages(), listRedirects()]);
      setPages(list.pages);
      setLegacy(list.legacy);
      setRedirects(redirectList);
      setSelectedId((current) =>
        current && list.pages.some((page) => page.id === current) ? current : (list.pages[0]?.id ?? null),
      );
    } catch (cause) {
      console.error('[contenu] lecture impossible', cause);
      setError('Lecture des pages impossible. Vérifiez votre connexion.');
    }
  }, []);

  useEffect(() => {
    reload();
    window.addEventListener(CONTENT_UPDATED_EVENT, reload);
    return () => window.removeEventListener(CONTENT_UPDATED_EVENT, reload);
  }, [reload]);

  /** Exécute une action d'écriture, en affichant l'erreur éventuelle. */
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (cause) {
      console.error('[contenu] action impossible', cause);
      setError('L’opération a échoué. Vérifiez votre connexion.');
    } finally {
      setBusy(false);
    }
  }

  if (pages === null) {
    return error ? <Toast message={error} tone="error" /> : <p className="text-sm text-ink-400">Chargement…</p>;
  }

  if (pages.length === 0) {
    return (
      <div className="max-w-xl rounded-lg border border-ink-200 bg-white p-6">
        <Toast message={error} tone="error" />
        <h2 className="font-semibold text-ink-900">Importer les pages du site</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          Les pages ne sont pas encore dans la base. L’import y copie les pages actuelles du site
          {legacy > 0 && ', en reprenant les textes déjà modifiés depuis l’administration'}. Le site
          en ligne ne change pas.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => run(importSeedPages)}
          className="mt-5 rounded-md bg-ink-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-800 disabled:bg-ink-300"
        >
          {busy ? 'Import…' : 'Importer les pages'}
        </button>
      </div>
    );
  }

  const selected = pages.find((page) => page.id === selectedId) ?? null;

  function onCreate() {
    const title = window.prompt('Titre de la nouvelle page :')?.trim();
    if (!title || !pages) return;
    run(async () => {
      const id = await createPage(title, pages);
      setSelectedId(id);
    });
  }

  function onMove(index: number, offset: number) {
    if (!pages) return;
    const next = moved(pages, index, index + offset);
    if (next === pages) return;
    setPages(next); // réordonné tout de suite, confirmé par la relecture
    run(() => reorderPages(next.map((page) => page.id)));
  }

  return (
    <div className="space-y-10">
      <Toast message={error} tone="error" />

      <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
        <nav aria-label="Pages du site" className="space-y-3">
          <ul className="space-y-1">
            {pages.map((page, index) => {
              const current = page.id === selectedId;
              return (
                <li key={page.id} className="group flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedId(page.id)}
                    aria-current={current ? 'true' : undefined}
                    className={`flex min-w-0 flex-1 items-center gap-2 rounded-md px-3 py-2 text-left text-sm ${
                      current ? 'bg-ink-800 text-white' : 'text-ink-700 hover:bg-white'
                    }`}
                  >
                    <span
                      title={page.status === 'published' ? 'Publiée' : 'Brouillon'}
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        page.status === 'published' ? 'bg-leaf-500' : 'bg-amber-400'
                      }`}
                    />
                    <span className="min-w-0 flex-1 truncate">{page.navLabel}</span>
                    {page.showInNav && (
                      <span className={`text-[10px] uppercase ${current ? 'text-ink-300' : 'text-ink-400'}`}>
                        menu
                      </span>
                    )}
                  </button>
                  <span className="flex flex-col opacity-40 group-hover:opacity-100">
                    <MoveButton label={`Monter ${page.navLabel}`} disabled={busy || index === 0} onClick={() => onMove(index, -1)}>
                      ▲
                    </MoveButton>
                    <MoveButton
                      label={`Descendre ${page.navLabel}`}
                      disabled={busy || index === pages.length - 1}
                      onClick={() => onMove(index, 1)}
                    >
                      ▼
                    </MoveButton>
                  </span>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={onCreate}
            disabled={busy}
            className="w-full rounded-md border border-dashed border-ink-300 px-3 py-2 text-sm font-medium text-ink-600 hover:border-leaf-500 hover:text-leaf-700"
          >
            + Nouvelle page
          </button>
          <p className="px-1 text-xs leading-relaxed text-ink-500">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-leaf-500" /> publiée
            <span className="ml-3 mr-1 inline-block h-2 w-2 rounded-full bg-amber-400" /> brouillon. L’ordre
            de la liste est celui du menu.
          </p>
        </nav>

        <div className="min-w-0">
          {selected && (
            <>
              <PageActions
                page={selected}
                pages={pages}
                busy={busy}
                onDuplicate={() =>
                  run(async () => {
                    const id = await duplicatePage(selected, pages);
                    setSelectedId(id);
                  })
                }
                onDelete={(redirectTo) => run(() => deletePage(selected, redirectTo))}
              />
              <PageEditor key={selected.id} pageId={selected.id} />
            </>
          )}
        </div>
      </div>

      <RedirectList redirects={redirects} busy={busy} onDelete={(id) => run(() => deleteRedirect(id))} />
    </div>
  );
}

function PageActions({
  page,
  pages,
  busy,
  onDuplicate,
  onDelete,
}: {
  page: PageEntry;
  pages: PageEntry[];
  busy: boolean;
  onDuplicate: () => void;
  onDelete: (redirectTo: string | null) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [target, setTarget] = useState('/');
  const locked = page.slug.length === 0 || Boolean(page.customRoute);
  const targets = pages.filter((other) => other.id !== page.id && other.status === 'published');

  useEffect(() => setConfirming(false), [page.id]);

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <h2 className="font-display text-xl text-ink-900">{page.navLabel}</h2>
        <span className="text-sm text-ink-400">{pathOf(page)}</span>
        <div className="ml-auto flex flex-wrap gap-3 text-sm">
          {page.status === 'published' && (
            <Link href={pathOf(page)} target="_blank" className="text-ink-500 underline underline-offset-4 hover:text-ink-800">
              Voir en ligne ↗
            </Link>
          )}
          <button type="button" onClick={onDuplicate} disabled={busy} className="text-ink-500 underline underline-offset-4 hover:text-ink-800">
            Dupliquer
          </button>
          {!locked && (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={busy}
              className="text-red-700 underline underline-offset-4 hover:text-red-900"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>

      {confirming && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-950">
          <p className="font-semibold">Supprimer « {page.navLabel} » ?</p>
          {page.status === 'published' ? (
            <label className="mt-3 block">
              <span className="block">
                La page est en ligne : Google et d’éventuels liens pointent vers {pathOf(page)}. Où renvoyer
                ces visiteurs ?
              </span>
              <select
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                className="mt-2 w-full rounded-md border border-red-200 bg-white px-3 py-2"
              >
                {targets.map((other) => (
                  <option key={other.id} value={pathOf(other)}>
                    {other.navLabel} ({pathOf(other)})
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="mt-2">C’est un brouillon : rien n’est en ligne, aucune redirection n’est nécessaire.</p>
          )}
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setConfirming(false);
                onDelete(page.status === 'published' ? target : null);
              }}
              className="rounded-md bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800"
            >
              Supprimer définitivement
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-md border border-red-200 bg-white px-4 py-2 font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function RedirectList({
  redirects,
  busy,
  onDelete,
}: {
  redirects: Redirect[];
  busy: boolean;
  onDelete: (id: string) => void;
}) {
  if (redirects.length === 0) return null;

  return (
    <section className="max-w-3xl rounded-lg border border-ink-200 bg-white p-6">
      <h2 className="font-semibold text-ink-900">Redirections</h2>
      <p className="mt-1 text-sm text-ink-600">
        Créées automatiquement quand une page en ligne change d’adresse ou est supprimée. Elles
        évitent les erreurs 404 et conservent le référencement de l’ancienne adresse.
      </p>
      <ul className="mt-4 divide-y divide-ink-100 text-sm">
        {redirects.map((redirect) => (
          <li key={redirect.id} className="flex items-center gap-3 py-2">
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-ink-700">
              {redirect.from} <span className="text-ink-400">→</span> {redirect.to}
            </span>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (window.confirm(`Supprimer la redirection ${redirect.from} → ${redirect.to} ?`)) {
                  onDelete(redirect.id);
                }
              }}
              className="text-xs text-red-700 underline underline-offset-4 hover:text-red-900"
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MoveButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="px-1 text-[9px] leading-3 text-ink-500 hover:text-ink-900 disabled:invisible"
    >
      {children}
    </button>
  );
}
