import type { Metadata } from 'next';

import { PageView } from '@/components/content/PageView';
import { home } from '@/content/pages/home';
import { metadataFor } from '@/lib/seo';

export const metadata: Metadata = metadataFor(home);

export default function HomePage() {
  return <PageView page={home} />;
}
