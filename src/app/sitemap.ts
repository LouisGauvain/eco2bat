import type { MetadataRoute } from 'next';

import { isIndexable, pathOf } from '@/content';
import { siteUrl } from '@/content/site';
import { publishedPages } from '@/lib/pages-source';

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
  const lastModified = new Date();

  return (await publishedPages()).filter(isIndexable).map((page) => ({
    url: `${siteUrl}${pathOf(page)}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: page.sitemapPriority ?? 0.5,
  }));
}
