import type { MetadataRoute } from 'next';

import { indexablePages, pathOf } from '@/content';
import { siteUrl } from '@/content/site';

/**
 * `force-static` est requis par `output: 'export'` : le fichier est généré une
 * fois au build et servi tel quel par Firebase Hosting.
 */
export const dynamic = 'force-static';


/**
 * Sitemap.
 * L'ancien site n'exposait aucun sitemap exploitable. Celui-ci se régénère à
 * chaque build à partir du registre de contenu, et exclut automatiquement les
 * pages encore en rédaction.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return indexablePages().map((page) => ({
    url: `${siteUrl}${pathOf(page)}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: page.sitemapPriority ?? 0.5,
  }));
}
