'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { mainNav } from '@/content/site';
import { btnHeader, container } from './ui';

/**
 * En-tête du site — maquette « SiteHeader » : barre translucide de 66 px, logo
 * et baseline à gauche, missions et bouton Contact à droite. Le bouton Contact
 * pointe vers `#contact` : le widget de contact intercepte ce lien et s'ouvre
 * par-dessus la page.
 */
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(href);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-edge bg-white/70 backdrop-blur-sm">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink-700 focus:px-4 focus:py-2 focus:text-white"
        >
          Aller au contenu
        </a>

        <div className={`${container} flex h-[66px] items-center justify-between gap-6`}>
          <Link href="/" className="flex items-center gap-3" aria-label="ECO2BAT — accueil">
            <Image src="/logo.svg" alt="ECO2BAT" width={120} height={24} priority className="h-6 w-auto" />
            <span className="hidden border-l border-edge pl-3 text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-ink-400 md:inline">
              Économie &amp; écologie du bâtiment
            </span>
          </Link>

          <nav aria-label="Navigation principale" className="hidden items-center gap-5 lg:flex">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isCurrent(item.href) ? 'page' : undefined}
                className="text-[13px] font-semibold text-ink-600 transition-colors hover:text-leaf-700 aria-[current]:text-leaf-700"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/contact/" className={btnHeader}>
              Contact
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            className="rounded-xl border border-edge bg-white p-2 text-ink-700 lg:hidden"
          >
            <span className="sr-only">{open ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
            <MenuIcon open={open} />
          </button>
        </div>

        {open && (
          <nav
            id="menu-mobile"
            aria-label="Navigation principale (mobile)"
            className="border-t border-edge bg-white lg:hidden"
          >
            <ul className={`${container} py-2`}>
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isCurrent(item.href) ? 'page' : undefined}
                    className="block border-b border-ink-100 py-3 text-sm font-semibold text-ink-700 aria-[current]:text-leaf-700"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/contact/"
                  onClick={() => setOpen(false)}
                  className={`${btnHeader} mt-3 mb-2 block`}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>
    </>
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
