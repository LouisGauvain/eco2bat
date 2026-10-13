'use client';

import { Cookie } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { btnPrimary, btnSecondary, card } from '@/components/layout/ui';

/**
 * Bandeau de consentement : tout accepter, tout refuser, ou choisir finalité
 * par finalité. Le choix est conservé dans le navigateur, lisible via
 * `hasCookieConsent` et annoncé par l'événement `cookie-consent`.
 *
 * Les finalités « Mesure d'audience » et « Publicité » ne sont proposées que si
 * un outil correspondant est renseigné dans le back-office (Suivi) : on ne
 * demande pas un consentement pour un outil absent.
 */

const STORAGE_KEY = 'eco2bat-cookies';

/** Événement émis à chaque choix du visiteur. */
export const CONSENT_EVENT = 'cookie-consent';

/** Finalités soumises au consentement (les cookies nécessaires n'en ont pas besoin). */
const CATEGORIES = [
  {
    id: 'analytics',
    name: 'Mesure d’audience',
    description: 'Comprendre quelles pages sont consultées, pour améliorer le site (statistiques anonymes).',
  },
  {
    id: 'marketing',
    name: 'Publicité',
    description: 'Mesurer l’efficacité de nos annonces sur les réseaux sociaux.',
  },
  {
    id: 'newsletter',
    name: 'Actualités par e-mail',
    description:
      'Si vous nous contactez, conserver votre e-mail pour vous envoyer nos actualités (aides, réglementation, conseils).',
  },
] as const;

export type ConsentCategory = (typeof CATEGORIES)[number]['id'];
type Consent = Record<ConsentCategory, boolean>;

const NONE: Consent = { analytics: false, marketing: false, newsletter: false };
const ALL: Consent = { analytics: true, marketing: true, newsletter: true };

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...NONE, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

/** Finalités sur lesquelles le visiteur s'est déjà prononcé. */
function rawConsentKeys(): string[] {
  try {
    return Object.keys(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'));
  } catch {
    return [];
  }
}

/** `true` si le visiteur a accepté cette catégorie de cookies. */
export function hasCookieConsent(category: ConsentCategory): boolean {
  return readConsent()?.[category] ?? false;
}

export function CookieBanner({
  analytics = false,
  marketing = false,
}: {
  /** Un outil de mesure d'audience est configuré. */
  analytics?: boolean;
  /** Un outil publicitaire est configuré. */
  marketing?: boolean;
}) {
  const categories = CATEGORIES.filter(
    (category) => category.id === 'newsletter' || (category.id === 'analytics' ? analytics : marketing),
  );

  // Rendu côté serveur sans bandeau ; on ne l'affiche qu'une fois le choix
  // du navigateur connu, pour éviter un clignotement au chargement.
  const [visible, setVisible] = useState(false);
  const [custom, setCustom] = useState(false);
  const [draft, setDraft] = useState<Consent>(NONE);

  // Le bouton de réouverture n'apparaît qu'une fois monté côté navigateur.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Aussi redemandé quand un outil a été ajouté depuis le dernier choix.
    const stored = readConsent();
    const raw = stored ? rawConsentKeys() : [];
    if (!stored || (analytics && !raw.includes('analytics')) || (marketing && !raw.includes('marketing'))) {
      setVisible(true);
    }
  }, [analytics, marketing]);

  function save(consent: Consent) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch {
      // Sans stockage, le bandeau reviendra à la prochaine visite.
    }
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: consent }));
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
        {analytics || marketing
          ? 'Avec votre accord, nous utilisons des cookies pour mesurer l’audience du site'
          : 'Ce site n’utilise que des cookies nécessaires à son fonctionnement'}
        {marketing ? ' et l’efficacité de nos annonces. ' : '. '}
        Si vous nous contactez, nous pouvons aussi conserver votre e-mail pour vous
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
          {categories.map((c) => (
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
