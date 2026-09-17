'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PageView } from '@/components/content/PageView';
import { container } from '@/components/layout/ui';
import type { Page } from '@/content';
import { CONTENT_UPDATED_EVENT, getPage } from '@/lib/content-store';

/**
 * Aperçu d'une page telle qu'enregistrée dans le back-office, avec les vrais
 * composants du site : c'est ce que les visiteurs verront après publication.
 *
 * Le site en ligne est statique et ne montre que la dernière publication ;
 * sans cet aperçu, un brouillon ne serait visible nulle part.
 */
export function PagePreview() {
  const id = useSearchParams().get('id');
  const [page, setPage] = useState<Page | null | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      setPage(null);
      return;
    }
    const load = () => getPage(id).then(setPage).catch(() => setPage(null));
    load();
    // L'aperçu reste ouvert dans un onglet à côté de l'éditeur : il se met à
    // jour quand on revient dessus.
    window.addEventListener('focus', load);
    window.addEventListener(CONTENT_UPDATED_EVENT, load);
    return () => {
      window.removeEventListener('focus', load);
      window.removeEventListener(CONTENT_UPDATED_EVENT, load);
    };
  }, [id]);

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-40 border-b border-ink-700 bg-ink-900 py-2 text-sm text-ink-100">
        <div className={`${container} flex flex-wrap items-center gap-3`}>
          <span className="font-medium">Aperçu</span>
          <span className="text-ink-400">
            {page?.status === 'draft'
              ? 'Brouillon — cette page n’est pas en ligne.'
              : 'Version enregistrée — en ligne après publication.'}
          </span>
          <Link href="/admin/contenu/" className="ml-auto text-ink-300 underline underline-offset-4 hover:text-white">
            Back-office
          </Link>
        </div>
      </div>

      {page === undefined && <p className={`${container} py-16 text-ink-400`}>Chargement…</p>}
      {page === null && <p className={`${container} py-16 text-ink-600`}>Page introuvable.</p>}
      {page && <PageView page={page} />}
    </div>
  );
}
