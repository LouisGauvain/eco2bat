'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { PageEditor } from './PageEditor';
import { pages } from '@/content';
import { pathOf, type Page } from '@/content/types';
import { getOverriddenPageIds, pageDocId } from '@/lib/content-store';

/**
 * Gestion du contenu : la liste des pages du site à gauche, l'éditeur de la
 * page choisie à droite.
 *
 * La liste vient du dépôt, pas de Firestore : une page ne peut être ni créée
 * ni supprimée depuis le back-office, seulement réécrite. Créer une page,
 * c'est aussi créer une URL, une entrée de menu et une ligne de sitemap — cela
 * passe par un déploiement.
 */
export function ContentManager() {
  const [selected, setSelected] = useState<Page>(pages[0] as Page);
  const [overridden, setOverridden] = useState<Set<string>>(new Set());

  useEffect(() => {
    getOverriddenPageIds().then(setOverridden);
  }, []);

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
      <nav aria-label="Pages du site">
        <ul className="space-y-1">
          {pages.map((page) => {
            const current = page === selected;
            return (
              <li key={pathOf(page)}>
                <button
                  type="button"
                  onClick={() => setSelected(page)}
                  aria-current={current ? 'true' : undefined}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm ${
                    current
                      ? 'bg-ink-800 text-white'
                      : 'text-ink-700 hover:bg-white'
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">{page.navLabel}</span>
                  {overridden.has(pageDocId(page.slug)) && (
                    <span
                      title="Modifiée en ligne"
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        current ? 'bg-leaf-300' : 'bg-leaf-500'
                      }`}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 flex items-center gap-2 px-3 text-xs text-ink-500">
          <span className="h-2 w-2 rounded-full bg-leaf-500" />
          Modifiée en ligne
        </p>
      </nav>

      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-xl text-ink-900">{selected.navLabel}</h2>
          <Link
            href={pathOf(selected)}
            target="_blank"
            className="text-sm text-ink-500 underline underline-offset-4 hover:text-ink-800"
          >
            Voir la page ↗
          </Link>
        </div>

        <PageEditor
          key={pathOf(selected)}
          page={selected}
          onSaved={() => getOverriddenPageIds().then(setOverridden)}
        />
      </div>
    </div>
  );
}
