import Link from 'next/link';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { mainNav } from '@/content/site';
import { container } from '@/components/layout/container';

/**
 * 404 globale.
 *
 * Beaucoup d'anciennes URL WordPress (archives, catégories, médias de 2012)
 * restent indexées ou partagées. Celles qui ont une cible sont redirigées en
 * 301 dans next.config.ts ; les autres arrivent ici et doivent repartir vers
 * une prestation plutôt que vers un cul-de-sac.
 *
 * Cette page vit à la racine, hors du groupe `(site)` : elle rappelle donc
 * elle-même l'en-tête et le pied de page.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className={`${container} py-24`}>
          <p className="text-sm font-semibold uppercase tracking-wide text-leaf-700">
            Erreur 404
          </p>
          <h1 className="mt-3 font-display text-3xl text-ink-900 sm:text-4xl">
            Cette page n’existe plus
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-600">
            Le site a été entièrement refondu : certaines adresses de l’ancienne
            version ont disparu. Voici où retrouver ce que vous cherchiez.
          </p>

          <ul className="mt-8 space-y-3">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-semibold text-ink-700 underline decoration-leaf-400 underline-offset-4 hover:text-leaf-700"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/contact/"
            className="mt-10 inline-block rounded-md bg-leaf-600 px-6 py-3 font-semibold text-white hover:bg-leaf-700"
          >
            Me contacter
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
