import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ContactPageBody } from '@/components/contact/ContactPageBody';
import { breadcrumbFor } from '@/content';
import { publishedPage, publishedPages } from '@/lib/pages-source';
import { breadcrumbJsonLd, jsonLdScript, metadataFor } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const contact = await publishedPage(['contact']);
  return contact ? metadataFor(contact) : {};
}

export default async function ContactPage() {
  const contact = await publishedPage(['contact']);
  if (!contact) notFound();

  return (
    <>
      <ContactPageBody page={contact} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(breadcrumbJsonLd(breadcrumbFor(contact, await publishedPages()))),
        }}
      />
    </>
  );
}
