import type { Metadata } from 'next';

import { ContactPageBody } from '@/components/contact/ContactPageBody';
import { contact } from '@/content/pages/contact';
import { metadataFor } from '@/lib/seo';

export const metadata: Metadata = metadataFor(contact);

export default function ContactPage() {
  return <ContactPageBody page={contact} />;
}
