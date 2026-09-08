'use client';

import { useEffect, useState } from 'react';

import { Toast } from './Toast';
import { defaultSettings, getSettings, saveSettings, settingsSchema, type Settings } from '@/lib/settings';

type Status = 'loading' | 'idle' | 'saving' | 'success' | 'error';

export function SettingsForm() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    getSettings().then((loaded) => {
      if (!active) return;
      setSettings(loaded);
      setStatus('idle');
    });
    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const parsed = settingsSchema.safeParse({
      bannerEnabled: form.get('bannerEnabled') === 'on',
      bannerText: form.get('bannerText') ?? '',
      responseTime: form.get('responseTime') ?? '',
    });

    if (!parsed.success) {
      setStatus('error');
      setMessage(parsed.error.issues[0]?.message ?? 'Valeurs invalides.');
      return;
    }

    setStatus('saving');
    setMessage(''); // relance l'animation du toast même si le texte est identique

    try {
      await saveSettings(parsed.data);
      setSettings(parsed.data);
      setStatus('success');
      setMessage('Paramètres enregistrés.');
    } catch (error) {
      console.error('[settings] enregistrement impossible', error);
      setStatus('error');
      setMessage('Enregistrement impossible. Vérifiez votre connexion.');
    }
  }

  if (status === 'loading') {
    return <p className="text-ink-400">Chargement des paramètres…</p>;
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-2xl space-y-6 rounded-lg border border-ink-200 bg-white p-6"
    >
      <Toast
        message={status === 'success' || status === 'error' ? message : ''}
        tone={status === 'error' ? 'error' : 'success'}
      />

      <fieldset className="space-y-3">
        <legend className="font-semibold text-ink-900">Bandeau d’information</legend>
        <p className="text-sm text-ink-500">
          Affiché en haut de toutes les pages. À utiliser pour une absence, un
          délai exceptionnel ou une annonce ponctuelle.
        </p>

        <label className="flex items-center gap-3 text-sm text-ink-800">
          <input
            type="checkbox"
            name="bannerEnabled"
            defaultChecked={settings.bannerEnabled}
            className="h-4 w-4 accent-leaf-600"
          />
          Afficher le bandeau
        </label>

        <div>
          <label htmlFor="bannerText" className="block text-sm font-medium text-ink-800">
            Texte du bandeau
          </label>
          <input
            id="bannerText"
            name="bannerText"
            type="text"
            maxLength={240}
            defaultValue={settings.bannerText}
            placeholder="Absent du 12 au 26 août — les demandes seront traitées au retour."
            className={inputClass}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3 border-t border-ink-100 pt-6">
        <legend className="font-semibold text-ink-900">Page Contact</legend>

        <div>
          <label htmlFor="responseTime" className="block text-sm font-medium text-ink-800">
            Délai de réponse annoncé
          </label>
          <input
            id="responseTime"
            name="responseTime"
            type="text"
            maxLength={120}
            defaultValue={settings.responseTime}
            placeholder="48 heures ouvrées"
            className={inputClass}
          />
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={status === 'saving'}
        className="rounded-md bg-ink-700 px-5 py-2.5 font-semibold text-white hover:bg-ink-800 disabled:bg-ink-300"
      >
        {status === 'saving' ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  );
}

const inputClass = 'mt-1 w-full rounded-md border border-ink-200 px-3 py-2.5';
