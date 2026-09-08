import type { Metadata } from 'next';

import { ContactPageBody } from '@/components/contact/ContactPageBody';
import { breadcrumbFor } from '@/content';
import { contact } from '@/content/pages/contact';
import { breadcrumbJsonLd, jsonLdScript, metadataFor } from '@/lib/seo';

export const metadata: Metadata = metadataFor(contact);

export default function ContactPage() {
  return (
    <>
      <ContactPageBody page={contact} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(breadcrumbJsonLd(breadcrumbFor(contact))),
        }}
      />
    </>
  );
}
