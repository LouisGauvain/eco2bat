import Link from 'next/link';

import { ContactWidget } from '@/components/contact/ContactWidget';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { btnPrimary, container, eyebrow } from '@/components/layout/ui';
import { mainNav } from '@/content/site';

/**
 * 404 globale. Beaucoup d'anciennes URL WordPress restent indexées : celles qui
 * ont une cible sont redirigées en 301 dans `firebase.json`, les autres
 * arrivent ici et doivent repartir vers une mission plutôt que vers un
 * cul-de-sac. Hors du groupe `(site)`, la page rappelle elle-même l'en-tête et
 * le pied de page.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {/* Même ancre que dans le gabarit du site : le lien d'évitement de
          l'en-tête pointe vers #contenu. */}
      <main id="contenu" className="flex-1">
        <div className={`${container} max-w-[760px] py-24`}>
          <p className={`${eyebrow} text-[11px]`}>Erreur 404</p>
          <h1 className="mt-4 font-display text-[34px] leading-[1.08] tracking-[-0.02em] text-ink-900 sm:text-[44px]">
            Cette page n’existe plus
          </h1>
          <p className="mt-5 text-[16px] leading-[1.65] text-ink-600">
            Le site a été entièrement refondu : certaines adresses de l’ancienne version ont
            disparu. Voici où retrouver ce que vous cherchiez.
          </p>

          <ul className="mt-8 space-y-2.5">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[14px] font-bold text-ink-700 underline decoration-leaf-400 underline-offset-4 hover:text-leaf-700"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>

          <Link href="/#contact" className={`${btnPrimary} mt-10`}>
            Nous contacter
          </Link>
        </div>
      </main>
      <Footer />
      <ContactWidget />
    </div>
  );
}
