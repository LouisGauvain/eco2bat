'use client';

import { ContactForm } from './ContactForm';
import { PageView } from '@/components/content/PageView';
import { card, eyebrow, shell } from '@/components/layout/ui';
import type { Page } from '@/content/types';
import { useCompany } from '@/lib/use-content';

/**
 * Page Contact : le formulaire qualifiant à gauche, les coordonnées à droite.
 *
 * Le hero et le texte viennent du registre de contenu, comme sur les pages de
 * mission (`PageView`) ; les coordonnées, elles, sont lues depuis le
 * back-office (`useCompany`) pour ne jamais être écrites en double.
 */
export function ContactPageBody({ page }: { page: Page }) {
  const site = useCompany();

  return (
    <PageView page={page}>
      <div className="grid items-start gap-8 pb-4 lg:grid-cols-[1.35fr_1fr]">
        <section className={`${shell} bg-card p-6 sm:p-8`}>
          <h2 className={`${eyebrow} mb-5`}>Votre demande</h2>
          <ContactForm />
        </section>

        <aside className="flex flex-col gap-4">
          <section className={`${card} p-6`}>
            <h2 className={eyebrow}>Directement</h2>
            <p className="mt-3 text-[14px] leading-[1.7] text-ink-600">
              Un appel vaut souvent mieux qu’un formulaire. Si nous ne répondons pas, c’est que
              nous sommes en visite : laissez un message, nous rappelons.
            </p>
            <p className="mt-4">
              <a
                href={`tel:${site.contact.phoneE164}`}
                className="text-[19px] font-bold tabular-nums text-ink-900 underline decoration-leaf-400 underline-offset-4 hover:text-leaf-700"
              >
                {site.contact.phone}
              </a>
            </p>
            <p className="mt-2 text-[14px]">
              <a href={`mailto:${site.contact.email}`} className="text-ink-600 hover:text-leaf-700">
                {site.contact.email}
              </a>
            </p>
          </section>

          {/* Encart affiché seulement si le délai est renseigné : c'est un
              engagement pris devant le visiteur. */}
          {site.responseTime && (
            <section className={`${card} p-6`}>
              <h2 className={eyebrow}>Délai de réponse</h2>
              <p className="mt-3 text-[14px] leading-[1.7] text-ink-600">
                Nous répondons à toute demande sous {site.responseTime}. Si votre échéance est
                plus courte, indiquez-le : nous vous dirons franchement si nous pouvons la tenir.
              </p>
            </section>
          )}

          <section className={`${card} p-6`}>
            <h2 className={eyebrow}>Le bureau d’études</h2>
            <address className="mt-3 text-[14px] not-italic leading-[1.7] text-ink-600">
              <span className="block font-bold text-ink-900">{site.legalName}</span>
              {site.owner.name} — {site.owner.role}
              <br />
              {site.address.street}
              <br />
              {site.address.postalCode} {site.address.city}
            </address>
            <p className="mt-3 text-[13px] leading-[1.6] text-ink-500">
              Les rendez-vous ont lieu sur le bien étudié, pas au bureau. Nous intervenons dans
              toute la région {site.address.region}.
            </p>
          </section>
        </aside>
      </div>
    </PageView>
  );
}
