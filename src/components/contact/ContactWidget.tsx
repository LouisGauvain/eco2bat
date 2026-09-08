'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { ContactForm } from './ContactForm';
import { eyebrow } from '@/components/layout/ui';
import { useCompany } from '@/lib/use-content';

/**
 * Widget de contact : le formulaire qualifiant s'ouvre par-dessus n'importe
 * quelle page, depuis le bouton flottant « Parlons de votre projet » dont le
 * panneau semble jaillir. Il double la page `/contact/` sans la remplacer —
 * c'est le raccourci, pas l'adresse.
 *
 * Tout lien vers `#contact` ouvre le panneau au lieu de naviguer : les boutons
 * des pages n'ont rien à savoir du widget. Arriver sur le site avec `#contact`
 * dans l'URL l'ouvre aussi, ce qui donne un lien partageable. Sur la page
 * Contact elle-même, le bouton flottant s'efface : le formulaire y est déjà.
 */
export function ContactWidget() {
  const site = useCompany();
  const onContactPage = usePathname()?.startsWith('/contact') ?? false;
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Interception des liens « contact » et ouverture depuis l'URL.
  useEffect(() => {
    if (window.location.hash === '#contact') setOpen(true);

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
      const anchor = (event.target as Element | null)?.closest('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href') ?? '';
      if (href === '#contact' || href.endsWith('#contact')) {
        event.preventDefault();
        setOpen(true);
      }
    };

    // Phase de capture : on passe avant `next/link`, qui respecte `defaultPrevented`.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  // Échap ferme, la page ne défile plus derrière, le focus entre puis revient.
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    const button = buttonRef.current;

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      button?.focus();
    };
  }, [open]);

  return (
    <>
      {/* Pas de bouton flottant sur la page Contact : le formulaire y est déjà,
          et un bouton invisible resterait atteignable au clavier. */}
      {!onContactPage && (
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="contact-widget"
          className={`tint-dark fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full px-5 py-3.5 text-[13.5px] font-bold text-white shadow-[0_10px_24px_rgba(19,61,18,0.35)] transition-all duration-300 ease-out print:hidden hover:-translate-y-0.5 ${
            open ? 'pointer-events-none scale-90 opacity-0' : ''
          }`}
        >
          <span aria-hidden="true" className="inline-block h-[7px] w-[7px] rounded-full bg-white" />
          Parlons de votre projet
        </button>
      )}

      {open && (
        <>
          <div aria-hidden="true" onClick={() => setOpen(false)} className="fade-in fixed inset-0 z-40 bg-ink-900/30 backdrop-blur-[2px]" />

          <div
            id="contact-widget"
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-widget-title"
            className="pop-in fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[28px] border border-edge bg-paper shadow-[0_24px_60px_rgba(19,61,18,0.3)] outline-none sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-h-[calc(100dvh-3rem)] sm:w-[460px] sm:rounded-[28px]"
          >
            <div className="tint-dark relative shrink-0 px-6 pb-5 pt-5 text-white">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <span className="sr-only">Fermer</span>
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
                </svg>
              </button>
              <p className={`${eyebrow} text-leaf-200!`}>Contact</p>
              <h2 id="contact-widget-title" className="mt-1.5 font-display text-[24px] leading-tight tracking-[-0.02em]">
                Parlons de votre projet
              </h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-white/75">
                Nous vous conseillerons sur les missions les plus adaptées à votre situation. Ou par téléphone :{' '}
                <a href={`tel:${site.contact.phoneE164}`} className="font-bold tabular-nums text-white underline decoration-leaf-300 underline-offset-4">
                  {site.contact.phone}
                </a>
              </p>
            </div>

            <div className="rise relative flex-1 overflow-y-auto px-6 py-5" style={{ '--rise-delay': '0.18s' } as React.CSSProperties}>
              <ContactForm />
            </div>
          </div>
        </>
      )}
    </>
  );
}
