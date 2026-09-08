'use client';

import { Cookie } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { btnPrimary, btnSecondary, card } from '@/components/layout/ui';

/**
 * Bandeau de consentement : tout accepter, tout refuser, ou choisir finalité
 * par finalité. Le choix est conservé dans le navigateur et lisible via
 * `hasCookieConsent('newsletter')`. Le site ne dépose aujourd'hui aucun cookie
 * de mesure ni de publicité ; la seule finalité soumise au consentement est la
 * conservation de l'e-mail pour les actualités. Pour ajouter une finalité
 * (mesure d'audience…), compléter `CATEGORIES`, `NONE` et `ALL`.
 */

const STORAGE_KEY = 'eco2bat-cookies';

/** Finalités soumises au consentement (les cookies nécessaires n'en ont pas besoin). */
const CATEGORIES = [
  {
    id: 'newsletter',
    name: 'Actualités par e-mail',
    description:
      'Si vous nous contactez, conserver votre e-mail pour vous envoyer nos actualités (aides, réglementation, conseils).',
  },
] as const;

type Category = (typeof CATEGORIES)[number]['id'];
type Consent = Record<Category, boolean>;

const NONE: Consent = { newsletter: false };
const ALL: Consent = { newsletter: true };

function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...NONE, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

/** `true` si le visiteur a accepté cette catégorie de cookies. */
export function hasCookieConsent(category: Category): boolean {
  return readConsent()?.[category] ?? false;
}

export function CookieBanner() {
  // Rendu côté serveur sans bandeau ; on ne l'affiche qu'une fois le choix
  // du navigateur connu, pour éviter un clignotement au chargement.
  const [visible, setVisible] = useState(false);
  const [custom, setCustom] = useState(false);
  const [draft, setDraft] = useState<Consent>(NONE);

  // Le bouton de réouverture n'apparaît qu'une fois monté côté navigateur.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!readConsent()) setVisible(true);
  }, []);

  function save(consent: Consent) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch {
      // Sans stockage, le bandeau reviendra à la prochaine visite.
    }
    window.dispatchEvent(new CustomEvent('cookie-consent', { detail: consent }));
    setVisible(false);
    setCustom(false);
  }

  /** Rouvre le bandeau directement sur le détail, avec le choix enregistré. */
  function reopen() {
    setDraft(readConsent() ?? NONE);
    setCustom(true);
    setVisible(true);
  }

  if (!visible) {
    if (!mounted) return null;
    return (
      <button
        type="button"
        onClick={reopen}
        aria-label="Gérer mes cookies et données personnelles"
        title="Gérer mes cookies"
        className={`${card} fixed bottom-4 left-4 z-50 flex h-11 w-11 items-center justify-center text-ink-600 shadow-md transition hover:border-leaf-600 hover:text-leaf-600`}
      >
        <Cookie size={20} strokeWidth={1.75} aria-hidden="true" />
      </button>
    );
  }

  // Sur mobile le bandeau occupe toute la largeur : il est remonté au-dessus
  // du bouton de contact flottant (bottom-6), sinon il le recouvre.
  return (
    <div
      role="dialog"
      aria-label="Cookies et données personnelles"
      className={`${card} fixed bottom-24 left-4 z-50 w-[calc(100%-2rem)] max-w-sm p-5 shadow-lg sm:bottom-4`}
    >
      <p className="text-sm leading-relaxed text-ink-700">
        Ce site n&apos;utilise que des cookies nécessaires à son fonctionnement.
        Si vous nous contactez, nous pouvons conserver votre e-mail pour vous
        envoyer nos actualités : à vous de choisir.{' '}
        <Link
          href="/politique-de-confidentialite"
          className="underline underline-offset-2 hover:text-leaf-600"
        >
          En savoir plus
        </Link>
      </p>

      {custom && (
        <ul className="mt-4 space-y-3 border-t border-edge pt-4">
          <li className="flex gap-3">
            <input type="checkbox" checked disabled className="mt-1 accent-leaf-600" />
            <div className="text-sm">
              <p className="font-bold text-ink-900">Nécessaires</p>
              <p className="text-ink-500">
                Indispensables au fonctionnement du site. Toujours actifs.
              </p>
            </div>
          </li>
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <label className="flex cursor-pointer gap-3">
                <input
                  type="checkbox"
                  checked={draft[c.id]}
                  onChange={(e) => setDraft({ ...draft, [c.id]: e.target.checked })}
                  className="mt-1 accent-leaf-600"
                />
                <span className="text-sm">
                  <span className="block font-bold text-ink-900">{c.name}</span>
                  <span className="text-ink-500">{c.description}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => save(NONE)}
          className={`${btnSecondary} flex-1 px-4 py-2.5`}
        >
          Tout refuser
        </button>
        {custom ? (
          <button
            type="button"
            onClick={() => save(draft)}
            className={`${btnPrimary} flex-1 px-4 py-2.5`}
          >
            Enregistrer
          </button>
        ) : (
          <button
            type="button"
            onClick={() => save(ALL)}
            className={`${btnPrimary} flex-1 px-4 py-2.5`}
          >
            Tout accepter
          </button>
        )}
        {!custom && (
          <button
            type="button"
            onClick={() => setCustom(true)}
            className="w-full py-1 text-center text-xs font-bold text-ink-500 underline underline-offset-2 hover:text-leaf-600"
          >
            Personnaliser
          </button>
        )}
      </div>
    </div>
  );
}
