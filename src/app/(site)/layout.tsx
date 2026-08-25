import { EditOverlay } from '@/components/admin/EditOverlay';
import { Banner } from '@/components/layout/Banner';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { jsonLdScript, organizationJsonLd } from '@/lib/seo';

/** Cadre du site public : bandeau, en-tête, contenu, pied de page. */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Banner />
      <Header />
      <main id="contenu" className="flex-1">
        {children}
      </main>
      <Footer />
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
