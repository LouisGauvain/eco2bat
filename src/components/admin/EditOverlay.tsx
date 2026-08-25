'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PageEditor } from './PageEditor';
import { pages } from '@/content';
import { pathOf } from '@/content/types';
import { useIsAdmin } from '@/lib/use-content';

/**
 * Édition en direct depuis le site public.
 *
 * Quand le gérant est connecté, une barre discrète apparaît en bas de l'écran
 * et ouvre l'éditeur de la page consultée, à côté de la page elle-même : on
 * corrige un texte en le voyant dans son contexte, plutôt que dans un
 * formulaire séparé du rendu.
 *
 * Rien n'est affiché aux visiteurs. Cacher ces outils reste du confort : c'est
 * `firestore.rules` qui empêche réellement quiconque d'écrire.
 */
export function EditOverlay() {
  const isAdmin = useIsAdmin();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const page = pages.find((candidate) => pathOf(candidate) === normalize(pathname));

  // Changer de page ferme le panneau : son contenu ne correspondrait plus.
  useEffect(() => setOpen(false), [pathname]);

  // Le panneau pousse le contenu plutôt que de le recouvrir : la page reste
  // lisible pendant qu'on l'édite.
  useEffect(() => {
    document.body.classList.toggle('lg:pr-[32rem]', open);
    return () => document.body.classList.remove('lg:pr-[32rem]');
  }, [open]);

  if (!isAdmin) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-ink-700 bg-ink-900 px-4 py-2 text-sm text-ink-100 print:hidden">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          <span className="font-medium">Mode administrateur</span>
          {page ? (
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="rounded-md bg-leaf-600 px-3 py-1.5 font-semibold text-white hover:bg-leaf-700"
            >
              {open ? 'Fermer l’édition' : 'Modifier cette page'}
            </button>
          ) : (
            <span className="text-ink-400">Cette page ne s’édite pas en ligne.</span>
          )}
          <Link href="/admin/" className="ml-auto text-ink-300 underline underline-offset-4 hover:text-white">
            Back-office
          </Link>
        </div>
      </div>

      {open && page && (
        <aside
          aria-label={`Édition de la page ${page.navLabel}`}
          className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-ink-200 bg-white shadow-xl lg:w-[32rem]"
        >
          <header className="flex items-center gap-3 border-b border-ink-100 px-5 py-3">
            <h2 className="font-display text-lg text-ink-900">{page.navLabel}</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ml-auto rounded border border-ink-200 px-3 py-1 text-sm text-ink-600 hover:bg-ink-50"
            >
              Fermer
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-5 pb-24 pt-5">
            <PageEditor page={page} compact />
          </div>
        </aside>
      )}
    </>
  );
}

/** Le site sert des URL avec slash final : on compare sur cette forme. */
function normalize(pathname: string): string {
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}
