import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PageView } from '@/components/content/PageView';
import { breadcrumbFor, contentRoutePages, getPageBySlug } from '@/content';
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript, metadataFor } from '@/lib/seo';

/**
 * Route générique du site public : chaque page du registre de contenu est
 * rendue ici, en statique. Ajouter une page dans `src/content/index.ts` suffit
 * à la publier — il n'y a pas de fichier de route à créer.
 */

type Params = { slug: string[] };

export function generateStaticParams(): Params[] {
  return contentRoutePages().map((page) => ({ slug: page.slug }));
}

/** Aucune page hors registre : une URL inconnue doit renvoyer une vraie 404. */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getPageBySlug(slug);
  return page ? metadataFor(page) : {};
}

export default async function ContentPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const page = getPageBySlug(slug);

  if (!page || page.customRoute) notFound();

  const faq = faqJsonLd(page);

  return (
    <>
      <PageView page={page} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(breadcrumbJsonLd(breadcrumbFor(page))),
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
