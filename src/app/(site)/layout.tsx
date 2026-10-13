import { EditOverlay } from '@/components/admin/EditOverlay';
import { ContactWidget } from '@/components/contact/ContactWidget';
import { Banner } from '@/components/layout/Banner';
import { CookieBanner } from '@/components/layout/CookieBanner';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Tracking } from '@/components/layout/Tracking';
import { navItems } from '@/content';
import { publishedPages, publishedTracking } from '@/lib/pages-source';
import { jsonLdScript, organizationJsonLd } from '@/lib/seo';

/** Cadre du site public : bandeau, en-tête, contenu, pied de page. */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nav = navItems(await publishedPages());
  const tracking = await publishedTracking();

  return (
    <div className="flex min-h-screen flex-col">
      <Banner />
      <Header nav={nav} />
      <main id="contenu" className="flex-1">
        {children}
      </main>
      <Footer nav={nav} />
      <CookieBanner analytics={Boolean(tracking.gtmId || tracking.ga4Id)} marketing={Boolean(tracking.metaPixelId)} />
      <Tracking ids={tracking} />
      {/* Formulaire de contact, accessible depuis toutes les pages. */}
      <ContactWidget />
      {/* Outils d'édition, affichés uniquement au gérant connecté. */}
      <EditOverlay />
      {/* Données structurées de l'entreprise : décrites une seule fois, elles
          alimentent le référencement local. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationJsonLd()) }}
      />
    </div>
  );
}
