'use client';

import { useEffect, useState } from 'react';

/** Durée d'affichage avant disparition automatique. */
const DURATION_MS = 4000;

/**
 * Message de confirmation ou d'erreur du back-office.
 *
 * Épinglé en haut à droite de l'écran plutôt qu'inséré dans le formulaire : une
 * confirmation placée dans le flux passe inaperçue quand on enregistre depuis le
 * bas d'une page longue. Une barre de progression indique le temps restant avant
 * la disparition automatique.
 */
export function Toast({
  message,
  tone = 'success',
}: {
  message: string;
  tone?: 'success' | 'error';
}) {
  const [visible, setVisible] = useState(false);
  const [shrink, setShrink] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }

    setVisible(true);
    setShrink(false);

    // Deux frames : la première monte la barre à 100 %, la seconde déclenche la
    // transition vers 0 % (sinon le navigateur fusionne les deux états).
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setShrink(true)),
    );
    const timer = setTimeout(() => setVisible(false), DURATION_MS);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [message]);

  if (!message || !visible) return null;

  const isError = tone === 'error';

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex max-w-[calc(100vw-2rem)] justify-end print:hidden">
      <div
        role="status"
        className={`pointer-events-auto w-80 max-w-full overflow-hidden rounded-md shadow-lg ring-1 ${
          isError
            ? 'bg-red-50 text-red-900 ring-red-200'
            : 'bg-leaf-50 text-leaf-800 ring-leaf-200'
        }`}
      >
        <div className="flex items-start gap-2 px-4 py-3">
          <p className="flex-1 text-sm">{message}</p>
          <button
            type="button"
            onClick={() => setVisible(false)}
            aria-label="Fermer"
            className={`-mr-1 -mt-0.5 rounded p-1 text-lg leading-none opacity-60 transition hover:opacity-100 ${
              isError ? 'hover:bg-red-100' : 'hover:bg-leaf-100'
            }`}
          >
            ×
          </button>
        </div>
        <div className="h-1 w-full bg-black/5">
          <div
            className={`h-full ${isError ? 'bg-red-400' : 'bg-leaf-500'}`}
            style={{
              width: shrink ? '0%' : '100%',
              transition: `width ${DURATION_MS}ms linear`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
