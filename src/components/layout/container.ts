/**
 * Largeur de page unique.
 *
 * En-tête, contenu et pied de page partagent cette classe : les bords gauche
 * et droit s'alignent sur toute la hauteur du site, quel que soit le bloc.
 * Toute nouvelle section doit l'utiliser plutôt que redéfinir un `max-w-*`,
 * sans quoi l'alignement se met à dériver d'une page à l'autre.
 */
export const container = 'mx-auto w-full max-w-6xl px-4 sm:px-6';
