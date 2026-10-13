import type { Metadata } from 'next';

import './globals.css';
import { fontVariables } from './fonts';
import { site, siteUrl } from '@/content/site';
import { publishedTracking } from '@/lib/pages-source';

/**
 * Layout racine : uniquement le document HTML et les polices.
 *
 * L'en-tête et le pied de page publics vivent dans le groupe `(site)` afin que
 * le back-office, qui a sa propre interface, ne les hérite pas.
 */

/**
 * Métadonnées communes. Le code de validation Search Console, renseigné dans
 * le back-office (Suivi), est lu au build comme le contenu des pages.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { googleVerification } = await publishedTracking();
  return {
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
    ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
