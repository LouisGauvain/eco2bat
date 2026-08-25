'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { mainNav } from '@/content/site';
import { useCompany } from '@/lib/use-content';
import { container } from './container';

/**
 * En-tête du site.
 *
 * Le téléphone est cliquable et visible dès le mobile : l'audit relevait qu'il
 * n'apparaissait que sur la page Contact et sous forme de texte brut, alors
 * que l'appel est le principal chemin de conversion d'un bureau d'études.
 */
export function Header() {
  const pathname = usePathname();
  // Nom et téléphone viennent du back-office : ce sont les seules informations
  // de l'en-tête que le gérant peut avoir à corriger sans redéploiement.
  const site = useCompany();
  const [open, setOpen] = useState(false);

  const isCurrent = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink-700 focus:px-4 focus:py-2 focus:text-white"
      >
        Aller au contenu
      </a>

      <div className={`${container} flex items-center gap-4 py-3`}>
        <Link href="/" className="shrink-0" aria-label={`${site.name} — accueil`}>
          <Image
            src="/logo.png"
            alt={site.name}
            width={180}
            height={40}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <nav
          aria-label="Navigation principale"
          className="ml-auto hidden lg:block"
        >
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isCurrent(item.href) ? 'page' : undefined}
                  className="rounded px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 aria-[current]:text-leaf-700"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <a
            href={`tel:${site.contact.phoneE164}`}
            className="hidden rounded-md border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-700 transition-colors hover:border-ink-400 sm:inline-block"
          >
            {site.contact.phone}
          </a>
          <a
            href={`tel:${site.contact.phoneE164}`}
            aria-label={`Appeler le ${site.contact.phone}`}
            className="rounded-md border border-ink-200 p-2 text-ink-700 sm:hidden"
          >
            <PhoneIcon />
          </a>
          <Link
            href="/contact/"
            className="hidden rounded-md bg-leaf-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-leaf-700 md:inline-block"
          >
            Demander un devis
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            className="rounded-md border border-ink-200 p-2 text-ink-700 lg:hidden"
          >
            <span className="sr-only">
              {open ? 'Fermer le menu' : 'Ouvrir le menu'}
            </span>
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="menu-mobile"
          aria-label="Navigation principale (mobile)"
          className="border-t border-ink-100 bg-white lg:hidden"
        >
          <ul className={`${container} py-2`}>
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isCurrent(item.href) ? 'page' : undefined}
                  className="block border-b border-ink-50 py-3 font-medium text-ink-700 aria-[current]:text-leaf-700"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/contact/"
                onClick={() => setOpen(false)}
                className="mt-3 mb-2 block rounded-md bg-leaf-600 px-4 py-3 text-center font-semibold text-white"
              >
                Demander un devis
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L17 13l4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 3 5.2 2 2 0 0 1 5 3h1.5Z" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      {open ? (
        <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
      )}
    </svg>
  );
}
