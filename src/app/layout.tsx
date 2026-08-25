import type { Metadata } from 'next';
import { Source_Sans_3, Source_Serif_4 } from 'next/font/google';

import './globals.css';
import { site, siteUrl } from '@/content/site';

/**
 * Layout racine : uniquement le document HTML et les polices.
 *
 * L'en-tête et le pied de page publics vivent dans le groupe `(site)` afin que
 * le back-office, qui a sa propre interface, ne les hérite pas.
 */

const sans = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-source-sans',
});

const serif = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-source-serif',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} — ${site.tagline}`,
    // Chaque page fournit son title complet, orienté requête : pas de suffixe
    // automatique qui rognerait les 60 caractères utiles.
    template: '%s',
  },
  description: site.tagline,
  // `/favicon.ico` est le fichier que les navigateurs réclament d'office, même
  // sans balise. Sans lui, la requête retombait sur la route générique
  // `[...slug]`, qui ne peut pas la servir en export statique.
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
    ],
  },
  formatDetection: { telephone: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${sans.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
