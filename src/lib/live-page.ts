'use client';

import { useSyncExternalStore } from 'react';

import type { Page } from '@/content/types';

/**
 * Version d'une page à afficher à la place du HTML publié, pendant que le
 * gérant la modifie depuis le site (`EditOverlay`) : chaque frappe dans le
 * panneau se voit aussitôt sur la page, sans enregistrer ni recharger.
 *
 * Pour un visiteur, rien n'est jamais posé ici : la page reste celle du build.
 */

let current: Page | null = null;
const listeners = new Set<() => void>();

export function setLivePage(page: Page | null): void {
  if (page === current) return;
  current = page;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** La version en cours de modification de cette page, s'il y en a une. */
export function useLivePage(id: string): Page | null {
  const page = useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
  return page?.id === id ? page : null;
}
