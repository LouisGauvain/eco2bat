'use client';

import Link from 'next/link';

import { legalNav, mainNav } from '@/content/site';
import { useCompany } from '@/lib/use-content';
import { container } from './container';

export function Footer() {
  const year = new Date().getFullYear();
  const site = useCompany();

  return (
    <footer className="mt-24 border-t border-ink-100 bg-ink-900 text-ink-100">
      <div className={`${container} grid gap-10 py-14 md:grid-cols-3`}>
        <div>
          <p className="font-display text-xl text-white">{site.name}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-200">
            {site.tagline}
          </p>
          <p className="mt-4 text-sm text-ink-200">
            {site.owner.name}
            <br />
            {site.owner.role}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-300">
            Prestations
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-leaf-300">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-300">
            Contact
          </h2>
          {/* Adresse en microdonnées : reprise telle quelle par les données
              structurées de la page d'accueil. */}
          <address className="mt-4 space-y-2 text-sm not-italic">
            <p>
              {site.address.street}
              <br />
              {site.address.postalCode} {site.address.city}
            </p>
            <p>
              <a href={`tel:${site.contact.phoneE164}`} className="hover:text-leaf-300">
                {site.contact.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${site.contact.email}`} className="hover:text-leaf-300">
                {site.contact.email}
              </a>
            </p>
          </address>
          <Link
            href="/contact/"
            className="mt-5 inline-block rounded-md bg-leaf-600 px-4 py-2 text-sm font-semibold text-white hover:bg-leaf-700"
          >
            Demander un devis
          </Link>
        </div>
      </div>

      <div className="border-t border-ink-800">
        <div className={`${container} flex flex-col gap-3 py-5 text-xs text-ink-300 sm:flex-row sm:items-center sm:justify-between`}>
          <p>
            © {year} {site.legalName} — Zone d’intervention :{' '}
            {site.serviceArea.join(', ')}
          </p>
          <ul className="flex gap-4">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-leaf-300">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
