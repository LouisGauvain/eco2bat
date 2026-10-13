'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

import { CONSENT_EVENT, hasCookieConsent } from './CookieBanner';
import type { Tracking as TrackingIds } from '@/content/tracking';

/**
 * Outils de suivi renseignés dans le back-office (Suivi), chargés seulement
 * après consentement : Tag Manager et Analytics avec « Mesure d'audience », le
 * pixel Meta avec « Publicité ». Un refus ultérieur prend effet au chargement
 * de page suivant — un script déjà exécuté ne se décharge pas.
 */
export function Tracking({ ids }: { ids: TrackingIds }) {
  const [consent, setConsent] = useState({ analytics: false, marketing: false });

  useEffect(() => {
    const read = () =>
      setConsent({ analytics: hasCookieConsent('analytics'), marketing: hasCookieConsent('marketing') });
    read();
    window.addEventListener(CONSENT_EVENT, read);
    return () => window.removeEventListener(CONSENT_EVENT, read);
  }, []);

  return (
    <>
      {consent.analytics && ids.gtmId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(ids.gtmId)});`}
        </Script>
      )}

      {consent.analytics && ids.ga4Id && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ids.ga4Id}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(ids.ga4Id)});`}
          </Script>
        </>
      )}

      {consent.marketing && ids.metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(ids.metaPixelId)});fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
