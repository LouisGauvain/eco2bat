'use client';

import Link from 'next/link';

import { Blocks } from './Blocks';
import { breadcrumbFor, pathOf } from '@/content';
import type { Page } from '@/content/types';
import { container } from '@/components/layout/container';
import { usePageContent } from '@/lib/use-content';

/**
 * Gabarit commun à toutes les pages du site public.
 *
 * Le contenu reçu est celui du dépôt, rendu au build : c'est lui qui part dans
 * le HTML statique. `usePageContent` le remplace après affichage si le
 * back-office a enregistré une version modifiée.
 */
export function PageView({ page: source, children }: { page: Page; children?: React.ReactNode }) {
  const page = usePageContent(source);
  // Le fil d'Ariane vient du registre ; seule la page courante peut avoir été
  // renommée depuis le back-office.
  const trail = breadcrumbFor(page).map((step, index, all) =>
    index === all.length - 1 ? page : step,
  );

  return (
    <article>
      <header className="border-b border-ink-100 bg-linear-to-b from-ink-50 to-white">
        <div className={`${container} pb-12 pt-8`}>
          {trail.length > 1 && <Breadcrumb trail={trail} />}
          <h1 className="mt-4 font-display text-3xl leading-tight text-ink-900 sm:text-4xl">
            {page.title}
          </h1>
          {page.hero && (
            <>
              <p className="mt-5 text-lg leading-relaxed text-ink-600">
                {page.hero.lead}
              </p>
              {(page.hero.primary || page.hero.secondary) && (
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  {page.hero.primary && (
                    <Link
                      href={page.hero.primary.href}
                      className="rounded-md bg-leaf-600 px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-leaf-700"
                    >
                      {page.hero.primary.label}
                    </Link>
                  )}
                  {page.hero.secondary && (
                    <Link
                      href={page.hero.secondary.href}
                      className="rounded-md border border-ink-300 px-6 py-3 text-center font-semibold text-ink-700 transition-colors hover:border-ink-500"
                    >
                      {page.hero.secondary.label}
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </header>

      <Blocks blocks={page.blocks} />
      {children}
    </article>
  );
}

function Breadcrumb({ trail }: { trail: Page[] }) {
  return (
    <nav aria-label="Fil d’Ariane">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-ink-500">
        {trail.map((page, index) => {
          const last = index === trail.length - 1;
          return (
            <li key={pathOf(page)} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">/</span>}
              {last ? (
                <span aria-current="page" className="text-ink-700">
                  {page.navLabel}
                </span>
              ) : (
                <Link href={pathOf(page)} className="hover:text-leaf-700">
                  {page.navLabel}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
