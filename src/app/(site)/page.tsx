import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PageView } from '@/components/content/PageView';
import { publishedPage } from '@/lib/pages-source';
import { faqJsonLd, jsonLdScript, metadataFor } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const home = await publishedPage([]);
  return home ? metadataFor(home) : {};
}

export default async function HomePage() {
  const home = await publishedPage([]);
  if (!home) notFound();

  const faq = faqJsonLd(home);

  return (
    <>
      <PageView page={home} />
      {faq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(faq) }}
        />
      )}
    </>
  );
}
