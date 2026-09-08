/**
 * Classes partagées de la refonte : conteneur, surtitre, boutons, cartes.
 *
 * Écrites une fois ici pour que le hero, les blocs, le formulaire de contact
 * et le pied de page dessinent le même bouton et le même surtitre — Tailwind
 * ne conserve que les classes présentes en toutes lettres dans le code.
 */

/** Largeur de page unique (1140 px dans les maquettes). */
export const container = 'mx-auto w-full max-w-[1140px] px-5 sm:px-7';

/** Petit intitulé vert en capitales au-dessus d'un titre. */
export const eyebrow =
  'text-[10.5px] font-extrabold uppercase tracking-[0.16em] text-leaf-700';

/** Petit intitulé gris, pour les libellés secondaires (chiffres clés, contact). */
export const label =
  'text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-ink-400';

/** Grande carte de section : angles à 28 px, filet, fond papier. */
export const shell = 'rounded-[28px] border border-edge';

/** Carte interne : angles à 16-20 px, fond crème. */
export const card = 'rounded-[20px] border border-edge bg-card';

/** Bouton principal : dégradé vert → bleu. */
export const btnPrimary =
  'inline-block rounded-xl bg-linear-to-br from-leaf-600 to-sea-500 px-6 py-3.5 text-center text-sm font-bold text-white transition hover:brightness-110';

/** Bouton secondaire : blanc, filet. */
export const btnSecondary =
  'inline-block rounded-xl border border-edge bg-white px-6 py-3.5 text-center text-sm font-bold text-ink-900 transition hover:border-leaf-600';

/** Bouton fantôme sur fond vert sombre : filet clair, fond transparent. */
export const btnGhostDark =
  'inline-block rounded-xl border border-card/35 px-6 py-3.5 text-center text-sm font-bold text-card transition duration-300 hover:-translate-y-0.5 hover:border-card hover:bg-card/10';

/** Bouton compact de l'en-tête : plus petit que le bouton principal. */
export const btnHeader =
  'rounded-xl bg-leaf-600 px-4 py-2.5 text-center text-[13px] font-bold text-white transition hover:brightness-110';

/** Bouton clair sur carte sombre. */
export const btnLight =
  'inline-block rounded-xl bg-card px-6 py-3.5 text-center text-sm font-bold text-leaf-900 transition hover:brightness-95';

/** Numéro d'une carte (01, 02…) en chasse fixe bleue. */
export const num = 'font-mono text-xs font-semibold text-sea-500';

/** `01`, `02`… */
export function pad(index: number): string {
  return String(index + 1).padStart(2, '0');
}
