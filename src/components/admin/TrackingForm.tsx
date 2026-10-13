'use client';

import { useEffect, useState } from 'react';

import { Field } from './fields';
import { Toast } from './Toast';
import { emptyTracking, trackingSchema, type Tracking } from '@/content/tracking';
import { getTracking, saveTracking } from '@/lib/settings';

/**
 * Identifiants des outils de suivi. Rien n'est chargé sur le site tant que le
 * visiteur n'a pas accepté la catégorie de cookies correspondante.
 */
export function TrackingForm() {
  const [tracking, setTracking] = useState<Tracking>(emptyTracking);
  const [status, setStatus] = useState<'loading' | 'idle' | 'saving' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getTracking()
      .then(setTracking)
      .catch((error) => console.error('[suivi] lecture impossible', error))
      .finally(() => setStatus('idle'));
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = trackingSchema.safeParse(tracking);
    if (!parsed.success) {
      setStatus('error');
      setMessage(parsed.error.issues[0]?.message ?? 'Valeurs invalides.');
      return;
    }

    setStatus('saving');
    setMessage('');
    try {
      await saveTracking(parsed.data);
      setTracking(parsed.data);
      setStatus('idle');
      setMessage('Enregistré. Cliquez « Publier » pour l’appliquer au site.');
    } catch (error) {
      console.error('[suivi] enregistrement impossible', error);
      setStatus('error');
      setMessage('Enregistrement impossible. Vérifiez votre connexion.');
    }
  }

  if (status === 'loading') return <p className="text-sm text-ink-400">Chargement…</p>;

  const update = (patch: Partial<Tracking>) => setTracking((current) => ({ ...current, ...patch }));

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6 rounded-lg border border-ink-200 bg-white p-6">
      <Toast message={message} tone={status === 'error' ? 'error' : 'success'} />

      <section className="space-y-4">
        <h2 className="font-semibold text-ink-900">Mesure d’audience</h2>
        <p className="text-xs text-ink-500">
          Chargée uniquement si le visiteur accepte « Mesure d’audience » dans le bandeau cookies.
        </p>
        <Field
          label="Google Tag Manager"
          value={tracking.gtmId}
          placeholder="GTM-XXXXXXX"
          hint="Si vous utilisez Tag Manager, inutile de renseigner Google Analytics en plus : configurez-le dans Tag Manager."
          onChange={(gtmId) => update({ gtmId })}
        />
        <Field
          label="Google Analytics 4"
          value={tracking.ga4Id}
          placeholder="G-XXXXXXXXXX"
          hint="Identifiant de mesure : Google Analytics › Administration › Flux de données."
          onChange={(ga4Id) => update({ ga4Id })}
        />
      </section>

      <section className="space-y-4 border-t border-ink-100 pt-6">
        <h2 className="font-semibold text-ink-900">Publicité</h2>
        <p className="text-xs text-ink-500">
          Chargé uniquement si le visiteur accepte « Publicité » dans le bandeau cookies.
        </p>
        <Field
          label="Pixel Meta (Facebook, Instagram)"
          value={tracking.metaPixelId}
          placeholder="123456789012345"
          onChange={(metaPixelId) => update({ metaPixelId })}
        />
      </section>

      <section className="space-y-4 border-t border-ink-100 pt-6">
        <h2 className="font-semibold text-ink-900">Google Search Console</h2>
        <Field
          label="Code de validation (balise HTML)"
          value={tracking.googleVerification}
          placeholder="ex. AbC123dEf456…"
          hint='Search Console › Ajouter une propriété › Balise HTML : copiez seulement la valeur de content="…".'
          onChange={(googleVerification) => update({ googleVerification })}
        />
      </section>

      <button
        type="submit"
        disabled={status === 'saving'}
        className="rounded-md bg-ink-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-800 disabled:bg-ink-300"
      >
        {status === 'saving' ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  );
}
