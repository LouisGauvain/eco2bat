import type { NextConfig } from 'next';

/**
 * Le site est déployé sur Firebase Hosting, qui sert des fichiers statiques :
 * pas de serveur Node, donc pas de Server Actions, de middleware ni de routes
 * API. Le build produit un dossier `out/` entièrement statique.
 *
 * Conséquences assumées :
 *  - les redirections 301 et les en-têtes sont déclarés dans `firebase.json`,
 *    car `redirects()` et `headers()` de Next n'existent qu'avec un serveur ;
 *  - le formulaire de contact et le back-office parlent à Firebase depuis le
 *    navigateur, et ce sont les règles Firestore qui font la sécurité.
 */
const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  poweredByHeader: false,
  // Les URL de l'ancien site se terminaient par un slash : on conserve cette
  // forme canonique. Chaque page devient `out/<slug>/index.html`.
  trailingSlash: true,
  images: {
    // L'optimisation d'images à la demande suppose un serveur : sur Hosting,
    // les images sont servies telles quelles.
    unoptimized: true,
  },
};

export default nextConfig;
