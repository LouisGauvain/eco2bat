import type { Metadata } from 'next';

import { PageView } from '@/components/content/PageView';
import { home } from '@/content/pages/home';
import { faqJsonLd, jsonLdScript, metadataFor } from '@/lib/seo';

export const metadata: Metadata = metadataFor(home);

export default function HomePage() {
  // La seule FAQ du site est sur l'accueil : c'est ici que le balisage
  // FAQPage doit être injecté, pas dans la route générique.
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
