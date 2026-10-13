'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { PageEditor } from './PageEditor';
import { container } from '@/components/layout/ui';
import { pathOf, type Page } from '@/content';
import { CONTENT_UPDATED_EVENT, importSeedPages, listPages, type PageEntry } from '@/lib/content-store';
import { setLivePage } from '@/lib/live-page';
import { useIsAdmin } from '@/lib/use-content';

/**
 * Édition en direct depuis le site public.
 *
 * Quand le gérant est connecté, une barre discrète apparaît en bas de l'écran
 * et ouvre l'éditeur de la page consultée, à côté de la page elle-même : on
 * corrige un texte en le voyant dans son contexte, plutôt que dans un
 * formulaire séparé du rendu.
 *
 * Chaque modification s'affiche aussitôt sur la page (`setLivePage`), et le
 * gérant continue de voir sa version enregistrée une fois le panneau fermé. Le
 * site en ligne étant statique, les visiteurs, eux, ne la voient qu'après
 * publication.
 *
 * Rien n'est affiché aux visiteurs. Cacher ces outils reste du confort : c'est
 * `firestore.rules` qui empêche réellement quiconque d'écrire.
 */
export function EditOverlay() {
  const isAdmin = useIsAdmin();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<PageEntry[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [draft, setDraft] = useState<Page | null>(null);

  const reload = useCallback(() => {
    listPages()
      .then((list) => setPages(list.pages))
      .catch((error) => console.error('[contenu] lecture impossible', error));
  }, []);

  // Les pages ne sont lues que pour le gérant : un visiteur ne déclenche
  // aucune requête.
  useEffect(() => {
    if (!isAdmin) return;
    reload();
    // Relu après chaque enregistrement : la page fermée garde la dernière version.
    window.addEventListener(CONTENT_UPDATED_EVENT, reload);
    return () => window.removeEventListener(CONTENT_UPDATED_EVENT, reload);
  }, [isAdmin, reload]);

  async function onImport() {
    setImporting(true);
    try {
      await importSeedPages();
      reload();
    } catch (error) {
      console.error('[contenu] import impossible', error);
    } finally {
      setImporting(false);
    }
  }

  const page = pages?.find((candidate) => pathOf(candidate) === normalize(pathname));

  // Changer de page ferme le panneau : son contenu ne correspondrait plus.
  useEffect(() => setOpen(false), [pathname]);

  // Panneau fermé : les modifications non enregistrées sont abandonnées.
  useEffect(() => {
    if (!open) setDraft(null);
  }, [open]);

  // Panneau ouvert, la page suit la saisie ; fermé, elle montre la version
  // enregistrée, même si elle n'est pas encore publiée.
  useEffect(() => {
    setLivePage(isAdmin ? ((open && draft) || page || null) : null);
  }, [isAdmin, open, draft, page]);

  useEffect(() => () => setLivePage(null), []);

  // Le panneau pousse le contenu plutôt que de le recouvrir : la page reste
  // lisible pendant qu'on l'édite.
  useEffect(() => {
    document.body.classList.toggle('lg:pr-[32rem]', open);
    return () => document.body.classList.remove('lg:pr-[32rem]');
  }, [open]);

  // Le bandeau est fixé en bas : sans cette réserve, il masquerait la dernière
  // ligne du pied de page une fois arrivé au bout du défilement. On rallonge le
  // pied de page lui-même plutôt que le `body`, sinon la réserve apparaîtrait
  // en blanc sous le bloc sombre. La hauteur est mesurée plutôt que devinée :
  // le bandeau passe sur deux lignes en écran étroit.
  useEffect(() => {
    const banner = bannerRef.current;
    const footer = document.querySelector('footer');
    if (!banner || !footer) return;

    const apply = () => {
      footer.style.paddingBottom = `${banner.offsetHeight}px`;
    };
    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(banner);
    return () => {
      observer.disconnect();
      footer.style.paddingBottom = '';
    };
  }, [isAdmin, pathname]);

  if (!isAdmin) return null;

  return (
    <>
      <div
        ref={bannerRef}
        // `fixed` ignore le décalage posé sur le `body` : le bandeau doit donc
        // reculer lui-même de la largeur du panneau, sinon il passe dessous et
        // son contenu ne s'aligne plus sur la page.
        className={`fixed bottom-0 left-0 z-50 border-t border-ink-700 bg-ink-900 py-2 text-sm text-ink-100 print:hidden ${
          open ? 'right-0 lg:right-[32rem]' : 'right-0'
        }`}
      >
        <div className={`${container} flex flex-wrap items-center gap-3`}>
          <span className="font-medium">Mode administrateur</span>
          {page ? (
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="rounded-md bg-leaf-600 px-3 py-1.5 font-semibold text-white hover:bg-leaf-700"
            >
              {open ? 'Fermer l’édition' : 'Modifier cette page'}
            </button>
          ) : pages?.length === 0 ? (
            // Premier passage : les pages ne sont pas encore dans la base.
            <button
              type="button"
              onClick={onImport}
              disabled={importing}
              className="rounded-md bg-leaf-600 px-3 py-1.5 font-semibold text-white hover:bg-leaf-700 disabled:bg-ink-600"
            >
              {importing ? 'Import…' : 'Importer les pages pour les modifier'}
            </button>
          ) : (
            pages && <span className="text-ink-400">Cette page ne s’édite pas en ligne.</span>
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

          <div className="flex-1 overflow-y-auto px-5 pt-5">
            <PageEditor pageId={page.id} compact onDraftChange={setDraft} />
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
