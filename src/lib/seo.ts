import type { Metadata } from 'next';

import { isIndexable, pathOf } from '@/content';
import { site, siteUrl } from '@/content/site';
import type { Page } from '@/content/types';

/**
 * Métadonnées d'une page.
 *
 * L'ancien site servait la même meta-description sur ses sept pages et une
 * balise keywords de plus de cent termes : aucune page n'était optimisée pour
 * une requête précise. Ici, title et description viennent obligatoirement du
 * registre de contenu — il est impossible de publier une page sans les écrire.
 */
export function metadataFor(page: Page): Metadata {
  const url = `${siteUrl}${pathOf(page)}`;
  const indexable = isIndexable(page);

  return {
    title: page.seo.title,
    description: page.seo.description,
    alternates: { canonical: url },
    // Une page encore en rédaction ne doit pas entrer dans l'index.
    robots: indexable ? undefined : { index: false, follow: true },
    openGraph: {
      type: 'website',
      locale: 'fr_FR',
      siteName: site.name,
      url,
      title: page.seo.title,
      description: page.seo.description,
    },
  };
}

/**
 * Données structurées de l'organisation.
 * Injectées une fois, dans le layout racine : elles décrivent l'entreprise et
 * sa zone d'intervention, ce que Google utilise pour le référencement local.
 */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: site.name,
    description: site.tagline,
    url: siteUrl,
    telephone: site.contact.phoneE164,
    email: site.contact.email,
    image: `${siteUrl}/logo.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    areaServed: site.serviceArea.map((area) => ({
      '@type': 'AdministrativeArea',
      name: area,
    })),
    founder: {
      '@type': 'Person',
      name: site.owner.name,
      jobTitle: site.owner.role,
    },
  };
}

/** Fil d'Ariane structuré — améliore l'affichage de l'URL dans les résultats. */
export function breadcrumbJsonLd(trail: Page[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((page, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: page.navLabel,
      item: `${siteUrl}${pathOf(page)}`,
    })),
  };
}

/** Bloc FAQ structuré, si la page en contient un. */
export function faqJsonLd(page: Page) {
  const faq = page.blocks.find((block) => block.type === 'faq');
  if (!faq || faq.type !== 'faq') return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

/** Sérialisation sûre pour une balise <script type="application/ld+json">. */
export function jsonLdScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
