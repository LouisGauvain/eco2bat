import type { MetadataRoute } from 'next';

import { siteUrl } from '@/content/site';

/**
 * `force-static` est requis par `output: 'export'` : le fichier est généré une
 * fois au build et servi tel quel par Firebase Hosting.
 */
export const dynamic = 'force-static';


export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Le back-office n'a rien à faire dans un index de moteur de recherche.
      disallow: ['/admin/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
