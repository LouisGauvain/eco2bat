import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PageView } from '@/components/content/PageView';
import { breadcrumbFor, contentRoutePages } from '@/content';
import { publishedPage, publishedPages } from '@/lib/pages-source';
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript, metadataFor } from '@/lib/seo';

/**
 * Route générique du site public : chaque page publiée depuis le back-office
 * est rendue ici, en statique. Créer une page dans le back-office puis publier
 * suffit — il n'y a pas de fichier de route à créer.
 */

type Params = { slug: string[] };

export async function generateStaticParams(): Promise<Params[]> {
  return contentRoutePages(await publishedPages()).map((page) => ({ slug: page.slug }));
}

/** Aucune page hors base : une URL inconnue doit renvoyer une vraie 404. */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await publishedPage(slug);
  return page ? metadataFor(page) : {};
}

export default async function ContentPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const page = await publishedPage(slug);

  if (!page || page.customRoute) notFound();

  const faq = faqJsonLd(page);

  return (
    <>
      <PageView page={page} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(breadcrumbJsonLd(breadcrumbFor(page, await publishedPages()))),
        }}
      />
      {faq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(faq) }}
        />
      )}
    </>
  );
}
