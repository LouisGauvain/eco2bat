import { Source_Code_Pro, Source_Sans_3, Source_Serif_4 } from 'next/font/google';

/**
 * Polices du site, déclarées une fois : le layout racine les pose sur <html>.
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

/** Classes qui définissent les variables CSS des trois polices. */
export const fontVariables = `${sans.variable} ${display.variable} ${mono.variable}`;
