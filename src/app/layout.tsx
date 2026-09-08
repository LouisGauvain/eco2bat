import type { Metadata } from 'next';
import { Source_Code_Pro, Source_Sans_3, Source_Serif_4 } from 'next/font/google';

import './globals.css';
import { site, siteUrl } from '@/content/site';

/**
 * Layout racine : uniquement le document HTML et les polices.
 *
 * L'en-tête et le pied de page publics vivent dans le groupe `(site)` afin que
 * le back-office, qui a sa propre interface, ne les hérite pas.
 */

// Source Sans 3 pour le texte courant : ses chiffres et ses sigles (DPE,
// RT 2012, kWh/m².an) restent nets aux petites tailles.
const sans = Source_Sans_3({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-source-sans',
});

// Source Serif 4 porte les titres : même dessin de base que la sans.
const display = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-source-serif',
});

// Source Code Pro pour les numéros des cartes (01, 02…) et les chiffres clés.
const mono = Source_Code_Pro({
  subsets: ['latin'],
  weight: ['500', '600'],
  display: 'swap',
  variable: '--font-source-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: '%s',
  },
  description: site.tagline,
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
    <html lang="fr" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
