'use client';

import { ContactForm } from './ContactForm';
import { container } from '@/components/layout/container';
import type { Page } from '@/content/types';
import { useCompany, usePageContent } from '@/lib/use-content';

/**
 * Page Contact.
 *
 * Elle a sa propre route parce qu'elle embarque le formulaire qualifiant,
 * mais son titre, son accroche et les coordonnées affichées à côté du
 * formulaire se modifient depuis le back-office comme sur les autres pages.
 */
export function ContactPageBody({ page: source }: { page: Page }) {
  const page = usePageContent(source);
  const site = useCompany();

  return (
    <article>
      <header className="border-b border-ink-100 bg-linear-to-b from-ink-50 to-white">
        <div className={`${container} pb-12 pt-10`}>
          <h1 className="font-display text-3xl leading-tight text-ink-900 sm:text-4xl">
            {page.title}
          </h1>
          {page.hero && (
            <p className="mt-5 text-lg leading-relaxed text-ink-600">
              {page.hero.lead}
            </p>
          )}
        </div>
      </header>

      <div className={`${container} grid gap-12 py-14 lg:grid-cols-[1fr_20rem]`}>
        <div>
          <h2 className="sr-only">Formulaire de demande</h2>
          <ContactForm />
        </div>

        <aside className="space-y-8 lg:border-l lg:border-ink-100 lg:pl-8">
          <section>
            <h2 className="font-display text-xl text-ink-900">Directement</h2>
            <p className="mt-3 leading-relaxed text-ink-600">
              Un appel vaut souvent mieux qu’un formulaire. Si je ne réponds
              pas, c’est que je suis sur un chantier : laissez un message, je
              rappelle.
            </p>
            <p className="mt-4">
              <a
                href={`tel:${site.contact.phoneE164}`}
                className="text-lg font-semibold text-ink-900 underline decoration-leaf-400 underline-offset-4"
              >
                {site.contact.phone}
              </a>
            </p>
            <p className="mt-2 text-sm text-ink-600">
              <a href={`mailto:${site.contact.email}`} className="hover:text-leaf-700">
                {site.contact.email}
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink-900">Délai de réponse</h2>
            <p className="mt-3 leading-relaxed text-ink-600">
              Je réponds à toute demande sous {site.responseTime}. Si votre
              échéance est plus courte, indiquez-le : je vous dirai franchement
              si je peux tenir le délai.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink-900">Le bureau d’études</h2>
            <address className="mt-3 leading-relaxed not-italic text-ink-600">
              {site.legalName}
              <br />
              {site.address.street}
              <br />
              {site.address.postalCode} {site.address.city}
            </address>
            <p className="mt-3 text-sm text-ink-500">
              Les rendez-vous ont lieu sur le bien à diagnostiquer, pas au
              bureau.
            </p>
          </section>
        </aside>
      </div>
    </article>
  );
}
