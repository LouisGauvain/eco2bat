import type { MetadataRoute } from 'next';

import { isIndexable, pathOf } from '@/content';
import { siteUrl } from '@/content/site';
import { pageLastModified, publishedPages } from '@/lib/pages-source';

/**
 * `force-static` est requis par `output: 'export'` : le fichier est généré une
 * fois au build et servi tel quel par Firebase Hosting.
 */
export const dynamic = 'force-static';


/**
 * Sitemap.
 * L'ancien site n'exposait aucun sitemap exploitable. Celui-ci se régénère à
 * chaque publication à partir des pages du back-office, et exclut les
 * brouillons et les pages marquées « hors index ».
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = (await publishedPages()).filter(isIndexable);

  // Date du dernier enregistrement de la page, et non celle du build : une
  // date qui change à chaque publication finit par être ignorée par Google.
  return Promise.all(
    pages.map(async (page) => {
      const lastModified = await pageLastModified(page);
      return {
        url: `${siteUrl}${pathOf(page)}`,
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: 'monthly' as const,
        priority: page.sitemapPriority ?? 0.5,
      };
    }),
  );
}
