'use client';

import { useRef, useState } from 'react';

import { imageUrl, isUploadConfigured, uploadImage, type UploadedImage } from '@/lib/cloudinary';

/**
 * Dépôt d'une image depuis le back-office.
 *
 * L'auteur choisit un fichier, il part sur Cloudinary et son adresse revient
 * aussitôt : il n'y a pas de médiathèque à gérer, ni d'étape de publication.
 * Coller une adresse à la main reste possible — c'est utile pour réutiliser une
 * image déjà déposée sur une autre page.
 */
export function ImageField({
  value,
  onChange,
}: {
  value: { url: string; width?: number; height?: number };
  onChange: (image: Partial<UploadedImage>) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = isUploadConfigured();

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      onChange(await uploadImage(file));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'L’envoi a échoué.');
    } finally {
      setBusy(false);
      // Le champ est remis à zéro pour qu'un second envoi du même fichier
      // (après une erreur, par exemple) déclenche bien l'événement.
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-ink-800">Image</span>

      {value.url && (
        // Aperçu du back-office : next/image supposerait un serveur, absent
        // d'un export statique.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl(value.url, 640)}
          alt=""
          className="max-h-48 rounded-md border border-ink-200 object-contain"
        />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={input}
          type="file"
          accept="image/*"
          disabled={busy || !configured}
          onChange={(event) => void handleFile(event.target.files?.[0])}
          className="text-sm text-ink-600 file:mr-3 file:rounded-md file:border file:border-ink-200 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink-700 hover:file:border-leaf-500"
        />
        {busy && <span className="text-sm text-ink-500">Envoi en cours…</span>}
        {value.url && !busy && (
          <button
            type="button"
            onClick={() => onChange({ url: '', width: undefined, height: undefined })}
            className="text-sm text-red-700 hover:underline"
          >
            Retirer
          </button>
        )}
      </div>

      {!configured && (
        <p className="text-xs text-amber-700">
          Le dépôt d’images n’est pas configuré : renseigner les variables
          Cloudinary dans <code>.env.local</code>. En attendant, une adresse
          d’image peut être collée ci-dessous.
        </p>
      )}
      {error && <p className="text-xs text-red-700">{error}</p>}

      <input
        type="text"
        value={value.url}
        placeholder="https://res.cloudinary.com/…"
        onChange={(event) =>
          onChange({ url: event.target.value.trim(), width: undefined, height: undefined })
        }
        className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm text-ink-900 focus:border-leaf-500 focus:outline-none"
      />
    </div>
  );
}
